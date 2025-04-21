"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface PDFExportButtonProps {
  onClick: () => Promise<void> | void
  isExporting?: boolean
  label?: string
  className?: string
}

export function PDFExportButton({
  onClick,
  isExporting = false,
  label = "Exportera PDF",
  className = "",
}: PDFExportButtonProps) {
  return (
    <Button
      variant="default"
      size="default"
      onClick={onClick}
      disabled={isExporting}
      className={`w-full ${className}`}
    >
      <FileText className="mr-2 h-4 w-4" />
      {isExporting ? "Exporterar..." : label}
    </Button>
  )
} 