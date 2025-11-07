import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1
): number {
  return principal * Math.pow(1 + rate / (frequency * 100), frequency * time)
}

export function calculateFutureValue(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): number {
  const monthlyRate = annualReturn / (12 * 100)
  const months = years * 12
  
  if (monthlyRate === 0) return monthlyInvestment * months
  
  return (
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  )
}

export function calculateSIP(
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
): { totalInvestment: number; futureValue: number; wealth: number } {
  const totalInvestment = monthlyInvestment * years * 12
  const futureValue = calculateFutureValue(monthlyInvestment, expectedReturn, years)
  const wealth = futureValue - totalInvestment
  
  return { totalInvestment, futureValue, wealth }
}

export function calculateRetirementCorpus(
  currentAge: number,
  retirementAge: number,
  currentExpenses: number,
  inflationRate: number,
  postRetirementReturn: number,
  lifeExpectancy: number
): number {
  const yearsToRetirement = retirementAge - currentAge
  const retirementYears = lifeExpectancy - retirementAge
  
  // Future value of current expenses at retirement
  const futureExpenses = currentExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement)
  
  // Calculate corpus needed
  const realReturn = (postRetirementReturn - inflationRate) / 100
  
  if (realReturn === 0) {
    return futureExpenses * retirementYears * 12
  }
  
  // Present value of annuity formula
  const monthlyReturn = realReturn / 12
  const months = retirementYears * 12
  
  return (
    futureExpenses * ((1 - Math.pow(1 + monthlyReturn, -months)) / monthlyReturn)
  )
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getAgeFromDOB(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  
  return age
}

export function validateAge(age: number): boolean {
  return age >= 18 && age <= 80
}

export function generateYearRange(startYear: number, endYear: number): number[] {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
}
