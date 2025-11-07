export interface GoalInput {
  id: string
  name: string
  targetAmount: number
  targetYear: number
  priority: 'high' | 'medium' | 'low'
  currentSavings?: number
}

export interface GoalAllocation {
  goalId: string
  monthlySIP: number
  requiredSIP: number
  feasibility: 'on-track' | 'tight' | 'underfunded' | 'impossible'
  projectedValue: number
  shortfall: number
}

export interface GoalAllocationResult {
  allocations: GoalAllocation[]
  totalMonthly: number
  unallocated: number
  budgetUtilization: number  // Percentage
  conflicts: string[]
  recommendations: string[]
}
