"use client"

import { FadeIn } from "@/components/animations/FadeIn"
import { ScrollReveal } from "@/components/animations/ScrollReveal" 
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { FileText, BookOpen, Award, Briefcase, GraduationCap, User, CoffeeIcon, HeartHandshake, Code, Palette } from "lucide-react"

const guideSections = [
  {
    id: "nyborjare",
    title: "För nybörjare", 
    description: "Grundläggande guider för dig som skapar ditt första CV",
    icon: <User className="h-6 w-6 text-green-500" />,
    guides: [
      {
        title: "Så kommer du igång med ditt första CV",
        description: "En steg-för-steg-guide för att skapa ditt allra första CV från start till mål.",
        icon: <FileText className="h-12 w-12 text-blue-500" />,
        difficulty: "Nybörjare",
        time: "30 min"
      },
      {
        title: "Vanliga misstag att undvika",
        description: "Undvik dessa vanliga fallgropar när du skapar ditt CV för att maximera dina chanser.",
        icon: <CoffeeIcon className="h-12 w-12 text-red-500" />,
        difficulty: "Nybörjare",
        time: "15 min"
      },
      {
        title: "Personligt brev: En introduktion",
        description: "Lär dig grunderna i att skriva ett personligt brev som kompletterar ditt CV.",
        icon: <BookOpen className="h-12 w-12 text-purple-500" />,
        difficulty: "Nybörjare",
        time: "25 min"
      }
    ]
  },
  {
    id: "avancerad", 
    title: "Avancerade tekniker",
    description: "För dig som vill ta ditt CV till nästa nivå",
    icon: <Award className="h-6 w-6 text-blue-500" />,
    guides: [
      {
        title: "ATS-optimering av ditt CV",
        description: "Lär dig hur du optimerar ditt CV för att passera genom företagens automatiska urvalssystem.",
        icon: <Code className="h-12 w-12 text-green-500" />,
        difficulty: "Avancerad",
        time: "45 min"
      },
      {
        title: "Kvantitativa resultat som imponerar",
        description: "Tekniker för att kvantifiera dina prestationer och skapa ett resultatfokuserat CV.",
        icon: <Briefcase className="h-12 w-12 text-orange-500" />,
        difficulty: "Avancerad", 
        time: "35 min"
      },
      {
        title: "Karriärbyte: Anpassa ditt CV",
        description: "Så framhäver du överförbara färdigheter när du söker jobb i en ny bransch.",
        icon: <HeartHandshake className="h-12 w-12 text-purple-500" />,
        difficulty: "Avancerad",
        time: "40 min"
      }
    ]
  },
  {
    id: "bransch",
    title: "Branschspecifika guider", 
    description: "Anpassade guider för olika branscher",
    icon: <Briefcase className="h-6 w-6 text-purple-500" />,
    guides: [
      {
        title: "CV för IT och teknikbranschen",
        description: "Specialiserade tips för mjukvaruutvecklare, systemvetare och andra teknikroller.",
        icon: <Code className="h-12 w-12 text-blue-500" />,
        difficulty: "Mellan",
        time: "30 min"
      },
      {
        title: "CV för kreativa branscher",
        description: "Så skapar du ett CV som visar din kreativitet för design- och mediebranschen.",
        icon: <Palette className="h-12 w-12 text-pink-500" />, 
        difficulty: "Mellan",
        time: "25 min"
      },
      {
        title: "CV för akademiska positioner",
        description: "Guide för att skapa ett akademiskt CV för forskning och högre utbildning.",
        icon: <GraduationCap className="h-12 w-12 text-amber-500" />,
        difficulty: "Avancerad",
        time: "50 min"
      }
    ]
  }
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container max-w-6xl py-12 mx-auto px-4 sm:px-6">
        <FadeIn direction="down" duration={0.6}>
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CV-guider för din jobbsökning
          </h1>
          
          <p className="text-xl text-muted-foreground mt-4 mb-12 text-center max-w-3xl mx-auto">
            Omfattande steg-för-steg-guider som hjälper dig skapa ett professionellt CV för varje situation
          </p>
        </FadeIn>

        <Tabs defaultValue="nyborjare" className="w-full mb-16">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-auto">
              {guideSections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="flex gap-2 px-6">
                  {section.icon}
                  <span>{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {guideSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <FadeIn>
                <h2 className="text-2xl font-bold text-center mb-2">{section.title}</h2>
                <p className="text-muted-foreground text-center mb-8">{section.description}</p>
              </FadeIn>

              <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.guides.map((guide, index) => (
                  <div key={index} className="h-full">
                    <Card className="h-full hover:-translate-y-1 transition-all duration-300 overflow-hidden hover:shadow-lg border border-slate-200 dark:border-slate-800">
                      <div className="p-6 h-full flex flex-col">
                        <div className="rounded-full bg-slate-100 dark:bg-slate-800 w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                          {guide.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
                        
                        <p className="text-muted-foreground mb-6 flex-grow">
                          {guide.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                              {guide.difficulty}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-300">
                              {guide.time}
                            </span>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            Läs guide
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </StaggerChildren>
            </TabsContent>
          ))}
        </Tabs>

        <ScrollReveal className="my-20">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/90 p-8 sm:p-10">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-800/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-8 text-center">Vår metodik</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScrollReveal direction="left" delay={0.1}>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-blue-600">Expertgranskat innehåll</h3>
                    <p className="text-muted-foreground">
                      Alla våra guider är skapade av karriärexperter och HR-specialister med mångårig erfarenhet av rekrytering och CV-granskning. Innehållet uppdateras regelbundet för att spegla de senaste trenderna på arbetsmarknaden.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="right" delay={0.2}>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-green-600">Praktiskt fokus</h3>
                    <p className="text-muted-foreground">
                      Vi fokuserar på konkreta, genomförbara råd som du direkt kan tillämpa i ditt CV. Varje guide innehåller exempel, mallar och steg-för-steg-instruktioner som hjälper dig att lyckas med din jobbansökan.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.3}>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-purple-600">Branschspecifikt</h3>
                    <p className="text-muted-foreground">
                      Vi förstår att olika branscher har olika förväntningar på CV:n. Därför erbjuder vi specialiserade guider som tar hänsyn till de specifika krav och förväntningar som finns inom olika sektorer.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="right" delay={0.4}>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-orange-600">Kontinuerlig förbättring</h3>
                    <p className="text-muted-foreground">
                      Vi samlar feedback från användare och jobbrådgivare för att ständigt förbättra våra guider. Detta säkerställer att du alltid får de mest aktuella och effektiva råden för din karriärutveckling.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <FadeIn className="mt-20 mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white text-center relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Redo att skapa ditt CV?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Använd vårt verktyg för att enkelt skapa ett professionellt CV baserat på våra expertråd
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/editor">Skapa ditt CV nu</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/resources/tips">Se våra CV-tips</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
} 