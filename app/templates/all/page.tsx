"use client"

import { Navbar } from "@/components/Navbar"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileText, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { AnimatedCard } from "@/components/animations/AnimatedCard"
import { CV_TEMPLATES } from "@/data/templates"
import { TemplateManager } from "@/components/templates/TemplateManager"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createCV, getSupabaseClient } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Kategori-mapping för mallar
const templateCategories = {
  "standard": "business",
  "modern": "business", 
  "minimalist": "creative",
  "creative": "creative",
  "professional": "business",
}

export default function TemplatesPage() {
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container py-10">
          <FadeIn>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">CV-mallar</h1>
              <p className="mt-2 text-muted-foreground">
                Välj bland våra professionellt designade CV-mallar för att skapa ditt perfekta CV
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Tabs defaultValue="gallery" className="mb-8">
              <TabsList className="mx-auto flex w-fit">
                <TabsTrigger value="gallery">Mallgalleri</TabsTrigger>
                <TabsTrigger value="manager">Mallhanterare</TabsTrigger>
              </TabsList>
              
              {/* Mallgalleri */}
              <TabsContent value="gallery" className="mt-6">
                <Tabs defaultValue="all" className="mb-8">
                  <TabsList className="mx-auto flex w-fit">
                    <TabsTrigger value="all">Alla</TabsTrigger>
                    <TabsTrigger value="business">Företag</TabsTrigger>
                    <TabsTrigger value="creative">Kreativa</TabsTrigger>
                    <TabsTrigger value="academic">Akademiska</TabsTrigger>
                    <TabsTrigger value="technical">Tekniska</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-6">
                    <StaggerChildren>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {CV_TEMPLATES.map((template) => (
                          <TemplateCard key={template.id} template={template} />
                        ))}
                      </div>
                    </StaggerChildren>
                  </TabsContent>
                  {["business", "creative", "academic", "technical"].map((category) => (
                    <TabsContent key={category} value={category} className="mt-6">
                      <StaggerChildren>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {CV_TEMPLATES
                            .filter((t) => templateCategories[t.id as keyof typeof templateCategories] === category)
                            .map((template) => (
                              <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                      </StaggerChildren>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
              
              {/* Mallhanterare */}
              <TabsContent value="manager" className="mt-6">
                <TemplateManager />
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </PageTransition>
    </>
  )
}

function TemplateCard({ template }: { template: (typeof CV_TEMPLATES)[0] }) {
  const [imageError, setImageError] = useState(false)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  // Funktion för att skapa ett nytt CV med den valda mallen
  const handleCreateCV = async () => {
    try {
      setCreating(true)
      
      // Kontrollera användarens autentiseringsstatus
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Du måste vara inloggad för att skapa ett CV")
        router.push("/auth/signin?redirect=" + encodeURIComponent(`/templates/all`))
        setCreating(false)
        return
      }
      
      // Skapa tomt CV med bara grundstruktur och mall-inställningar
      const { data, error } = await createCV(session.user.id, {
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

  // Generera en professionell förhandsgranskning baserad på malltyp
  const generatePreviewBackground = () => {
    const baseClass = "w-full h-full absolute inset-0 flex flex-col p-4 bg-background border rounded-md overflow-hidden"
    
    switch (template.id.toLowerCase()) {
      case "modern":
        return (
          <div className={baseClass}>
            {/* Lyxig modern layout med gradient och tydlig sidopanel */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-b from-blue-600 to-blue-800"></div>
            <div className="absolute top-8 left-4 h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100"></div>
            </div>
            <div className="ml-[38%] pt-8">
              <div className="w-3/4 h-5 bg-gray-800 mb-2 rounded-sm"></div>
              <div className="w-1/2 h-3 bg-blue-500 mb-6 rounded-sm"></div>
              
              <div className="w-full h-px bg-gray-200 my-4"></div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-32 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-40 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-36 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-44 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "minimalist":
        return (
          <div className={baseClass}>
            {/* Elegant minimalistisk layout med exklusiv typografi */}
            <div className="h-full w-full flex flex-col items-center pt-12 bg-[#fcfcfc]">
              <div className="w-40 h-[0.5px] bg-black/70 mb-2"></div>
              <div className="text-center">
                <div className="h-5 w-48 bg-black mx-auto mb-2 rounded-sm"></div>
                <div className="h-3 w-32 bg-gray-400 mx-auto mb-6 rounded-sm"></div>
              </div>
              <div className="w-24 h-[0.5px] bg-black/30 mb-8"></div>
              
              <div className="w-4/5 max-w-xs space-y-5">
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                </div>
                
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )
      case "creative":
        return (
          <div className={baseClass}>
            {/* Innovativ kreativ layout med diagonal design och starka färger */}
            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute -top-20 -left-20 h-64 w-96 rounded-[40%] rotate-12 bg-gradient-to-br from-purple-600 to-pink-500 opacity-25"></div>
              
              <div className="relative p-6 pt-8">
                <div className="mb-4">
                  <div className="h-6 w-48 bg-purple-800 rounded-sm mb-1"></div>
                  <div className="h-3 w-36 bg-pink-500 rounded-sm"></div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 mt-8">
                  <div className="w-full md:w-3/5 space-y-5">
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-32 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[180px] bg-gray-600 rounded-sm"></div>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-28 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[150px] bg-gray-600 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "professional":
        return (
          <div className={baseClass}>
            {/* Premiumlayout för företagsledare med sofistikerad design */}
            <div className="h-full w-full">
              <div className="h-24 bg-gradient-to-r from-blue-950 to-blue-900 p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-40 bg-white rounded-sm mb-1"></div>
                    <div className="h-3 w-28 bg-blue-300 rounded-sm"></div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/90 border-2 border-white shadow-lg"></div>
                </div>
              </div>
              
              <div className="p-4 mt-8">
                <div className="mb-5">
                  <div className="h-3.5 w-28 bg-gray-800 font-bold mb-2 rounded-sm"></div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <div className="h-3 w-28 bg-gray-700 rounded-sm"></div>
                      <div className="h-2 w-24 bg-gray-500 rounded-sm"></div>
                    </div>
                    <div className="h-2 w-40 bg-blue-600 rounded-sm mb-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "standard":
      default:
        return (
          <div className={baseClass}>
            {/* Klassisk standardlayout med tydlig struktur */}
            <div className="h-full w-full">
              <div className="h-28 bg-gray-100 p-6 border-b">
                <div className="h-6 w-48 bg-gray-800 mb-2 rounded-sm"></div>
                <div className="h-3 w-36 bg-gray-500 mb-1 rounded-sm"></div>
                <div className="h-3 w-48 bg-gray-400 rounded-sm"></div>
              </div>
              
              <div className="p-6">
                <div className="h-4 w-32 bg-gray-700 mb-3 rounded-sm"></div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-48 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-40 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-44 bg-gray-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <AnimatedCard className="overflow-hidden">
      <div className="aspect-[3/4] w-full overflow-hidden bg-secondary/30 relative">
        {template.previewImage && !imageError ? (
          <Image
            src={template.previewImage}
            alt={template.name}
            width={300}
            height={400}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {generatePreviewBackground()}
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <AnimatedButton variant="outline" asChild>
          <Link href={`/templates/${template.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Förhandsgranska
          </Link>
        </AnimatedButton>
        <AnimatedButton onClick={handleCreateCV} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Skapar...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Använd mall
            </>
          )}
        </AnimatedButton>
      </CardFooter>
    </AnimatedCard>
  )
}

