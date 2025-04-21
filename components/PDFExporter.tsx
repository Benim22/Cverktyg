"use client"

import { useCV } from "@/contexts/CVContext"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { PaywallModal } from "@/components/PaywallModal"
import { PDFExportButton } from "@/components/PDFExportButton"
import { ReactPDFExporter } from "@/components/ReactPDFExporter"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs"

// Definiera typdeklarationen för html2pdf om det behövs senare
// declare module 'html2pdf.js';

export function PDFExporter() {
  const { currentCV } = useCV()
  const { isFreePlan, canExportWithoutWatermark } = useSubscription()
  const [isExporting, setIsExporting] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const { toast } = useToast()
  const [exportMethod, setExportMethod] = useState<string>("original")

  const handleExportClick = () => {
    if (!currentCV) {
      toast({
        title: "Fel",
        description: "Inget CV att exportera",
        variant: "destructive",
      })
      return Promise.reject(new Error("Inget CV att exportera"))
    }

    // Kontrollera om användaren har behörighet att exportera utan vattenstämpel
    if (!canExportWithoutWatermark()) {
      setShowPaywall(true)
      return Promise.reject(new Error("Behörighet saknas"))
    } else {
      // Om användaren har behörighet, fortsätt direkt till export
      return handleExport(false)
    }
  }

  const handleExport = async (withWatermark = false) => {
    if (!currentCV) {
      toast({
        title: "Fel",
        description: "Inget CV att exportera",
        variant: "destructive",
      })
      return Promise.reject(new Error("Inget CV att exportera"))
    }

    setIsExporting(true)

    try {
      // Hitta CV-elementet för att exportera
      const cvElement = document.querySelector(".cv-preview-container") as HTMLElement
      
      if (!cvElement) {
        throw new Error("Kunde inte hitta CV-elementet")
      }

      // Kontrollera om vi är i preview-läge
      const isPreviewMode = cvElement.dataset.pageMode === 'preview'
      
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
      
      // Skapa en klon av CV-elementet så vi kan modifiera den utan att ändra originalet
      const clonedCV = cvElement.cloneNode(true) as HTMLElement
      document.body.appendChild(clonedCV)
      
      // Sätt stilar för klonen för optimal rendering
      clonedCV.style.position = "absolute"
      clonedCV.style.top = "-9999px"
      clonedCV.style.left = "-9999px"
      clonedCV.style.width = "794px" // A4 bredd i pixlar (210mm)
      clonedCV.style.height = "auto"
      clonedCV.style.maxHeight = "none"
      clonedCV.style.overflow = "visible"
      clonedCV.style.backgroundColor = "white"
      clonedCV.style.textAlign = "left"
      
      // Säkerställ att alla sektioner är synliga
      const allSections = clonedCV.querySelectorAll('[class*="section"]');
      allSections.forEach((section: any) => {
        if (section.style) {
          section.style.display = 'block';
          section.style.visibility = 'visible';
          section.style.height = 'auto';
          section.style.overflow = 'visible';
        }
      });
      
      // Säkerställ att alla CV-sektioner (utbildning, erfarenhet, projekt, etc.) är synliga
      const cvSections = clonedCV.querySelectorAll('.cv-section-title, .cv-skills-grid, .cv-education-header, .cv-experience-header');
      cvSections.forEach((element: any) => {
        if (element.style) {
          element.style.display = element.classList.contains('cv-skills-grid') ? 'grid' : 'block';
          element.style.visibility = 'visible';
        }
      });
      
      // Ta bort eventuella interaktiva delar som inte ska vara med i PDF:en
      const editorElements = clonedCV.querySelectorAll('.color-editor, .color-editor-button')
      editorElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
      
      // Fixa ikonerna i personlig information med kraftfull justering
      const contactIcons = clonedCV.querySelectorAll(".personal-info-icon") as NodeListOf<HTMLElement>
      if (contactIcons.length > 0) {
        contactIcons.forEach(icon => {
          // Fixa container-styling för korrekt centrering
          icon.style.display = "flex"
          icon.style.alignItems = "center"
          icon.style.height = "24px"
          
          // Aggressiv justering av ikonen
          const svgIcon = icon.querySelector("svg") as SVGElement
          if (svgIcon) {
            svgIcon.style.width = "16px"
            svgIcon.style.height = "16px"
            svgIcon.style.minWidth = "16px"
            svgIcon.style.marginRight = "6px"
            svgIcon.style.position = "relative"
            svgIcon.style.transform = "translateY(1px)" // Tvinga ikonerna nedåt lite för att matcha textens baseline
          }
          
          // Se till att text-element är vertikalt centrerade
          const textSpan = icon.querySelector("span")
          if (textSpan) {
            textSpan.style.lineHeight = "normal"
            textSpan.style.display = "inline-block"
            textSpan.style.verticalAlign = "middle"
          }
        })
      }
      
      // Fixa beskrivningstexter
      const descriptionTexts = clonedCV.querySelectorAll('[class*="description"]');
      if (descriptionTexts.length > 0) {
        descriptionTexts.forEach(desc => {
          const descElement = desc as HTMLElement;
          descElement.style.whiteSpace = "pre-wrap";
          descElement.style.wordBreak = "break-word";
          descElement.style.overflow = "visible";
          descElement.style.display = "block";
          descElement.style.maxHeight = "none";
        });
      }
      
      // Fixa kalender-ikoner vid datumen med samma aggressiva justering
      const dateRanges = clonedCV.querySelectorAll(".cv-daterange") as NodeListOf<HTMLElement>
      if (dateRanges.length > 0) {
        dateRanges.forEach(dateRange => {
          // Fixa container-styling
          dateRange.style.display = "inline-flex"
          dateRange.style.alignItems = "center"
          dateRange.style.height = "20px"
          
          // Aggressiv justering av kalender-ikonen
          const calendarIcon = dateRange.querySelector("svg") as SVGElement
          if (calendarIcon) {
            calendarIcon.style.width = "12px"
            calendarIcon.style.height = "12px"
            calendarIcon.style.minWidth = "12px"
            calendarIcon.style.marginRight = "4px"
            calendarIcon.style.position = "relative"
            calendarIcon.style.transform = "translateY(1px)" // Tvinga ikonerna nedåt lite för att matcha textens baseline
          }
          
          // Justera texten bredvid ikonen
          const textSpan = dateRange.querySelector("span")
          if (textSpan) {
            textSpan.style.lineHeight = "normal"
            textSpan.style.display = "inline-block"
            textSpan.style.verticalAlign = "middle"
          }
        })
      }
      
      // Fixa namnstyling
      const nameElement = clonedCV.querySelector(".cv-name") as HTMLElement
      if (nameElement) {
        nameElement.style.whiteSpace = "nowrap"
        nameElement.style.display = "block"
      }
      
      // Fixa layout för huvudsektioner
      const headerElement = clonedCV.querySelector(".cv-header-content") as HTMLElement
      if (headerElement) {
        headerElement.style.display = "flex"
        headerElement.style.flexDirection = "row"
        headerElement.style.alignItems = "center"
        headerElement.style.gap = "16px"
      }
      
      // Skapa en canvas från klon-elementet
      const canvas = await html2canvas(clonedCV, {
        scale: 2, // Hög upplösning för att undvika suddighet
        useCORS: true, // Tillåt bilder från andra domäner
        logging: true, // Aktivera loggning för felsökning
        backgroundColor: "white",
        width: 794, // A4 bredd i pixlar (210mm)
        height: clonedCV.offsetHeight,
        windowWidth: 794,
        windowHeight: clonedCV.offsetHeight,
        ignoreElements: (element) => {
          // Ignorera element som inte bör vara med i PDF:en
          return element.classList.contains('color-editor') || 
                 element.classList.contains('color-editor-button');
        },
        onclone: (clonedDoc) => {
          // Säkerställ att alla sektioner och innehåll är synliga
          const sections = clonedDoc.querySelectorAll('.cv-preview-container > div > div');
          sections.forEach((section: any) => {
            if (section.style) {
              section.style.display = 'block';
              section.style.visibility = 'visible';
              section.style.overflow = 'visible';
            }
          });
          console.log("Kloning skedde", clonedDoc);
        }
      })
      
      // Ta bort klonen från DOM
      document.body.removeChild(clonedCV)
      
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
      
      // Standardbredd för A4 
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Kontrollera om canvas-innehållet faktiskt har data
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      
      // Beräkna bildbredd och höjd för att passa på A4
      const imgWidth = pageWidth;
      const imgHeight = (canvasCopy.height * imgWidth) / canvasCopy.width;
      
      console.log("Image dimensions for PDF:", imgWidth, "x", imgHeight);
      
      // Få bilddata från canvas
      const imgData = canvasCopy.toDataURL("image/png");
      
      // Om innehållet är högre än en A4-sida, dela upp det på flera sidor
      let heightLeft = imgHeight;
      let position = 0;
      
      // Lägg till första sidan
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Lägg till ytterligare sidor vid behov
      while (heightLeft > 0) {
        position = -pageHeight; // Justera för att säkerställa korrekt position
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight; // Flytta ned för varje ny sida
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
    } catch (error: unknown) {
      console.error("Fel vid export:", error)
      toast({
        title: "Fel vid export",
        description: `Det gick inte att exportera PDF:en: ${(error as Error).message || "Okänt fel"}`,
        variant: "destructive",
      })
      throw error;
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Tabs 
        defaultValue="original" 
        value={exportMethod} 
        onValueChange={setExportMethod} 
        className="w-full mb-2"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="original">HTML Export</TabsTrigger>
          <TabsTrigger value="react-pdf">React PDF Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="original">
          <PDFExportButton
            onClick={handleExportClick}
            isExporting={isExporting}
            label="Exportera PDF (HTML)"
          />
        </TabsContent>
        
        <TabsContent value="react-pdf">
          <ReactPDFExporter />
        </TabsContent>
      </Tabs>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onContinueAnyway={() => {
          setShowPaywall(false)
          handleExport(true) // Exportera med vattenstämpel
        }}
      />
    </>
  )
}

