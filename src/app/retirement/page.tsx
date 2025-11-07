'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RetirementCalculator } from '@/components/calculators/RetirementCalculator'
import { useFinancialStore } from '@/store/useFinancialStore'

export default function RetirementPage() {
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
              Retirement Planning
            </h1>
            <p className="text-muted-foreground mt-2">
              Calculate your retirement corpus and plan for a comfortable retirement
            </p>
          </div>

          <RetirementCalculator />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
