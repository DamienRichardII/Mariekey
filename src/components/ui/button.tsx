import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-medium tracking-wide transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 min-h-12 px-7 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-walnut-deep",
        outline: "border border-ink bg-white text-ink hover:bg-cream",
        soft: "bg-beige text-ink hover:bg-sand",
        ghost: "text-ink hover:bg-cream",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: { default: "", sm: "min-h-10 px-5 text-sm", lg: "min-h-14 px-9 text-base", icon: "min-h-11 w-11 px-0" },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "default", block: false },
  },
);

type Common = VariantProps<typeof buttonVariants> & { className?: string };
export type ButtonProps = Common & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export function LinkButton({
  href, className, variant, size, block, children, ...props
}: Common & Omit<React.ComponentProps<typeof Link>, "className"> & { children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
      {children}
    </Link>
  );
}
