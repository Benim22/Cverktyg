"use client"

import { useCV } from "@/contexts/CVContext"
import type { Project } from "@/types/cv"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Edit, Grip, Plus, Save, Trash2, X, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { improveProjectText } from "@/lib/gemini-client"

const projectSchema = z.object({
  name: z.string().min(1, "Projektnamn krävs"),
  description: z.string().min(1, "Beskrivning krävs"),
  url: z.string().url("Ogiltig URL").optional().or(z.literal("")),
  startDate: z.string().min(1, "Startdatum krävs"),
  endDate: z.string().min(1, "Slutdatum krävs"),
})

interface ProjectFormProps {
  sectionId: string
  items?: any[]
  isAdding?: boolean
}

export function ProjectForm({ sectionId, items = [], isAdding = false }: ProjectFormProps) {
  const { addItem, updateItem, removeItem, reorderItems } = useCV()
  const { toast } = useToast()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isImprovingDescription, setIsImprovingDescription] = useState(false)

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      startDate: "",
      endDate: "",
    },
  })

  function onSubmit(values: z.infer<typeof projectSchema>) {
    if (editingItemId) {
      updateItem(sectionId, editingItemId, values)
      toast({
        title: "Projekt uppdaterat",
        description: "Projektet har uppdaterats framgångsrikt",
      })
      setEditingItemId(null)
    } else {
      addItem(sectionId, values)
      toast({
        title: "Projekt tillagt",
        description: "Projektet har lagts till framgångsrikt",
      })
    }
    form.reset()
  }

  const handleEdit = (item: Project) => {
    form.reset(item)
    setEditingItemId(item.id)
  }

  const handleCancel = () => {
    form.reset()
    setEditingItemId(null)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    reorderItems(sectionId, result.source.index, result.destination.index)
  }

  async function handleImproveDescription() {
    try {
      setIsImprovingDescription(true);
      const values = form.getValues();
      
      if (!values.description || values.description.length < 10) {
        toast({
          title: "Kan inte förbättra",
          description: "Du behöver först skriva en beskrivning med minst 10 tecken",
          variant: "destructive"
        });
        return;
      }
      
      // Skicka till AI-funktionen för förbättring
      const improvedDescription = await improveProjectText(
        values.title,
        values.role || '',
        values.description
      );
      
      // Uppdatera formuläret med förbättrad text
      form.setValue('description', improvedDescription);
      
      // Om vi redigerar ett befintligt objekt, uppdatera det
      if (editingItemId) {
        updateItem(sectionId, editingItemId, {
          ...values,
          description: improvedDescription
        });
      }
      
      toast({
        title: "Beskrivning förbättrad",
        description: "Din projektbeskrivning har förbättrats med AI",
      });
    } catch (error) {
      console.error("Fel vid förbättring av projektbeskrivning:", error);
      toast({
        title: "Kunde inte förbättra beskrivning",
        description: "Ett fel uppstod vid förbättring av texten",
        variant: "destructive"
      });
    } finally {
      setIsImprovingDescription(false);
    }
  }

  if (isAdding || editingItemId) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projektnamn</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. E-handelsplattform" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdatum</FormLabel>
                    <FormControl>
                      <Input placeholder="T.ex. Jan 2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slutdatum</FormLabel>
                    <FormControl>
                      <Input placeholder="T.ex. Jun 2022 eller Pågående" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. https://projektnamn.se" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Beskrivning</FormLabel>
                    <Button 
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleImproveDescription}
                      disabled={isImprovingDescription}
                      className="mb-2 gap-1"
                    >
                      {isImprovingDescription ? (
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
                      placeholder="Beskriv projektet, din roll, teknikstack, och resultat"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Avbryt
              </Button>
              <Button type="submit">
                {editingItemId ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Uppdatera
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <p className="mb-4 text-muted-foreground">
          Inga projekt tillagda ännu. Klicka på "Lägg till ny post" för att komma igång.
        </p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`projects-${sectionId}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {items.map((item: Project, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <div
                        {...provided.dragHandleProps}
                        className="absolute left-2 top-3 cursor-grab text-muted-foreground"
                      >
                        <Grip className="h-5 w-5" />
                      </div>
                      <CardHeader className="pl-10">
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {item.startDate} - {item.endDate}
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {item.url}
                          </a>
                        )}
                        {item.description && <p className="text-sm">{item.description}</p>}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Redigera
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Ta bort
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ta bort projekt</AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill ta bort detta projekt? Denna åtgärd kan inte ångras.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeItem(sectionId, item.id)}>
                                Ta bort
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

