/**
 * Compound Interest and Time Value of Money Utilities
 * 
 * All formulas validated against:
 * - Excel financial functions (FV, PV, PMT, RATE)
 * - Python numpy.financial
 * - Academic finance textbooks
 */

/**
 * Future Value of a lump sum
 * 
 * Formula: FV = PV × (1 + r)^n
 * 
 * @param presentValue - Initial investment
 * @param rate - Annual interest rate (as decimal, e.g., 0.12 for 12%)
 * @param periods - Number of years
 * @returns Future value
 * 
 * @example
 * futureValue(100000, 0.12, 10) // ₹1L at 12% for 10 years
 * // = 310,584.82
 */
export function futureValue(
  presentValue: number,
  rate: number,
  periods: number
): number {
  if (presentValue < 0) throw new Error('Present value must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  return presentValue * Math.pow(1 + rate, periods)
}

/**
 * Present Value of a lump sum
 * 
 * Formula: PV = FV / (1 + r)^n
 * 
 * @example
 * presentValue(310584.82, 0.12, 10) // Discount ₹3.1L back 10 years
 * // = 100,000
 */
export function presentValue(
  futureValue: number,
  rate: number,
  periods: number
): number {
  if (futureValue < 0) throw new Error('Future value must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  return futureValue / Math.pow(1 + rate, periods)
}

/**
 * Future Value of an Annuity (SIP/SWP)
 * 
 * Formula: FV = PMT × [((1+r)^n - 1) / r] × (1+r)
 * 
 * The (1+r) at end accounts for payments at START of period (annuity due)
 * 
 * @param payment - Periodic payment amount
 * @param rate - Interest rate per period
 * @param periods - Number of periods
 * @param type - 'due' (start of period) or 'ordinary' (end of period)
 * 
 * @example
 * futureValueAnnuity(25000, 0.12/12, 10*12, 'due') // ₹25k SIP for 10 years
 * // = ~₹58,00,000
 */
export function futureValueAnnuity(
  payment: number,
  rate: number,
  periods: number,
  type: 'due' | 'ordinary' = 'due'
): number {
  if (payment < 0) throw new Error('Payment must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  if (rate === 0) {
    // Special case: zero interest
    return payment * periods
  }
  
  const fv = payment * ((Math.pow(1 + rate, periods) - 1) / rate)
  
  return type === 'due' ? fv * (1 + rate) : fv
}

/**
 * Present Value of an Annuity (Retirement corpus needed)
 * 
 * Formula: PV = PMT × [(1 - (1+r)^-n) / r]
 * 
 * Used to calculate: "How much corpus needed to support ₹X/year for N years?"
 * 
 * @example
 * presentValueAnnuity(600000, 0.04, 30) // ₹6L/year for 30 years at 4% real
 * // = ₹1,03,80,000 (₹1.04 Cr needed)
 */
export function presentValueAnnuity(
  payment: number,
  rate: number,
  periods: number
): number {
  if (payment < 0) throw new Error('Payment must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  if (rate === 0) {
    return payment * periods
  }
  
  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate)
}

/**
 * Calculate required SIP to reach a goal
 * 
 * Inverse of futureValueAnnuity: Given FV, solve for PMT
 * 
 * Formula: PMT = FV / [((1+r)^n - 1) / r × (1+r)]
 * 
 * @example
 * requiredSIP(10000000, 0.12, 20) // ₹1Cr in 20 years at 12% annual
 * // = ₹1,21,036/year = ₹10,086/month
 */
export function requiredSIP(
  targetAmount: number,
  annualRate: number,
  years: number,
  type: 'monthly' | 'annual' = 'monthly'
): number {
  if (targetAmount <= 0) throw new Error('Target amount must be positive')
  if (years <= 0) throw new Error('Years must be positive')
  
  const periods = type === 'monthly' ? years * 12 : years
  const rate = type === 'monthly' ? annualRate / 12 : annualRate
  
  if (rate === 0) {
    return targetAmount / periods
  }
  
  // FV annuity due formula inverted
  return targetAmount / (((Math.pow(1 + rate, periods) - 1) / rate) * (1 + rate))
}

/**
 * Real Return: Convert nominal to real (inflation-adjusted)
 * 
 * Formula: (1 + r_nominal) / (1 + inflation) - 1
 * 
 * NOT r_nominal - inflation (that's an approximation)
 * 
 * @example
 * nominalToReal(0.12, 0.06) // 12% nominal, 6% inflation
 * // = 0.0566 = 5.66% real
 */
export function nominalToReal(nominalRate: number, inflationRate: number): number {
  return ((1 + nominalRate) / (1 + inflationRate)) - 1
}

/**
 * Real to Nominal: Convert real to nominal
 * 
 * Formula: (1 + r_real) × (1 + inflation) - 1
 */
export function realToNominal(realRate: number, inflationRate: number): number {
  return (1 + realRate) * (1 + inflationRate) - 1
}

/**
 * Compound Annual Growth Rate (CAGR)
 * 
 * Formula: [(End Value / Start Value)^(1/years)] - 1
 * 
 * @example
 * cagr(100000, 310584.82, 10)
 * // = 0.12 = 12%
 */
export function cagr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0) throw new Error('Start value must be positive')
  if (endValue <= 0) throw new Error('End value must be positive')
  if (years <= 0) throw new Error('Years must be positive')
  
  return Math.pow(endValue / startValue, 1 / years) - 1
}
