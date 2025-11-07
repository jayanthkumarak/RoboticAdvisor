'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinancialStore } from '@/store/useFinancialStore'
import { MutualFund, RiskProfile } from '@/types'
import { TrendingUp, Shield, Zap, Star } from 'lucide-react'

export default function RecommendationsPage() {
  const { isDarkMode, profile, retirementPlan } = useFinancialStore()
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Sample mutual fund data
    const sampleFunds: MutualFund[] = [
      {
        id: '1',
        name: 'ICICI Prudential Bluechip Fund',
        category: 'Large Cap Equity',
        amc: 'ICICI Prudential',
        aum: 45000,
        expenseRatio: 1.05,
        minInvestment: 5000,
        returns: { oneYear: 18.5, threeYear: 15.2, fiveYear: 14.8 },
        riskLevel: 'aggressive',
        exitLoad: '1% if redeemed within 1 year',
      },
      {
        id: '2',
        name: 'HDFC Balanced Advantage Fund',
        category: 'Hybrid Balanced',
        amc: 'HDFC Mutual Fund',
        aum: 52000,
        expenseRatio: 0.92,
        minInvestment: 5000,
        returns: { oneYear: 12.5, threeYear: 11.8, fiveYear: 10.5 },
        riskLevel: 'balanced',
        exitLoad: '1% if redeemed within 1 year',
      },
      {
        id: '3',
        name: 'SBI Corporate Bond Fund',
        category: 'Debt - Corporate Bond',
        amc: 'SBI Mutual Fund',
        aum: 8500,
        expenseRatio: 0.45,
        minInvestment: 5000,
        returns: { oneYear: 7.2, threeYear: 7.5, fiveYear: 7.8 },
        riskLevel: 'conservative',
        exitLoad: 'Nil',
      },
      {
        id: '4',
        name: 'Axis Midcap Fund',
        category: 'Mid Cap Equity',
        amc: 'Axis Mutual Fund',
        aum: 28000,
        expenseRatio: 0.87,
        minInvestment: 5000,
        returns: { oneYear: 22.5, threeYear: 18.2, fiveYear: 16.5 },
        riskLevel: 'very-aggressive',
        exitLoad: '1% if redeemed within 1 year',
      },
      {
        id: '5',
        name: 'Kotak Equity Opportunities Fund',
        category: 'Multi Cap Equity',
        amc: 'Kotak Mahindra',
        aum: 21000,
        expenseRatio: 0.95,
        minInvestment: 5000,
        returns: { oneYear: 19.5, threeYear: 16.8, fiveYear: 15.2 },
        riskLevel: 'aggressive',
        exitLoad: '1% if redeemed within 1 year',
      },
      {
        id: '6',
        name: 'UTI Liquid Fund',
        category: 'Debt - Liquid',
        amc: 'UTI Mutual Fund',
        aum: 15000,
        expenseRatio: 0.22,
        minInvestment: 1000,
        returns: { oneYear: 5.5, threeYear: 5.8, fiveYear: 6.0 },
        riskLevel: 'conservative',
        exitLoad: 'Nil',
      },
    ]
    setMutualFunds(sampleFunds as any)
  }, [])

  const getRecommendedFunds = (riskProfile: RiskProfile | undefined) => {
    if (!riskProfile) return mutualFunds.slice(0, 3)
    
    return mutualFunds.filter(fund => fund.riskLevel === riskProfile)
  }

  const recommendedFunds = getRecommendedFunds(profile?.riskProfile)
  const equityFunds = mutualFunds.filter(f => f.category.includes('Equity'))
  const debtFunds = mutualFunds.filter(f => f.category.includes('Debt'))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Investment Recommendations
            </h1>
            <p className="text-muted-foreground mt-2">
              Personalized mutual fund recommendations based on your profile
            </p>
          </div>

          {profile && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Your Investment Profile</CardTitle>
                <CardDescription>
                  Recommendations tailored for {profile.riskProfile} risk profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Profile</p>
                    <p className="font-medium capitalize">{profile.riskProfile}</p>
                  </div>
                  {retirementPlan && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Equity Allocation</p>
                        <p className="font-medium">{retirementPlan.assetAllocation.equity}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Debt Allocation</p>
                        <p className="font-medium">{retirementPlan.assetAllocation.debt}%</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="recommended" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="equity">Equity Funds</TabsTrigger>
              <TabsTrigger value="debt">Debt Funds</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {recommendedFunds.map((fund) => (
                  <Card key={fund.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{fund.name}</CardTitle>
                          <CardDescription>{fund.category}</CardDescription>
                        </div>
                        <Star className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">AMC</p>
                          <p className="font-medium">{fund.amc}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">AUM</p>
                          <p className="font-medium">₹{fund.aum} Cr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">1Y Return</p>
                          <p className="font-medium text-success">{fund.returns.oneYear}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">3Y Return</p>
                          <p className="font-medium text-success">{fund.returns.threeYear}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">5Y Return</p>
                          <p className="font-medium text-success">{fund.returns.fiveYear}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expense Ratio</p>
                          <p className="font-medium">{fund.expenseRatio}%</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="equity" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {equityFunds.map((fund) => (
                  <Card key={fund.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{fund.name}</CardTitle>
                          <CardDescription>{fund.category}</CardDescription>
                        </div>
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">AMC</p>
                          <p className="font-medium">{fund.amc}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">AUM</p>
                          <p className="font-medium">₹{fund.aum} Cr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">1Y Return</p>
                          <p className="font-medium text-success">{fund.returns.oneYear}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">3Y Return</p>
                          <p className="font-medium text-success">{fund.returns.threeYear}%</p>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="debt" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {debtFunds.map((fund) => (
                  <Card key={fund.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{fund.name}</CardTitle>
                          <CardDescription>{fund.category}</CardDescription>
                        </div>
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">AMC</p>
                          <p className="font-medium">{fund.amc}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">AUM</p>
                          <p className="font-medium">₹{fund.aum} Cr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">1Y Return</p>
                          <p className="font-medium text-success">{fund.returns.oneYear}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expense Ratio</p>
                          <p className="font-medium">{fund.expenseRatio}%</p>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Important Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Past performance is not indicative of future returns. Mutual fund investments are subject to market risks.
              </p>
              <p>
                • Please read all scheme-related documents carefully before investing.
              </p>
              <p>
                • The recommendations are based on your risk profile and should be reviewed periodically.
              </p>
              <p>
                • Consult with a certified financial planner before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
