'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
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
import { useFinancialStore } from '@/store/useFinancialStore'
import { Goal, GoalType, Priority } from '@/types'
import { formatCurrency, calculateFutureValue } from '@/lib/utils'
import { GOAL_TYPES, INFLATION_RATE_DEFAULT } from '@/lib/constants'

export function GoalPlanner() {
  const { goals, addGoal, deleteGoal } = useFinancialStore()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [goalType, setGoalType] = useState<GoalType>('non-recurring')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [targetAmount, setTargetAmount] = useState(0)
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 5)
  const [currentSavings, setCurrentSavings] = useState(0)
  const [monthlyInvestment, setMonthlyInvestment] = useState(0)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [priority, setPriority] = useState<Priority>('medium')

  const nonRecurringGoals = goals.filter((g) => !g.isRecurring)
  const recurringGoals = goals.filter((g) => g.isRecurring)

  const canAddNonRecurring = nonRecurringGoals.length < 6
  const canAddRecurring = recurringGoals.length < 4

  const handleAddGoal = () => {
    const yearsToGoal = targetYear - new Date().getFullYear()
    
    // Calculate projected savings
    const futureValueOfCurrentSavings =
      currentSavings * Math.pow(1 + expectedReturn / 100, yearsToGoal)
    const futureValueOfInvestments = calculateFutureValue(
      monthlyInvestment,
      expectedReturn,
      yearsToGoal
    )
    const projectedSavings = futureValueOfCurrentSavings + futureValueOfInvestments

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      userId: 'temp',
      type: goalType,
      name,
      category,
      targetAmount,
      targetYear,
      priority,
      currentSavings,
      monthlyInvestment,
      expectedReturn,
      inflationRate: INFLATION_RATE_DEFAULT,
      isRecurring: goalType === 'recurring',
      status: projectedSavings >= targetAmount ? 'active' : 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    addGoal(newGoal)
    resetForm()
    setShowAddForm(false)
  }

  const resetForm = () => {
    setName('')
    setCategory('')
    setTargetAmount(0)
    setTargetYear(new Date().getFullYear() + 5)
    setCurrentSavings(0)
    setMonthlyInvestment(0)
    setExpectedReturn(12)
    setPriority('medium')
  }

  const calculateProgress = (goal: Goal) => {
    const yearsToGoal = goal.targetYear - new Date().getFullYear()
    if (yearsToGoal <= 0) return 100

    const futureValueOfCurrentSavings =
      goal.currentSavings * Math.pow(1 + goal.expectedReturn / 100, yearsToGoal)
    const futureValueOfInvestments = calculateFutureValue(
      goal.monthlyInvestment,
      goal.expectedReturn,
      yearsToGoal
    )
    const projectedSavings = futureValueOfCurrentSavings + futureValueOfInvestments

    return Math.min((projectedSavings / goal.targetAmount) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>
                Plan up to 6 non-recurring and 4 recurring goals
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={!canAddNonRecurring && !canAddRecurring}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Goal Form */}
      {showAddForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Add New Goal</CardTitle>
            <CardDescription>Fill in the details for your financial goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Goal Type */}
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select
                value={goalType}
                onValueChange={(value) => {
                  setGoalType(value as GoalType)
                  setCategory('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-recurring" disabled={!canAddNonRecurring}>
                    Non-Recurring ({nonRecurringGoals.length}/6)
                  </SelectItem>
                  <SelectItem value="recurring" disabled={!canAddRecurring}>
                    Recurring ({recurringGoals.length}/4)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(goalType === 'non-recurring'
                    ? GOAL_TYPES.NON_RECURRING
                    : GOAL_TYPES.RECURRING
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Goal Name */}
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Child's Education"
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount || ''}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                />
              </div>

              {/* Target Year */}
              <div className="space-y-2">
                <Label htmlFor="targetYear">Target Year</Label>
                <Input
                  id="targetYear"
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 50}
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Savings */}
              <div className="space-y-2">
                <Label htmlFor="currentSavings">Current Savings</Label>
                <Input
                  id="currentSavings"
                  type="number"
                  value={currentSavings || ''}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                />
              </div>

              {/* Monthly Investment */}
              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly Investment</Label>
                <Input
                  id="monthlyInvestment"
                  type="number"
                  value={monthlyInvestment || ''}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                />
              </div>

              {/* Expected Return */}
              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Expected Return (%)</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  min={5}
                  max={20}
                  step={0.5}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddGoal} className="flex-1">
                Add Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No goals added yet. Click &quot;Add Goal&quot; to create your first financial goal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Non-Recurring Goals */}
          {nonRecurringGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Non-Recurring Goals</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {nonRecurringGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <CardDescription>{goal.category}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target Year</p>
                          <p className="font-medium">{goal.targetYear}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly SIP</p>
                          <p className="font-medium">
                            {formatCurrency(goal.monthlyInvestment)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Priority</p>
                          <p className="font-medium capitalize">{goal.priority}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {calculateProgress(goal).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(calculateProgress(goal), 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Goals */}
          {recurringGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Recurring Goals</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {recurringGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <CardDescription>{goal.category}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Annual Amount</p>
                          <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly SIP</p>
                          <p className="font-medium">
                            {formatCurrency(goal.monthlyInvestment)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
