"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Twitter, Linkedin, Facebook, Mail, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function Footer() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  
  // Lägg till loggning för att spåra när Footer renderas
  useEffect(() => {
    console.log("Footer-komponent renderad")
  }, [])
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    
    // I en verklig implementation skulle du här skicka e-postadressen till en API-endpoint
    console.log("Nyhetsbrev-prenumeration:", email)
    
    toast({
      title: "Tack för din anmälan!",
      description: "Du kommer nu få vårt nyhetsbrev med tips och nyheter."
    })
    
    setEmail("")
  }
  
  return (
    <footer className="bg-card border-t shadow-sm print:hidden">
      <div className="hidden">Footern är renderad (debuggingsinformation)</div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolumn 1: Om oss och logotyp */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">CV</span>
                </div>
                <span className="font-bold text-xl">CVerktyg</span>
              </div>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              CVerktyg hjälper dig att skapa professionella CV:n som sticker ut från mängden. 
              Med våra moderna mallar och enkla verktyg får du snabbt ett CV som gör intryck.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link href="https://instagram.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://facebook.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          
          {/* Kolumn 2: Produkter och tjänster */}
          <div>
            <h3 className="font-medium text-base mb-4">Tjänster</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/templates" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                CV-mallar
              </Link>
              <Link href="/resources/tips" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                CV-tips
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Priser & planer
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Skapa ett CV
              </Link>
              <Link href="/resources" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Karriärresurser
              </Link>
            </nav>
          </div>
          
          {/* Kolumn 3: Företaget */}
          <div>
            <h3 className="font-medium text-base mb-4">Företaget</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Om oss
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Kontakta oss
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Användarvillkor
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Integritetspolicy
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Vanliga frågor
              </Link>
            </nav>
          </div>
          
          {/* Kolumn 4: Nyhetsbrev */}
          <div>
            <h3 className="font-medium text-base mb-4">Få karriärtips & nyheter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Prenumerera på vårt nyhetsbrev för att få de senaste nyheterna och karriärtipsen.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Din e-postadress"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
                <Button type="submit" className="h-10 whitespace-nowrap">
                  Prenumerera
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Vi respekterar din integritet. Avregistrera dig när som helst.
              </p>
            </form>
          </div>
        </div>
        
        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CVerktyg. Alla rättigheter förbehållna.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="mailto:info@cverktyg.se" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                info@cverktyg.se
              </Link>
              <Link href="https://github.com/cverktyg" target="_blank" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center">
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 