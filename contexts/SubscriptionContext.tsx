"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type SubscriptionPlan = "free" | "basic" | "premium" | "pro" | "lifetime"

interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: "active" | "trialing" | "past_due" | "canceled"
  starts_at: string
  expires_at?: string
  is_lifetime: boolean
  created_at: string
  updated_at: string
  one_time_exports?: number // Antal tillgängliga engångsexporter
}

interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  hasActiveSubscription: boolean
  getUserPlan: () => SubscriptionPlan
  isPremiumPlan: () => boolean
  isFreePlan: () => boolean
  canExportWithoutWatermark: () => boolean
  refreshSubscription: () => Promise<void>
  isLoggedIn: boolean
  createOrUpdateSubscription: (planData: Partial<Subscription>) => Promise<Subscription | null>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      
      // Hämta användarens session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setSubscription(null)
        setIsLoggedIn(false)
        return
      }
      
      setIsLoggedIn(true)
      console.log("Session hittad:", session.user.id, "Använder service_role API");
      
      // Lösning: Använd admin-API i backend för att kringgå RLS-problem
      try {
        const response = await fetch("/api/subscription/get-subscription", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.subscription) {
            console.log("Hittade prenumeration via API:", data.subscription.plan);
            setSubscription(data.subscription);
            return;
          }
        }
        
        console.log("Kunde inte hämta via API, fortsätter med direkt query");
      } catch (apiError) {
        console.error("API-fel, använder direkt query:", apiError);
      }
      
      // Direktanrop till Supabase som fallback
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single()
      
      if (error) {
        console.error("Error fetching subscription:", error);
        console.log("Kontrollera om user_id och auth.uid inte matchar:", session.user.id);
        
        // Hämta användarens profil för att se om det finns en koppling
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, auth_id, email")
          .eq("auth_id", session.user.id)
          .single();
          
        if (!userError && userData) {
          console.log("Användare hittad:", userData.id, userData.auth_id, userData.email);
          
          // Försök hämta prenumeration med user_id från users-tabellen
          const { data: subData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userData.id)
            .single();
            
          if (!subError && subData) {
            console.log("Hittade prenumeration med user.id:", subData);
            setSubscription(subData);
            return;
          }
        }
        
        // Oavsett felorsak, sätt en standardprenumeration för användaren
        const defaultSubscription: Subscription = {
          id: "",
          user_id: session.user.id,
          plan: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setSubscription(defaultSubscription);
        console.log("Satt standardprenumeration 'free' för användare");
      } else {
        setSubscription(data);
        console.log("Prenumeration hittad med direkt query:", data);
      }
    } catch (error) {
      console.error("Error in subscription context:", error);
      
      // Vid oväntade fel, sätt en standardprenumeration till "free"
      if (supabase && supabase.auth) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const defaultSubscription: Subscription = {
              id: "",
              user_id: session.user.id,
              plan: "free",
              status: "active",
              starts_at: new Date().toISOString(),
              is_lifetime: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setSubscription(defaultSubscription);
            console.log("Satt standardprenumeration 'free' efter fel");
          }
        } catch (e) {
          console.error("Kunde inte sätta standardprenumeration:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscription()
    
    // Sätt upp auth state change listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription()
    })
    
    // Rensa upp lyssnaren vid unmount
    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase])

  const hasActiveSubscription = Boolean(
    subscription && 
    ((subscription.status === "active" || subscription.status === "trialing") || 
     subscription.is_lifetime)
  )

  const getUserPlan = (): SubscriptionPlan => {
    if (!subscription) return "free"
    return subscription.plan
  }

  const isPremiumPlan = (): boolean => {
    const plan = getUserPlan()
    return (hasActiveSubscription && 
           (plan === "premium" || plan === "pro" || plan === "lifetime"))
  }

  const isFreePlan = (): boolean => {
    if (!isLoggedIn) return true // Om användaren inte är inloggad, behandla som gratisanvändare
    if (!subscription) return true // Om ingen prenumeration finns, det är en gratisanvändare
    
    // Om planen är "free" eller om prenumerationen inte är aktiv (förutom för lifetime)
    return subscription.plan === "free" || 
          (!subscription.is_lifetime && 
           subscription.status !== "active" && 
           subscription.status !== "trialing")
  }

  const canExportWithoutWatermark = (): boolean => {
    // Användare kan exportera utan vattenstämpel om:
    // 1. De har en aktiv prenumeration som inte är gratis
    // 2. De har en livstidsprenumeration
    // 3. De har tillgängliga engångsexporter
    
    if (!isLoggedIn) return false
    
    if (subscription) {
      // Om det är en livstidsplan
      if (subscription.is_lifetime) return true
      
      // Om det är en betald aktiv plan
      if ((subscription.status === "active" || subscription.status === "trialing") && 
          subscription.plan !== "free") {
        return true
      }
      
      // Om användaren har engångsexporter kvar
      if (subscription.one_time_exports && subscription.one_time_exports > 0) {
        return true
      }
    }
    
    return false
  }

  const refreshSubscription = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Hämta användarens session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setSubscription(null)
        setIsLoggedIn(false)
        setIsLoading(false)
        return
      }
      
      setIsLoggedIn(true)
      console.log("RefreshSubscription: Session hittad:", session.user.id)
      
      // Lösning: Använd admin-API i backend för att kringgå RLS-problem
      try {
        const response = await fetch("/api/subscription/get-subscription", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.subscription) {
            console.log("RefreshSubscription: Hittade prenumeration via API:", data.subscription.plan);
            setSubscription(data.subscription);
            setIsLoading(false);
            return;
          }
        }
        
        console.log("RefreshSubscription: Kunde inte hämta via API, fortsätter med direkt query");
      } catch (apiError) {
        console.error("RefreshSubscription: API-fel, använder direkt query:", apiError);
      }
      
      // Hämta användarens prenumeration direkt via Supabase
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single()
      
      if (error) {
        console.error("Error fetching subscription:", error)
        console.log("RefreshSubscription: Kontrollerar om auth.uid matchar user_id");
        
        // Hämta användarens profil för att se om det finns en koppling
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, auth_id, email")
          .eq("auth_id", session.user.id)
          .single();
          
        if (!userError && userData) {
          console.log("RefreshSubscription: Användare hittad:", userData.id, userData.auth_id);
          
          // Försök hämta prenumeration med user_id från users-tabellen
          const { data: subData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userData.id)
            .single();
            
          if (!subError && subData) {
            console.log("RefreshSubscription: Hittade prenumeration med user.id:", subData.plan);
            setSubscription(subData);
            return;
          }
        }
        
        // Vi sätter alltid en standardprenumeration, oavsett felkod
        const defaultSubscription: Subscription = {
          id: "",
          user_id: session.user.id,
          plan: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setSubscription(defaultSubscription);
        console.log("refreshSubscription: Satt standardprenumeration");
      } else {
        setSubscription(data)
        console.log("refreshSubscription: Hämtade prenumerationsdata:", data?.plan || "ingen plan");
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error)
      
      try {
        // Sätt en standardprenumeration även vid oväntade fel
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setSubscription({
            id: "",
            user_id: session.user.id,
            plan: "free",
            status: "active",
            starts_at: new Date().toISOString(),
            is_lifetime: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Subscription)
          console.log("refreshSubscription: Återhämtade från fel och satte standardprenumeration")
        }
      } catch (e) {
        console.error("Kunde inte sätta standardprenumeration i refresh:", e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const createOrUpdateSubscription = async (planData: Partial<Subscription>): Promise<Subscription | null> => {
    try {
      setIsLoading(true)
      
      // Hämta användarens session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error("Användaren är inte inloggad")
        return null
      }
      
      console.log("Skapar/uppdaterar prenumeration för användare:", session.user.id)
      
      // Använd API endpoint för att undvika RLS-problem
      try {
        const response = await fetch("/api/subscription/update-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            planData
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.subscription) {
            console.log("Prenumeration uppdaterad via API:", data.subscription);
            setSubscription(data.subscription);
            return data.subscription;
          }
        } else {
          console.error("API-fel:", await response.text());
        }
      } catch (apiError) {
        console.error("Kunde inte använda API:", apiError);
      }
      
      // Fallback till direkt databasfråga
      const userId = session.user.id
      const now = new Date().toISOString()
      
      // Kontrollera om användaren finns i users-tabellen med auth_id
      let targetUserId = userId;
      
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", userId)
        .single();
        
      if (!userError && userData) {
        console.log("Hittade användare med auth_id:", userData.id);
        targetUserId = userData.id;
      }
      
      // Kontrollera om användaren redan har en prenumeration
      const { data: existingSubscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select()
        .eq("user_id", targetUserId)
        .maybeSingle();
      
      let result: Subscription | null = null
      
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Fel vid kontroll av befintlig prenumeration:", fetchError)
      }
      
      if (existingSubscription) {
        // Uppdatera befintlig prenumeration
        const updateData = {
          ...planData,
          updated_at: now
        }
        
        const { data: updatedSub, error: updateError } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", targetUserId)
          .select()
          .maybeSingle();
        
        if (updateError) {
          console.error("Fel vid uppdatering av prenumeration:", updateError)
          return null
        }
        
        result = updatedSub
        console.log("Prenumeration uppdaterad:", updatedSub)
      } else {
        // Skapa ny prenumeration
        const newSubscription = {
          user_id: targetUserId,
          plan: "free",
          status: "active",
          starts_at: now,
          is_lifetime: false,
          created_at: now,
          updated_at: now,
          ...planData
        }
        
        const { data: createdSub, error: createError } = await supabase
          .from("subscriptions")
          .insert(newSubscription)
          .select()
          .maybeSingle();
        
        if (createError) {
          console.error("Fel vid skapande av prenumeration:", createError)
          return null
        }
        
        result = createdSub
        console.log("Ny prenumeration skapad:", createdSub)
      }
      
      // Uppdatera context-state
      setSubscription(result)
      return result
    } catch (error) {
      console.error("Fel i createOrUpdateSubscription:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        hasActiveSubscription,
        getUserPlan,
        isPremiumPlan,
        isFreePlan,
        canExportWithoutWatermark,
        refreshSubscription,
        isLoggedIn,
        createOrUpdateSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  
  if (context === undefined) {
    throw new Error("useSubscription måste användas inom en SubscriptionProvider")
  }
  
  return context
} 