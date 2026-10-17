import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full min-h-12 rounded-xl border border-sand bg-white px-4 text-[15px] text-ink placeholder:text-stone/70 transition-colors focus:border-walnut focus:outline-none focus-visible:ring-2 focus-visible:ring-walnut/30 disabled:bg-cream disabled:text-stone aria-[invalid=true]:border-danger";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(inputClass, "min-h-28 py-3", className)} {...props} />,
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(inputClass, "appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10", className)} {...props} />,
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink-soft", className)} {...props} />;
}

export function Field({
  label, htmlFor, error, hint, children, className,
}: { label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-stone">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
