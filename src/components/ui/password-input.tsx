"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Champ mot de passe avec bouton « œil » pour afficher / masquer la saisie. */
export function PasswordInput({ className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-14", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-stone hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut/30"
      >
        {visible ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
      </button>
    </div>
  );
}
