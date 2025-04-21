"use client"

import { useCV } from "@/contexts/CVContext"
import type { Skill } from "@/types/cv"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Edit, Grip, Plus, Save, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"

const skillSchema = z.object({
  name: z.string().min(1, "Färdighetsnamn krävs"),
  level: z.number().min(1).max(5),
})

interface SkillsFormProps {
  sectionId: string
  items?: any[]
  isAdding?: boolean
}

export function SkillsForm({ sectionId, items = [], isAdding = false }: SkillsFormProps) {
  const { addItem, updateItem, removeItem, reorderItems } = useCV()
  const { toast } = useToast()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      level: 3,
    },
  })

  function onSubmit(values: z.infer<typeof skillSchema>) {
    if (editingItemId) {
      updateItem(sectionId, editingItemId, values)
      toast({
        title: "Färdighet uppdaterad",
        description: "Färdigheten har uppdaterats framgångsrikt",
      })
      setEditingItemId(null)
    } else {
      addItem(sectionId, values)
      toast({
        title: "Färdighet tillagd",
        description: "Färdigheten har lagts till framgångsrikt",
      })
    }
    form.reset()
  }

  const handleEdit = (item: Skill) => {
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
                  <FormLabel>Färdighet</FormLabel>
                  <FormControl>
                    <Input placeholder="T.ex. JavaScript, Projektledning, Photoshop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivå (1-5)</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <span className="w-8 text-center font-medium">{field.value}</span>
                  </div>
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
          Inga färdigheter tillagda ännu. Klicka på "Lägg till ny post" för att komma igång.
        </p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable 
        droppableId={`skills-${sectionId}`}
        ignoreContainerClipping={false}
        isDropDisabled={false}
        isCombineEnabled={false}
      >
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {items.map((item: Skill, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(providedDraggable) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    className="relative"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <div
                          {...providedDraggable.dragHandleProps}
                          className="absolute left-2 top-3 cursor-grab text-muted-foreground"
                        >
                          <Grip className="h-5 w-5" />
                        </div>
                        <CardHeader className="pl-10">
                          <CardTitle className="flex items-center justify-between">
                            <span>{item.name}</span>
                            <div className="flex text-primary">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < item.level ? "opacity-100" : "opacity-30"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </CardTitle>
                        </CardHeader>
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
                                <AlertDialogTitle>Ta bort färdighet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill ta bort denna färdighet? Denna åtgärd kan inte ångras.
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

