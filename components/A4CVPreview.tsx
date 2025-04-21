"use client"

import { useCV } from "@/contexts/CVContext"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { StandardLayout } from "@/components/templates/TemplateLayouts"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { CV_TEMPLATES } from "@/data/templates"
import { usePathname } from "next/navigation"
import { ZoomIn, ZoomOut, Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface A4CVPreviewProps {
  className?: string;
  isStandalone?: boolean;
  dummyData?: any; // Lägger till möjlighet att skicka in testdata
}

// A4-dimensioner i mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM;

export function A4CVPreview({ className, isStandalone = false, dummyData = null }: A4CVPreviewProps) {
  // Använd en try-catch för att hantera eventuella fel från useCV
  let cvData;
  let getColorValueFn;
  
  try {
    const { currentCV, getColorValue, zoomScale, setZoomScale } = useCV();
    cvData = dummyData || currentCV;
    getColorValueFn = getColorValue;
  } catch (error) {
    // Om vi är i standalone-läge eller har dummyData, använd fördefinierade data
    if (isStandalone || dummyData) {
      cvData = dummyData || {
        templateId: "standard",
        personalInfo: {
          name: "Exempel Person",
          title: "Titel",
          profileImage: null
        }
      };
      getColorValueFn = (key: string) => {
        const fallbackColors: Record<string, string> = {
          backgroundColor: "#ffffff",
          primaryColor: "#1e293b",
          secondaryColor: "#334155",
          headingColor: "#0f172a",
          subHeadingColor: "#1e293b",
          textColor: "#334155",
          accentColor: "#c2410c",
        };
        return fallbackColors[key] || "#000000";
      };
    } else {
      // Om vi inte är i standalone-läge, låt felet bubbla upp
      console.error("A4CVPreview-fel:", error);
      throw new Error("useCV måste användas inom en CVProvider. Sätt isStandalone=true om komponenten används fristående.");
    }
  }

  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  
  // Identifiera om vi är i preview-läge eller editor-läge
  const isPreviewMode = pathname?.includes("/preview")
  
  // Hjälpfunktion för att beräkna maximal zoom baserat på container
  const calculateMaxZoom = () => {
    if (!containerRef.current) return 1.5; // Standard max-gräns
    
    // För editor-läge, tillåt 100% zoom
    const isEditorMode = className?.includes('editor-preview');
    if (isEditorMode) {
      return 1.0;  // 100% zoom för editor-läge
    }
    
    const containerWidth = containerRef.current?.clientWidth || 1;
    // A4 bredd i pixlar
    const a4WidthInPx = A4_WIDTH_MM * 3.7795;
    
    // Tillåt inte att skala större än containern minus marginal
    // Använd 0.95 för att lämna lite marginal
    return Math.min(1.5, (containerWidth * 0.95) / a4WidthInPx);
  };
  
  // Synkronisera lokal scale med global zoomScale
  useEffect(() => {
    try {
      // För editor-läge, sätt scale till 1.0 (100%)
      if (className?.includes('editor-preview')) {
        setScale(1.0);
        return;
      }
      
      // Hämta zoomScale från context och använd som initial scale
      const { zoomScale } = useCV();
      const maxZoom = calculateMaxZoom();
      
      // Respektera maxgränsen även för scale från context
      if (scale !== Math.min(zoomScale, maxZoom)) {
        setScale(Math.min(zoomScale, maxZoom));
      }
    } catch (error) {
      // Ignorera fel i standalone-läge
      console.debug("Kunde inte synkronisera zoomScale:", error);
    }
  }, [className]);

  // Uppdatera global zoomScale när lokal scale ändras
  useEffect(() => {
    try {
      const { setZoomScale } = useCV();
      setZoomScale(scale);
    } catch (error) {
      // Ignorera fel i standalone-läge
      console.debug("Kunde inte uppdatera global zoomScale:", error);
    }
  }, [scale]);

  // Lås/lås upp scroll när helskärmsläget aktiveras/avaktiveras
  useEffect(() => {
    if (isFullScreen) {
      // Lås scrollning på body men kom ihåg scroll-position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = 'hidden';
    } else {
      // Återställ scrollning
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    return () => {
      // Återställ vid unmount
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  // Beräkna skala baserat på container-bredd
  useEffect(() => {
    if (!containerRef.current) return
    
    // Om vi är i editor-läge med 100% zoom, hantera det separat
    if (className?.includes('editor-preview')) {
      setScale(1.0);
      return;
    }
    
    const calculateScale = () => {
      const containerWidth = containerRef.current?.clientWidth || 1
      const isMobile = window.innerWidth <= 768
      
      // För mobilenheter, använd en ännu mindre maxbredd
      const maxContainerWidth = isMobile 
        ? containerWidth * 0.95  // Mobilvy - ännu mindre för bättre visning
        : Math.min(containerWidth, 800) // Desktopvy - max 800px om containern är större
      
      // Konvertera mm till px (1mm ≈ 3.7795px)
      const a4WidthInPx = A4_WIDTH_MM * 3.7795
      
      // Beräkna skala för att passa bredden med lite marginal
      const newScale = (maxContainerWidth / a4WidthInPx) * (isMobile ? 0.95 : 0.98)
      
      // Använd vår hjälpfunktion för maximal zoom
      const maxZoom = calculateMaxZoom();
      
      // Avrunda till 2 decimaler för bättre prestanda och respektera max-gräns
      setScale(Math.min(Math.round(newScale * 100) / 100, maxZoom))
    }
    
    calculateScale()
    
    // Debounce resize-händelse för bättre prestanda
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateScale, 100);
    }
    
    window.addEventListener("resize", handleResize)
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize)
    }
  }, [containerRef.current, isFullScreen, className, calculateMaxZoom])

  // Funktion för att hantera zoom
  const handleZoom = (zoomIn: boolean) => {
    setIsZooming(true)
    
    // Använd vår hjälpfunktion för att få max zoom
    const maxZoom = calculateMaxZoom();
    
    // Uppdatera skalan med gränser
    setScale(prev => {
      const step = window.innerWidth <= 768 ? 0.05 : 0.1; // Mindre steg på mobil
      const newScale = zoomIn ? prev + step : prev - step;
      
      // Begränsa skalan mellan 0.3 och maxZoom
      return Math.min(Math.max(newScale, 0.3), maxZoom);
    });
    
    // Stäng av zoom-animationen efter en stund
    setTimeout(() => setIsZooming(false), 300);
  }

  // Funktion för att växla helskärm för CV-preview
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
    // Återberäkna skala efter toggle för att optimera visningen
    setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const a4WidthInPx = A4_WIDTH_MM * 3.7795
        const newScale = (containerWidth / a4WidthInPx) * 0.95
        setScale(Math.round(newScale * 100) / 100)
      }
    }, 50)
  }
  
  // ESC-tangent för att stänga helskärmsläge
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  if (!cvData) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Ingen CV-förhandsgranskning tillgänglig. Vänligen skapa en CV först.
        </p>
      </div>
    )
  }

  // Hjälpfunktion för att hämta färgvärde med fallback
  const getColorValue = (key: string) => {
    try {
      return getColorValueFn ? getColorValueFn(key) : "#000000";
    } catch (error) {
      // Fallback-färger om getColorValue inte fungerar
      const fallbackColors: Record<string, string> = {
        backgroundColor: "#ffffff",
        primaryColor: "#1e293b",
        secondaryColor: "#334155",
        headingColor: "#0f172a",
        subHeadingColor: "#1e293b",
        textColor: "#334155",
        accentColor: "#c2410c",
      };
      return fallbackColors[key] || "#000000";
    }
  }

  // Sätt standard-mall
  const templateId = "standard";
  const template = CV_TEMPLATES.find(t => t.id === templateId);
  
  // Sätt font-family baserat på mall
  const fontStyles = template?.fontSettings ? {
    fontFamily: template.fontSettings.bodyFont,
    "--heading-font": template.fontSettings.headingFont,
  } as React.CSSProperties : {}

  // Profilbildstil
  const profileImage = cvData.personalInfo?.profileImage
  const profileImageStyle = profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '4px',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 2}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("primaryColor")}`
      : 'none',
    background: profileImage.isTransparent ? 'transparent' : undefined,
  } : {}

  return (
    <div 
      ref={containerRef}
      className={cn(
        "a4-preview-container w-full", 
        className,
        isFullScreen ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto" : ""
      )}
    >
      {/* Kontrollfält */}
      <div className={cn(
        "flex justify-between items-center w-full mb-2 sm:mb-4 px-1",
        isFullScreen ? "sticky top-0 z-10 bg-background/90 backdrop-blur py-2 rounded-md" : ""
      )}>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {isPreviewMode ? "CV Förhandsvisning" : "Förhandsvisning"}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 sm:h-8 sm:w-8" 
            onClick={() => handleZoom(false)}
            title="Zooma ut"
            disabled={scale <= 0.31}
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 sm:h-8 sm:w-8" 
            onClick={() => handleZoom(true)}
            title="Zooma in"
            disabled={scale >= calculateMaxZoom() * 0.99}
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          {isFullScreen ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 hover:text-red-600" 
              onClick={toggleFullScreen}
              title="Stäng helskärm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 sm:h-8 sm:w-8" 
              onClick={toggleFullScreen}
              title="Öppna helskärm"
            >
              <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* A4-container med transformation för skalning */}
      <div 
        className={cn(
          "relative flex justify-center w-full overflow-visible",
          isZooming ? "a4-zoom-in" : ""
        )}
        style={{ 
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          transition: 'transform 0.2s ease',
          margin: "0 auto",
          height: "auto" // Tillåt att expandera om innehållet är större
        }}
      >
        <motion.div 
          className="motion-div relative flex justify-center"
          style={{ 
            width: `${A4_WIDTH_MM * 3.7795}px`,
            minHeight: `${A4_HEIGHT_MM * 3.7795}px`,
            height: "auto", // Viktigt: Tillåt att expandera vid behov
          }}
        >
          {/* Använd div istället för Card för att undvika extra border-styles */}
          <div 
            className="a4-cv-container w-full overflow-visible"
            data-page-mode={isPreviewMode ? 'preview' : 'editor'}
            style={{ 
              backgroundColor: getColorValue("backgroundColor"),
              ...fontStyles,
            }}
          >
            {/* Använd alltid StandardLayout */}
            <StandardLayout 
              cv={cvData} 
              profileImageStyle={profileImageStyle} 
              profileImageClass={""} 
              transparentBgStyle={{}}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Information om skalning */}
      <div className="mt-1 sm:mt-2 text-xs text-muted-foreground text-center">
        {Math.round(scale * 100)}% • A4-format 
        {isPreviewMode && <span>• Din export kommer att behålla denna zoomnivå</span>}
        {scale >= calculateMaxZoom() * 0.99 && <span className="text-amber-500 ml-1">• Max zoom</span>}
      </div>
    </div>
  )
} 