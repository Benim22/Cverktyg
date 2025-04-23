"use client"

import { useState, useRef, useEffect } from "react"
import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit, Type, Palette, LayoutGrid, GripVertical, ArrowUp, ArrowDown, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CVColorScheme } from "@/types/cv"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useCVFonts, AVAILABLE_FONTS } from "@/hooks/useCVFonts"

interface CVHoverEditorProps {
  visible: boolean;
  activeSection?: string | null;
  activeSectionIndex?: number | null;
  onSectionClick: (sectionId: string | null, index: number | null) => void;
}

export function CVHoverEditor({ visible, activeSection, activeSectionIndex, onSectionClick }: CVHoverEditorProps) {
  const { 
    currentCV, 
    updateColorScheme, 
    reorderSections,
    removeSection,
    updateSection,
    updateFontSettings
  } = useCV();
  
  // Använd vår hook för typsnitt
  const { headingFont, bodyFont, availableFonts } = useCVFonts();
  
  const [activeTab, setActiveTab] = useState("typsnitt");
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Stäng editorn om användaren klickar utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onSectionClick(null, null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSectionClick]);
  
  // Hantera ändring av typsnitt
  const handleFontChange = (fontFamily: string, type: 'heading' | 'body') => {
    if (!currentCV) return;
    
    // Uppdatera fontSettings baserat på vilken typ av typsnitt som ändrats
    if (type === 'heading') {
      updateFontSettings({
        headingFont: fontFamily
      });
    } else {
      updateFontSettings({
        bodyFont: fontFamily
      });
    }
  };
  
  // Hantera ändring av teckenstorlek
  const handleFontSizeChange = (fontSize: "small" | "medium" | "large") => {
    if (!currentCV) return;
    
    updateFontSettings({
      fontSize
    });
  };
  
  // Hantera färgändringar
  const handleColorChange = (colorKey: keyof CVColorScheme, value: string) => {
    if (!currentCV?.colorScheme) return;
    
    updateColorScheme({
      ...currentCV.colorScheme,
      [colorKey]: value
    });
  };
  
  // Hantera dra-och-släpp för sektioner
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    reorderSections(startIndex, endIndex);
  };
  
  // Flytta en sektion upp eller ner
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!currentCV) return;
    
    if (direction === "up" && index > 0) {
      reorderSections(index, index - 1);
    } else if (direction === "down" && index < currentCV.sections.length - 1) {
      reorderSections(index, index + 1);
    }
  };
  
  // Ta bort en sektion
  const handleRemoveSection = (sectionId: string) => {
    if (window.confirm("Är du säker på att du vill ta bort denna sektion?")) {
      removeSection(sectionId);
      onSectionClick(null, null);
    }
  };
  
  // Uppdatera en sektions titel
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    updateSection(sectionId, { title });
  };
  
  // Om ingen sektion är aktiv, eller editorn är osynlig, visa ingenting
  if (!visible) return null;
  
  return (
    <motion.div 
      ref={editorRef}
      className="absolute right-4 top-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 w-64"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Redigera CV</h3>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-6 w-6"
          onClick={() => onSectionClick(null, null)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
      
      {activeSection ? (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Redigerar: {currentCV?.sections.find(s => s.id === activeSection)?.title || "Sektion"}
          </h4>
          
          <div className="flex gap-2">
            {activeSectionIndex !== null && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveSection(activeSectionIndex, "up")}
                  disabled={activeSectionIndex <= 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveSection(activeSectionIndex, "down")}
                  disabled={currentCV && activeSectionIndex >= currentCV.sections.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button 
              variant="destructive" 
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => activeSection && handleRemoveSection(activeSection)}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="typsnitt" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Typsnitt
            </TabsTrigger>
            <TabsTrigger value="färger" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Färger
            </TabsTrigger>
            <TabsTrigger value="struktur" className="text-xs">
              <LayoutGrid className="h-3 w-3 mr-1" />
              Struktur
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="typsnitt" className="pt-2">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Rubriker</Label>
                <Select onValueChange={(value) => handleFontChange(value, 'heading')}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Välj typsnitt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map(font => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Brödtext</Label>
                <Select onValueChange={(value) => handleFontChange(value, 'body')}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Välj typsnitt" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map(font => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Teckenstorlek</Label>
                <RadioGroup 
                  defaultValue={currentCV?.fontSettings?.fontSize || "medium"} 
                  className="flex gap-3"
                  onValueChange={(value) => handleFontSizeChange(value as "small" | "medium" | "large")}
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="small" id="small" className="h-3 w-3" />
                    <Label htmlFor="small" className="text-[10px]">Liten</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="medium" id="medium" className="h-3 w-3" />
                    <Label htmlFor="medium" className="text-[10px]">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="large" id="large" className="h-3 w-3" />
                    <Label htmlFor="large" className="text-[10px]">Stor</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="färger" className="pt-2">
            <div className="space-y-2">
              {(["primaryColor", "secondaryColor", "headingColor", "textColor", "backgroundColor", "accentColor"] as const).map(colorKey => (
                <div key={colorKey} className="grid grid-cols-[1fr,60px] gap-2 items-center">
                  <Label className="text-xs capitalize">
                    {colorKey.replace("Color", "")}
                  </Label>
                  <div className="relative flex items-center">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: currentCV?.colorScheme?.[colorKey] }}
                    />
                    <input 
                      type="color" 
                      value={currentCV?.colorScheme?.[colorKey] || "#000000"} 
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="struktur" className="pt-2">
            {currentCV && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="cv-sections">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-1"
                    >
                      {currentCV.sections.map((section, index) => (
                        <Draggable 
                          key={section.id} 
                          draggableId={section.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center bg-muted/40 rounded p-2"
                            >
                              <div {...provided.dragHandleProps} className="mr-2">
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="text-xs flex-1">{section.title}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
} 