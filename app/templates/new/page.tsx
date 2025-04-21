"use client"

import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useCV } from "@/contexts/CVContext"
import { useState } from "react"

// Templatemallarna
const templates = [
  {
    id: "executive",
    name: "Executive",
    description: "Professionell design med elegant stil, perfekt för ledande befattningar",
    thumbnail: "/templates/executive-thumb.png",
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Ren och minimalistisk design inspirerad av nordisk stil",
    thumbnail: "/templates/nordic-thumb.png",
  },
  {
    id: "creative-pro",
    name: "Creative Pro",
    description: "Kreativ men professionell layout för kreativa branscher",
    thumbnail: "/templates/creative-pro-thumb.png",
  },
]

export default function TemplatesPage() {
  const { currentCV, setTemplate, saveCV } = useCV()
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsApplying(true)
    
    try {
      await setTemplate(templateId)
      await saveCV()
      
      // Visa bekräftelse
      setTimeout(() => {
        setIsApplying(false)
        setSelectedTemplate("")
      }, 1500)
    } catch (error) {
      console.error("Fel vid tillämpning av mall:", error)
      setIsApplying(false)
      setSelectedTemplate("")
    }
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container py-8 px-4">
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Nya CV-mallar</h1>
              <AnimatedButton variant="outline" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka till dashboard
                </Link>
              </AnimatedButton>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-lg text-muted-foreground mb-8">
              Välj en av våra nya professionella CV-mallar för att förbättra ditt CV:s utseende
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {templates.map((template, index) => (
              <FadeIn key={template.id} delay={0.1 * (index + 1)}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative pb-[140%]">
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                      <div className="flex justify-between">
                        <AnimatedButton 
                          onClick={() => handleApplyTemplate(template.id)}
                          disabled={isApplying && selectedTemplate === template.id}
                          className="w-full"
                        >
                          {isApplying && selectedTemplate === template.id 
                            ? "Tillämpar..." 
                            : "Välj mall"}
                        </AnimatedButton>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </PageTransition>
    </>
  )
} 