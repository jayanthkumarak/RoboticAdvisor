'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { AssetAllocationChart } from '@/components/charts/AssetAllocationChart'
import { Trophy, Target, TrendingUp } from 'lucide-react'

interface BucketConfig {
  name: string
  years: number
  allocation: { equity: number; debt: number; gold: number }
  expectedReturn: number
}

export function BucketStrategySimulator() {
  const [retirementCorpus, setRetirementCorpus] = useState(10000000)
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000)
  const [inflationRate, setInflationRate] = useState(6)
  
  const [buckets, setBuckets] = useState<BucketConfig[]>([
    {
      name: 'Bucket 1 (Liquid)',
      years: 3,
      allocation: { equity: 10, debt: 85, gold: 5 },
      expectedReturn: 7,
    },
    {
      name: 'Bucket 2 (Medium Term)',
      years: 7,
      allocation: { equity: 40, debt: 50, gold: 10 },
      expectedReturn: 9,
    },
    {
      name: 'Bucket 3 (Long Term)',
      years: 15,
      allocation: { equity: 75, debt: 20, gold: 5 },
      expectedReturn: 11,
    },
  ])

  const [simulationResults, setSimulationResults] = useState<{
    bucket1Amount: number
    bucket2Amount: number
    bucket3Amount: number
    totalYears: number
    corpusLastingYears: number
  } | null>(null)

  const calculateBucketAllocation = () => {
    const totalYears = buckets.reduce((sum, bucket) => sum + bucket.years, 0)
    const annualExpenses = monthlyExpenses * 12
    
    // Calculate present value of expenses for each bucket
    let bucket1Amount = 0
    let bucket2Amount = 0
    let bucket3Amount = 0
    
    // Bucket 1: Liquid funds (Years 1-3)
    for (let year = 1; year <= buckets[0].years; year++) {
      bucket1Amount += annualExpenses * Math.pow(1 + inflationRate / 100, year - 1)
    }
    
    // Bucket 2: Medium term (Years 4-10)
    let startYear = buckets[0].years + 1
    for (let year = startYear; year < startYear + buckets[1].years; year++) {
      const futureExpense = annualExpenses * Math.pow(1 + inflationRate / 100, year - 1)
      const presentValue = futureExpense / Math.pow(1 + buckets[1].expectedReturn / 100, year - startYear)
      bucket2Amount += presentValue
    }
    
    // Bucket 3: Long term (Remaining years)
    startYear = buckets[0].years + buckets[1].years + 1
    for (let year = startYear; year < startYear + buckets[2].years; year++) {
      const futureExpense = annualExpenses * Math.pow(1 + inflationRate / 100, year - 1)
      const presentValue = futureExpense / Math.pow(1 + buckets[2].expectedReturn / 100, year - startYear)
      bucket3Amount += presentValue
    }
    
    const totalRequired = bucket1Amount + bucket2Amount + bucket3Amount
    
    // Scale to fit actual corpus
    const scaleFactor = retirementCorpus / totalRequired
    bucket1Amount *= scaleFactor
    bucket2Amount *= scaleFactor
    bucket3Amount *= scaleFactor
    
    // Calculate how long corpus will last
    let remainingCorpus = retirementCorpus
    let corpusLastingYears = 0
    
    for (let year = 1; year <= 50; year++) {
      const yearlyExpense = annualExpenses * Math.pow(1 + inflationRate / 100, year - 1)
      remainingCorpus -= yearlyExpense
      
      if (remainingCorpus > 0) {
        // Apply growth on remaining corpus
        let growthRate = 7 // Default conservative
        if (year <= buckets[0].years) growthRate = buckets[0].expectedReturn
        else if (year <= buckets[0].years + buckets[1].years) growthRate = buckets[1].expectedReturn
        else growthRate = buckets[2].expectedReturn
        
        remainingCorpus *= (1 + growthRate / 100)
        corpusLastingYears = year
      } else {
        break
      }
    }
    
    setSimulationResults({
      bucket1Amount,
      bucket2Amount,
      bucket3Amount,
      totalYears,
      corpusLastingYears,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Bucket Strategy Simulator</CardTitle>
              <CardDescription>
                Plan your retirement corpus management with a bucket-based approach
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="corpus">Retirement Corpus</Label>
              <Input
                id="corpus"
                type="number"
                value={retirementCorpus}
                onChange={(e) => setRetirementCorpus(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Monthly Expenses</Label>
              <Input
                id="expenses"
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Expected Inflation Rate</Label>
              <span className="text-sm text-muted-foreground">{inflationRate}%</span>
            </div>
            <Slider
              value={[inflationRate]}
              onValueChange={(value) => setInflationRate(value[0])}
              min={3}
              max={10}
              step={0.5}
            />
          </div>

          <Button onClick={calculateBucketAllocation} className="w-full" size="lg">
            Calculate Bucket Allocation
          </Button>
        </CardContent>
      </Card>

      {simulationResults && (
        <>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Bucket Allocation Results</CardTitle>
              <CardDescription>
                Recommended distribution across three buckets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <p className="font-medium">Bucket 1</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(simulationResults.bucket1Amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((simulationResults.bucket1Amount / retirementCorpus) * 100).toFixed(1)}%
                    of corpus
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <p className="font-medium">Bucket 2</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(simulationResults.bucket2Amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((simulationResults.bucket2Amount / retirementCorpus) * 100).toFixed(1)}%
                    of corpus
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <p className="font-medium">Bucket 3</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(simulationResults.bucket3Amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((simulationResults.bucket3Amount / retirementCorpus) * 100).toFixed(1)}%
                    of corpus
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="font-medium text-success-foreground">
                  Your corpus will last approximately {simulationResults.corpusLastingYears} years
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your expenses and the bucket strategy growth assumptions
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="bucket1" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bucket1">Bucket 1</TabsTrigger>
              <TabsTrigger value="bucket2">Bucket 2</TabsTrigger>
              <TabsTrigger value="bucket3">Bucket 3</TabsTrigger>
            </TabsList>

            {buckets.map((bucket, index) => (
              <TabsContent key={index} value={`bucket${index + 1}`} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{bucket.name}</CardTitle>
                    <CardDescription>
                      Duration: {bucket.years} years | Expected Return: {formatPercentage(bucket.expectedReturn)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetAllocationChart allocation={bucket.allocation} />
                    
                    <div className="mt-6 space-y-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <h4 className="font-semibold mb-1">Strategy</h4>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 && 'Focus on liquidity and capital preservation. Funds for immediate expenses.'}
                          {index === 1 && 'Balanced approach with moderate growth. Replenishes Bucket 1 annually.'}
                          {index === 2 && 'Aggressive growth to maximize long-term returns. Provides sustainable income.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-muted">
                        <h4 className="font-semibold mb-1">Rebalancing</h4>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 && 'Refill annually from Bucket 2. Keep in liquid funds and short-term debt.'}
                          {index === 1 && 'Refill every 3 years from Bucket 3. Maintain balanced allocation.'}
                          {index === 2 && 'No withdrawals for first 10 years. Maximum equity exposure for growth.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
