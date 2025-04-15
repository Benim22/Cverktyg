"use client"

import { Navbar } from "@/components/Navbar"
import { MetaTags } from "@/components/MetaTags"
import { 
  Edit, 
  Download, 
  FileText, 
  Layout, 
  Palette, 
  Sparkles, 
  ArrowRight, 
  Award, 
  PenTool, 
  ArrowUp, 
  LightbulbIcon, 
  Check
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"

// Animationsvariant för att glida in från botten
const fadeUpAnimation = {
  hidden: { y: 30, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
}

export default function FeaturesPage() {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  
  return (
    <>
      <MetaTags 
        title="Funktioner och verktyg för CV-skapande"
        description="Upptäck CVerktygs kraftfulla funktioner för att skapa professionella CV:n. Intuitivt gränssnitt, anpassningsbara mallar och smidiga exportmöjligheter för att maximera dina chanser att få drömjobbet."
        keywords="cv-funktioner, cv-verktyg, cv-skapare, professionellt cv, cv-mallar, cv-export, jobbansökan"
        ogUrl="https://cverktyg.se/features"
      />
      <Navbar />
      <PageTransition>
        {/* Hero-sektion */}
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-12 sm:py-20">
          <div className="absolute -top-[10%] left-[30%] h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[10%] h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-[20%] top-[30%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="container relative z-10 px-4 sm:px-6">
            <div className="mx-auto mb-10 sm:mb-16 max-w-3xl text-center">
              <motion.div 
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="mx-auto mb-6 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-lg"
              >
                <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl sm:text-4xl md:text-5xl font-bold text-transparent"
              >
                Funktioner i CVerktyg
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-2xl text-base sm:text-xl text-muted-foreground"
              >
                Upptäck de kraftfulla verktygen som gör det enkelt att skapa ett professionellt 
                och övertygande CV som särskiljer dig på arbetsmarknaden.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="font-medium w-full sm:w-auto">
                    Kom igång
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/templates/all" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto">
                    Utforska mallar
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            {/* Översiktsbild */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mx-auto max-w-3xl"
            >
              <div className="relative rounded-xl border border-border bg-card/50 p-3 shadow-xl backdrop-blur">
                <Image 
                  src="/images/features/2792499.jpg" 
                  alt="CVerktyg redigerare" 
                  width={600} 
                  height={400}
                  className="w-full rounded-lg shadow-sm"
                  priority
                />
                <div className="absolute -bottom-4 -right-4 rounded-full bg-primary p-3 sm:p-4 shadow-lg">
                  <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Huvudinnehåll */}
        <div className="container py-12 sm:py-20 px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 text-center">
            <FadeIn>
              <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold">Allt du behöver för att skapa ett professionellt CV</h2>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
                Våra kraftfulla och användarvänliga verktyg hjälper dig att skapa ett CV som 
                hjälper dig att få ditt drömjobb.
              </p>
            </FadeIn>
          </div>
          
          {/* Flikar för funktionskategorier */}
          <Tabs defaultValue="editor" className="mx-auto max-w-5xl">
            <div className="mb-8 sm:mb-12 flex justify-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="editor" className="px-2 sm:px-4 text-xs sm:text-sm md:text-base">
                  <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Redigerare</span>
                  <span className="xs:hidden">Red.</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="px-2 sm:px-4 text-xs sm:text-sm md:text-base">
                  <Layout className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Mallar</span>
                  <span className="xs:hidden">Mall.</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="px-2 sm:px-4 text-xs sm:text-sm md:text-base">
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Export</span>
                  <span className="xs:hidden">Exp.</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Redigerare-flik */}
            <TabsContent value="editor" className="space-y-8 sm:space-y-12">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div className="order-2 md:order-1">
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={fadeUpAnimation}
                  >
                    <h3 className="mb-4 text-2xl font-bold">Intuitivt gränssnitt</h3>
                    <p className="mb-6 text-muted-foreground">
                      Vår användarvänliga redigerare gör det enkelt att skapa och redigera ditt CV. 
                      Du kan enkelt lägga till, ta bort och ordna om sektioner efter dina behov.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Direkt redigering med realtidsförhandsvisning",
                        "Dra och släpp sektionsordning",
                        "Anpassa mellanrum och layout",
                        "Spara automatiskt ditt arbete",
                        "Fokusläge för koncentrerad redigering"
                      ].map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          custom={index + 1}
                          variants={fadeUpAnimation}
                          className="flex items-start"
                        >
                          <div className="mr-2 sm:mr-3 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
                
                <div className="order-1 md:order-2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-xl border border-border bg-card/30 p-3 shadow-lg"
                  >
                    <Image 
                      src="/images/features/f1.png" 
                      alt="Intuitivt gränssnitt" 
                      width={600} 
                      height={400}
                      className="w-full rounded-lg shadow-sm object-contain"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full bg-primary/10 p-3 shadow-lg border border-primary/20">
                      <PenTool className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-xl border border-border bg-card/30 p-3 shadow-lg"
                  >
                    <Image 
                      src="/images/features/4.png" 
                      alt="Anpassningsbara färgscheman" 
                      width={600} 
                      height={400}
                      className="w-full rounded-lg shadow-sm object-contain"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full bg-primary/10 p-3 shadow-lg border border-primary/20">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                </div>
                
                <div>
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={fadeUpAnimation}
                  >
                    <h3 className="mb-4 text-2xl font-bold">Anpassningsbara färgscheman</h3>
                    <p className="mb-6 text-muted-foreground">
                      Anpassa ditt CV med våra färgscheman eller skapa dina egna. Välj de perfekta 
                      färgerna för att visa din personlighet och passa din målbransch.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Professionella färgpaket för olika branscher",
                        "Anpassa accentfärger och typografi",
                        "Färgharmonier för ett konsekvent utseende",
                        "Designvänliga alternativ för alla nivåer",
                        "Tillgänglighetsfokuserade färgval"
                      ].map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          custom={index + 1}
                          variants={fadeUpAnimation}
                          className="flex items-start"
                        >
                          <div className="mr-2 sm:mr-3 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
            
            {/* Mallar-flik */}
            <TabsContent value="templates" className="space-y-8 sm:space-y-12">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={fadeUpAnimation}
                  >
                    <h3 className="mb-4 text-2xl font-bold">Professionella mallar</h3>
                    <p className="mb-6 text-muted-foreground">
                      Välj bland ett brett utbud av mallar designade för olika branscher och karriärnivåer. 
                      Varje mall är skapad för att maximera ditt genomslag.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Mallar för teknik, kreativa branscher, finans och mer",
                        "Moderna och tidlösa designer",
                        "Optimerade för ATS-system som används av rekryterare",
                        "Anpassade för både erfarna och nybörjare",
                        "Regelbundet uppdaterade med nya designer"
                      ].map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          custom={index + 1}
                          variants={fadeUpAnimation}
                          className="flex items-start"
                        >
                          <div className="mr-2 sm:mr-3 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Link href="/templates/all">
                        <Button variant="outline" className="group">
                          Utforska alla mallar
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
                
                <div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-xl border border-border bg-card/30 p-3 shadow-lg"
                  >
                    <Image 
                      src="/images/features/f2.png" 
                      alt="Professionella mallar" 
                      width={600} 
                      height={400}
                      className="w-full rounded-lg shadow-sm"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full bg-primary/10 p-3 shadow-lg border border-primary/20">
                      <Layout className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="grid gap-12 md:grid-cols-2 md:items-center mt-12">
                <div className="order-1 md:order-1">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-xl border border-border bg-card/30 p-3 shadow-lg"
                  >
                    <Image 
                      src="/images/features/f3.png" 
                      alt="Flexibla exportalternativ för mallar" 
                      width={600} 
                      height={400}
                      className="w-full rounded-lg shadow-sm object-contain"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full bg-primary/10 p-3 shadow-lg border border-primary/20">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                </div>
                
                <div className="order-2 md:order-2">
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={fadeUpAnimation}
                  >
                    <h3 className="mb-4 text-2xl font-bold">Flexibla exportalternativ</h3>
                    <p className="mb-6 text-muted-foreground">
                      Exportera din valda mall i olika format, perfekt för olika ansökningskanaler. 
                      Varje export är optimerad för högsta kvalitet och professionellt utseende.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Högkvalitativ PDF med bibehållen formatering",
                        "ATS-vänliga format för jobbportaler",
                        "Delningslänkar för din online-profil",
                        "Print-optimerade utskrifter",
                        "Exportera specifika versioner för olika tjänster"
                      ].map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          custom={index + 1}
                          variants={fadeUpAnimation}
                          className="flex items-start"
                        >
                          <div className="mr-2 sm:mr-3 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
              
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start">
                  <div className="mb-4 sm:mb-0 sm:mr-6">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                      <LightbulbIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-base sm:text-lg font-semibold">Tips för att välja rätt mall</h4>
                    <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                      När du väljer en CV-mall, tänk på branschens förväntningar och din personliga stil.
                      Kreativa branscher tillåter mer unika designer, medan traditionella branscher kan föredra 
                      mer konservativa format. Se till att mallen framhäver dina viktigaste egenskaper!
                    </p>
                    <Link 
                      href="/resources/tips" 
                      className="inline-flex items-center text-xs sm:text-sm font-medium text-primary hover:underline"
                    >
                      Läs fler tips
                      <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Export-flik */}
            <TabsContent value="export" className="space-y-8 sm:space-y-12">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div className="order-2 md:order-1">
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={fadeUpAnimation}
                  >
                    <h3 className="mb-4 text-2xl font-bold">Flexibla exportalternativ</h3>
                    <p className="mb-6 text-muted-foreground">
                      Exportera ditt CV i olika format, perfekt för olika ansökningskanaler. 
                      Alla filer är optimerade för högsta kvalitet och kompatibilitet.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Högkvalitativ PDF med bibehållen formatering",
                        "ATS-vänliga format för jobbportaler",
                        "Delningslänkar för din online-profil",
                        "Print-optimerade utskrifter",
                        "Möjlighet att exportera specifika versioner av ditt CV"
                      ].map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          custom={index + 1}
                          variants={fadeUpAnimation}
                          className="flex items-start"
                        >
                          <div className="mr-2 sm:mr-3 mt-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
                
                <div className="order-1 md:order-2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-xl border border-border bg-card/30 p-3 shadow-lg"
                  >
                    <Image 
                      src="/images/features/f3.png" 
                      alt="Flexibla exportalternativ" 
                      width={600} 
                      height={400}
                      className="w-full rounded-lg shadow-sm object-contain"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full bg-primary/10 p-3 shadow-lg border border-primary/20">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { 
                    title: "PDF Export", 
                    icon: <Download className="h-10 w-10 text-primary" />,
                    description: "Professionell PDF redo att skickas till arbetsgivare med korrekt formatering och typsnitt."
                  },
                  { 
                    title: "Delningslänkar", 
                    icon: <FileText className="h-10 w-10 text-primary" />, 
                    description: "Skapa en länk till ditt CV online som du kan dela i digitala ansökningar och sociala medier."
                  },
                  { 
                    title: "Versionshantering", 
                    icon: <Award className="h-10 w-10 text-primary" />, 
                    description: "Spara och hantera olika versioner av ditt CV för olika tjänster och branscher."
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex flex-col items-center rounded-xl border border-border bg-background p-4 sm:p-6 text-center shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-3 sm:mb-4 rounded-full bg-primary/10 p-3 sm:p-4">
                      {feature.icon}
                    </div>
                    <h4 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold">{feature.title}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Fördelar */}
          <div className="mt-16 sm:mt-32">
            <div className="mb-10 sm:mb-16 text-center">
              <FadeIn>
                <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold">Varför välja CVerktyg?</h2>
                <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
                  Vår tjänst skiljer sig från andra CV-byggare genom vår fokus på 
                  kvalitet, användarvänlighet och professionella resultat.
                </p>
              </FadeIn>
            </div>
            
            <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Användarvänligt",
                  description: "Skapa ett professionellt CV på några minuter, utan förkunskaper i design."
                },
                {
                  title: "Professionella mallar",
                  description: "Utvecklade av rekryteringsexperter och designers för maximal effekt."
                },
                {
                  title: "ATS-optimerat",
                  description: "Våra CV:n är skapade för att passera automatiska rekryteringssystem."
                },
                {
                  title: "Flexibel anpassning",
                  description: "Anpassa varje detalj från färger och typsnitt till layout och innehåll."
                },
                {
                  title: "Säker datahantering",
                  description: "Din information lagras säkert och är alltid under din kontroll."
                },
                {
                  title: "Ständig utveckling",
                  description: "Vi utvecklar kontinuerligt nya funktioner baserat på användarfeedback."
                }
              ].map((benefit, index) => (
                <FadeIn key={index} delay={index * 0.1}>
                  <div className="rounded-xl border border-border p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{benefit.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          
          {/* CTA-sektion */}
          <div className="mt-16 sm:mt-24">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-4xl rounded-xl bg-gradient-to-r from-primary/80 to-primary p-6 sm:p-8 md:p-12 text-center shadow-lg"
            >
              <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-white">Redo att skapa ditt professionella CV?</h2>
              <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-sm sm:text-base text-white/90">
                Kom igång redan idag och ta det första steget mot din drömkarriär. 
                Skapa ditt första CV kostnadsfritt och se skillnaden själv.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AnimatedButton 
                  asChild
                  size="lg" 
                  variant="secondary"
                  className="font-semibold w-full sm:w-auto"
                >
                  <Link href="/dashboard">Skapa mitt CV nu</Link>
                </AnimatedButton>
                <Link href="/templates/all" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent border-white/30 text-white hover:bg-white/10 font-medium w-full sm:w-auto"
                  >
                    Utforska mallar
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Tillbaka till toppen-knapp */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 1 : 0 }}
          className={cn(
            "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90",
            scrolled ? "visible translate-y-0" : "invisible translate-y-10"
          )}
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>
      </PageTransition>
    </>
  )
} 