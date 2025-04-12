"use client"

import type { CV, CVColorScheme, CVSection, PersonalInfo, CVTemplate } from "@/types/cv"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { getCV, updateCV as updateCVInDB, getSupabaseClient } from "@/lib/supabase-client"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { CV_TEMPLATES } from "@/data/templates"

interface CVContextType {
  currentCV: CV | null
  setPersonalInfo: (info: PersonalInfo) => void
  addSection: (type: CVSection["type"], title: string) => void
  updateSection: (sectionId: string, updatedSection: Partial<CVSection>) => void
  removeSection: (sectionId: string) => void
  reorderSections: (startIndex: number, endIndex: number) => void
  addItem: (sectionId: string, item: any) => void
  updateItem: (sectionId: string, itemId: string, updatedItem: any) => void
  removeItem: (sectionId: string, itemId: string) => void
  reorderItems: (sectionId: string, startIndex: number, endIndex: number) => void
  updateColorScheme: (colorScheme: Partial<CVColorScheme>) => void
  getColorValue: (key: keyof CVColorScheme) => string
  saveCV: () => Promise<string>
  loading: boolean
  availableTemplates: CVTemplate[]
  setTemplate: (templateId: string) => void
  getTemplateById: (templateId: string) => CVTemplate | undefined
}

const CVContext = createContext<CVContextType | undefined>(undefined)

export function CVProvider({ children, initialCV }: { children: ReactNode; initialCV?: CV }) {
  const params = useParams()
  const cvId = params?.id as string
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(cvId ? true : false)
  const [currentCV, setCurrentCV] = useState<CV>(
    initialCV || {
      id: uuidv4(),
      title: "Nytt CV",
      personalInfo: {
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        summary: "",
      },
      sections: [],
      colorScheme: { ...DEFAULT_COLOR_SCHEME },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: "standard", // Standard mall som default
    },
  )

  // Hämta användarinformation
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUserId(session.user.id)
      } else if (cvId) {
        // Om användaren inte är inloggad och försöker redigera ett CV, omdirigera till login
        router.push("/auth/signin")
      }
    }
    
    checkAuth()
  }, [cvId, router])

  // Hämta CV-data om det är ett befintligt CV
  useEffect(() => {
    if (cvId && userId) {
      const fetchCV = async () => {
        try {
          setLoading(true)
          const { data, error } = await getCV(cvId, userId)
          
          if (error) {
            console.error("Fel vid hämtning av CV:", error)
            toast.error("Kunde inte ladda CV-data")
            return
          }
          
          if (data) {
            // Konvertera databasens format till appens interna format
            const cvData = data.content || {}
            setCurrentCV({
              id: data.id,
              title: data.title,
              personalInfo: cvData.personalInfo || {},
              sections: cvData.sections || [],
              colorScheme: cvData.colorScheme || { ...DEFAULT_COLOR_SCHEME },
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              templateId: cvData.templateId || "standard",
            })
            
            toast.success(`CV "${data.title}" har laddats`)
          }
        } catch (error) {
          console.error("Fel vid hämtning av CV:", error)
          toast.error("Ett fel uppstod när CV:t skulle laddas")
        } finally {
          setLoading(false)
        }
      }
      
      fetchCV()
    }
  }, [cvId, userId])

  const setPersonalInfo = (info: PersonalInfo) => {
    setCurrentCV((prev) => ({
      ...prev,
      personalInfo: info,
      updatedAt: new Date().toISOString(),
    }))
  }

  const addSection = (type: CVSection["type"], title: string) => {
    const newSection: CVSection = {
      id: uuidv4(),
      type,
      title,
      items: [],
    }

    setCurrentCV((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString(),
    }))
    
    toast.success(`Sektionen "${title}" har lagts till`)
  }

  const updateSection = (sectionId: string, updatedSection: Partial<CVSection>) => {
    setCurrentCV((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updatedSection } : section,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const removeSection = (sectionId: string) => {
    // Hitta sektionsnamnet först för toastmeddelande
    const sectionName = currentCV.sections.find(section => section.id === sectionId)?.title || "Sektion";
    
    setCurrentCV((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
      updatedAt: new Date().toISOString(),
    }))
    
    toast.success(`Sektionen "${sectionName}" har tagits bort`)
  }

  const reorderSections = (startIndex: number, endIndex: number) => {
    const result = Array.from(currentCV.sections)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    setCurrentCV((prev) => ({
      ...prev,
      sections: result,
      updatedAt: new Date().toISOString(),
    }))
  }

  const addItem = (sectionId: string, item: any) => {
    const newItem = {
      ...item,
      id: uuidv4(),
    }

    // Hitta sektionen för att visa relevant toast-meddelande
    const section = currentCV.sections.find(section => section.id === sectionId);
    const sectionType = section?.type || "";
    
    let itemName = "";
    if (sectionType === "education" && 'institution' in item) {
      itemName = item.institution;
    } else if (sectionType === "experience" && 'company' in item) {
      itemName = item.company;
    } else if (sectionType === "projects" && 'name' in item) {
      itemName = item.name;
    } else if (sectionType === "skills" && 'name' in item) {
      itemName = item.name;
    }

    setCurrentCV((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, items: [...section.items, newItem] } : section,
      ),
      updatedAt: new Date().toISOString(),
    }))
    
    if (itemName) {
      toast.success(`"${itemName}" har lagts till i ${section?.title || "sektionen"}`)
    } else {
      toast.success("En ny post har lagts till")
    }
  }

  const updateItem = (sectionId: string, itemId: string, updatedItem: any) => {
    setCurrentCV((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item: any) => (item.id === itemId ? { ...item, ...updatedItem } : item)),
            }
          : section,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const removeItem = (sectionId: string, itemId: string) => {
    // Hitta sektion och item för toast
    const section = currentCV.sections.find(section => section.id === sectionId);
    const item = section?.items.find((item: any) => item.id === itemId);
    
    let itemName = "";
    if (section?.type === "education" && item && 'institution' in item) {
      itemName = item.institution;
    } else if (section?.type === "experience" && item && 'company' in item) {
      itemName = item.company;
    } else if (section?.type === "projects" && item && 'name' in item) {
      itemName = item.name;
    } else if (section?.type === "skills" && item && 'name' in item) {
      itemName = item.name;
    }
    
    setCurrentCV((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item: any) => item.id !== itemId),
            }
          : section,
      ),
      updatedAt: new Date().toISOString(),
    }))
    
    if (itemName) {
      toast.success(`"${itemName}" har tagits bort`)
    } else {
      toast.success("Posten har tagits bort")
    }
  }

  const reorderItems = (sectionId: string, startIndex: number, endIndex: number) => {
    setCurrentCV((prev) => {
      const updatedSections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section

        const items = Array.from(section.items)
        const [removed] = items.splice(startIndex, 1)
        items.splice(endIndex, 0, removed)

        return {
          ...section,
          items,
        }
      })

      return {
        ...prev,
        sections: updatedSections,
        updatedAt: new Date().toISOString(),
      }
    })
  }

  const updateColorScheme = (colorScheme: Partial<CVColorScheme>) => {
    setCurrentCV((prev) => ({
      ...prev,
      colorScheme: {
        ...(prev.colorScheme || DEFAULT_COLOR_SCHEME),
        ...colorScheme,
      },
      updatedAt: new Date().toISOString(),
    }))
    
    toast.success("Färginställningarna har uppdaterats")
  }

  const getTemplateById = (templateId: string): CVTemplate | undefined => {
    return CV_TEMPLATES.find(template => template.id === templateId);
  }

  const setTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    
    if (!template) {
      toast.error(`Mallen kunde inte hittas`);
      return;
    }
    
    setCurrentCV(prev => ({
      ...prev,
      templateId: templateId,
      colorScheme: { ...template.colorScheme },
      updatedAt: new Date().toISOString()
    }));
    
    toast.success(`Mallen "${template.name}" har applicerats`);
  }

  const getColorValue = (key: keyof CVColorScheme) => {
    // Om CV:t har en mall, prioritera mallens färger över CV:ts egna färger
    if (currentCV?.templateId) {
      const template = getTemplateById(currentCV.templateId);
      
      if (template && template.colorScheme && template.colorScheme[key]) {
        // Om en mall är vald, använd mallens färger om CV:t inte explicit har ändrat dessa
        // Om CV:t har anpassade färger, använd dem istället
        if (currentCV.colorScheme && currentCV.colorScheme[key]) {
          return currentCV.colorScheme[key];
        }
        return template.colorScheme[key];
      }
    }
    
    // Fallback till CV:ts egna färger eller standardfärger
    return (currentCV?.colorScheme && currentCV.colorScheme[key]) || DEFAULT_COLOR_SCHEME[key];
  }

  const saveCV = async (): Promise<string> => {
    if (!userId) {
      toast.error("Du måste vara inloggad för att spara CV")
      throw new Error("Inte inloggad")
    }
    
    try {
      // Uppdatera timestamp
      const updatedCV = {
        ...currentCV,
        updatedAt: new Date().toISOString(),
      }
      
      setCurrentCV(updatedCV)
      
      // Spara till databasen
      const { error } = await updateCVInDB(currentCV.id, userId, {
        title: currentCV.title,
        content: updatedCV,
      })
      
      if (error) {
        console.error("Fel vid sparande av CV:", error)
        toast.error(`Kunde inte spara CV: ${error.message || "Okänt fel"}`)
        throw new Error("Kunde inte spara CV")
      }
      
      toast.success("Ditt CV har sparats framgångsrikt!")
      return currentCV.id
    } catch (error) {
      console.error("Fel vid sparande:", error)
      toast.error(`Ett fel uppstod vid sparandet: ${error.message || "Okänt fel"}`)
      throw error
    }
  }

  return (
    <CVContext.Provider
      value={{
        currentCV,
        setPersonalInfo,
        addSection,
        updateSection,
        removeSection,
        reorderSections,
        addItem,
        updateItem,
        removeItem,
        reorderItems,
        updateColorScheme,
        getColorValue,
        saveCV,
        loading,
        availableTemplates: CV_TEMPLATES,
        setTemplate,
        getTemplateById
      }}
    >
      {children}
    </CVContext.Provider>
  )
}

export function useCV() {
  const context = useContext(CVContext)
  if (context === undefined) {
    throw new Error("useCV must be used within a CVProvider")
  }
  return context
}

