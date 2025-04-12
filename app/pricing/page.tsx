"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CheckIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/Navbar"
import { useToast } from "@/components/ui/use-toast"

interface PlanCardProps {
  name: string
  description: string
  price: string
  billingInterval: string
  features: { name: string; included: boolean }[]
  currentPlan: boolean
  onSubscribe: () => void
  isPopular: boolean
  planId: string
}

function PlanCard({
  name,
  description,
  price,
  billingInterval,
  features,
  currentPlan,
  onSubscribe,
  isPopular,
  planId
}: PlanCardProps) {
  return (
    <Card className={`flex flex-col h-full relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 inset-x-0 flex justify-center">
          <div className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-sm font-semibold">
            Populärast
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <span className="text-4xl font-bold">{price} kr</span>
          {billingInterval !== "engångsbetalning" && (
            <span className="text-muted-foreground">/{billingInterval === "monthly" ? "månad" : "år"}</span>
          )}
          {billingInterval === "engångsbetalning" && (
            <p className="text-sm text-muted-foreground">Engångsbetalning</p>
          )}
        </div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              {feature.included ? (
                <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              ) : (
                <XIcon className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
              )}
              <span className={feature.included ? "" : "text-muted-foreground"}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSubscribe} 
          className="w-full" 
          variant={isPopular ? "default" : "outline"}
          disabled={currentPlan}
        >
          {currentPlan ? "Nuvarande plan" : `Välj ${name}`}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const { toast } = useToast()

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        
        // Hämta användarens session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser(session.user)
          
          // Hämta användarens prenumeration
          const { data: subData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", session.user.id)
            .single()
          
          if (!subError && subData) {
            setSubscription(subData)
          }
        }
        
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getProfile()
  }, [supabase, router])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  // Hantera prenumerationsköp (simulerat i denna version)
  const handleSubscribe = async (plan: string) => {
    if (!user) {
      toast({
        title: "Fel",
        description: "Du måste vara inloggad för att prenumerera",
        variant: "destructive"
      })
      router.push("/auth/signin")
      return
    }

    // Simulera en köpprocess
    toast({
      title: "Planbyte",
      description: `Du har valt planen ${plan}`
    })
    // I en riktig implementation skulle du här hantera betalningen
    // och uppdatera användarens prenumerationsplan i databasen
  }

  const planData = {
    free: {
      name: "Gratis",
      description: "Kom igång med grundläggande CV-skapande",
      price: {
        monthly: "0",
        yearly: "0",
      },
      features: [
        { name: "Skapa upp till 3 CV", included: true },
        { name: "Grundläggande mallar", included: true },
        { name: "Exportera till PDF (vattenstämpel)", included: true },
        { name: "Personlig rådgivning", included: false },
        { name: "Anpassade färger och typsnitt", included: false },
        { name: "Avancerade mallar", included: false },
        { name: "Prioriterad support", included: false },
      ],
    },
    basic: {
      name: "Bas",
      description: "Perfect för jobbsökare som vill sticka ut",
      price: {
        monthly: "49",
        yearly: "490",
      },
      features: [
        { name: "Skapa obegränsat med CV", included: true },
        { name: "Grundläggande mallar", included: true },
        { name: "Exportera till PDF utan vattenstämpel", included: true },
        { name: "Personlig rådgivning", included: false },
        { name: "Anpassade färger och typsnitt", included: true },
        { name: "Avancerade mallar", included: false },
        { name: "Prioriterad support", included: false },
      ],
    },
    premium: {
      name: "Premium",
      description: "För seriösa karriärister som vill maximera sina chanser",
      price: {
        monthly: "99",
        yearly: "990",
      },
      features: [
        { name: "Skapa obegränsat med CV", included: true },
        { name: "Alla mallar inklusive premiummallar", included: true },
        { name: "Exportera till PDF utan vattenstämpel", included: true },
        { name: "Personlig rådgivning", included: true },
        { name: "Anpassade färger och typsnitt", included: true },
        { name: "Avancerade mallar", included: true },
        { name: "Prioriterad support", included: true },
      ],
    },
    lifetime: {
      name: "Lifetime",
      description: "Engångsbetalning för evig tillgång",
      price: {
        monthly: "1990",
        yearly: "1990",
      },
      features: [
        { name: "Skapa obegränsat med CV", included: true },
        { name: "Alla mallar inklusive premiummallar", included: true },
        { name: "Exportera till PDF utan vattenstämpel", included: true },
        { name: "Personlig rådgivning", included: true },
        { name: "Anpassade färger och typsnitt", included: true },
        { name: "Avancerade mallar", included: true },
        { name: "Prioriterad support", included: true },
        { name: "Livstidsuppdateringar", included: true },
      ],
    },
  }

  const getCurrentPlan = () => {
    if (!subscription) return "free"
    return subscription.plan
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Välj rätt plan för dig</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Skapa professionella CVn som ger dig konkurrensfördelar i jobbsökandet
            </p>
          </div>

          <div className="flex justify-center pt-4 pb-8">
            <Tabs 
              defaultValue="monthly" 
              onValueChange={(value) => setBillingInterval(value as "monthly" | "yearly")}
              className="w-fit"
            >
              <TabsList className="grid w-64 grid-cols-2">
                <TabsTrigger value="monthly">Månadsvis</TabsTrigger>
                <TabsTrigger value="yearly" className="relative">
                  Årsvis
                  <span className="absolute -top-3 -right-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Spara 15%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Gratisplan */}
            <motion.div variants={fadeIn}>
              <PlanCard 
                name={planData.free.name}
                description={planData.free.description}
                price={planData.free.price[billingInterval]}
                billingInterval={billingInterval}
                features={planData.free.features}
                currentPlan={getCurrentPlan() === "free"}
                onSubscribe={() => {/* Ingen åtgärd för gratisplan */}}
                isPopular={false}
                planId="free"
              />
            </motion.div>

            {/* Basplan */}
            <motion.div variants={fadeIn}>
              <PlanCard 
                name={planData.basic.name}
                description={planData.basic.description}
                price={planData.basic.price[billingInterval]}
                billingInterval={billingInterval}
                features={planData.basic.features}
                currentPlan={getCurrentPlan() === "basic"}
                onSubscribe={() => handleSubscribe("basic")}
                isPopular={false}
                planId="basic"
              />
            </motion.div>

            {/* Premiumplan */}
            <motion.div variants={fadeIn}>
              <PlanCard 
                name={planData.premium.name}
                description={planData.premium.description}
                price={planData.premium.price[billingInterval]}
                billingInterval={billingInterval}
                features={planData.premium.features}
                currentPlan={getCurrentPlan() === "premium"}
                onSubscribe={() => handleSubscribe("premium")}
                isPopular={true}
                planId="premium"
              />
            </motion.div>

            {/* Lifetime */}
            <motion.div variants={fadeIn}>
              <PlanCard 
                name={planData.lifetime.name}
                description={planData.lifetime.description}
                price={planData.lifetime.price[billingInterval]}
                billingInterval="engångsbetalning"
                features={planData.lifetime.features}
                currentPlan={getCurrentPlan() === "lifetime"}
                onSubscribe={() => handleSubscribe("lifetime")}
                isPopular={false}
                planId="lifetime"
              />
            </motion.div>
          </motion.div>

          <motion.div 
            variants={fadeIn}
            className="bg-muted p-8 rounded-xl mt-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold">Engångsexport</h2>
                <p className="text-muted-foreground mt-2">
                  Behöver du bara exportera ett CV en gång utan prenumeration?
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>Exportera till PDF utan vattenstämpel</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>Betala endast för det du behöver</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    <span>Inget abonnemang att avsluta</span>
                  </li>
                </ul>
                <Button 
                  className="mt-6"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Fel",
                        description: "Du måste vara inloggad för att köpa en engångsexport",
                        variant: "destructive"
                      })
                      router.push("/auth/signin")
                      return
                    }
                    toast({
                      title: "Köp",
                      description: "Du har valt engångsexport för 19 kr"
                    })
                  }}
                >
                  Köp för 19 kr
                </Button>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-background border shadow-lg p-4 rounded-lg"
                >
                  <div className="h-80 bg-card rounded-md flex items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      CV Förhandsvisning
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -bottom-4 right-6 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold"
                >
                  Endast 19 kr
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeIn}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold">Vanliga frågor</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="text-left">
                <h3 className="font-semibold text-lg">Kan jag byta plan senare?</h3>
                <p className="text-muted-foreground mt-1">
                  Ja, du kan uppgradera eller nedgradera din plan när som helst. Vid nedgradering träder ändringen i kraft vid nästa faktureringsperiod.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Finns det någon bindningstid?</h3>
                <p className="text-muted-foreground mt-1">
                  Nej, du kan avsluta din prenumeration när som helst. Ditt konto återgår då till gratisplanen vid slutet av faktureringsperioden.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Kan jag få pengarna tillbaka?</h3>
                <p className="text-muted-foreground mt-1">
                  Vi erbjuder full återbetalning inom 14 dagar om du inte är nöjd med din prenumeration.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Hur fungerar Lifetime-planen?</h3>
                <p className="text-muted-foreground mt-1">
                  Lifetime-planen är en engångsbetalning som ger dig tillgång till alla nuvarande och framtida premium-funktioner utan ytterligare kostnader.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </>
  )
} 