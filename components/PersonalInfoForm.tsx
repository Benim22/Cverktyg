"use client"

import { useCV } from "@/contexts/CVContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { FadeIn } from "@/components/animations/FadeIn"
import { useEffect, useState } from "react"
import { ProfileImageUploader } from "@/components/ProfileImageUploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { improveSummary } from "@/lib/gemini-client"

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Förnamn krävs"),
  lastName: z.string().min(1, "Efternamn krävs"),
  title: z.string().min(1, "Yrkestitel krävs"),
  email: z.string().email("Ogiltig e-postadress"),
  phone: z.string().min(1, "Telefonnummer krävs"),
  location: z.string().min(1, "Plats krävs"),
  website: z.string().url("Ogiltig webbadress").optional().or(z.literal("")),
  summary: z.string().min(10, "Sammanfattningen måste vara minst 10 tecken"),
})

export function PersonalInfoForm() {
  const { currentCV, setPersonalInfo } = useCV()
  const { toast } = useToast()
  const [isImprovingSummary, setIsImprovingSummary] = useState(false)

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: currentCV?.personalInfo || {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
    },
  })

  // Denna effect uppdaterar förhandsgranskningen i realtid
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      // Vi behöver behålla profilbildsinformation
      const currentProfileImage = currentCV?.personalInfo?.profileImage;
      
      // Updatera context med nuvarande värden och behåll profilbilden
      setPersonalInfo({
        ...(formValues as z.infer<typeof personalInfoSchema>),
        profileImage: currentProfileImage
      })
    })
    
    // Städa upp subscription
    return () => subscription.unsubscribe()
  }, [form, setPersonalInfo, currentCV])

  function onSubmit(values: z.infer<typeof personalInfoSchema>) {
    // Vi behöver behålla profilbildsinformation när formuläret skickas
    const currentProfileImage = currentCV?.personalInfo?.profileImage;
    
    setPersonalInfo({
      ...values,
      profileImage: currentProfileImage
    })
    
    toast({
      title: "Kontaktuppgifter sparade",
      description: "Dina kontaktuppgifter har sparats",
    })
  }

  async function handleImproveSummary() {
    try {
      setIsImprovingSummary(true)
      const currentValues = form.getValues();
      
      if (!currentValues.summary || currentValues.summary.length < 10) {
        toast({
          title: "Kan inte förbättra",
          description: "Du behöver först skriva en sammanfattning med minst 10 tecken",
          variant: "destructive"
        })
        return;
      }
      
      // Skicka till AI-funktionen för förbättring
      const improvedSummary = await improveSummary(
        `${currentValues.firstName} ${currentValues.lastName}`,
        currentValues.title,
        currentValues.summary
      );
      
      // Uppdatera formuläret med förbättrad text
      form.setValue('summary', improvedSummary);
      
      // Uppdatera CV-kontexten
      const currentProfileImage = currentCV?.personalInfo?.profileImage;
      setPersonalInfo({
        ...currentValues,
        summary: improvedSummary,
        profileImage: currentProfileImage
      });
      
      toast({
        title: "Sammanfattning förbättrad",
        description: "Din sammanfattning har förbättrats med AI",
      })
    } catch (error) {
      console.error("Fel vid förbättring av sammanfattning:", error);
      toast({
        title: "Kunde inte förbättra sammanfattning",
        description: "Ett fel uppstod vid försök att förbättra texten",
        variant: "destructive"
      })
    } finally {
      setIsImprovingSummary(false);
    }
  }

  return (
    <Tabs defaultValue="contact" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="contact">Kontaktuppgifter</TabsTrigger>
        <TabsTrigger value="logo">Ladda upp logo</TabsTrigger>
      </TabsList>
      
      <TabsContent value="contact">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FadeIn delay={0.1}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Förnamn</FormLabel>
                        <FormControl>
                          <Input placeholder="Förnamn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Efternamn</FormLabel>
                        <FormControl>
                          <Input placeholder="Efternamn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FadeIn>
  
              <FadeIn delay={0.2}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yrkestitel</FormLabel>
                      <FormControl>
                        <Input placeholder="T.ex. Webbutvecklare, Projektledare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
  
              <FadeIn delay={0.3}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
                        <FormControl>
                          <Input placeholder="namn@exempel.se" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+46 70 123 45 67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FadeIn>
  
              <FadeIn delay={0.4}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plats</FormLabel>
                        <FormControl>
                          <Input placeholder="Stockholm, Sverige" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webbplats</FormLabel>
                        <FormControl>
                          <Input placeholder="https://minhemsida.se" {...field} />
                        </FormControl>
                        <FormDescription>Valfritt</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FadeIn>
  
              <FadeIn delay={0.5}>
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Sammanfattning</FormLabel>
                        <Button 
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleImproveSummary}
                          disabled={isImprovingSummary}
                          className="mb-2 gap-1"
                        >
                          {isImprovingSummary ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Förbättrar...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              Förbättra med AI
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Skriv en kort sammanfattning om dig själv och dina karriärmål"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tips: Inkludera din bakgrund, expertisområden, och vad du kan bidra med. Håll det koncist och relevant.
                        Exempel: "Erfaren webbutvecklare med 5 års erfarenhet av att skapa användarvänliga applikationer med React och Node.js. Specialiserad på e-handelslösningar med fokus på prestanda och användarvänlighet."
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
  
              <FadeIn delay={0.6}>
                <AnimatedButton type="submit">Spara kontaktuppgifter</AnimatedButton>
              </FadeIn>
            </form>
          </Form>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="logo">
        <ProfileImageUploader />
      </TabsContent>
    </Tabs>
  )
}

