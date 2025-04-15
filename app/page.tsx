import Link from "next/link"
import { Check, FileText, Star, Users } from "lucide-react"
import { MetaTags } from "@/components/MetaTags"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { AnimatedCard } from "@/components/animations/AnimatedCard"
import { CTAButton } from "@/components/CTAButton"
import { AppLayout } from "@/components/layout/AppLayout"

export default function Home() {
  return (
    <>
      <MetaTags 
        title="CVerktyg - Skapa professionella CV:n enkelt och snabbt"
        description="Med CVerktyg kan du skapa, redigera och exportera professionella CV:n på några minuter. Kom igång idag och ta nästa steg i din karriär med våra användarvänliga mallar."
        keywords="cv, cv-mall, jobbansökan, skapa cv, cv online, professionellt cv, gratis cv-mall"
        ogUrl="https://cverktyg.se"
      />
      <AppLayout>
        <div className="flex flex-col">
          <PageTransition>
            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-6 py-20 text-center md:py-32">
              <FadeIn>
                <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-primary">
                  <Check className="absolute inset-0 h-full w-full p-6 text-white" />
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Skapa professionella CV:n <br className="hidden sm:inline" />
                  <span className="text-primary">enkelt och snabbt</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
                  Med CVerktyg kan du skapa, redigera och exportera professionella CV:n på några minuter. Kom igång idag
                  och ta nästa steg i din karriär.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <AnimatedButton size="lg" asChild>
                    <Link href="/dashboard">Kom igång</Link>
                  </AnimatedButton>
                  <AnimatedButton variant="outline" size="lg" asChild>
                    <Link href="/templates/all">Se mallar</Link>
                  </AnimatedButton>
                </div>
              </FadeIn>

              {/* Trust badges */}
              <FadeIn delay={0.4}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">10,000+ nöjda användare</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">50+ professionella mallar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">4.9/5 betyg</span>
                  </div>
                </div>
              </FadeIn>
            </section>

            {/* Features Section */}
            <section className="w-full bg-secondary py-16">
              <div className="container">
                <FadeIn>
                  <h2 className="mb-10 text-center text-3xl font-bold">Funktioner</h2>
                </FadeIn>
                <StaggerChildren>
                  <div className="grid gap-8 md:grid-cols-3">
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Enkelt att använda</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Intuitivt gränssnitt som gör det enkelt att skapa och redigera ditt CV.
                      </p>
                    </AnimatedCard>
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Anpassningsbart</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Lägg till, ta bort och ordna om sektioner efter dina behov.
                      </p>
                    </AnimatedCard>
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Exportera som PDF</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Exportera ditt CV som en professionell PDF-fil med ett klick.
                      </p>
                    </AnimatedCard>
                  </div>
                </StaggerChildren>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="container py-20">
              <FadeIn>
                <h2 className="mb-12 text-center text-3xl font-bold">Hur det fungerar</h2>
              </FadeIn>
              <StaggerChildren>
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Välj en mall</h3>
                    <p className="text-muted-foreground">
                      Bläddra bland våra professionellt designade mallar och välj den som passar dig bäst.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Fyll i dina uppgifter</h3>
                    <p className="text-muted-foreground">
                      Lägg till din information, utbildning, erfarenhet och färdigheter i vårt användarvänliga gränssnitt.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">Exportera och dela</h3>
                    <p className="text-muted-foreground">
                      Exportera ditt CV som PDF och dela det med potentiella arbetsgivare eller spara det för framtida
                      bruk.
                    </p>
                  </div>
                </div>
              </StaggerChildren>
              <FadeIn delay={0.3}>
                <div className="mt-12 flex justify-center">
                  <AnimatedButton size="lg" asChild>
                    <Link href="/editor/new">Skapa ditt CV nu</Link>
                  </AnimatedButton>
                </div>
              </FadeIn>
            </section>

            {/* Testimonials Section */}
            <section className="w-full bg-primary/5 py-20">
              <div className="container">
                <FadeIn>
                  <h2 className="mb-12 text-center text-3xl font-bold">Vad våra användare säger</h2>
                </FadeIn>
                <StaggerChildren>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm">
                      <div className="mb-4 flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="mb-4 italic text-muted-foreground">
                        "CVerktyg hjälpte mig att skapa ett professionellt CV som verkligen sticker ut. Jag fick jobbet
                        jag sökte!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary"></div>
                        <div>
                          <p className="font-medium">Anna Johansson</p>
                          <p className="text-sm text-muted-foreground">Webbutvecklare</p>
                        </div>
                      </div>
                    </AnimatedCard>
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm">
                      <div className="mb-4 flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="mb-4 italic text-muted-foreground">
                        "Så enkelt att använda! Jag kunde skapa ett professionellt CV på mindre än 30 minuter.
                        Rekommenderas starkt!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary"></div>
                        <div>
                          <p className="font-medium">Erik Svensson</p>
                          <p className="text-sm text-muted-foreground">Marknadsförare</p>
                        </div>
                      </div>
                    </AnimatedCard>
                    <AnimatedCard className="rounded-lg bg-white p-6 shadow-sm">
                      <div className="mb-4 flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="mb-4 italic text-muted-foreground">
                        "Mallarna är fantastiska och verktyget är så intuitivt. Jag har rekommenderat CVerktyg till alla
                        mina vänner!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary"></div>
                        <div>
                          <p className="font-medium">Maria Lindberg</p>
                          <p className="text-sm text-muted-foreground">Grafisk designer</p>
                        </div>
                      </div>
                    </AnimatedCard>
                  </div>
                </StaggerChildren>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="container py-20">
              <FadeIn>
                <h2 className="mb-12 text-center text-3xl font-bold">Vanliga frågor</h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="mx-auto max-w-3xl">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Är CVerktyg gratis att använda?</AccordionTrigger>
                      <AccordionContent>
                        Ja, CVerktyg erbjuder en gratis basversion som låter dig skapa och exportera CV:n. Vi erbjuder
                        också premiumfunktioner för användare som behöver mer avancerade alternativ.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Kan jag redigera mitt CV efter att jag har skapat det?</AccordionTrigger>
                      <AccordionContent>
                        Absolut! Du kan redigera ditt CV när som helst. Alla dina CV:n sparas i ditt konto så att du
                        enkelt kan göra ändringar när det behövs.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Hur exporterar jag mitt CV?</AccordionTrigger>
                      <AccordionContent>
                        När du är nöjd med ditt CV kan du enkelt exportera det som en PDF-fil genom att klicka på
                        "Exportera som PDF"-knappen. Du kan sedan ladda ner filen till din enhet.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Kan jag skapa flera CV:n?</AccordionTrigger>
                      <AccordionContent>
                        Ja, du kan skapa så många CV:n du vill. Detta är särskilt användbart om du vill anpassa ditt CV
                        för olika typer av jobb eller branscher.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>Är mina uppgifter säkra?</AccordionTrigger>
                      <AccordionContent>
                        Vi tar datasäkerhet på största allvar. Alla dina personuppgifter är krypterade och lagras säkert.
                        Vi delar aldrig dina uppgifter med tredje part utan ditt samtycke.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </FadeIn>
            </section>

            {/* CTA Section */}
            <section className="w-full bg-primary py-16 text-white">
              <div className="container text-center">
                <FadeIn>
                  <h2 className="mb-4 text-3xl font-bold">Redo att skapa ditt professionella CV?</h2>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <p className="mb-8 text-lg text-white/80">
                    Kom igång idag och ta nästa steg i din karriär med CVerktyg.
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <CTAButton size="lg" variant="secondary" asChild>
                    <Link href="/dashboard">Skapa ditt CV nu</Link>
                  </CTAButton>
                </FadeIn>
              </div>
            </section>
          </PageTransition>

          <div id="footer-marker" className="py-4 text-center text-xs text-muted-foreground">
            Footern bör visas under detta meddelande 
          </div>
        </div>
      </AppLayout>
    </>
  )
}

