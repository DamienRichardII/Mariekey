"use client";

import { useActionState, useSyncExternalStore } from "react";
import Link from "next/link";
import { completePasswordReset } from "../actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

let cachedToken: string | null | undefined;
const noopSubscribe = () => () => {};
/** Lit une seule fois le jeton du fragment d'URL (#access_token=…) puis efface le fragment de la barre d'adresse. */
function readToken(): string | null {
  if (cachedToken === undefined) {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const t = params.get("access_token");
    cachedToken = t && params.get("type") === "recovery" ? t : null;
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  }
  return cachedToken;
}

export function ResetForm() {
  const token = useSyncExternalStore<string | null | undefined>(noopSubscribe, readToken, () => undefined);
  const [state, action, pending] = useActionState(completePasswordReset, null);

  if (token === undefined) return <p className="text-sm text-stone" aria-live="polite">Vérification du lien…</p>;
  if (!token && !state)
    return (
      <div role="alert" className="space-y-4 text-sm">
        <p className="rounded-xl bg-danger/5 p-4 text-danger">Ce lien est invalide ou a expiré.</p>
        <Link href="/admin/mot-de-passe-oublie" className="text-walnut underline underline-offset-4">Demander un nouveau lien</Link>
      </div>
    );
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token ?? ""} />
      <Field label="Nouveau mot de passe" htmlFor="password" hint="10 caractères minimum.">
        <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={10} autoFocus />
      </Field>
      <Field label="Confirmer le mot de passe" htmlFor="confirm" error={state?.error}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required minLength={10} aria-invalid={Boolean(state?.error)} />
      </Field>
      <Button type="submit" block disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer et me connecter"}</Button>
      {state?.error?.includes("lien") && (
        <p className="text-center text-sm"><Link href="/admin/mot-de-passe-oublie" className="text-walnut underline underline-offset-4">Demander un nouveau lien</Link></p>
      )}
    </form>
  );
}
