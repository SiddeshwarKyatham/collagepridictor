import React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? motion.div : motion.button
  
  const variants = {
    default: "bg-accent-blue text-white hover:bg-blue-600 shadow-md",
    outline: "border border-border bg-transparent hover:bg-secondary text-primary-foreground",
    ghost: "bg-transparent hover:bg-secondary text-primary-foreground",
    safe: "bg-accent-green text-white hover:bg-emerald-600",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 rounded-lg px-8 text-lg font-medium",
    icon: "h-10 w-10",
  }

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      whileTap={{ scale: 0.98 }}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
