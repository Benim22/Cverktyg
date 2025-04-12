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
      
      // Hämta användarens prenumeration
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single()
      
      if (error) {
        console.error("Error fetching subscription:", error)
        return
      }
      
      setSubscription(data)
    } catch (error) {
      console.error("Error in subscription context:", error)
    } finally {
      setIsLoading(false)
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
    await fetchSubscription()
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
        isLoggedIn
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