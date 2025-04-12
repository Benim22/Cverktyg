"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

type HelpModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: React.ReactNode
  description: string
  content: React.ReactNode
  colorAccent?: string
}

export function HelpModal({
  isOpen,
  onClose,
  title,
  icon,
  description,
  content,
  colorAccent = "bg-primary"
}: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Topp-accent och header */}
        <div className={cn("w-full h-2", colorAccent)} />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center mb-4">
              <div className={cn("rounded-full p-3 mr-4", colorAccent.replace("bg-", "bg-")+"/10")}>
                {icon}
              </div>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {content}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-end mt-8">
            <Button onClick={onClose}>Stäng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Innehållskomponenter för olika hjälp-modaler
export const CVStructureContent = () => (
  <div className="space-y-6">
    <p className="text-muted-foreground">
      Ett välstrukturerat CV är avgörande för att göra ett bra första intryck på rekryterare. 
      Följ dessa riktlinjer för att skapa ett professionellt och effektivt CV.
    </p>
    
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-lg">CV-sektioner i rätt ordning</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">1</span>
            <span><strong>Kontaktuppgifter:</strong> Namn, telefon, email och eventuellt LinkedIn. Placera dessa överst på CV:t.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">2</span>
            <span><strong>Professionell sammanfattning:</strong> En kort (2-3 meningar) presentation av dina viktigaste kvalifikationer och mål.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">3</span>
            <span><strong>Arbetslivserfarenhet:</strong> Lista dina tidigare jobb i omvänd kronologisk ordning med företag, titel, period och ansvar/prestationer.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">4</span>
            <span><strong>Utbildning:</strong> Relevanta utbildningar med lärosäte, examen och examensår.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 shrink-0">5</span>
            <span><strong>Färdigheter:</strong> Tekniska, språkliga och övriga relevanta kompetenser.</span>
          </li>
        </ul>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">Tips för effektiv formatering</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start">
            <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
            <span>Använd en ren, lättläst font (Arial, Calibri, Helvetica)</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
            <span>Tillämpa konsekvent formatering för rubriker och text</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
            <span>Använd punktlistor för att framhäva prestationer</span>
          </li>
          <li className="flex items-start">
            <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
            <span>Inkludera nyckelord från jobbannonsen</span>
          </li>
          <li className="flex items-start">
            <div className="bg-red-100 text-red-700 rounded-full p-1 mr-2 shrink-0">✗</div>
            <span>Undvik långa textblock och komplex layout</span>
          </li>
          <li className="flex items-start">
            <div className="bg-red-100 text-red-700 rounded-full p-1 mr-2 shrink-0">✗</div>
            <span>Överstig inte 2 sidor (helst 1 sida för de flesta)</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          <strong>Kom ihåg:</strong> Ditt CV är ett levande dokument som bör anpassas för varje jobbtillfälle.
        </div>
      </motion.div>
    </div>
  </div>
)

export const CoverLetterContent = () => (
  <div className="space-y-6">
    <p className="text-muted-foreground">
      Ett välskrivet personligt brev kan vara avgörande för att särskilja dig från andra kandidater. 
      Här är en guide för att skapa ett personligt brev som kompletterar ditt CV på bästa sätt.
    </p>

    <div className="grid md:grid-cols-5 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="md:col-span-3 space-y-4"
      >
        <h3 className="font-semibold text-lg">Struktur för personligt brev</h3>
        
        <div className="space-y-3 text-sm">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h4 className="font-medium">Inledning</h4>
            <p>Fånga läsarens uppmärksamhet och förklara varför du söker tjänsten. Nämn gärna hur du hittade annonsen och varför du är intresserad av företaget.</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <h4 className="font-medium">Huvuddel</h4>
            <p>Beskriv dina mest relevanta kvalifikationer och erfarenheter. Koppla dina färdigheter till tjänstens krav och ge konkreta exempel på hur du kan bidra till företagets mål.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <h4 className="font-medium">Avslutning</h4>
            <p>Sammanfatta varför du är en lämplig kandidat, visa entusiasm för nästa steg och tacka för deras tid och övervägande. Inkludera en tydlig uppmaning till handling.</p>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm mt-4">
          <strong>Tips:</strong> Håll ditt personliga brev koncist – max en sida (250-400 ord).
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="md:col-span-2 space-y-4"
      >
        <h3 className="font-semibold text-lg">Vad arbetsgivare letar efter</h3>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary rounded-full p-1 mr-2 shrink-0">✓</div>
            <span><strong>Personlighet:</strong> Visa vem du är och varför du passar in i företagskulturen</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary rounded-full p-1 mr-2 shrink-0">✓</div>
            <span><strong>Motivation:</strong> Förklara varför just denna roll och detta företag intresserar dig</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary rounded-full p-1 mr-2 shrink-0">✓</div>
            <span><strong>Relevans:</strong> Koppla tydligt dina erfarenheter till tjänstens krav</span>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/20 text-primary rounded-full p-1 mr-2 shrink-0">✓</div>
            <span><strong>Unikhet:</strong> Förmedla hur du särskiljer dig från andra kandidater</span>
          </li>
        </ul>
        
        <div className="p-4 bg-gray-100 rounded-md text-sm mt-4">
          <h4 className="font-medium mb-2">Exempel på stark inledning</h4>
          <p className="italic text-gray-700">
            "Med mina fem års erfarenhet av projektledning inom IT-sektorn och mitt brinnande intresse för innovation, blev jag omedelbart intresserad när jag såg er annons för rollen som Technical Project Manager på LinkedIn. Företag X:s arbete med hållbara tekniklösningar har länge imponerat på mig..."
          </p>
        </div>
      </motion.div>
    </div>
  </div>
)

export const WorkExperienceContent = () => (
  <div className="space-y-6">
    <p className="text-muted-foreground">
      Din arbetslivserfarenhet är ofta den mest granskade delen av ditt CV. 
      Här är tips för att presentera din erfarenhet på ett sätt som maximerar din attraktionskraft för rekryterare.
    </p>
    
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">Presentera arbetslivserfarenhet effektivt</h3>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-200">
            <h4 className="font-medium">Idealisk struktur för varje position</h4>
          </div>
          <div className="p-3 space-y-3 text-sm">
            <div>
              <strong>Titel, företagsnamn och tidsperiod</strong>
              <p className="italic text-gray-600">Senior Webbutvecklare, Tech Solutions AB, Aug 2019 - Nuvarande</p>
            </div>
            
            <div>
              <strong>Kort beskrivning av företaget (valfritt)</strong>
              <p className="italic text-gray-600">Ledande tech-konsultbolag med fokus på e-handelslösningar</p>
            </div>
            
            <div>
              <strong>Ansvar och prestationer (punktlista)</strong>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 italic">
                <li>Ledde utvecklingsteam på 5 personer för att skapa responsiva webbapplikationer</li>
                <li>Förbättrade sidinladdningstiden med 40% genom optimering av front-end-prestanda</li>
                <li>Utvecklade och implementerade CI/CD-pipeline som reducerade releaseprocessen från 2 dagar till 3 timmar</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          <strong>PAR-metoden:</strong> För varje viktig punkt, beskriv <strong>P</strong>roblemet, <strong>A</strong>ktionen du tog och <strong>R</strong>esultatet du uppnådde.
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">Framhäv dina prestationer</h3>
        
        <div className="space-y-3 text-sm">
          <h4 className="font-medium">Fokusera på resultat, inte bara ansvar</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-700 font-medium mb-1">Svagt exempel:</div>
              <p className="text-gray-700 italic">"Ansvarade för kundkommunikation och support"</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-green-700 font-medium mb-1">Starkt exempel:</div>
              <p className="text-gray-700 italic">"Förbättrade kundnöjdheten med 25% genom att implementera ett nytt supportsystem och svarsprotokoll"</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mt-4">
          <h4 className="font-medium text-sm">Använd kraftfulla handlingsverb</h4>
          
          <div className="flex flex-wrap gap-2">
            {["Utvecklade", "Ledde", "Implementerade", "Förbättrade", "Effektiviserade", 
              "Optimerade", "Skapade", "Analyserade", "Samordnade", "Ökade"].map((verb, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (i * 0.05), duration: 0.2 }}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                {verb}
              </motion.span>
            ))}
          </div>
        </div>
        
        <div className="space-y-2 mt-4 text-sm">
          <h4 className="font-medium">Hantera luckor i CV:t</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-700 rounded-full p-1 mr-2 shrink-0">i</div>
              <span>Var ärlig men strategisk – fokusera på vad du lärde dig eller utvecklade under perioden</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-700 rounded-full p-1 mr-2 shrink-0">i</div>
              <span>Inkludera relevanta aktiviteter som frivilligarbete, studier eller personliga projekt</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  </div>
)

export const EducationSkillsContent = () => (
  <div className="space-y-6">
    <p className="text-muted-foreground">
      Att presentera din utbildning och kompetenser effektivt kan göra stor skillnad för din CV. 
      Här är strategier för att framhäva dessa viktiga delar på bästa sätt.
    </p>
    
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">Utbildningssektionen</h3>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-200">
            <h4 className="font-medium">Struktur och innehåll</h4>
          </div>
          <div className="p-3 space-y-3 text-sm">
            <div className="space-y-1">
              <strong>För nyare utexaminerade:</strong>
              <ul className="list-disc pl-5">
                <li>Placera utbildning före arbetslivserfarenhet</li>
                <li>Inkludera relevanta kurser, uppsatser och projekt</li>
                <li>Nämn studieresultat om de är imponerande</li>
              </ul>
            </div>
            
            <div className="space-y-1">
              <strong>För erfarna yrkespersoner:</strong>
              <ul className="list-disc pl-5">
                <li>Håll sektionen kortfattad efter arbetslivserfarenhet</li>
                <li>Fokusera på grader och certifieringar</li>
                <li>Inkludera relevant fortbildning och kurser</li>
              </ul>
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="italic text-gray-700">
                <strong>Exempel:</strong><br />
                Civilingenjörsexamen i Datateknik<br />
                Kungliga Tekniska Högskolan, Stockholm<br />
                2015-2020<br />
                Examensarbete: "Implementering av maskininlärningsalgoritmer för prediktivt underhåll"
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-purple-800 text-sm">
          <strong>Tips:</strong> Inkludera alltid fullständig examensbeteckning, lärosäte och tidsperiod.
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">Kompetenser och färdigheter</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Kategorisera dina färdigheter</h4>
            <div className="grid gap-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <strong className="block mb-1">Tekniska färdigheter</strong>
                <p className="italic text-gray-700">
                  Programmering: JavaScript (React, Node.js), Python, SQL<br />
                  Verktyg: Git, Docker, AWS, CI/CD
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <strong className="block mb-1">Mjuka färdigheter</strong>
                <p className="italic text-gray-700">
                  Teamledning, Problemlösning, Kommunikation, Projektledning
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <strong className="block mb-1">Språkkunskaper</strong>
                <p className="italic text-gray-700">
                  Svenska (modersmål), Engelska (flytande), Tyska (grundläggande)
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-2">
            <h4 className="font-medium">Expertistips</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
                <span>Anpassa dina kompetenser efter den specifika tjänsten du söker</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 text-green-700 rounded-full p-1 mr-2 shrink-0">✓</div>
                <span>Var specifik med tekniska färdigheter och inkludera kompetensnivå</span>
              </li>
              <li className="flex items-start">
                <div className="bg-red-100 text-red-700 rounded-full p-1 mr-2 shrink-0">✗</div>
                <span>Undvik generiska färdigheter som "teamplayer" utan konkret kontext</span>
              </li>
              <li className="flex items-start">
                <div className="bg-red-100 text-red-700 rounded-full p-1 mr-2 shrink-0">✗</div>
                <span>Lista inte färdigheter som du inte kan styrka vid en intervju</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
) 