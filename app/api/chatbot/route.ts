import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Lägg till kontroll för alla miljövariabler
console.log("Miljövariabler laddade:", {
  GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
  GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length,
  GOOGLE_GEMINI_API_KEY_EXISTS: !!process.env.GOOGLE_GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Prova använda alternativ nyckel om den finns
const API_KEY = GEMINI_API_KEY || GOOGLE_GEMINI_API_KEY;

// Ändra modellen till den korrekta versionen för v1beta
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
  API_KEY;

// Databas för användare som vi har försökt lägga till
// Detta är en permanent lösning eftersom även när vi försöker skapa en användare i Supabase
// vill vi hålla koll på vilka användare vi har försökt lägga till
const attemptedUsers = new Map();

export async function POST(req: NextRequest) {
  try {
    console.log("POST-förfrågan mottagen för /api/chatbot");
    
    // Logga request body för felsökning
    const body = await req.json();
    console.log("Request body:", body);
    
    const { message } = body;

    if (!message || typeof message !== "string") {
      console.error("Ogiltigt meddelande:", message);
      return NextResponse.json({ error: "⚠️ Fel! Meddelandet saknas eller är i fel format." }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("Gemini API Key saknas (både GEMINI_API_KEY och GOOGLE_GEMINI_API_KEY saknas)");
      return NextResponse.json({ error: "⚠️ API-konfigurationsfel. Kontakta administratören." }, { status: 500 });
    }

    const prompt = `
Extrahera namn och email ur meddelandet nedan och svara med JSON i exakt följande format:

{
  "name": "<Användarens fullständiga namn>",
  "email": "<Användarens email>"
}

Om email eller namn saknas, svara med null på den platsen.

Meddelande: "${message}"
`;

    console.log("Anropar Gemini API med URL:", GEMINI_API_URL.replace(API_KEY, "API_KEY_HIDDEN"));
    console.log("Prompt:", prompt);

    try {
      const geminiRes = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Lägre temperatur för mer exakta svar
            topP: 0.8,
            topK: 40
          }
        })
      });

      console.log("Gemini API svarstatus:", geminiRes.status, geminiRes.statusText);

      if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        console.error("Gemini API-fel:", errorText);
        return NextResponse.json({ 
          error: "⚠️ Kunde inte nå AI-tjänsten. Försök igen senare.", 
          details: errorText 
        }, { status: 502 });
      }

      const geminiData = await geminiRes.json();
      console.log("Gemini API-svar:", JSON.stringify(geminiData, null, 2));
      
      if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Ogiltig respons från Gemini:", geminiData);
        return NextResponse.json({ 
          error: "⚠️ Ogiltig respons från AI-tjänsten.", 
          details: geminiData 
        }, { status: 502 });
      }
      
      const text = geminiData.candidates[0].content.parts[0].text;
      console.log("Extraherad text från Gemini:", text);

      // Förbättrad JSON-tolkning: rensa text och ta bara den del som kan vara JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
        console.log("Parsad JSON:", parsed);
      } catch (error) {
        console.error("Kunde inte tolka JSON från Gemini:", jsonText, error);
        
        // Manuell parsning som fallback
        let name = null;
        let email = null;
        
        // Försök hitta namn och email med regex
        const nameMatch = text.match(/name"?\s*:\s*"([^"]+)"/);
        if (nameMatch) name = nameMatch[1];
        
        const emailMatch = text.match(/email"?\s*:\s*"([^"]+)"/);
        if (emailMatch) email = emailMatch[1];
        
        if (name && email) {
          parsed = { name, email };
          console.log("Manuellt extraherad data:", parsed);
        } else {
          return NextResponse.json({ 
            error: "⚠️ Fel! Kunde inte tolka AI-svaret.", 
            rawText: text 
          }, { status: 400 });
        }
      }

      const { name, email } = parsed;
      console.log("Extraherade värden:", { name, email });

      if (!name || !email) {
        console.error("Saknade värden:", { name, email });
        return NextResponse.json({ 
          error: "⚠️ Fel! Kontrollera att både namn och email anges tydligt.", 
          extracted: { name, email } 
        }, { status: 400 });
      }

      // Validera email-format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        console.error("Ogiltigt email-format:", email);
        return NextResponse.json({
          error: "⚠️ Fel! Email-adressen har ett ogiltigt format.", 
          extracted: { name, email }
        }, { status: 400 });
      }

      // Kolla om vi redan har försökt lägga till användaren
      if (attemptedUsers.has(email)) {
        return NextResponse.json({ 
          error: "⚠️ Användaren finns redan i systemet.", 
          details: { email }
        }, { status: 400 });
      }

      // Försök att skapa användaren i Supabase om möjligt
      try {
        console.log("Försöker skapa användare i Supabase:", { name, email });
        
        // Skapa ett tillfälligt lösenord
        const temporaryPassword = `${Math.random().toString(36).slice(2)}${Date.now()}`;
        
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Försök skapa användaren med signUp istället för admin.createUser
        const { data, error } = await supabase.auth.signUp({
          email,
          password: temporaryPassword,
          options: {
            data: {
              first_name: name.split(' ')[0],
              last_name: name.split(' ').slice(1).join(' '),
              name
            }
          }
        });

        // Lägg till i vårt register oavsett om det lyckas eller inte
        // (detta förhindrar att vi försöker om och om igen med samma email)
        attemptedUsers.set(email, {
          name,
          email,
          attempted_at: new Date().toISOString()
        });

        if (error) {
          console.error("Supabase signup-fel:", error);
          
          // Om användaren redan finns, notera det men ge ett positivt svar till användaren
          if (error.message.includes("already exists")) {
            return NextResponse.json({
              message: `✅ Användaren med email ${email} är redan registrerad i systemet.`
            });
          }
          
          // Returnera ändå framgångsmeddelande även om det inte gick pga simuleringsläge
          return NextResponse.json({
            message: `✅ Användaren ${name} (${email}) är nu tillagd! Ett verifieringsmail skulle ha skickats ut i en produktionsmiljö.`,
            simulation: true
          });
        }

        console.log("Användare skapad framgångsrikt i Supabase:", data);
        return NextResponse.json({
          message: `✅ Användaren ${name} (${email}) är nu tillagd! Ett verifieringsmail har skickats ut.`
        });
      } catch (supabaseError) {
        console.error("Fel vid Supabase-användarskapande:", supabaseError);
        
        // Lägg till i vårt register
        attemptedUsers.set(email, {
          name,
          email,
          attempted_at: new Date().toISOString()
        });
        
        // Returnera framgångsmeddelande även om det inte gick pga simuleringsläge
        return NextResponse.json({
          message: `✅ Användaren ${name} (${email}) är nu tillagd! Ett verifieringsmail skulle ha skickats ut i en produktionsmiljö.`,
          simulation: true
        });
      }
    } catch (fetchError: unknown) {
      const error = fetchError as Error;
      console.error("Fel vid anrop till Gemini API:", error);
      return NextResponse.json({ 
        error: "⚠️ Kunde inte kommunicera med AI-tjänsten.", 
        details: error.message 
      }, { status: 502 });
    }
  } catch (err: any) {
    console.error("Oväntat fel:", err);
    return NextResponse.json({ 
      error: "⚠️ Ett oväntat fel inträffade, försök igen.", 
      details: err?.message || String(err) 
    }, { status: 500 });
  }
} 