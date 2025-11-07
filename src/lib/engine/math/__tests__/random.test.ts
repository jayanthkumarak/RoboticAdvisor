import { SeededRandom, generateNormals } from '../random'
import { mean, standardDeviation } from '../statistics'

describe('Random Number Generation', () => {
  describe('SeededRandom', () => {
    test('seeded RNG is deterministic', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(12345)
      
      const seq1 = Array(100).fill(0).map(() => rng1.next())
      const seq2 = Array(100).fill(0).map(() => rng2.next())
      
      expect(seq1).toEqual(seq2)
    })
    
    test('different seeds produce different sequences', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(54321)
      
      const seq1 = Array(100).fill(0).map(() => rng1.next())
      const seq2 = Array(100).fill(0).map(() => rng2.next())
      
      expect(seq1).not.toEqual(seq2)
    })
    
    test('generates values in [0, 1)', () => {
      const rng = new SeededRandom(42)
      
      for (let i = 0; i < 1000; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
    
    test('normal distribution has correct mean', () => {
      const rng = new SeededRandom(42)
      const values = Array(10000).fill(0).map(() => rng.normal())
      const avg = mean(values)
      expect(avg).toBeCloseTo(0, 0)  // Within 1 unit
    })
    
    test('normal distribution has correct std', () => {
      const rng = new SeededRandom(42)
      const values = Array(10000).fill(0).map(() => rng.normal())
      const std = standardDeviation(values)
      expect(std).toBeCloseTo(1, 0)  // Within 0.5 units
    })
    
    test('normalWithParams has correct mean', () => {
      const rng = new SeededRandom(42)
      const values = Array(10000).fill(0).map(() => rng.normalWithParams(10, 2))
      const avg = mean(values)
      expect(avg).toBeCloseTo(10, 0)
    })
    
    test('normalWithParams has correct std', () => {
      const rng = new SeededRandom(42)
      const values = Array(10000).fill(0).map(() => rng.normalWithParams(10, 2))
      const std = standardDeviation(values)
      expect(std).toBeCloseTo(2, 0)
    })
  })
  
  describe('generateNormals', () => {
    test('generates requested count', () => {
      const values = generateNormals(100, 0, 1, 42)
      expect(values.length).toBe(100)
    })
    
    test('is deterministic with seed', () => {
      const values1 = generateNormals(100, 0, 1, 42)
      const values2 = generateNormals(100, 0, 1, 42)
      expect(values1).toEqual(values2)
    })
    
    test('has correct distribution parameters', () => {
      const values = generateNormals(10000, 5, 3, 42)
      const avg = mean(values)
      const std = standardDeviation(values)
      expect(avg).toBeCloseTo(5, 0)
      expect(std).toBeCloseTo(3, 0)
    })
  })
})
