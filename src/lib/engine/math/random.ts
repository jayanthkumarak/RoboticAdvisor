/**
 * Random number generation for Monte Carlo simulation
 * 
 * Uses:
 * - Seeded RNG for reproducibility
 * - Box-Muller transform for normal distribution
 */

/**
 * Seeded RNG (LCG - Linear Congruential Generator)
 * 
 * Simple but deterministic - same seed = same sequence
 */
export class SeededRandom {
  private seed: number
  
  constructor(seed: number) {
    this.seed = seed
  }
  
  /**
   * Generate next random number [0, 1)
   */
  next(): number {
    // LCG parameters (same as java.util.Random)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }
  
  /**
   * Generate standard normal random variable (mean=0, std=1)
   * Using Box-Muller transform
   */
  normal(): number {
    // Box-Muller transform
    const u1 = this.next()
    const u2 = this.next()
    
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
  
  /**
   * Generate normal with specified mean and std
   */
  normalWithParams(mean: number, std: number): number {
    return mean + std * this.normal()
  }
}

/**
 * Generate array of normal random variables
 */
export function generateNormals(
  count: number,
  mean: number = 0,
  std: number = 1,
  seed?: number
): number[] {
  const rng = new SeededRandom(seed || Date.now())
  return Array(count).fill(0).map(() => rng.normalWithParams(mean, std))
}
