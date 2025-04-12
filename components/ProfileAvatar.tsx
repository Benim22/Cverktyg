"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Camera, X, Pencil, ImageOff, CheckCircle2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ProfileAvatarProps {
  profileImage?: {
    url?: string;
    path?: string;
    isCircle?: boolean;
    showFrame?: boolean;
    frameColor?: string;
    frameStyle?: string;
    frameWidth?: number;
  };
  firstName?: string;
  lastName?: string;
  onUpdate: (imageData: any) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileAvatar({ 
  profileImage, 
  firstName, 
  lastName,
  onUpdate,
  size = 'md'
}: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profileImage?.url || null
  )
  
  // Bildstil
  const [isCircle, setIsCircle] = useState<boolean>(
    profileImage?.isCircle !== undefined ? profileImage.isCircle : true
  )
  const [showFrame, setShowFrame] = useState<boolean>(
    profileImage?.showFrame || false
  )
  const [frameColor, setFrameColor] = useState<string>(
    profileImage?.frameColor || "#1e40af" // Primary blue
  )
  const [frameStyle, setFrameStyle] = useState<string>(
    profileImage?.frameStyle || "solid"
  )
  const [frameWidth, setFrameWidth] = useState<number>(
    profileImage?.frameWidth || 2
  )
  const [filePath, setFilePath] = useState<string | null>(
    profileImage?.path || null
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Uppdatera lokala tillstånd när props ändras
  useEffect(() => {
    setPreviewUrl(profileImage?.url || null);
    setIsCircle(profileImage?.isCircle !== undefined ? profileImage.isCircle : true);
    setShowFrame(profileImage?.showFrame || false);
    setFrameColor(profileImage?.frameColor || "#1e40af");
    setFrameStyle(profileImage?.frameStyle || "solid");
    setFrameWidth(profileImage?.frameWidth || 2);
    setFilePath(profileImage?.path || null);
  }, [profileImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const supabase = getSupabaseClient()
      const userId = (await supabase.auth.getSession()).data.session?.user?.id

      if (!userId) {
        toast.error("Du måste vara inloggad för att ladda upp bilder")
        return
      }

      // Skapa ett unikt filnamn
      const fileExt = file.name.split('.').pop()
      const fileName = `profile-${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Ladda upp bilden till Supabase
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      // Hämta den publika URL:en för bilden
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath)

      // Spara temporärt i lokalt state
      setPreviewUrl(publicUrl)
      setFilePath(filePath)
      
    } catch (error: any) {
      console.error("Fel vid uppladdning:", error)
      toast.error(error?.message || "Ett fel uppstod vid uppladdningen")
    } finally {
      setIsUploading(false)
    }
  }

  const deleteImage = async () => {
    if (!filePath) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.storage
        .from('profile_images')
        .remove([filePath])

      if (error) {
        throw error
      }

      // Uppdatera profildata för att ta bort bildreferensen
      await onUpdate({
        profile_image_url: null,
        profile_image_path: null,
        profile_image_is_circle: null,
        profile_image_show_frame: null,
        profile_image_frame_color: null,
        profile_image_frame_style: null,
        profile_image_frame_width: null
      })

      setPreviewUrl(null)
      setFilePath(null)
      setIsOpen(false)
      toast.success("Profilbild har tagits bort")
    } catch (error: any) {
      console.error("Fel vid borttagning:", error)
      toast.error(error?.message || "Ett fel uppstod vid borttagningen")
    }
  }

  const saveSettings = async () => {
    if (!previewUrl || !filePath) {
      toast.error("Ladda upp en bild först")
      return
    }

    try {
      setIsSaving(true)
      
      // Uppdatera användarprofilen med bildinformation
      await onUpdate({
        profile_image_url: previewUrl,
        profile_image_path: filePath,
        profile_image_is_circle: isCircle,
        profile_image_show_frame: showFrame,
        profile_image_frame_color: frameColor,
        profile_image_frame_style: frameStyle,
        profile_image_frame_width: frameWidth
      })
      
      setIsOpen(false)
      toast.success("Din profilbild har uppdaterats")
    } catch (error: any) {
      console.error("Fel vid sparande:", error)
      toast.error(error?.message || "Ett fel uppstod när inställningarna skulle sparas")
    } finally {
      setIsSaving(false)
    }
  }

  // Förhandsgranskningsstil
  const previewStyle = {
    borderRadius: isCircle ? '50%' : '4px',
    border: showFrame ? `${frameWidth}px ${frameStyle} ${frameColor}` : 'none',
  }

  const getInitials = () => {
    const firstInitial = firstName ? firstName[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return (firstInitial + lastInitial).toUpperCase()
  }

  // Bestäm storlek baserat på size-prop
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="group relative cursor-pointer">
            <Avatar className={`${sizeClasses[size]} transition-all group-hover:opacity-90`} style={previewStyle}>
              <AvatarImage 
                src={previewUrl || ""} 
                alt={`${firstName} ${lastName}`} 
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-primary shadow">
                <Camera className="h-4 w-4" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profilbild</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`relative ${sizeClasses.lg} overflow-hidden`}
                      style={previewStyle}
                    >
                      <img
                        src={previewUrl}
                        alt="Profilbild"
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                    
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
                      onClick={deleteImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute -right-2 bottom-0 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="group mb-4 flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 transition-all hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageOff className="mb-2 h-10 w-10 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary">
                      Lägg till profilbild
                    </span>
                  </div>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!previewUrl ? (
              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Laddar upp...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Välj en bild
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is-circle" className="cursor-pointer">Rund bild</Label>
                  <Switch
                    id="is-circle"
                    checked={isCircle}
                    onCheckedChange={setIsCircle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-frame" className="cursor-pointer">Visa ram</Label>
                  <Switch
                    id="show-frame"
                    checked={showFrame}
                    onCheckedChange={setShowFrame}
                  />
                </div>
                
                {showFrame && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="frame-color">Ramfärg</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-8 w-8 rounded-md border"
                          style={{ backgroundColor: frameColor }}
                        />
                        <Input
                          id="frame-color"
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="h-8 w-24"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frame-style">Ramstil</Label>
                      <Select
                        value={frameStyle}
                        onValueChange={setFrameStyle}
                      >
                        <SelectTrigger id="frame-style">
                          <SelectValue placeholder="Välj ramstil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Streckad</SelectItem>
                          <SelectItem value="dotted">Prickad</SelectItem>
                          <SelectItem value="double">Dubbel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frame-width">Ramtjocklek</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setFrameWidth(Math.max(1, frameWidth - 1))}
                          disabled={frameWidth <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{frameWidth}px</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setFrameWidth(Math.min(10, frameWidth + 1))}
                          disabled={frameWidth >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Avbryt</Button>
            </DialogClose>
            {previewUrl && (
              <Button 
                onClick={saveSettings} 
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sparar...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Spara
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 