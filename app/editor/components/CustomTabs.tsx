"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

// Använd any för props för att kringgå typfel
export const CustomTabsContent: React.FC<any> = ({ className, children, ...props }) => (
  <TabsPrimitive.Content
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
)
CustomTabsContent.displayName = "CustomTabsContent" 