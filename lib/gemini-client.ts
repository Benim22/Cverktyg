"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Konfigurera Gemini API med nyckel från miljövariabel
const apiKey = process.env.GOOGLE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// CV-specifik systemkontext för att guida AI:n
const CV_SYSTEM_CONTEXT = `
Du är en professionell CV-expert med omfattande erfarenhet av rekrytering, HR och karriärvägledning på den svenska arbetsmarknaden.
Din uppgift är att optimera CV-texter för att presentera kvalifikationer, erfarenheter och kompetenser
på bästa möjliga sätt på svenska.

Följ dessa riktlinjer:
1. Använd kraftfulla och precisa verbfraser i början av varje punkt (t.ex. "utvecklade", "implementerade", "effektiviserade")
2. Fokusera på uppnådda resultat och kvantifiera prestationer med siffror där möjligt (t.ex. "ökade försäljningen med 25%")
3. Använd branschspecifik terminologi som matchar den aktuella positionen eller branschen
4. Håll texten koncis och professionell - använd tydlig och direkt kommunikation
5. Inkludera relevanta nyckelord för ATS-system utan att det känns onaturligt
6. Behåll personens ursprungliga meriter och var helt sanningsenlig
7. Använd aktivt språk och undvik passiva konstruktioner
8. Var personlig men behåll en professionell ton genomgående
9. Betona värdeskapande aktiviteter - hur kandidatens insatser ledde till konkreta fördelar
10. Använd korrekt svensk grammatik och stavning

För olika delar av CV:t:
* Personliga sammanfattningar: Skapa en stark, koncis introduktion (3-5 meningar) som snabbt fångar läsarens intresse
* Erfarenhetsbeskrivningar: Strukturera som tydliga punkter med fokus på resultat och ansvarsområden
* Kompetensbeskrivningar: Kategorisera tydligt och visa behärskningsnivå där relevant
* Projektbeskrivningar: Betona din roll, projektets syfte och det uppnådda resultatet

Du ska aldrig hitta på nya upplevelser eller kvalifikationer, utan endast omformulera 
och förbättra det befintliga innehållet på ett professionellt sätt som ökar chansen till arbetsintervju.
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
    - Använda kraftfulla verbfraser i början av varje punkt (som "utvecklade", "implementerade", "effektiviserade", "optimerade")
    - Lyfta fram konkreta resultat och kvantifiera prestationer med siffror där möjligt (t.ex. "Ökade försäljningen med 25%" eller "Effektiviserade processer som sparade 10 timmar per vecka")
    - Inkludera branschrelevanta nyckelord som passar för tjänsten och företaget
    - Strukturera texten som tydliga punkter (en mening per punkt)
    - Lyfta fram ansvar, prestationer och konkreta bidrag som visar värdet av ditt arbete
    - Visa på progression och utveckling i rollen om relevant
    - Begränsa till max 4-5 tydliga punkter
    
    VIKTIG INSTRUKTION: Om det saknas specifik information (t.ex. exakta siffror, teknologier):
    - Fokusera på resultat och värdeskapande aktiviteter även utan exakta siffror
    - Lämna INTE platshållare som [Specificera X]
    - Skriv istället texten så att den fungerar utan den specifika informationen och uppmuntrar läsaren att fråga mer
    - Undvik att nämna specifika teknologier om de inte redan fanns i originaltexten
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en kraftfull verbfras.
    Behåll svenska som språk.
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
    - Betona konkreta kunskaper och färdigheter som erhållits genom utbildningen
    - Lyfta fram relevanta kurser, projekt och examensarbeten som är särskilt värdefulla för arbetsmarknaden
    - Framhäva prestationer, utmärkelser eller stipendier om sådana finns
    - Visa hur utbildningen är relevant för den karriär kandidaten eftersträvar
    - Använda aktiva verbfraser i början av varje punkt (t.ex. "förvärvade djupgående kunskaper inom", "utvecklade färdigheter i")
    - Inkludera viktiga metoder, teorier eller teknologier som lärts ut i utbildningen
    - Nämna samarbetsprojekt eller praktiska erfarenheter som del av utbildningen
    - Begränsa till 3-4 tydliga punkter som visar värdet av utbildningen
    
    VIKTIG INSTRUKTION: Om det saknas specifik information:
    - Fokusera på det som faktiskt nämns i den ursprungliga texten
    - Undvik att hitta på kurser eller specifika projekt som inte nämndes i originaltexten
    - Formulera texten så att den visar värdet av utbildningen även utan specifika detaljer
    - Använd branschrelevanta termer som är kopplade till utbildningsområdet
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en aktiv verbfras.
    Språket ska vara svenska och ha en professionell ton.
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
    - Skapa en stark inledande mening som fångar uppmärksamhet och tydligt definierar kandidatens yrkesidentitet
    - Betona specifika nyckelkompetenser och expertisområden som är relevanta för yrkesrollen
    - Lyfta fram konkreta prestationer och resultat med siffror när möjligt (t.ex. "förbättrat processeffektiviteten med 30%")
    - Inkludera relevant erfarenhet och antalet år inom branschen för att understryka expertis
    - Nämna särskiljande egenskaper som gör kandidaten unik (specialistkunskaper, certifieringar, etc.)
    - Avsluta med en tydlig formulering av vad kandidaten kan bidra med till en arbetsgivare
    - Begränsa till 3-5 meningar eller max 2 korta stycken (totalt 6-8 rader)
    - Ge ett modernt och professionellt intryck som är anpassat till svensk arbetsmarknad
    
    VIKTIG INSTRUKTION: Om det saknas specifik information:
    - Fokusera på det som faktiskt nämns i den ursprungliga texten
    - Undvik klichéer och generiska beskrivningar (som endast "driven" eller "passionerad")
    - Undvik att hitta på kompetenser eller erfarenheter som inte nämndes i originaltexten
    - Skapa en sammanfattning som känns personlig och unik, inte en generisk mall
    
    Ge en sammanhängande text i korta, kraftfulla meningar som flyter naturligt. Använd radbrytningar mellan styckena.
    Språket ska vara svenska och ha en professionell ton.
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
    - Inleda varje punkt med kraftfulla, aktionsorienterade verb som visar på ledarskap och initiativförmåga
    - Tydligt definiera din specifika roll och ditt ansvarsområde i projektet
    - Beskriva projektets syfte och omfattning på ett koncist sätt
    - Betona konkreta resultat och mätbara framgångar med siffror när möjligt (t.ex. "slutförde projektet 15% under budget")
    - Framhäva problem som löstes och utmaningar som övervunnits
    - Inkludera relevanta metoder, tekniker eller verktyg som användes (ENDAST om de nämns i originaltexten)
    - Visa på affärsvärdet och den positiva påverkan projektet hade
    - Lyfta fram samarbete och gruppresultat med fokus på din del i processen
    - Begränsa till 3-4 tydliga och informativa punkter
    
    VIKTIG INSTRUKTION: Om det saknas specifik information:
    - Fokusera på det som faktiskt nämns i den ursprungliga texten
    - Undvik att hitta på tekniker, resultat eller specifika mätvärden som inte nämndes i originaltexten
    - Formulera texten så att den visar projektets värde och ditt bidrag även utan detaljerad information
    - Använd termer och uttryck som är värdeskapande och visar på professionalism
    
    Ge texten i form av tydliga punkter där varje punkt börjar med en kraftfull verbfras.
    Språket ska vara svenska och ha en professionell ton.
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