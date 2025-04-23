"use client"

import { useState } from "react"
import { use } from "react"
import { Navbar } from "@/components/Navbar"
import { MetaTags } from "@/components/MetaTags"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { CV_TEMPLATES } from "@/data/templates"
import { ArrowLeft, Palette, ArrowRight, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCV, CVProvider } from "@/contexts/CVContext"
import { PDFTemplateDisplay } from "@/components/PDFTemplateDisplay"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import defaultCV from "@/data"

export default function TemplateDetailWrapper({ params }: { params: { id: string } }) {
  // Använd React.use för att hantera params som ett Promise
  const resolvedParams = use(params);
  
  return (
    <CVProvider initialCV={defaultCV}>
      <TemplateDetail params={resolvedParams} />
    </CVProvider>
  )
}

function TemplateDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isChanging, setIsChanging] = useState(false)
  const { currentCV, setTemplate } = useCV()
  const template = CV_TEMPLATES.find(t => t.id === params.id)
  
  // Hitta nästa och föregående mall för navigation
  const templateIndex = CV_TEMPLATES.findIndex(t => t.id === params.id)
  const prevTemplate = templateIndex > 0 ? CV_TEMPLATES[templateIndex - 1] : null
  const nextTemplate = templateIndex < CV_TEMPLATES.length - 1 ? CV_TEMPLATES[templateIndex + 1] : null
  
  if (!template) {
    return (
      <>
        <Navbar />
        <PageTransition>
          <div className="container py-10">
            <FadeIn>
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-6">Mallen hittades inte</h1>
                <AnimatedButton asChild>
                  <Link href="/templates/all">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tillbaka till mallar
                  </Link>
                </AnimatedButton>
              </div>
            </FadeIn>
          </div>
        </PageTransition>
      </>
    )
  }
  
  // Funktion för att välja denna mall
  const handleSelectTemplate = async () => {
    try {
      setIsChanging(true)
      
      if (currentCV) {
        await setTemplate(template.id)
        
        toast.success("Mallen har ändrats", {
          description: "Ditt CV har uppdaterats med den nya mallen",
          action: {
            label: "Visa CV",
            onClick: () => router.push("/editor")
          }
        })
      } else {
        // Om inget CV finns visar vi bara ett meddelande om att de måste skapa ett först
        toast.info("Skapa ett CV först", {
          description: "Du måste skapa ett CV innan du kan ändra mall",
          action: {
            label: "Skapa CV",
            onClick: () => router.push("/dashboard")
          }
        })
      }
    } catch (error) {
      toast.error("Något gick fel", {
        description: "Kunde inte ändra mall, försök igen senare"
      })
    } finally {
      setIsChanging(false)
    }
  }
  
  const isCurrentTemplate = currentCV?.templateId === template.id
  
  return (
    <>
      <MetaTags 
        title={`${template.name} CV-mall - Professionell CV-design`}
        description={`${template.description}. Använd denna mall för att skapa ett professionellt CV som hjälper dig att sticka ut bland andra sökande.`}
        keywords={`${template.name} cv-mall, ${template.category} cv-design, professionell cv-mall, ${template.id} cv-mall`}
        ogUrl={`https://cverktyg.se/templates/${template.id}`}
      />
      <Navbar />
      <PageTransition>
        <div className="container py-10">
          <FadeIn>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link 
                    href="/templates/all" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 inline mr-1" />
                    Mallar
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <h1 className="text-xl font-semibold">{template.name}</h1>
                  {template.isPremium && (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 15,
                        delay: 0.3
                      }}
                      className="ml-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 rounded-full flex items-center"
                    >
                      Premium
                    </motion.div>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {template.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSelectTemplate}
                  disabled={isChanging || isCurrentTemplate}
                  className="min-w-36"
                >
                  {isChanging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ändrar...
                    </>
                  ) : isCurrentTemplate ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Aktiv mall
                    </>
                  ) : (
                    "Använd denna mall"
                  )}
                </Button>
              </div>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FadeIn delay={0.1}>
                <PDFTemplateDisplay templateId={template.id} />
              </FadeIn>
            </div>
            
            <div>
              <FadeIn delay={0.2}>
                <div className="sticky top-20 space-y-6">
                  <div className="rounded-lg border bg-card shadow-sm">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Mallinformation</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Mall-ID</h4>
                        <p className="text-sm text-muted-foreground">{template.id}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Layout</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.layout === "standard" ? "Standard" :
                           template.layout === "modern" ? "Modern" :
                           template.layout === "minimalist" ? "Minimalistisk" :
                           template.layout === "creative" ? "Kreativ" :
                           template.layout === "professional" ? "Professionell" :
                           template.layout === "executive" ? "Executive" :
                           template.layout === "academic" ? "Akademisk" :
                           template.layout === "technical" ? "Teknisk" :
                           template.layout}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Kategori</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.category === "business" ? "Företag" :
                           template.category === "creative" ? "Kreativ" :
                           template.category === "academic" ? "Akademisk" :
                           template.category === "technical" ? "Teknisk" :
                           template.category}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Typsnitt</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Rubriker: {template.fontSettings?.headingFont?.split(",")[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Brödtext: {template.fontSettings?.bodyFont?.split(",")[0]}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Färgschema</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: template.colorScheme.primaryColor }}
                            title="Primärfärg"
                          />
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: template.colorScheme.secondaryColor }}
                            title="Sekundärfärg"
                          />
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: template.colorScheme.accentColor }}
                            title="Accentfärg"
                          />
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: template.colorScheme.backgroundColor }}
                            title="Bakgrundsfärg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    {prevTemplate ? (
                      <AnimatedButton variant="outline" asChild size="sm">
                        <Link href={`/templates/${prevTemplate.id}`}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          {prevTemplate.name}
                        </Link>
                      </AnimatedButton>
                    ) : <div />}
                    
                    {nextTemplate && (
                      <AnimatedButton variant="outline" asChild size="sm">
                        <Link href={`/templates/${nextTemplate.id}`}>
                          {nextTemplate.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </AnimatedButton>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  )
}