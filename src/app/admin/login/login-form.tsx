"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm({ withEmail }: { withEmail: boolean }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-5">
      {withEmail && (
        <Field label="Adresse e-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="username" autoFocus />
        </Field>
      )}
      <Field label="Mot de passe" htmlFor="password" error={state?.error}>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={Boolean(state?.error)} />
      </Field>
      <Button type="submit" block disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</Button>
      {withEmail && (
        <p className="text-center text-sm">
          <Link href="/admin/mot-de-passe-oublie" className="text-walnut underline underline-offset-4">Mot de passe oublié ? / Créer mon compte</Link>
        </p>
      )}
    </form>
  );
}
