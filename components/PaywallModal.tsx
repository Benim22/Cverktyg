"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueAnyway: () => void
}

export function PaywallModal({ isOpen, onClose, onContinueAnyway }: PaywallModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<"one-time" | "subscription">("one-time")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Simulerad betalning för engångsexport
  const handleOneTimePayment = async () => {
    try {
      setIsProcessing(true)
      
      // Simulera en betalningsprocess
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Betalning genomförd!",
      })
      // Här skulle du normalt uppdatera användarens behörighet i databasen
      
      onContinueAnyway() // Fortsätt med PDF-export
      onClose() // Stäng modalen
    } catch (error) {
      console.error("Betalningsfel:", error)
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid betalningen",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Navigera till prenumerationssidan
  const handleSubscribe = () => {
    router.push("/pricing")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Uppgradera för att exportera</DialogTitle>
          <DialogDescription>
            För att exportera PDF utan vattenstämpel behöver du uppgradera din plan.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="one-time" onValueChange={(value) => setActiveTab(value as "one-time" | "subscription")}>
          <TabsList className="grid w-full grid-cols-2 my-4">
            <TabsTrigger value="one-time">Engångsköp</TabsTrigger>
            <TabsTrigger value="subscription">Månadsprenumeration</TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="py-2">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">Engångsexport för 19 kr</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Betala endast en gång för en enda PDF-export
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Exportera detta CV en gång</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Ingen vattenstämpel</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Hög kvalitetsutskrift</span>
                  </li>
                </ul>
                <div className="mt-4">
                  <Button 
                    onClick={handleOneTimePayment} 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Bearbetar..." : "Betala 19 kr och exportera"}
                  </Button>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Vill du exportera flera gånger?</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={() => setActiveTab("subscription")}
                >
                  Se våra prenumerationer
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="py-2">
            <div className="space-y-4">
              <div className="border p-4 rounded-lg">
                <h3 className="font-semibold text-lg">Basplan - 49 kr/månad</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Perfekt för jobbsökare som vill sticka ut
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Obegränsade PDF-exporter</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Skapa obegränsat antal CV</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Anpassade färger och typsnitt</span>
                  </li>
                </ul>
              </div>
              
              <div className="border p-4 rounded-lg border-primary bg-primary/5 relative">
                <div className="absolute -top-3 right-4">
                  <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                    Populärast
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Premium - 99 kr/månad</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  För seriösa karriärister
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Alla funktioner i basplanen</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Tillgång till alla premiummallar</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Personlig rådgivning</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button onClick={handleSubscribe} className="w-full">
                  Se alla planer och priser
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-3">
          <Alert variant="warning" className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Om du fortsätter utan att betala kommer din PDF att innehålla en synlig vattenstämpel.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="sm:justify-between mt-2">
          <Button 
            variant="ghost" 
            onClick={() => {
              toast({
                title: "Varning",
                description: "Din PDF kommer att ha en vattenstämpel",
                variant: "destructive"
              })
              onContinueAnyway()
              onClose()
            }}
          >
            Fortsätt med vattenstämpel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 