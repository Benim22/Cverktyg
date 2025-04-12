"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle } from "lucide-react"

export default function PasswordReset() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        throw error
      }

      setError("Vi har skickat instruktioner för återställning av lösenord till din e-post.")
      
      // Efter 5 sekunder, skicka tillbaka till inloggningssidan
      setTimeout(() => {
        router.push('/auth/signin')
      }, 5000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod vid återställningen")
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
      <h1 className="mb-2 text-2xl font-bold">Återställ lösenord</h1>
      <p className="mb-8 text-muted-foreground">
        Ange din e-postadress nedan så skickar vi instruktioner för att återställa ditt lösenord.
      </p>
      
      <Card>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <Alert 
                variant={error.includes("skickat") ? "default" : "destructive"} 
                className={error.includes("skickat") ? "border-green-500 text-green-500" : ""}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <div className="relative">
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
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Skickar..." : "Skicka återställningslänk"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/signin" className="text-primary hover:underline">
                Tillbaka till inloggning
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
} 