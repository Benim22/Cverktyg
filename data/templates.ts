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
    }
  },
  {
    id: "modern",
    name: "Modern",
    description: "En stilren och modern design med fokus på tydlig struktur",
    previewImage: "/images/templates/modern-preview.png",
    layout: "modern",
    colorScheme: {
      primaryColor: "#0891b2", // Cyan
      secondaryColor: "#06b6d4", // Ljusare cyan
      headingColor: "#1e293b", // Mörkgrå
      subHeadingColor: "#334155", // Mörkgrå
      textColor: "#475569", // Grå
      backgroundColor: "#f8fafc", // Ljusgrå
      accentColor: "#f43f5e", // Rosa
    },
    fontSettings: {
      headingFont: "Montserrat, sans-serif",
      bodyFont: "Roboto, sans-serif",
      fontSize: "medium"
    }
  },
  {
    id: "minimalist",
    name: "Minimalistisk",
    description: "En avskalad design med luftig layout och bara det väsentliga",
    previewImage: "/images/templates/minimalist-preview.png",
    layout: "minimalist",
    colorScheme: {
      primaryColor: "#18181b", // Nästan svart
      secondaryColor: "#3f3f46", // Mörkgrå
      headingColor: "#18181b", // Nästan svart
      subHeadingColor: "#52525b", // Grå
      textColor: "#71717a", // Mörkgrå
      backgroundColor: "#ffffff", // Vit
      accentColor: "#a1a1aa", // Ljusgrå
    },
    fontSettings: {
      headingFont: "DM Sans, sans-serif",
      bodyFont: "DM Sans, sans-serif",
      fontSize: "small"
    }
  },
  {
    id: "creative",
    name: "Kreativ",
    description: "En uttrycksfull design för kreativa branscher och personligheter",
    previewImage: "/images/templates/creative-preview.png",
    layout: "creative",
    colorScheme: {
      primaryColor: "#6d28d9", // Lila
      secondaryColor: "#7c3aed", // Ljusare lila
      headingColor: "#4c1d95", // Mörklila
      subHeadingColor: "#6d28d9", // Lila
      textColor: "#4b5563", // Grå
      backgroundColor: "#f5f3ff", // Mycket ljus lila
      accentColor: "#ec4899", // Rosa
    },
    fontSettings: {
      headingFont: "Poppins, sans-serif",
      bodyFont: "Nunito, sans-serif",
      fontSize: "medium"
    }
  },
  {
    id: "professional",
    name: "Professionell",
    description: "En traditionell layout idealisk för företagsledare och erfarna yrkespersoner",
    previewImage: "/images/templates/professional-preview.png",
    layout: "professional",
    colorScheme: {
      primaryColor: "#1e3a8a", // Mörkblå
      secondaryColor: "#1e40af", // Mörk kunglig blå
      headingColor: "#111827", // Nästan svart
      subHeadingColor: "#1f2937", // Mycket mörkgrå
      textColor: "#374151", // Mörkgrå
      backgroundColor: "#ffffff", // Vit
      accentColor: "#b91c1c", // Mörkröd
    },
    fontSettings: {
      headingFont: "Merriweather, serif",
      bodyFont: "Source Sans Pro, sans-serif",
      fontSize: "medium"
    }
  }
] 