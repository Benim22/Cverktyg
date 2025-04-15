"use client"

import React, { useEffect, useState } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, FileText, HelpCircle, Layout, LogOut, Moon, Settings, Sun, User } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  ListItem,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { MobileSidebar } from "@/components/MobileSidebar"

// Skapa en anpassad navigationslänkstil med förbättrad hover-effekt som fungerar bra i både light och dark mode
const customNavLinkStyle = cn(
  navigationMenuTriggerStyle(),
  "transition-all hover:bg-accent/40 dark:hover:text-white dark:hover:bg-accent/60 dark:hover:shadow-[0_0_8px_var(--accent)]"
)

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
      
      // Lyssna på auth-statusändringar
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null)
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    getUser()
  }, [supabase])

  const handleSignIn = async () => {
    router.push('/auth/signin')
  }

  const handleSignUp = async () => {
    router.push('/auth/signup')
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-6">
          <MobileSidebar />
          
          <Link href="/" className="flex items-center gap-1 md:gap-2">
            <motion.div
              whileHover={{ 
                rotate: 10, 
                scale: 1.1,
                boxShadow: theme === "dark" ? "0 0 12px 2px var(--primary)" : "none"
              }}
              transition={{ duration: 0.2 }}
              className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-md bg-primary"
            >
              <Check className="absolute inset-0 h-full w-full p-2 text-white" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-2xl font-bold"
            >
              CVerktyg
            </motion.span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="transition-all hover:bg-accent/40 dark:hover:text-white dark:hover:bg-accent/60 dark:hover:shadow-[0_0_8px_var(--accent)]">Om CVerktyg</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                          href="/about"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">CVerktyg</div>
                          <p className="text-sm leading-tight text-white/90">
                            Skapa professionella CV:n enkelt och snabbt med vårt kraftfulla verktyg.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/features" title="Funktioner">
                      Utforska alla funktioner som CVerktyg erbjuder.
                    </ListItem>
                    <ListItem href="/pricing" title="Priser">
                      Se våra prisplaner och välj den som passar dig bäst.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/templates/all" legacyBehavior passHref>
                  <NavigationMenuLink className={customNavLinkStyle}>CV-mallar</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="transition-all hover:bg-accent/40 dark:hover:text-white dark:hover:bg-accent/60 dark:hover:shadow-[0_0_8px_var(--accent)]">Resurser</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/resources/tips" title="CV-tips">
                      Expertråd för att skapa ett imponerande CV.
                    </ListItem>
                    <ListItem href="/resources/guide" title="Guide">
                      Steg-för-steg-guide för att skapa ditt CV.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className={customNavLinkStyle}>Mina CV:n</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ 
              scale: 1.1, 
              rotate: theme === "dark" ? [0, -10, 10, -5, 0] : 0
            }} 
            transition={{ 
              duration: 0.3,
              rotate: { repeat: 0, duration: 0.5 }
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Toggle
              aria-label="Toggle theme"
              className="mr-2"
              pressed={theme === "dark"}
              onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Toggle>
          </motion.div>

          <Link href="/help" className="hidden md:flex">
            <motion.div 
              whileHover={{ 
                rotate: 15, 
                scale: 1.1,
                filter: theme === "dark" ? "drop-shadow(0 0 4px var(--accent))" : "none" 
              }} 
              whileTap={{ scale: 0.9 }}
            >
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>

          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: theme === "dark" ? "0 0 8px var(--primary)" : "none" 
                  }}
                >
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.user_metadata?.first_name || user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mitt konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Mina CV:n
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/editor/new" className="flex items-center">
                    <Layout className="mr-2 h-4 w-4" />
                    Skapa nytt CV
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Inställningar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: theme === "dark" ? "0 0 8px var(--border)" : "none" 
                }}
              >
                <AnimatedButton variant="outline" onClick={handleSignIn} className="hidden sm:flex">
                  Logga in
                </AnimatedButton>
              </motion.div>
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: theme === "dark" ? "0 0 12px var(--primary)" : "none" 
                }}
              >
                <AnimatedButton onClick={handleSignUp}>Kom igång</AnimatedButton>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

