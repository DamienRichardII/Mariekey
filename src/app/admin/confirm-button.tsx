"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

/** Bouton de formulaire qui demande une confirmation avant une suppression. */
export function ConfirmButton({ message, ...props }: ButtonProps & { message: string }) {
  return <Button type="submit" onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }} {...props} />;
}
