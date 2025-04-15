"use client"

import { ReactNode, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

interface AppLayoutProps {
  children: ReactNode
  hideFooter?: boolean
  hideNavbar?: boolean
}

export function AppLayout({ children, hideFooter = false, hideNavbar = false }: AppLayoutProps) {
  // Loggning för att hjälpa med felsökning
  useEffect(() => {
    console.log("AppLayout renderad med:", { hideFooter, hideNavbar })
  }, [hideFooter, hideNavbar])

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}
      <main>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
} 