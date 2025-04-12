"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, User, AlertCircle } from "lucide-react"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      setError("Du måste godkänna villkoren för att fortsätta.")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Anropa vår API-route för registrering
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Ett fel uppstod vid registreringen")
      }
      
      // Visa ett bekräftelsemeddelande
      setError("Vi har skickat en bekräftelselänk till din e-post. Vänligen verifiera din e-postadress för att fortsätta.")
      
      // Redirect till inloggningssidan efter en kort stund
      setTimeout(() => {
        router.push('/auth/signin')
      }, 5000)
      
    } catch (error: any) {
      setError(error.message || "Ett fel uppstod vid registreringen")
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
      <h1 className="mb-2 text-2xl font-bold">Skapa ett konto</h1>
      <p className="mb-8 text-muted-foreground">Börja skapa ditt professionella CV idag!</p>
      
      <Card>
        <form onSubmit={handleSignUp}>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <Alert 
                variant={error.includes("bekräftelse") ? "default" : "destructive"} 
                className={error.includes("bekräftelse") ? "border-green-500 text-green-500" : ""}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Förnamn</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Förnamn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Efternamn</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Efternamn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
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
              <p className="text-xs text-muted-foreground">
                Lösenordet måste vara minst 6 tecken långt.
              </p>
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-tight">
                Jag godkänner{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  användarvillkoren
                </Link>{" "}
                och{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  integritetspolicyn
                </Link>
              </Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
              {loading ? "Skapar konto..." : "Skapa konto"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Har du redan ett konto?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Logga in här
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
} 