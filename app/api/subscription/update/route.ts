import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("API-anrop: subscription/update - start")
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    console.log("Supabase-klient skapad")
    
    // Försök hämta alla tabeller - hjälper att debugga databasanslutningsproblem
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public')
      
      if (tablesError) {
        console.error("Fel vid hämtning av tabeller:", tablesError)
      } else {
        console.log("Tillgängliga tabeller:", tables)
      }
    } catch (tableErr) {
      console.error("Kunde inte hämta tabellista:", tableErr)
    }
    
    // Kontrollera kolumner i subscriptions-tabellen
    try {
      const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'subscriptions' })
      
      if (colError) {
        console.error("Fel vid hämtning av kolumner:", colError)
      } else {
        console.log("Kolumner i subscriptions-tabellen:", columns)
      }
    } catch (colErr) {
      console.error("Kunde inte hämta kolumninformation:", colErr)
    }
    
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
    
    // Hämta användarens nuvarande prenumeration
    console.log("Hämtar existerande prenumeration för användare:", userId)
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()
    
    if (fetchError) {
      console.error("Fel vid hämtning av prenumeration:", fetchError)
      if (fetchError.code !== "PGRST116") { // PGRST116 = No rows found
        return NextResponse.json(
          { error: "Kunde inte hämta nuvarande prenumerationsinformation" },
          { status: 500 }
        )
      }
      console.log("Ingen existerande prenumeration hittades (vanligt för nya användare)")
    } else {
      console.log("Hittade existerande prenumeration:", existingSubscription)
    }
    
    // Nuvarande datum och nästa faktureringsperiod
    const now = new Date()
    let expiresAt = null
    
    // Sätt utgångsdatum baserat på faktureringsperiod, om det inte är lifetime
    if (plan !== "lifetime" && billingInterval) {
      const expiryDate = new Date()
      if (billingInterval === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else if (billingInterval === "yearly") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }
      expiresAt = expiryDate.toISOString()
      console.log("Satt utgångsdatum till:", expiresAt)
    }
    
    // Om prenumeration finns, uppdatera den
    if (existingSubscription) {
      console.log("Uppdaterar existerande prenumeration")
      
      // Skapa uppdateringsobjekt med endast de fält som finns i tabellen
      const updateData: any = {
        plan,
        status: "active",
        updated_at: now.toISOString()
      }
      
      // Lägg till ytterligare fält bara om de troligen finns i tabellen
      if ('is_lifetime' in existingSubscription) {
        updateData.is_lifetime = plan === "lifetime"
      }
      
      if ('expires_at' in existingSubscription || plan !== "lifetime") {
        updateData.expires_at = expiresAt
      }
      
      console.log("Uppdateringsdata:", updateData)
      
      const { data: updatedSubscription, error: updateError } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single()
      
      if (updateError) {
        console.error("Fel vid uppdatering av prenumeration:", updateError)
        return NextResponse.json(
          { error: "Kunde inte uppdatera prenumeration: " + updateError.message },
          { status: 500 }
        )
      }
      
      console.log("Prenumeration uppdaterad framgångsrikt:", updatedSubscription)
      return NextResponse.json({
        success: true,
        message: "Prenumeration uppdaterad",
        subscription: updatedSubscription
      })
    } 
    // Om ingen prenumeration finns, skapa en ny
    else {
      console.log("Skapar ny prenumeration")
      
      // Basdata som bör fungera med de flesta tabellstrukturer
      const newSubscriptionData: any = {
        user_id: userId,
        plan,
        status: "active",
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
      
      // Lägg till fält som kan vara valfria i tabellen
      if (plan === "lifetime") {
        newSubscriptionData.is_lifetime = true
      }
      
      newSubscriptionData.starts_at = now.toISOString()
      
      if (expiresAt) {
        newSubscriptionData.expires_at = expiresAt
      }
      
      console.log("Ny prenumerationsdata:", newSubscriptionData)
      
      const { data: newSubscription, error: createError } = await supabase
        .from("subscriptions")
        .insert(newSubscriptionData)
        .select()
        .single()
      
      if (createError) {
        console.error("Fel vid skapande av prenumeration:", createError)
        console.error("Detaljerat fel:", JSON.stringify(createError, null, 2))
        
        // Försök med minimal datastruktur om det första försöket misslyckades
        if (createError.details?.includes("column") || createError.details?.includes("field")) {
          try {
            console.log("Försöker med minimal datastruktur...")
            const minimalData = {
              user_id: userId,
              plan,
              status: "active"
            }
            
            const { data: fallbackSub, error: fallbackError } = await supabase
              .from("subscriptions")
              .insert(minimalData)
              .select()
              .single()
            
            if (fallbackError) {
              console.error("Även minimalt försök misslyckades:", fallbackError)
              return NextResponse.json(
                { error: "Kunde inte skapa prenumeration: " + createError.message },
                { status: 500 }
              )
            }
            
            console.log("Lyckades skapa prenumeration med minimal data:", fallbackSub)
            return NextResponse.json({
              success: true,
              message: "Prenumeration skapad (minimal)",
              subscription: fallbackSub
            })
          } catch (fallbackErr: any) {
            console.error("Fel vid fallback-försök:", fallbackErr)
          }
        }
        
        return NextResponse.json(
          { error: "Kunde inte skapa prenumeration: " + createError.message },
          { status: 500 }
        )
      }
      
      console.log("Ny prenumeration skapad framgångsrikt:", newSubscription)
      return NextResponse.json({
        success: true,
        message: "Prenumeration skapad",
        subscription: newSubscription
      })
    }
    
  } catch (error: any) {
    console.error("Oväntat fel:", error)
    return NextResponse.json(
      { error: "Ett oväntat fel inträffade: " + (error.message || "Okänt fel") },
      { status: 500 }
    )
  }
} 