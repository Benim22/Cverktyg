"use client"

import { CVPreview } from "@/components/CVPreview"
import { PDFExporter } from "@/components/PDFExporter"
import { CVProvider } from "@/contexts/CVContext"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { useParams } from "next/navigation"

export default function PreviewPage() {
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
              <FadeIn>
                <div className="mb-6 flex items-center justify-between">
                  <AnimatedButton variant="outline" asChild>
                    <Link href={`/editor/${cvId}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Tillbaka till redigering
                    </Link>
                  </AnimatedButton>
                  <PDFExporter />
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="mx-auto max-w-3xl">
                  <CVPreview />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </PageTransition>
    </CVProvider>
  )
}

