"use client"

import { useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { motion } from "framer-motion"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  className?: string
}

export function ScrollReveal({ children, direction = "up", delay = 0, className = "" }: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const getDirectionValues = () => {
    switch (direction) {
      case "up":
        return { y: 50, opacity: 0 }
      case "down":
        return { y: -50, opacity: 0 }
      case "left":
        return { x: 50, opacity: 0 }
      case "right":
        return { x: -50, opacity: 0 }
      default:
        return { y: 50, opacity: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getDirectionValues()}
      animate={isInView ? { y: 0, x: 0, opacity: 1 } : getDirectionValues()}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

