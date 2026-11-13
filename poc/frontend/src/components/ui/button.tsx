import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-[#173a30] text-[#f7f9f0] shadow-[0_8px_18px_rgba(23,58,48,.15)] hover:-translate-y-0.5 hover:bg-[#214b3e]",
        secondary: "border border-[#e2e7dd] bg-white text-[#385343] hover:border-[#becdb6] hover:bg-[#f6f8f1]",
        ghost: "text-[#68786c] hover:bg-[#f0f3eb] hover:text-[#203e2d]",
        danger: "border border-[#f0ddd6] bg-[#fff8f5] text-[#985347] hover:bg-[#fff0eb]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        icon: "size-9 rounded-xl p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export { Button, buttonVariants };
