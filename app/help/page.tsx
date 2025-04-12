"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/Navbar"
import { Search, FileText, BookText, MessageSquare, Award, Lightbulb, Briefcase, Mail } from "lucide-react"
import { PageTransition } from "@/components/animations/PageTransition"
import { HelpModal, CVStructureContent, CoverLetterContent, WorkExperienceContent, EducationSkillsContent } from "@/components/HelpModal"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Filter frågor baserat på sökfrågan
  const filterQuestions = (questions: { q: string; a: string }[]) => {
    if (!searchQuery.trim()) return questions
    
    const query = searchQuery.toLowerCase().trim()
    return questions.filter(
      q => q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query)
    )
  }

  // CV-guider
  const guides = [
    {
      title: "CV-struktur",
      icon: <FileText className="h-5 w-5" />,
      description: "Lär dig hur du strukturerar ett professionellt CV som får uppmärksamhet.",
      modalId: "cv-structure",
      colorAccent: "bg-blue-600"
    },
    {
      title: "Personligt brev",
      icon: <BookText className="h-5 w-5" />,
      description: "Tips för att skriva ett övertygande personligt brev som kompletterar ditt CV.",
      modalId: "cover-letter",
      colorAccent: "bg-purple-600"
    },
    {
      title: "Arbetslivserfarenhet",
      icon: <Briefcase className="h-5 w-5" />,
      description: "Hur du bäst presenterar din arbetslivserfarenhet för att imponera på rekryterare.",
      modalId: "work-experience",
      colorAccent: "bg-green-600"
    },
    {
      title: "Utbildning & Färdigheter",
      icon: <Award className="h-5 w-5" />,
      description: "Strategier för att lyfta fram dina utbildningar och kompetenser effektivt.",
      modalId: "education-skills",
      colorAccent: "bg-amber-600"
    }
  ]

  // Innehåll för modaler
  const getModalContent = (modalId: string) => {
    switch (modalId) {
      case "cv-structure":
        return <CVStructureContent />
      case "cover-letter":
        return <CoverLetterContent />
      case "work-experience":
        return <WorkExperienceContent />
      case "education-skills":
        return <EducationSkillsContent />
      default:
        return null
    }
  }

  // Hitta aktiv guide
  const activeGuide = activeModal ? guides.find(g => g.modalId === activeModal) : null

  // FAQ-frågor för CV
  const cvQuestions = [
    {
      q: "Hur långt bör mitt CV vara?",
      a: "Ett CV bör generellt vara 1-2 sidor långt. Fokusera på relevant information för tjänsten du söker. För erfarna personer kan ibland 2 sidor vara lämpligt, medan nyutexaminerade bör sikta på en sida."
    },
    {
      q: "Ska jag inkludera ett foto på mitt CV?",
      a: "Detta varierar mellan olika branscher och länder. I Sverige är det vanligt med foto på CV:t inom vissa branscher som service och försäljning, men det är inte ett måste. Välj ett professionellt foto om du inkluderar ett."
    },
    {
      q: "Vad är viktigast att ha med i mitt CV?",
      a: "De viktigaste delarna är: kontaktuppgifter, en kort professionell sammanfattning, relevant arbetslivserfarenhet, utbildning, och nyckelkompetenser. Anpassa alltid innehållet efter tjänsten du söker."
    },
    {
      q: "Hur ska jag formatera mitt CV?",
      a: "Välj en ren och läsbar design med tydliga rubriker och konsekvent formatering. Använd punktlistor för bättre läsbarhet och lämna tillräckligt med vityta. Undvik komplexa layouter som kan vara svåra att läsa."
    },
    {
      q: "Hur hanterar jag luckor i min CV-tidslinje?",
      a: "Var ärlig men strategisk. Om du har relevanta aktiviteter under luckorna (studier, frivilligarbete, eget projekt) kan du lyfta fram dem. För kortare luckor kan årsformat istället för månad/år ibland vara lämpligt."
    },
    {
      q: "Ska jag anpassa mitt CV för varje jobb jag söker?",
      a: "Ja, det rekommenderas starkt att anpassa ditt CV för varje tjänst. Lyft fram erfarenheter och färdigheter som är mest relevanta för den specifika tjänsten och använd liknande nyckelord som i jobbannonsen."
    }
  ]

  // FAQ-frågor för personligt brev
  const coverLetterQuestions = [
    {
      q: "Hur långt ska ett personligt brev vara?",
      a: "Ett personligt brev bör vara koncist och målmedvetet, vanligtvis runt 250-400 ord eller ungefär en A4-sida. Fokusera på kvalitet framför kvantitet."
    },
    {
      q: "Vad ska jag inkludera i mitt personliga brev?",
      a: "Inkludera en stark inledning som fångar uppmärksamhet, förklara varför du är intresserad av tjänsten/företaget, lyft fram dina mest relevanta färdigheter och erfarenheter, och avsluta med en tydlig uppmaning till handling."
    },
    {
      q: "Hur ska jag inleda ett personligt brev?",
      a: "Börja med en stark öppning som fångar rekryterarens intresse. Undvik generiska inledningar som 'Jag heter...' och fokusera istället på varför du är intresserad av tjänsten eller nämn en imponerande prestation som är relevant."
    },
    {
      q: "Ska jag upprepa information som redan finns i mitt CV?",
      a: "Det personliga brevet bör komplettera CV:t, inte duplicera det. Fördjupa dig i några utvalda erfarenheter från ditt CV och förklara hur de gör dig lämplig för tjänsten. Fokusera på att berätta din historia och visa din passion."
    }
  ]

  // FAQ-frågor för intervjuförberedelser
  const interviewQuestions = [
    {
      q: "Hur förbereder jag mig bäst inför en arbetsintervju?",
      a: "Researcha företaget noggrant, förbered svar på vanliga intervjufrågor, förbered egna frågor att ställa, öva på att presentera dina erfarenheter koncist, och se till att ha lämplig klädsel klar dagen innan."
    },
    {
      q: "Vilka är de vanligaste intervjufrågorna?",
      a: "Vanliga frågor inkluderar: 'Berätta om dig själv', 'Varför är du intresserad av denna tjänst?', 'Vad är dina styrkor och svagheter?', 'Berätta om en utmaning du hanterat', och 'Var ser du dig själv om fem år?'"
    },
    {
      q: "Hur ska jag hantera frågor om löneförväntningar?",
      a: "Gör research om marknadsvärdet för liknande roller i din region. När frågan kommer, ge ett rimligt intervall baserat på din research, och förklara att du är öppen för diskussion baserat på hela kompensationspaketet."
    },
    {
      q: "Vilka frågor bör jag ställa under intervjun?",
      a: "Ställ frågor om teamet du skulle arbeta med, företagets kultur, förväntningar för rollen under de första månaderna, och möjligheter för professionell utveckling. Undvik att bara fråga om lön och förmåner."
    }
  ]

  const filteredCVQuestions = filterQuestions(cvQuestions)
  const filteredCoverLetterQuestions = filterQuestions(coverLetterQuestions)
  const filteredInterviewQuestions = filterQuestions(interviewQuestions)

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container py-8 px-4 md:py-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Hjälpcenter</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Här hittar du guider, tips och svar på vanliga frågor för att skapa ett professionellt CV som hjälper dig att sticka ut.
            </p>
            
            {/* Sökruta */}
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Sök efter hjälp..." 
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Populära guider */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              CV-guider och resurser
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                        {guide.icon}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{guide.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{guide.description}</p>
                      <Button 
                        variant="link" 
                        className="p-0"
                        onClick={() => setActiveModal(guide.modalId)}
                      >
                        Läs mer
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQ-sektion */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Vanliga frågor
            </h2>
            
            <Tabs defaultValue="cv" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="cv">CV-frågor</TabsTrigger>
                <TabsTrigger value="cover-letter">Personligt brev</TabsTrigger>
                <TabsTrigger value="interview">Intervjutips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cv">
                {filteredCVQuestions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredCVQuestions.map((item, i) => (
                      <AccordionItem key={i} value={`cv-item-${i}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Inga resultat hittades för din sökning.</p>
                )}
              </TabsContent>
              
              <TabsContent value="cover-letter">
                {filteredCoverLetterQuestions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredCoverLetterQuestions.map((item, i) => (
                      <AccordionItem key={i} value={`cover-letter-item-${i}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Inga resultat hittades för din sökning.</p>
                )}
              </TabsContent>
              
              <TabsContent value="interview">
                {filteredInterviewQuestions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredInterviewQuestions.map((item, i) => (
                      <AccordionItem key={i} value={`interview-item-${i}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Inga resultat hittades för din sökning.</p>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* Kontakta oss sektion */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                Behöver du mer hjälp?
              </h2>
              <p className="text-muted-foreground mb-6">
                Om du har frågor som inte besvaras här, tveka inte att kontakta vårt supportteam. 
                Vi svarar normalt inom 24 timmar på vardagar.
              </p>
              <Button asChild>
                <a href="mailto:support@bokning24.se">Kontakta support</a>
              </Button>
            </div>
          </motion.section>
        </div>
      </PageTransition>

      {/* Modaler för guider */}
      {activeGuide && (
        <HelpModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={activeGuide.title}
          icon={activeGuide.icon}
          description={activeGuide.description}
          content={getModalContent(activeGuide.modalId)}
          colorAccent={activeGuide.colorAccent}
        />
      )}
    </>
  )
} 