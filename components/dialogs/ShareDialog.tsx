"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Copy, 
  Loader2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Link as LinkIcon,
  Lock,
  Globe,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { updateCVPublicStatus } from "@/lib/supabase-client"
import { motion, AnimatePresence } from "framer-motion"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cvId: string
  userId: string
  isPublic: boolean
  onStatusChange?: (isPublic: boolean) => void
}

export function ShareDialog({ 
  open, 
  onOpenChange, 
  cvId, 
  userId,
  isPublic = false,
  onStatusChange
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [publicStatus, setPublicStatus] = useState(isPublic)
  
  // Uppdatera shareUrl när dialogen öppnas
  useEffect(() => {
    if (open) {
      setShareUrl(`${window.location.origin}/shared/${cvId}`)
      setPublicStatus(isPublic)
    }
  }, [open, cvId, isPublic])
  
  // Hantera ändring av offentlig status
  const handlePublicStatusChange = async (checked: boolean) => {
    setLoading(true)
    
    try {
      const { error } = await updateCVPublicStatus(cvId, userId, checked)
      
      if (error) {
        console.error("Fel vid uppdatering av delningsstatus:", error)
        toast.error("Kunde inte uppdatera delningsstatus")
        return
      }
      
      setPublicStatus(checked)
      if (onStatusChange) {
        onStatusChange(checked)
      }
      
      toast.success(
        checked 
          ? "CV:t är nu offentligt tillgängligt" 
          : "CV:t är nu privat"
      )
    } catch (error) {
      console.error("Fel vid uppdatering av delningsstatus:", error)
      toast.error("Kunde inte uppdatera delningsstatus")
    } finally {
      setLoading(false)
    }
  }
  
  // Kopiera länk till urklipp
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true)
        toast.success("Länken har kopierats till urklipp")
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => {
        console.error("Kunde inte kopiera till urklipp:", error)
        toast.error("Kunde inte kopiera länk")
      })
  }
  
  // Generera sociala medier länkar
  const getSocialLink = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent("Kolla in mitt CV skapat med CVerktyg!")
    
    switch (platform) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      case "email":
        return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
      default:
        return shareUrl
    }
  }
  
  // Öppna delningslänk i ett nytt fönster
  const shareToSocial = (platform: string) => {
    const url = getSocialLink(platform)
    
    if (platform === "email") {
      window.location.href = url
    } else {
      window.open(url, "_blank", "width=600,height=400")
    }
    
    // Lägg till source parameter för tracking om någon besöker länken
    setShareUrl(`${window.location.origin}/shared/${cvId}?source=${platform}`)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dela ditt CV</DialogTitle>
          <DialogDescription>
            Dela ditt CV med andra via länk eller sociala medier.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <div className="flex-1 grid gap-2">
            <Label htmlFor="link" className="sr-only">
              Länk
            </Label>
            <Input
              id="link"
              readOnly
              value={shareUrl}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            className="px-3" 
            onClick={copyToClipboard}
            variant="secondary"
          >
            <span className="sr-only">Kopiera</span>
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="public-switch" className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-medium">Offentlig delning</span>
                <p className="text-xs text-muted-foreground">
                  När detta är aktiverat kan vem som helst med länken se ditt CV utan att logga in.
                </p>
              </div>
              <Switch 
                id="public-switch" 
                checked={publicStatus} 
                onCheckedChange={handlePublicStatusChange}
                disabled={loading}
              />
            </Label>
            
            {loading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Uppdaterar inställningar...</span>
              </div>
            )}
            
            <AnimatePresence>
              {!publicStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted p-3 rounded-md text-sm mt-2 flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      CV:t är för närvarande privat. För att kunna dela det med andra måste du aktivera offentlig delning.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="py-4">
          <h3 className="mb-4 text-sm font-medium">Dela på sociala medier</h3>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => shareToSocial("facebook")}
              disabled={!publicStatus}
            >
              <Facebook className="h-6 w-6 mb-1 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => shareToSocial("twitter")}
              disabled={!publicStatus}
            >
              <Twitter className="h-6 w-6 mb-1 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => shareToSocial("linkedin")}
              disabled={!publicStatus}
            >
              <Linkedin className="h-6 w-6 mb-1 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => shareToSocial("email")}
              disabled={!publicStatus}
            >
              <Mail className="h-6 w-6 mb-1 text-gray-600" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
          
          {!publicStatus && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Aktivera offentlig delning för att dela på sociala medier
            </p>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Stäng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 