"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/Navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, Loader2, ShieldCheck, KeyRound, Mail, CreditCard, Trash2, 
  DownloadCloud, LogOut, Languages, Sun, Moon, Laptop, Check
} from "lucide-react"
import { useTheme } from "next-themes"
import { PageTransition } from "@/components/animations/PageTransition"
import { useSubscription } from "@/contexts/SubscriptionContext"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { theme, setTheme } = useTheme()
  const { subscription, getUserPlan } = useSubscription()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Hämta inkluderade funktioner baserat på prenumerationsplan
  const getPlanFeatures = () => {
    const plan = getUserPlan();
    
    // Basfunktioner som finns i alla planer
    const baseFeatures = [
      "Skapa upp till 3 CV:n",
      "Tillgång till grundläggande mallar",
      "Exportera till PDF"
    ];
    
    // Ytterligare funktioner baserat på plan
    switch (plan) {
      case "premium":
        return [
          "Skapa obegränsat antal CV:n",
          "Tillgång till alla premium-mallar",
          "Export utan vattenstämpel",
          "Anpassade färger och typsnitt",
          "Prioriterad support",
          "Avancerade statistikverktyg",
          "CV-optimeringsverktyg",
          "AI-baserade CV-rekommendationer"
        ];
      case "basic":
        return [
          "Skapa upp till 5 CV:n",
          "Tillgång till standard-mallar",
          "Export med diskret vattenstämpel",
          "Anpassade färger och typsnitt",
          "Standard support"
        ];
      case "lifetime":
        return [
          "Skapa obegränsat antal CV:n (för all framtid)",
          "Tillgång till alla premium-mallar",
          "Export utan vattenstämpel",
          "Anpassade färger och typsnitt",
          "VIP prioriterad support",
          "Avancerade statistikverktyg",
          "CV-optimeringsverktyg",
          "AI-baserade CV-rekommendationer",
          "Livstidsåtkomst till framtida funktioner"
        ];
      default:
        return baseFeatures;
    }
  };
  
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
        setEmail(session.user.email || "")
        
        // Vi använder nu useSubscription istället för att hantera prenumerationen lokalt
        
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getProfile()
  }, [supabase, router])
  
  const handleUpdatePassword = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      if (newPassword !== confirmPassword) {
        setError("Lösenorden matchar inte")
        return
      }
      
      if (newPassword.length < 6) {
        setError("Lösenordet måste vara minst 6 tecken långt")
        return
      }
      
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) {
        throw error
      }
      
      setSuccess("Ditt lösenord har uppdaterats")
      setNewPassword("")
      setConfirmPassword("")
      setCurrentPassword("")
      
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när lösenordet skulle uppdateras")
    } finally {
      setSaving(false)
    }
  }
  
  const handleUpdateEmail = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      if (!email) {
        setError("Du måste ange en e-postadress")
        return
      }
      
      const { error } = await supabase.auth.updateUser({ email })
      
      if (error) {
        throw error
      }
      
      setSuccess("Vi har skickat en bekräftelselänk till din nya e-postadress. Vänligen kontrollera din inkorg.")
      
      setTimeout(() => setSuccess(null), 5000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när e-postadressen skulle uppdateras")
    } finally {
      setSaving(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }
  
  const handleDeleteAccount = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // I en verklig applikation: 
      // 1. Bekräfta med användaren flera gånger
      // 2. Implementera en serverlogik för att hantera bortttagning av användardata
      
      const { error } = await supabase.rpc('delete_user')
      
      if (error) {
        throw error
      }
      
      // Logga ut användaren och skicka till startsidan
      await supabase.auth.signOut()
      router.push("/")
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när kontot skulle tas bort")
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Laddar inställningar...</span>
        </div>
      </>
    )
  }
  
  const getPlanName = () => {
    const plan = getUserPlan();
    
    switch(plan) {
      case "free": return "Gratisplan"
      case "basic": return "Basplan"
      case "premium": return "Premiumplan"
      case "lifetime": return "Lifetime"
      default: return "Gratisplan"
    }
  }
  
  const getPlanStatus = () => {
    if (!subscription) return "Aktiv"
    
    switch(subscription.status) {
      case "active": return "Aktiv"
      case "trialing": return "Prova-på-period"
      case "past_due": return "Betalning försenad"
      case "canceled": return "Avslutad"
      default: return subscription.status
    }
  }
  
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container max-w-5xl py-8 px-4 md:py-12">
          <h1 className="text-3xl font-bold mb-8">Inställningar</h1>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="account">Konto</TabsTrigger>
              <TabsTrigger value="security">Säkerhet</TabsTrigger>
              <TabsTrigger value="subscription">Prenumeration</TabsTrigger>
              <TabsTrigger value="appearance">Utseende</TabsTrigger>
            </TabsList>
            
            {/* Konto-flik */}
            <TabsContent value="account">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* E-post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      E-postadress
                    </CardTitle>
                    <CardDescription>
                      Uppdatera din e-postadress för inloggning och kommunikation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && !error.includes("lösenord") && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && !success.includes("lösenord") && (
                      <Alert className="border-green-500 text-green-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-postadress</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpdateEmail}
                      disabled={saving || email === user?.email || !email}
                      className="ml-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uppdaterar...
                        </>
                      ) : "Uppdatera e-postadress"
                      }
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Konto-hantering */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Avsluta konto</CardTitle>
                    <CardDescription>
                      Permanent borttagning av ditt konto och all tillhörande data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      När du tar bort ditt konto raderas all din personliga information, CV:n och inställningar.
                      Denna åtgärd kan inte ångras.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Tar bort...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Ta bort mitt konto
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logga ut
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Säkerhet-flik */}
            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Lösenord */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <KeyRound className="mr-2 h-5 w-5" />
                      Ändra lösenord
                    </CardTitle>
                    <CardDescription>
                      Uppdatera ditt lösenord regelbundet för att hålla ditt konto säkert.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && error.includes("lösenord") && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && success.includes("lösenord") && (
                      <Alert className="border-green-500 text-green-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nytt lösenord</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Ett starkt lösenord bör innehålla minst 8 tecken, inklusive både bokstäver och siffror.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="ml-auto" 
                      onClick={handleUpdatePassword}
                      disabled={saving || !newPassword || !confirmPassword}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uppdaterar...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Uppdatera lösenord
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Tvåfaktorsautentisering */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Tvåfaktorsautentisering
                    </CardTitle>
                    <CardDescription>
                      Lägg till ett extra lager av säkerhet för ditt konto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Aktivera tvåfaktorsautentisering</h4>
                        <p className="text-sm text-muted-foreground">
                          Säkra ditt konto genom att kräva en extra verifieringskod vid inloggning.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Dataexport */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DownloadCloud className="mr-2 h-5 w-5" />
                      Dataexport
                    </CardTitle>
                    <CardDescription>
                      Ladda ner all din personliga data från CVerktyg.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Du kan begära en export av all data kopplad till ditt konto, inklusive profil, CV:n och inställningar.
                    </p>
                    <Button variant="outline">Begär dataexport</Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Prenumerations-flik */}
            <TabsContent value="subscription">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Nuvarande plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Nuvarande plan
                    </CardTitle>
                    <CardDescription>
                      Hantera och se information om din nuvarande prenumeration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium">{getPlanName()}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{getPlanStatus()}</p>
                      </div>
                      
                      {subscription?.expires_at && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Förnyelsedatum</p>
                          <p className="font-medium">
                            {new Date(subscription.expires_at).toLocaleDateString('sv-SE')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Inkluderade funktioner</h4>
                      <ul className="space-y-2 text-sm">
                        {getPlanFeatures().map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button className="w-full sm:w-auto" variant="outline">
                        Fakturahistorik
                      </Button>
                      <Button className="w-full sm:w-auto ml-auto">
                        Uppgradera plan
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Avsluta prenumeration */}
                {subscription?.plan !== "free" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Avsluta prenumeration</CardTitle>
                      <CardDescription>
                        Avsluta din nuvarande prenumeration och återgå till gratisplanen.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        Om du avslutar din prenumeration kommer du fortfarande ha tillgång till premiumfunktioner fram till 
                        slutet av din nuvarande faktureringsperiod. Därefter återgår ditt konto till gratisplanen.
                      </p>
                      <Button variant="destructive">Avsluta prenumeration</Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            
            {/* Utseende-flik */}
            <TabsContent value="appearance">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Tema */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tema</CardTitle>
                    <CardDescription>
                      Anpassa utseendet på CVerktyg enligt dina preferenser.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Label>Välj tema</Label>
                      <RadioGroup 
                        defaultValue={theme} 
                        onValueChange={(value) => setTheme(value)}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div>
                          <RadioGroupItem 
                            value="light" 
                            id="light" 
                            className="peer sr-only" 
                          />
                          <Label
                            htmlFor="light"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Sun className="mb-3 h-6 w-6" />
                            Ljust
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem 
                            value="dark" 
                            id="dark" 
                            className="peer sr-only" 
                          />
                          <Label
                            htmlFor="dark"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Moon className="mb-3 h-6 w-6" />
                            Mörkt
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem 
                            value="system" 
                            id="system" 
                            className="peer sr-only" 
                          />
                          <Label
                            htmlFor="system"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Laptop className="mb-3 h-6 w-6" />
                            System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Språk */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Languages className="mr-2 h-5 w-5" />
                      Språk
                    </CardTitle>
                    <CardDescription>
                      Välj det språk du vill använda i appen.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="language">Språk</Label>
                      <Select defaultValue="sv">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Välj språk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sv">Svenska</SelectItem>
                          <SelectItem value="en">Engelska</SelectItem>
                          <SelectItem value="no">Norska</SelectItem>
                          <SelectItem value="da">Danska</SelectItem>
                          <SelectItem value="fi">Finska</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </>
  )
} 