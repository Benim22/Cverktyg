"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/Navbar"
import { AlertCircle, Loader2, Save, Download, Upload, Trash2, FileText, FileQuestion, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PageTransition } from "@/components/animations/PageTransition"

export default function CVSettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [cvs, setCvs] = useState<any[]>([])
  const [defaultTemplate, setDefaultTemplate] = useState("standard")
  const [defaultLanguage, setDefaultLanguage] = useState("sv")
  const [defaultExportFormat, setDefaultExportFormat] = useState("pdf")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        
        // Hämta användarens session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/auth/signin")
          return
        }
        
        setUser(session.user)
        
        // Hämta användarens CV-inställningar
        const { data: userSettings, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
        
        if (!settingsError && userSettings) {
          setDefaultTemplate(userSettings.default_template || "standard")
          setDefaultLanguage(userSettings.default_language || "sv")
          setDefaultExportFormat(userSettings.default_export_format || "pdf")
          setAutoSaveEnabled(userSettings.auto_save || true)
          setLinkSharingEnabled(userSettings.link_sharing || false)
        }
        
        // Hämta användarens CV:n
        const { data: userCVs, error: cvsError } = await supabase
          .from("cvs")
          .select("id, title, created_at, updated_at")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false })
        
        if (!cvsError && userCVs) {
          setCvs(userCVs || [])
        }
        
      } catch (error) {
        console.error("Error loading CV settings:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getProfile()
  }, [supabase, router])
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      if (!user) {
        setError("Du måste vara inloggad för att spara inställningar")
        return
      }
      
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          default_template: defaultTemplate,
          default_language: defaultLanguage,
          default_export_format: defaultExportFormat,
          auto_save: autoSaveEnabled,
          link_sharing: linkSharingEnabled,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        throw error
      }
      
      setSuccess("Dina CV-inställningar har sparats")
      
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när inställningarna skulle sparas")
    } finally {
      setSaving(false)
    }
  }
  
  const handleExportAllCVs = () => {
    toast({
      title: "Exporterar alla CV:n",
      description: "Funktionen kommer att ladda ner alla dina CV:n som en ZIP-fil",
    })
    // Implementera denna funktion när API:et är klart
  }
  
  const handleImportCV = () => {
    toast({
      title: "Importera CV",
      description: "Denna funktion kommer att importera CV-data från en JSON-fil",
    })
    // Implementera denna funktion när API:et är klart
  }
  
  const handleDeleteAllCVs = async () => {
    // Här skulle vi ha en bekräftelsedialog först
    try {
      setSaving(true)
      setError(null)
      
      if (!user) {
        setError("Du måste vara inloggad för att radera CV:n")
        return
      }
      
      const { error } = await supabase
        .from("cvs")
        .delete()
        .eq("user_id", user.id)
      
      if (error) {
        throw error
      }
      
      setCvs([])
      toast({
        title: "Alla CV:n raderade",
        description: "Alla dina CV:n har raderats permanent",
      })
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när CV:n skulle raderas")
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Laddar CV-inställningar...</span>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container max-w-5xl py-8 px-4 md:py-12">
          <h1 className="text-3xl font-bold mb-8">CV-inställningar</h1>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="general">Allmänt</TabsTrigger>
              <TabsTrigger value="defaults">Standardinställningar</TabsTrigger>
              <TabsTrigger value="manage">Hantera CV:n</TabsTrigger>
            </TabsList>
            
            {/* Allmänt-flik */}
            <TabsContent value="general">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500 text-green-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                {/* Autosparande */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Save className="mr-2 h-5 w-5" />
                      Autosparande
                    </CardTitle>
                    <CardDescription>
                      Ställ in om dina CV:n ska sparas automatiskt medan du redigerar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Aktivera autosparande</h3>
                        <p className="text-sm text-muted-foreground">
                          Dina ändringar sparas automatiskt var 30:e sekund.
                        </p>
                      </div>
                      <Switch
                        checked={autoSaveEnabled}
                        onCheckedChange={setAutoSaveEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Delningsinställningar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileQuestion className="mr-2 h-5 w-5" />
                      Delningsinställningar
                    </CardTitle>
                    <CardDescription>
                      Ställ in hur dina CV:n kan delas med andra.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Aktivera länkdelning</h3>
                        <p className="text-sm text-muted-foreground">
                          Andra kan se dina CV:n via en delad länk utan att logga in.
                        </p>
                      </div>
                      <Switch
                        checked={linkSharingEnabled}
                        onCheckedChange={setLinkSharingEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sparar...
                      </>
                    ) : "Spara inställningar"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Standardinställningar-flik */}
            <TabsContent value="defaults">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Standardmall */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Standardmall
                    </CardTitle>
                    <CardDescription>
                      Välj vilken mall som ska användas som standard för nya CV:n.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={defaultTemplate} onValueChange={setDefaultTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj standardmall" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalistisk</SelectItem>
                        <SelectItem value="creative">Kreativ</SelectItem>
                        <SelectItem value="professional">Professionell</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                
                {/* Standardspråk */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Standardspråk
                    </CardTitle>
                    <CardDescription>
                      Välj vilket språk som ska användas som standard för nya CV:n.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj standardspråk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sv">Svenska</SelectItem>
                        <SelectItem value="en">Engelska</SelectItem>
                        <SelectItem value="no">Norska</SelectItem>
                        <SelectItem value="da">Danska</SelectItem>
                        <SelectItem value="fi">Finska</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                
                {/* Standard exportformat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="mr-2 h-5 w-5" />
                      Standard exportformat
                    </CardTitle>
                    <CardDescription>
                      Välj vilket format som ska användas som standard för export.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup 
                      value={defaultExportFormat} 
                      onValueChange={setDefaultExportFormat}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem 
                          value="pdf" 
                          id="pdf" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="pdf"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          PDF
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="docx" 
                          id="docx" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="docx"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          DOCX
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="txt" 
                          id="txt" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="txt"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          TXT
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sparar...
                      </>
                    ) : "Spara inställningar"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Hantera CV:n flik */}
            <TabsContent value="manage">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Lista över CV:n */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Mina CV:n
                    </CardTitle>
                    <CardDescription>
                      Du har totalt {cvs.length} CV:n skapade.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cvs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Du har inte skapat några CV:n ännu.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => router.push("/editor/new")}
                        >
                          Skapa ditt första CV
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cvs.map((cv) => (
                          <div 
                            key={cv.id}
                            className="flex items-center justify-between border-b pb-3"
                          >
                            <div>
                              <h3 className="font-medium">{cv.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Uppdaterad: {new Date(cv.updated_at).toLocaleDateString('sv-SE')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/editor/${cv.id}`)}
                              >
                                Redigera
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/preview/${cv.id}`)}
                              >
                                Visa
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleExportAllCVs}
                      disabled={cvs.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportera alla
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleImportCV}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importera CV
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAllCVs}
                      disabled={cvs.length === 0 || saving}
                      className="sm:ml-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Tar bort...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Radera alla
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </>
  )
} 