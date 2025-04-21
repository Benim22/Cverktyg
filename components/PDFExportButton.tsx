"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Loader2, Check } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PDFExportButtonProps {
  onExport?: () => Promise<void>
  className?: string
  text?: {
    idle?: string
    exporting?: string
    exported?: string
  }
}

function SuccessParticles({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>
}) {
  const rect = buttonRef.current?.getBoundingClientRect()
  if (!rect) return null

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  return (
    <AnimatePresence>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-foreground rounded-full"
          style={{ left: centerX, top: centerY }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
            y: [0, -Math.random() * 50 - 20],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  )
}

export function PDFExportButton({
  onExport,
  className,
  text = {
    idle: "Exportera PDF",
    exporting: "Exporterar...",
    exported: "Exporterad!"
  }
}: PDFExportButtonProps) {
  const [status, setStatus] = useState<"idle" | "exporting" | "exported">("idle")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showParticles, setShowParticles] = useState(false)

  const handleExport = async () => {
    if (status === "idle") {
      setStatus("exporting")
      try {
        if (onExport) {
          await onExport()
        } else {
          // Simulate export if no onExport function is provided
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        setStatus("exported")
        setShowParticles(true)
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
        })
        
        setTimeout(() => {
          setStatus("idle")
          setShowParticles(false)
        }, 2000)
      } catch (error) {
        setStatus("idle")
        console.error("Export failed:", error)
      }
    }
  }

  return (
    <div className="relative">
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      <Button
        ref={buttonRef}
        onClick={handleExport}
        className={cn(
          "relative flex items-center gap-2 bg-primary hover:bg-primary/90",
          showParticles && "scale-95",
          "transition-transform duration-100",
          className
        )}
        disabled={status !== "idle"}
      >
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Download className="w-4 h-4" />
            </motion.span>
          )}
          {status === "exporting" && (
            <motion.span
              key="exporting"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                rotate: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
              }}
            >
              <Loader2 className="w-4 h-4" />
            </motion.span>
          )}
          {status === "exported" && (
            <motion.span
              key="exported"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Check className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {status === "idle" ? text.idle : status === "exporting" ? text.exporting : text.exported}
        </motion.span>
      </Button>
    </div>
  )
} 