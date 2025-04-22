"use client"

import { useCV } from "@/contexts/CVContext"
import { PersonalInfoForm } from "@/components/PersonalInfoForm"
import { SectionsList } from "@/components/SectionsList"
import { useState } from "react"
import { Plus, Save, Loader2, Palette, User, Layers, Settings, ArrowLeft } from "lucide-react"
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
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/FadeIn"
import { TemplateGallery } from "@/components/templates/TemplateGallery"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { sv } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ResponsiveNavTabs } from "@/components/ResponsiveNavTabs"

// Denna komponent används för mobila enheter för att ge en optimerad upplevelse
export function CVEditorMobile() {
  const { currentCV, addSection, saveCV, loading, lastSaveTime, isAutoSaving } = useCV()
  const [activeTab, setActiveTab] = useState("personal")
  const [newSectionType, setNewSectionType] = useState<string>("education")
  const [newSectionTitle, setNewSectionTitle] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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
        title: "Sparat",
        description: "Ditt CV har sparats",
      })
    } catch (error) {
      console.error("Fel vid sparande:", error)
      toast({
        title: "Fel vid sparande",
        description: "Ett fel uppstod när ditt CV skulle sparas",
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

  return (
    <div className="flex flex-col gap-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold truncate">{currentCV?.title || "Nytt CV"}</h1>
              <span className="text-[10px] text-muted-foreground -mt-1">
                {isAutoSaving ? 
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-2 w-2 animate-spin" />
                    Sparar...
                  </span> : 
                  formatLastSaveTime()
                }
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSave}
            size="sm"
            disabled={isSaving || isAutoSaving}
            className="h-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                <span className="sr-only">Sparar...</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                <span className="sr-only">Spara</span>
              </>
            )}
          </Button>
        </div>
        
        <Card className="border border-muted shadow-sm mb-2">
          <CardHeader className="p-3 pb-2">
            <h2 className="text-sm font-semibold">Snabbknappar</h2>  
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="whitespace-nowrap flex-shrink-0">
                    <Plus className="mr-1 h-3 w-3" />
                    Lägg till sektion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
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
              
              <Button size="sm" variant="outline" className="whitespace-nowrap flex-shrink-0" onClick={handleGeneratePDF}>
                Generera PDF
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="whitespace-nowrap flex-shrink-0"
                onClick={() => setActiveTab("templates")}
              >
                <Palette className="mr-1 h-3 w-3" />
                Byt mall
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <FadeIn delay={0.1}>
        <ResponsiveNavTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          tabs={[
            {
              value: "personal",
              icon: <User className="h-4 w-4" />,
              label: "Personuppgifter",
              content: <PersonalInfoForm />
            },
            {
              value: "sections",
              icon: <Layers className="h-4 w-4" />,
              label: "Sektioner",
              content: (
                <>
                  <div className="mb-4 flex justify-between">
                    <h2 className="text-xl font-semibold">Sektioner</h2>
                  </div>
                  <SectionsList />
                </>
              )
            },
            {
              value: "templates",
              icon: <Palette className="h-4 w-4" />,
              label: "Mallar",
              content: (
                <>
                  <h2 className="text-xl font-semibold mb-4">Välj mall</h2>
                  <TemplateGallery />
                </>
              )
            }
          ]}
          iconOnly={true}
        />
      </FadeIn>
      
      {/* Fast actions buttons som är fixade längst ner på skärmen */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t p-2 backdrop-blur z-10 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="flex-1 mr-2">
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
        <Button size="sm" onClick={handleGeneratePDF} className="flex-1">
          Förhandsgranska PDF
        </Button>
      </div>
    </div>
  )
} 