"use client"

import { Navbar } from "@/components/Navbar"
import { MetaTags } from "@/components/MetaTags"
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileText, Loader2, SparklesIcon, LockIcon, Wand2, FileEdit, FilePlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PageTransition } from "@/components/animations/PageTransition"
import { FadeIn } from "@/components/animations/FadeIn"
import { StaggerChildren } from "@/components/animations/StaggerChildren"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { AnimatedCard } from "@/components/animations/AnimatedCard"
import { CV_TEMPLATES } from "@/data/templates"
import { TemplateManager } from "@/components/templates/TemplateManager"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { createCV, getSupabaseClient, getUserCVs } from "@/lib/supabase-client"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

// Kategori-mapping för mallar
const templateCategories = {
  "standard": "business",
  "modern": "business", 
  "minimalist": "creative",
  "creative": "creative",
  "professional": "business",
  "executive": "business",
  "academic": "academic",
  "technical": "technical",
  "nordic": "creative",
}

export default function TemplatesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  
  return (
    <>
      <MetaTags 
        title="CV-mallar - Hitta den perfekta mallen för din karriär"
        description="Utforska vårt bibliotek av professionellt designade CV-mallar för alla branscher. Skapa ett imponerande CV som hjälper dig att sticka ut bland andra sökande."
        keywords="cv-mallar, cv-designer, professionella cv-mallar, moderna cv-mallar, kreativa cv-mallar, akademiska cv-mallar, tekniska cv-mallar"
        ogUrl="https://cverktyg.se/templates/all"
      />
      <Navbar />
      <PageTransition>
        <div className="container py-10">
          <FadeIn>
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <h1 className="text-4xl font-bold mb-1">CV-mallar</h1>
                <motion.div 
                  className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Välj bland våra professionellt designade CV-mallar för att skapa ditt perfekta CV.
                Varje mall är optimerad för ATS-system och rekryterare.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Tabs defaultValue="gallery" className="mb-8">
              <TabsList className="mx-auto flex w-fit">
                <TabsTrigger value="gallery" className="relative overflow-hidden group">
                  <span className="relative z-10">Mallgalleri</span>
                  <motion.div 
                    className="absolute inset-0 bg-primary/10 -z-0" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </TabsTrigger>
                <TabsTrigger value="manager" className="relative overflow-hidden group">
                  <span className="relative z-10">Mallhanterare</span>
                  <motion.div 
                    className="absolute inset-0 bg-primary/10 -z-0" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </TabsTrigger>
              </TabsList>
              
              {/* Mallgalleri */}
              <TabsContent value="gallery" className="mt-6">
                <motion.div 
                  className="p-4 mb-6 bg-primary/5 rounded-lg border border-primary/10 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Wand2 className="h-5 w-5 text-primary inline-block mr-2" />
                  <span className="text-sm">
                    Våra CV-mallar är nu uppdaterade med förbättrad kompatibilitet för PDF-export!
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {["all", "business", "creative", "academic", "technical"].map((category) => (
                    <Button 
                      key={category} 
                      variant={selectedFilter === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(category)}
                      className="capitalize"
                    >
                      {category === "all" ? "Alla" : 
                       category === "business" ? "Företag" : 
                       category === "creative" ? "Kreativa" : 
                       category === "academic" ? "Akademiska" : "Tekniska"}
                    </Button>
                  ))}
                </motion.div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {CV_TEMPLATES
                    .filter(template => 
                      selectedFilter === "all" || 
                      templateCategories[template.id as keyof typeof templateCategories] === selectedFilter
                    )
                    .map((template, index) => (
                      <TemplateCard key={template.id} template={template} index={index} />
                    ))}
                </div>
              </TabsContent>
              
              {/* Mallhanterare */}
              <TabsContent value="manager" className="mt-6">
                <TemplateManager />
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </PageTransition>
    </>
  )
}

function TemplateCard({ template, index }: { template: (typeof CV_TEMPLATES)[0], index: number }) {
  const [imageError, setImageError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [existingCVs, setExistingCVs] = useState<any[]>([])
  const [selectedCV, setSelectedCV] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"new" | "existing">("new")
  
  const router = useRouter()
  const { isPremiumPlan } = useSubscription()
  const hasPremiumAccess = isPremiumPlan()
  const isPremiumTemplate = template.isPremium === true
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  
  // Hämta befintliga CVs när dialogen öppnas
  useEffect(() => {
    const fetchCVs = async () => {
      if (isDialogOpen) {
        setIsLoading(true)
        try {
          const supabase = getSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const { data, error } = await getUserCVs(session.user.id)
            
            if (error) {
              console.error("Fel vid hämtning av CVs:", error)
              toast.error("Kunde inte hämta dina befintliga CV:n")
            } else if (data) {
              setExistingCVs(data)
              // Om användaren har minst ett CV, använd det första som standard
              if (data.length > 0) {
                setSelectedCV(data[0].id)
              }
            }
          }
        } catch (error) {
          console.error("Fel vid hämtning av CVs:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchCVs()
  }, [isDialogOpen])

  // Funktion för att skapa ett nytt CV med den valda mallen
  const handleCreateCV = async () => {
    try {
      // Kontrollera om användaren försöker använda en premium-mall utan åtkomst
      if (isPremiumTemplate && !hasPremiumAccess) {
        toast.error("Denna mall kräver en premium-prenumeration")
        return
      }
      
      setCreating(true)
      
      // Kontrollera användarens autentiseringsstatus
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Du måste vara inloggad för att skapa ett CV")
        router.push("/auth/signin?redirect=" + encodeURIComponent(`/templates/all`))
        setCreating(false)
        return
      }
      
      // Skapa tomt CV med bara grundstruktur och mall-inställningar
      const { data, error } = await createCV(session.user.id, {
        title: "Nytt CV",
        template_id: template.id,
        content: {
          templateId: template.id, // Spara mallens ID
          colorScheme: template.colorScheme, // Använd mallens färgschema
          
          // Skapa tom personalInfo
          personalInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            postalCode: "",
            title: "",
            website: "",
            summary: ""
          },
          
          // Skapa tomma grundsektioner baserat på mall-typ
          sections: [
            {
              id: uuidv4(),
              type: "experience",
              title: "Arbetslivserfarenhet",
              items: []
            },
            {
              id: uuidv4(),
              type: "education",
              title: "Utbildning",
              items: []
            },
            {
              id: uuidv4(),
              type: "skills",
              title: "Kompetenser",
              items: []
            }
          ]
        }
      })
      
      if (error) {
        console.error("Fel vid skapande av CV:", error)
        toast.error("Kunde inte skapa nytt CV")
        setCreating(false)
        return
      }
      
      // Navigera direkt till editor med det nya CV-id:t
      const newCvId = data[0].id
      router.push(`/editor/${newCvId}`)
      
    } catch (error) {
      console.error("Fel vid skapande av CV:", error)
      toast.error("Kunde inte skapa nytt CV")
      setCreating(false)
    }
  }
  
  // Hantera när användaren trycker på "Använd mall"-knappen
  const handleUseTemplate = () => {
    // Kontrollera om användaren försöker använda en premium-mall utan åtkomst
    if (isPremiumTemplate && !hasPremiumAccess) {
      toast.error("Denna mall kräver en premium-prenumeration")
      return
    }
    
    // Öppna dialog för val
    setIsDialogOpen(true)
  }
  
  // Hantera användning av mall på befintligt CV
  const handleApplyToExistingCV = async () => {
    if (!selectedCV) {
      toast.error("Du måste välja ett CV")
      return
    }
    
    setCreating(true)
    try {
      // Här skulle implementering för att uppdatera befintligt CV med ny mall läggas till
      // För nu, navigera bara till redigeringssidan
      toast.success(`Mallen ${template.name} applicerad på befintligt CV`)
      router.push(`/editor/${selectedCV}?template=${template.id}`)
    } catch (error) {
      console.error("Fel vid applicering av mall:", error)
      toast.error("Kunde inte applicera mall på befintligt CV")
    } finally {
      setCreating(false)
      setIsDialogOpen(false)
    }
  }
  
  // Hantera bekräftelse från dialog
  const handleConfirm = async () => {
    if (selectedOption === "new") {
      setIsDialogOpen(false)
      handleCreateCV()
    } else {
      handleApplyToExistingCV()
    }
  }

  // Generera en professionell förhandsgranskning baserad på malltyp
  const generatePreviewBackground = () => {
    const baseClass = "w-full h-full absolute inset-0 flex flex-col p-4 bg-background border rounded-md overflow-hidden"
    
    switch (template.id.toLowerCase()) {
      case "modern":
        return (
          <div className={baseClass}>
            {/* Lyxig modern layout med gradient och tydlig sidopanel */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-b from-blue-600 to-blue-800"></div>
            <div className="absolute top-8 left-4 h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100"></div>
            </div>
            <div className="ml-[38%] pt-8">
              <div className="w-3/4 h-5 bg-gray-800 mb-2 rounded-sm"></div>
              <div className="w-1/2 h-3 bg-blue-500 mb-6 rounded-sm"></div>
              
              <div className="w-full h-px bg-gray-200 my-4"></div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-32 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-40 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-36 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-44 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "minimalist":
        return (
          <div className={baseClass}>
            {/* Elegant minimalistisk layout med exklusiv typografi */}
            <div className="h-full w-full flex flex-col items-center pt-12 bg-[#fcfcfc]">
              <div className="w-40 h-[0.5px] bg-black/70 mb-2"></div>
              <div className="text-center">
                <div className="h-5 w-48 bg-black mx-auto mb-2 rounded-sm"></div>
                <div className="h-3 w-32 bg-gray-400 mx-auto mb-6 rounded-sm"></div>
              </div>
              <div className="w-24 h-[0.5px] bg-black/30 mb-8"></div>
              
              <div className="w-4/5 max-w-xs space-y-5">
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                </div>
                
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )
      case "creative":
        return (
          <div className={baseClass}>
            {/* Innovativ kreativ layout med diagonal design och starka färger */}
            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute -top-20 -left-20 h-64 w-96 rounded-[40%] rotate-12 bg-gradient-to-br from-purple-600 to-pink-500 opacity-25"></div>
              
              <div className="relative p-6 pt-8">
                <div className="mb-4">
                  <div className="h-6 w-48 bg-purple-800 rounded-sm mb-1"></div>
                  <div className="h-3 w-36 bg-pink-500 rounded-sm"></div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 mt-8">
                  <div className="w-full md:w-3/5 space-y-5">
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-32 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[180px] bg-gray-600 rounded-sm"></div>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-28 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[150px] bg-gray-600 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "professional":
        return (
          <div className={baseClass}>
            {/* Premiumlayout för företagsledare med sofistikerad design */}
            <div className="h-full w-full">
              <div className="h-24 bg-gradient-to-r from-blue-950 to-blue-900 p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-40 bg-white rounded-sm mb-1"></div>
                    <div className="h-3 w-28 bg-blue-300 rounded-sm"></div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/90 border-2 border-white shadow-lg"></div>
                </div>
              </div>
              
              <div className="p-4 mt-8">
                <div className="mb-5">
                  <div className="h-3.5 w-28 bg-gray-800 font-bold mb-2 rounded-sm"></div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <div className="h-3 w-28 bg-gray-700 rounded-sm"></div>
                      <div className="h-2 w-24 bg-gray-500 rounded-sm"></div>
                    </div>
                    <div className="h-2 w-40 bg-blue-600 rounded-sm mb-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "standard":
      default:
        return (
          <div className={baseClass}>
            {/* Klassisk standardlayout med tydlig struktur */}
            <div className="h-full w-full">
              <div className="h-28 bg-gray-100 p-6 border-b">
                <div className="h-6 w-48 bg-gray-800 mb-2 rounded-sm"></div>
                <div className="h-3 w-36 bg-gray-500 mb-1 rounded-sm"></div>
                <div className="h-3 w-48 bg-gray-400 rounded-sm"></div>
              </div>
              
              <div className="p-6">
                <div className="h-4 w-32 bg-gray-700 mb-3 rounded-sm"></div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-48 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-40 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                    <div className="h-3 w-44 bg-gray-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }
  
  const previewBackground = generatePreviewBackground();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <AnimatedCard className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
        <CardHeader className="relative p-0 overflow-hidden aspect-[1/1.3] bg-muted">
          {previewBackground ? (
            previewBackground
          ) : (
            <div className="relative w-full h-full">
              {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {template.name} CV-mall
                  </p>
                </div>
              ) : (
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              )}

              {isPremiumTemplate && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium py-1 px-2 rounded-md flex items-center">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Premium
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/templates/${template.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Förhandsgranska
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{template.name}</h3>
            {template.category && (
              <Badge variant="outline" className="capitalize">
                {template.category === "business" ? "Företag" : 
                 template.category === "creative" ? "Kreativ" : 
                 template.category === "academic" ? "Akademisk" : "Teknisk"}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {template.description}
          </p>
          
          <div className="mt-auto flex gap-2">
            <AnimatedButton
              variant="default"
              className="w-full"
              disabled={creating}
              onClick={handleUseTemplate}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Skapar...
                </>
              ) : isPremiumTemplate && !hasPremiumAccess ? (
                <>
                  <LockIcon className="h-4 w-4 mr-1" />
                  Premium
                </>
              ) : (
                "Använd mall"
              )}
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="icon"
              asChild
            >
              <Link href={`/templates/${template.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>
      
      {/* Accent elements for visual interest */}
      <motion.div 
        className="absolute -z-10 w-24 h-24 rounded-full bg-primary/10 blur-xl"
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={inView ? { opacity: 0.5, x: -30, y: 30 } : { opacity: 0, x: -20, y: 20 }}
        transition={{ duration: 1, delay: index * 0.15 }}
      />
      
      {/* Dialog för val av nytt eller befintligt CV */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Använd {template.name}-mallen</DialogTitle>
            <DialogDescription>
              Välj om du vill skapa ett nytt CV med denna mall eller använda den i ett befintligt CV.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={selectedOption === "new" ? "default" : "outline"} 
                className="flex flex-col h-auto py-4 gap-2 items-center justify-center"
                onClick={() => setSelectedOption("new")}
              >
                <FilePlus className="h-8 w-8" />
                <span>Skapa nytt CV</span>
              </Button>
              
              <Button 
                variant={selectedOption === "existing" ? "default" : "outline"} 
                className="flex flex-col h-auto py-4 gap-2 items-center justify-center"
                onClick={() => setSelectedOption("existing")}
              >
                <FileEdit className="h-8 w-8" />
                <span>Använd i befintligt CV</span>
              </Button>
            </div>
            
            {selectedOption === "existing" && (
              <div className="pt-2">
                <Select value={selectedCV} onValueChange={setSelectedCV}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj ett CV" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Laddar...
                      </div>
                    ) : existingCVs.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Inga CV:n hittades
                      </div>
                    ) : (
                      <SelectGroup>
                        <SelectLabel>Dina CV:n</SelectLabel>
                        {existingCVs.map((cv) => (
                          <SelectItem key={cv.id} value={cv.id}>
                            {cv.title || "Namnlöst CV"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
                
                {selectedOption === "existing" && existingCVs.length === 0 && !isLoading && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Du har inga befintliga CV:n. Välj "Skapa nytt CV" istället.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedOption === "existing" && (!selectedCV || existingCVs.length === 0)}
            >
              Fortsätt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

