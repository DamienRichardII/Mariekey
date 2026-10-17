"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { NAV } from "@/config/site";
import { BookButton } from "./book-button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger aria-label="Ouvrir le menu" className="grid size-11 place-items-center rounded-full hover:bg-cream lg:hidden">
        <Menu size={22} />
      </DialogTrigger>
      <DialogContent title="Menu" className="top-0 max-w-none translate-y-0 rounded-t-none">
        <nav aria-label="Navigation principale">
          <ul className="divide-y divide-line">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center font-serif text-2xl">
                  {i.label}
                </Link>
              </li>
            ))}
            <li className="pt-5"><BookButton size="lg" block /></li>
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
