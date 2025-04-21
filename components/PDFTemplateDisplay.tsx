"use client"

import { useState, useEffect } from "react"
import { useCV } from "@/contexts/CVContext"
import { CV_TEMPLATES } from "@/data/templates"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { FileText } from "lucide-react"
import defaultCV from "@/data/defaultCV"

// Importera våra nya mallar
import { CVTemplates } from "@/app/templates/pdf"

interface PDFTemplateDisplayProps {
  templateId: string
}

export function PDFTemplateDisplay({ templateId }: PDFTemplateDisplayProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(Date.now())
  const { toast } = useToast()
  const { currentCV } = useCV()
  
  // Template-specifik information
  const template = CV_TEMPLATES.find(t => t.id === templateId)
  
  // Skapa en kopia av currentCV eller använd defaultCV om inget CV finns
  const displayCV = currentCV ? { ...currentCV, templateId } : { ...defaultCV, templateId }
  
  // Vi måste använda useEffect för att undvika hydration-problem med React-PDF
  useEffect(() => {
    setIsClient(true)
    // Generera en ny nyckel för att tvinga en omladdning av iframe
    setIframeKey(Date.now())
  }, [templateId])
  
  // Hitta rätt mall-komponent
  const TemplateComponent = templateId ? 
    CVTemplates[templateId as keyof typeof CVTemplates] || CVTemplates.standard : 
    CVTemplates.standard;
  
  if (!template) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
        <p>Mallen hittades inte.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border shadow-sm bg-card">
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-medium">{template.name} förhandsgranskning</h3>
        </div>
        
        <div className="bg-background p-6">
          <div className="bg-muted rounded-lg overflow-hidden aspect-[1/1.4] flex items-center justify-center">
            {!isClient ? (
              <div className="w-full h-full p-8 space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-3 relative">
                <iframe 
                  key={iframeKey}
                  src={`/api/preview-pdf?templateId=${templateId}`}
                  className="w-full h-full border-0"
                  title={`${template.name} Preview`}
                  onLoad={() => setIsLoading(false)}
                  style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Laddar förhandsgranskning...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-card flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          
          {isClient && (
            <PDFDownloadLink
              document={<TemplateComponent cv={displayCV} />}
              fileName={`${template.name}_Mall.pdf`}
              className="hidden"
            >
              {({ blob, url, loading, error }) => (
                <Button 
                  variant="default" 
                  onClick={() => {
                    if (!error) {
                      toast({
                        title: "Exempel på mallen har laddats ner",
                        description: "Du kan nu titta på PDF-filen för att se hur mallen ser ut.",
                      })
                    } else {
                      toast({
                        title: "Något gick fel",
                        description: "Kunde inte ladda ner PDF-filen. Försök igen.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={loading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ladda ner exempel
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>
      
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
        <p className="text-sm">
          <strong>Tips:</strong> Denna mall fungerar bäst för {
            template.category === "business" ? "affärsroller och traditionella branscher" :
            template.category === "creative" ? "kreativa branscher och designroller" :
            template.category === "academic" ? "akademiska roller och forskningspositioner" :
            "tekniska roller och ingenjörspositioner"
          }.
        </p>
      </div>
    </div>
  )
} 