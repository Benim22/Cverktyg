import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Få access till Supabase serversidan - uppdaterad cookies-hantering
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Hämta användarens session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json({ error: "Kunde inte hämta session" }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ error: "Ingen session hittad" }, { status: 401 });
    }
    
    // Hämta data från request
    const requestData = await request.json();
    const { planData } = requestData;
    
    if (!planData) {
      return NextResponse.json({ error: "Prenumerationsdata saknas" }, { status: 400 });
    }
    
    console.log("Uppdaterar prenumeration för användare:", session.user.id, "med data:", planData);
    
    // Skapa en direktklient med service_role för admin-åtkomst (kringgår RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Steg 1: Hitta användarens ID i users-tabellen
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_id", session.user.id)
      .single();
      
    let userId = session.user.id;
    
    if (!userError && userData) {
      console.log("Hittade användare i users-tabellen:", userData.id);
      userId = userData.id;
    } else {
      console.log("Kunde inte hitta användare i users-tabellen, använder auth_id:", session.user.id);
      console.error("User error:", userError);
    }
    
    // Steg 2: Kontrollera om det finns en befintlig prenumeration
    const { data: existingSub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    const now = new Date().toISOString();
    let result;
    
    if (!subError && existingSub) {
      console.log("Uppdaterar befintlig prenumeration med admin-klient:", existingSub.id);
      
      // Uppdatera befintlig prenumeration med admin-klient
      const updateData = {
        ...planData,
        updated_at: now,
        user_id: userId
      };
      
      const { data: updatedSub, error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update(updateData)
        .eq("id", existingSub.id)
        .select()
        .maybeSingle();
        
      if (updateError) {
        console.error("Admin-klient kunde inte uppdatera prenumeration:", updateError);
        return NextResponse.json({ error: "Kunde inte uppdatera prenumeration" }, { status: 500 });
      }
      
      result = updatedSub;
    } else {
      console.log("Skapar ny prenumeration för användare med admin-klient:", userId);
      
      // Skapa ny prenumeration med admin-klient
      const newSubscription = {
        user_id: userId,
        plan: planData.plan || "free",
        status: planData.status || "active",
        starts_at: now,
        is_lifetime: planData.is_lifetime || false,
        expires_at: planData.expires_at || null,
        created_at: now,
        updated_at: now
      };
      
      console.log("Prenumerationsdata:", newSubscription);
      
      // Använd admin-klient för att lägga till prenumerationen
      const { data: createdSub, error: createError } = await supabaseAdmin
        .from("subscriptions")
        .insert(newSubscription)
        .select()
        .maybeSingle();
        
      if (createError) {
        console.error("Admin-klient kunde inte skapa prenumeration:", createError);
        return NextResponse.json({ error: "Kunde inte skapa prenumeration", details: createError }, { status: 500 });
      }
      
      result = createdSub;
      console.log("Prenumeration skapad med admin-klient:", result);
    }
    
    return NextResponse.json({ 
      success: true,
      subscription: result
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Ett oväntat fel uppstod", details: error }, { status: 500 });
  }
} 