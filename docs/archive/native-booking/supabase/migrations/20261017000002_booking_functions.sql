-- Mariekey Expert — règles de réservation côté base de données.
-- Toutes ces fonctions sont réservées au service_role (appelées depuis le serveur Next.js).
-- Codes d'erreur : messages commençant par MK_ (interprétés par l'application).

-- ---------------------------------------------------------------------------
-- Vérification d'un créneau : horaires, exceptions, absences, préavis.
-- Retourne NULL si le créneau est autorisé, sinon un code MK_*.
-- (Le chevauchement avec d'autres rendez-vous est garanti par la contrainte d'exclusion.)
-- ---------------------------------------------------------------------------
create or replace function public.slot_violation(
  p_professional uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_blocked_until timestamptz,
  p_enforce_window boolean default true
) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  s public.salon_settings;
  ls timestamp;
  le timestamp;
  d date;
  has_override boolean;
  ok boolean;
begin
  select * into s from public.salon_settings limit 1;

  if p_start < now() then return 'MK_PAST'; end if;
  if p_enforce_window then
    if p_start < now() + make_interval(hours => s.min_notice_hours) then return 'MK_TOO_SOON'; end if;
    if p_start > now() + make_interval(days => s.max_advance_days) then return 'MK_TOO_FAR'; end if;
  end if;

  ls := p_start at time zone s.timezone;
  le := p_end at time zone s.timezone;
  if ls::date <> le::date then return 'MK_OUTSIDE_HOURS'; end if;
  d := ls::date;

  if exists (
    select 1 from public.schedule_exceptions e
    where e.on_date = d and e.is_closed
      and (e.professional_id is null or e.professional_id = p_professional)
  ) then return 'MK_CLOSED'; end if;

  select exists (
    select 1 from public.schedule_exceptions e
    where e.on_date = d and not e.is_closed
      and (e.professional_id is null or e.professional_id = p_professional)
  ) into has_override;

  if has_override then
    select exists (
      select 1 from public.schedule_exceptions e
      where e.on_date = d and not e.is_closed
        and (e.professional_id is null or e.professional_id = p_professional)
        and e.start_time <= ls::time and e.end_time >= le::time
    ) into ok;
  else
    select exists (
      select 1 from public.business_hours h
      where h.professional_id = p_professional
        and h.weekday = extract(isodow from d)::int
        and h.start_time <= ls::time and h.end_time >= le::time
    ) into ok;
  end if;
  if not ok then return 'MK_OUTSIDE_HOURS'; end if;

  if exists (
    select 1 from public.time_blocks b
    where b.professional_id = p_professional
      and tstzrange(b.starts_at, b.ends_at) && tstzrange(p_start, p_blocked_until)
  ) then return 'MK_BLOCKED'; end if;

  return null;
end $$;

-- Verrou transactionnel par professionnelle : sérialise réservations, déplacements et blocages.
create or replace function public.lock_professional(p_professional uuid)
returns void language sql as $$
  select pg_advisory_xact_lock(hashtextextended('mk:prof:' || p_professional::text, 0));
$$;

-- Libère les réservations provisoires expirées (le statut change : la contrainte d'exclusion ne les compte plus).
create or replace function public.expire_pending_appointments()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  with e as (
    update public.appointments
       set status = 'expired', cancelled_by = 'system', cancelled_at = now()
     where status = 'pending_payment' and expires_at < now()
    returning id
  ), p as (
    update public.payments
       set status = 'expired'
     where appointment_id in (select id from e) and status in ('unpaid','failed','processing')
    returning 1
  )
  select count(*) into n from e;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- Création d'une réservation (en ligne : provisoire ; admin : confirmée).
-- Prix, durée et montants sont recalculés ici, jamais repris du navigateur.
-- ---------------------------------------------------------------------------
create or replace function public.create_booking(
  p_service_id uuid,
  p_option_ids uuid[],
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_client_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_source text default 'online',
  p_notes text default null
) returns table (
  appointment_id uuid,
  reference text,
  access_token text,
  professional_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  total_cents integer,
  deposit_cents integer,
  balance_cents integer,
  expires_at timestamptz
)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  s public.salon_settings;
  svc public.services;
  opt_ids uuid[];
  opt_count integer;
  opts jsonb;
  total integer;
  dur integer;
  due integer;
  v_start timestamptz := date_trunc('minute', p_starts_at);
  v_end timestamptz;
  v_blocked timestamptz;
  cand uuid;
  chosen uuid;
  violation text;
  last_violation text := 'MK_SLOT_TAKEN';
  v_ref text;
  v_token text;
  v_status text;
  v_expires timestamptz;
  v_id uuid;
  tries integer := 0;
begin
  if p_source not in ('online','admin') then raise exception 'MK_INVALID_SOURCE'; end if;
  select * into s from public.salon_settings limit 1;

  select * into svc from public.services where id = p_service_id and is_active;
  if not found then raise exception 'MK_SERVICE_UNAVAILABLE'; end if;

  opt_ids := coalesce(array(select distinct x from unnest(coalesce(p_option_ids, '{}'::uuid[])) x), '{}');
  select count(*),
         coalesce(jsonb_agg(jsonb_build_object(
           'id', o.id, 'name', o.name,
           'price_delta_cents', o.price_delta_cents,
           'duration_delta_minutes', o.duration_delta_minutes) order by o.sort_order), '[]'::jsonb),
         svc.price_cents + coalesce(sum(o.price_delta_cents), 0),
         svc.duration_minutes + coalesce(sum(o.duration_delta_minutes), 0)
    into opt_count, opts, total, dur
    from public.service_options o
   where o.id = any(opt_ids) and o.service_id = svc.id and o.is_active;
  if opt_count <> cardinality(opt_ids) then raise exception 'MK_OPTION_INVALID'; end if;
  if total <= 0 or dur <= 0 then raise exception 'MK_INVALID_TOTAL'; end if;

  v_end := v_start + make_interval(mins => dur);
  v_blocked := v_end + make_interval(mins => svc.buffer_minutes);

  if p_source = 'admin' then
    due := 0; v_status := 'confirmed'; v_expires := null;
  else
    due := case s.payment_mode
      when 'full' then total
      when 'deposit_fixed' then least(s.deposit_value, total)
      when 'deposit_percent' then round(total * least(s.deposit_value, 100) / 100.0)::int
    end;
    if due <= 0 then due := total; end if; -- acompte non configuré : paiement intégral
    v_status := 'pending_payment';
    v_expires := now() + make_interval(mins => s.hold_minutes);
  end if;

  -- Candidates : la professionnelle choisie, ou la première disponible.
  for cand in
    select p.id from public.professionals p
     where p.is_active
       and (p_professional_id is null or p.id = p_professional_id)
       and exists (select 1 from public.professional_services ps
                    where ps.professional_id = p.id and ps.service_id = svc.id)
     order by p.sort_order, p.display_name
  loop
    perform public.lock_professional(cand);
    -- Libère les provisoires expirées de cette professionnelle avant de contrôler.
    update public.appointments a
       set status = 'expired', cancelled_by = 'system', cancelled_at = now()
     where a.professional_id = cand and a.status = 'pending_payment' and a.expires_at < now();

    violation := public.slot_violation(cand, v_start, v_end, v_blocked, p_source = 'online');
    if violation is not null then
      last_violation := violation;
      continue;
    end if;

    if exists (
      select 1 from public.appointments a
       where a.professional_id = cand
         and a.status in ('pending_payment','confirmed','completed')
         and tstzrange(a.starts_at, a.blocked_until) && tstzrange(v_start, v_blocked)
    ) then
      last_violation := 'MK_SLOT_TAKEN';
      continue;
    end if;

    chosen := cand;
    exit;
  end loop;

  if chosen is null then raise exception '%', last_violation; end if;

  loop
    tries := tries + 1;
    v_ref := 'MK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    begin
      insert into public.appointments (
        reference, access_token, client_id, professional_id, status, source,
        starts_at, ends_at, blocked_until, duration_minutes, buffer_minutes,
        total_cents, deposit_cents, balance_cents,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        client_notes, expires_at
      ) values (
        v_ref, v_token, p_client_id, chosen, v_status, p_source,
        v_start, v_end, v_blocked, dur, svc.buffer_minutes,
        total, due, total - due,
        trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone),
        nullif(trim(coalesce(p_notes, '')), ''), v_expires
      ) returning id into v_id;
      exit;
    exception
      when unique_violation then
        if tries >= 5 then raise; end if;
      when exclusion_violation then
        raise exception 'MK_SLOT_TAKEN';
    end;
  end loop;

  insert into public.appointment_items (
    appointment_id, service_id, service_name, unit_price_cents, duration_minutes,
    buffer_minutes, options, line_total_cents, line_duration_minutes
  ) values (
    v_id, svc.id, svc.name, svc.price_cents, svc.duration_minutes,
    svc.buffer_minutes, opts, total, dur
  );

  return query
    select v_id, v_ref, v_token, chosen, v_start, v_end, total, due, total - due, v_expires;
end $$;

-- ---------------------------------------------------------------------------
-- Libération d'une réservation provisoire (échec de création de session de paiement).
-- ---------------------------------------------------------------------------
create or replace function public.release_pending_booking(p_appointment_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.appointments
     set status = 'expired', cancelled_by = 'system', cancelled_at = now()
   where id = p_appointment_id and status = 'pending_payment';
  update public.payments set status = 'expired'
   where appointment_id = p_appointment_id and status in ('unpaid','failed','processing');
end $$;

-- ---------------------------------------------------------------------------
-- Confirmation d'un paiement (appelée uniquement depuis le webhook Stripe vérifié). Idempotente.
-- Retours : confirmed | confirmed_late | already_processed | unknown_payment
--           | amount_mismatch | conflict | duplicate_payment
-- ---------------------------------------------------------------------------
create or replace function public.confirm_payment(
  p_session_id text,
  p_payment_intent text,
  p_charge text,
  p_amount_paid integer,
  p_receipt_url text default null
) returns text
language plpgsql security definer set search_path = public as $$
declare
  pay public.payments;
  appt public.appointments;
  violation text;
begin
  select * into pay from public.payments where stripe_checkout_session_id = p_session_id;
  if not found then return 'unknown_payment'; end if;

  select * into appt from public.appointments where id = pay.appointment_id;
  perform public.lock_professional(appt.professional_id);

  -- Relecture sous verrou.
  select * into pay from public.payments where id = pay.id for update;
  select * into appt from public.appointments where id = pay.appointment_id for update;

  if pay.status in ('paid','refunded','partially_refunded') then return 'already_processed'; end if;

  if p_amount_paid is distinct from pay.amount_cents then
    update public.payments
       set status = 'needs_review', stripe_payment_intent_id = p_payment_intent,
           stripe_charge_id = p_charge, receipt_url = p_receipt_url, paid_at = now(),
           failure_reason = 'amount_mismatch'
     where id = pay.id;
    return 'amount_mismatch';
  end if;

  if appt.status = 'pending_payment' then
    update public.appointments set status = 'confirmed', expires_at = null where id = appt.id;
    update public.payments
       set status = 'paid', stripe_payment_intent_id = p_payment_intent, stripe_charge_id = p_charge,
           receipt_url = p_receipt_url, paid_at = now(), failure_reason = null
     where id = pay.id;
    return 'confirmed';
  end if;

  if appt.status = 'expired' then
    -- Paiement reçu après expiration : on tente de reprendre le créneau s'il est encore libre.
    violation := public.slot_violation(appt.professional_id, appt.starts_at, appt.ends_at, appt.blocked_until, false);
    if violation is null then
      begin
        update public.appointments
           set status = 'confirmed', expires_at = null, cancelled_at = null, cancelled_by = null
         where id = appt.id;
        update public.payments
           set status = 'paid', stripe_payment_intent_id = p_payment_intent, stripe_charge_id = p_charge,
               receipt_url = p_receipt_url, paid_at = now(), failure_reason = null
         where id = pay.id;
        return 'confirmed_late';
      exception when exclusion_violation then
        violation := 'MK_SLOT_TAKEN';
      end;
    end if;
    update public.payments
       set status = 'needs_review', stripe_payment_intent_id = p_payment_intent, stripe_charge_id = p_charge,
           receipt_url = p_receipt_url, paid_at = now(), failure_reason = 'late_payment_' || violation
     where id = pay.id;
    return 'conflict';
  end if;

  if appt.status in ('confirmed','completed') then
    update public.payments
       set status = 'needs_review', stripe_payment_intent_id = p_payment_intent, stripe_charge_id = p_charge,
           receipt_url = p_receipt_url, paid_at = now(), failure_reason = 'duplicate_payment'
     where id = pay.id;
    return 'duplicate_payment';
  end if;

  -- cancelled / no_show : on ne ressuscite pas un rendez-vous annulé.
  update public.payments
     set status = 'needs_review', stripe_payment_intent_id = p_payment_intent, stripe_charge_id = p_charge,
         receipt_url = p_receipt_url, paid_at = now(), failure_reason = 'appointment_' || appt.status
   where id = pay.id;
  return 'conflict';
end $$;

create or replace function public.mark_payment_failed(
  p_session_id text, p_payment_intent text, p_reason text
) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.payments
     set status = 'failed', failure_reason = left(p_reason, 500),
         stripe_payment_intent_id = coalesce(p_payment_intent, stripe_payment_intent_id)
   where (stripe_checkout_session_id = p_session_id
          or (p_session_id is null and stripe_payment_intent_id = p_payment_intent))
     and status in ('unpaid','failed','processing');
end $$;

-- Session Checkout expirée : on libère le créneau et on marque le paiement.
create or replace function public.expire_checkout(p_session_id text)
returns text language plpgsql security definer set search_path = public as $$
declare pay public.payments;
begin
  select * into pay from public.payments where stripe_checkout_session_id = p_session_id for update;
  if not found then return 'unknown_payment'; end if;
  if pay.status in ('paid','refunded','partially_refunded','needs_review') then return 'ignored'; end if;
  update public.payments set status = 'expired' where id = pay.id;
  update public.appointments
     set status = 'expired', cancelled_by = 'system', cancelled_at = now()
   where id = pay.appointment_id and status = 'pending_payment';
  return 'expired';
end $$;

create or replace function public.record_refund(p_payment_intent text, p_refunded_total integer)
returns text language plpgsql security definer set search_path = public as $$
declare pay public.payments;
begin
  select * into pay from public.payments where stripe_payment_intent_id = p_payment_intent for update;
  if not found then return 'unknown_payment'; end if;
  update public.payments
     set refunded_cents = least(p_refunded_total, amount_cents),
         status = case when p_refunded_total >= amount_cents then 'refunded' else 'partially_refunded' end
   where id = pay.id;
  return 'recorded';
end $$;

-- ---------------------------------------------------------------------------
-- Annulation. Client : propriétaire uniquement + délai configurable. Admin : sans délai.
-- ---------------------------------------------------------------------------
create or replace function public.cancel_appointment(
  p_appointment_id uuid,
  p_actor text,               -- 'client' | 'admin'
  p_actor_id uuid default null,
  p_reason text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  appt public.appointments;
  s public.salon_settings;
  paid integer;
begin
  if p_actor not in ('client','admin') then raise exception 'MK_INVALID_ACTOR'; end if;
  select * into s from public.salon_settings limit 1;
  select * into appt from public.appointments where id = p_appointment_id;
  if not found then raise exception 'MK_NOT_FOUND'; end if;
  perform public.lock_professional(appt.professional_id);
  select * into appt from public.appointments where id = p_appointment_id for update;

  if p_actor = 'client' then
    if p_actor_id is null or appt.client_id is distinct from p_actor_id then raise exception 'MK_FORBIDDEN'; end if;
    if appt.status = 'confirmed'
       and appt.starts_at < now() + make_interval(hours => s.cancellation_hours) then
      raise exception 'MK_TOO_LATE';
    end if;
  end if;

  if appt.status not in ('pending_payment','confirmed') then raise exception 'MK_NOT_CANCELLABLE'; end if;

  update public.appointments
     set status = 'cancelled', cancelled_at = now(), cancelled_by = p_actor,
         cancel_reason = nullif(left(coalesce(p_reason,''), 500), ''), expires_at = null
   where id = appt.id;

  select coalesce(sum(amount_cents - refunded_cents), 0) into paid
    from public.payments where appointment_id = appt.id and status in ('paid','partially_refunded');

  return jsonb_build_object('appointment_id', appt.id, 'refundable_cents', paid, 'was_status', appt.status);
end $$;

-- ---------------------------------------------------------------------------
-- Déplacement (même professionnelle, même durée). Mêmes règles que la création.
-- ---------------------------------------------------------------------------
create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_new_start timestamptz,
  p_actor text,
  p_actor_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  appt public.appointments;
  s public.salon_settings;
  v_start timestamptz := date_trunc('minute', p_new_start);
  v_end timestamptz;
  v_blocked timestamptz;
  violation text;
begin
  if p_actor not in ('client','admin') then raise exception 'MK_INVALID_ACTOR'; end if;
  select * into s from public.salon_settings limit 1;
  select * into appt from public.appointments where id = p_appointment_id;
  if not found then raise exception 'MK_NOT_FOUND'; end if;
  perform public.lock_professional(appt.professional_id);
  select * into appt from public.appointments where id = p_appointment_id for update;

  if appt.status <> 'confirmed' then raise exception 'MK_NOT_RESCHEDULABLE'; end if;
  if p_actor = 'client' then
    if p_actor_id is null or appt.client_id is distinct from p_actor_id then raise exception 'MK_FORBIDDEN'; end if;
    if appt.starts_at < now() + make_interval(hours => s.reschedule_hours) then raise exception 'MK_TOO_LATE'; end if;
  end if;

  v_end := v_start + make_interval(mins => appt.duration_minutes);
  v_blocked := v_end + make_interval(mins => appt.buffer_minutes);

  violation := public.slot_violation(appt.professional_id, v_start, v_end, v_blocked, p_actor = 'client');
  if violation is not null then raise exception '%', violation; end if;

  if exists (
    select 1 from public.appointments a
     where a.professional_id = appt.professional_id and a.id <> appt.id
       and a.status in ('pending_payment','confirmed','completed')
       and tstzrange(a.starts_at, a.blocked_until) && tstzrange(v_start, v_blocked)
  ) then raise exception 'MK_SLOT_TAKEN'; end if;

  begin
    update public.appointments
       set starts_at = v_start, ends_at = v_end, blocked_until = v_blocked,
           rescheduled_count = rescheduled_count + 1
     where id = appt.id;
  exception when exclusion_violation then
    raise exception 'MK_SLOT_TAKEN';
  end;

  return jsonb_build_object('appointment_id', appt.id, 'old_start', appt.starts_at, 'new_start', v_start);
end $$;

-- ---------------------------------------------------------------------------
-- Absence / blocage de créneau (admin). Refusé s'il chevauche un rendez-vous actif.
-- ---------------------------------------------------------------------------
create or replace function public.create_time_block(
  p_professional uuid, p_start timestamptz, p_end timestamptz, p_reason text, p_actor uuid
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_end <= p_start then raise exception 'MK_INVALID_RANGE'; end if;
  perform public.lock_professional(p_professional);
  update public.appointments a
     set status = 'expired', cancelled_by = 'system', cancelled_at = now()
   where a.professional_id = p_professional and a.status = 'pending_payment' and a.expires_at < now();
  if exists (
    select 1 from public.appointments a
     where a.professional_id = p_professional
       and a.status in ('pending_payment','confirmed')
       and tstzrange(a.starts_at, a.blocked_until) && tstzrange(p_start, p_end)
  ) then raise exception 'MK_HAS_APPOINTMENTS'; end if;
  insert into public.time_blocks (professional_id, starts_at, ends_at, reason, created_by)
  values (p_professional, p_start, p_end, nullif(trim(coalesce(p_reason,'')), ''), p_actor)
  returning id into v_id;
  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- Limitation de débit (fenêtre fixe) — retourne TRUE si la requête est autorisée.
-- ---------------------------------------------------------------------------
create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare w timestamptz; h integer;
begin
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits (key, window_start, hits) values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into h;
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return h <= p_limit;
end $$;

-- ---------------------------------------------------------------------------
-- Droits d'exécution : réservé au service_role (sauf is_admin/is_staff, utilisés par les politiques RLS).
-- ---------------------------------------------------------------------------
revoke all on function
  public.slot_violation(uuid, timestamptz, timestamptz, timestamptz, boolean),
  public.lock_professional(uuid),
  public.expire_pending_appointments(),
  public.create_booking(uuid, uuid[], uuid, timestamptz, uuid, text, text, text, text, text, text),
  public.release_pending_booking(uuid),
  public.confirm_payment(text, text, text, integer, text),
  public.mark_payment_failed(text, text, text),
  public.expire_checkout(text),
  public.record_refund(text, integer),
  public.cancel_appointment(uuid, text, uuid, text),
  public.reschedule_appointment(uuid, timestamptz, text, uuid),
  public.create_time_block(uuid, timestamptz, timestamptz, text, uuid),
  public.check_rate_limit(text, integer, integer)
from public, anon, authenticated;

grant execute on function
  public.slot_violation(uuid, timestamptz, timestamptz, timestamptz, boolean),
  public.lock_professional(uuid),
  public.expire_pending_appointments(),
  public.create_booking(uuid, uuid[], uuid, timestamptz, uuid, text, text, text, text, text, text),
  public.release_pending_booking(uuid),
  public.confirm_payment(text, text, text, integer, text),
  public.mark_payment_failed(text, text, text),
  public.expire_checkout(text),
  public.record_refund(text, integer),
  public.cancel_appointment(uuid, text, uuid, text),
  public.reschedule_appointment(uuid, timestamptz, text, uuid),
  public.create_time_block(uuid, timestamptz, timestamptz, text, uuid),
  public.check_rate_limit(text, integer, integer)
to service_role;
