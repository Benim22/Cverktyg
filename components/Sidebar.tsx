"use client"

import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  User,
  Wrench,
  Loader2,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const { currentCV, saveCV, addSection } = useCV()
  const pathname = usePathname()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = !useMediaQuery("(min-width: 1024px)")
  
  // State för "Lägg till sektion" dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSectionType, setNewSectionType] = useState<string>("education")
  const [newSectionTitle, setNewSectionTitle] = useState<string>("")

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveCV()
      toast.success("Ditt CV har sparats framgångsrikt!")
    } catch (error) {
      console.error("Fel vid sparande:", error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleExportPDF = () => {
    router.push(`/preview/${currentCV?.id}`)
    if (isMobile && onClose) {
      onClose()
    }
  }
  
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      toast.error("Du måste ange en titel för sektionen")
      return
    }

    addSection(newSectionType as any, newSectionTitle)
    
    // Återställ formvärden
    setNewSectionTitle("")
    setNewSectionType("education")
    setIsDialogOpen(false)
  }

  const sections = currentCV?.sections || []

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex h-full flex-col border-r bg-background", className)}
    >
      <div className="flex h-14 items-center border-b px-4 justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5 text-primary" />
          <span>CV Editor</span>
        </Link>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Stäng</span>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Redigera</h2>
          <div className="space-y-1">
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button
                variant={pathname.includes("/editor") && !pathname.includes("/preview") ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
                onClick={isMobile && onClose ? onClose : undefined}
              >
                <Link href={`/editor/${currentCV?.id}`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Editor
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button
                variant={pathname.includes("/preview") ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
                onClick={isMobile && onClose ? onClose : undefined}
              >
                <Link href={`/preview/${currentCV?.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Förhandsgranska
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  handleSave();
                  if (isMobile && onClose) onClose();
                }}
                disabled={isSaving}
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
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button variant="ghost" className="w-full justify-start" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exportera PDF
              </Button>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                asChild
                onClick={isMobile && onClose ? onClose : undefined}
              >
                <Link href="/editor/settings/cv">
                  <Settings className="mr-2 h-4 w-4" />
                  Inställningar
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        <Separator className="my-2" />
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Sektioner</h2>
          <div className="space-y-1">
            <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={isMobile && onClose ? onClose : undefined}
              >
                <User className="mr-2 h-4 w-4" />
                Personuppgifter
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </motion.div>

            {sections.map((section) => (
              <motion.div key={section.id} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={isMobile && onClose ? onClose : undefined}
                >
                  {section.type === "education" && <GraduationCap className="mr-2 h-4 w-4" />}
                  {section.type === "experience" && <Briefcase className="mr-2 h-4 w-4" />}
                  {section.type === "projects" && <BookOpen className="mr-2 h-4 w-4" />}
                  {section.type === "skills" && <Wrench className="mr-2 h-4 w-4" />}
                  {section.title}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </motion.div>
            ))}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} className="mt-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till sektion
                  </Button>
                </motion.div>
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
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <AnimatedButton 
          className="w-full" 
          asChild
          onClick={isMobile && onClose ? onClose : undefined}
        >
          <Link href="/dashboard">Tillbaka till Dashboard</Link>
        </AnimatedButton>
      </div>
    </motion.div>
  )
}

