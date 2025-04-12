"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  color: string
  onChange: (color: string) => void
  presetColors?: string[]
}

const DEFAULT_COLORS = [
  "#000000", "#ffffff", "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
  "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", 
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", 
  "#795548", "#607d8b"
]

export function ColorPicker({
  color,
  onChange,
  presetColors = DEFAULT_COLORS,
  className,
  ...props
}: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Uppdatera lokal färg när props ändras
  useEffect(() => {
    setLocalColor(color)
  }, [color])
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setLocalColor(newColor)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setLocalColor(newColor)
  }
  
  const handleBlur = () => {
    onChange(localColor)
  }
  
  const handlePresetClick = (presetColor: string) => {
    setLocalColor(presetColor)
    onChange(presetColor)
  }
  
  return (
    <div className="flex">
      <div 
        className={cn(
          "w-10 h-10 rounded-l-md border border-r-0 border-input flex items-center justify-center cursor-pointer",
          className
        )} 
        style={{ backgroundColor: localColor }}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="color" 
          value={localColor}
          onChange={handleColorChange}
          onBlur={handleBlur}
          className="sr-only"
          {...props}
        />
      </div>
      
      <Input
        type="text"
        value={localColor}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="rounded-none rounded-r-md w-28"
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="ml-2"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((presetColor) => (
              <Button
                key={presetColor}
                type="button"
                style={{ backgroundColor: presetColor }}
                className="h-8 w-8 rounded-md p-0 relative"
                onClick={() => handlePresetClick(presetColor)}
              >
                {presetColor === localColor && (
                  <Check className="h-4 w-4 text-white absolute" />
                )}
                <span className="sr-only">
                  Välj färg {presetColor}
                </span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 