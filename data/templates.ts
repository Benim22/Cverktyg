import type { CVTemplate } from "@/types/cv"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "standard",
    name: "Standard",
    description: "En klassisk och professionell CV-layout som passar för de flesta branscher",
    previewImage: "/images/templates/standard-preview.png",
    layout: "standard",
    colorScheme: { ...DEFAULT_COLOR_SCHEME },
    fontSettings: {
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      fontSize: "medium"
    },
    category: "business",
    isPremium: false
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "En sofistikerad och stilren layout med eleganta detaljer",
    previewImage: "/images/templates/elegant-preview.png",
    layout: "elegant",
    colorScheme: {
      primaryColor: "#5E3B73", // Lila
      secondaryColor: "#9A7FB8", // Ljuslila
      headingColor: "#2D2D2D", // Mörkgrå
      subHeadingColor: "#4A4A4A", // Grå
      textColor: "#5A5A5A", // Textgrå
      backgroundColor: "#ffffff", // Vit
      accentColor: "#D4AF37" // Guld
    },
    fontSettings: {
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
      fontSize: "medium"
    },
    category: "creative",
    isPremium: false
  },
  {
    id: "tech",
    name: "Tech",
    description: "En modern layout med tekniskt utseende perfekt för IT och ingenjörsroller",
    previewImage: "/images/templates/tech-preview.png",
    layout: "tech",
    colorScheme: {
      primaryColor: "#0F172A", // Mörkblå
      secondaryColor: "#38BDF8", // Ljusblå
      headingColor: "#1E293B", // Mörkgrå
      subHeadingColor: "#334155", // Grå
      textColor: "#64748B", // Textgrå
      backgroundColor: "#F8FAFC", // Ljusgrå
      accentColor: "#22C55E" // Grön
    },
    fontSettings: {
      headingFont: "JetBrains Mono, monospace",
      bodyFont: "Inter, sans-serif",
      fontSize: "medium"
    },
    category: "technical",
    isPremium: false
  },
  {
    id: "executive",
    name: "Executive",
    description: "Professionell design med elegant stil, perfekt för ledande befattningar",
    previewImage: "/images/templates/executive-preview.png",
    layout: "executive",
    colorScheme: {
      primaryColor: "#1A365D", // Mörkblå
      secondaryColor: "#2A4365", // Mellanblå
      headingColor: "#1A202C", // Nästan svart
      subHeadingColor: "#2D3748", // Mörkgrå
      textColor: "#4A5568", // Grå
      backgroundColor: "#FFFFFF", // Vit
      accentColor: "#C53030" // Röd
    },
    fontSettings: {
      headingFont: "Georgia, serif",
      bodyFont: "Helvetica, sans-serif",
      fontSize: "medium"
    },
    category: "business",
    isPremium: true
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Ren och minimalistisk design inspirerad av nordisk stil",
    previewImage: "/images/templates/nordic-preview.png",
    layout: "nordic",
    colorScheme: {
      primaryColor: "#2E3440", // Mörkgrå
      secondaryColor: "#4C566A", // Mellangrå
      headingColor: "#2E3440", // Mörkgrå
      subHeadingColor: "#3B4252", // Grå
      textColor: "#434C5E", // Textgrå
      backgroundColor: "#ECEFF4", // Ljusgrå
      accentColor: "#5E81AC" // Blå
    },
    fontSettings: {
      headingFont: "system-ui, sans-serif",
      bodyFont: "system-ui, sans-serif",
      fontSize: "medium"
    },
    category: "creative",
    isPremium: true
  },
  {
    id: "creative-pro",
    name: "Creative Pro",
    description: "Kreativ men professionell layout för kreativa branscher",
    previewImage: "/images/templates/creative-pro-preview.png",
    layout: "creative-pro",
    colorScheme: {
      primaryColor: "#6D28D9", // Lila
      secondaryColor: "#A78BFA", // Ljuslila
      headingColor: "#1F2937", // Mörkgrå
      subHeadingColor: "#374151", // Grå
      textColor: "#4B5563", // Textgrå
      backgroundColor: "#F9FAFB", // Ljusgrå
      accentColor: "#F59E0B" // Orange
    },
    fontSettings: {
      headingFont: "Poppins, sans-serif",
      bodyFont: "Poppins, sans-serif",
      fontSize: "medium"
    },
    category: "creative",
    isPremium: false
  }
] 