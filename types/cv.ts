export interface PersonalInfo {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  location: string
  website?: string
  summary: string
  profileImage?: {
    url: string
    path: string
    isCircle?: boolean
    showFrame?: boolean
    frameColor?: string
    frameStyle?: "solid" | "dashed" | "dotted" | "double"
    frameWidth?: number
    isTransparent?: boolean
  }
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  description: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  description: string
}

export interface Project {
  id: string
  name: string
  description: string
  url?: string
  startDate: string
  endDate: string
}

export interface Skill {
  id: string
  name: string
  level: number // 1-5
}

export interface CVSection {
  id: string
  type: "education" | "experience" | "projects" | "skills"
  title: string
  items: Education[] | Experience[] | Project[] | Skill[]
}

export interface CVColorScheme {
  primaryColor: string
  secondaryColor: string
  headingColor: string
  subHeadingColor: string
  textColor: string
  backgroundColor: string
  accentColor: string
}

export interface CVTemplate {
  id: string
  name: string
  description: string
  previewImage: string
  layout: "standard" | "modern" | "minimalist" | "creative" | "professional" | "executive" | "academic" | "technical"
  colorScheme: CVColorScheme
  fontSettings?: {
    headingFont: string
    bodyFont: string
    fontSize: "small" | "medium" | "large"
  }
  sectionOrder?: string[] // Ordningen på sektioner
  isPremium?: boolean // Indikerar om mallen endast är tillgänglig för premiumanvändare
  category?: "business" | "creative" | "academic" | "technical" // Kategorisering av mallen
}

export interface CV {
  id: string
  title: string
  personalInfo: PersonalInfo
  sections: CVSection[]
  createdAt: string
  updatedAt: string
  colorScheme?: CVColorScheme
  templateId?: string // Referens till vald mall
}

// Standardfärger som används som fallback om inget är valt
export const DEFAULT_COLOR_SCHEME: CVColorScheme = {
  primaryColor: "#1e40af", // Mörkblå
  secondaryColor: "#3b82f6", // Blå
  headingColor: "#1e293b", // Mörkgrå
  subHeadingColor: "#334155", // Mörkgrå
  textColor: "#475569", // Grå
  backgroundColor: "#ffffff", // Vit
  accentColor: "#f97316", // Orange
}

