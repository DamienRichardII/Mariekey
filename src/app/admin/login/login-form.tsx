"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-5">
      <Field label="Mot de passe" htmlFor="password" error={state?.error}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus aria-invalid={Boolean(state?.error)} />
      </Field>
      <Button type="submit" block disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</Button>
    </form>
  );
}
