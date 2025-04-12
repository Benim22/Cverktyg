"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { Card } from "@/components/ui/card"
import { AtSign, Calendar, Globe, MapPin, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { ColorEditor } from "@/components/ColorEditor"
import { StandardLayout, ModernLayout, MinimalistLayout, CreativeLayout, ProfessionalLayout } from "@/components/templates/TemplateLayouts"
import { CV_TEMPLATES } from "@/data/templates"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"

interface CVPreviewProps {
  cv?: CV
}

export function CVPreview({ cv }: CVPreviewProps) {
  const { currentCV, getColorValue, getTemplateById } = useCV()
  
  // Använd det angivna CV:t om det finns, annars använd currentCV från kontexten
  const cvToRender = cv || currentCV

  if (!cvToRender) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Ingen förhandsgranskning tillgänglig</p>
      </div>
    )
  }

  // Funktioner för att hämta färgvärden och mall när vi inte använder CVContext
  const getColorValueFromCV = (key: keyof typeof DEFAULT_COLOR_SCHEME): string => {
    if (cvToRender && cv) {
      // Om ett CV skickades in direkt
      const templateId = cvToRender.templateId;
      const template = CV_TEMPLATES.find(t => t.id === templateId);
      
      // Använd CVs färgschema om det finns, annars mallens färgschema, annars standard
      if (cvToRender.colorScheme && cvToRender.colorScheme[key]) {
        return cvToRender.colorScheme[key];
      } else if (template && template.colorScheme && template.colorScheme[key]) {
        return template.colorScheme[key];
      }
      return DEFAULT_COLOR_SCHEME[key];
    }
    
    // Annars använd CVContext-funktionen
    return getColorValue(key);
  }
  
  const getTemplateByIdFromCV = (templateId: string) => {
    if (cv) {
      // Om ett CV skickades in direkt
      return CV_TEMPLATES.find(template => template.id === templateId);
    }
    // Annars använd CVContext-funktionen
    return getTemplateById(templateId);
  }

  // Hämta aktuell mall
  const templateId = cvToRender.templateId || "standard"
  const template = getTemplateByIdFromCV(templateId)

  // Sätt font-family baserat på mall om tillgängligt
  const fontStyles = template?.fontSettings ? {
    fontFamily: template.fontSettings.bodyFont,
    "--heading-font": template.fontSettings.headingFont,
  } as React.CSSProperties : {}

  const { personalInfo, sections } = cvToRender
  const profileImage = personalInfo.profileImage

  // Beräkna profilbildstil
  const profileImageStyle = profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '4px',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 2}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValueFromCV("primaryColor")}`
      : 'none',
    background: profileImage.isTransparent ? 'transparent' : undefined,
  } : {}

  // Bakgrundsmönster för att visualisera transparens i redigeringsläge (inte längre behövs)
  const transparentBgStyle = {}

  // CSS-klass för att hantera transparent profilbild (inte längre behövs)
  const profileImageClass = ''

  return (
    <Card 
      className="relative h-full max-h-[842px] w-full overflow-auto shadow-md cv-preview-container"
      style={{ 
        backgroundColor: getColorValueFromCV("backgroundColor"),
        ...fontStyles 
      }}
    >
      {!cv && <ColorEditor />}  {/* Visa bara ColorEditor om det är från kontexten */}
      
      {/* Rendera olika layout beroende på mall */}
      {templateId === "modern" ? (
        <ModernLayout cv={cvToRender} profileImageStyle={profileImageStyle} profileImageClass={profileImageClass} transparentBgStyle={transparentBgStyle} />
      ) : templateId === "minimalist" ? (
        <MinimalistLayout cv={cvToRender} profileImageStyle={profileImageStyle} profileImageClass={profileImageClass} transparentBgStyle={transparentBgStyle} />
      ) : templateId === "creative" ? (
        <CreativeLayout cv={cvToRender} profileImageStyle={profileImageStyle} profileImageClass={profileImageClass} transparentBgStyle={transparentBgStyle} />
      ) : templateId === "professional" ? (
        <ProfessionalLayout cv={cvToRender} profileImageStyle={profileImageStyle} profileImageClass={profileImageClass} transparentBgStyle={transparentBgStyle} />
      ) : (
        <StandardLayout cv={cvToRender} profileImageStyle={profileImageStyle} profileImageClass={profileImageClass} transparentBgStyle={transparentBgStyle} />
      )}
    </Card>
  )
}

