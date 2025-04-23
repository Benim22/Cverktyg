"use client"

import { useCV } from "@/contexts/CVContext"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StandardLayout } from "@/components/templates/TemplateLayouts"
import { DEFAULT_COLOR_SCHEME, CVColorScheme } from "@/types/cv"
import { CV_TEMPLATES } from "@/data/templates"
import { usePathname } from "next/navigation"
import { ZoomIn, ZoomOut, Maximize, X, Edit, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CVHoverEditor } from "./CVHoverEditor"

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
      getColorValueFn = (key: keyof CVColorScheme) => {
        const fallbackColors: Record<keyof CVColorScheme, string> = {
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
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
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

  // Identifiera om komponenten används i editor-läge
  const isEditorMode = className?.includes('editor-preview');

  if (!cvData) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Ingen CV-förhandsgranskning tillgänglig. Vänligen skapa en CV först.
        </p>
      </div>
    )
  }

  // Denna funktion används i component-metoden för att hämta färger
  const getColorValue = (key: string) => {
    try {
      return getColorValueFn ? getColorValueFn(key as keyof CVColorScheme) : "#000000";
    } catch (error) {
      // Fallback-färger om getColorValue inte fungerar
      const fallbackColors: Record<keyof CVColorScheme, string> = {
        backgroundColor: "#ffffff",
        primaryColor: "#1e293b",
        secondaryColor: "#334155",
        headingColor: "#0f172a",
        subHeadingColor: "#1e293b",
        textColor: "#334155",
        accentColor: "#c2410c",
      };
      return fallbackColors[key as keyof CVColorScheme] || "#000000";
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

  // Lägg till denna funktion efter getColorValue
  const handleSectionClick = (sectionId: string | null, index: number | null) => {
    setActiveSection(sectionId);
    setActiveSectionIndex(index);
    setIsEditorVisible(!!sectionId);
  };
  
  // Funktion för att kontrollera om en sektion är aktiv (för visuell feedback)
  const isSectionActive = (sectionId: string) => {
    return activeSection === sectionId || hoveredSection === sectionId;
  };

  // Rendrera A4-pappret med korrekt skalning
  return (
    <div 
      ref={containerRef}
      className={cn("relative flex items-center justify-center", className)}
    >
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center overflow-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-10 bg-background/60 hover:bg-background/80 rounded-full"
              onClick={toggleFullScreen}
            >
              <X className="h-5 w-5" />
            </Button>
            <div style={{ transform: `scale(${scale})` }} className="a4-paper">
              <StandardLayout
                cv={cvData}
                profileImageStyle={profileImageStyle}
                profileImageClass={""}
                transparentBgStyle={{}}
              />
            </div>
          </div>
        </div>
      )}
      
      <div 
        className={cn(
          "a4-paper", 
          "transition-transform duration-300", 
          isZooming ? "a4-zoom-in" : ""
        )}
        style={{ transform: `scale(${scale})` }}
      >
        {/* Editor-toggle knapp - visa endast i editor-läge */}
        {isEditorMode && !isFullScreen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/70 hover:bg-background/90 shadow-sm"
            onClick={() => setIsEditorVisible(!isEditorVisible)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Endast tillåt redigering i editor-läge */}
        {isEditorMode && (
          <AnimatePresence>
            <CVHoverEditor 
              visible={isEditorVisible}
              activeSection={activeSection}
              activeSectionIndex={activeSectionIndex}
              onSectionClick={handleSectionClick}
            />
          </AnimatePresence>
        )}
        
        <StandardLayout
          cv={cvData}
          profileImageStyle={profileImageStyle}
          profileImageClass={""}
          transparentBgStyle={{}}
          onSectionClick={isEditorMode ? handleSectionClick : undefined}
          activeSectionId={activeSection}
        />
      </div>
      
      {/* Kontrollpanel med zoom och helskärm, visa endast i preview-läge, inte i editor-läge */}
      {!isEditorMode && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 p-1 bg-background/90 backdrop-blur-sm rounded-full shadow-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => handleZoom(false)}
            title="Zooma ut"
            disabled={scale <= 0.3}
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs px-1 sm:px-2 text-muted-foreground select-none">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => handleZoom(true)}
            title="Zooma in"
            disabled={scale >= calculateMaxZoom() * 0.99}
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="h-3 w-px bg-border mx-1"></div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={toggleFullScreen}
            title="Helskärm"
          >
            <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
      
      {/* Status-information för skalan, även detta bör endast visas i preview-läge */}
      {isPreviewMode && scale > 0.4 && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {isPreviewMode && <span>• Din export kommer att behålla denna zoomnivå</span>}
            {scale >= calculateMaxZoom() * 0.99 && <span className="text-amber-500 ml-1">• Max zoom</span>}
          </span>
        </div>
      )}
    </div>
  )
} 