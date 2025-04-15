import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("API-anrop: subscription/direct-update - start")
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    
    // Kontrollera autentisering
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session-fel:", sessionError)
      return NextResponse.json(
        { error: "Kunde inte hämta session" },
        { status: 500 }
      )
    }
    
    if (!session) {
      console.log("Ingen session hittades")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.log("Session hittad för användare:", session.user.id)
    
    // Hämta data från request
    const requestData = await request.json()
    console.log("Request-data:", requestData)
    const { plan, billingInterval } = requestData
    
    if (!plan) {
      console.log("Ingen plan angiven")
      return NextResponse.json(
        { error: "Plan måste anges" },
        { status: 400 }
      )
    }
    
    // Säkerställ att planen är giltig
    const validPlans = ["free", "basic", "premium", "lifetime"]
    if (!validPlans.includes(plan)) {
      console.log("Ogiltig plan:", plan)
      return NextResponse.json(
        { error: "Ogiltig plan angiven" },
        { status: 400 }
      )
    }
    
    const userId = session.user.id
    const now = new Date().toISOString()
    
    // Beräkna utgångsdatum baserat på faktureringsperiod
    let expiresAt = null
    if (plan !== "lifetime" && billingInterval) {
      const expiryDate = new Date()
      if (billingInterval === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else if (billingInterval === "yearly") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }
      expiresAt = expiryDate.toISOString()
    }
    
    // Kör SQL direkt för att kringgå eventuella RLS-problem
    try {
      // Kontrollera först om prenumerationen existerar
      const { data: existingSubscription, error: existingError } = await supabase
        .rpc('check_subscription_exists', { 
          user_id_param: userId 
        })
      
      if (existingError) {
        console.error("Fel vid kontroll av befintlig prenumeration:", existingError)
        return NextResponse.json(
          { error: "Kunde inte kontrollera befintlig prenumeration: " + existingError.message },
          { status: 500 }
        )
      }
      
      let result
      
      // Om prenumerationen finns, uppdatera den
      if (existingSubscription) {
        console.log("Uppdaterar prenumeration med direkt SQL")
        const { data: updateResult, error: updateError } = await supabase
          .rpc('update_subscription', { 
            user_id_param: userId,
            plan_param: plan,
            status_param: 'active',
            is_lifetime_param: plan === "lifetime",
            expires_at_param: expiresAt,
            updated_at_param: now
          })
        
        if (updateError) {
          console.error("Fel vid direkt uppdatering:", updateError)
          return NextResponse.json(
            { error: "Kunde inte uppdatera prenumeration: " + updateError.message },
            { status: 500 }
          )
        }
        
        result = updateResult
      } else {
        // Om prenumerationen inte finns, skapa en ny
        console.log("Skapar ny prenumeration med direkt SQL")
        const { data: insertResult, error: insertError } = await supabase
          .rpc('insert_subscription', { 
            user_id_param: userId,
            plan_param: plan,
            status_param: 'active',
            starts_at_param: now,
            expires_at_param: expiresAt,
            is_lifetime_param: plan === "lifetime",
            created_at_param: now,
            updated_at_param: now
          })
        
        if (insertError) {
          console.error("Fel vid direkt infogning:", insertError)
          return NextResponse.json(
            { error: "Kunde inte skapa prenumeration: " + insertError.message },
            { status: 500 }
          )
        }
        
        result = insertResult
      }
      
      // Hämta den uppdaterade prenumerationen
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (fetchError) {
        console.error("Fel vid hämtning av uppdaterad prenumeration:", fetchError)
        return NextResponse.json(
          { 
            success: true, 
            message: "Prenumeration uppdaterad, men kunde inte hämta detaljer",
            result
          }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: "Prenumeration uppdaterad med direkt SQL",
        subscription
      })
      
    } catch (sqlError: any) {
      console.error("SQL-fel:", sqlError)
      return NextResponse.json(
        { error: "Databas-fel: " + sqlError.message },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error("Oväntat fel:", error)
    return NextResponse.json(
      { error: "Ett oväntat fel inträffade: " + (error.message || "Okänt fel") },
      { status: 500 }
    )
  }
} 