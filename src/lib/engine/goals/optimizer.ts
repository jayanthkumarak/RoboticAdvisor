import { MarketAssumptions } from '../assumptions/types'
import { GoalInput, GoalAllocation, GoalAllocationResult } from './types'
import { requiredSIP, futureValue } from '../math/compound'

/**
 * Allocate monthly budget across multiple financial goals
 * 
 * Uses priority-based greedy allocation with feasibility detection
 */
export function allocateGoalBudget(
  goals: GoalInput[],
  monthlyBudget: number,
  assumptions: MarketAssumptions
): GoalAllocationResult {
  
  if (monthlyBudget < 0) throw new Error('Monthly budget cannot be negative')
  if (goals.length === 0) {
    return {
      allocations: [],
      totalMonthly: 0,
      unallocated: monthlyBudget,
      budgetUtilization: 0,
      conflicts: [],
      recommendations: []
    }
  }
  
  // 1. Calculate required SIP for each goal
  const requirements = goals.map(goal => {
    const currentYear = new Date().getFullYear()
    const years = goal.targetYear - currentYear
    const months = years * 12
    
    if (years <= 0) {
      throw new Error(`Goal ${goal.id} has invalid target year (must be in future)`)
    }
    
    // Inflation-adjust target
    const inflationRate = assumptions.inflation.mean / 100
    const futureValue = goal.targetAmount * Math.pow(1 + inflationRate, years)
    
    // Estimate expected return based on typical balanced allocation
    const expectedReturn = 0.10  // 10% for goal planning (conservative)
    
    // Account for current savings
    const currentSavings = goal.currentSavings || 0
    const futureValueOfSavings = currentSavings * Math.pow(1 + expectedReturn, years)
    const remainingNeeded = Math.max(0, futureValue - futureValueOfSavings)
    
    const required = remainingNeeded > 0
      ? requiredSIP(remainingNeeded, expectedReturn, years, 'monthly')
      : 0
    
    return {
      goalId: goal.id,
      name: goal.name,
      requiredSIP: required,
      priority: goal.priority,
      targetAmount: futureValue,
      years
    }
  })
  
  // 2. Sort by priority (high > medium > low)
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const sorted = requirements.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Same priority: shorter timeline first (urgency)
    return a.years - b.years
  })
  
  // 3. Allocate greedily by priority
  let remaining = monthlyBudget
  const allocations: GoalAllocation[] = []
  const conflicts: string[] = []
  
  for (const req of sorted) {
    let allocated: number
    let feasibility: 'on-track' | 'tight' | 'underfunded' | 'impossible'
    
    if (remaining >= req.requiredSIP) {
      // Full funding available
      allocated = req.requiredSIP
      feasibility = 'on-track'
      remaining -= req.requiredSIP
      
    } else if (remaining > 0) {
      // Partial funding
      allocated = remaining
      feasibility = remaining / req.requiredSIP > 0.7 ? 'tight' : 'underfunded'
      remaining = 0
      
      conflicts.push(
        `Goal "${req.name}" needs ₹${Math.round(req.requiredSIP).toLocaleString('en-IN')} ` +
        `but only ₹${Math.round(allocated).toLocaleString('en-IN')} available ` +
        `(${(allocated / req.requiredSIP * 100).toFixed(0)}% funded)`
      )
      
    } else {
      // No budget remaining
      allocated = 0
      feasibility = 'impossible'
      
      conflicts.push(
        `Goal "${req.name}" cannot be funded with current budget ` +
        `(needs ₹${Math.round(req.requiredSIP).toLocaleString('en-IN')}/month)`
      )
    }
    
    // Calculate projected value with allocated SIP
    const projectedFromSIP = allocated > 0
      ? allocated * (((Math.pow(1.10, req.years) - 1) / (0.10 / 12)) * (1 + 0.10 / 12))
      : 0
    
    const goal = goals.find(g => g.id === req.goalId)!
    const projectedFromSavings = (goal.currentSavings || 0) * Math.pow(1.10, req.years)
    const totalProjected = projectedFromSIP + projectedFromSavings
    const shortfall = Math.max(0, req.targetAmount - totalProjected)
    
    allocations.push({
      goalId: req.goalId,
      monthlySIP: allocated,
      requiredSIP: req.requiredSIP,
      feasibility,
      projectedValue: totalProjected,
      shortfall
    })
  }
  
  // 4. Generate recommendations
  const recommendations: string[] = []
  const totalRequired = requirements.reduce((sum, r) => sum + r.requiredSIP, 0)
  
  if (totalRequired > monthlyBudget) {
    const deficit = totalRequired - monthlyBudget
    recommendations.push(
      `Increase monthly budget by ₹${Math.round(deficit).toLocaleString('en-IN')} to fully fund all goals`
    )
    
    const underfundedGoals = allocations.filter(a => a.feasibility !== 'on-track')
    if (underfundedGoals.length > 0) {
      recommendations.push(
        `Consider deferring ${underfundedGoals.length} lower-priority goal(s) to focus on critical goals`
      )
    }
  } else if (remaining > 0) {
    recommendations.push(
      `Surplus of ₹${Math.round(remaining).toLocaleString('en-IN')}/month available for additional savings or new goals`
    )
  }
  
  return {
    allocations,
    totalMonthly: monthlyBudget - remaining,
    unallocated: remaining,
    budgetUtilization: (monthlyBudget - remaining) / monthlyBudget * 100,
    conflicts,
    recommendations
  }
}
