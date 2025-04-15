"use client"

import { Navbar } from "@/components/Navbar"
import { MetaTags } from "@/components/MetaTags"
import { Check, Users, HeartHandshake, Sparkles, LightbulbIcon, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Animationsvariant för att skala upp element
const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
}

// Animationsvariant för att glida in från vänster
const slideIn = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

export default function AboutPage() {
  return (
    <>
      <MetaTags 
        title="Om CVerktyg - Vår vision och historia"
        description="Lär känna teamet bakom CVerktyg. Vi hjälper människor att skapa professionella CV:n som öppnar dörrar till nya karriärmöjligheter genom innovativa och användarvänliga verktyg."
        keywords="om cverktyg, cv-företag, cv-tjänst, cv-skapande team, professionella cv-verktyg, karriärhjälp"
        ogUrl="https://cverktyg.se/about"
      />
      <Navbar />
      <PageTransition>
        {/* Hero-sektion */}
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="absolute -top-[10%] right-[20%] h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute left-[15%] top-[20%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="container relative z-10">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <motion.div 
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg"
              >
                <Check className="h-12 w-12 text-white" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
              >
                Om CVerktyg
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-2xl text-xl text-muted-foreground"
              >
                Vi hjälper människor att skapa professionella, imponerande CV:n 
                som öppnar dörrar till nya karriärmöjligheter.
              </motion.p>
            </div>

            {/* Statistik */}
            <div className="mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
              <FadeIn delay={0.4}>
                <Card className="overflow-hidden border-none bg-background/40 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="mb-2 text-4xl font-bold">12,000+</span>
                    <p className="text-muted-foreground">Nöjda användare</p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.5}>
                <Card className="overflow-hidden border-none bg-background/40 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <HeartHandshake className="h-6 w-6 text-primary" />
                    </div>
                    <span className="mb-2 text-4xl font-bold">94%</span>
                    <p className="text-muted-foreground">Rekommenderar oss</p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={0.6}>
                <Card className="overflow-hidden border-none bg-background/40 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <span className="mb-2 text-4xl font-bold">5+</span>
                    <p className="text-muted-foreground">År av erfarenhet</p>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
        
        {/* Innehållssektioner */}
        <div className="container py-20">
          <Tabs defaultValue="vision" className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <TabsList className="mb-12">
                <TabsTrigger value="vision">Vår vision</TabsTrigger>
                <TabsTrigger value="team">Vårt team</TabsTrigger>
                <TabsTrigger value="offer">Vad vi erbjuder</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="vision" className="space-y-8">
              <div className="grid gap-12 md:grid-cols-5 md:items-center md:gap-16">
                <div className="md:col-span-3">
                  <motion.div 
                    variants={slideIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h2 className="mb-6 text-3xl font-bold">Vår vision</h2>
                    <p className="mb-4 text-lg">
                      CVerktyg grundades med en enkel vision: att göra det enkelt för alla att skapa professionella CV:n som
                      sticker ut. Vi tror att ett välutformat CV kan öppna dörrar och skapa möjligheter, och vi vill ge alla
                      tillgång till verktyg som gör detta möjligt.
                    </p>
                    <p className="mb-4 text-lg">
                      Vi är övertygade om att varje person har unika färdigheter och erfarenheter som förtjänar 
                      att presenteras på bästa sätt. Därför har vi skapat ett verktyg som hjälper dig att framhäva 
                      just det som gör dig speciell.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">Innovation</div>
                      <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">Tillgänglighet</div>
                      <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">Professionalitet</div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="relative md:col-span-2">
                  <motion.div 
                    variants={scaleUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-background/30 shadow-xl"
                  >
                    <Image 
                      src="/images/features/om1.png" 
                      alt="Vår vision - Person med CV framför öppen dörr" 
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </motion.div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Vi tror på kraften i ett väldesignat CV och hur det kan öppna dörrar till nya möjligheter.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                <AnimatedButton asChild>
                  <Link href="/editor/new" className="flex items-center gap-2">
                    Skapa ditt CV nu <ArrowRight className="h-4 w-4" />
                  </Link>
                </AnimatedButton>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-8">
              <h2 className="mb-8 text-center text-3xl font-bold">Vårt team</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FadeIn delay={0.1}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] w-full relative">
                        <Image 
                          src="/images/about/team1.jpg" 
                          alt="Teammedlem" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold">Amanda Lindberg</h3>
                        <p className="text-sm text-muted-foreground">Medgrundare & VD</p>
                        <p className="mt-3 text-sm">
                          Med 10 års erfarenhet inom rekrytering och HR hjälper Amanda att forma 
                          framtiden för CVerktyg.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                
                <FadeIn delay={0.2}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] w-full relative">
                        <Image 
                          src="/images/about/team2.jpg" 
                          alt="Teammedlem" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold">Johan Svensson</h3>
                        <p className="text-sm text-muted-foreground">Teknikchef</p>
                        <p className="mt-3 text-sm">
                          Johan leder vår tekniska utveckling med fokus på att skapa en sömlös och 
                          intuativ användarupplevelse.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                
                <FadeIn delay={0.3}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] w-full relative">
                        <Image 
                          src="/images/about/team3.jpg" 
                          alt="Teammedlem" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold">Maria Johansson</h3>
                        <p className="text-sm text-muted-foreground">Designchef</p>
                        <p className="mt-3 text-sm">
                          Maria har designat några av Sveriges mest populära digitala produkter och 
                          leder vår designprocess.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </TabsContent>
            
            <TabsContent value="offer" className="space-y-8">
              <h2 className="mb-6 text-center text-3xl font-bold">Vad vi erbjuder</h2>
              <p className="mb-8 text-center text-lg text-muted-foreground">
                På CVerktyg får du tillgång till allt du behöver för att skapa ett professionellt CV
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <FadeIn>
                  <Card className="h-full border border-primary/20 transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Professionella mallar</h3>
                      <p className="flex-1 text-muted-foreground">
                        Välj bland ett brett utbud av professionellt designade CV-mallar för olika branscher 
                        och karriärnivåer.
                      </p>
                      <div className="mt-4">
                        <Link 
                          href="/templates/all" 
                          className="group inline-flex items-center text-sm font-medium text-primary"
                        >
                          Utforska mallar
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                
                <FadeIn delay={0.1}>
                  <Card className="h-full border border-primary/20 transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Intuitivt gränssnitt</h3>
                      <p className="flex-1 text-muted-foreground">
                        Ett användarvänligt gränssnitt som gör det enkelt att redigera och anpassa ditt CV, 
                        även utan designkunskaper.
                      </p>
                      <div className="mt-4">
                        <Link 
                          href="/features" 
                          className="group inline-flex items-center text-sm font-medium text-primary"
                        >
                          Se funktioner
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                
                <FadeIn delay={0.2}>
                  <Card className="h-full border border-primary/20 transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Anpassningsmöjligheter</h3>
                      <p className="flex-1 text-muted-foreground">
                        Lägg till, ta bort och ordna om sektioner efter dina behov. 
                        Anpassa färger, typsnitt och layout för att matcha din personliga stil.
                      </p>
                      <div className="mt-4">
                        <Link 
                          href="/dashboard" 
                          className="group inline-flex items-center text-sm font-medium text-primary"
                        >
                          Kom igång
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
                
                <FadeIn delay={0.3}>
                  <Card className="h-full border border-primary/20 transition-all hover:border-primary hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Expert råd & tips</h3>
                      <p className="flex-1 text-muted-foreground">
                        Få tillgång till expertråd och tips för att skapa ett imponerande CV. 
                        Lär dig vad arbetsgivare letar efter och hur du kan sticka ut.
                      </p>
                      <div className="mt-4">
                        <Link 
                          href="/resources/tips" 
                          className="group inline-flex items-center text-sm font-medium text-primary"
                        >
                          Läs tips
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* CTA-sektion */}
          <div className="mt-20">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl rounded-xl bg-gradient-to-br from-primary to-primary/70 p-8 text-center shadow-lg sm:p-12"
            >
              <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Redo att skapa ditt professionella CV?</h2>
              <p className="mb-6 text-white/90">
                Kom igång med CVerktyg idag och ta nästa steg i din karriär.
              </p>
              <AnimatedButton 
                asChild
                size="lg" 
                variant="secondary"
                className="font-semibold"
              >
                <Link href="/dashboard">Kom igång kostnadsfritt</Link>
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </>
  )
}

