"use client"

import { AppLayout } from "@/components/layout/AppLayout"

export default function TestFooterPage() {
  return (
    <AppLayout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold mb-4">Testsida för Footer</h1>
        <p className="mb-8">Denna sida är skapad för att testa att footern visas korrekt.</p>
        <div className="p-4 bg-muted rounded-lg mb-4">
          <p>Footer bör visas under denna text, nedanför på sidan.</p>
        </div>
        
        {/* Extra innehåll för att göra sidan tillräckligt hög för att testa scrollning */}
        <div className="border p-4 rounded-lg my-8">
          <h2 className="text-xl font-bold mb-2">Testinnehåll för att skapa höjd</h2>
          <p>Nedan är platshållarinnehåll för att skapa en längre sida:</p>
        </div>
        
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="my-8 p-4 border rounded-lg">
            <h3 className="font-bold">Testsektion {i + 1}</h3>
            <p>Detta är platshållarinnehåll för att göra sidan längre och testa att footern syns efter scrollning.</p>
          </div>
        ))}
        
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg my-8">
          <p className="font-bold">Footer ska visas efter detta innehåll!</p>
        </div>
      </div>
    </AppLayout>
  )
} 