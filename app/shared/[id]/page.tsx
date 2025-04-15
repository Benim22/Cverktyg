"use client"

import { useState, useEffect } from "react"
import { CVPreview } from "@/components/CVPreview"
import { PDFExporter } from "@/components/PDFExporter"
import { CVProvider } from "@/contexts/CVContext"
import { getPublicCV } from "@/lib/supabase-client"
import { Navbar } from "@/components/Navbar"
import { useParams, useSearchParams } from "next/navigation"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SharedCVPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const cvId = params?.id as string
  const source = searchParams?.get('source') || undefined

  const [cv, setCV] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Hämta CV:t som är markerat som publikt
        const { data, error } = await getPublicCV(cvId)
        
        if (error) {
          console.error("Fel vid hämtning av publikt CV:", error)
          setError("Kunde inte hitta det begärda CV:t eller så är det inte delat publikt.")
          return
        }
        
        if (!data) {
          setError("CV:t hittades inte eller så är det inte längre tillgängligt.")
          return
        }
        
        // Konvertera databasens format till appens interna format
        const cvData = data.content || {}
        setCV({
          id: data.id,
          title: data.title || "Namnlöst CV",
          personalInfo: cvData.personalInfo || {},
          sections: cvData.sections || [],
          colorScheme: cvData.colorScheme || {},
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          templateId: cvData.templateId || "standard",
        })
      } catch (err) {
        console.error("Fel vid hämtning av CV:", err)
        setError("Ett oväntat fel inträffade. Försök igen senare.")
      } finally {
        setLoading(false)
      }
    }
    
    if (cvId) {
      fetchCV()
    }
  }, [cvId])

  // Social media source tracking
  const socialSource = source === 'facebook' ? 'Facebook' 
    : source === 'linkedin' ? 'LinkedIn' 
    : source === 'twitter' ? 'Twitter'
    : undefined;

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container py-8">
          {socialSource && (
            <div className="mb-6">
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Delat via {socialSource}</AlertTitle>
                <AlertDescription>
                  Detta CV delades med dig via {socialSource}.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {loading ? (
            <div className="flex flex-col items-center space-y-8">
              <Skeleton className="h-10 w-64" />
              <div className="w-full max-w-3xl mx-auto">
                <Skeleton className="h-[500px] w-full" />
              </div>
              <div className="flex justify-center">
                <p className="text-muted-foreground flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Laddar CV...
                </p>
              </div>
            </div>
          ) : error ? (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                <div className="bg-muted/30 p-10 rounded-full">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold">{error}</h1>
                <p className="text-muted-foreground max-w-md">
                  CV:t du försöker visa är antingen inte längre tillgängligt eller inte markerat som offentligt.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/">
                      Gå till startsidan
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signin">
                      Logga in
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <CVProvider initialCV={cv}>
              <FadeIn>
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{cv?.title}</h1>
                    {cv?.personalInfo?.firstName && cv?.personalInfo?.lastName && (
                      <p className="text-muted-foreground">
                        {cv.personalInfo.firstName} {cv.personalInfo.lastName}
                        {cv.personalInfo.title && ` • ${cv.personalInfo.title}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <PDFExporter />
                  </div>
                </div>
                
                <div className="mx-auto max-w-3xl mb-8">
                  <CVPreview />
                </div>
                
                <div className="text-center mt-12 text-muted-foreground text-sm">
                  <p>Detta CV delades via CVerktyg - moderna CV verktyg för den moderna jobbsökaren</p>
                  <p className="mt-2">
                    <Link href="/" className="text-primary underline underline-offset-4">
                      Skapa ditt eget CV
                    </Link>
                  </p>
                </div>
              </FadeIn>
            </CVProvider>
          )}
        </div>
      </PageTransition>
    </>
  )
} 