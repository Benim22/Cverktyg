"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ProfileAvatar } from "@/components/ProfileAvatar"
import { Navbar } from "@/components/Navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save, Loader2, User, Mail, Phone, MapPin, Crown, Star, Sparkles, CheckIcon, ChevronRight } from "lucide-react"
import { PageTransition } from "@/components/animations/PageTransition"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { subscription, getUserPlan } = useSubscription()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Sverige",
    title: "",
    bio: "",
    emailNotifications: true,
    profileImage: {
      url: "",
      path: "",
      isCircle: true,
      showFrame: false,
      frameColor: "",
      frameStyle: "",
      frameWidth: 2
    }
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
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
        
        // Hämta användarens profil från databasen
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .single()
        
        if (error) {
          console.error("Error fetching user profile:", error)
        } else if (data) {
          setUserProfile({
            firstName: data.first_name || session.user.user_metadata?.first_name || "",
            lastName: data.last_name || session.user.user_metadata?.last_name || "",
            email: session.user.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            zipCode: data.zip_code || "",
            country: data.country || "Sverige",
            title: data.title || "",
            bio: data.bio || "",
            emailNotifications: data.email_notifications !== false,
            profileImage: {
              url: data.profile_image_url || "",
              path: data.profile_image_path || "",
              isCircle: data.profile_image_is_circle !== false,
              showFrame: data.profile_image_show_frame || false,
              frameColor: data.profile_image_frame_color || "#1e40af",
              frameStyle: data.profile_image_frame_style || "solid",
              frameWidth: data.profile_image_frame_width || 2
            }
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getProfile()
  }, [supabase, router])
  
  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      if (!user) return
      
      // Uppdatera user_metadata i Auth
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          first_name: userProfile.firstName,
          last_name: userProfile.lastName
        }
      })
      
      if (updateAuthError) {
        throw updateAuthError
      }
      
      // Uppdatera användarinformation i users-tabellen
      const { error: updateProfileError } = await supabase
        .from("users")
        .update({
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          phone: userProfile.phone,
          address: userProfile.address,
          city: userProfile.city,
          zip_code: userProfile.zipCode,
          country: userProfile.country,
          title: userProfile.title,
          bio: userProfile.bio,
          email_notifications: userProfile.emailNotifications,
          updated_at: new Date().toISOString()
        })
        .eq("auth_id", user.id)
      
      if (updateProfileError) {
        throw updateProfileError
      }
      
      setSuccess("Din profil har uppdaterats")
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod när profilen skulle uppdateras")
    } finally {
      setSaving(false)
    }
  }

  const handleProfileImageUpdate = async (imageData: any) => {
    try {
      if (!user) return
      
      // Uppdatera profilbildsinformation i databasen
      const { error } = await supabase
        .from("users")
        .update({
          profile_image_url: imageData.profile_image_url,
          profile_image_path: imageData.profile_image_path,
          profile_image_is_circle: imageData.profile_image_is_circle,
          profile_image_show_frame: imageData.profile_image_show_frame,
          profile_image_frame_color: imageData.profile_image_frame_color,
          profile_image_frame_style: imageData.profile_image_frame_style,
          profile_image_frame_width: imageData.profile_image_frame_width,
          updated_at: new Date().toISOString()
        })
        .eq("auth_id", user.id)
      
      if (error) {
        throw error
      }
      
      // Uppdatera lokalt användarprofilobjekt för att spegla ändringarna
      setUserProfile({
        ...userProfile,
        profileImage: {
          url: imageData.profile_image_url || "",
          path: imageData.profile_image_path || "",
          isCircle: imageData.profile_image_is_circle !== false,
          showFrame: imageData.profile_image_show_frame || false,
          frameColor: imageData.profile_image_frame_color || "#1e40af",
          frameStyle: imageData.profile_image_frame_style || "solid",
          frameWidth: imageData.profile_image_frame_width || 2
        }
      })
      
    } catch (error: any) {
      console.error("Error updating profile image:", error)
      throw error
    }
  }
  
  // Funktion för att visa rätt badge-ikon baserat på prenumerationsplan
  const getPlanIcon = () => {
    const plan = getUserPlan();
    switch (plan) {
      case "premium":
        return <Crown className="h-4 w-4" />;
      case "basic":
        return <Star className="h-4 w-4" />;
      case "lifetime":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  // Funktion för att få rätt färg baserat på prenumerationsplan
  const getPlanBadgeStyle = () => {
    const plan = getUserPlan();
    switch (plan) {
      case "premium":
        return {
          color: "bg-gradient-to-r from-amber-500 to-yellow-300",
          hoverColor: "bg-gradient-to-r from-amber-600 to-yellow-400",
          textColor: "text-amber-950",
          borderColor: "border-amber-400",
        };
      case "basic":
        return {
          color: "bg-gradient-to-r from-blue-500 to-cyan-300",
          hoverColor: "bg-gradient-to-r from-blue-600 to-cyan-400",
          textColor: "text-blue-950",
          borderColor: "border-blue-400",
        };
      case "lifetime":
        return {
          color: "bg-gradient-to-r from-purple-500 to-pink-300",
          hoverColor: "bg-gradient-to-r from-purple-600 to-pink-400",
          textColor: "text-purple-950",
          borderColor: "border-purple-400",
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-gray-300",
          hoverColor: "bg-gradient-to-r from-gray-600 to-gray-400",
          textColor: "text-gray-950",
          borderColor: "border-gray-400",
        };
    }
  };

  // Funktion för att få plan-namnet på svenska
  const getPlanName = () => {
    const plan = getUserPlan();
    switch (plan) {
      case "premium":
        return "Premium";
      case "basic":
        return "Bas";
      case "lifetime":
        return "Lifetime";
      default:
        return "Gratis";
    }
  };
  
  // Funktion för att få plan-fördelar baserat på prenumerationsplan
  const getPlanBenefits = () => {
    const plan = getUserPlan();
    switch (plan) {
      case "premium":
        return [
          "Obegränsade CV:n",
          "Tillgång till alla premium-mallar",
          "Export utan vattenstämpel",
          "Prioriterad kundtjänst"
        ];
      case "basic":
        return [
          "Skapa upp till 5 CV:n",
          "Tillgång till standard-mallar",
          "Export med diskret vattenstämpel",
          "Standard kundtjänst"
        ];
      case "lifetime":
        return [
          "Livstids tillgång till obegränsade CV:n",
          "Tillgång till alla premium-mallar",
          "Export utan vattenstämpel",
          "VIP kundtjänst",
          "Gratis uppgraderingar för livet"
        ];
      default:
        return [
          "Skapa upp till 3 CV:n",
          "Tillgång till grundmallar",
          "Export med vattenstämpel",
          "Community-support"
        ];
    }
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Laddar profil...</span>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="container max-w-5xl py-8 px-4 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold">Min profil</h1>
            
            {/* Förbättrad Prenumerationsbadge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="inline-block mt-3 sm:mt-0"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className={`
                        relative flex items-center gap-2 rounded-full px-3 py-1.5 
                        border shadow-sm cursor-help 
                        ${getPlanBadgeStyle().color} ${getPlanBadgeStyle().borderColor} 
                        ${getPlanBadgeStyle().textColor} font-medium
                      `}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/25 rounded-full p-1.5 mr-1"
                      >
                        {getPlanIcon()}
                      </motion.div>
                      <div>
                        <span className="text-xs font-semibold block leading-none mb-0.5">Prenumeration</span>
                        <span className="font-bold text-sm">{getPlanName()}</span>
                        {getUserPlan() !== "premium" && getUserPlan() !== "lifetime" && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-[10px] p-0 h-auto ml-1 underline font-normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/pricing');
                            }}
                          >
                            <motion.span
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center"
                            >
                              Uppgradera
                              <ChevronRight className="h-3 w-3 ml-0.5" />
                            </motion.span>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-0 w-64">
                  <div className="p-3">
                    <div className="font-semibold mb-2 flex items-center">
                      {getPlanIcon()}
                      <span className="ml-2">{getPlanName()} Plan - Fördelar</span>
                    </div>
                    <ul className="space-y-1">
                      {getPlanBenefits().map((benefit, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <CheckIcon className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-green-500" />
                          </motion.div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="personal">Personlig information</TabsTrigger>
              <TabsTrigger value="preferences">Preferenser</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                {/* Profilbild och information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="relative overflow-hidden">
                    {/* Ta bort diagonal prenumerationsbadge i hörnet */}

                    <CardHeader className="text-center pt-6">
                      <div className="flex justify-center mb-4">
                        <ProfileAvatar
                          profileImage={userProfile.profileImage}
                          firstName={userProfile.firstName}
                          lastName={userProfile.lastName}
                          onUpdate={handleProfileImageUpdate}
                          size="lg"
                        />
                      </div>
                      <CardTitle className="text-xl">
                        {userProfile.firstName} {userProfile.lastName}
                      </CardTitle>
                      <CardDescription>{userProfile.title || "Din yrkestitel"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">{userProfile.email}</span>
                        </div>
                        {userProfile.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">{userProfile.phone}</span>
                          </div>
                        )}
                        {userProfile.city && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {userProfile.city}, {userProfile.country}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground line-clamp-4">
                          {userProfile.bio || "Lägg till en kort beskrivning om dig själv här..."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Redigera profil */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Redigera profil</CardTitle>
                      <CardDescription>
                        Uppdatera din personliga information nedan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Förnamn</Label>
                          <Input
                            id="firstName"
                            value={userProfile.firstName}
                            onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Efternamn</Label>
                          <Input
                            id="lastName"
                            value={userProfile.lastName}
                            onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-post</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          För att ändra e-post, gå till Inställningar.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Yrkestitel</Label>
                        <Input
                          id="title"
                          placeholder="T.ex. Projektledare, UX-designer, Utvecklare"
                          value={userProfile.title}
                          onChange={(e) => setUserProfile({ ...userProfile, title: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefonnummer</Label>
                        <Input
                          id="phone"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Adress</Label>
                        <Input
                          id="address"
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Ort</Label>
                          <Input
                            id="city"
                            value={userProfile.city}
                            onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Postnummer</Label>
                          <Input
                            id="zipCode"
                            value={userProfile.zipCode}
                            onChange={(e) => setUserProfile({ ...userProfile, zipCode: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="country">Land</Label>
                        <Input
                          id="country"
                          value={userProfile.country}
                          onChange={(e) => setUserProfile({ ...userProfile, country: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografi</Label>
                        <textarea
                          id="bio"
                          rows={3}
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Kort beskrivning om dig själv..."
                          value={userProfile.bio}
                          onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="ml-auto" 
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sparar...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Spara ändringar
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notifikationer</CardTitle>
                    <CardDescription>
                      Hantera dina notifikationsinställningar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">E-postmeddelanden</h4>
                        <p className="text-sm text-muted-foreground">
                          Ta emot viktiga uppdateringar och information via e-post.
                        </p>
                      </div>
                      <Switch 
                        checked={userProfile.emailNotifications}
                        onCheckedChange={(checked) => 
                          setUserProfile({ ...userProfile, emailNotifications: checked })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Nyhetsbrev</h4>
                        <p className="text-sm text-muted-foreground">
                          Ta emot tips, nyheter och inspiration från CVerktyg.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Jobbmatchningar</h4>
                        <p className="text-sm text-muted-foreground">
                          Få meddelanden om nya jobb som matchar din profil.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sparar...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Spara inställningar
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