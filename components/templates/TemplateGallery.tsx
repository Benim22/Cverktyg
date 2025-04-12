"use client"

import { TemplateCard } from "@/components/templates/TemplateCard"
import { CV_TEMPLATES } from "@/data/templates"
import { useCV } from "@/contexts/CVContext"
import type { CVTemplate } from "@/types/cv"
import { FadeIn } from "@/components/animations/FadeIn"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Palette } from "lucide-react"

export function TemplateGallery() {
  const { currentCV, setTemplate } = useCV()
  const currentTemplateId = currentCV?.templateId || "standard"

  const handleSelectTemplate = (template: CVTemplate) => {
    setTemplate(template.id)
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <InfoIcon className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Välj en mall för att ändra utseendet på ditt CV. 
          Varje mall har en unik layout, färgschema och typografi optimerad för olika behov.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CV_TEMPLATES.map((template, index) => (
          <FadeIn key={template.id} delay={0.05 * index}>
            <TemplateCard
              template={template}
              isSelected={currentTemplateId === template.id}
              onSelect={() => handleSelectTemplate(template)}
            />
          </FadeIn>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p className="flex items-center">
          <Palette className="mr-2 h-4 w-4 text-primary" />
          <span>Tips: Efter att du valt en mall kan du anpassa färgerna genom att klicka på färgpaletten i förhandsgranskningen.</span>
        </p>
      </div>
    </div>
  )
} 