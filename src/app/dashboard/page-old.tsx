'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Target, TrendingUp, PieChart, DollarSign, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useFinancialStore } from '@/store/useFinancialStore'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { profile, retirementPlan, goals, isDarkMode } = useFinancialStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const totalGoals = goals.length
  const achievedGoals = goals.filter(g => g.status === 'achieved').length
  const activeGoals = goals.filter(g => g.status === 'active').length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{profile ? `, ${profile.name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here&apos;s an overview of your financial planning journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Retirement Corpus
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retirementPlan
                    ? formatCurrency(retirementPlan.projectedCorpus)
                    : 'Not Set'}
                </div>
                {retirementPlan && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {formatCurrency(retirementPlan.retirementCorpusNeeded)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalGoals} total goals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Goals Achieved
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{achievedGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalGoals > 0
                    ? `${((achievedGoals / totalGoals) * 100).toFixed(0)}% complete`
                    : 'No goals yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Profile
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {profile?.riskProfile || 'Not Set'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Asset allocation profile
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {!profile && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle>Get Started with Your Financial Plan</CardTitle>
                <CardDescription>
                  Complete your profile to unlock personalized financial planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/onboarding">
                    Complete Profile
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Retirement Planning Card */}
            <Card>
              <CardHeader>
                <CardTitle>Retirement Planning</CardTitle>
                <CardDescription>
                  {retirementPlan
                    ? `Retire at age ${retirementPlan.retirementAge}`
                    : 'Plan your retirement journey'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {retirementPlan ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress to Target</span>
                        <span className="font-medium">
                          {(
                            (retirementPlan.projectedCorpus /
                              retirementPlan.retirementCorpusNeeded) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (retirementPlan.projectedCorpus /
                            retirementPlan.retirementCorpusNeeded) *
                          100
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Age</p>
                        <p className="font-medium">{retirementPlan.currentAge}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Years to Retire</p>
                        <p className="font-medium">
                          {retirementPlan.retirementAge - retirementPlan.currentAge}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Create a retirement plan to see your progress
                  </p>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/retirement">
                    {retirementPlan ? 'View Details' : 'Start Planning'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Goals Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>
                  {totalGoals > 0
                    ? `${activeGoals} active, ${achievedGoals} achieved`
                    : 'Set your financial goals'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Target: {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                        <span className="text-xs capitalize px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {goal.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No goals created yet. Add your first goal to get started.
                  </p>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/goals">
                    {goals.length > 0 ? 'View All Goals' : 'Add Goals'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Explore More Tools</CardTitle>
              <CardDescription>
                Advanced calculators and planning tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" asChild>
                  <Link href="/portfolio">Portfolio Analysis</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/coast-fire">Coast FIRE</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bucket-strategy">Bucket Strategy</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/recommendations">Recommendations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
