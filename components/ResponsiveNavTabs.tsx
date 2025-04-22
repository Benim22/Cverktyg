"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type TabItem = {
  value: string
  icon: React.ReactNode
  label: string
  content: React.ReactNode
}

type ResponsiveNavTabsProps = {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (value: string) => void
  iconOnly?: boolean
}

export function ResponsiveNavTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  iconOnly = false 
}: ResponsiveNavTabsProps) {
  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className={cn("grid w-full", `grid-cols-${tabs.length}`)}>
          {tabs.map((tab) => (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value={tab.value} 
                  className="flex items-center justify-center"
                >
                  <div className="flex-shrink-0">{tab.icon}</div>
                  <span className={
                    iconOnly 
                      ? "hidden" 
                      : "hidden xs:inline-block sm:inline-block sm:ml-2"
                  }>
                    {tab.label}
                  </span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={iconOnly ? "" : "xs:hidden sm:hidden"}>
                {tab.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </TooltipProvider>
  )
} 