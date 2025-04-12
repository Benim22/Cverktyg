"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AnimatedButton } from "@/components/animations/AnimatedButton"
import { Loader2 } from "lucide-react"

interface CTAButtonProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function CTAButton({ 
  children, 
  className,
  size = "default",
  variant = "default"
}: CTAButtonProps) {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoggedIn(!!session)
      } catch (error) {
        console.error("Fel vid kontroll av inloggningsstatus:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [supabase])

  const handleClick = () => {
    if (isLoggedIn) {
      // Om användaren är inloggad, skicka till CV-editorn
      router.push("/editor/new")
    } else {
      // Om användaren inte är inloggad, skicka till inloggningssidan
      router.push("/auth/signin?redirect=/editor/new")
    }
  }

  if (loading) {
    return (
      <AnimatedButton 
        size={size}
        variant={variant}
        className={className}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {children}
      </AnimatedButton>
    )
  }

  return (
    <AnimatedButton 
      onClick={handleClick}
      size={size}
      variant={variant}
      className={className}
    >
      {children}
    </AnimatedButton>
  )
} 