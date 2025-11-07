/**
 * Statistical functions for analysis and aggregation
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const avg = mean(values)
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  const variance = mean(squaredDiffs)
  
  return Math.sqrt(variance)
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  if (p < 0 || p > 100) throw new Error('Percentile must be 0-100')
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Arrays must be same length')
  if (x.length === 0) return 0
  
  const xMean = mean(x)
  const yMean = mean(y)
  
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0
  
  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean
    const yDiff = y[i] - yMean
    sumXY += xDiff * yDiff
    sumX2 += xDiff * xDiff
    sumY2 += yDiff * yDiff
  }
  
  if (sumX2 === 0 || sumY2 === 0) return 0
  
  return sumXY / Math.sqrt(sumX2 * sumY2)
}

/**
 * Calculate min value in array
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0
  return Math.min(...values)
}

/**
 * Calculate max value in array
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(...values)
}

/**
 * Sum all values in array
 */
export function sum(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0)
}
