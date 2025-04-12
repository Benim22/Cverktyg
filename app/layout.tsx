import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "CVerktyg - Skapa professionella CV:n enkelt",
  description: "Skapa, redigera och exportera professionella CV:n med CVerktyg",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SubscriptionProvider>
            <main className="min-h-screen bg-background">{children}</main>
            <Toaster position="top-right" />
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}