"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
      className={className}
    >
      <Loader2 size={size} className="text-primary" />
    </motion.div>
  )
}

