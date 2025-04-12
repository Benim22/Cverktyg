"use client"

import { useCV } from "@/contexts/CVContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionForm } from "@/components/SectionForm"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Edit, Grip, Trash2 } from "lucide-react"
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

export function SectionsList() {
  const { currentCV, reorderSections, removeSection } = useCV()
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    reorderSections(result.source.index, result.destination.index)
  }

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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" isDropDisabled={false} isCombineEnabled={false}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {currentCV.sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {editingSectionId === section.id ? (
                        <SectionForm section={section} onClose={() => setEditingSectionId(null)} />
                      ) : (
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card>
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-3 cursor-grab text-muted-foreground"
                              data-rbd-drag-handle-draggable-id={section.id}
                              data-rbd-drag-handle-context-id="0"
                            >
                              <Grip className="h-5 w-5" />
                            </div>
                            <CardHeader className="pl-10">
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
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

