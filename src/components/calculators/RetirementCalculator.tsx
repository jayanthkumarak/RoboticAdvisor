'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calculateRetirementCorpus, formatCurrency, calculateFutureValue } from '@/lib/utils'
import {
  AGE_LIMITS,
  RETIREMENT_AGE_LIMITS,
  LIFE_EXPECTANCY_DEFAULT,
  INFLATION_RATE_DEFAULT,
  EXPECTED_RETURN,
} from '@/lib/constants'
import { useFinancialStore } from '@/store/useFinancialStore'
import { RetirementPlan } from '@/types'

export function RetirementCalculator() {
  const { profile, setRetirementPlan } = useFinancialStore()
  
  const [currentAge, setCurrentAge] = useState(profile?.age || 30)
  const [retirementAge, setRetirementAge] = useState(60)
  const [lifeExpectancy, setLifeExpectancy] = useState(LIFE_EXPECTANCY_DEFAULT)
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(50000)
  const [currentSavings, setCurrentSavings] = useState(1000000)
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000)
  const [inflationRate, setInflationRate] = useState(INFLATION_RATE_DEFAULT)
  const [expectedReturn, setExpectedReturn] = useState(EXPECTED_RETURN.BALANCED)
  const [retirementType, setRetirementType] = useState<'normal' | 'early' | 'late'>('normal')
  
  const [result, setResult] = useState<{
    corpusNeeded: number
    projectedCorpus: number
    shortfall: number
    monthlyExpensesAtRetirement: number
  } | null>(null)

  const handleCalculate = () => {
    const yearsToRetirement = retirementAge - currentAge
    
    // Calculate corpus needed at retirement
    const corpusNeeded = calculateRetirementCorpus(
      currentAge,
      retirementAge,
      currentMonthlyExpenses,
      inflationRate,
      expectedReturn,
      lifeExpectancy
    )
    
    // Calculate projected corpus
    const futureValueOfCurrentSavings = currentSavings * Math.pow(
      1 + expectedReturn / 100,
      yearsToRetirement
    )
    
    const futureValueOfInvestments = calculateFutureValue(
      monthlyInvestment,
      expectedReturn,
      yearsToRetirement
    )
    
    const projectedCorpus = futureValueOfCurrentSavings + futureValueOfInvestments
    const shortfall = corpusNeeded - projectedCorpus
    
    // Calculate monthly expenses at retirement
    const monthlyExpensesAtRetirement =
      currentMonthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement)
    
    setResult({
      corpusNeeded,
      projectedCorpus,
      shortfall,
      monthlyExpensesAtRetirement,
    })
    
    // Save to store
    const plan: RetirementPlan = {
      id: crypto.randomUUID(),
      userId: profile?.id || 'temp',
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentMonthlyExpenses,
      currentSavings,
      monthlyInvestment,
      inflationRate,
      expectedReturn,
      retirementCorpusNeeded: corpusNeeded,
      projectedCorpus,
      shortfall,
      assetAllocation: { equity: 60, debt: 30, gold: 10 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    setRetirementPlan(plan)
  }

  const handleRetirementTypeChange = (type: 'normal' | 'early' | 'late') => {
    setRetirementType(type)
    if (type === 'early') {
      setRetirementAge(Math.max(currentAge + 10, 50))
    } else if (type === 'late') {
      setRetirementAge(65)
    } else {
      setRetirementAge(60)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Retirement Planning Calculator</CardTitle>
          <CardDescription>
            Plan for your retirement with detailed projections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Retirement Type */}
          <div className="space-y-2">
            <Label>Retirement Type</Label>
            <Select
              value={retirementType}
              onValueChange={(value) => handleRetirementTypeChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early">Early Retirement (50-55)</SelectItem>
                <SelectItem value="normal">Normal Retirement (60)</SelectItem>
                <SelectItem value="late">Late Retirement (65+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Age */}
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                min={AGE_LIMITS.MIN}
                max={AGE_LIMITS.MAX}
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
              />
            </div>

            {/* Retirement Age */}
            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                min={RETIREMENT_AGE_LIMITS.MIN}
                max={RETIREMENT_AGE_LIMITS.MAX}
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
              />
            </div>

            {/* Life Expectancy */}
            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
              <Input
                id="lifeExpectancy"
                type="number"
                min={retirementAge + 5}
                max={100}
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              />
            </div>

            {/* Current Monthly Expenses */}
            <div className="space-y-2">
              <Label htmlFor="expenses">Current Monthly Expenses</Label>
              <Input
                id="expenses"
                type="number"
                value={currentMonthlyExpenses}
                onChange={(e) => setCurrentMonthlyExpenses(Number(e.target.value))}
              />
            </div>

            {/* Current Savings */}
            <div className="space-y-2">
              <Label htmlFor="savings">Current Savings/Corpus</Label>
              <Input
                id="savings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
            </div>

            {/* Monthly Investment */}
            <div className="space-y-2">
              <Label htmlFor="investment">Monthly Investment</Label>
              <Input
                id="investment"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Inflation Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Expected Inflation Rate</Label>
              <span className="text-sm text-muted-foreground">{inflationRate}%</span>
            </div>
            <Slider
              value={[inflationRate]}
              onValueChange={(value) => setInflationRate(value[0])}
              min={3}
              max={12}
              step={0.5}
            />
          </div>

          {/* Expected Return Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Expected Return on Investment</Label>
              <span className="text-sm text-muted-foreground">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={(value) => setExpectedReturn(value[0])}
              min={5}
              max={15}
              step={0.5}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full" size="lg">
            Calculate Retirement Plan
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Your Retirement Plan Results</CardTitle>
            <CardDescription>
              Based on your inputs and assumptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Corpus Needed</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.corpusNeeded)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Projected Corpus</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.projectedCorpus)}
                </p>
              </div>

              <div
                className={`space-y-2 p-4 rounded-lg border ${
                  result.shortfall > 0 ? 'bg-destructive/10' : 'bg-success/10'
                }`}
              >
                <p className="text-sm text-muted-foreground">
                  {result.shortfall > 0 ? 'Shortfall' : 'Surplus'}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.abs(result.shortfall))}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">
                  Monthly Expenses at Retirement
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.monthlyExpensesAtRetirement)}
                </p>
              </div>
            </div>

            {result.shortfall > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="font-medium text-warning-foreground">
                  Action Required
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have a shortfall of {formatCurrency(result.shortfall)}. Consider
                  increasing your monthly investment or adjusting your retirement age.
                </p>
              </div>
            )}

            {result.shortfall <= 0 && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="font-medium text-success-foreground">
                  Great! You&apos;re on track
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your current plan will help you achieve your retirement goals with a
                  surplus of {formatCurrency(Math.abs(result.shortfall))}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
