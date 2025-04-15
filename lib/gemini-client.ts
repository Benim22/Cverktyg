"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Konfigurera Gemini API med nyckel från miljövariabel
const apiKey = process.env.GOOGLE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// CV-specifik systemkontext för att guida AI:n
const CV_SYSTEM_CONTEXT = `
Du är en professionell CV-expert med omfattande erfarenhet av rekrytering och HR.
Din uppgift är att optimera CV-texter för att presentera kvalifikationer, erfarenheter och kompetenser
på bästa möjliga sätt.

Följ dessa riktlinjer:
1. Använd kraftfulla verb och precisa formuleringar
2. Fokusera på uppnådda resultat och mätbara prestationer
3. Anpassa språket till aktuell bransch och roll
4. Håll texten koncis och professionell
5. Lyft fram relevanta nyckelord för ATS-system
6. Behåll personens ursprungliga meriter och sanning
7. Använd aktivt språk istället för passivt
8. Håll tonen professionell men personlig
9. Betona hur kandidatens handlingar skapade värde
10. Översätt inte innehållet - behåll originalspråket (svenska eller engelska)

Du ska aldrig hitta på nya upplevelser eller kvalifikationer, utan endast omformulera 
och förbättra det befintliga innehållet.
`

// Generella inställningar för API:et
const defaultSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

/**
 * Förbättra CV-erfarenhetstext med AI-hjälp
 */
export async function improveExperienceText(
  companyName: string,
  jobTitle: string, 
  description: string
): Promise<string> {
  if (!genAI || !apiKey) {
    console.error("Gemini API-nyckel är inte konfigurerad")
    return description
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: defaultSafetySettings
    })

    const prompt = `
    Förbättra följande beskrivning av arbetserfarenhet för ett CV.
    
    Företag: ${companyName}
    Titel: ${jobTitle}
    Nuvarande beskrivning:
    ${description}
    
    Förbättra denna text genom att:
    - Använda kraftfulla verbfraser i början av varje punkt
    - Lyfta fram konkreta resultat och prestationer med siffror om möjligt
    - Använda branschrelevanta nyckelord
    - Strukturera texten som tydliga punkter (en mening per punkt)
    - Behålla det väsentliga innehållet men göra det mer professionellt
    - Begränsa till max 4-5 tydliga punkter
    
    VIKTIG INSTRUKTION: Om det saknas specifik information (t.ex. exakta siffror, teknologier):
    - Lämna INTE platshållare som [Specificera X]
    - Skriv istället texten så att den fungerar utan den specifika informationen
    - Undvik att nämna specifika teknologier om de inte redan fanns i originaltexten
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en kraftfull verbfras.
    Behåll originalspråket (svenska eller engelska).
    Använd en tydlig punktlista där varje punkt är på en egen rad med en tom rad mellan dem.
    `

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: CV_SYSTEM_CONTEXT },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    // Bearbeta svaret för att säkerställa att punkter hamnar på separata rader
    let formattedText = response.text().trim()
    
    // Normalisera olika typer av punktlistor
    formattedText = formattedText.replace(/^[•\-\*]\s+/gm, "• ")
    
    // Säkerställ att varje punkt börjar på en ny rad
    formattedText = formattedText.replace(/([.!?])\s+([•\-\*])/g, "$1\n\n$2")
    
    // Om punkter saknas, försök identifiera meningar och formatera dem som punkter
    if (!formattedText.includes("•")) {
      formattedText = formattedText.replace(/([.!?])\s+(?=[A-ZÅÄÖ])/g, "$1\n\n• ")
      if (!formattedText.startsWith("•")) {
        formattedText = "• " + formattedText
      }
    }
    
    return formattedText

  } catch (error) {
    console.error("Fel vid förbättring av erfarenhetstext:", error)
    return description
  }
}

/**
 * Förbättra CV-utbildningstext med AI-hjälp
 */
export async function improveEducationText(
  institution: string,
  degree: string,
  field: string,
  description: string
): Promise<string> {
  if (!genAI || !apiKey) {
    console.error("Gemini API-nyckel är inte konfigurerad")
    return description
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: defaultSafetySettings
    })

    const prompt = `
    Förbättra följande beskrivning av utbildning för ett CV.
    
    Lärosäte: ${institution}
    Examen: ${degree}
    Studieområde: ${field}
    Nuvarande beskrivning:
    ${description}
    
    Förbättra denna text genom att:
    - Betona relevanta kurser och kunskaper
    - Lyfta fram eventuella prestationer eller utmärkelser
    - Strukturera texten som tydliga punkter (en mening per punkt)
    - Börja varje punkt med en aktiv verbfras
    - Fokusera på uppnådda färdigheter och relevanta projekt
    - Begränsa till max 3-4 tydliga punkter
    
    VIKTIG INSTRUKTION: Om det saknas specifik information (t.ex. exakta kurser, projekt):
    - Lämna INTE platshållare som [Specificera X]
    - Skriv istället texten så att den fungerar utan den specifika informationen
    - Undvik att hitta på kurser eller projekt som inte nämndes i originaltexten
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en aktiv verbfras.
    Behåll originalspråket (svenska eller engelska).
    Använd en tydlig punktlista där varje punkt är på en egen rad med en tom rad mellan dem.
    `

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: CV_SYSTEM_CONTEXT },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    // Bearbeta svaret för att säkerställa att punkter hamnar på separata rader
    let formattedText = response.text().trim()
    
    // Normalisera olika typer av punktlistor
    formattedText = formattedText.replace(/^[•\-\*]\s+/gm, "• ")
    
    // Säkerställ att varje punkt börjar på en ny rad
    formattedText = formattedText.replace(/([.!?])\s+([•\-\*])/g, "$1\n\n$2")
    
    // Om punkter saknas, försök identifiera meningar och formatera dem som punkter
    if (!formattedText.includes("•")) {
      formattedText = formattedText.replace(/([.!?])\s+(?=[A-ZÅÄÖ])/g, "$1\n\n• ")
      if (!formattedText.startsWith("•")) {
        formattedText = "• " + formattedText
      }
    }
    
    return formattedText

  } catch (error) {
    console.error("Fel vid förbättring av utbildningstext:", error)
    return description
  }
}

/**
 * Förbättra CV-sammanfattning med AI-hjälp
 */
export async function improveSummary(
  name: string,
  title: string,
  summary: string
): Promise<string> {
  if (!genAI || !apiKey) {
    console.error("Gemini API-nyckel är inte konfigurerad")
    return summary
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: defaultSafetySettings
    })

    const prompt = `
    Förbättra följande personliga sammanfattning för ett CV.
    
    Person: ${name}
    Yrkestitel: ${title}
    Nuvarande sammanfattning:
    ${summary}
    
    Förbättra denna sammanfattning genom att:
    - Göra den mer koncis och professionell men personlig
    - Betona konkreta nyckelkompetenser och styrkor
    - Använda branschrelevant terminologi (ENDAST om den nämns i originaltexten)
    - Skapa en stark inledning som fångar uppmärksamhet
    - Begränsa till 2-3 korta stycken (5-6 meningar totalt)
    - Undvika klichéer och tomma fraser (som "driven" eller "passionerad")
    
    VIKTIG INSTRUKTION: Om det saknas specifik information (t.ex. specifika färdigheter, teknologier):
    - Lämna INTE platshållare som [Specificera X]
    - Skriv istället texten så att den fungerar utan den specifika informationen
    - Undvik att hitta på kompetenser eller erfarenheter som inte nämndes i originaltexten
    
    Ge en sammanhängande text i korta stycken som flyter naturligt. Använd radbrytningar mellan styckena.
    Behåll originalspråket (svenska eller engelska).
    `

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: CV_SYSTEM_CONTEXT },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    // Bearbeta svaret för att säkerställa att stycken hamnar på separata rader
    let formattedText = response.text().trim()
    
    // Säkerställ radbrytningar mellan stycken
    formattedText = formattedText.replace(/([.!?])\s+([A-ZÅÄÖ])/g, "$1\n\n$2");
    
    return formattedText

  } catch (error) {
    console.error("Fel vid förbättring av sammanfattning:", error)
    return summary
  }
}

/**
 * Förbättra projektbeskrivning med AI-hjälp
 */
export async function improveProjectText(
  projectName: string,
  role: string,
  description: string
): Promise<string> {
  if (!genAI || !apiKey) {
    console.error("Gemini API-nyckel är inte konfigurerad")
    return description
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: defaultSafetySettings
    })

    const prompt = `
    Förbättra följande projektbeskrivning för ett CV.
    
    Projektnamn: ${projectName}
    Roll: ${role}
    Nuvarande beskrivning:
    ${description}
    
    Förbättra denna beskrivning genom att:
    - Betona konkreta resultat och specifika bidrag
    - Inkludera tekniker/metoder som används (ENDAST om de nämns i originaltexten)
    - Strukturera texten som tydliga punkter (en mening per punkt)
    - Börja varje punkt med en kraftfull verbfras
    - Lyfta fram utmaningar som övervunnits och lösningar
    - Framhäva positiv påverkan
    - Begränsa till max 3-4 tydliga punkter
    
    VIKTIG INSTRUKTION: Om det saknas specifik information (t.ex. tekniker, resultat):
    - Lämna INTE platshållare som [Specificera X]
    - Skriv istället texten så att den fungerar utan den specifika informationen
    - Undvik att hitta på tekniker eller specifika mätvärden som inte nämndes i originaltexten
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en kraftfull verbfras.
    Behåll originalspråket (svenska eller engelska).
    Använd en tydlig punktlista där varje punkt är på en egen rad med en tom rad mellan dem.
    `

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: CV_SYSTEM_CONTEXT },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    // Bearbeta svaret för att säkerställa att punkter hamnar på separata rader
    let formattedText = response.text().trim()
    
    // Normalisera olika typer av punktlistor
    formattedText = formattedText.replace(/^[•\-\*]\s+/gm, "• ")
    
    // Säkerställ att varje punkt börjar på en ny rad
    formattedText = formattedText.replace(/([.!?])\s+([•\-\*])/g, "$1\n\n$2")
    
    // Om punkter saknas, försök identifiera meningar och formatera dem som punkter
    if (!formattedText.includes("•")) {
      formattedText = formattedText.replace(/([.!?])\s+(?=[A-ZÅÄÖ])/g, "$1\n\n• ")
      if (!formattedText.startsWith("•")) {
        formattedText = "• " + formattedText
      }
    }
    
    return formattedText

  } catch (error) {
    console.error("Fel vid förbättring av projektbeskrivning:", error)
    return description
  }
} 