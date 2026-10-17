"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Un souci est survenu</h1>
      <p className="mt-3 text-stone">Nous n&apos;avons pas pu afficher cette page. Réessayez dans un instant.</p>
      <Button className="mt-8" onClick={reset}>Réessayer</Button>
    </div>
  );
}
