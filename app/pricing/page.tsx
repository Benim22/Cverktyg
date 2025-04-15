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
import { MetaTags } from "@/components/MetaTags"
import { useToast } from "@/components/ui/use-toast"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { AppLayout } from "@/components/layout/AppLayout"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Definiera typer för prenumeration
type SubscriptionPlan = "free" | "basic" | "premium" | "lifetime";
type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

interface Subscription {
  id?: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  is_lifetime: boolean;
  starts_at?: string;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { toast } = useToast()
  const { refreshSubscription, createOrUpdateSubscription } = useSubscription()

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

    try {
      // Visa laddningsmeddelande
      toast({
        title: "Bearbetar...",
        description: "Din prenumeration uppdateras"
      })
      
      console.log("Skickar prenumerationsdata:", { plan, billingInterval })
      
      // Beräkna utgångsdatum baserat på faktureringsperiod
      let expiresAt = null;
      if (plan !== "lifetime" && billingInterval) {
        const expiryDate = new Date();
        if (billingInterval === "monthly") {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else if (billingInterval === "yearly") {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        expiresAt = expiryDate.toISOString();
      }
      
      // Prenumerationsdata
      const subscriptionData: Partial<Subscription> = {
        plan: plan as SubscriptionPlan,
        status: "active" as SubscriptionStatus,
        is_lifetime: plan === "lifetime",
      };
      
      // Lägg till utgångsdatum endast om det inte är null
      if (expiresAt !== null) {
        subscriptionData.expires_at = expiresAt;
      } else {
        // Om det är gratisplanen eller livstidsplanen, sätt utgångsdatum till undefined
        subscriptionData.expires_at = undefined;
      }
      
      // 1. Använd vår nya API-endpoint direkt
      try {
        console.log("Använder nya API-endpointen för prenumerationsuppdatering");
        const response = await fetch("/api/subscription/update-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            planData: subscriptionData
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.subscription) {
            console.log("Prenumeration uppdaterad via API:", data.subscription);
            setSubscription(data.subscription);
            
            // Uppdatera SubscriptionContext
            await refreshSubscription();
            
            toast({
              title: "Framgång!",
              description: `Din prenumeration har uppdaterats till ${planData[plan as keyof typeof planData].name}`,
              variant: "default"
            });
            
            return;
          }
        } else {
          console.error("API-fel:", await response.text());
        }
      } catch (apiError) {
        console.error("Fel vid användning av API:", apiError);
      }
      
      // 2. Använd createOrUpdateSubscription från context om API misslyckades
      try {
        console.log("Försöker med createOrUpdateSubscription från context");
        const result = await createOrUpdateSubscription(subscriptionData);
        
        if (result) {
          console.log("Prenumeration uppdaterad via context:", result);
          
          toast({
            title: "Framgång!",
            description: `Din prenumeration har uppdaterats till ${planData[plan as keyof typeof planData].name}`,
            variant: "default"
          });
          
          return;
        }
        
        console.warn("Kunde inte uppdatera prenumeration via context");
      } catch (contextError) {
        console.error("Fel med context-metoden:", contextError);
      }
      
      // 3. Fallback till de gamla API-metoderna
      console.log("Återgår till gamla metoder som fallback");
      try {
        const response = await fetch("/api/subscription/direct-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            plan,
            billingInterval
          })
        });
        
        const result = await response.json();
        console.log("Direct API-svar:", result);
        
        if (response.ok) {
          setSubscription(result.subscription);
          await refreshSubscription();
          
          toast({
            title: "Framgång!",
            description: `Din prenumeration har uppdaterats till ${planData[plan as keyof typeof planData].name}`,
            variant: "default"
          });
          
          return;
        }
        
        console.warn("Direct API misslyckades:", result);
      } catch (directError) {
        console.error("Fel med direct-update API:", directError);
      }
      
      // Visa ett felmeddelande till användaren efter att alla försök har misslyckats
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera din prenumeration. Vänligen försök igen senare.",
        variant: "destructive"
      });
      
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Fel",
        description: error.message || "Ett fel uppstod vid uppdatering av prenumerationen",
        variant: "destructive"
      });
    }
  }
  
  // Öppna dialogen för engångsexport
  const handleOneTimeExportClick = () => {
    if (!user) {
      toast({
        title: "Fel",
        description: "Du måste vara inloggad för att köpa en engångsexport",
        variant: "destructive"
      })
      router.push("/auth/signin")
      return
    }
    
    // Öppna dialogen
    setShowExportDialog(true)
  }

  // Hantera köp av engångsexport
  const handleOneTimeExport = async () => {
    try {
      setShowExportDialog(false)
      
      // Visa laddningsmeddelande
      toast({
        title: "Bearbetar...",
        description: "Förbereder din betalning"
      })
      
      // Steg 1: Initiera betalningsprocessen
      // I en riktig implementation skulle detta anropa t.ex. Stripe eller Klarna
      // för att skapa en betalningsintent
      
      // Simulera nätverksfördröjning
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // För utveckling: Simulera betalning eller använd en riktig betalningsgateway
      const isDev = process.env.NODE_ENV === "development";
      let paymentSuccessful = false;
      
      if (isDev) {
        // I utvecklingsläge: Simulera betalningsprocess
        try {
          // Här skulle vi vanligtvis dirigera användaren till betalningssidan
          // eller visa en betalningsmodal
          toast({
            title: "Utvecklingsläge",
            description: "Simulerar betalningsprocess...",
            variant: "default"
          });
          
          // Simulera betalningsprocess (2 sekunder)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Betalning lyckades
          paymentSuccessful = true;
        } catch (paymentError) {
          console.error("Simulerad betalning misslyckades:", paymentError);
          toast({
            title: "Fel",
            description: "Simulerad betalning misslyckades",
            variant: "destructive"
          });
          return;
        }
      } else {
        // I produktionsläge: Använd riktig betalningsgateway
        try {
          // Kod för att integrera med faktisk betalningslösning skulle vara här
          // t.ex. redirect till Stripe/Klarna eller visa en betalningsmodal
          
          toast({
            title: "OBS",
            description: "Betalningshantering är inte helt implementerad ännu",
            variant: "default"
          });
          
          // När vi inte har en riktig implementation, returnera här
          return;
          
          // När betalningen är klar och bekräftad, sätt paymentSuccessful = true;
        } catch (paymentError) {
          console.error("Betalning misslyckades:", paymentError);
          toast({
            title: "Betalning misslyckades",
            description: "Vänligen försök igen eller kontakta support",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Endast fortsätt om betalningen lyckades
      if (paymentSuccessful) {
        // Steg 2: Betalningen har gått igenom, nu kan vi uppdatera användarens konto
        const supabase = createClientComponentClient();
        const now = new Date().toISOString();
        
        // Generera ett unikt transaktions-ID
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Hämta användarens export-information
        const { data: existingExports, error: fetchError } = await supabase
          .from("user_exports")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Fel vid hämtning av exports:", fetchError);
          // Fortsätt ändå, vi skapar en ny post om ingen finns
        }
        
        // Uppdatera användarens tillgängliga exporter
        if (existingExports) {
          const { error: updateError } = await supabase
            .from("user_exports")
            .update({
              available_exports: (existingExports.available_exports || 0) + 1,
              updated_at: now
            })
            .eq("user_id", user.id);
          
          if (updateError) {
            console.error("Fel vid uppdatering av exports:", updateError);
            toast({
              title: "Fel",
              description: "Köpet har genomförts men vi kunde inte uppdatera ditt konto. Kontakta support.",
              variant: "destructive"
            });
            return;
          }
        } else {
          // Skapa ny export-post
          const { error: createError } = await supabase
            .from("user_exports")
            .insert({
              user_id: user.id,
              available_exports: 1,
              created_at: now,
              updated_at: now
            });
          
          if (createError) {
            console.error("Fel vid skapande av exports:", createError);
            
            if (createError.code === "42P01") { // Relation does not exist
              toast({
                title: "Information",
                description: "Vänligen kontakta admin. Export-funktionen behöver konfigureras.",
                variant: "default"
              });
              return;
            }
            
            toast({
              title: "Fel",
              description: "Köpet har genomförts men vi kunde inte uppdatera ditt konto. Kontakta support.",
              variant: "destructive"
            });
            return;
          }
        }
        
        // Steg 3: Registrera köphistorik
        const { error: historyError } = await supabase
          .from("purchase_history")
          .insert({
            user_id: user.id,
            product_type: "one_time_export",
            amount: 19,
            currency: "SEK",
            payment_id: transactionId,
            payment_status: "completed",
            created_at: now
          });
        
        if (historyError && historyError.code !== "42P01") {
          console.error("Kunde inte registrera köphistorik:", historyError);
          // Fortsätt ändå, detta är bara för loggning
        }
        
        // Steg 4: Visa bekräftelse till användaren
        toast({
          title: "Köp genomfört!",
          description: "Du har nu 1 ny engångsexport tillgänglig",
          variant: "default"
        });
      }
      
    } catch (error: any) {
      console.error("Error processing one-time export purchase:", error);
      toast({
        title: "Fel",
        description: error.message || "Ett fel uppstod vid köp av engångsexport",
        variant: "destructive"
      });
    }
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
      <MetaTags 
        title="Priser och abonnemang - CVerktyg"
        description="Utforska våra prisvärda planer för CV-skapande. Från gratisversion till premium-paket, hitta det perfekta alternativet för att bygga ditt professionella CV."
        keywords="cv priser, cv-mall prenumeration, prisvärda cv-verktyg, professionellt cv-skapande, karriärtjänster, cv-paket"
        ogUrl="https://cverktyg.se/pricing"
      />
      <AppLayout>
        <div className="container max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
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
                  onSubscribe={() => handleSubscribe("free")}
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
                    onClick={handleOneTimeExportClick}
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
                    <Image 
                      src="/images/features/p1.png" 
                      alt="Engångsexport av CV utan vattenstämpel" 
                      width={400} 
                      height={500}
                      className="rounded-md object-contain"
                    />
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
        </div>
      </AppLayout>
      
      {/* Dialog för att bekräfta engångsköp */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bekräfta köp av engångsexport</DialogTitle>
            <DialogDescription>
              Du kommer att debiteras 19 kr för att exportera ditt CV utan vattenstämpel
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Engångsexport inkluderar:</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  <span>1 export av valfritt CV i PDF-format</span>
                </li>
                <li className="flex items-start text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  <span>Utan vattenstämpel och i hög kvalitet</span>
                </li>
                <li className="flex items-start text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  <span>Ingen prenumeration - betala endast en gång</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-medium">Totalt att betala:</span>
              <span className="font-bold">19 kr</span>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleOneTimeExport} 
              className="sm:w-24"
            >
              Betala nu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 