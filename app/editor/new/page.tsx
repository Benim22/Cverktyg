"use client"

import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CVProvider } from "@/contexts/CVContext"
import { ArrowRight, FileText, Palette, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { motion } from "framer-motion"
import { createCV, getSupabaseClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { CV_TEMPLATES } from "@/data/templates"

// Ersätt hårdkodade mallar med CV_TEMPLATES
const templates = CV_TEMPLATES

export default function CreateCVPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || "")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/auth/signin")
        return
      }
      
      setUser(session.user)
    }
    
    checkAuth()
  }, [router])

  const handleCreateCV = async () => {
    if (!user) {
      toast.error("Du måste vara inloggad för att skapa ett CV")
      return
    }
    
    try {
      setLoading(true)
      
      // Skapa nytt CV i databasen
      const { data, error } = await createCV(user.id, {
        title: "Nytt CV",
        template_id: selectedTemplate || "default"
      })
      
      if (error) {
        console.error("Fel vid skapande av CV:", error)
        toast.error("Kunde inte skapa nytt CV")
        setLoading(false)
        return
      }
      
      // Navigera till editor med det nya CV-id:t
      const newCvId = data[0].id
      router.push(`/editor/${newCvId}?template=${selectedTemplate || 'default'}`)
    } catch (error) {
      console.error("Fel vid skapande av CV:", error)
      toast.error("Kunde inte skapa nytt CV")
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <CVProvider>
          <div className="container py-10">
            <FadeIn>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Skapa nytt CV</h1>
                <p className="mt-2 text-muted-foreground">Välj en mall för att komma igång eller börja från grunden</p>
              </div>
            </FadeIn>

            <div className="mx-auto max-w-4xl">
              <FadeIn delay={0.1}>
                <div className="mb-10 grid gap-6 md:grid-cols-2">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer border-2 transition-all hover:shadow-md ${selectedTemplate === "" ? "border-primary" : "border-border"}`}
                    onClick={() => setSelectedTemplate("")}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Börja från grunden
                        </CardTitle>
                        <CardDescription>Skapa ett helt anpassat CV från början</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-secondary/30">
                          <div className="flex h-full w-full items-center justify-center">
                            <Sparkles className="h-16 w-16 text-muted-foreground/40" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p className="text-sm text-muted-foreground">
                          Perfekt om du vill ha full kontroll över designen och innehållet
                        </p>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer border-2 transition-all hover:shadow-md ${selectedTemplate === "template-gallery" ? "border-primary" : "border-border"}`}
                    onClick={() => setSelectedTemplate("template-gallery")}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          Välj från galleri
                        </CardTitle>
                        <CardDescription>Utforska vårt galleri av professionella mallar</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {templates.slice(0, 4).map((template) => (
                            <div
                              key={template.id}
                              className="aspect-[3/4] w-full overflow-hidden rounded-md bg-secondary/30"
                            >
                              <Image
                                src={template.previewImage || "/placeholder.svg"}
                                alt={template.name}
                                width={100}
                                height={150}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p className="text-sm text-muted-foreground">
                          Bläddra bland våra professionellt designade mallar
                        </p>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>
              </FadeIn>

              {selectedTemplate === "template-gallery" && (
                <FadeIn delay={0.2}>
                  <div className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold">Välj en mall</h2>
                    <StaggerChildren>
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {templates.map((template) => (
                          <motion.div
                            key={template.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`cursor-pointer border-2 rounded-lg transition-all hover:shadow-md ${selectedTemplate === template.id ? "border-primary" : "border-border"}`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <Card className="h-full border-0">
                              <CardContent className="p-3">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-secondary/30">
                                  <Image
                                    src={template.previewImage || "/placeholder.svg"}
                                    alt={template.name}
                                    width={200}
                                    height={300}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <h3 className="mt-2 font-medium">{template.name}</h3>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </StaggerChildren>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.3}>
                <div className="flex justify-center">
                  <AnimatedButton 
                    size="lg" 
                    onClick={handleCreateCV} 
                    className="gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      <>
                        Fortsätt
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </AnimatedButton>
                </div>
              </FadeIn>
            </div>
          </div>
        </CVProvider>
      </PageTransition>
    </>
  )
}

