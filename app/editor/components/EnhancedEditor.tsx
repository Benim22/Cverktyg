"use client"

import { useCV } from "@/contexts/CVContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalInfoForm } from "@/components/PersonalInfoForm"
import { SectionsList } from "@/components/SectionsList"
import { useState, useEffect, useRef } from "react"
import { Plus, Save, Loader2, Palette, User, Layers, Settings, SplitSquareVertical, Layout } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { sv } from "date-fns/locale"
import Link from "next/link"
import { TemplateGallery } from "@/components/templates/TemplateGallery"
import { ResizableEditorLayout } from "./ResizableEditorLayout"
import { CustomTabsContent } from "./CustomTabs"

export function EnhancedEditor() {
  const { currentCV, addSection, saveCV, loading, lastSaveTime, isAutoSaving } = useCV()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("personal")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSectionType, setNewSectionType] = useState<string>("education")
  const [newSectionTitle, setNewSectionTitle] = useState<string>("")
  const [showSplitView, setShowSplitView] = useState<boolean>(true)
  const [cvTitle, setCvTitle] = useState<string>("")
  
  // Referens till original CV-titeln för att se om den har ändrats
  const originalTitleRef = useRef<string>("");
  
  // Synkronisera cvTitle med currentCV.title när currentCV uppdateras
  useEffect(() => {
    if (currentCV?.title) {
      setCvTitle(currentCV.title);
      originalTitleRef.current = currentCV.title;
    }
  }, [currentCV?.title]);

  // Denna hook används för att uppdatera CV-titeln i URL:en och document.title
  useEffect(() => {
    if (cvTitle && cvTitle !== originalTitleRef.current) {
      // Om titeln har ändrats, uppdatera document.title
      document.title = `${cvTitle} | CV Editor`;
    }
  }, [cvTitle]);

  // Animationsvarianter
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const handleAddSection = () => {
    if (!newSectionTitle) {
      toast({
        title: "Fel",
        description: "Du måste ange en titel för sektionen",
        variant: "destructive",
      })
      return
    }

    addSection(newSectionType as any, newSectionTitle)

    setNewSectionTitle("")
    setIsDialogOpen(false)
    setActiveTab("sections")

    toast({
      title: "Sektion tillagd",
      description: `Sektionen "${newSectionTitle}" har lagts till`,
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveCV()
      toast({
        title: "CV sparat",
        description: "Ditt CV har sparats framgångsrikt",
      })
    } catch (error) {
      console.error("Fel vid sparande:", error)
      toast({
        title: "Fel vid sparande",
        description: "Det gick inte att spara CV:t. Försök igen senare.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeneratePDF = () => {
    toast({
      title: "Förhandsgranskning laddas",
      description: "Du kommer att dirigeras till PDF-exportfunktionen",
    })
    router.push(`/preview/${currentCV?.id}`)
  }

  // Formatera senaste sparningstiden för visning
  const formatLastSaveTime = () => {
    if (!lastSaveTime) return "Aldrig sparat"
    
    return `Sparades ${formatDistanceToNow(lastSaveTime, { 
      addSuffix: true, 
      locale: sv 
    })}`
  }

  // Funktion för att uppdatera titeln i heading och spara
  const handleUpdateTitle = async () => {
    try {
      if (currentCV && cvTitle !== originalTitleRef.current) {
        // Uppdatera titeln i dokumentet och URL:en
        document.title = `${cvTitle} | CV Editor`;
        
        // Spara den nya titeln
        // Vi har inte möjlighet att direkt uppdatera currentCV.title, så vi sparar bara
        await saveCV();
        
        // Uppdatera originalTitleRef för att undvika att triggra fler sparningar i onödan
        originalTitleRef.current = cvTitle;
        
        toast({
          title: "Titel uppdaterad",
          description: "CV-titeln har uppdaterats",
        });
      }
    } catch (error) {
      console.error("Fel vid uppdatering av titel:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera titeln",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Laddar CV-data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Skapa tabs-innehåll som vi passerar till layouten
  const tabsContent = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal" className="rounded-full">
          <User className="mr-2 h-4 w-4" />
          Personuppgifter
        </TabsTrigger>
        <TabsTrigger value="sections" className="rounded-full">
          <Layers className="mr-2 h-4 w-4" />
          Sektioner
        </TabsTrigger>
        <TabsTrigger value="templates" className="rounded-full">
          <Palette className="mr-2 h-4 w-4" />
          Mallar
        </TabsTrigger>
        <TabsTrigger value="settings" className="rounded-full">
          <Settings className="mr-2 h-4 w-4" />
          Inställningar
        </TabsTrigger>
      </TabsList>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <CustomTabsContent value="personal" className="mt-4">
            <PersonalInfoForm />
          </CustomTabsContent>
          <CustomTabsContent value="sections" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sektioner</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till sektion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lägg till ny sektion</DialogTitle>
                    <DialogDescription>Välj typ av sektion och ange en titel.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="section-type">Typ av sektion</Label>
                      <Select value={newSectionType} onValueChange={setNewSectionType}>
                        <SelectTrigger id="section-type">
                          <SelectValue placeholder="Välj typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Utbildning</SelectItem>
                          <SelectItem value="experience">Erfarenhet</SelectItem>
                          <SelectItem value="projects">Projekt</SelectItem>
                          <SelectItem value="skills">Färdigheter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="section-title">Titel</Label>
                      <Input
                        id="section-title"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="T.ex. Utbildning, Arbetslivserfarenhet"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSection}>Lägg till</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <SectionsList />
          </CustomTabsContent>
          <CustomTabsContent value="templates" className="mt-4">
            <TemplateGallery />
          </CustomTabsContent>
          <CustomTabsContent value="settings" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Inställningar</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">CV-titel</h3>
                  <div className="flex gap-2">
                    <Input 
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      placeholder="Ange en titel för ditt CV"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUpdateTitle}
                      disabled={cvTitle === originalTitleRef.current}
                    >
                      Uppdatera
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Förhandsgranskning</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSplitView(!showSplitView)}
                      className="flex items-center gap-2"
                    >
                      <SplitSquareVertical className="h-4 w-4" />
                      {showSplitView ? "Dölj förhandsgranskning" : "Visa förhandsgranskning"}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Mallgalleri</h3>
                  <Link href="/templates/new" passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      Utforska nya mallar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CustomTabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  )

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm border"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{cvTitle || "Nytt CV"}</h1>
          <span className="text-xs text-muted-foreground">
            {isAutoSaving ? 
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sparar automatiskt...
              </span> : 
              formatLastSaveTime()
            }
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isSaving || isAutoSaving}
            className="rounded-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Spara
              </>
            )}
          </Button>
          <Button onClick={handleGeneratePDF} className="rounded-full">
            Förhandsgranska
          </Button>
        </div>
      </motion.div>

      {/* Använd vår separerade layout */}
      <ResizableEditorLayout showSplitView={showSplitView}>
        {tabsContent}
      </ResizableEditorLayout>
    </div>
  )
} 