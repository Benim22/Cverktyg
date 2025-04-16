"use client"

import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Download, Minimize, LayoutTemplate } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/animations/LoadingSpinner"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { PaywallModal } from "@/components/PaywallModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PDFExporter() {
  const { currentCV } = useCV()
  const { isFreePlan, canExportWithoutWatermark } = useSubscription()
  const [isExporting, setIsExporting] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [reduceSize, setReduceSize] = useState(false)
  const [autoAdjust, setAutoAdjust] = useState(false)
  const { toast } = useToast()
  
  // Nya state-variabler för vektorbaserad PDF-export
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfGenerationError, setPdfGenerationError] = useState<any>(null)

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

  // Funktion för att beräkna lämplig skalning baserat på CV-innehållets storlek
  const calculateOptimalScaling = (totalHeight: number, pageHeight: number): number => {
    // Beräkna hur många sidor CV:t skulle ta upp i originalstorlek
    const estimatedPages = Math.ceil(totalHeight / pageHeight)
    
    // Om CV:t ryms på en sida, behöver vi inte justera
    if (estimatedPages <= 1) return 1.0
    
    // Applicera en gradvis skalningsfaktor baserat på antal sidor
    // Ju fler sidor, desto mindre blir innehållet (men aldrig mindre än 45%)
    if (estimatedPages === 2) return 0.85       // 2 sidor -> 85% storlek
    else if (estimatedPages === 3) return 0.75  // 3 sidor -> 75% storlek
    else if (estimatedPages === 4) return 0.65  // 4 sidor -> 65% storlek
    else if (estimatedPages === 5) return 0.55  // 5 sidor -> 55% storlek
    else return 0.45                           // 6+ sidor -> 45% storlek
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
      
      // Skapa en kopia av CV-elementet för att manipulera utan att påverka originalet
      const cvClone = cvElement.cloneNode(true) as HTMLElement
      
      // Ställ in stilar för bättre rendering
      cvClone.style.position = "absolute"
      cvClone.style.left = "-9999px"
      cvClone.style.top = "0"
      cvClone.style.width = `${cvElement.offsetWidth}px`
      cvClone.style.maxHeight = "none" // Ta bort maxhöjd för att visa hela innehållet
      cvClone.style.overflow = "visible"
      
      // Ta bort ALLA ramar från alla element i CV:t för att undvika konflikter med texten
      // Detta är en mer omfattande lösning som säkerställer att inga ramar stör
      const removeBorders = (element: HTMLElement) => {
        // Ta bort ramar och skuggor
        element.style.border = 'none';
        element.style.borderRadius = '0';
        element.style.boxShadow = 'none';
        element.style.outline = 'none';
        
        // Behåll marginaler och padding
        // Ta bort eventuella ramrelaterade störningar i marginaler
        if (element.classList.contains('cv-preview-container') || 
            element.classList.contains('cv-content') || 
            element.classList.contains('cv-template')) {
          // Behåll bakgrundsfärg men ta bort ramar
          const computedStyle = window.getComputedStyle(element);
          element.style.backgroundColor = computedStyle.backgroundColor;
          
          // Se till att det inte är några overflow-problem
          element.style.overflow = 'visible';
        }
      };
      
      // Applicera på huvudcontainern
      removeBorders(cvClone);
      
      // Applicera på alla child-element som kan ha ramar
      const elementsWithPotentialBorders = cvClone.querySelectorAll('.cv-content, .cv-template, .cv-section, .cv-container, section, article, div');
      elementsWithPotentialBorders.forEach(el => {
        if (el instanceof HTMLElement) {
          removeBorders(el);
        }
      });
      
      // Lägg till klonen i body temporärt
      document.body.appendChild(cvClone)
      
      // Skapa en PDF med A4-format
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      
      // Definiera PDF-dimensioner
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Räkna ut total höjd för CV-innehållet
      const totalHeight = cvClone.scrollHeight
      
      // Beräkna skalfaktor baserat på CV-bredd och användarens val
      let scaleFactor: number
      
      if (autoAdjust) {
        // Beräkna en preliminär skala för att uppskatta sidor
        const prelimScale = pdfWidth / cvClone.offsetWidth
        const pageHeightAtPreliminScale = pdfHeight / prelimScale
        
        // Beräkna optimal skalning baserat på innehållets storlek
        const autoScaleFactor = calculateOptimalScaling(totalHeight, pageHeightAtPreliminScale)
        
        // Om reduceSize också är aktivt, minska ytterligare
        scaleFactor = reduceSize ? Math.max(autoScaleFactor - 0.1, 0.35) : autoScaleFactor
        
        // Applicera skalningsfaktorn på klonen för att få responsiv effekt
        if (scaleFactor < 0.9) {
          // Öka relativ storlek på rubriker och viktiga element, så att de framträder bättre
          const headings = cvClone.querySelectorAll('h1, h2, h3, h4, h5, h6')
          headings.forEach((heading: Element) => {
            if (heading instanceof HTMLElement) {
              const currentSize = parseInt(window.getComputedStyle(heading).fontSize)
              heading.style.fontSize = `${currentSize * (1 / scaleFactor) * 0.75}px`
            }
          })
          
          // Minska marginaler och padding proportionellt
          const sections = cvClone.querySelectorAll('section, div, p')
          sections.forEach((section: Element) => {
            if (section instanceof HTMLElement) {
              const currentMargin = parseInt(window.getComputedStyle(section).marginBottom)
              const currentPadding = parseInt(window.getComputedStyle(section).padding)
              
              if (currentMargin > 8) {
                section.style.marginBottom = `${currentMargin * scaleFactor * 1.2}px`
              }
              
              if (currentPadding > 8) {
                section.style.padding = `${currentPadding * scaleFactor * 1.2}px`
              }
            }
          })
          
          // Komprimera listor
          const listItems = cvClone.querySelectorAll('li')
          listItems.forEach((item: Element) => {
            if (item instanceof HTMLElement) {
              const currentMargin = parseInt(window.getComputedStyle(item).marginBottom)
              if (currentMargin > 4) {
                item.style.marginBottom = `${currentMargin * scaleFactor * 1.2}px`
              }
            }
          })
        }
      } else {
        // Använd manuellt val om autoAdjust är avstängt
        scaleFactor = reduceSize ? 0.5 : 1.0
      }
      
      // Beräkna slutgiltig skala för rendering
      const scale = (pdfWidth * scaleFactor) / cvClone.offsetWidth
      
      // Beräkna hur många sidor som behövs med den nya skalan
      const pageHeight = pdfHeight / scale
      const totalPages = Math.ceil(totalHeight / pageHeight)
      
      // Beräkna marginaler för centrering om storleken är reducerad
      const horizontalMargin = scaleFactor < 1.0 ? (pdfWidth - (pdfWidth * scaleFactor)) / 2 : 0
      const verticalMargin = scaleFactor < 1.0 ? 10 : 0 // Lite mindre marginal i toppen

      // Sätt en rimlig höjd för varje segment som ska renderas
      // För normalläge: En sida kan ha upp till maximal höjd (A4)
      // För andra lägen: Anpassa efter skalning
      const normalizedPageHeight = pageHeight

      // Rendera en sida i taget
      for (let page = 0; page < totalPages; page++) {
        // Ställ in canvas-segmentposition
        const yPosition = page * normalizedPageHeight
        
        // Lägg till en ny sida efter den första sidan
        if (page > 0) {
          pdf.addPage()
        }
        
        // Använd html2canvas för att rendera det synliga segmentet
        // För normalläge gör vi ingen extra skalning så att sidbrytning fungerar naturligt
        const canvas = await html2canvas(cvClone, {
          scale: 2, // Högre resolution för bättre kvalitet 
          useCORS: true,
          logging: false,
          backgroundColor: null,
          y: yPosition,
          height: Math.min(normalizedPageHeight, totalHeight - yPosition),
        })
        
        // Få bilddata från canvas
        const imgData = canvas.toDataURL("image/png")
        
        // Beräkna bildstorlek baserat på reduceringen
        const imgWidth = pdfWidth * scaleFactor
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Lägg till bilden på rätt position på PDF-sidan med marginaler vid behov
        pdf.addImage(imgData, "PNG", horizontalMargin, verticalMargin, imgWidth, imgHeight)
        
        // Lägg till vattenstämpel om användaren använder gratisplanen
        if (withWatermark) {
          pdf.setTextColor(200, 200, 200)
          // Använd typecasting för att undvika TypeScript-fel
          pdf.setGState(new (jsPDF as any).GState({ opacity: 0.4 }));
          pdf.setFontSize(scaleFactor < 0.7 ? 25 : 40)
          
          const centerX = pdfWidth / 2
          const centerY = pdfHeight / 2
          
          for (let i = -3; i <= 3; i++) {
            // Rita vattenstämpeln med rotation
            pdf.text("CV VERKTYG DEMO", centerX, centerY + (i * (scaleFactor < 0.7 ? 20 : 30)), { 
              align: "center",
              angle: -45
            })
          }
          
          // Återställ opacitet
          pdf.setGState(new (jsPDF as any).GState({ opacity: 1.0 }));
        }
      }
      
      // Ta bort den temporära klonen
      document.body.removeChild(cvClone)
      
      // Återställ färgredigeringsknappen
      if (colorEditorButton) {
        colorEditorButton.style.display = ""
      }
      
      // Spara PDF med personens namn
      let fileName = `${currentCV.personalInfo.firstName || "CV"}_${
        currentCV.personalInfo.lastName || ""
      }_CV.pdf`.replace(/\s/g, "_")
      
      // Lägg till suffix baserat på valda exportalternativ
      if (autoAdjust) {
        fileName = fileName.replace('.pdf', '_responsiv.pdf')
      } else if (reduceSize) {
        fileName = fileName.replace('.pdf', '_kompakt.pdf')
      }
      
      // Om detta är en gratisexport med vattenstämpel, lägg till "_demo" i filnamnet
      const finalFileName = withWatermark 
        ? fileName.replace('.pdf', '_demo.pdf')
        : fileName;
      
      pdf.save(finalFileName)

      // Visa ett specifikt meddelande beroende på om det var med vattenstämpel eller inte
      let toastMessage = "Din PDF har exporterats framgångsrikt"
      
      if (autoAdjust) {
        toastMessage += " med responsiv formatering"
        if (reduceSize) toastMessage += " och kompakt storlek"
      } else if (reduceSize) {
        toastMessage += " i kompakt storlek (50%)"
      }
      
      if (withWatermark) {
        toast({
          title: "PDF exporterad med vattenstämpel",
          description: "Uppgradera din plan för att exportera utan vattenstämpel",
        })
      } else {
        toast({
          title: "PDF exporterad",
          description: toastMessage,
        })
      }
    } catch (error: unknown) {
      console.error("Fel vid export:", error)
      toast({
        title: "Fel vid export",
        description: `Det gick inte att exportera PDF:en: ${error instanceof Error ? error.message : "Okänt fel"}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleReduceSize = () => {
    setReduceSize(!reduceSize)
  }
  
  const toggleAutoAdjust = () => {
    setAutoAdjust(!autoAdjust)
  }

  // Funktion för att generera vektor-PDF på klientsidan
  const generateVectorPDF = async () => {
    if (!currentCV) {
      toast({
        title: "Fel",
        description: "Inget CV att exportera",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingPDF(true);
    setPdfGenerationError(null);
    
    try {
      // Importera modulerna dynamiskt endast på klientsidan
      const [
        ReactPDF, 
        DefaultTemplateReactPDF, 
        WatermarkedTemplateReactPDF
      ] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./templates-react-pdf/DefaultTemplateReactPDF').then(mod => mod.default),
        import('./templates-react-pdf/WatermarkedTemplateReactPDF').then(mod => mod.default)
      ]);
      
      // Skapa PDF-dokumentet baserat på användarrättigheter
      const MyDocument = canExportWithoutWatermark() 
        ? <DefaultTemplateReactPDF cvData={adaptCVForReactPDF(currentCV)} /> 
        : <WatermarkedTemplateReactPDF cvData={adaptCVForReactPDF(currentCV)} />;
      
      // Generera PDF-blob
      const blob = await ReactPDF.pdf(MyDocument).toBlob();
      
      // Skapa en URL för blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Skapa en temporär länk för nedladdning
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${currentCV.personalInfo.firstName || "CV"}_${currentCV.personalInfo.lastName || ""}_CV.pdf`;
      
      // Lägg till länken i dokumentet och klicka på den
      document.body.appendChild(link);
      link.click();
      
      // Städa upp
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
      
      toast({
        title: "PDF exporterad",
        description: "Din PDF har exporterats framgångsrikt",
      });
    } catch (error) {
      console.error("Fel vid generering av PDF:", error);
      setPdfGenerationError(error);
      toast({
        title: "Fel vid generering",
        description: "Det gick inte att generera PDF:en. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              onClick={handleExportClick} 
              disabled={isExporting || !currentCV} 
              className="w-full h-10 sm:h-auto"
              size="sm"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {window.innerWidth > 400 ? "Exporterar (html2canvas)..." : ""}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportera (html2canvas)
                </>
              )}
            </Button>
          </motion.div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={toggleAutoAdjust} 
                    variant={autoAdjust ? "default" : "outline"} 
                    size="icon" 
                    disabled={isExporting || !currentCV}
                    className="h-10 w-10"
                  >
                    <LayoutTemplate className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{autoAdjust ? "Inaktivera responsiv anpassning" : "Aktivera responsiv anpassning"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={toggleReduceSize} 
                    variant={reduceSize ? "default" : "outline"} 
                    size="icon" 
                    disabled={isExporting || !currentCV}
                    className="h-10 w-10"
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reduceSize ? "Normal storlek" : "Kompakt storlek"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {(autoAdjust || reduceSize) && (
          <p className="text-xs text-muted-foreground text-center">
            {autoAdjust 
              ? "(html2canvas) CV anpassas automatiskt" 
              : reduceSize 
                ? "(html2canvas) CV exporteras i 50% storlek" 
                : ""}
            {autoAdjust && reduceSize && " med ytterligare komprimering"}
          </p>
        )}

        {currentCV && (
          <div className="mt-4 pt-4 border-t border-dashed">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-foreground">Ny exportmetod (Rekommenderad)</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                Bättre kvalitet
              </span>
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              className="w-full h-10 sm:h-auto"
              disabled={isGeneratingPDF}
              onClick={generateVectorPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Genererar PDF...
                </>
              ) : pdfGenerationError ? (
                <>
                  <span className="mr-2">⚠️</span>
                  Kunde inte generera PDF
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportera PDF
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Förbättrad vektorbaserad PDF med skarpare text och bättre struktur
            </p>
          </div>
        )}
      </div>
      
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

// Hjälpfunktion för att anpassa CV-data till formatet som React-PDF mallarna förväntar sig
function adaptCVForReactPDF(cv: any) {
  if (!cv) return null;
  
  // Gör en djup kopia av cv-objektet
  const adaptedCV = {
    ...cv,
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    hobbies: []
  };
  
  // Iterera genom sections och fördela items till rätt array baserat på typ
  cv.sections?.forEach((section: any) => {
    if (section.type === "experience") {
      // Mappa experience-items till rätt format
      adaptedCV.experience = section.items.map((item: any) => ({
        company: item.company,
        position: item.position,
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description
      }));
    } 
    else if (section.type === "education") {
      // Mappa education-items till rätt format
      adaptedCV.education = section.items.map((item: any) => ({
        school: item.institution,
        degree: item.degree,
        field: item.field,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description
      }));
    } 
    else if (section.type === "skills") {
      // För färdigheter, använd bara namnen
      adaptedCV.skills = section.items.map((item: any) => item.name);
    }
    else if (section.type === "languages") {
      // För språk, använd språknamn och nivå
      adaptedCV.languages = section.items.map((item: any) => ({
        language: item.name,
        level: item.level
      }));
    }
    else if (section.type === "projects") {
      // Mappa projekten
      adaptedCV.projects = section.items.map((item: any) => ({
        title: item.name,
        description: item.description,
        link: item.url
      }));
    }
    else if (section.type === "hobbies") {
      // För hobbies, använd bara namnen
      adaptedCV.hobbies = section.items.map((item: any) => item.name);
    }
  });
  
  return adaptedCV;
}

