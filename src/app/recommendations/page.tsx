'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialStore } from '@/store/useFinancialStore'

export default function RecommendationsPage() {
  const { isDarkMode, profile } = useFinancialStore()

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
              Portfolio Recommendations
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-driven investment strategy and model portfolios
            </p>
          </div>

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Your Investment Profile</CardTitle>
                <CardDescription>
                  Optimized for {profile.riskProfile} risk tolerance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Model portfolio recommendations will appear here based on your financial goals,
                  risk profile, and current market conditions. Use intentions on the dashboard
                  to generate specific investment strategies.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Model Portfolios</CardTitle>
              <CardDescription>
                Low-cost, diversified index fund strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Portfolio construction engine coming soon. Will include:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Asset allocation optimization based on modern portfolio theory</li>
                <li>• Tax-efficient fund selection across account types</li>
                <li>• Automatic rebalancing suggestions with drift thresholds</li>
                <li>• Factor-based diversification strategies</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
