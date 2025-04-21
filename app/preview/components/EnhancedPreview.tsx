"use client"

import { useCV } from "@/contexts/CVContext"
import { ArrowLeft, Download, Share, Copy, Check } from "lucide-react"
import Link from "next/link"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { A4CVPreview } from "@/components/A4CVPreview"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ReactPDFExporter } from "@/components/ReactPDFExporter"
import { useToast } from "@/components/ui/use-toast"
import confetti from 'canvas-confetti'

export function EnhancedPreview() {
  const { currentCV } = useCV()
  const params = useParams()
  const cvId = params?.id as string
  const [isShareLinkCopied, setIsShareLinkCopied] = useState(false)
  const { toast } = useToast()
  const downloadButtonRef = useRef<HTMLButtonElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Håll koll på om PDF har laddats ner
  const [hasPdfDownloaded, setHasPdfDownloaded] = useState(false)

  // Funktion för att trigga konfetti-animation
  const triggerConfetti = () => {
    if (!downloadButtonRef.current) return
    
    // Hämta positionen för nedladdningsknappen
    const buttonRect = downloadButtonRef.current.getBoundingClientRect()
    const x = buttonRect.x + buttonRect.width / 2
    const y = buttonRect.y + buttonRect.height / 2

    // Konfetti-inställningar
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { 
        x: x / window.innerWidth, 
        y: y / window.innerHeight 
      },
      colors: ['#1e293b', '#334155', '#0f172a', '#c2410c', '#0284c7'],
      disableForReducedMotion: true,
    })
    
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  // Callback när PDF har laddats ner
  const handlePdfDownloaded = () => {
    triggerConfetti()
    setHasPdfDownloaded(true)
    
    toast({
      title: "CV exporterad!",
      description: "Ditt CV har exporterats och laddats ner framgångsrikt.",
    })
  }

  // Kopiera delningslänk
  const handleCopyShareLink = () => {
    const shareLink = `${window.location.origin}/preview/${cvId}`
    
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setIsShareLinkCopied(true)
        toast({
          title: "Länk kopierad!",
          description: "Delningslänken har kopierats till urklipp",
        })
        
        // Återställ ikonen efter 2 sekunder
        setTimeout(() => {
          setIsShareLinkCopied(false)
        }, 2000)
      })
      .catch(err => {
        console.error("Kunde inte kopiera länk: ", err)
        toast({
          title: "Kunde inte kopiera länk",
          description: "Ett fel uppstod när länken skulle kopieras",
          variant: "destructive"
        })
      })
  }

  if (!currentCV) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-muted-foreground">Laddar CV-data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container py-6 px-4">
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center">
              <Link href={`/editor/${cvId}`} className="mr-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{currentCV.title || "CV Förhandsvisning"}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Förhandsgranska och exportera ditt CV
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyShareLink}
                      className="rounded-full"
                    >
                      {isShareLinkCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Share className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kopiera delningslänk</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* PDF-exportknapp med konfetti-effekt */}
              <div ref={downloadButtonRef} className="relative inline-flex">
                <div className="w-full">
                  <ReactPDFExporter onPdfDownloaded={handlePdfDownloaded} />
                </div>
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Animerad ring-effekt */}
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <div className="max-w-5xl mx-auto bg-card rounded-lg shadow-sm border p-6 preview-container-wrapper">
            <motion.div
              className="preview-zoom-container"
              transition={{ duration: 0.3 }}
            >
              <A4CVPreview className="w-full" />
            </motion.div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Detta är en exakt representation av hur ditt CV kommer att se ut i A4-format.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Använd <span className="font-medium">Ladda ner</span>-knappen för att exportera ditt CV.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
} 