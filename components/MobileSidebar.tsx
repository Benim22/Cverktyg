"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { User, FileText, Layout, Settings, HelpCircle, Home, Menu, LayoutTemplate, Users, BarChart, Info, Zap, DollarSign, BookOpen } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"

type Stats = {
  cvCount: number
  templateCount: number
  userCount: number
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({ cvCount: 0, templateCount: 0, userCount: 0 })
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const { theme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchStats = async () => {
      // Hämta statistik från databasen
      let cvCountData;
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Om användaren är inloggad, visa endast deras egna CV:n
        const { data, count, error } = await supabase
          .from('cvs')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
        
        if (!error) {
          cvCountData = count || 0
        }
      } else {
        // Om inte inloggad, visa total antal CV:n i systemet
        const { count, error } = await supabase
          .from('cvs')
          .select('id', { count: 'exact', head: true })
        
        if (!error) {
          cvCountData = count || 0
        }
      }
      
      const { count: templateCount, error: templateError } = await supabase
        .from('templates')
        .select('id', { count: 'exact', head: true })
      
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      setStats({
        cvCount: cvCountData || 0,
        templateCount: templateCount || 0,
        userCount: userCount || 0
      })
    }

    getUser()
    fetchStats()
  }, [open]) // Uppdatera när användaren öppnar sidebaren

  const menuItemClass = "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
  const activeItemClass = "bg-accent/80 font-medium"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            size="icon" 
            className="flex items-center justify-center md:hidden h-9 w-9 bg-background border border-accent/20 hover:bg-accent/10 hover:border-accent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Öppna meny</span>
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
        <SheetHeader className="p-4 py-6 text-left">
          <SheetTitle>
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <motion.div
                whileHover={{ 
                  rotate: 10, 
                  scale: 1.1,
                  boxShadow: theme === "dark" ? "0 0 12px 2px var(--primary)" : "none"
                }}
                transition={{ duration: 0.2 }}
                className="relative h-8 w-8 overflow-hidden rounded-md bg-primary"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="absolute inset-0 h-full w-full p-1.5 text-white"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>
              <span className="text-lg font-bold">CVerktyg</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] pb-8">
          <div className="flex flex-col gap-4 p-4">
            <nav className="flex flex-col gap-1">
              <Link href="/" onClick={() => setOpen(false)} className={menuItemClass}>
                <Home size={16} />
                <span>Hem</span>
              </Link>
              
              {user && (
                <>
                  <Link href="/templates/all" onClick={() => setOpen(false)} className={menuItemClass}>
                    <LayoutTemplate size={16} />
                    <span>CV-mallar</span>
                  </Link>
                </>
              )}
              
              
              <Link href="/about" onClick={() => setOpen(false)} className={menuItemClass}>
                <Info size={16} />
                <span>Om oss</span>
              </Link>
              <Link href="/features" onClick={() => setOpen(false)} className={menuItemClass}>
                <Zap size={16} />
                <span>Funktioner</span>
              </Link>
              <Link href="/pricing" onClick={() => setOpen(false)} className={menuItemClass}>
                <DollarSign size={16} />
                <span>Priser</span>
              </Link>
              <Link href="/resources" onClick={() => setOpen(false)} className={menuItemClass}>
                <BookOpen size={16} />
                <span>Resurser</span>
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className={menuItemClass}>
                <Settings size={16} />
                <span>Inställningar</span>
              </Link>
              <Link href="/help" onClick={() => setOpen(false)} className={menuItemClass}>
                <HelpCircle size={16} />
                <span>Hjälp</span>
              </Link>
            </nav>

            <Separator className="my-2" />

            <div className="text-sm font-medium">Statistik</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-col rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Skapade CV</div>
                  <div className="text-xl font-bold">{stats.cvCount}</div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Tillgängliga mallar</div>
                  <div className="text-xl font-bold">{stats.templateCount}</div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Användare</div>
                  <div className="text-xl font-bold">{stats.userCount}</div>
                </div>
              </div>
            </div>

            {user && (
              <>
                <Separator className="my-2" />
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate max-w-[180px]">
                        {user?.user_metadata?.first_name || user?.email}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 