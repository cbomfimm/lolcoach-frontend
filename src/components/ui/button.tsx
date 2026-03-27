import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7c6dd8] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#d4a843] text-[#0a0a1a] shadow hover:bg-[#e0bc5a] hover:shadow-[0_0_20px_rgba(212,168,67,0.35)]",
        outline:
          "border border-[#d4a843]/50 bg-transparent text-[#d4a843] shadow-sm hover:bg-[#d4a843]/10 hover:border-[#d4a843] hover:shadow-[0_0_15px_rgba(212,168,67,0.2)]",
        ghost: "hover:bg-[#d4a843]/10 hover:text-[#d4a843]",
        arcane:
          "bg-[#7c6dd8]/10 border border-[#7c6dd8]/50 text-[#7c6dd8] hover:bg-[#7c6dd8]/20 hover:shadow-[0_0_20px_rgba(124,109,216,0.3)]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-[#d4a843] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-8 rounded-lg px-4 text-xs",
        lg:      "h-12 rounded-lg px-10 text-base",
        xl:      "h-14 rounded-lg px-12 text-lg",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
