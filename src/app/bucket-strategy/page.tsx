'use client'

import React, { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BucketStrategySimulator } from '@/components/calculators/BucketStrategySimulator'
import { useFinancialStore } from '@/store/useFinancialStore'

export default function BucketStrategyPage() {
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bucket Strategy Simulator
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your retirement corpus with a proven bucket-based withdrawal strategy
            </p>
          </div>

          <BucketStrategySimulator />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
