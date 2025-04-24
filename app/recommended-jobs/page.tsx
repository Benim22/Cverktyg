"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar } from "@/components/ui/avatar"
import { Briefcase, Calendar, Clock, ExternalLink, MapPin, Search, Building, Award, ThumbsUp, ChevronDown, ChevronUp, CheckIcon, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Job {
  id: string
  headline: string
  description: string
  employer: {
    name: string
    logoUrl?: string
  }
  location: string
  publishedAt: string
  deadline: string
  applicationUrl: string
  workType: string
  skills: string[]
  salary?: string
}

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [simpleJobs, setSimpleJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [simpleLoading, setSimpleLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [expandedSimpleJobId, setExpandedSimpleJobId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [simpleErrorMsg, setSimpleErrorMsg] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [platsbankLink, setPlatsbankLink] = useState<string>('https://arbetsformedlingen.se/platsbanken/annonser')
  const [searchTerms, setSearchTerms] = useState<any>(null)
  const [apiDebugInfo, setApiDebugInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Separera autentiseringskollen från jobbhämtningen
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session på klientsidan:', !!session)
        console.log('User ID på klientsidan:', session?.user?.id)
        
        setIsAuthenticated(!!session)
        
        if (!session) {
          setErrorMsg("Du måste vara inloggad för att se rekommenderade jobb")
          setLoading(false)
          
          // Försök att refresha sessionen
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError || !refreshData.session) {
            console.log('Kunde inte refresha sessionen:', refreshError)
            
            // Visa en toast med info om att användaren behöver logga in
            toast({
              title: "Inloggning krävs",
              description: "Du behöver logga in för att se rekommenderade jobb.",
              variant: "destructive"
            })
            
            // Omdirigera till inloggningssidan efter en kort fördröjning
            setTimeout(() => {
              router.push('/auth/signin?returnUrl=/recommended-jobs')
            }, 2000)
          } else {
            console.log('Session refreshad, användaren är nu inloggad')
            setIsAuthenticated(true)
            setErrorMsg(null)
            // Nu när vi är autentiserade kan vi hämta jobben
            fetchRecommendedJobs()
          }
        }
      } catch (error) {
        console.error('Fel vid kontroll av autentisering:', error)
        setIsAuthenticated(false)
        setLoading(false)
        setErrorMsg("Ett fel uppstod vid kontroll av inloggningsstatus")
      }
    }
    
    checkAuthentication()
  }, [router, supabase, toast])
  
  // Separat useEffect för hämtning av jobb som körs när authentication status ändras
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendedJobs()
      fetchSimpleJobs()
    }
  }, [isAuthenticated])

  const fetchRecommendedJobs = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      setErrorMsg(null)
      setApiDebugInfo(null)
      
      // Anropa vår egen API-endpoint som i sin tur anropar JobTech API
      const response = await fetch('/api/jobs/recommended', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Viktigt för att skicka med cookies/auth
        credentials: 'include'
      })
      
      const data = await response.json()
      
      // Spara all debugging-information från API:et
      if (data.searchParams || data.searchTerms) {
        setApiDebugInfo({
          searchParams: data.searchParams,
          searchTerms: data.searchTerms
        })
        setSearchTerms(data.searchTerms)
      }
      
      if (!response.ok) {
        console.error("API-anrop misslyckades:", data.error)
        setErrorMsg(data.error || "Ett fel uppstod vid hämtning av jobb")
        setJobs([])
        
        // Visa en tydligare toast med felinformation
        toast({
          title: "Jobbsökning misslyckades",
          description: data.error || "Kunde inte hämta jobb från API:et",
          variant: "destructive"
        })
        
        // Om vi fick 401, behöver vi refresha sessionen eller omdirigera
        if (response.status === 401) {
          toast({
            title: "Sessionen har utgått",
            description: "Din session har utgått. Du omdirigeras till inloggningssidan.",
            variant: "destructive"
          })
          
          setTimeout(() => {
            router.push('/auth/signin?returnUrl=/recommended-jobs')
          }, 2000)
        }
        return
      }
      
      // Om vi fick tomt svar men utan felmeddelande
      if (data.jobs?.length === 0) {
        setJobs([])
        setErrorMsg(data.message || "Inga jobb hittades som matchar din profil")
        
        toast({
          title: "Inga matchande jobb",
          description: "Vi kunde inte hitta några jobb som matchar din profil. Prova att uppdatera din profil med mer information.",
          duration: 5000,
        })
      } else {
        // Om vi fick jobb
        setJobs(data.jobs || [])
        
        // Om det finns varningar i svaret
        if (data.warning) {
          toast({
            title: "Information",
            description: data.warning,
            duration: 5000,
          })
        }
        
        // Om det finns ett meddelande
        if (data.message) {
          toast({
            title: "Information",
            description: data.message,
            duration: 5000,
          })
        }
      }
      
      // Spara länk till Platsbanken om den finns i svaret
      if (data.platsbankLink) {
        setPlatsbankLink(data.platsbankLink)
      }
    } catch (error) {
      console.error("Fel vid hämtning av rekommenderade jobb:", error)
      setErrorMsg("Kunde inte ansluta till servern. Försök igen senare.")
      setJobs([])
      
      toast({
        title: "Fel vid hämtning av jobb",
        description: "Kunde inte hämta rekommenderade jobb just nu. Försök igen senare.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Funktion för att hämta jobb utan parametrar
  const fetchSimpleJobs = async () => {
    if (!isAuthenticated) return
    
    try {
      setSimpleLoading(true)
      setSimpleErrorMsg(null)
      
      // Gör en enkel API-anrop direkt till JobTech API utan parametrar
      const response = await fetch('/api/jobs/simple', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error("Enkelt API-anrop misslyckades:", data.error)
        setSimpleErrorMsg(data.error || "Ett fel uppstod vid hämtning av jobb")
        setSimpleJobs([])
        return
      }
      
      // Om vi fick tomt svar men utan felmeddelande
      if (data.jobs?.length === 0) {
        setSimpleJobs([])
        setSimpleErrorMsg(data.message || "Inga jobb hittades")
      } else {
        // Om vi fick jobb
        setSimpleJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Fel vid hämtning av enkla jobb:", error)
      setSimpleErrorMsg("Kunde inte ansluta till servern. Försök igen senare.")
      setSimpleJobs([])
    } finally {
      setSimpleLoading(false)
    }
  }

  const toggleExpandJob = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
    } else {
      setExpandedJobId(jobId)
    }
  }

  const toggleExpandSimpleJob = (jobId: string) => {
    if (expandedSimpleJobId === jobId) {
      setExpandedSimpleJobId(null)
    } else {
      setExpandedSimpleJobId(jobId)
    }
  }

  // Rendrera debugging-information om det finns
  const renderDebugInfo = () => {
    if (!apiDebugInfo) return null;
    
    return (
      <div className="mt-8 p-4 bg-muted rounded-lg text-xs">
        <h4 className="font-semibold mb-2">Sökinformation</h4>
        {searchTerms && (
          <div className="mb-2">
            <p><strong>Yrkestitel:</strong> {searchTerms.occupation || 'Ej angiven'}</p>
            <p><strong>Plats:</strong> {searchTerms.location || 'Ej angiven'}</p>
            <p><strong>Kompetenser:</strong> {searchTerms.skills?.join(', ') || 'Inga hittades'}</p>
          </div>
        )}
        {apiDebugInfo.searchParams && (
          <details>
            <summary className="cursor-pointer hover:text-primary">Visa API-sökparametrar</summary>
            <pre className="mt-2 p-2 bg-background overflow-auto max-h-40 rounded-sm">
              {JSON.stringify(apiDebugInfo.searchParams, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  // Renderar jobbkort för enkla jobb
  const renderSimpleJobCard = (job: Job, index: number) => {
    const isExpanded = expandedSimpleJobId === job.id
    
    return (
      <motion.div 
        key={job.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className={cn(
          "mb-4 overflow-hidden group transition-all duration-300",
          isExpanded ? "ring-2 ring-primary" : "hover:shadow-md"
        )}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg sm:text-xl font-bold line-clamp-2">
                {job.headline || job.title}
              </CardTitle>
              {job.employer?.logoUrl && (
                <Avatar className="ml-4 h-10 w-10">
                  <img src={job.employer.logoUrl} alt={`${job.employer.name} logo`} />
                </Avatar>
              )}
            </div>
            <CardDescription className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Building className="mr-1 h-4 w-4" />
                {job.employer?.name || 'Okänt företag'}
              </span>
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {job.location || 'Okänd plats'}
              </span>
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('sv-SE') : 'Okänt datum'}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            {/* Kompetenser som badges */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.skills.slice(0, isExpanded ? undefined : 5).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs whitespace-normal text-center">
                    {skill}
                  </Badge>
                ))}
                {!isExpanded && job.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs whitespace-normal text-center">
                    +{job.skills.length - 5} till
                  </Badge>
                )}
              </div>
            )}
            
            {/* Beskrivning med expandera/kollapsa */}
            <div>
              <div className={cn(
                "text-sm relative", 
                !isExpanded && "max-h-16 overflow-hidden"
              )}>
                <p>{isExpanded ? job.description : job.description?.substring(0, 100) + '...'}</p>
                
                {!isExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleExpandSimpleJob(job.id)}
            >
              {isExpanded ? (
                <><ChevronUp className="mr-1 h-4 w-4" /> Visa mindre</>
              ) : (
                <><ChevronDown className="mr-1 h-4 w-4" /> Visa mer</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <a 
                href={job.applicationUrl || job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Visa jobb
              </a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-7xl py-10 px-4 sm:px-6 md:py-16"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Rekommenderade jobb
            </h1>
            <p className="mt-2 text-muted-foreground">
              Jobbförslag baserade på din CV-profil
            </p>
          </div>
          <Button 
            onClick={fetchRecommendedJobs} 
            disabled={loading}
            variant="outline"
          >
            <Search className="mr-2 h-4 w-4" />
            Uppdatera
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vänster kolumn - Rekommenderade jobb */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Rekommenderade jobb</h2>
              <p className="text-sm text-muted-foreground">
                Baserade på dina sökord: {searchTerms?.occupation || 'ingen titel'}, {searchTerms?.location || 'ingen plats'}
                {searchTerms?.skills?.length > 0 ? `, ${searchTerms.skills.length} kompetenser` : ', inga kompetenser'}
              </p>
            </div>

            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">Något gick fel</h3>
                <p className="text-sm mb-4">{errorMsg}</p>
                <Button onClick={fetchRecommendedJobs} variant="outline" size="sm">
                  Försök igen
                </Button>
              </div>
            )}

            {!loading && !errorMsg && jobs.length === 0 && (
              <div className="text-center py-10 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Inga jobb hittades</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vi kunde inte hitta några jobb som matchar din profil just nu.
                </p>
                <Button 
                  asChild
                  variant="outline"
                  className="mx-auto"
                >
                  <a href={platsbankLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Sök på Platsbanken
                  </a>
                </Button>
              </div>
            )}

            {!loading && !errorMsg && jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div 
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "mb-4 overflow-hidden group transition-all duration-300",
                      expandedJobId === job.id ? "ring-2 ring-primary" : "hover:shadow-md"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg sm:text-xl font-bold line-clamp-2">
                            {job.headline || job.title}
                          </CardTitle>
                          {job.employer?.logoUrl && (
                            <Avatar className="ml-4 h-10 w-10">
                              <img src={job.employer.logoUrl} alt={`${job.employer.name} logo`} />
                            </Avatar>
                          )}
                        </div>
                        <CardDescription className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <Building className="mr-1 h-4 w-4" />
                            {job.employer?.name || job.company || 'Okänt företag'}
                          </span>
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-4 w-4" />
                            {job.location || 'Okänd plats'}
                          </span>
                          <span className="inline-flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('sv-SE') : 'Okänt datum'}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        {/* Kompetenser som badges */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {job.skills.slice(0, expandedJobId === job.id ? undefined : 5).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs whitespace-normal text-center">
                                {skill}
                              </Badge>
                            ))}
                            {expandedJobId !== job.id && job.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs whitespace-normal text-center">
                                +{job.skills.length - 5} till
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Beskrivning med expandera/kollapsa */}
                        <div>
                          <div className={cn(
                            "text-sm relative", 
                            expandedJobId !== job.id && "max-h-16 overflow-hidden"
                          )}>
                            <p>{expandedJobId === job.id ? job.description : job.description?.substring(0, 100) + '...'}</p>
                            
                            {expandedJobId !== job.id && (
                              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpandJob(job.id)}
                        >
                          {expandedJobId === job.id ? (
                            <><ChevronUp className="mr-1 h-4 w-4" /> Visa mindre</>
                          ) : (
                            <><ChevronDown className="mr-1 h-4 w-4" /> Visa mer</>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <a 
                            href={job.applicationUrl || job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Visa jobb
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {renderDebugInfo()}
          </div>

          {/* Höger kolumn - Enkla jobb utan parametrar */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Enkla jobb utan sökparametrar</h2>
              <p className="text-sm text-muted-foreground">
                Här visas jobb utan några specifika sökparametrar för att testa API-anropet
              </p>
              <Button 
                onClick={fetchSimpleJobs} 
                disabled={simpleLoading}
                variant="outline"
                className="mt-2"
                size="sm"
              >
                <Search className="mr-2 h-4 w-4" />
                Uppdatera
              </Button>
            </div>

            {simpleLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!simpleLoading && simpleErrorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">Något gick fel</h3>
                <p className="text-sm mb-4">{simpleErrorMsg}</p>
                <Button onClick={fetchSimpleJobs} variant="outline" size="sm">
                  Försök igen
                </Button>
              </div>
            )}

            {!simpleLoading && !simpleErrorMsg && simpleJobs.length === 0 && (
              <div className="text-center py-10 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Inga jobb hittades</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vi kunde inte hitta några jobb med enkel sökning.
                </p>
              </div>
            )}

            {!simpleLoading && !simpleErrorMsg && simpleJobs.length > 0 && (
              <div className="space-y-4">
                {simpleJobs.map((job, index) => renderSimpleJobCard(job, index))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
} 