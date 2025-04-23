"use client"

import { useCV } from "@/contexts/CVContext"
import type { Experience } from "@/types/cv"
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
import { improveExperienceText } from "@/lib/gemini-client"

const experienceSchema = z.object({
  company: z.string().min(1, "Företag krävs"),
  position: z.string().min(1, "Position krävs"),
  location: z.string(),
  startDate: z.string().min(1, "Startdatum krävs"),
  endDate: z.string().min(1, "Slutdatum krävs"),
  description: z.string(),
})

interface ExperienceFormProps {
  sectionId: string
  items?: any[]
  isAdding?: boolean
}

export function ExperienceForm({ sectionId, items = [], isAdding = false }: ExperienceFormProps) {
  const { addItem, updateItem, removeItem, reorderItems } = useCV()
  const { toast } = useToast()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isImprovingDescription, setIsImprovingDescription] = useState(false)

  const form = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof experienceSchema>) {
    if (editingItemId) {
      updateItem(sectionId, editingItemId, values)
      toast({
        title: "Erfarenhet uppdaterad",
        description: "Erfarenheten har uppdaterats framgångsrikt",
      })
      setEditingItemId(null)
    } else {
      addItem(sectionId, values)
      toast({
        title: "Erfarenhet tillagd",
        description: "Erfarenheten har lagts till framgångsrikt",
      })
    }
    form.reset()
  }

  const handleEdit = (item: Experience) => {
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
      const improvedDescription = await improveExperienceText(
        values.company,
        values.position,
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
        description: "Din erfarenhetsbeskrivning har förbättrats med AI",
      });
    } catch (error) {
      console.error("Fel vid förbättring av erfarenhetsbeskrivning:", error);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Företag</FormLabel>
                <FormControl>
                  <Input placeholder="T.ex. Acme AB" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. Webbutvecklare" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plats</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. Stockholm, Sverige" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startdatum</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. Jan 2020" {...field} />
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
                    <Input placeholder="T.ex. Dec 2022 eller Pågående" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    placeholder="Beskriv dina arbetsuppgifter, prestationer, etc."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-2">
                  Tips: Inkludera konkreta resultat, tekniker/verktyg du använde, och utmaningar du löste. 
                  Exempel: "Utvecklade en e-handelslösning med React och Node.js som ökade konverteringsgraden med 15%."
                </p>
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
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <p className="mb-4 text-muted-foreground">
          Ingen erfarenhet tillagd ännu. Klicka på "Lägg till ny post" för att komma igång.
        </p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable 
        droppableId={`experience-${sectionId}`}
      >
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {items.map((item: Experience, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} className="relative">
                    <Card>
                      <div
                        {...provided.dragHandleProps}
                        className="absolute left-2 top-3 cursor-grab text-muted-foreground"
                      >
                        <Grip className="h-5 w-5" />
                      </div>
                      <CardHeader className="pl-10">
                        <CardTitle>{item.company}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <strong>{item.position}</strong>
                          {item.location && ` - ${item.location}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.startDate} - {item.endDate}
                        </div>
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
                              <AlertDialogTitle>Ta bort erfarenhet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill ta bort denna erfarenhet? Denna åtgärd kan inte ångras.
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
                  </div>
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

