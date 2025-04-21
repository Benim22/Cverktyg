"use client"

import { useCV } from "@/contexts/CVContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionForm } from "@/components/SectionForm"
import { Edit, Trash2, MoveUp, MoveDown } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { FadeIn } from "@/components/animations/FadeIn"
import { Button } from "@/components/ui/button"

export function SectionsList() {
  const { currentCV, reorderSections, removeSection } = useCV()
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [movingSection, setMovingSection] = useState<string | null>(null)

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      setMovingSection(currentCV.sections[index].id);
      reorderSections(index, index - 1);
      
      // Återställ movingSection efter animation
      setTimeout(() => {
        setMovingSection(null);
      }, 500);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < currentCV.sections.length - 1) {
      setMovingSection(currentCV.sections[index].id);
      reorderSections(index, index + 1);
      
      // Återställ movingSection efter animation
      setTimeout(() => {
        setMovingSection(null);
      }, 500);
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "education":
        return "🎓"
      case "experience":
        return "💼"
      case "projects":
        return "🚀"
      case "skills":
        return "🛠️"
      default:
        return "📄"
    }
  }

  if (!currentCV?.sections.length) {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            Inga sektioner tillagda ännu. Klicka på "Lägg till sektion" för att komma igång.
          </p>
        </div>
      </FadeIn>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {currentCV.sections.map((section, index) => {
          const isMoving = movingSection === section.id;
          
          return (
            <div 
              key={section.id}
              className={`mb-4 transition-all duration-300 ${isMoving ? 'scale-[1.02] shadow-lg' : ''}`}
            >
              {editingSectionId === section.id ? (
                <SectionForm section={section} onClose={() => setEditingSectionId(null)} />
              ) : (
                <Card>
                  <CardHeader className="relative pl-10">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={index === 0} 
                        onClick={() => handleMoveUp(index)} 
                        className="h-6 w-6"
                        title="Flytta upp"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={index === currentCV.sections.length - 1} 
                        onClick={() => handleMoveDown(index)} 
                        className="h-6 w-6"
                        title="Flytta ner"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{getSectionIcon(section.type)}</span>
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.items.length} poster</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {section.items.length > 0 ? (
                        <ul className="list-inside list-disc">
                          {section.items.slice(0, 3).map((item: any) => (
                            <li key={item.id}>{item.institution || item.company || item.name}</li>
                          ))}
                          {section.items.length > 3 && <li>...och {section.items.length - 3} till</li>}
                        </ul>
                      ) : (
                        <p>Inga poster tillagda ännu</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <AnimatedButton variant="outline" onClick={() => setEditingSectionId(section.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Redigera
                    </AnimatedButton>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <AnimatedButton variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </AnimatedButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ta bort sektion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill ta bort sektionen "{section.title}"? Denna åtgärd kan
                            inte ångras.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeSection(section.id)}>
                            Ta bort
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

