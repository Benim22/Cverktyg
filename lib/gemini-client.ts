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
    - Använda kraftfulla verbfraser
    - Lyfta fram resultat och prestationer med siffror om möjligt
    - Använda branschrelevanta nyckelord
    - Behålla det väsentliga innehållet men göra det mer professionellt
    - Begränsa till max 5-6 punkter eller kortare stycken
    
    Ge ENDAST den förbättrade texten som svar, utan några förklaringar eller inledningar.
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
        temperature: 0.5,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    return response.text().trim()

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
    - Nämna eventuella prestationer eller utmärkelser
    - Lyfta fram relevanta projektarbeten
    - Göra det mer fokuserat på uppnådda färdigheter
    - Begränsa till max 4-5 punkter eller kortare stycken
    
    Ge ENDAST den förbättrade texten som svar, utan några förklaringar eller inledningar.
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
        temperature: 0.5,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    return response.text().trim()

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
    - Betona nyckelkompetenser och styrkor
    - Lyfta fram karriärmål och värderingar
    - Använda branschrelevant terminologi
    - Skapa en stark inledning som fångar uppmärksamhet
    - Begränsa till max 2-3 korta stycken
    
    Ge ENDAST den förbättrade texten som svar, utan några förklaringar eller inledningar.
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
        temperature: 0.5,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    return response.text().trim()

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
    - Betona uppnådda resultat och ditt specifika bidrag
    - Inkludera tekniker/metoder som användes
    - Lyfta fram eventuella utmaningar som övervunnits
    - Framhäva positiv påverkan på organisationen eller kunder
    - Begränsa till max 4-5 punkter eller kortare stycken
    
    Ge ENDAST den förbättrade texten som svar, utan några förklaringar eller inledningar.
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
        temperature: 0.5,
        maxOutputTokens: 800
      }
    })

    const response = result.response
    return response.text().trim()

  } catch (error) {
    console.error("Fel vid förbättring av projektbeskrivning:", error)
    return description
  }
} 