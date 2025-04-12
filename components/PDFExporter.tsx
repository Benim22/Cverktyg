"use client"

import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/animations/LoadingSpinner"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { PaywallModal } from "@/components/PaywallModal"

export function PDFExporter() {
  const { currentCV } = useCV()
  const { isFreePlan, canExportWithoutWatermark } = useSubscription()
  const [isExporting, setIsExporting] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const { toast } = useToast()

  const handleExportClick = () => {
    if (!currentCV) {
      toast({
        title: "Fel",
        description: "Inget CV att exportera",
        variant: "destructive",
      })
      return
    }

    // Kontrollera om användaren har behörighet att exportera utan vattenstämpel
    if (!canExportWithoutWatermark()) {
      setShowPaywall(true)
    } else {
      // Om användaren har behörighet, fortsätt direkt till export
      handleExport(false)
    }
  }

  const handleExport = async (withWatermark = false) => {
    if (!currentCV) {
      toast({
        title: "Fel",
        description: "Inget CV att exportera",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Hitta CV-elementet för att exportera
      const cvElement = document.querySelector(".cv-preview-container") as HTMLElement
      
      if (!cvElement) {
        throw new Error("Kunde inte hitta CV-elementet")
      }

      // Visa toast för att informera användaren
      toast({
        title: "Förbereder PDF",
        description: "Vänta medan vi skapar din PDF...",
      })

      // Temporärt dölja färgredigeringsknappen
      const colorEditorButton = cvElement.querySelector(".color-editor-button") as HTMLElement
      if (colorEditorButton) {
        colorEditorButton.style.display = "none"
      }
      
      // Spara originalstilarna
      const originalPosition = cvElement.style.position
      const originalMaxHeight = cvElement.style.maxHeight
      const originalOverflow = cvElement.style.overflow
      
      // Tillfälligt ändra stilar för bättre rendering
      cvElement.style.position = "relative"
      cvElement.style.maxHeight = "none"
      cvElement.style.overflow = "visible"
      
      // Skapa en canvas från CV-elementet
      const canvas = await html2canvas(cvElement, {
        scale: 2, // Högre upplösning
        useCORS: true, // Tillåt bilder från andra domäner
        logging: false,
        backgroundColor: null,
      })
      
      // Återställ originalstilarna
      cvElement.style.position = originalPosition
      cvElement.style.maxHeight = originalMaxHeight
      cvElement.style.overflow = originalOverflow
      
      // Återställ färgredigeringsknappen
      if (colorEditorButton) {
        colorEditorButton.style.display = ""
      }

      // Skapa en kopia av canvas för att inte påverka originalet
      const canvasCopy = document.createElement('canvas');
      canvasCopy.width = canvas.width;
      canvasCopy.height = canvas.height;
      const ctx = canvasCopy.getContext('2d');
      
      if (!ctx) {
        throw new Error("Kunde inte skapa canvas-kontext");
      }
      
      // Kopiera innehållet från originalcanvas
      ctx.drawImage(canvas, 0, 0);
      
      // Lägg till vattenstämpel om användaren använder gratisplanen och valt att fortsätta med vattenstämpel
      if (withWatermark) {
        // Ställ in vattenstämpeltext
        ctx.save();
        
        // Semitransparent grå färg
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Rotera och rita vattenstämpel
        ctx.translate(canvasCopy.width / 2, canvasCopy.height / 2);
        ctx.rotate(-Math.PI / 4); // Rotera -45 grader
        
        // Rita texten flera gånger för att täcka hela dokumentet
        for (let i = -4; i <= 4; i++) {
          ctx.fillText('CV VERKTYG DEMO', 0, i * 200);
        }
        
        ctx.restore();
      }

      // Skapa en ny PDF med A4-format (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      
      // Beräkna proportioner för att anpassa canvas till A4-storlek
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvasCopy.height * imgWidth) / canvasCopy.width
      
      // Få bilddata från canvas med vattenstämpel om nödvändigt
      const imgData = canvasCopy.toDataURL("image/png")
      
      // Om innehållet är högre än en A4-sida, dela upp det på flera sidor
      let heightLeft = imgHeight
      let position = 0
      
      // Lägg till första sidan
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Lägg till ytterligare sidor vid behov
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Spara PDF med personens namn
      const fileName = `${currentCV.personalInfo.firstName || "CV"}_${
        currentCV.personalInfo.lastName || ""
      }_CV.pdf`.replace(/\s/g, "_")
      
      // Om detta är en gratisexport med vattenstämpel, lägg till "_demo" i filnamnet
      const finalFileName = withWatermark 
        ? fileName.replace('.pdf', '_demo.pdf')
        : fileName;
      
      pdf.save(finalFileName)

      // Visa ett specifikt meddelande beroende på om det var med vattenstämpel eller inte
      if (withWatermark) {
        toast({
          title: "PDF exporterad med vattenstämpel",
          description: "Uppgradera din plan för att exportera utan vattenstämpel",
        })
      } else {
        toast({
          title: "PDF exporterad",
          description: "Din PDF har exporterats framgångsrikt",
        })
      }
    } catch (error) {
      console.error("Fel vid export:", error)
      toast({
        title: "Fel vid export",
        description: `Det gick inte att exportera PDF:en: ${error.message || "Okänt fel"}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button onClick={handleExportClick} disabled={isExporting || !currentCV} className="w-full">
          {isExporting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Exporterar...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportera som PDF
            </>
          )}
        </Button>
      </motion.div>
      
      {/* Visa bara PaywallModal för användare som inte kan exportera utan vattenstämpel */}
      {!canExportWithoutWatermark() && (
        <PaywallModal 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onContinueAnyway={() => handleExport(true)}
        />
      )}
    </>
  )
}

