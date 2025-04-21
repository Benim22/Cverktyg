"use client"

import type { CV, CVColorScheme, CVSection, PersonalInfo, CVTemplate } from "@/types/cv"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { getCV, updateCV as updateCVInDB, getSupabaseClient } from "@/lib/supabase-client"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { CV_TEMPLATES } from "@/data/templates"
import { createAutoSave } from "@/lib/auto-save"

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
  lastSaveTime: Date | null
  isAutoSaving: boolean
  zoomScale: number
  setZoomScale: (scale: number) => void
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
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedCV, setLastSavedCV] = useState<CV | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1)

  // Spara CV till databasen funktion
  const saveCVToDatabase = async () => {
    try {
      // Om vi har ett initialCV (preview), gör ingen databassparning
      if (initialCV) {
        return;
      }
      
      // Om vi inte har något CV eller användar-ID, avbryt sparning
      if (!currentCV || !userId) {
        if (!userId) {
          toast.error("Du måste vara inloggad för att spara ditt CV")
        }
        return
      }
      
      // Skapa ett uppdateringsobjekt med CV-data
      const cvUpdates = {
        title: currentCV.title || "Nytt CV",
        content: currentCV,
        updated_at: new Date().toISOString()
      }
      
      // Uppdatera CV:t i databasen
      await updateCVInDB(currentCV.id, userId, cvUpdates)
      
      // Uppdatera den senast sparade versionen
      setLastSavedCV(currentCV)
      
      // Uppdatera senaste sparningstiden
      setLastSaveTime(new Date())
      
      return true
    } catch (error) {
      console.error("Error saving CV to database:", error)
      toast.error("Kunde inte spara CV")
      return false
    }
  }
  
  // Skapa autosparfunktionen med debounce - VIKTIGT: Detta måste vara deklarerat innan det används
  const autoSave = createAutoSave(saveCVToDatabase, 2000)

  // Hämta användarens session när komponenten laddas
  useEffect(() => {
    const getUserSession = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const { user } = session
          setUserId(user.id)
          
          // Om vi har ett cvId, hämta det CV:t från databasen
          if (cvId && !initialCV) {
            // Definiera fetchCV inuti denna funktion
            const fetchCV = async (cvId: string, userId: string) => {
              try {
                // Kontrollera om cvId är ett template-id istället för ett UUID
                const isTemplatePath = CV_TEMPLATES.some(template => template.id === cvId);
                
                if (isTemplatePath) {
                  console.log("Detta verkar vara ett template-id och inte ett CV-id:", cvId);
                  // Omdirigera till mallsidan istället för att försöka hämta CV
                  router.push(`/templates/${cvId}`);
                  return;
                }
                
                console.log("Hämtar CV med ID:", cvId, "för användare:", userId);
                const { data, error } = await getCV(cvId, userId)
                
                if (error) {
                  console.error("Fel vid hämtning av CV:", error || "Okänt fel", "Detaljer:", JSON.stringify(error));
                  toast.error("Kunde inte ladda CV-data. Försök igen senare.");
                  // Navigera till dashboard om det är ett problem med att hämta CV
                  router.push("/dashboard")
                  return
                }
                
                if (!data) {
                  console.error("Ingen data hittades för detta CV-ID")
                  toast.error("Hittar inte det efterfrågade CV:t")
                  router.push("/dashboard")
                  return
                }
                
                // Konvertera databasens format till appens interna format
                const cvData = data.content || {}
                setCurrentCV({
                  id: data.id,
                  title: data.title || "Namnlöst CV",
                  personalInfo: cvData.personalInfo || {},
                  sections: cvData.sections || [],
                  colorScheme: cvData.colorScheme || { ...DEFAULT_COLOR_SCHEME },
                  createdAt: data.created_at,
                  updatedAt: data.updated_at,
                  templateId: cvData.templateId || "standard",
                })
                
                toast.success(`CV "${data.title || 'Namnlöst CV'}" har laddats`)
              } catch (error: any) {
                console.error("Fel vid hämtning av CV:", 
                  error?.message || error || "Okänt fel", 
                  "Stack:", error?.stack,
                  "Detaljer:", typeof error === 'object' ? JSON.stringify(error) : error
                );
                toast.error("Ett fel uppstod när CV:t skulle laddas. Försök igen senare.")
                router.push("/dashboard")
              }
            }
            
            await fetchCV(cvId, user.id)
          }
        } else {
          // Ingen inloggad användare
          setUserId(null)
          
          // Om vi har initialCV, använd det
          if (initialCV) {
            setCurrentCV(initialCV)
          }
        }
      } catch (error) {
        console.error("Error getting user session:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getUserSession()
  }, [cvId, initialCV, router])

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

  // Lyssna efter ändringar i CV-data och autospara
  useEffect(() => {
    if (currentCV && userId && !loading && !initialCV) {
      // Kolla om vi har genomfört ändringar sedan senaste sparningen
      if (JSON.stringify(lastSavedCV) !== JSON.stringify(currentCV)) {
        // Anropa autoSave 
        autoSave.autoSave()
      }
    }
  }, [currentCV, userId, loading, lastSavedCV, initialCV])
  
  // Uppdatera saveCV-funktionen för att också sätta lastSaveTime
  const saveCV = async (): Promise<string> => {
    // Om det är ett initialCV (preview) ska vi inte försöka spara till databasen
    if (initialCV) {
      return currentCV?.id || ""
    }
    
    if (!userId) {
      toast.error("Du måste vara inloggad för att spara CV")
      return ""
    }

    // Använd samma funktion som autospar använder
    setIsAutoSaving(true)
    try {
      const result = await saveCVToDatabase()
      
      if (result) {
        toast.success("CV sparat")
      } else {
        toast.error("Kunde inte spara CV")
      }
      
      return currentCV?.id || ""
    } catch (error) {
      console.error("Fel vid spara:", error)
      toast.error("Ett fel uppstod vid sparande")
      return ""
    } finally {
      setIsAutoSaving(false)
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
        getTemplateById,
        lastSaveTime,
        isAutoSaving,
        zoomScale,
        setZoomScale
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


