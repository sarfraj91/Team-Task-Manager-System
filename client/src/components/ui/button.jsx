import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:brightness-110",
        secondary:
          "border border-white/10 bg-white/5 text-foreground hover:-translate-y-0.5 hover:bg-white/10 dark:border-white/10 light:border-[#e6dcc9]",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        outline: "border border-white/10 bg-transparent text-foreground hover:bg-white/5 dark:border-white/10 light:border-[#d7ccb7]",
        danger: "bg-danger text-danger-foreground hover:brightness-110"
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10 rounded-2xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
})

Button.displayName = "Button"

export { Button, buttonVariants }
