import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()
    
    // För att verifiera/validera inputdata
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Alla fält måste fyllas i" },
        { status: 400 }
      )
    }

    // Skapa en server-klient direkt
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 1. Registrera användaren i Auth-systemet
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${request.headers.get("origin")}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Misslyckades med att skapa användare" },
        { status: 500 }
      )
    }

    // Skapa admin-klient för direkt användning
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 2. Skapa användare i users-tabellen med admin-behörighet
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert([
        { 
          id: authData.user.id,
          auth_id: authData.user.id,
          email,
          first_name: firstName, 
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])

    if (userError) {
      console.error("Error inserting user data:", userError)
      return NextResponse.json(
        { error: "Misslyckades med att skapa användarprofil", details: userError },
        { status: 500 }
      )
    }

    // 3. Skapa gratisprenumeration med admin-behörighet
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .insert([
        {
          user_id: authData.user.id,
          plan: 'free',
          status: 'active',
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])

    if (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError)
      return NextResponse.json(
        { error: "Misslyckades med att skapa prenumeration", details: subscriptionError },
        { status: 500 }
      )
    }

    // Allt är OK!
    return NextResponse.json({ 
      success: true, 
      message: "Användare skapad framgångsrikt, verifiera din e-post för att fortsätta" 
    })
  } catch (error) {
    console.error("Unexpected error during signup:", error)
    return NextResponse.json(
      { error: "Ett oväntat fel inträffade" },
      { status: 500 }
    )
  }
} 