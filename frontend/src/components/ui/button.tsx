import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#5546FF] to-[#7D8BFF] text-white hover:from-[#4A3BE8] hover:to-[#6B73FF] shadow-lg hover:shadow-xl",
        destructive:
          "bg-gradient-to-r from-[#EF4444] to-[#F87171] text-white hover:from-[#DC2626] hover:to-[#EF4444] shadow-lg",
        outline:
          "border border-[#5546FF] bg-transparent text-[#5546FF] hover:bg-[#5546FF] hover:text-white",
        secondary:
          "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm",
        ghost: "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
        link: "text-[#5546FF] underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-[#5546FF] to-[#7D8BFF] text-white hover:from-[#4A3BE8] hover:to-[#6B73FF] shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-9 px-4 py-2 text-sm rounded-md",
        lg: "h-14 px-8 py-4 text-lg rounded-xl",
        xl: "h-16 px-10 py-5 text-xl rounded-2xl",
        icon: "h-12 w-12",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };