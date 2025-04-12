"use client"

import { useEffect, useRef } from "react"
import { type CV } from "@/lib/supabase-client"

interface CVThumbnailProps {
  cv: CV
  width?: number
  height?: number
}

export function CVThumbnail({ cv, width = 300, height = 128 }: CVThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Hantera pixeldensitet för skärmar med hög upplösning
    const devicePixelRatio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    
    ctx.scale(devicePixelRatio, devicePixelRatio)
    
    width = rect.width
    height = rect.height

    // Rensa canvas
    ctx.clearRect(0, 0, width, height)

    // Sätt bakgrundsfärg
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, width, height)

    // Hämta CV-data
    const title = cv.title || "Namnlöst CV"
    const updatedDate = new Date(cv.updated_at).toLocaleDateString("sv-SE")
    const content = cv.content || {}
    
    // Om CV saknar innehåll, visa en enkel fallback-design
    if (!content || Object.keys(content).length === 0) {
      // Rita en enkel bakgrund
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(0, 0, width, height)
      
      // Lägg till randigt mönster
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      for (let i = 0; i < height; i += 10) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }
      
      // Visa CV-titel
      ctx.font = "bold 16px sans-serif"
      ctx.fillStyle = "#333"
      ctx.textAlign = "center"
      ctx.fillText(title, width / 2, height / 2, width - 40)
      
      // Visa uppdateringsdatum
      ctx.font = "11px sans-serif"
      ctx.fillStyle = "#666"
      ctx.textAlign = "center"
      ctx.fillText(`Uppdaterad: ${updatedDate}`, width / 2, height / 2 + 20, width - 40)
      return
    }
    
    const personalInfo = content.personalInfo || {}
    const firstName = personalInfo.firstName || ""
    const lastName = personalInfo.lastName || ""
    const email = personalInfo.email || ""
    const sections = content.sections || []
    const sectionCount = sections.length
    
    // Färgschema
    const colorScheme = content.colorScheme || { 
      primaryColor: "#4f46e5", 
      secondaryColor: "#a78bfa",
      accentColor: "#8b5cf6"
    }
    
    // Rita sidoband med primärfärg
    ctx.fillStyle = colorScheme.primaryColor || "#4f46e5"
    ctx.fillRect(0, 0, 8, height)
    
    // Lägg till en subtil topp-dekoration
    ctx.fillStyle = colorScheme.secondaryColor || "#a78bfa"
    ctx.fillRect(8, 0, width - 8, 3)

    // Sätt textegenskaper för titel
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#333"
    ctx.textAlign = "left"
    ctx.fillText(title, 20, 30, width - 40)

    // Sätt textegenskaper för namn
    if (firstName || lastName) {
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#555"
      ctx.fillText(`${firstName} ${lastName}`, 20, 55, width - 40)
    }

    // Sätt textegenskaper för e-post
    if (email) {
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#777"
      ctx.fillText(email, 20, 75, width - 40)
    }
    
    // Visa antal sektioner
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#666"
    ctx.fillText(`${sectionCount} sektioner`, 20, 95, width - 40)

    // Sätt textegenskaper för uppdateringsdatum
    ctx.font = "11px sans-serif"
    ctx.fillStyle = "#999"
    ctx.fillText(`Uppdaterad: ${updatedDate}`, 20, height - 15, width - 40)

    // Rita små färgpunkter för att visualisera färgschemat
    const dotRadius = 5
    const startX = width - 70
    const dotY = height - 15
    
    // Rita primärfärg
    ctx.fillStyle = colorScheme.primaryColor || "#4f46e5"
    ctx.beginPath()
    ctx.arc(startX, dotY, dotRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Rita sekundärfärg
    ctx.fillStyle = colorScheme.secondaryColor || "#a78bfa"
    ctx.beginPath()
    ctx.arc(startX + 15, dotY, dotRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Rita accentfärg
    ctx.fillStyle = colorScheme.accentColor || "#8b5cf6"
    ctx.beginPath()
    ctx.arc(startX + 30, dotY, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }, [cv])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-32 rounded-md shadow-sm"
      style={{ display: 'block' }}
    />
  )
} 