import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { ADMIN_URL, PRO, book, errCode, localSlot, pool, resetDatabase, serviceId } from "./helpers";

// Ces tests exigent un PostgreSQL jetable : TEST_PG_ADMIN_URL=postgres://postgres@host:port/postgres
describe.skipIf(!ADMIN_URL)("règles de réservation (PostgreSQL réel)", () => {
  let p: pg.Pool;
  let lissage: string, soin: string, tresses: string, optionId: string;
  const WED = 3; // mercredi (ouvert dans la démo : mar → sam, 10-13 / 14-19)

  beforeAll(async () => {
    await resetDatabase();
    p = pool();
    lissage = await serviceId(p, "lissage-demo");
    soin = await serviceId(p, "soin-capillaire-demo");
    tresses = await serviceId(p, "tresses-demo");
    await p.query("update salon_settings set max_advance_days = 365");
    optionId = (await p.query("select id from service_options where service_id=$1", [lissage])).rows[0].id;
  });
  afterAll(async () => { await p.end(); });

  it("recalcule prix, durée et acompte côté base (options incluses)", async () => {
    const start = localSlot(WED, "10:00", 5);
    const r = (await book(p, { service: lissage, options: [optionId], start })).rows[0];
    expect(r.total_cents).toBe(8000 + 1500);
    expect(r.deposit_cents).toBe(9500);
    expect(r.balance_cents).toBe(0);
    // durée 120 + 20 = 140 min ; blocage = +15 min de préparation
    const a = (await p.query("select duration_minutes, ends_at, blocked_until, status from appointments where id=$1", [r.appointment_id])).rows[0];
    expect(a.duration_minutes).toBe(140);
    expect(a.status).toBe("pending_payment");
    expect(new Date(a.blocked_until).getTime() - new Date(a.ends_at).getTime()).toBe(15 * 60_000);
    const item = (await p.query("select * from appointment_items where appointment_id=$1", [r.appointment_id])).rows[0];
    expect(item.line_total_cents).toBe(9500);
    expect(item.options).toHaveLength(1);
  });

  it("refuse une option qui n'appartient pas à la prestation", async () => {
    const start = localSlot(WED, "14:00", 12);
    const err = await errCode(book(p, { service: soin, options: [optionId], start }));
    expect(err).toBe("MK_OPTION_INVALID");
  });

  it("acompte fixe et pourcentage calculés par la base", async () => {
    await p.query("update salon_settings set payment_mode='deposit_percent', deposit_value=30");
    const r1 = (await book(p, { service: soin, start: localSlot(WED, "14:00", 19) })).rows[0];
    expect(r1.deposit_cents).toBe(1350); // 30 % de 4500
    expect(r1.balance_cents).toBe(3150);
    await p.query("update salon_settings set payment_mode='deposit_fixed', deposit_value=2000");
    const r2 = (await book(p, { service: soin, start: localSlot(WED, "16:00", 19) })).rows[0];
    expect(r2.deposit_cents).toBe(2000);
    await p.query("update salon_settings set payment_mode='full', deposit_value=0");
  });

  it("deux clientes simultanées sur le même créneau : une seule réussit", async () => {
    const start = localSlot(WED, "10:00", 26);
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => errCode(book(p, { service: soin, start, email: `c${i}@example.com` }))),
    );
    expect(results.filter((r) => r === null)).toHaveLength(1);
    expect(results.filter((r) => r === "MK_SLOT_TAKEN")).toHaveLength(9);
    const n = (await p.query("select count(*)::int n from appointments where starts_at=$1", [start.toISOString()])).rows[0].n;
    expect(n).toBe(1);
  });

  it("prestations aux durées qui se chevauchent : blocage durée + préparation, frontières exactes", async () => {
    // lissage 120 min + 15 min de préparation à 14:00 → occupe jusqu'à 16:15
    const day = 300;
    const first = (await book(p, { service: lissage, start: localSlot(WED, "14:00", day) })).rows[0];
    expect(first.reference).toMatch(/^MK-[0-9A-F]{6}$/);
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "16:00", day) }))).toBe("MK_SLOT_TAKEN");
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "15:00", day) }))).toBe("MK_SLOT_TAKEN");
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "13:30", day) }))).toBe("MK_OUTSIDE_HOURS"); // pause 13-14
    const ok = await book(p, { service: soin, start: localSlot(WED, "16:15", day) }); // frontière exacte
    expect(ok.rows).toHaveLength(1);
  });

  it("refuse hors horaires, jour fermé, passé, trop tôt, trop loin", async () => {
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "09:00", 33) }))).toBe("MK_OUTSIDE_HOURS");
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "18:30", 33) }))).toBe("MK_OUTSIDE_HOURS"); // finit 19:30
    expect(await errCode(book(p, { service: tresses, start: localSlot(WED, "12:00", 33) }))).toBe("MK_OUTSIDE_HOURS"); // traverse la pause
    expect(await errCode(book(p, { service: soin, start: localSlot(1, "11:00", 33) }))).toBe("MK_OUTSIDE_HOURS"); // lundi fermé
    expect(await errCode(book(p, { service: soin, start: new Date(Date.now() - 3600_000) }))).toBe("MK_PAST");
    expect(await errCode(book(p, { service: soin, start: new Date(Date.now() + 3600_000) }))).toMatch(/MK_TOO_SOON|MK_OUTSIDE_HOURS|MK_CLOSED/);
    expect(await errCode(book(p, { service: soin, start: localSlot(WED, "11:00", 400) }))).toBe("MK_TOO_FAR");
  });

  it("fermeture exceptionnelle et horaires spécifiques", async () => {
    const closed = localSlot(WED, "11:00", 40);
    const d = closed.toISOString().slice(0, 10);
    await p.query("insert into schedule_exceptions (professional_id,on_date,is_closed) values (null,$1,true)", [d]);
    // la date locale peut différer de la date UTC : on contrôle via la base
    const localDate = (await p.query("select ($1::timestamptz at time zone 'Europe/Paris')::date d", [closed.toISOString()])).rows[0].d;
    await p.query("delete from schedule_exceptions");
    await p.query("insert into schedule_exceptions (professional_id,on_date,is_closed) values (null,$1,true)", [localDate]);
    expect(await errCode(book(p, { service: soin, start: closed }))).toBe("MK_CLOSED");
    await p.query("delete from schedule_exceptions");
    await p.query("insert into schedule_exceptions (professional_id,on_date,is_closed,start_time,end_time) values ($1,$2,false,'15:00','17:00')", [PRO, localDate]);
    expect(await errCode(book(p, { service: soin, start: closed }))).toBe("MK_OUTSIDE_HOURS");
    const inside = localSlot(WED, "15:00", 40);
    expect((await book(p, { service: soin, start: inside })).rows).toHaveLength(1);
    await p.query("delete from schedule_exceptions");
  });

  it("réservation provisoire expirée : le créneau est libéré", async () => {
    const start = localSlot(WED, "10:00", 47);
    const first = (await book(p, { service: soin, start })).rows[0];
    expect(await errCode(book(p, { service: soin, start }))).toBe("MK_SLOT_TAKEN");
    await p.query("update appointments set expires_at = now() - interval '1 minute' where id=$1", [first.appointment_id]);
    const second = await book(p, { service: soin, start, email: "autre@example.com" });
    expect(second.rows).toHaveLength(1);
    const st = (await p.query("select status from appointments where id=$1", [first.appointment_id])).rows[0].status;
    expect(st).toBe("expired");
  });

  it("expire_pending_appointments libère en masse et marque les paiements", async () => {
    const start = localSlot(WED, "14:00", 54);
    const a = (await book(p, { service: soin, start })).rows[0];
    await p.query("insert into payments (appointment_id,kind,amount_cents,stripe_checkout_session_id) values ($1,'full',4500,'cs_exp_1')", [a.appointment_id]);
    await p.query("update appointments set expires_at = now() - interval '2 minutes' where id=$1", [a.appointment_id]);
    const n = (await p.query("select expire_pending_appointments() n")).rows[0].n;
    expect(n).toBeGreaterThanOrEqual(1);
    expect((await p.query("select status from payments where stripe_checkout_session_id='cs_exp_1'")).rows[0].status).toBe("expired");
  });

  describe("paiement", () => {
    async function pending(start: Date, session: string) {
      const a = (await book(p, { service: soin, start })).rows[0];
      await p.query("insert into payments (appointment_id,kind,amount_cents,stripe_checkout_session_id) values ($1,'full',$2,$3)", [a.appointment_id, a.deposit_cents, session]);
      return a;
    }
    const confirm = (s: string, amount = 4500) =>
      p.query("select confirm_payment($1,'pi_'||$1,'ch_'||$1,$2,'https://receipt') r", [s, amount]).then((r) => r.rows[0].r as string);

    it("confirme une fois, de façon idempotente", async () => {
      const a = await pending(localSlot(WED, "10:00", 61), "cs_ok_1");
      expect(await confirm("cs_ok_1")).toBe("confirmed");
      expect(await confirm("cs_ok_1")).toBe("already_processed");
      const row = (await p.query("select a.status a, pay.status p, a.expires_at from appointments a join payments pay on pay.appointment_id=a.id where a.id=$1", [a.appointment_id])).rows[0];
      expect(row.a).toBe("confirmed");
      expect(row.p).toBe("paid");
      expect(row.expires_at).toBeNull();
    });

    it("confirmations simultanées (webhooks rejoués en parallèle) : un seul 'confirmed'", async () => {
      await pending(localSlot(WED, "14:00", 68), "cs_par_1");
      const rs = await Promise.all(Array.from({ length: 6 }, () => confirm("cs_par_1")));
      expect(rs.filter((r) => r === "confirmed")).toHaveLength(1);
      expect(rs.filter((r) => r === "already_processed")).toHaveLength(5);
    });

    it("montant différent : mis en revue, rendez-vous non confirmé", async () => {
      const a = await pending(localSlot(WED, "16:00", 75), "cs_amt_1");
      expect(await confirm("cs_amt_1", 100)).toBe("amount_mismatch");
      expect((await p.query("select status from appointments where id=$1", [a.appointment_id])).rows[0].status).toBe("pending_payment");
      expect((await p.query("select status from payments where stripe_checkout_session_id='cs_amt_1'")).rows[0].status).toBe("needs_review");
    });

    it("paiement échoué puis réussi sur la même session", async () => {
      const a = await pending(localSlot(WED, "10:00", 82), "cs_fail_1");
      await p.query("select mark_payment_failed('cs_fail_1','pi_x','card_declined')");
      expect((await p.query("select status, failure_reason from payments where stripe_checkout_session_id='cs_fail_1'")).rows[0]).toMatchObject({ status: "failed", failure_reason: "card_declined" });
      expect((await p.query("select status from appointments where id=$1", [a.appointment_id])).rows[0].status).toBe("pending_payment");
      expect(await confirm("cs_fail_1")).toBe("confirmed");
    });

    it("session expirée : paiement expiré et créneau libéré", async () => {
      const start = localSlot(WED, "14:00", 89);
      const a = await pending(start, "cs_exp_2");
      expect((await p.query("select expire_checkout('cs_exp_2') r")).rows[0].r).toBe("expired");
      expect((await p.query("select status from appointments where id=$1", [a.appointment_id])).rows[0].status).toBe("expired");
      expect((await book(p, { service: soin, start, email: "z@example.com" })).rows).toHaveLength(1);
    });

    it("paiement reçu après expiration, créneau libre : rendez-vous repris", async () => {
      const a = await pending(localSlot(WED, "16:00", 96), "cs_late_1");
      await p.query("select expire_checkout('cs_late_1')");
      expect(await confirm("cs_late_1")).toBe("confirmed_late");
      expect((await p.query("select status from appointments where id=$1", [a.appointment_id])).rows[0].status).toBe("confirmed");
    });

    it("paiement reçu après expiration, créneau repris par une autre : conflit, à rembourser", async () => {
      const start = localSlot(WED, "10:00", 103);
      const a = await pending(start, "cs_late_2");
      await p.query("select expire_checkout('cs_late_2')");
      await book(p, { service: soin, start, email: "autre@example.com" }); // une autre cliente prend le créneau
      expect(await confirm("cs_late_2")).toBe("conflict");
      const pay = (await p.query("select status, failure_reason from payments where stripe_checkout_session_id='cs_late_2'")).rows[0];
      expect(pay.status).toBe("needs_review");
      expect(pay.failure_reason).toMatch(/late_payment_MK_SLOT_TAKEN/);
      expect((await p.query("select status from appointments where id=$1", [a.appointment_id])).rows[0].status).toBe("expired");
    });

    it("remboursement enregistré (partiel puis total)", async () => {
      await pending(localSlot(WED, "14:00", 110), "cs_ref_1");
      await confirm("cs_ref_1");
      await p.query("select record_refund('pi_cs_ref_1', 1000)");
      expect((await p.query("select status, refunded_cents from payments where stripe_checkout_session_id='cs_ref_1'")).rows[0]).toMatchObject({ status: "partially_refunded", refunded_cents: 1000 });
      await p.query("select record_refund('pi_cs_ref_1', 4500)");
      expect((await p.query("select status from payments where stripe_checkout_session_id='cs_ref_1'")).rows[0].status).toBe("refunded");
    });
  });

  describe("annulation et déplacement", () => {
    let userA: string, userB: string;
    beforeAll(async () => {
      userA = (await p.query("insert into auth.users (email) values ('a@example.com') returning id")).rows[0].id;
      userB = (await p.query("insert into auth.users (email) values ('b@example.com') returning id")).rows[0].id;
    });
    async function confirmed(start: Date, client: string) {
      const a = (await book(p, { service: soin, start, client })).rows[0];
      await p.query("update appointments set status='confirmed', expires_at=null where id=$1", [a.appointment_id]);
      await p.query("insert into payments (appointment_id,kind,amount_cents,status,stripe_payment_intent_id) values ($1,'full',4500,'paid',$2)", [a.appointment_id, "pi_" + a.reference]);
      return a;
    }

    it("annulation par la propriétaire dans le délai : remboursable", async () => {
      const a = await confirmed(localSlot(WED, "10:00", 117), userA);
      const r = (await p.query("select cancel_appointment($1,'client',$2,'test') r", [a.appointment_id, userA])).rows[0].r;
      expect(r.refundable_cents).toBe(4500);
      expect((await p.query("select status, cancelled_by from appointments where id=$1", [a.appointment_id])).rows[0]).toMatchObject({ status: "cancelled", cancelled_by: "client" });
    });

    it("une autre cliente ne peut pas annuler ni déplacer", async () => {
      const a = await confirmed(localSlot(WED, "14:00", 124), userA);
      expect(await errCode(p.query("select cancel_appointment($1,'client',$2)", [a.appointment_id, userB]))).toBe("MK_FORBIDDEN");
      expect(await errCode(p.query("select reschedule_appointment($1,$2,'client',$3)", [a.appointment_id, localSlot(WED, "16:00", 124), userB]))).toBe("MK_FORBIDDEN");
      expect(await errCode(p.query("select cancel_appointment($1,'client',null)", [a.appointment_id]))).toBe("MK_FORBIDDEN");
    });

    it("délai d'annulation configurable : refus trop tard, admin toujours possible", async () => {
      const a = await confirmed(localSlot(WED, "16:00", 131), userA);
      await p.query("update salon_settings set cancellation_hours = 24*400");
      expect(await errCode(p.query("select cancel_appointment($1,'client',$2)", [a.appointment_id, userA]))).toBe("MK_TOO_LATE");
      const r = await p.query("select cancel_appointment($1,'admin',null,'admin') r", [a.appointment_id]);
      expect(r.rows).toHaveLength(1);
      await p.query("update salon_settings set cancellation_hours = 48");
    });

    it("déplacement : crée le nouveau créneau, libère l'ancien, refuse un créneau pris", async () => {
      const from = localSlot(WED, "10:00", 138), to = localSlot(WED, "14:00", 138);
      const a = await confirmed(from, userA);
      await confirmed(localSlot(WED, "16:00", 138), userB);
      expect(await errCode(p.query("select reschedule_appointment($1,$2,'client',$3)", [a.appointment_id, localSlot(WED, "16:00", 138), userA]))).toBe("MK_SLOT_TAKEN");
      await p.query("select reschedule_appointment($1,$2,'client',$3)", [a.appointment_id, to, userA]);
      expect((await p.query("select starts_at, rescheduled_count from appointments where id=$1", [a.appointment_id])).rows[0].rescheduled_count).toBe(1);
      expect((await book(p, { service: soin, start: from, email: "libre@example.com" })).rows).toHaveLength(1); // ancien créneau libre
    });

    it("déplacement refusé dans le délai configuré", async () => {
      const a = await confirmed(localSlot(WED, "10:00", 145), userA);
      await p.query("update salon_settings set reschedule_hours = 24*400");
      expect(await errCode(p.query("select reschedule_appointment($1,$2,'client',$3)", [a.appointment_id, localSlot(WED, "14:00", 145), userA]))).toBe("MK_TOO_LATE");
      await p.query("update salon_settings set reschedule_hours = 48");
    });
  });

  describe("administration", () => {
    it("une réservation admin respecte les mêmes règles de chevauchement", async () => {
      const start = localSlot(WED, "10:00", 152);
      const adm = (await book(p, { service: soin, start, source: "admin" })).rows[0];
      const a = (await p.query("select status, deposit_cents, balance_cents, expires_at from appointments where id=$1", [adm.appointment_id])).rows[0];
      expect(a).toMatchObject({ status: "confirmed", deposit_cents: 0, balance_cents: 4500, expires_at: null });
      expect(await errCode(book(p, { service: soin, start, source: "admin" }))).toBe("MK_SLOT_TAKEN");
      expect(await errCode(book(p, { service: soin, start: localSlot(WED, "09:00", 152), source: "admin" }))).toBe("MK_OUTSIDE_HOURS");
    });

    it("absence : bloque les réservations et refuse de recouvrir un rendez-vous", async () => {
      const day = 330;
      const blockStart = localSlot(WED, "14:00", day), blockEnd = localSlot(WED, "16:00", day);
      await p.query("select create_time_block($1,$2,$3,'congé',null)", [PRO, blockStart, blockEnd]);
      expect(await errCode(book(p, { service: soin, start: localSlot(WED, "15:00", day) }))).toBe("MK_BLOCKED");
      expect((await book(p, { service: soin, start: localSlot(WED, "16:00", day) })).rows).toHaveLength(1);
      expect(await errCode(p.query("select create_time_block($1,$2,$3,'x',null)", [PRO, localSlot(WED, "16:30", day), localSlot(WED, "18:00", day)]))).toBe("MK_HAS_APPOINTMENTS");
    });
  });

  it("la contrainte d'exclusion protège même un INSERT direct (contournement des fonctions)", async () => {
    const start = localSlot(WED, "10:00", 159);
    const a = (await book(p, { service: soin, start })).rows[0];
    const ap = (await p.query("select * from appointments where id=$1", [a.appointment_id])).rows[0];
    const err = await errCode(p.query(
      `insert into appointments (reference,access_token,professional_id,status,starts_at,ends_at,blocked_until,duration_minutes,total_cents,deposit_cents,balance_cents,contact_first_name,contact_last_name,contact_email,contact_phone,expires_at)
       values ('MK-DIRECT','tok-direct',$1,'confirmed',$2,$3,$4,60,100,100,0,'a','b','c@d.e','1',null)`,
      [PRO, new Date(new Date(ap.starts_at).getTime() + 10 * 60_000), ap.ends_at, ap.blocked_until]));
    expect(err).toMatch(/appointments_no_overlap/);
  });

  it("limitation de débit : au-delà du seuil, refus", async () => {
    const r: boolean[] = [];
    for (let i = 0; i < 5; i++) r.push((await p.query("select check_rate_limit('test:ip1', 3, 60) ok")).rows[0].ok);
    expect(r).toEqual([true, true, true, false, false]);
    expect((await p.query("select check_rate_limit('test:ip2', 3, 60) ok")).rows[0].ok).toBe(true);
  });

  it("sans préférence : la première professionnelle disponible est choisie", async () => {
    const pro2 = (await p.query("insert into professionals (display_name, sort_order) values ('Seconde (test)', 2) returning id")).rows[0].id;
    await p.query("insert into professional_services select $1, id from services", [pro2]);
    await p.query("insert into business_hours (professional_id, weekday, start_time, end_time) select $1, weekday, start_time, end_time from business_hours where professional_id=$2", [pro2, PRO]);
    const start = localSlot(WED, "10:00", 166);
    const a = (await book(p, { service: soin, start, pro: null })).rows[0];
    const b = (await book(p, { service: soin, start, pro: null, email: "b@example.com" })).rows[0];
    expect(a.professional_id).toBe(PRO);
    expect(b.professional_id).toBe(pro2);
    expect(await errCode(book(p, { service: soin, start, pro: null, email: "c@example.com" }))).toBe("MK_SLOT_TAKEN");
    await p.query("update professionals set is_active=false where id=$1", [pro2]);
  });
});
