"use client"

import { useCV } from "@/contexts/CVContext"
import type { CVSection } from "@/types/cv"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EducationForm } from "@/components/forms/EducationForm"
import { ExperienceForm } from "@/components/forms/ExperienceForm"
import { ProjectForm } from "@/components/forms/ProjectForm"
import { SkillsForm } from "@/components/forms/SkillsForm"
import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SectionFormProps {
  section: CVSection
  onClose: () => void
}

export function SectionForm({ section, onClose }: SectionFormProps) {
  const { updateSection } = useCV()
  const [title, setTitle] = useState(section.title)
  const { toast } = useToast()
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce-funktion för att uppdatera sektionen
  const debouncedUpdateSection = useCallback((newTitle: string) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (newTitle.trim()) {
        updateSection(section.id, { title: newTitle });
      }
      updateTimeoutRef.current = null;
    }, 300); // 300ms debounce
  }, [section.id, updateSection]);
  
  // Uppdatera sektionstiteln i realtid med debounce
  useEffect(() => {
    debouncedUpdateSection(title);
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [title, debouncedUpdateSection]);

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Fel",
        description: "Sektionstiteln kan inte vara tom",
        variant: "destructive",
      })
      return
    }

    updateSection(section.id, { title })
    toast({
      title: "Sektion uppdaterad",
      description: "Sektionen har uppdaterats framgångsrikt",
    })
    onClose()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          Redigera sektion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="section-title">Sektionens titel</Label>
          <Input id="section-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Poster</TabsTrigger>
            <TabsTrigger value="add">Lägg till ny post</TabsTrigger>
          </TabsList>
          <TabsContent value="items" className="mt-4 space-y-4">
            {section.type === "education" && <EducationForm sectionId={section.id} items={section.items} />}
            {section.type === "experience" && <ExperienceForm sectionId={section.id} items={section.items} />}
            {section.type === "projects" && <ProjectForm sectionId={section.id} items={section.items} />}
            {section.type === "skills" && <SkillsForm sectionId={section.id} items={section.items} />}
          </TabsContent>
          <TabsContent value="add" className="mt-4">
            {section.type === "education" && <EducationForm sectionId={section.id} isAdding />}
            {section.type === "experience" && <ExperienceForm sectionId={section.id} isAdding />}
            {section.type === "projects" && <ProjectForm sectionId={section.id} isAdding />}
            {section.type === "skills" && <SkillsForm sectionId={section.id} isAdding />}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Avbryt
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Spara ändringar
        </Button>
      </CardFooter>
    </Card>
  )
}

