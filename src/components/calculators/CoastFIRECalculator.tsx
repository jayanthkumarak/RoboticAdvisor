'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

export function CoastFIRECalculator() {
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(60)
  const [currentSavings, setCurrentSavings] = useState(1000000)
  const [targetRetirementCorpus, setTargetRetirementCorpus] = useState(10000000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  
  const [result, setResult] = useState<{
    coastFIRENumber: number
    isCoastFIRE: boolean
    yearsToCoastFIRE: number
    projectedCorpus: number
    requiredMonthlySavings: number
  } | null>(null)

  const handleCalculate = () => {
    const yearsToRetirement = retirementAge - currentAge
    
    const projectedCorpus = currentSavings * Math.pow(
      1 + expectedReturn / 100,
      yearsToRetirement
    )
    
    const coastFIRENumber = targetRetirementCorpus / Math.pow(
      1 + expectedReturn / 100,
      yearsToRetirement
    )
    
    const isCoastFIRE = currentSavings >= coastFIRENumber
    
    let yearsToCoastFIRE = 0
    if (!isCoastFIRE && currentSavings > 0) {
      yearsToCoastFIRE = Math.log(coastFIRENumber / currentSavings) / Math.log(1 + expectedReturn / 100)
    }
    
    const shortfall = coastFIRENumber - currentSavings
    const monthsToRetirement = yearsToRetirement * 12
    const monthlyRate = expectedReturn / (12 * 100)
    
    let requiredMonthlySavings = 0
    if (shortfall > 0 && monthlyRate > 0) {
      requiredMonthlySavings = (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToRetirement) - 1)
    }
    
    setResult({
      coastFIRENumber,
      isCoastFIRE,
      yearsToCoastFIRE,
      projectedCorpus,
      requiredMonthlySavings,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coast FIRE Calculator</CardTitle>
          <CardDescription>
            Calculate when you can stop active investing and let your money grow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                min={18}
                max={80}
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                min={40}
                max={75}
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings/Portfolio</Label>
              <Input
                id="currentSavings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCorpus">Target Retirement Corpus</Label>
              <Input
                id="targetCorpus"
                type="number"
                value={targetRetirementCorpus}
                onChange={(e) => setTargetRetirementCorpus(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Expected Annual Return</Label>
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
            Calculate Coast FIRE
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.isCoastFIRE ? 'border-success' : 'border-warning'}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {result.isCoastFIRE ? (
                <CheckCircle2 className="h-8 w-8 text-success" />
              ) : (
                <XCircle className="h-8 w-8 text-warning" />
              )}
              <div>
                <CardTitle>
                  {result.isCoastFIRE
                    ? 'Congratulations! You have reached Coast FIRE!'
                    : "You are not at Coast FIRE yet"}
                </CardTitle>
                <CardDescription>
                  {result.isCoastFIRE
                    ? 'You can stop active investing and let your money grow'
                    : `You need ${formatCurrency(result.coastFIRENumber - currentSavings)} more`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Your Coast FIRE Number</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.coastFIRENumber)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">Current Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(currentSavings)}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground">
                  Projected Corpus at Retirement
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.projectedCorpus)}
                </p>
              </div>

              {!result.isCoastFIRE && (
                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    Years to Coast FIRE (no savings)
                  </p>
                  <p className="text-2xl font-bold">
                    {result.yearsToCoastFIRE.toFixed(1)} years
                  </p>
                </div>
              )}
            </div>

            {!result.isCoastFIRE && result.requiredMonthlySavings > 0 && (
              <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                <p className="font-medium text-info-foreground mb-2">
                  Path to Coast FIRE
                </p>
                <p className="text-sm text-muted-foreground">
                  To reach Coast FIRE by retirement, you need to save approximately{' '}
                  <span className="font-bold text-foreground">
                    {formatCurrency(result.requiredMonthlySavings)}
                  </span>{' '}
                  per month.
                </p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold mb-2">What is Coast FIRE?</h4>
              <p className="text-sm text-muted-foreground">
                Coast FIRE (Financial Independence, Retire Early) is when you have enough
                saved that if you stop investing now, your current savings will grow to
                your retirement goal through compound growth alone. You can then coast
                to retirement without additional investments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
