"use client"

import { FadeIn } from "@/components/animations/FadeIn"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { BookOpen, Award, PenTool, FileText, BookMarked, TrendingUp, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react"
import { useState } from "react"

// Innehåll för CV-grunderna modal
const cvBasicsContent = [
  {
    title: "Personliga uppgifter",
    description: "Inkludera namn, kontaktuppgifter, och gärna en professionell e-postadress. Undvik att inkludera personliga detaljer som inte är relevanta för tjänsten."
  },
  {
    title: "Professionell sammanfattning",
    description: "En kort men kraftfull översikt (2-4 meningar) som sammanfattar din bakgrund, expertis och vad du kan erbjuda arbetsgivaren."
  },
  {
    title: "Arbetslivserfarenhet",
    description: "Lista dina tidigare anställningar i omvänd kronologisk ordning. Fokusera på uppnådda resultat snarare än arbetsuppgifter."
  },
  {
    title: "Utbildning",
    description: "Inkludera relevanta utbildningar, med fokus på de senaste eller mest relevanta för den sökta positionen."
  },
  {
    title: "Färdigheter",
    description: "Lista specifika tekniska och mjuka färdigheter som är relevanta för tjänsten, helst med nivå av expertis."
  },
]

// Innehåll för Språkval modal
const languageContent = [
  {
    title: "Använd aktiva verb",
    description: "Börja punkter med kraftfulla handlingsverb som 'utvecklade', 'ledde', 'optimerade', 'implementerade' för att beskriva dina prestationer."
  },
  {
    title: "Kvantifiera resultat",
    description: "Använd siffror och procent för att visa din påverkan: 'Ökade försäljningen med 25%', 'Ledde ett team på 8 personer'."
  },
  {
    title: "Använd branschspecifika nyckelord",
    description: "Inkludera relevanta termer och teknologier från jobbannonsen för att passera ATS-system och visa din kännedom om branschen."
  },
  {
    title: "Var koncis och tydlig",
    description: "Använd korta, direkta meningar utan överflödiga ord. Varje punkt bör vara maximalt 1-2 rader lång."
  },
  {
    title: "Undvik klyschor",
    description: "Istället för uttryck som 'lagspelare' eller 'problemlösare', visa exempel på hur du har demonstrerat dessa egenskaper."
  },
]

// Innehåll för Branschspecifika tips modal
const industryContent = [
  {
    title: "IT och programmering",
    description: "Framhäv tekniska färdigheter, programmeringsspråk, och specifika projekt. Inkludera portföljlänkar och GitHub-profiler för att visa ditt arbete."
  },
  {
    title: "Ekonomi och finans",
    description: "Betona analytiska färdigheter, erfarenhet av finansiella verktyg, och mätbara resultat som kostnadsbesparingar eller förbättrad effektivitet."
  },
  {
    title: "Marknadsföring",
    description: "Inkludera specifika kampanjer, sociala medier-strategier, och kvantifierbara resultat som ökad trafik, leads, eller konverteringar."
  },
  {
    title: "Hälso- och sjukvård",
    description: "Fokusera på certifieringar, specialistkompetenser, och patientcentrerade färdigheter. Betona även eventuella forskningserfarenheter."
  },
  {
    title: "Design och kreativa yrken",
    description: "Inkludera en portfoliolänk och beskriv din kreativa process. Framhäv kundrelaterade projekt och din förmåga att möta deadlines."
  },
]

const tipCards = [
  {
    title: "CV-grunderna",
    description: "Lär dig de essentiella delarna av ett effektivt CV och hur du strukturerar det professionellt.",
    icon: <FileText className="h-6 w-6 text-blue-500" />,
    borderColor: "border-blue-500",
    bgColor: "bg-blue-100",
    link: "/resources/guides/cv-basics",
    isExternal: false,
    hasModal: true,
    modalContent: cvBasicsContent,
    modalDescription: "En välstrukturerad CV är grunden för en framgångsrik jobbansökan. Här är de viktigaste delarna som bör inkluderas:"
  },
  {
    title: "Språkval och formulering",
    description: "Använd aktiva verb och konkreta exempel för att göra ditt CV mer övertygande och resultatfokuserat.",
    icon: <PenTool className="h-6 w-6 text-green-500" />,
    borderColor: "border-green-500",
    bgColor: "bg-green-100",
    link: "/resources/guides/cv-language",
    isExternal: false,
    hasModal: true,
    modalContent: languageContent,
    modalDescription: "Hur du formulerar dina erfarenheter och prestationer kan göra stor skillnad för hur arbetsgivare uppfattar ditt CV:"
  },
  {
    title: "Branschspecifika tips",
    description: "Anpassa ditt CV för olika branscher med specifika exempel på vad som bör lyftas fram.",
    icon: <BookMarked className="h-6 w-6 text-purple-500" />,
    borderColor: "border-purple-500",
    bgColor: "bg-purple-100",
    link: "/resources/guides/industry-cv-tips",
    isExternal: false,
    hasModal: true,
    modalContent: industryContent,
    modalDescription: "Olika branscher värdesätter olika kvalifikationer och erfarenheter. Här är tips för att anpassa ditt CV efter specifika branscher:"
  },
  {
    title: "ATS-optimering",
    description: "Få ditt CV att passera genom Applicant Tracking Systems med rätt nyckelord och format.",
    icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
    borderColor: "border-orange-500",
    bgColor: "bg-orange-100",
    link: "https://arbetsformedlingen.se/for-arbetssokande/cv-och-personligt-brev",
    isExternal: true,
    hasModal: false
  },
  {
    title: "Intervjuförberedelser",
    description: "Förbered dig för intervjuer baserade på ditt CV och lär dig hantera vanliga frågor.",
    icon: <BookOpen className="h-6 w-6 text-red-500" />,
    borderColor: "border-red-500",
    bgColor: "bg-red-100",
    link: "https://www.akademssr.se/din-karriar/jobbsokande/intervjun",
    isExternal: true,
    hasModal: false
  },
  {
    title: "Portfoliotips",
    description: "Lär dig hur du kan komplettera ditt CV med en imponerande portfolio som visar dina färdigheter.",
    icon: <Award className="h-6 w-6 text-yellow-500" />,
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-100",
    link: "https://www.linkedin.com/learning/creating-a-portfolio-and-landing-your-first-job",
    isExternal: true,
    hasModal: false
  }
]

const experttips = [
  {
    title: "1. Anpassa ditt CV för varje tjänst",
    description: "Ett av de mest effektiva sätten att få ditt CV att sticka ut är att skräddarsy det för varje enskild tjänst. Läs jobbannonsen noga och använd samma nyckelord som arbetsgivaren efterfrågar."
  },
  {
    title: "2. Fokusera på resultat, inte bara arbetsuppgifter",
    description: "Istället för att bara lista vad du gjorde på tidigare jobb, beskriv vilka resultat du uppnådde. Använd siffror och konkreta exempel för att visa din påverkan."
  },
  {
    title: "3. Håll det koncist och relevant",
    description: "Ett effektivt CV ska vara 1-2 sidor långt. Fokusera på de senaste 10-15 årens erfarenhet och se till att varje punkt är relevant för tjänsten du söker."
  },
  {
    title: "4. Var ärlig",
    description: "Överdriva eller ljuga på ditt CV kan verka frestande, men det kan skada din karriär på lång sikt. Fokusera istället på att lyfta fram dina faktiska styrkor på ett positivt sätt."
  },
  {
    title: "5. Se till att designen är professionell",
    description: "Ett städat, konsekvent format med god läsbarhet är avgörande. Använd vår CV-byggare för att skapa ett professionellt utseende som gör ett gott första intryck."
  }
]

export default function TipsPage() {
  const [openDialogs, setOpenDialogs] = useState<{[key: number]: boolean}>({});

  const handleOpenChange = (index: number, isOpen: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [index]: isOpen }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container max-w-6xl py-12 mx-auto px-4 sm:px-6">
        <FadeIn direction="down" duration={0.6}>
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CV-tips för en framgångsrik jobbansökan
          </h1>
          
          <p className="text-xl text-muted-foreground mt-4 mb-12 text-center max-w-3xl mx-auto">
            Våra experttips för att skapa ett CV som skiljer sig från mängden och hjälper dig att landa ditt drömjobb
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tipCards.map((card, index) => (
            <div key={index} className="h-full">
              <Card className={`h-full group hover:-translate-y-1 transition-all duration-300 overflow-hidden border-l-4 ${card.borderColor} hover:shadow-lg`}>
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${card.bgColor} p-3 rounded-full transition-transform duration-300 group-hover:scale-110`}>
                      {card.icon}
                    </div>
                    <h2 className="text-xl font-bold">{card.title}</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {card.description}
                  </p>
                  
                  {card.hasModal ? (
                    <Dialog open={openDialogs[index]} onOpenChange={(open) => handleOpenChange(index, open)}>
                      <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                          Läs mer <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl mb-2 text-blue-600">{card.title}</DialogTitle>
                          <DialogDescription className="text-base">
                            {card.modalDescription}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6 divide-y">
                          {card.modalContent?.map((item, i) => (
                            <div key={i} className="py-4 first:pt-0 last:pb-0">
                              <div className="flex gap-2 items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h3 className="font-semibold mb-1">{item.title}</h3>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : card.isExternal ? (
                    <a 
                      href={card.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Läs extern guide <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  ) : (
                    <Link 
                      href={card.link} 
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Läs mer <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </StaggerChildren>

        <ScrollReveal className="my-20">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/90 p-8 sm:p-10">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-800/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-8 text-center">Expertråd för din jobbsökning</h2>
              
              <div className="space-y-6">
                {experttips.map((tip, index) => (
                  <ScrollReveal key={index} direction="up" delay={index * 0.1} className="border-b last:border-0 pb-5 last:pb-0">
                    <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                    <p className="text-muted-foreground">{tip.description}</p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <FadeIn className="mt-20 mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white text-center relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Redo att förbättra ditt CV?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Använd vårt verktyg för att skapa ett professionellt CV som hjälper dig att stå ut från mängden
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/editor">Skapa ditt CV nu</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
} 