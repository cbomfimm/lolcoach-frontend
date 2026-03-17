import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-arcane-dark shadow hover:bg-gold-glow hover:shadow-[0_0_20px_rgba(200,170,110,0.4)]",
        outline:
          "border border-gold/50 bg-transparent text-gold shadow-sm hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_15px_rgba(200,155,60,0.2)]",
        ghost: "hover:bg-gold/10 hover:text-gold",
        arcane:
          "bg-arcane-blue/10 border border-arcane-blue/50 text-arcane-blue hover:bg-arcane-blue/20 hover:shadow-[0_0_20px_rgba(11,196,227,0.3)]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-sm px-4 text-xs",
        lg: "h-12 rounded-sm px-10 text-base",
        xl: "h-14 rounded-sm px-12 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
