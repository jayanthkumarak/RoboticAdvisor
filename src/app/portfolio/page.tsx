'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AssetAllocationChart } from '@/components/charts/AssetAllocationChart'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { useFinancialStore } from '@/store/useFinancialStore'
import { CashFlowProjection } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function PortfolioPage() {
  const { isDarkMode, retirementPlan, goals } = useFinancialStore()
  const [cashFlowData, setCashFlowData] = useState<CashFlowProjection[]>([])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Generate cash flow projections
    if (retirementPlan) {
      const projections: CashFlowProjection[] = []
      const currentYear = new Date().getFullYear()
      const yearsToProject = retirementPlan.retirementAge - retirementPlan.currentAge + 20

      let portfolioValue = retirementPlan.currentSavings

      for (let i = 0; i <= yearsToProject; i++) {
        const age = retirementPlan.currentAge + i
        const year = currentYear + i
        const isRetired = age >= retirementPlan.retirementAge

        const income = isRetired ? 0 : retirementPlan.monthlyInvestment * 12
        const expenses = retirementPlan.currentMonthlyExpenses * 12 * 
          Math.pow(1 + retirementPlan.inflationRate / 100, i)
        const investment = isRetired ? 0 : income
        
        // Calculate portfolio growth
        portfolioValue = portfolioValue * (1 + retirementPlan.expectedReturn / 100)
        
        if (!isRetired) {
          portfolioValue += investment
        } else {
          portfolioValue -= expenses
        }

        projections.push({
          year,
          age,
          income,
          expenses,
          investment,
          portfolioValue: Math.max(0, portfolioValue),
          inflationAdjustedExpenses: expenses,
        })
      }

      setCashFlowData(projections)
    }
  }, [retirementPlan])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Portfolio Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize your asset allocation and cash flow projections
            </p>
          </div>

          {!retirementPlan ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Create a retirement plan first to see your portfolio analysis
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="allocation" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="allocation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>
                      Your current portfolio allocation strategy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetAllocationChart allocation={retirementPlan.assetAllocation} />
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Equity</CardTitle>
                      <CardDescription>High growth potential</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {retirementPlan.assetAllocation.equity}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Expected return: 12-15% p.a.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Debt</CardTitle>
                      <CardDescription>Stable income</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {retirementPlan.assetAllocation.debt}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Expected return: 6-8% p.a.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Gold</CardTitle>
                      <CardDescription>Hedge & diversification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {retirementPlan.assetAllocation.gold}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Expected return: 8-10% p.a.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cashflow" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Flow Projection</CardTitle>
                    <CardDescription>
                      Projected portfolio value and cash flows over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cashFlowData.length > 0 && <CashFlowChart data={cashFlowData} />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Milestones</CardTitle>
                    <CardDescription>
                      Important financial milestones in your journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Retirement</p>
                          <p className="text-sm text-muted-foreground">
                            Age {retirementPlan.retirementAge}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(retirementPlan.projectedCorpus)}
                          </p>
                          <p className="text-sm text-muted-foreground">Projected corpus</p>
                        </div>
                      </div>

                      {goals.slice(0, 3).map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{goal.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Year {goal.targetYear}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(goal.targetAmount)}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {goal.priority} priority
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Position</CardTitle>
                      <CardDescription>Your financial snapshot today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Savings</span>
                        <span className="font-medium">
                          {formatCurrency(retirementPlan.currentSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Investment</span>
                        <span className="font-medium">
                          {formatCurrency(retirementPlan.monthlyInvestment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Age</span>
                        <span className="font-medium">{retirementPlan.currentAge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Years to Retirement</span>
                        <span className="font-medium">
                          {retirementPlan.retirementAge - retirementPlan.currentAge}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Retirement Target</CardTitle>
                      <CardDescription>Your retirement goals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Corpus</span>
                        <span className="font-medium">
                          {formatCurrency(retirementPlan.retirementCorpusNeeded)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projected Corpus</span>
                        <span className="font-medium">
                          {formatCurrency(retirementPlan.projectedCorpus)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shortfall/Surplus</span>
                        <span
                          className={`font-medium ${
                            retirementPlan.shortfall > 0
                              ? 'text-destructive'
                              : 'text-success'
                          }`}
                        >
                          {formatCurrency(Math.abs(retirementPlan.shortfall))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Return</span>
                        <span className="font-medium">
                          {retirementPlan.expectedReturn}% p.a.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Goals Summary</CardTitle>
                    <CardDescription>
                      Overview of all your financial goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-3xl font-bold text-primary">
                          {goals.length}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-3xl font-bold text-success">
                          {goals.filter((g) => g.status === 'active').length}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Active</p>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="text-3xl font-bold text-warning">
                          {goals.filter((g) => g.status === 'planning').length}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Planning</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
