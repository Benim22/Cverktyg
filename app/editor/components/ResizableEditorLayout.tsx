"use client"

import { motion } from "framer-motion"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { A4CVPreview } from "@/components/A4CVPreview"
import { ReactNode } from "react"

interface ResizableEditorLayoutProps {
  children: ReactNode
  showSplitView: boolean
}

export function ResizableEditorLayout({ children, showSplitView }: ResizableEditorLayoutProps) {
  if (!showSplitView) {
    return (
      <motion.div 
        className="bg-card rounded-lg shadow-sm border p-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="min-h-[600px] rounded-lg border"
    >
      <ResizablePanel defaultSize={65} minSize={30} className="bg-card p-4">
        {children}
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={35} minSize={30} className="bg-card">
        <div className="h-full flex items-center justify-center overflow-hidden">
          <div className="preview-zoom-container p-4 h-full w-full flex items-center justify-center">
            <A4CVPreview className="editor-preview" />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
} 