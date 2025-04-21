"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { Card } from "@/components/ui/card"
import { AtSign, Calendar, Globe, MapPin, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { ColorEditor } from "@/components/ColorEditor"
import { StandardLayout } from "@/components/templates/TemplateLayouts"
import { CV_TEMPLATES } from "@/data/templates"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { usePathname } from "next/navigation"

interface CVPreviewProps {
  cv?: CV
}

export function CVPreview({ cv }: CVPreviewProps) {
  const { currentCV, getColorValue } = useCV()
  const cvData = cv || currentCV
  const isPreviewMode = usePathname()?.includes('/preview')
  
  if (!cvData) return null
  
  // Använd alltid StandardLayout
  const templateId = "standard";
  const template = CV_TEMPLATES.find(t => t.id === templateId);
  
  return (
    <div className="cv-preview-container relative">
      {!isPreviewMode && (
        <div className="absolute right-2 top-2 z-10">
          <ColorEditor buttonClassName="color-editor-button" />
        </div>
      )}
      
      <Card className="rounded-md overflow-hidden">
        <StandardLayout 
          cv={cvData} 
          profileImageStyle={{}}
          profileImageClass={""}
          transparentBgStyle={{}}
        />
      </Card>
    </div>
  )
}

