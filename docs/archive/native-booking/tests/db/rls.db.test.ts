import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { ADMIN_URL, book, errCode, localSlot, pool, resetDatabase, serviceId } from "./helpers";

describe.skipIf(!ADMIN_URL)("RLS et autorisations (PostgreSQL réel)", () => {
  let p: pg.Pool;
  let a: string, b: string, admin: string;
  let apptA: string, apptB: string;

  /** Exécute `fn` avec les droits d'un utilisateur Supabase (rôle authenticated/anon + claims JWT). */
  async function as<T>(role: "anon" | "authenticated", sub: string | null, fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
    const c = await p.connect();
    try {
      await c.query("begin");
      await c.query(`set local role ${role}`);
      await c.query("select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)", [sub ?? "", role]);
      return await fn(c);
    } finally {
      await c.query("rollback");
      c.release();
    }
  }
  const tryQ = async (c: pg.PoolClient, sql: string, params: unknown[] = []) => {
    await c.query("savepoint s");
    try { const r = await c.query(sql, params); return { ok: true as const, rows: r.rows, rowCount: r.rowCount }; }
    catch (e) { await c.query("rollback to savepoint s"); return { ok: false as const, error: (e as Error).message }; }
  };

  beforeAll(async () => {
    await resetDatabase();
    p = pool();
    await p.query("update salon_settings set max_advance_days = 365");
    a = (await p.query("insert into auth.users (email) values ('a@example.com') returning id")).rows[0].id;
    b = (await p.query("insert into auth.users (email) values ('b@example.com') returning id")).rows[0].id;
    admin = (await p.query("insert into auth.users (email) values ('admin@example.com') returning id")).rows[0].id;
    await p.query("update profiles set role='admin' where id=$1", [admin]);
    const soin = await serviceId(p, "soin-capillaire-demo");
    apptA = (await book(p, { service: soin, start: localSlot(3, "10:00", 12), client: a, email: "a@example.com" })).rows[0].appointment_id;
    apptB = (await book(p, { service: soin, start: localSlot(3, "14:00", 12), client: b, email: "b@example.com" })).rows[0].appointment_id;
    await p.query("insert into payments (appointment_id,kind,amount_cents,stripe_checkout_session_id) values ($1,'full',4500,'cs_a'),($2,'full',4500,'cs_b')", [apptA, apptB]);
  });
  afterAll(async () => { await p.end(); });

  it("le profil est créé automatiquement à l'inscription avec le rôle client", async () => {
    const r = await p.query("select role, email from profiles where id=$1", [a]);
    expect(r.rows[0]).toMatchObject({ role: "client", email: "a@example.com" });
  });

  it("anonyme : lit le catalogue actif, rien de personnel", async () => {
    await as("anon", null, async (c) => {
      expect((await c.query("select count(*)::int n from services")).rows[0].n).toBe(5);
      for (const t of ["appointments", "payments", "profiles", "time_blocks", "notifications", "audit_log", "webhook_events", "rate_limits"]) {
        const r = await tryQ(c, `select * from ${t}`);
        expect(r.ok, t).toBe(false); // privilège refusé
      }
    });
  });

  it("anonyme et clientes ne peuvent exécuter aucune fonction de réservation ou de paiement", async () => {
    for (const who of [["anon", null], ["authenticated", a]] as const) {
      await as(who[0], who[1], async (c) => {
        const soin = await serviceId(p, "soin-capillaire-demo");
        const calls = [
          ["select * from create_booking($1,'{}'::uuid[],null,now()+interval '9 days',null,'a','b','c@d.e','1')", [soin]],
          ["select confirm_payment('cs_a','pi','ch',4500,null)", []],
          ["select expire_pending_appointments()", []],
          ["select check_rate_limit('x',1,1)", []],
          ["select slot_violation(null,now(),now(),now())", []],
        ] as const;
        for (const [sql, params] of calls) {
          const r = await tryQ(c, sql, [...params]);
          expect(r.ok, `${who[0]}: ${sql}`).toBe(false);
          expect(r.ok ? "" : r.error).toMatch(/permission denied/);
        }
      });
    }
  });

  it("une cliente ne voit que ses rendez-vous, ses prestations et ses paiements", async () => {
    await as("authenticated", a, async (c) => {
      expect((await c.query("select id from appointments")).rows.map((r) => r.id)).toEqual([apptA]);
      expect((await c.query("select count(*)::int n from appointment_items")).rows[0].n).toBe(1);
      expect((await c.query("select count(*)::int n from payments")).rows[0].n).toBe(1);
      expect((await c.query("select id from profiles")).rows.map((r) => r.id)).toEqual([a]);
      expect((await c.query("select count(*)::int n from appointments where id=$1", [apptB])).rows[0].n).toBe(0);
    });
    await as("authenticated", b, async (c) => {
      expect((await c.query("select id from appointments")).rows.map((r) => r.id)).toEqual([apptB]);
    });
  });

  it("une cliente ne peut ni créer, ni modifier, ni supprimer rendez-vous et paiements", async () => {
    await as("authenticated", a, async (c) => {
      expect((await tryQ(c, "update appointments set status='cancelled' where id=$1", [apptA])).ok).toBe(false);
      expect((await tryQ(c, "delete from appointments where id=$1", [apptA])).ok).toBe(false);
      expect((await tryQ(c, "update payments set status='paid'")).ok).toBe(false);
      expect((await tryQ(c, "insert into payments (appointment_id,kind,amount_cents) values ($1,'full',1)", [apptA])).ok).toBe(false);
    });
  });

  it("une cliente ne peut pas s'élever administratrice ni modifier le profil d'une autre", async () => {
    await as("authenticated", a, async (c) => {
      const esc = await tryQ(c, "update profiles set role='admin' where id=$1", [a]);
      expect(esc.ok).toBe(false); // privilège de colonne refusé
      const other = await tryQ(c, "update profiles set first_name='Pirate' where id=$1", [b]);
      expect(other.ok && other.rowCount).toBe(0); // RLS : 0 ligne touchée
      const own = await tryQ(c, "update profiles set first_name='Alice' where id=$1", [a]);
      expect(own.ok && own.rowCount).toBe(1);
    });
    expect((await p.query("select role from profiles where id=$1", [a])).rows[0].role).toBe("client");
    expect((await p.query("select first_name from profiles where id=$1", [b])).rows[0].first_name).toBeNull();
  });

  it("le trigger refuse aussi le changement de rôle si le privilège de colonne existait", async () => {
    // Défense en profondeur : on accorde temporairement la colonne puis on vérifie le trigger.
    await p.query("grant update (role) on profiles to authenticated");
    try {
      await as("authenticated", a, async (c) => {
        const r = await tryQ(c, "update profiles set role='admin' where id=$1", [a]);
        expect(r.ok ? "" : r.error).toMatch(/MK_FORBIDDEN_ROLE_CHANGE/);
      });
    } finally {
      await p.query("revoke update (role) on profiles from authenticated");
    }
  });

  it("le catalogue n'est modifiable que par un admin", async () => {
    await as("authenticated", a, async (c) => {
      const r = await tryQ(c, "update services set price_cents = 1");
      expect(r.ok && r.rowCount).toBe(0);
      expect((await tryQ(c, "insert into service_categories (slug,name) values ('x','x')")).ok).toBe(false);
      expect((await tryQ(c, "update salon_settings set payment_mode='full'")).ok && true).toBeTruthy();
    });
    expect((await p.query("select min(price_cents) m from services")).rows[0].m).toBe(4500);
    await as("authenticated", admin, async (c) => {
      const r = await tryQ(c, "update services set preparation_notes='ok' where slug='soin-capillaire-demo'");
      expect(r.ok && r.rowCount).toBe(1);
      expect((await c.query("select count(*)::int n from appointments")).rows[0].n).toBe(2); // l'admin voit tout
      expect((await c.query("select count(*)::int n from audit_log")).rows[0].n).toBe(0);
    });
  });

  it("journal, notifications, absences : invisibles pour une cliente", async () => {
    await p.query("insert into audit_log (action, entity) values ('test','x')");
    await as("authenticated", a, async (c) => {
      expect((await c.query("select count(*)::int n from audit_log")).rows[0].n).toBe(0);
      expect((await c.query("select count(*)::int n from notifications")).rows[0].n).toBe(0);
      expect((await c.query("select count(*)::int n from time_blocks")).rows[0].n).toBe(0);
      expect((await tryQ(c, "select * from webhook_events")).ok).toBe(false);
    });
    await as("authenticated", admin, async (c) => {
      expect((await c.query("select count(*)::int n from audit_log")).rows[0].n).toBe(1);
    });
  });

  it("is_admin() reflète le rôle de l'appelante", async () => {
    await as("authenticated", admin, async (c) => expect((await c.query("select is_admin() v")).rows[0].v).toBe(true));
    await as("authenticated", a, async (c) => expect((await c.query("select is_admin() v")).rows[0].v).toBe(false));
    await as("anon", null, async (c) => expect((await c.query("select is_admin() v")).rows[0].v).toBe(false));
  });

  it("service_role (serveur) contourne RLS comme prévu", async () => {
    const c = await p.connect();
    try {
      await c.query("set role service_role");
      expect((await c.query("select count(*)::int n from appointments")).rows[0].n).toBe(2);
      expect(await errCode(c.query("select confirm_payment('cs_a','pi','ch',1,null)"))).toBeNull();
    } finally { await c.query("reset role"); c.release(); }
  });
});
