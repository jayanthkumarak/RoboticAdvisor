'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CoastFIRECalculator } from '@/components/calculators/CoastFIRECalculator'
import { useFinancialStore } from '@/store/useFinancialStore'

export default function CoastFIREPage() {
  const { isDarkMode } = useFinancialStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Coast FIRE Calculator
            </h1>
            <p className="text-muted-foreground mt-2">
              Find out when you can stop saving and let compound interest work for you
            </p>
          </div>

          <CoastFIRECalculator />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
