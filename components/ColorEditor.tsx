"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ChevronDown, Palette, Check, Paintbrush, Sparkles } from "lucide-react"
import { type CVColorScheme } from "@/types/cv"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
}

const PRESET_COLORS = [
  "#000000", // Svart
  "#ffffff", // Vit
  "#1e40af", // Mörkblå
  "#3b82f6", // Blå
  "#0ea5e9", // Ljusblå
  "#10b981", // Grön
  "#22c55e", // Ljusgrön
  "#eab308", // Gul
  "#f97316", // Orange
  "#ef4444", // Röd
  "#ec4899", // Rosa
  "#8b5cf6", // Lila
  "#6b7280", // Grå
]

function ColorPreview({ colors }: { colors: CVColorScheme }) {
  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
      <div 
        className="p-4"
        style={{ backgroundColor: colors.backgroundColor }}
      >
        <h3 
          className="text-lg font-bold"
          style={{ color: colors.primaryColor }}
        >
          Förhandsgranskning
        </h3>
        <p 
          className="text-base"
          style={{ color: colors.secondaryColor }}
        >
          Undertitel
        </p>
        
        <div className="mt-3">
          <h4 
            className="text-sm font-semibold"
            style={{ color: colors.headingColor }}
          >
            Rubrik
          </h4>
          <h5 
            className="text-sm"
            style={{ color: colors.subHeadingColor }}
          >
            Underrubrik
          </h5>
          <p 
            className="text-xs mt-1"
            style={{ color: colors.textColor }}
          >
            Detta är ett exempel på brödtext som visar hur dina valda färger kommer att se ut i ditt CV.
          </p>
          
          <div className="flex gap-2 mt-2">
            <span 
              className="text-xs rounded-full px-2 py-0.5"
              style={{ 
                backgroundColor: colors.secondaryColor,
                color: colors.backgroundColor
              }}
            >
              Etikett
            </span>
            <span 
              className="text-xs rounded-full px-2 py-0.5"
              style={{ 
                backgroundColor: colors.accentColor,
                color: '#fff'
              }}
            >
              Accent
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const COLOR_THEMES = [
  {
    name: "Professionell",
    colors: {
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      headingColor: "#1e293b",
      subHeadingColor: "#334155",
      textColor: "#475569",
      backgroundColor: "#ffffff",
      accentColor: "#2563eb",
    },
  },
  {
    name: "Modern",
    colors: {
      primaryColor: "#18181b",
      secondaryColor: "#3f3f46",
      headingColor: "#09090b",
      subHeadingColor: "#27272a",
      textColor: "#52525b",
      backgroundColor: "#ffffff",
      accentColor: "#06b6d4",
    },
  },
  {
    name: "Kreativ",
    colors: {
      primaryColor: "#6d28d9",
      secondaryColor: "#8b5cf6",
      headingColor: "#1e293b",
      subHeadingColor: "#334155",
      textColor: "#475569",
      backgroundColor: "#ffffff",
      accentColor: "#f97316",
    },
  },
  {
    name: "Minimal",
    colors: {
      primaryColor: "#000000",
      secondaryColor: "#4b5563",
      headingColor: "#111827",
      subHeadingColor: "#374151",
      textColor: "#6b7280",
      backgroundColor: "#ffffff",
      accentColor: "#d1d5db",
    },
  },
]

function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-2"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  className="relative w-8 h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => onChange(presetColor)}
                >
                  {color === presetColor && (
                    <Check
                      className={`absolute inset-0 m-auto h-4 w-4 ${
                        presetColor === "#ffffff" ? "text-black" : "text-white"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
              />
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-sm text-gray-500">{color}</span>
      </div>
    </div>
  )
}

export function ColorEditor() {
  const { currentCV, updateColorScheme, getColorValue } = useCV()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("anpassad")
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentColors: CVColorScheme = {
    primaryColor: getColorValue("primaryColor"),
    secondaryColor: getColorValue("secondaryColor"),
    headingColor: getColorValue("headingColor"),
    subHeadingColor: getColorValue("subHeadingColor"),
    textColor: getColorValue("textColor"),
    backgroundColor: getColorValue("backgroundColor"),
    accentColor: getColorValue("accentColor"),
  }
  
  const [colors, setColors] = useState<CVColorScheme>(currentColors)
  
  // Uppdatera det lokala tillståndet när context ändras
  useEffect(() => {
    setColors({
      primaryColor: getColorValue("primaryColor"),
      secondaryColor: getColorValue("secondaryColor"),
      headingColor: getColorValue("headingColor"),
      subHeadingColor: getColorValue("subHeadingColor"),
      textColor: getColorValue("textColor"),
      backgroundColor: getColorValue("backgroundColor"),
      accentColor: getColorValue("accentColor"),
    })
  }, [currentCV?.colorScheme, getColorValue])
  
  // Debounce-funktion för färgändringar
  const handleColorChange = useCallback((key: keyof CVColorScheme, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }, []);
  
  // Applicera tema med debounce för att förhindra för många uppdateringar
  const applyTheme = useCallback((theme: CVColorScheme) => {
    setColors(theme)
  }, []);
  
  const handleSave = () => {
    updateColorScheme(colors)
    toast.success("Färginställningarna har sparats")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white p-2 shadow-md transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary color-editor-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Redigera färger"
        >
          <Palette className="h-5 w-5 text-primary" />
        </motion.button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Anpassa färger</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="färdiga" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Färdiga teman
            </TabsTrigger>
            <TabsTrigger value="anpassad" className="flex items-center gap-1">
              <Paintbrush className="h-4 w-4" />
              Anpassade färger
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="färdiga" className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {COLOR_THEMES.map((theme) => (
                <motion.div
                  key={theme.name}
                  className="relative cursor-pointer overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyTheme(theme.colors)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{theme.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => applyTheme(theme.colors)}
                      className="h-8 px-3"
                    >
                      Använd
                    </Button>
                  </div>
                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      {Object.values(theme.colors).map((color, index) => (
                        <div
                          key={index}
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div 
                      className="p-2 rounded border text-xs"
                      style={{ backgroundColor: theme.colors.backgroundColor }}
                    >
                      <span style={{ color: theme.colors.primaryColor }}>Rubrik</span>
                      <span style={{ color: theme.colors.textColor }}> • </span>
                      <span style={{ color: theme.colors.secondaryColor }}>Undertitel</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4">
              <Label>Aktuell förhandsgranskning</Label>
              <div className="mt-2">
                <ColorPreview colors={colors} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="anpassad" className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ColorPicker
                    color={colors.primaryColor}
                    onChange={(value) => handleColorChange("primaryColor", value)}
                    label="Primärfärg"
                  />
                  <ColorPicker
                    color={colors.secondaryColor}
                    onChange={(value) => handleColorChange("secondaryColor", value)}
                    label="Sekundärfärg"
                  />
                  <ColorPicker
                    color={colors.headingColor}
                    onChange={(value) => handleColorChange("headingColor", value)}
                    label="Rubrikfärg"
                  />
                  <ColorPicker
                    color={colors.subHeadingColor}
                    onChange={(value) => handleColorChange("subHeadingColor", value)}
                    label="Underrubrikfärg"
                  />
                  <ColorPicker
                    color={colors.textColor}
                    onChange={(value) => handleColorChange("textColor", value)}
                    label="Textfärg"
                  />
                  <ColorPicker
                    color={colors.backgroundColor}
                    onChange={(value) => handleColorChange("backgroundColor", value)}
                    label="Bakgrundsfärg"
                  />
                  <ColorPicker
                    color={colors.accentColor}
                    onChange={(value) => handleColorChange("accentColor", value)}
                    label="Accentfärg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Förhandsgranskning</Label>
                <ColorPreview colors={colors} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Förhandsgranskningsexemplet visar hur dina valda färger kommer att se ut i ditt CV. Ändra färgerna och se uppdateringarna i realtid.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSave}>
            Spara färger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 