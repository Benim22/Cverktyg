import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Få access till Supabase serversidan
    const supabase = createRouteHandlerClient({ cookies });
    
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
    
    // Steg 1: Hitta användarens ID i users-tabellen
    const { data: userData, error: userError } = await supabase
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
    const { data: existingSub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    const now = new Date().toISOString();
    let result;
    
    if (!subError && existingSub) {
      console.log("Uppdaterar befintlig prenumeration:", existingSub.id);
      
      // Uppdatera befintlig prenumeration
      const updateData = {
        ...planData,
        updated_at: now
      };
      
      const { data: updatedSub, error: updateError } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .maybeSingle();
        
      if (updateError) {
        console.error("Kunde inte uppdatera prenumeration:", updateError);
        return NextResponse.json({ error: "Kunde inte uppdatera prenumeration" }, { status: 500 });
      }
      
      result = updatedSub;
    } else {
      console.log("Skapar ny prenumeration för användare:", userId);
      
      // Skapa ny prenumeration
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
      
      const { data: createdSub, error: createError } = await supabase
        .from("subscriptions")
        .insert(newSubscription)
        .select()
        .maybeSingle();
        
      if (createError) {
        console.error("Kunde inte skapa prenumeration:", createError);
        return NextResponse.json({ error: "Kunde inte skapa prenumeration" }, { status: 500 });
      }
      
      result = createdSub;
    }
    
    return NextResponse.json({ 
      success: true,
      subscription: result
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Ett oväntat fel uppstod" }, { status: 500 });
  }
} 