import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h1 className="mb-1 font-serif text-3xl text-ink">Espace administration</h1>
      <p className="mb-6 text-sm text-stone">Rendez-vous, prestations, textes, articles, avis, photos et coordonnées du site.</p>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p role="alert" className="rounded-xl bg-danger/5 p-4 text-sm text-danger">
          L&apos;administration n&apos;est pas encore activée : la variable ADMIN_PASSWORD doit être définie sur Vercel (voir docs/ADMIN.md).
        </p>
      )}
    </div>
  );
}
