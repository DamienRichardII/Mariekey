"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  if (state && "sent" in state) {
    return (
      <p role="status" className="rounded-xl bg-cream p-4 text-sm text-ink-soft">
        Si cette adresse est autorisée, un e-mail vient d’être envoyé. Cliquez sur le lien qu’il contient (pensez à vérifier les courriers indésirables). Le lien est valable une heure.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <Field label="Adresse e-mail" htmlFor="email" error={state && "error" in state ? state.error : undefined}>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Button type="submit" block disabled={pending}>{pending ? "Envoi…" : "Recevoir le lien"}</Button>
    </form>
  );
}
