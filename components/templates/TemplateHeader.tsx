import { FileText, PaintBrush } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface TemplateHeaderProps {
  title: string
  description?: string
  onCustomize?: () => void
  isPremium?: boolean
}

export function TemplateHeader({
  title,
  description,
  onCustomize,
  isPremium = false,
}: TemplateHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">{title}</h2>
          {isPremium && (
            <Badge variant="premium" className="ml-2">
              Premium
            </Badge>
          )}
        </div>
        {onCustomize && (
          <Button onClick={onCustomize} size="sm" variant="outline" className="flex items-center">
            <PaintBrush className="mr-2 h-4 w-4" />
            Anpassa utseende
          </Button>
        )}
      </div>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
      <Separator className="mt-4" />
    </div>
  )
} 