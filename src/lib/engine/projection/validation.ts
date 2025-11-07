import { ProjectionInputs } from './types'

export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error [${field}]: ${message}`)
    this.name = 'ValidationError'
  }
}

export function validateInputs(inputs: ProjectionInputs): void {
  // Age validation
  if (inputs.currentAge < 18 || inputs.currentAge > 100) {
    throw new ValidationError('currentAge', 'Must be between 18 and 100')
  }
  
  if (inputs.retirementAge <= inputs.currentAge) {
    throw new ValidationError('retirementAge', 'Must be greater than current age')
  }
  
  if (inputs.lifeExpectancy <= inputs.retirementAge) {
    throw new ValidationError('lifeExpectancy', 'Must be greater than retirement age')
  }
  
  // Financial validation
  if (inputs.currentSavings < 0) {
    throw new ValidationError('currentSavings', 'Cannot be negative')
  }
  
  if (inputs.monthlyInvestment < 0) {
    throw new ValidationError('monthlyInvestment', 'Cannot be negative')
  }
  
  if (inputs.monthlyExpenses < 0) {
    throw new ValidationError('monthlyExpenses', 'Cannot be negative')
  }
  
  // Allocation validation
  const allocationSum = Object.values(inputs.assetAllocation).reduce((sum, v) => sum + v, 0)
  if (Math.abs(allocationSum - 100) > 0.01) {
    throw new ValidationError('assetAllocation', `Must sum to 100% (got ${allocationSum}%)`)
  }
  
  for (const [asset, pct] of Object.entries(inputs.assetAllocation)) {
    if (pct < 0 || pct > 100) {
      throw new ValidationError('assetAllocation', `${asset} must be 0-100% (got ${pct}%)`)
    }
  }
}

export function sanitizeInputs(inputs: ProjectionInputs): ProjectionInputs {
  return {
    ...inputs,
    currentAge: Math.round(inputs.currentAge),
    retirementAge: Math.round(inputs.retirementAge),
    lifeExpectancy: Math.round(inputs.lifeExpectancy),
    currentSavings: Math.max(0, inputs.currentSavings),
    monthlyInvestment: Math.max(0, inputs.monthlyInvestment),
    monthlyExpenses: Math.max(0, inputs.monthlyExpenses),
  }
}
