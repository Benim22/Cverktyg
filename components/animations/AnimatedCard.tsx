"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
}

export function AnimatedCard({ children, className = "" }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white dark:bg-gray-800 ${className}`}>{children}</Card>
    </motion.div>
  )
}

