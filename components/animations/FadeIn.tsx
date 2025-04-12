"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.5, direction = "up", className = "" }: FadeInProps) {
  const directionValues = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionValues[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        delay,
        duration,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

