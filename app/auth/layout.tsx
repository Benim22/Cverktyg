"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check, FileText, Star, Users } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Marketing Material (Left Side) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/80 to-primary p-10 text-white"
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-md bg-white">
                <Check className="absolute inset-0 h-full w-full p-2 text-primary" />
              </div>
              <span className="text-2xl font-bold">CVerktyg</span>
            </div>
            
            <h1 className="mt-10 text-4xl font-bold leading-tight">Skapa professionella CV:n som sticker ut</h1>
            <p className="mt-4 text-lg">Optimera din jobbsökning med hjälp av våra professionella mallar och kraftfulla verktyg.</p>
          </div>
          
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-white/20 p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Professionella mallar</h3>
                <p className="text-white/80">Välj bland våra 20+ branschanpassade CV-mallar</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-white/20 p-2">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI-assistans</h3>
                <p className="text-white/80">Få hjälp att skriva effektiva beskrivningar som imponerar</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-white/20 p-2">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Personligt stöd</h3>
                <p className="text-white/80">Få expertrådgivning och feedback på ditt CV</p>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-10">
            <p className="text-sm text-white/80">© 2024 CVerktyg. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </motion.div>
      
      {/* Auth Forms (Right Side) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10"
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>
    </div>
  )
} 