"use client"

import { CVProvider } from "@/contexts/CVContext"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { PageTransition } from "@/components/animations/PageTransition"
import { useMediaQuery } from "@/hooks/use-media-query"
import { EnhancedEditor } from "@/app/editor/components/EnhancedEditor"
import { useParams } from "next/navigation"

export default function EditorPage() {
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
            <div className="container py-6 px-4">
              <EnhancedEditor />
            </div>
          </div>
        </div>
      </PageTransition>
    </CVProvider>
  )
}

