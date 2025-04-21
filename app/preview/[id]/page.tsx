"use client"

import { CVProvider } from "@/contexts/CVContext"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { EnhancedPreview } from "@/app/preview/components/EnhancedPreview"

export default function PreviewPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <CVProvider>
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        {isDesktop ? (
          <Sidebar className="sticky top-16 h-full" />
        ) : (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button 
                className="fixed z-20 left-4 top-20 p-2 rounded-full bg-primary text-white shadow-md"
                aria-label="Öppna meny"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        <div className="flex-1 overflow-auto">
          <EnhancedPreview />
        </div>
      </div>
    </CVProvider>
  )
}

