import * as React from "react";
import { cn } from "@/lib/utils";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement,InputProps>(({className,...props},ref)=>(
  <input ref={ref} className={cn("w-full rounded-xl border border-border bg-surface-soft px-3.5 py-3 text-sm text-text placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-colors duration-150",className)} {...props} />
));
Input.displayName = "Input";
