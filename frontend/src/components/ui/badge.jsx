import React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-secondary text-primary-foreground",
    safe: "bg-accent-green/20 text-accent-green border border-accent-green/30",
    moderate: "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30",
    dream: "bg-accent-red/20 text-accent-red border border-accent-red/30",
    outline: "border border-border text-primary-foreground",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
