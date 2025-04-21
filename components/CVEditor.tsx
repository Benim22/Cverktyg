"use client"

import { useCV } from "@/contexts/CVContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalInfoForm } from "@/components/PersonalInfoForm"
import { SectionsList } from "@/components/SectionsList"
import { CVPreview } from "@/components/CVPreview"
import { useState, useEffect } from "react"
import { Plus, Save, Loader2, Palette, User, Layers, Settings, SplitSquareVertical } from "lucide-react"
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
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { FadeIn } from "@/components/animations/FadeIn"
import { TemplateGallery } from "@/components/templates/TemplateGallery"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { CVEditorMobile } from "@/components/CVEditorMobile"
import { formatDistanceToNow } from "date-fns"
import { sv } from "date-fns/locale"
import { Button } from "@/components/ui/button"

export function CVEditor() {
  const { currentCV, addSection, saveCV, loading, lastSaveTime, isAutoSaving } = useCV()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<string>("personal")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSectionType, setNewSectionType] = useState<string>("education")
  const [newSectionTitle, setNewSectionTitle] = useState<string>("")
  const [showSplitView, setShowSplitView] = useState<boolean>(false)

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
    } catch (error) {
      console.error("Fel vid sparande:", error)
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
  
  // Visa mobilversionen på mindre skärmar
  if (isMobile) {
    return <CVEditorMobile />
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{currentCV?.title || "Nytt CV"}</h1>
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
          <AnimatedButton 
            variant="outline" 
            onClick={handleSave}
            disabled={isSaving || isAutoSaving}
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
          </AnimatedButton>
          <AnimatedButton onClick={handleGeneratePDF}>Generera PDF</AnimatedButton>
        </div>
      </motion.div>

      <FadeIn delay={0.1}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="mr-2 h-4 w-4" />
              Personuppgifter
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Layers className="mr-2 h-4 w-4" />
              Sektioner
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Palette className="mr-2 h-4 w-4" />
              Mallar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="mt-4">
            <PersonalInfoForm />
          </TabsContent>
          <TabsContent value="sections" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sektioner</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSplitView(!showSplitView)}
                  className="flex items-center gap-2"
                >
                  <SplitSquareVertical className="h-4 w-4" />
                  {showSplitView ? "Dölj förhandsgranskning" : "Visa förhandsgranskning"}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <AnimatedButton>
                      <Plus className="mr-2 h-4 w-4" />
                      Lägg till sektion
                    </AnimatedButton>
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
                      <AnimatedButton onClick={handleAddSection}>Lägg till</AnimatedButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {showSplitView ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <SectionsList />
                </div>
                <div className="border rounded-md p-4 shadow-sm">
                  <h3 className="text-sm text-muted-foreground mb-2">Förhandsvisning</h3>
                  <div className="transform scale-[0.55] origin-top-left -ml-[130px] -mt-[130px]">
                    <CVPreview />
                  </div>
                </div>
              </div>
            ) : (
              <SectionsList />
            )}
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Välj mall</h2>
            <TemplateGallery />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}

