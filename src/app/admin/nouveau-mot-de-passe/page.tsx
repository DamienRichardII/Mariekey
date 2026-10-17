import { ResetForm } from "./reset-form";

export const metadata = { title: "Nouveau mot de passe" };

export default function NewPasswordPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h1 className="mb-1 font-serif text-3xl text-ink">Votre mot de passe</h1>
      <p className="mb-6 text-sm text-stone">Choisissez un mot de passe d’au moins 10 caractères. Vous serez connectée ensuite.</p>
      <ResetForm />
    </div>
  );
}
