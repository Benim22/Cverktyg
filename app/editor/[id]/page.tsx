"use client"

import { CVEditor } from "@/components/CVEditor"
import { CVPreview } from "@/components/CVPreview"
import { PDFExporter } from "@/components/PDFExporter"
import { CVProvider } from "@/contexts/CVContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<string>("editor")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const params = useParams()
  const cvId = params?.id as string

  return (
    <CVProvider>
      <Navbar />
      <PageTransition>
        <div className="flex h-[calc(100vh-4rem)]">
          {isDesktop && <Sidebar />}
          <div className="flex-1 overflow-auto">
            <div className="container py-6">
              {isDesktop ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FadeIn>
                    <div className="space-y-6">
                      <CVEditor />
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <div className="sticky top-6 space-y-4">
                      <h2 className="text-xl font-semibold">Förhandsgranskning</h2>
                      <motion.div
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        transition={{ duration: 0.3 }}
                      >
                        <CVPreview />
                      </motion.div>
                      <PDFExporter />
                    </div>
                  </FadeIn>
                </div>
              ) : (
                <>
                  {!isDesktop && (
                    <FadeIn>
                      <div className="mb-4 flex justify-between">
                        <h1 className="text-2xl font-bold">
                          {activeTab === "editor" ? "Redigera CV" : "Förhandsgranskning"}
                        </h1>
                      </div>
                    </FadeIn>
                  )}
                  <FadeIn delay={0.1}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="editor">Redigera</TabsTrigger>
                        <TabsTrigger value="preview">Förhandsgranskning</TabsTrigger>
                      </TabsList>
                      <TabsContent value="editor" className="mt-4">
                        <CVEditor />
                      </TabsContent>
                      <TabsContent value="preview" className="mt-4 space-y-4">
                        <CVPreview />
                        <PDFExporter />
                      </TabsContent>
                    </Tabs>
                  </FadeIn>
                </>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </CVProvider>
  )
}

