"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type CV, updateCV, updateCVPublicStatus } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/animations/PageTransition"
import { Loader2, Plus, FileText, Trash2, Edit, Copy, Eye, PenLine, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CVThumbnail } from "@/components/CVThumbnail"
import { PaywallModal } from "@/components/PaywallModal"
import { AppLayout } from "@/components/layout/AppLayout"
import { ShareDialog } from "@/components/dialogs/ShareDialog"

const MAX_FREE_CVS = 3

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cvs, setCvs] = useState<CV[]>([])
  const [user, setUser] = useState<any>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [newCVName, setNewCVName] = useState("")
  const { isFreePlan } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [cvToShare, setCvToShare] = useState<{id: string, isPublic: boolean} | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<string | null>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Använder getSupabaseClient direkt
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/auth/signin")
          return
        }
        
        setUser(session.user)
        
        // Hämta användarens CV:n direkt med supabase-klienten
        const { data, error } = await supabase
          .from('cvs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
        
        if (error) {
          console.error("Fel vid hämtning av CV:n:", error)
          toast.error("Kunde inte hämta dina CV:n")
        } else {
          setCvs(data || [])
        }
      } catch (error) {
        console.error("Fel vid laddning av dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const handleDeleteCV = async (cvId: string) => {
    if (!user) return
    
    try {
      // Använder supabase-klient direkt
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId)
        .eq('user_id', user.id)
      
      if (error) {
        console.error("Fel vid borttagning av CV:", error)
        toast.error("Kunde inte ta bort CV:t")
      } else {
        setCvs(cvs.filter(cv => cv.id !== cvId))
        toast.success("CV:t har tagits bort")
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error("Fel vid borttagning av CV:", error)
      toast.error("Ett fel uppstod")
    }
  }
  
  const handleCreateCV = () => {
    if (isFreePlan() && cvs.length >= MAX_FREE_CVS) {
      setShowPaywall(true)
      return
    }
    
    router.push("/editor/new")
  }

  const handleOpenRenameDialog = (cv: CV) => {
    setSelectedCV(cv)
    setNewCVName(cv.title)
    setRenameDialogOpen(true)
  }

  const handleShareCV = (cv: CV) => {
    setCvToShare({
      id: cv.id,
      isPublic: cv.is_public || false
    })
    setShareDialogOpen(true)
  }

  // Uppdatera CV:s publika status
  const handleCVStatusChange = (isPublic: boolean) => {
    if (cvToShare) {
      // Uppdatera den lokala listan med CV:n
      setCvs(prevCVs => 
        prevCVs.map(cv => 
          cv.id === cvToShare.id 
            ? { ...cv, is_public: isPublic } 
            : cv
        )
      )
    }
  }

  const handleRenameCV = async () => {
    if (!selectedCV || !user) return
    
    try {
      // Uppdatera CV-titeln i databasen
      const { error } = await updateCV(selectedCV.id, user.id, { 
        title: newCVName,
        // Vi behöver också uppdatera content-objektet så att titeln är konsistent
        content: {
          ...selectedCV.content,
          title: newCVName
        }
      })
      
      if (error) {
        console.error("Fel vid namnbyte:", error)
        toast.error("Kunde inte byta namn på CV:t")
      } else {
        // Uppdatera den lokala CV-listan
        setCvs(cvs.map(cv => 
          cv.id === selectedCV.id 
            ? { 
                ...cv, 
                title: newCVName,
                content: {
                  ...cv.content,
                  title: newCVName
                } 
              } 
            : cv
        ))
        setRenameDialogOpen(false)
        toast.success("Namnet har ändrats")
      }
    } catch (error) {
      console.error("Fel vid namnbyte:", error)
      toast.error("Ett fel uppstod")
    }
  }
  
  const initiateDelete = (cvId: string) => {
    setCvToDelete(cvId)
    setDeleteDialogOpen(true)
  }
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Laddar dashboard...</span>
        </div>
      </AppLayout>
    )
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container py-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mina CV:n</h1>
              <p className="text-muted-foreground">Hantera och skapa nya CV:n</p>
            </div>
            <Button onClick={handleCreateCV} className="gap-2">
              <Plus className="h-4 w-4" /> Skapa nytt CV
            </Button>
          </div>
          
          {cvs.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Inga CV:n ännu</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Du har inte skapat några CV:n än. Skapa ditt första CV för att komma igång!
                </p>
                <Button onClick={handleCreateCV} className="gap-2">
                  <Plus className="h-4 w-4" /> Skapa ditt första CV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvs.map((cv) => (
                <motion.div
                  key={cv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{cv.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenRenameDialog(cv)}
                          className="h-8 w-8"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Senast uppdaterad: {new Date(cv.updated_at).toLocaleDateString('sv-SE')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 pt-0 pb-3">
                      <CVThumbnail cv={cv} />
                    </CardContent>
                    <CardFooter className="flex justify-between mt-auto">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/preview/${cv.id}`} className="gap-2">
                          <Eye className="h-4 w-4" /> Förhandsgranska
                        </Link>
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleShareCV(cv)}
                          title="Dela"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => initiateDelete(cv.id)}
                          title="Ta bort"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
      
      {/* Dialog för att byta namn på ett CV */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Byt namn på CV</DialogTitle>
            <DialogDescription>
              Ange det nya namnet för ditt CV.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cv-name" className="text-right">
                Namn
              </Label>
              <Input
                id="cv-name"
                value={newCVName}
                onChange={(e) => setNewCVName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              onClick={handleRenameCV}
              disabled={!newCVName.trim() || newCVName === selectedCV?.title}
            >
              Spara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog för att radera ett CV */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Bekräfta borttagning</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort detta CV? Detta kan inte ångras och du kommer att förlora all information i CV:t permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="sm:flex-1"
            >
              Avbryt
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => cvToDelete && handleDeleteCV(cvToDelete)}
              className="sm:flex-1"
            >
              Ja, ta bort permanent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Paywall Modal för CV-begränsning */}
      <PaywallModal 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="cvLimit"
      />

      {/* Share Dialog */}
      {cvToShare && (
        <ShareDialog 
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          cvId={cvToShare.id}
          userId={user?.id}
          isPublic={cvToShare.isPublic}
          onStatusChange={handleCVStatusChange}
        />
      )}
    </AppLayout>
  )
}

