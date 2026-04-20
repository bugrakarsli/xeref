import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; fullWidth?: boolean;
}

const V: Record<Variant, string> = {
  primary: "bg-accent-soft text-white hover:bg-accent-hover active:scale-[0.98]",
  accent:  "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]",
  ghost:   "bg-transparent text-muted hover:bg-surface-muted",
  dark:    "bg-[#171913] text-white hover:bg-black/90",
  outline: "border border-border bg-surface-soft text-text hover:bg-surface-muted",
};
const S: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-4 py-3 text-sm rounded-xl",
  lg: "px-5 py-3.5 text-base rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, ...props }, ref) => (
    <button ref={ref}
      className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none", V[variant], S[size], fullWidth && "w-full", className)}
      {...props}>{children}</button>
  )
);
Button.displayName = "Button";
