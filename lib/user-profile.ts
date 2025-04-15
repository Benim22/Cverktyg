import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { PersonalInfo } from "@/types/cv"

/**
 * Hämtar användarens profildata från databasen
 * @returns Ett objekt med användarens profildata eller null om användaren inte är inloggad
 */
export const getUserProfile = async (): Promise<{
  personalInfo: Partial<PersonalInfo>,
  userId: string | null
}> => {
  const supabase = createClientComponentClient()
  
  // Standardvärden om inget hittas
  const defaultPersonalInfo: Partial<PersonalInfo> = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    summary: "",
    website: "",
  }
  
  try {
    // Hämta användarens session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || !session.user) {
      return { personalInfo: defaultPersonalInfo, userId: null }
    }
    
    // Hämta användarens profil från databasen
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", session.user.id)
      .single()
    
    if (error) {
      console.error("Error fetching user profile:", error)
      return { 
        personalInfo: {
          ...defaultPersonalInfo,
          email: session.user.email || "",
        }, 
        userId: session.user.id 
      }
    }
    
    if (data) {
      // Konvertera data till korrekt format för PersonalInfo
      const personalInfo: Partial<PersonalInfo> = {
        firstName: data.first_name || session.user.user_metadata?.first_name || "",
        lastName: data.last_name || session.user.user_metadata?.last_name || "",
        email: session.user.email || "",
        phone: data.phone || "",
        // Använd city + country för location
        location: [data.city, data.country].filter(Boolean).join(", ") || "",
        title: data.title || "",
        summary: data.bio || "",
        website: "", // Websitedata finns inte i profilen
        profileImage: data.profile_image_url ? {
          url: data.profile_image_url,
          path: data.profile_image_path || "",
        } : undefined
      }
      
      return { personalInfo, userId: session.user.id }
    }
    
    // Fallback till grundläggande användardata om ingen profiledata hittades
    return { 
      personalInfo: {
        ...defaultPersonalInfo,
        firstName: session.user.user_metadata?.first_name || "",
        lastName: session.user.user_metadata?.last_name || "",
        email: session.user.email || "",
      }, 
      userId: session.user.id 
    }
  } catch (error) {
    console.error("Error loading user profile:", error)
    return { personalInfo: defaultPersonalInfo, userId: null }
  }
} 