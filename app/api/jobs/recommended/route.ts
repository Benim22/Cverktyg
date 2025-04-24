import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type CV } from '@/types/cv'

// Korrekta endpoint-URL:er för JobTech API
const JOBSEARCH_API_URL = 'https://jobsearch.api.jobtechdev.se/search'
const JOBSTREAM_API_URL = 'https://jobstream.api.jobtechdev.se/stream'
const PLATSBANKEN_SEARCH_URL = 'https://arbetsformedlingen.se/platsbanken/annonser'

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Hämta användarens session för att kolla om användaren är inloggad
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Session på serversidan:', !!session)
    
    if (!session) {
      console.error('Ingen inloggad session hittad')
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att få rekommenderade jobb' },
        { status: 401 }
      )
    }
    
    // 1. Hämta användarens profil för att få kontaktuppgifter
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('Fel vid hämtning av användarprofil:', profileError)
      return NextResponse.json(
        { error: 'Kunde inte hämta din profil: ' + profileError.message },
        { status: 500 }
      )
    }
    
    // 2. Hämta användarens senaste CV för att få yrkeskompetenser
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (cvError) {
      console.error('Fel vid hämtning av CV:', cvError)
      return NextResponse.json(
        { error: 'Kunde inte hitta ditt CV: ' + cvError.message },
        { status: 404 }
      )
    }
    
    if (!cv || !userProfile) {
      console.error('Ingen profildata eller CV-data hittades')
      return NextResponse.json(
        { error: 'Otillräcklig profildata för att hämta jobbförslag' },
        { status: 400 }
      )
    }
    
    // 3. Extrahera söktermer från profil och CV
    const searchTerms = extractSearchTerms(userProfile, cv)
    console.log('Extraherade söktermer:', searchTerms)
    
    if (!searchTerms.occupation && !searchTerms.location && (!searchTerms.skills || searchTerms.skills.length === 0)) {
      console.error('Inga söktermer kunde extraheras från profil eller CV')
      return NextResponse.json(
        { error: 'Kunde inte hitta tillräckligt med information i din profil. Vänligen uppdatera din profil med yrkestitel, plats eller kompetenser.' },
        { status: 400 }
      )
    }
    
    // 4. Bygg sökparameterarna för JobTech API
    const searchParams = new URLSearchParams()
    
    // Primär sökning baserad på yrke/kompetens
    if (searchTerms.occupation) {
      // Använd q-parameter för fritext sökning
      searchParams.append('q', searchTerms.occupation)
      console.log('Söker efter jobb med yrke/kompetens:', searchTerms.occupation)
    } else if (searchTerms.skills && searchTerms.skills.length > 0) {
      // Om ingen occupation finns, använd första kompetensen som sökning
      searchParams.append('q', searchTerms.skills[0])
      console.log('Söker efter jobb med kompetens:', searchTerms.skills[0])
    } else {
      // Använd en generisk sökning om ingen kompetens eller titel hittades
      searchParams.append('q', 'jobb')
      console.log('Ingen specifik kompetens hittad, använder generisk sökning "jobb"')
    }
    
    // Geografisk filtrering
    if (searchTerms.location) {
      // Rätt parameter är 'municipality' för kommuner
      searchParams.append('municipality', searchTerms.location)
      console.log('Filtrerar jobb efter plats:', searchTerms.location)
    }
    
    // Lägg till standardparametrar för sökningen
    searchParams.append('limit', '20') // Öka antal till 20 för att få fler träffar
    searchParams.append('sort', 'relevance')
    searchParams.append('offset', '0')
    
    // Prova att lägga till ett fält för resultatet
    searchParams.append('fields', 'id,headline,description,workplace_address,employer,application_details,publication_date,application_deadline,occupation,skills')
    
    // Testa att anropa API:et med ett alternativt anrop om inget annat fungerar
    let backupSearchParams = null
    if (searchTerms.location && !searchTerms.occupation && (!searchTerms.skills || searchTerms.skills.length === 0)) {
      // Om vi bara har plats men inga andra söktermer, skapa backup-sökning
      backupSearchParams = new URLSearchParams()
      backupSearchParams.append('q', 'jobb')
      backupSearchParams.append('municipality', searchTerms.location)
      backupSearchParams.append('limit', '20')
      backupSearchParams.append('sort', 'relevance')
      backupSearchParams.append('offset', '0')
      console.log('Skapar backup-sökning baserad på endast plats:', backupSearchParams.toString())
    }
    
    // Skapa länk till Platsbanken med samma sökparametrar
    const platsbankParams = new URLSearchParams()
    if (searchTerms.occupation) platsbankParams.append('q', searchTerms.occupation)
    if (searchTerms.location) platsbankParams.append('l', searchTerms.location)
    const platsbankLink = `${PLATSBANKEN_SEARCH_URL}?${platsbankParams.toString()}`
    
    // 5. Anropa JobTech API med de byggda sökparametrarna
    console.log('Anropar JobTech API URL:', `${JOBSEARCH_API_URL}?${searchParams.toString()}`)

    try {
      // Gör det primära anropet
      const response = await fetch(`${JOBSEARCH_API_URL}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api-key': process.env.JOBTECH_API_KEY || ''
        }
      })

      console.log('JobTech API svarstatus:', response.status)
      console.log('JobTech API svarsheaders:', JSON.stringify(Object.fromEntries([...response.headers.entries()])))

      // Om primära anropet inte lyckas och vi har en backup-sökning, prova den
      let jobData
      if (!response.ok && backupSearchParams) {
        console.log('Primärt anrop misslyckades, provar backup-sökning:', 
          `${JOBSEARCH_API_URL}?${backupSearchParams.toString()}`)
        
        const backupResponse = await fetch(`${JOBSEARCH_API_URL}?${backupSearchParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'api-key': process.env.JOBTECH_API_KEY || ''
          }
        })
        
        if (backupResponse.ok) {
          jobData = await backupResponse.json()
          console.log('Backup-sökning lyckades! Antal jobb:', jobData.hits?.length || 0)
        } else {
          // Prova en enkel sökning utan några specifika parametrar
          console.log('Även backup-sökningen misslyckades, provar en enkel sökning utan parametrar')
          const simpleParams = new URLSearchParams()
          simpleParams.append('limit', '20')
          simpleParams.append('sort', 'relevance')
          simpleParams.append('fields', 'id,headline,description,workplace_address,employer,application_details,publication_date,application_deadline,occupation,skills')
          
          const simpleResponse = await fetch(`${JOBSEARCH_API_URL}?${simpleParams.toString()}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'api-key': process.env.JOBTECH_API_KEY || ''
            }
          })
          
          if (simpleResponse.ok) {
            jobData = await simpleResponse.json()
            console.log('Enkel sökning lyckades! Antal jobb:', jobData.hits?.length || 0)
          } else {
            // Även enkel sökning misslyckades
            console.error('Alla sökningsförsök misslyckades:', 
              response.status, backupResponse.status, simpleResponse.status)
          
            // Försöka läsa felmeddelande från svaren
            let errorText = 'Kunde inte hämta jobb från JobTech API'
            try {
              const errorData = await response.text()
              errorText += `. Primärt fel: ${errorData}`
            } catch (e) {
              console.error('Kunde inte läsa primärt felmeddelande:', e)
            }
            
            return NextResponse.json({ 
              error: errorText,
              searchTerms, 
              apiUrl: `${JOBSEARCH_API_URL}?${searchParams.toString()}`,
              backupApiUrl: backupSearchParams ? `${JOBSEARCH_API_URL}?${backupSearchParams.toString()}` : null,
              simpleApiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
            }, { status: 500 })
          }
        }
      } else if (response.ok) {
        // Primär sökning lyckades
        jobData = await response.json()
        console.log('Primär sökning lyckades! Antal jobb:', jobData.hits?.length || 0)
      } else {
        // Prova en enkel sökning utan några specifika parametrar
        console.log('Primär sökning misslyckades, provar en enkel sökning utan parametrar')
        const simpleParams = new URLSearchParams()
        simpleParams.append('limit', '20')
        simpleParams.append('sort', 'relevance')
        simpleParams.append('fields', 'id,headline,description,workplace_address,employer,application_details,publication_date,application_deadline,occupation,skills')
        
        const simpleResponse = await fetch(`${JOBSEARCH_API_URL}?${simpleParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'api-key': process.env.JOBTECH_API_KEY || ''
          }
        })
        
        if (simpleResponse.ok) {
          jobData = await simpleResponse.json()
          console.log('Enkel sökning lyckades! Antal jobb:', jobData.hits?.length || 0)
        } else {
          // Även enkel sökning misslyckades
          console.error('Alla sökningsförsök misslyckades:', 
            response.status, simpleResponse.status)
        
          // Försöka läsa felmeddelande från svaren
          let errorText = 'Kunde inte hämta jobb från JobTech API'
          try {
            const errorData = await response.text()
            errorText += `. Fel: ${errorData}`
          } catch (e) {
            console.error('Kunde inte läsa felmeddelande:', e)
          }
          
          return NextResponse.json({ 
            error: errorText,
            searchTerms, 
            apiUrl: `${JOBSEARCH_API_URL}?${searchParams.toString()}`,
            simpleApiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
          }, { status: 500 })
        }
      }
      
      // Kontrollera om vi fick några jobb
      if (!jobData.hits || jobData.hits.length === 0) {
        console.log('Inga jobb hittades med de angivna parametrarna')
        
        // Skapa simpleParams för att fixa lint-fel
        const simpleParams = new URLSearchParams()
        simpleParams.append('limit', '20')
        simpleParams.append('sort', 'relevance')
        
        return NextResponse.json({ 
          jobs: [], 
          message: 'Inga matchande jobb hittades', 
          searchTerms,
          totalJobs: 0,
          apiUrl: `${JOBSEARCH_API_URL}?${searchParams.toString()}`,
          backupApiUrl: backupSearchParams ? `${JOBSEARCH_API_URL}?${backupSearchParams.toString()}` : null,
          simpleApiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
        })
      }

      // Transformera JobTech API-svaret till vår egen struktur
      const jobs = jobData.hits.map((job: any) => {
        const skills = extractSkillsFromJobTechJob(job)
        const companyName = job.employer?.name || 'Okänt företag'
        const city = job.workplace_address?.municipality || 'Okänd plats'
        
        return {
          id: job.id,
          title: job.headline || 'Jobbtitel saknas',
          company: companyName,
          location: city,
          url: job.application_details?.url || `${PLATSBANKEN_SEARCH_URL}/${job.id}`,
          description: job.description?.text || 'Ingen beskrivning tillgänglig',
          publishedAt: job.publication_date || new Date().toISOString(),
          deadline: job.application_deadline || 'Okänd deadline',
          skills: skills
        }
      })

      // Returnera de transformerade jobben
      const simpleParams = new URLSearchParams()
      simpleParams.append('limit', '20')
      simpleParams.append('sort', 'relevance')
      
      return NextResponse.json({ 
        jobs, 
        totalJobs: jobData.total?.value || jobs.length,
        searchTerms,
        apiUrl: `${JOBSEARCH_API_URL}?${searchParams.toString()}`,
        backupApiUrl: backupSearchParams ? `${JOBSEARCH_API_URL}?${backupSearchParams.toString()}` : null,
        simpleApiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
      })

    } catch (error) {
      console.error('Oväntat fel vid anrop till JobTech API:', error)
      
      // Skapa simpleParams för att fixa lint-fel
      const simpleParams = new URLSearchParams()
      simpleParams.append('limit', '20')
      simpleParams.append('sort', 'relevance')
      
      return NextResponse.json({ 
        error: `Ett oväntat fel inträffade: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        searchTerms,
        apiUrl: `${JOBSEARCH_API_URL}?${searchParams.toString()}`,
        backupApiUrl: backupSearchParams ? `${JOBSEARCH_API_URL}?${backupSearchParams.toString()}` : null,
        simpleApiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Oväntat fel:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade: ' + (error.message || 'Okänt fel') },
      { status: 500 }
    )
  }
}

// Extrahera söktermer från användarprofil och CV
function extractSearchTerms(userProfile: any, cv: any) {
  console.log('==== EXTRAHERAR SÖKTERMER ====')
  console.log('Profildata:', JSON.stringify({
    titel: userProfile?.title,
    ort: userProfile?.city,
    land: userProfile?.country
  }, null, 2))
  
  const searchTerms = {
    occupation: '',  // Yrkestitel
    location: '',    // Geografisk plats
    skills: [] as string[]  // Kompetenser
  }
  
  // Använd yrkestitel från profilen
  if (userProfile?.title) {
    searchTerms.occupation = userProfile.title
    console.log('Använder yrkestitel från profil:', userProfile.title)
  }
  
  // Kombinera ort och land för att få geografisk plats från profilen
  if (userProfile?.city) {
    searchTerms.location = userProfile.city
    console.log('Använder ort från profil:', userProfile.city)
  }
  
  // Om vi har CV-data, extrahera mer information
  if (cv) {
    // Parse CV-innehållet om det finns
    let cvContent: any = null
    try {
      // Vissa CV:n kan ha innehållet sparat som JSON-sträng
      if (typeof cv.content === 'string') {
        cvContent = JSON.parse(cv.content)
      } else {
        cvContent = cv.content
      }
    } catch (e) {
      console.error('Kunde inte tolka CV-innehåll:', e)
    }
    
    // Om vi har CV-innehåll, extrahera information
    if (cvContent) {
      // Om yrkestitel saknas från profilen, försök hämta från CV:t
      if (!searchTerms.occupation && cvContent.personalInfo?.title) {
        searchTerms.occupation = cvContent.personalInfo.title
        console.log('Använder yrkestitel från CV:', cvContent.personalInfo.title)
      }
      
      // Om plats saknas från profilen, försök hämta från CV:t
      if (!searchTerms.location && cvContent.personalInfo?.location) {
        searchTerms.location = cvContent.personalInfo.location
        console.log('Använder plats från CV:', cvContent.personalInfo.location)
      }
      
      // Extrahera kompetenser från CV:t
      if (cvContent.sections) {
        cvContent.sections.forEach((section: any) => {
          if (section.type === 'skills' && Array.isArray(section.items)) {
            section.items.forEach((skill: any) => {
              if (skill && skill.name) {
                searchTerms.skills.push(skill.name)
                console.log('Extraherade kompetens från CV:', skill.name)
              }
            })
          }
        })
      }
    }
  }
  
  return searchTerms
}

/**
 * Extrahera kompetenser från ett jobb
 */
function extractSkillsFromJobTechJob(job: any): string[] {
  const skills: string[] = []
  
  // Extrahera kompetenser från olika fält i JobTech-svaret
  if (job.skills && Array.isArray(job.skills)) {
    job.skills.forEach((skill: any) => {
      if (typeof skill === 'string') {
        skills.push(skill)
      } else if (skill && skill.name) {
        skills.push(skill.name)
      } else if (skill && skill.label) {
        skills.push(skill.label)
      }
    })
  }
  
  // Extrahera från kompetenstext
  if (job.skills_text && Array.isArray(job.skills_text)) {
    job.skills_text.forEach((skill: string) => {
      skills.push(skill)
    })
  }
  
  // Extrahera från nyckelord
  if (job.keywords && Array.isArray(job.keywords)) {
    job.keywords.forEach((keyword: any) => {
      if (typeof keyword === 'string') {
        skills.push(keyword)
      } else if (keyword && (keyword.term || keyword.value)) {
        skills.push(keyword.term || keyword.value)
      }
    })
  }
  
  // Ta bort duplicerade värden och begränsa till 10 kompetenser
  return [...new Set(skills)]
    .filter(skill => skill && skill.trim().length > 0)
    .slice(0, 10)
} 