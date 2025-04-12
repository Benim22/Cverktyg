"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  asChild?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function AnimatedButton({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  disabled = false,
  type,
}: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
      <Button 
        onClick={onClick} 
        variant={variant} 
        size={size} 
        className={className} 
        asChild={asChild}
        disabled={disabled}
        type={type}
      >
        {children}
      </Button>
    </motion.div>
  )
}

