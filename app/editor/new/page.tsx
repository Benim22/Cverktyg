"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getUserProfile } from "@/lib/user-profile"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { toast } from "sonner"

export default function NewCVPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const createNewCV = async () => {
      try {
        setLoading(true)
        
        // Hämta användarens session
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/auth/signin")
          return
        }
        
        // Hämta användarens profildata
        const { personalInfo, userId } = await getUserProfile()
        
        if (!userId) {
          toast.error("Du måste vara inloggad för att skapa ett nytt CV")
          router.push("/auth/signin")
          return
        }
        
        // Skapa ett nytt CV med användarens profildata
        const newCVId = uuidv4()
        const currentDate = new Date().toISOString()
        
        const newCV = {
          id: newCVId,
          title: "Nytt CV",
          personalInfo: {
            ...personalInfo,
            // Se till att alla obligatoriska fält finns med
            firstName: personalInfo.firstName || "",
            lastName: personalInfo.lastName || "",
            title: personalInfo.title || "",
            email: personalInfo.email || "",
            phone: personalInfo.phone || "",
            location: personalInfo.location || "",
            website: personalInfo.website || "",
            summary: personalInfo.summary || "",
            profileImage: personalInfo.profileImage
          },
          sections: [],
          colorScheme: { ...DEFAULT_COLOR_SCHEME },
          createdAt: currentDate,
          updatedAt: currentDate,
          templateId: "standard",
        }
        
        // Spara CV:t i databasen
        const { error } = await supabase
          .from("cvs")
          .insert({
            id: newCVId,
            user_id: userId,
            title: "Nytt CV",
            content: newCV,
            created_at: currentDate,
            updated_at: currentDate,
          })
        
        if (error) {
          console.error("Fel vid skapande av CV:", error)
          toast.error("Kunde inte skapa ett nytt CV")
          router.push("/dashboard")
          return
        }
        
        // Redirect till CV-redigeraren
        router.push(`/editor/${newCVId}`)
      } catch (error) {
        console.error("Fel vid skapande av CV:", error)
        toast.error("Ett fel uppstod när CV:t skulle skapas")
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    
    createNewCV()
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl">Skapar nytt CV...</p>
        <p className="text-sm text-muted-foreground">Du kommer automatiskt att omdirigeras till CV-redigeraren</p>
      </div>
    </div>
  )
}

