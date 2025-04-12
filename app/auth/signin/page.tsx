"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Mail, Lock, AlertCircle } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod vid inloggningen")
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // Show success message
      setError("Vi har skickat en inloggningslänk till din e-post!")
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod vid skickandet av magisk länk")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="mb-2 text-2xl font-bold">Välkommen tillbaka!</h1>
      <p className="mb-8 text-muted-foreground">Logga in på ditt konto för att fortsätta.</p>
      
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="password">Lösenord</TabsTrigger>
          <TabsTrigger value="magic-link">Magisk länk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <Card>
            <form onSubmit={handleSignIn}>
              <CardContent className="pt-6 space-y-4">
                {error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Label htmlFor="email">E-postadress</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        type="email"
                        placeholder="namn@exempel.se"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Lösenord</Label>
                      <Link href="/auth/reset" className="text-xs text-primary hover:underline">
                        Glömt lösenordet?
                      </Link>
                    </div>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loggar in..." : "Logga in"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Har du inget konto?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Registrera dig här
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="magic-link">
          <Card>
            <form onSubmit={handleMagicLink}>
              <CardContent className="pt-6 space-y-4">
                {error && (
                  <Alert 
                    variant={error.includes("skickat") ? "default" : "destructive"} 
                    className={cn("text-sm", error.includes("skickat") && "border-green-500 text-green-500")}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email-magic">E-postadress</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="email-magic"
                      type="email"
                      placeholder="namn@exempel.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vi skickar en magisk länk till din e-post. Klicka på länken för att logga in utan lösenord.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Skickar..." : "Skicka magisk länk"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Har du inget konto?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Registrera dig här
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
} 