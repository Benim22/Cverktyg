import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Få access till Supabase serversidan
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
    
    const authUserId = session.user.id;
    console.log("Auth user ID:", authUserId);
    
    // Steg 1: Kontrollera om vi har en direkt koppling i subscriptions
    const { data: directSub, error: directError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", authUserId)
      .single();
      
    if (!directError && directSub) {
      return NextResponse.json({ subscription: directSub, source: "direct" });
    }
    
    console.log("Ingen direkt matchning. Kontrollerar users-tabellen");
    
    // Steg 2: Kontrollera om det finns en användare med auth_id = authUserId
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, auth_id, email")
      .eq("auth_id", authUserId)
      .single();
      
    if (userError) {
      console.error("User error:", userError);
      
      // Om vi inte kan hitta en koppling, returnera en standardprenumeration
      return NextResponse.json({
        subscription: {
          id: "",
          user_id: authUserId,
          plan: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        source: "default"
      });
    }
    
    console.log("User found:", userData);
    
    // Steg 3: Använd user.id för att hitta prenumeration
    const { data: userSub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userData.id)
      .single();
      
    if (!subError && userSub) {
      return NextResponse.json({ subscription: userSub, source: "user_id" });
    }
    
    console.log("Ingen prenumeration hittad för användaren, skapar en standardprenumeration");
    
    // Steg 4: Skapa en prenumeration om ingen hittades
    try {
      const { data: newSub, error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userData.id,
          plan: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Create subscription error:", createError);
        throw createError;
      }
      
      return NextResponse.json({ subscription: newSub, source: "created" });
    } catch (createErr) {
      // Returnera en standardprenumeration om vi inte kan skapa en
      return NextResponse.json({
        subscription: {
          id: "",
          user_id: userData.id,
          plan: "free",
          status: "active",
          starts_at: new Date().toISOString(),
          is_lifetime: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        source: "default_after_error"
      });
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Ett oväntat fel uppstod" }, { status: 500 });
  }
} 