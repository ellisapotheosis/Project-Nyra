import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cyan-500 text-slate-900 shadow hover:bg-cyan-400",
        destructive:
          "bg-red-500 text-slate-50 shadow-sm hover:bg-red-400",
        outline:
          "border border-cyan-400/50 bg-transparent text-cyan-300 shadow-sm hover:bg-cyan-400/10 hover:border-cyan-400",
        secondary:
          "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700 border border-slate-700",
        ghost: "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
        gradient: "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow hover:from-cyan-400 hover:to-violet-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
