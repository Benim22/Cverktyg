"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle } from "lucide-react"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/auth/signin')
      }
      setSessionChecked(true)
    }
    
    checkSession()
  }, [router, supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte. Försök igen.")
      return
    }
    
    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken långt.")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      // Visa ett bekräftelsemeddelande
      setError("Ditt lösenord har uppdaterats. Du kommer att omdirigeras till dashboard.")
      
      // Redirect till dashboard efter 3 sekunder
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod vid uppdatering av lösenordet")
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return <div className="flex justify-center items-center min-h-screen">Laddar...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="mb-2 text-2xl font-bold">Uppdatera lösenord</h1>
      <p className="mb-8 text-muted-foreground">
        Välj ett nytt lösenord för ditt konto.
      </p>
      
      <Card>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <Alert 
                variant={error.includes("uppdaterats") ? "default" : "destructive"} 
                className={error.includes("uppdaterats") ? "border-green-500 text-green-500" : ""}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minst 6 tecken"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Upprepa lösenordet"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uppdaterar..." : "Uppdatera lösenord"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
} 