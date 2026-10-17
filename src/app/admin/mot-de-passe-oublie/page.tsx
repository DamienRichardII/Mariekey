import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h1 className="mb-1 font-serif text-3xl text-ink">Mot de passe oublié</h1>
      <p className="mb-6 text-sm text-stone">
        Première visite ou mot de passe perdu : saisissez votre adresse e-mail. Vous recevrez un lien pour créer ou changer votre mot de passe.
      </p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm"><Link href="/admin/login" className="text-walnut underline underline-offset-4">Retour à la connexion</Link></p>
    </div>
  );
}
