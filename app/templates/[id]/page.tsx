"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { PageTransition } from "@/components/animations/PageTransition"
import { CV_TEMPLATES } from "@/data/templates"
import { CVTemplate, DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, FileText, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/animations/FadeIn"
import { useRouter } from "next/navigation"
import { CVPreview } from "@/components/CVPreview"
import { DEFAULT_CV } from "@/data/defaultCV"
import { CVProvider } from "@/contexts/CVContext"
import * as React from "react"
import { createCV, getSupabaseClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { PaywallModal } from "@/components/PaywallModal"

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default function TemplatePreviewPage({ params }: PreviewPageProps) {
  const router = useRouter()
  // Använd React.use() för att packa upp params-objektet med explicit typning
  const resolvedParams = React.use(params as unknown as Promise<{id: string}>)
  const { id } = resolvedParams
  const [template, setTemplate] = useState<CVTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { isFreePlan } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)
  
  const MAX_FREE_CVS = 3

  // Kontrollera om den aktuella mallen är en premium-mall
  const isPremiumTemplate = (): boolean => {
    return template?.isPremium === true;
  }

  useEffect(() => {
    // Hitta mallen från CV_TEMPLATES
    const foundTemplate = CV_TEMPLATES.find(t => t.id === id)
    
    if (foundTemplate) {
      setTemplate(foundTemplate)
    } else {
      // Om mallen inte hittas, kolla i databasen (för användarens egna mallar)
      // Detta skulle implementeras i en riktig applikation
      console.error('Template not found:', id)
    }
    
    // Kontrollera användarens autentiseringsstatus
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
      }
    }
    
    checkAuth()
    setLoading(false)
  }, [id])

  // Skapa en kopia av standardCV:t med den valda mallen
  const previewCV = {
    ...DEFAULT_CV,
    templateId: template?.id || "standard",
    colorScheme: template?.colorScheme || DEFAULT_COLOR_SCHEME
  }
  
  // Hantera skapande av CV direkt från mallens förhandsgranskning
  const handleCreateCV = async () => {
    if (!user) {
      toast.error("Du måste vara inloggad för att skapa ett CV")
      router.push("/auth/signin?redirect=" + encodeURIComponent(`/templates/${id}`))
      return
    }
    
    if (!template) {
      toast.error("Ingen mall vald")
      return
    }
    
    try {
      setCreating(true)
      
      // Kontrollera om användaren är på gratisplanen och redan har nått max antal CV:n
      if (isFreePlan()) {
        // Hämta användarens nuvarande antal CV:n
        const supabase = getSupabaseClient()
        const { data: userCVs, error: cvError } = await supabase
          .from('cvs')
          .select('id')
          .eq('user_id', user.id)
        
        if (cvError) {
          console.error("Fel vid hämtning av användarens CV:n:", cvError)
          toast.error("Kunde inte kontrollera dina CV:n")
          setCreating(false)
          return
        }
        
        if (userCVs && userCVs.length >= MAX_FREE_CVS) {
          // Visa paywall-modalen istället för felmeddelandet
          setCreating(false)
          setShowPaywall(true)
          return
        }
      }
      
      // Skapa tomt CV med bara grundstruktur och mall-inställningar
      const { data, error } = await createCV(user.id, {
        title: "Nytt CV",
        template_id: template.id,
        content: {
          templateId: template.id, // Spara mallens ID
          colorScheme: template.colorScheme, // Använd mallens färgschema
          
          // Skapa tom personalInfo
          personalInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            postalCode: "",
            title: "",
            website: "",
            summary: ""
          },
          
          // Skapa tomma grundsektioner baserat på mall-typ
          sections: [
            {
              id: uuidv4(),
              type: "experience",
              title: "Arbetslivserfarenhet",
              items: []
            },
            {
              id: uuidv4(),
              type: "education",
              title: "Utbildning",
              items: []
            },
            {
              id: uuidv4(),
              type: "skills",
              title: "Kompetenser",
              items: []
            }
          ]
        }
      })
      
      if (error) {
        console.error("Fel vid skapande av CV:", error)
        toast.error("Kunde inte skapa nytt CV")
        setCreating(false)
        return
      }
      
      // Navigera direkt till editor med det nya CV-id:t
      const newCvId = data[0].id
      router.push(`/editor/${newCvId}`)
    } catch (error) {
      console.error("Fel vid skapande av CV:", error)
      toast.error("Kunde inte skapa nytt CV")
      setCreating(false)
    }
  }
  
  return (
    <CVProvider initialCV={previewCV}> {/* Skicka med previewCV som initialCV istället för att försöka hämta från databas */}
      <Navbar />
      <PageTransition>
        <div className="container py-10">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka
            </Button>
            
            {loading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <h1 className="text-3xl font-bold">{template?.name || "Mall saknas"}</h1>
            )}
          </div>
          
          {loading ? (
            <div className="w-full flex justify-center py-20">
              <div className="w-full max-w-3xl aspect-[210/297] bg-muted/30 rounded-md animate-pulse" />
            </div>
          ) : template ? (
            <FadeIn>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-3xl shadow-lg rounded-md overflow-hidden">
                    <CVPreview />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
                    <p className="text-muted-foreground">{template.description}</p>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-3">
                    <h3 className="font-medium">Mallinformation</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Layout:</div>
                      <div className="font-medium capitalize">{template.layout}</div>
                      
                      <div>Typsnitt rubriker:</div>
                      <div className="font-medium">{template.fontSettings?.headingFont || "Standard"}</div>
                      
                      <div>Typsnitt text:</div>
                      <div className="font-medium">{template.fontSettings?.bodyFont || "Standard"}</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Färgschema</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(template.colorScheme).map(([key, color]) => (
                        <div key={key} className="flex flex-col items-center">
                          <div 
                            className="w-10 h-10 rounded-full border shadow-sm" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full mt-6"
                    onClick={handleCreateCV}
                    disabled={creating || (isPremiumTemplate() && isFreePlan())}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Skapa CV med denna mall
                      </>
                    )}
                  </Button>
                  
                  <Link href="/templates/all" passHref>
                    <Button variant="outline" size="lg" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Se alla mallar
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">
                Kunde inte hitta mallen
              </h2>
              <p className="text-muted-foreground mb-8">
                Den mall du söker finns inte eller har tagits bort.
              </p>
              <Link href="/templates/all" passHref>
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Se alla tillgängliga mallar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PageTransition>
      
      {/* Paywall modal */}
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        type="cvLimit"
        title="Uppgradera för att skapa fler CV:n"
        description={`Gratisversionen tillåter max ${MAX_FREE_CVS} CV:n. Uppgradera för att skapa fler och få tillgång till premiummallar.`}
      />
    </CVProvider>
  )
} 