"use client"

import { useEffect } from 'react'
import { useCV } from "@/contexts/CVContext"

// Typsnitt som vi vill ladda
export const AVAILABLE_FONTS = [
  { name: "Inter", value: "Inter, sans-serif", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
  { name: "Roboto", value: "Roboto, sans-serif", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" },
  { name: "Playfair Display", value: "Playfair Display, serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" },
  { name: "Montserrat", value: "Montserrat, sans-serif", url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" },
  { name: "Open Sans", value: "Open Sans, sans-serif", url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" },
];

// Denna hook laddar de nödvändiga typsnitten och hanterar font-inställningar för CV
export function useCVFonts() {
  const { currentCV } = useCV();
  
  // Font family från CV:et
  const headingFont = currentCV?.fontSettings?.headingFont || "Inter, sans-serif";
  const bodyFont = currentCV?.fontSettings?.bodyFont || "Inter, sans-serif";
  
  // Ladda in typsnitt dynamiskt
  useEffect(() => {
    // Funktion för att ladda ett typsnitt
    const loadFont = (fontFamily: string) => {
      const fontObj = AVAILABLE_FONTS.find(f => f.value === fontFamily);
      if (!fontObj) return;
      
      // Kontrollera om typsnittet redan är laddat
      const existingLink = document.querySelector(`link[href="${fontObj.url}"]`);
      if (existingLink) return;
      
      // Skapa en ny link-tag och lägg till i head
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = fontObj.url;
      document.head.appendChild(linkEl);
    };
    
    // Ladda både rubrik- och brödtext-typsnitt
    loadFont(headingFont);
    loadFont(bodyFont);
    
    // Städa upp om komponenten unmountas
    return () => {
      // Vi väljer att inte ta bort typsnitt, eftersom de kan användas av andra komponenter
    };
  }, [headingFont, bodyFont]);
  
  return {
    headingFont,
    bodyFont,
    availableFonts: AVAILABLE_FONTS
  };
} 