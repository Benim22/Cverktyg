import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Korrekta endpoint-URL:er för JobTech API
const JOBSEARCH_API_URL = 'https://jobsearch.api.jobtechdev.se/search'
const PLATSBANKEN_SEARCH_URL = 'https://arbetsformedlingen.se/platsbanken/annonser'

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Hämta användarens session för att kolla om användaren är inloggad
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Session på serversidan (simple):', !!session)
    
    if (!session) {
      console.error('Ingen inloggad session hittad')
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att söka jobb' },
        { status: 401 }
      )
    }
    
    // Skapa en enkel sökfråga utan specifika parametrar
    const simpleParams = new URLSearchParams()
    simpleParams.append('limit', '20')
    simpleParams.append('sort', 'relevance')
    simpleParams.append('fields', 'id,headline,description,workplace_address,employer,application_details,publication_date,application_deadline,occupation,skills')
    
    console.log('Anropar JobTech API med enkel sökning:', `${JOBSEARCH_API_URL}?${simpleParams.toString()}`)
    
    try {
      // Gör ett enkelt anrop till JobTech API
      const response = await fetch(`${JOBSEARCH_API_URL}?${simpleParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api-key': process.env.JOBTECH_API_KEY || ''
        }
      })
      
      console.log('JobTech API svarstatus (simple):', response.status)
      console.log('JobTech API svarsheaders (simple):', JSON.stringify(Object.fromEntries([...response.headers.entries()])))
      
      if (!response.ok) {
        console.error('API-anropet misslyckades:', response.status)
        let errorText = 'Kunde inte hämta jobb från JobTech API'
        try {
          const errorData = await response.text()
          errorText += `. Fel: ${errorData}`
        } catch (e) {
          console.error('Kunde inte läsa felmeddelande:', e)
        }
        
        return NextResponse.json({ 
          error: errorText,
          apiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
        }, { status: 500 })
      }
      
      const jobData = await response.json()
      
      // Kontrollera om vi fick några jobb
      if (!jobData.hits || jobData.hits.length === 0) {
        console.log('Inga jobb hittades med enkel sökning')
        return NextResponse.json({ 
          jobs: [], 
          message: 'Inga jobb hittades med enkel sökning', 
          totalJobs: 0,
          apiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
        })
      }
      
      console.log('Enkel sökning lyckades! Antal jobb:', jobData.hits?.length || 0)
      
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
      return NextResponse.json({ 
        jobs, 
        totalJobs: jobData.total?.value || jobs.length,
        apiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
      })
      
    } catch (error) {
      console.error('Oväntat fel vid anrop till JobTech API:', error)
      return NextResponse.json({ 
        error: `Ett oväntat fel inträffade: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        apiUrl: `${JOBSEARCH_API_URL}?${simpleParams.toString()}`
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