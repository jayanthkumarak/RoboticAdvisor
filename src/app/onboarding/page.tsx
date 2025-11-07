'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useFinancialStore } from '@/store/useFinancialStore'
import { RiskProfile, UserProfile } from '@/types'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { setProfile, isDarkMode } = useFinancialStore()
  
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState(30)
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('balanced')
  const [currency, setCurrency] = useState('INR')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleComplete = () => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
      dateOfBirth: new Date(new Date().getFullYear() - age, 0, 1),
      age,
      riskProfile,
      currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    setProfile(profile)
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Let&apos;s Get Started
            </h1>
            <p className="text-muted-foreground">
              Tell us about yourself to create a personalized financial plan
            </p>
          </div>

          <Progress value={progress} className="h-2" />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic information to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={18}
                    max={80}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!name || !email || age < 18}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Help us understand your investment risk tolerance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Risk Profile</Label>
                  <Select
                    value={riskProfile}
                    onValueChange={(value) => setRiskProfile(value as RiskProfile)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">
                        Conservative - Low risk, stable returns
                      </SelectItem>
                      <SelectItem value="moderate">
                        Moderate - Balanced risk and return
                      </SelectItem>
                      <SelectItem value="balanced">
                        Balanced - Moderate growth focus
                      </SelectItem>
                      <SelectItem value="aggressive">
                        Aggressive - High growth potential
                      </SelectItem>
                      <SelectItem value="very-aggressive">
                        Very Aggressive - Maximum growth
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <h4 className="font-semibold">Recommended Allocation</h4>
                  <div className="space-y-1 text-sm">
                    {riskProfile === 'conservative' && (
                      <>
                        <p>Equity: 20% | Debt: 70% | Gold: 10%</p>
                        <p className="text-muted-foreground">
                          Suitable for risk-averse investors seeking stability
                        </p>
                      </>
                    )}
                    {riskProfile === 'moderate' && (
                      <>
                        <p>Equity: 40% | Debt: 50% | Gold: 10%</p>
                        <p className="text-muted-foreground">
                          Good balance between growth and stability
                        </p>
                      </>
                    )}
                    {riskProfile === 'balanced' && (
                      <>
                        <p>Equity: 60% | Debt: 30% | Gold: 10%</p>
                        <p className="text-muted-foreground">
                          Moderate growth with reasonable risk
                        </p>
                      </>
                    )}
                    {riskProfile === 'aggressive' && (
                      <>
                        <p>Equity: 80% | Debt: 15% | Gold: 5%</p>
                        <p className="text-muted-foreground">
                          High growth potential with higher volatility
                        </p>
                      </>
                    )}
                    {riskProfile === 'very-aggressive' && (
                      <>
                        <p>Equity: 90% | Debt: 8% | Gold: 2%</p>
                        <p className="text-muted-foreground">
                          Maximum growth focus for long-term investors
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Final Steps</CardTitle>
                <CardDescription>
                  Review and confirm your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Currency Preference</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-semibold">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{email}</span>
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{age}</span>
                    <span className="text-muted-foreground">Risk Profile:</span>
                    <span className="font-medium capitalize">{riskProfile}</span>
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{currency}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
