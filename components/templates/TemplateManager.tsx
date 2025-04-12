"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/ui/color-picker"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Share2, DownloadCloud, Edit, Copy } from "lucide-react"
import { CVTemplate } from "@/types/cv"
import { CV_TEMPLATES } from "@/data/templates"
import { FadeIn } from "@/components/animations/FadeIn"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DEFAULT_COLOR_SCHEME } from "@/types/cv"
import { useRouter } from "next/navigation"

interface TemplateFormData {
  name: string
  description: string
  layout: string
  colorScheme: {
    primaryColor: string
    secondaryColor: string
    headingColor: string
    subHeadingColor: string
    textColor: string
    backgroundColor: string
    accentColor: string
  }
  fontSettings: {
    headingFont: string
    bodyFont: string
    fontSize: string
  }
}

interface SavedTemplate extends CVTemplate {
  user_id?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export function TemplateManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    layout: "standard",
    colorScheme: { ...DEFAULT_COLOR_SCHEME },
    fontSettings: {
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      fontSize: "medium"
    }
  })
  const [userTemplates, setUserTemplates] = useState<SavedTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [colorKey]: value
      }
    }))
  }

  const handleFontSettingChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      fontSettings: {
        ...prev.fontSettings,
        [field]: value
      }
    }))
  }

  const handleCreateTemplate = async () => {
    setLoading(true)
    
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Du måste vara inloggad för att skapa mallar")
        return
      }
      
      // Generera unikt ID
      const templateId = `custom-${Date.now()}`
      
      const newTemplate: SavedTemplate = {
        id: templateId,
        name: formData.name,
        description: formData.description,
        previewImage: "", // Skulle kunna lägga till bilduppladdning
        layout: formData.layout as "standard" | "modern" | "minimalist" | "creative" | "professional",
        colorScheme: formData.colorScheme,
        fontSettings: formData.fontSettings as any,
        user_id: user.id,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('templates')
        .insert([
          {
            id: templateId,
            name: formData.name,
            description: formData.description,
            template_data: newTemplate,
            user_id: user.id,
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      
      if (error) {
        throw new Error(error.message)
      }
      
      toast.success("Mallen har skapats")
      setIsCreating(false)
      
      // Lägg till i listan med användarmallar
      setUserTemplates((prev) => [...prev, newTemplate])
      
      // Återställ formuläret
      setFormData({
        name: "",
        description: "",
        layout: "standard",
        colorScheme: { ...DEFAULT_COLOR_SCHEME },
        fontSettings: {
          headingFont: "Inter, sans-serif",
          bodyFont: "Inter, sans-serif",
          fontSize: "medium"
        }
      })
      
    } catch (error) {
      console.error("Fel vid skapande av mall:", error)
      toast.error(`Kunde inte skapa mall: ${error.message || "Okänt fel"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleShareTemplate = async (template: SavedTemplate) => {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('templates')
        .update({ is_public: true })
        .eq('id', template.id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Uppdatera i lokala listan
      setUserTemplates((prev) => 
        prev.map(t => t.id === template.id ? { ...t, is_public: true } : t)
      )
      
      toast.success("Mallen har delats publikt")
    } catch (error) {
      console.error("Fel vid delning av mall:", error)
      toast.error(`Kunde inte dela mall: ${error.message || "Okänt fel"}`)
    }
  }

  const handleCopyTemplate = (template: CVTemplate) => {
    // Kopiera mall för att anpassa
    setFormData({
      name: `Kopia av ${template.name}`,
      description: template.description,
      layout: template.layout,
      colorScheme: { ...template.colorScheme },
      fontSettings: {
        headingFont: template.fontSettings?.headingFont || "Inter, sans-serif",
        bodyFont: template.fontSettings?.bodyFont || "Inter, sans-serif",
        fontSize: template.fontSettings?.fontSize || "medium"
      }
    })
    
    setIsCreating(true)
    toast.info("Mallen har kopierats och kan nu anpassas")
  }

  const handleUseTemplate = (template: CVTemplate) => {
    router.push(`/editor/new?template=${template.id}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mallhanterare</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Skapa ny mall
        </Button>
      </div>
      
      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system">Systemmallar</TabsTrigger>
          <TabsTrigger value="custom">Dina mallar</TabsTrigger>
          <TabsTrigger value="shared">Delade mallar</TabsTrigger>
        </TabsList>
        
        {/* Systemmallar */}
        <TabsContent value="system" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CV_TEMPLATES.map((template) => (
              <FadeIn key={template.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(template.colorScheme).map(([key, color]) => (
                        <div 
                          key={key} 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleCopyTemplate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Kopiera
                    </Button>
                    <Button onClick={() => handleUseTemplate(template)}>
                      Använd
                    </Button>
                  </CardFooter>
                </Card>
              </FadeIn>
            ))}
          </div>
        </TabsContent>
        
        {/* Dina mallar */}
        <TabsContent value="custom" className="pt-4">
          {userTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTemplates.map((template) => (
                <FadeIn key={template.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(template.colorScheme).map(([key, color]) => (
                          <div 
                            key={key} 
                            className="w-6 h-6 rounded-full border" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => handleShareTemplate(template)}
                        disabled={template.is_public}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        {template.is_public ? "Delad" : "Dela"}
                      </Button>
                      <Button onClick={() => handleUseTemplate(template)}>
                        Använd
                      </Button>
                    </CardFooter>
                  </Card>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Du har ännu inga egna mallar</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Skapa din första mall
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Delade mallar */}
        <TabsContent value="shared" className="pt-4">
          <div className="text-center py-10">
            <p className="text-muted-foreground">Utforska mallar som andra användare har delat</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modal för att skapa/redigera mall */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Skapa ny mall</DialogTitle>
            <DialogDescription>
              Skapa din egen CV-mall genom att anpassa utseendet med färger och typsnitt
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mallnamn</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  placeholder="T.ex. Min professionella mall"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beskriv din mall"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select 
                  value={formData.layout} 
                  onValueChange={(value) => handleInputChange('layout', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimalist">Minimalistisk</SelectItem>
                    <SelectItem value="creative">Kreativ</SelectItem>
                    <SelectItem value="professional">Professionell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Typsnitt</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="headingFont" className="text-xs">Rubriker</Label>
                    <Select 
                      value={formData.fontSettings.headingFont} 
                      onValueChange={(value) => handleFontSettingChange('headingFont', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                        <SelectItem value="Merriweather, serif">Merriweather</SelectItem>
                        <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                        <SelectItem value="DM Sans, sans-serif">DM Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bodyFont" className="text-xs">Brödtext</Label>
                    <Select 
                      value={formData.fontSettings.bodyFont} 
                      onValueChange={(value) => handleFontSettingChange('bodyFont', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        <SelectItem value="Source Sans Pro, sans-serif">Source Sans Pro</SelectItem>
                        <SelectItem value="Nunito, sans-serif">Nunito</SelectItem>
                        <SelectItem value="DM Sans, sans-serif">DM Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Färgschema</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Primärfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.primaryColor} 
                      onChange={(color) => handleColorChange('primaryColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Sekundärfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.secondaryColor} 
                      onChange={(color) => handleColorChange('secondaryColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Rubrikfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.headingColor} 
                      onChange={(color) => handleColorChange('headingColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Underrubrikfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.subHeadingColor} 
                      onChange={(color) => handleColorChange('subHeadingColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Textfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.textColor} 
                      onChange={(color) => handleColorChange('textColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Bakgrundsfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.backgroundColor} 
                      onChange={(color) => handleColorChange('backgroundColor', color)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Accentfärg</Label>
                    <ColorPicker 
                      color={formData.colorScheme.accentColor} 
                      onChange={(color) => handleColorChange('accentColor', color)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Avbryt</Button>
            <Button onClick={handleCreateTemplate} disabled={loading}>
              {loading ? "Skapar..." : "Skapa mall"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 