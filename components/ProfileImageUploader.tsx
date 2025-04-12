"use client"

import { useState, useRef, useEffect } from "react"
import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { Upload, X, Pencil, ImageOff } from "lucide-react"
import { motion } from "framer-motion"

export function ProfileImageUploader() {
  const { currentCV, setPersonalInfo } = useCV()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentCV?.personalInfo?.profileImage?.url || null
  )
  const [transparentImageUrl, setTransparentImageUrl] = useState<string | null>(null)
  
  // Bildstil
  const [isCircle, setIsCircle] = useState<boolean>(
    currentCV?.personalInfo?.profileImage?.isCircle || true
  )
  const [showFrame, setShowFrame] = useState<boolean>(
    currentCV?.personalInfo?.profileImage?.showFrame || false
  )
  const [frameColor, setFrameColor] = useState<string>(
    currentCV?.personalInfo?.profileImage?.frameColor || "#4f46e5"
  )
  const [frameStyle, setFrameStyle] = useState<string>(
    currentCV?.personalInfo?.profileImage?.frameStyle || "solid"
  )
  const [frameWidth, setFrameWidth] = useState<number>(
    currentCV?.personalInfo?.profileImage?.frameWidth || 2
  )
  const [isTransparent, setIsTransparent] = useState<boolean>(
    currentCV?.personalInfo?.profileImage?.isTransparent || false
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // När bilden ändras, bearbeta den för transparens om nödvändigt
  useEffect(() => {
    if (previewUrl && isTransparent && canvasRef.current) {
      processImageTransparency(previewUrl);
    }
  }, [previewUrl, isTransparent]);

  // När transparensläget ändras, växla mellan normal och transparent bild
  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      if (isTransparent) {
        processImageTransparency(previewUrl);
      } else {
        // Återställ till originalbilden
        setTransparentImageUrl(null);
      }
    }
  }, [isTransparent]);

  // Bearbeta bilden för att göra bakgrunden transparent
  const processImageTransparency = (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Rita bilden på canvas
      ctx.drawImage(img, 0, 0);

      // Gör bakgrunden transparent genom att konvertera vita områden
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Hitta bakgrundsfärgen (antar att den är runt kanterna)
      const topLeftColor = [data[0], data[1], data[2], data[3]];
      const threshold = 30; // Tolerans för färgskillnad

      // Gå igenom varje pixel och gör bakgrund transparent
      for (let i = 0; i < data.length; i += 4) {
        // Om pixeln är nära bakgrundsfärgen, gör den transparent
        if (
          Math.abs(data[i] - topLeftColor[0]) < threshold &&
          Math.abs(data[i + 1] - topLeftColor[1]) < threshold &&
          Math.abs(data[i + 2] - topLeftColor[2]) < threshold
        ) {
          data[i + 3] = 0; // Sätt alpha (transparens) till 0
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Konvertera canvas till data URL och spara
      const transparentDataUrl = canvas.toDataURL('image/png');
      setTransparentImageUrl(transparentDataUrl);
    };
    
    img.src = imageUrl;
  };

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
      const fileName = `${userId}-${Date.now()}.${fileExt}`
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

      // Uppdatera CV med bild-URL och inställningar
      setPersonalInfo({
        ...currentCV.personalInfo,
        profileImage: {
          url: publicUrl,
          path: filePath,
          isCircle,
          showFrame,
          frameColor,
          frameStyle: frameStyle as any,
          frameWidth,
          isTransparent
        }
      })

      setPreviewUrl(publicUrl)
      if (isTransparent) {
        processImageTransparency(publicUrl);
      }
      toast.success("Profilbild har laddats upp")
    } catch (error: any) {
      console.error("Fel vid uppladdning:", error)
      toast.error(error?.message || "Ett fel uppstod vid uppladdningen")
    } finally {
      setIsUploading(false)
    }
  }

  const deleteImage = async () => {
    if (!currentCV?.personalInfo?.profileImage?.path) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.storage
        .from('profile_images')
        .remove([currentCV.personalInfo.profileImage.path])

      if (error) {
        throw error
      }

      // Uppdatera CV för att ta bort bildreferensen
      setPersonalInfo({
        ...currentCV.personalInfo,
        profileImage: undefined
      })

      setPreviewUrl(null)
      setTransparentImageUrl(null)
      toast.success("Profilbild har tagits bort")
    } catch (error: any) {
      console.error("Fel vid borttagning:", error)
      toast.error(error?.message || "Ett fel uppstod vid borttagningen")
    }
  }

  const saveSettings = async () => {
    if (!currentCV?.personalInfo?.profileImage?.url) {
      toast.error("Ladda upp en bild först")
      return
    }

    try {
      // Om bilden ska vara transparent och vi har en bearbetad bild
      if (isTransparent && transparentImageUrl) {
        // Konvertera data URL till Blob
        const response = await fetch(transparentImageUrl);
        const blob = await response.blob();
        
        // Skapa fil av Blob
        const file = new File([blob], "transparent-image.png", { type: "image/png" });
        
        const supabase = getSupabaseClient()
        const userId = (await supabase.auth.getSession()).data.session?.user?.id

        if (!userId) {
          toast.error("Du måste vara inloggad för att spara bilden")
          return
        }

        // Skapa filnamn för den transparenta bilden
        const fileName = `${userId}-transparent-${Date.now()}.png`
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

        // Ta bort gamla bilden om det finns en ny path
        if (currentCV.personalInfo.profileImage?.path && currentCV.personalInfo.profileImage.path !== filePath) {
          await supabase.storage
            .from('profile_images')
            .remove([currentCV.personalInfo.profileImage.path])
        }

        // Uppdatera CV med transparent bild-URL
        setPersonalInfo({
          ...currentCV.personalInfo,
          profileImage: {
            url: publicUrl,
            path: filePath,
            isCircle,
            showFrame,
            frameColor,
            frameStyle: frameStyle as any,
            frameWidth,
            isTransparent
          }
        })
        
        setPreviewUrl(publicUrl)
      } else {
        // Om ingen transparens, bara uppdatera inställningar
        setPersonalInfo({
          ...currentCV.personalInfo,
          profileImage: {
            ...currentCV.personalInfo.profileImage,
            isCircle,
            showFrame,
            frameColor,
            frameStyle: frameStyle as any,
            frameWidth,
            isTransparent
          }
        })
      }

      toast.success("Bildinställningar sparade")
    } catch (error: any) {
      console.error("Fel vid sparande av inställningar:", error)
      toast.error(error?.message || "Ett fel uppstod vid sparandet")
    }
  }

  // Förhandsgranskningsstil
  const previewStyle = {
    borderRadius: isCircle ? '50%' : '4px',
    border: showFrame ? `${frameWidth}px ${frameStyle} ${frameColor}` : 'none',
  }

  // Osynlig canvas för bildbearbetning
  const hiddenCanvasStyle = {
    display: 'none',
    position: 'absolute',
    pointerEvents: 'none',
    opacity: 0
  } as React.CSSProperties;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex justify-center">
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <div className="relative mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative h-32 w-32 overflow-hidden"
                    style={previewStyle}
                  >
                    <img
                      src={isTransparent && transparentImageUrl ? transparentImageUrl : previewUrl}
                      alt="Profilbild"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 rounded-full bg-background shadow-sm"
                    onClick={deleteImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 bottom-0 rounded-full bg-background shadow-sm"
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
                    Lägg till logo
                  </span>
                </div>
              )}
              
              {/* Osynlig canvas för bildbearbetning */}
              <canvas ref={canvasRef} style={hiddenCanvasStyle} />
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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Laddar upp...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Välj en bild
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-circle">Rund bild</Label>
                <Switch
                  id="is-circle"
                  checked={isCircle}
                  onCheckedChange={setIsCircle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is-transparent" className="flex items-center gap-2">
                  <span>Automatisk bakgrundsborttagning</span>
                  <span className="text-xs text-muted-foreground">(Fungerar bäst med bilder med enfärgad bakgrund)</span>
                </Label>
                <Switch
                  id="is-transparent"
                  checked={isTransparent}
                  onCheckedChange={setIsTransparent}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-frame">Visa ram</Label>
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
                        className="h-8 w-20"
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
              
              <Button
                className="w-full"
                onClick={saveSettings}
              >
                Spara inställningar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 