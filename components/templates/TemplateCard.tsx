"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { CVTemplate } from "@/types/cv"
import { motion } from "framer-motion"
import { CheckCircle2, FileText, Layout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CheckIcon } from "lucide-react"
import { useState } from "react"

interface TemplateCardProps {
  template: CVTemplate
  isSelected: boolean
  onSelect: () => void
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const [imageError, setImageError] = useState(false)

  // Formatera mall-layout till användarvänlig text
  const getLayoutLabel = (layout: string) => {
    switch (layout) {
      case "standard":
        return "Standard";
      case "modern":
        return "Modern";
      case "minimalist":
        return "Minimalistisk";
      case "creative":
        return "Kreativ";
      case "professional":
        return "Professionell";
      default:
        return layout.charAt(0).toUpperCase() + layout.slice(1);
    }
  };

  // Generera en professionell förhandsgranskning baserad på malltyp
  const generatePreviewBackground = () => {
    const baseClass = "w-full h-full absolute inset-0 flex flex-col p-4 bg-background border rounded-md overflow-hidden"
    
    switch (template.id.toLowerCase()) {
      case "modern":
        return (
          <div className={baseClass}>
            {/* Lyxig modern layout med gradient och tydlig sidopanel */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-b from-blue-600 to-blue-800"></div>
            <div className="absolute top-8 left-4 h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100"></div>
            </div>
            <div className="ml-[38%] pt-8">
              <div className="w-3/4 h-5 bg-gray-800 mb-2 rounded-sm"></div>
              <div className="w-1/2 h-3 bg-blue-500 mb-6 rounded-sm"></div>
              
              <div className="w-full h-px bg-gray-200 my-4"></div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-32 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-40 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-36 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-44 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <div className="w-28 h-3 bg-gray-700 rounded-sm mb-1"></div>
                    <div className="w-32 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills på sidan */}
            <div className="absolute left-4 top-32 w-[calc(30%-0.5rem)] space-y-3">
              <div className="h-2 w-16 bg-white/80 rounded-sm"></div>
              
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-blue-300/50 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-white/90 rounded-full"></div>
                </div>
                <div className="h-1.5 w-full bg-blue-300/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-white/90 rounded-full"></div>
                </div>
                <div className="h-1.5 w-full bg-blue-300/50 rounded-full overflow-hidden">
                  <div className="h-full w-[70%] bg-white/90 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )
      case "minimalist":
        return (
          <div className={baseClass}>
            {/* Elegant minimalistisk layout med exklusiv typografi */}
            <div className="h-full w-full flex flex-col items-center pt-12 bg-[#fcfcfc]">
              <div className="w-40 h-[0.5px] bg-black/70 mb-2"></div>
              <div className="text-center">
                <div className="h-5 w-48 bg-black mx-auto mb-2 rounded-sm"></div>
                <div className="h-3 w-32 bg-gray-400 mx-auto mb-6 rounded-sm"></div>
              </div>
              <div className="w-24 h-[0.5px] bg-black/30 mb-8"></div>
              
              <div className="w-4/5 max-w-xs space-y-5">
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-20 bg-gray-400 mx-auto mb-1 rounded-sm"></div>
                </div>
                
                <div className="text-center">
                  <div className="h-3 w-36 bg-black mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-24 bg-gray-500 mx-auto mb-1 rounded-sm"></div>
                  <div className="h-2 w-20 bg-gray-400 mx-auto mb-1 rounded-sm"></div>
                </div>
                
                <div className="flex justify-center gap-2 flex-wrap mt-10">
                  <div className="h-6 w-16 border border-gray-300 rounded-sm"></div>
                  <div className="h-6 w-20 border border-gray-300 rounded-sm"></div>
                  <div className="h-6 w-12 border border-gray-300 rounded-sm"></div>
                  <div className="h-6 w-18 border border-gray-300 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )
      case "creative":
        return (
          <div className={baseClass}>
            {/* Innovativ kreativ layout med diagonal design och starka färger */}
            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute -top-20 -left-20 h-64 w-96 rounded-[40%] rotate-12 bg-gradient-to-br from-purple-600 to-pink-500 opacity-25"></div>
              
              <div className="relative p-6 pt-8">
                <div className="mb-4">
                  <div className="h-6 w-48 bg-purple-800 rounded-sm mb-1"></div>
                  <div className="h-3 w-36 bg-pink-500 rounded-sm"></div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 mt-8">
                  <div className="w-full md:w-3/5 space-y-5">
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-32 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[180px] bg-gray-600 rounded-sm"></div>
                      <div className="flex items-center mt-2">
                        <div className="h-2 w-2 rounded-full bg-pink-400 mr-2"></div>
                        <div className="h-2 w-20 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-pink-500">
                      <div className="h-3 w-28 bg-purple-900 rounded-sm mb-1"></div>
                      <div className="h-2 w-full max-w-[150px] bg-gray-600 rounded-sm"></div>
                      <div className="flex items-center mt-2">
                        <div className="h-2 w-2 rounded-full bg-pink-400 mr-2"></div>
                        <div className="h-2 w-20 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/5">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 shadow-lg mx-auto mb-4"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 rounded-full bg-purple-100 flex items-center px-2">
                        <div className="h-2 w-full bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="h-8 rounded-full bg-purple-100 flex items-center px-2">
                        <div className="h-2 w-full bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="h-8 rounded-full bg-purple-100 flex items-center px-2">
                        <div className="h-2 w-full bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="h-8 rounded-full bg-purple-100 flex items-center px-2">
                        <div className="h-2 w-full bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "professional":
        return (
          <div className={baseClass}>
            {/* Premiumlayout för företagsledare med sofistikerad design */}
            <div className="h-full w-full">
              <div className="h-24 bg-gradient-to-r from-blue-950 to-blue-900 p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-40 bg-white rounded-sm mb-1"></div>
                    <div className="h-3 w-28 bg-blue-300 rounded-sm"></div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/90 border-2 border-white shadow-lg"></div>
                </div>
                
                <div className="flex gap-5 mt-3 text-white">
                  <div className="h-2 w-24 bg-white/70 rounded-sm"></div>
                  <div className="h-2 w-24 bg-white/70 rounded-sm"></div>
                  <div className="h-2 w-24 bg-white/70 rounded-sm"></div>
                </div>
              </div>
              
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rotate-45 bg-blue-900"></div>
              
              <div className="flex mt-10">
                <div className="w-1/3 px-4 border-r border-gray-200">
                  <div className="mb-6">
                    <div className="h-4 w-24 bg-gray-800 mb-2 rounded-sm"></div>
                    <div className="w-full h-[1px] bg-red-800 mb-3"></div>
                    <div className="h-2 w-full bg-gray-200 mb-1 rounded-sm"></div>
                    <div className="h-2 w-full bg-gray-200 mb-1 rounded-sm"></div>
                    <div className="h-2 w-4/5 bg-gray-200 rounded-sm"></div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="h-4 w-24 bg-gray-800 mb-2 rounded-sm"></div>
                    <div className="w-full h-[1px] bg-red-800 mb-3"></div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="h-2 w-20 bg-gray-600 rounded-sm"></div>
                          <div className="h-2 w-10 bg-gray-400 rounded-sm"></div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full">
                          <div className="h-full w-4/5 bg-blue-800 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="h-2 w-24 bg-gray-600 rounded-sm"></div>
                          <div className="h-2 w-10 bg-gray-400 rounded-sm"></div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full">
                          <div className="h-full w-[90%] bg-blue-800 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-2/3 px-4">
                  <div className="mb-6">
                    <div className="h-4 w-32 bg-gray-800 mb-2 rounded-sm"></div>
                    <div className="w-full h-[1px] bg-red-800 mb-3"></div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <div className="h-3 w-40 bg-gray-700 rounded-sm"></div>
                        <div className="h-2 w-28 bg-red-800 rounded-sm"></div>
                      </div>
                      <div className="h-2 w-36 bg-blue-800 rounded-sm mb-1"></div>
                      <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <div className="h-3 w-44 bg-gray-700 rounded-sm"></div>
                        <div className="h-2 w-28 bg-red-800 rounded-sm"></div>
                      </div>
                      <div className="h-2 w-40 bg-blue-800 rounded-sm mb-1"></div>
                      <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default: // standard
        return (
          <div className={baseClass}>
            {/* Premium standard layout med rena linjer och professionell design */}
            <div className="h-full w-full bg-white p-6">
              <div className="flex items-center border-b border-gray-300 pb-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-700 to-blue-900 mr-4 shadow-sm"></div>
                <div>
                  <div className="h-5 w-40 bg-blue-900 rounded-sm mb-1"></div>
                  <div className="h-3 w-32 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              
              <div className="mb-5">
                <div className="h-3.5 w-28 bg-gray-800 font-bold mb-2 rounded-sm"></div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                  <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                  <div className="h-2 w-5/6 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              <div className="mb-5">
                <div className="h-3.5 w-28 bg-gray-800 font-bold mb-2 rounded-sm"></div>
                
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-28 bg-gray-700 rounded-sm"></div>
                    <div className="h-2 w-24 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="h-2 w-40 bg-blue-600 rounded-sm mb-2"></div>
                  <div className="h-2 w-5/6 bg-gray-200 rounded-sm"></div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-28 bg-gray-700 rounded-sm"></div>
                    <div className="h-2 w-24 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="h-2 w-36 bg-blue-600 rounded-sm mb-2"></div>
                  <div className="h-2 w-5/6 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              <div>
                <div className="h-3.5 w-28 bg-gray-800 font-bold mb-2 rounded-sm"></div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center h-8 border border-gray-300 rounded px-2">
                    <div className="h-2 w-full bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center h-8 border border-gray-300 rounded px-2">
                    <div className="h-2 w-full bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center h-8 border border-gray-300 rounded px-2">
                    <div className="h-2 w-full bg-gray-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className={`relative cursor-pointer border-2 transition-all duration-300 cv-template-hover ${isSelected ? "border-primary" : "border-border"}`}>
      <CardContent className="p-0 aspect-[210/297] relative overflow-hidden">
        {template.previewImage && !imageError ? (
          <Image
            src={template.previewImage}
            alt={template.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <Layout className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        <div className={`preview-fallback ${imageError || !template.previewImage ? "block" : "hidden"}`}>
          {generatePreviewBackground()}
        </div>
        
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
          <Badge variant="outline" className="mb-2">
            {getLayoutLabel(template.layout)}
          </Badge>
          <h3 className="font-medium text-lg">{template.name}</h3>
          <p className="text-sm text-muted-foreground mb-auto mt-2">{template.description}</p>
          <Button 
            variant={isSelected ? "default" : "outline"} 
            size="sm" 
            className="mt-2" 
            onClick={onSelect}
          >
            {isSelected ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Vald
              </>
            ) : "Välj mall"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-2 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-sm">{template.name}</h3>
        </div>
        {isSelected && (
          <Badge variant="secondary" className="ml-auto">
            <CheckIcon className="mr-1 h-3 w-3" />
            Aktiv
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
} 