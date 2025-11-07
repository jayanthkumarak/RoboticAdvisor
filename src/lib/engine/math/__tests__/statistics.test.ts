import { mean, median, standardDeviation, percentile, correlation, min, max, sum } from '../statistics'

describe('Statistics Functions', () => {
  describe('mean', () => {
    test('mean of [1,2,3,4,5] = 3', () => {
      expect(mean([1,2,3,4,5])).toBe(3)
    })
    
    test('empty array returns 0', () => {
      expect(mean([])).toBe(0)
    })
    
    test('single value returns that value', () => {
      expect(mean([42])).toBe(42)
    })
  })
  
  describe('median', () => {
    test('median of odd-length array', () => {
      expect(median([1,2,3,4,5])).toBe(3)
    })
    
    test('median of even-length array', () => {
      expect(median([1,2,3,4])).toBe(2.5)
    })
    
    test('handles unsorted arrays', () => {
      expect(median([5,2,4,1,3])).toBe(3)
    })
    
    test('empty array returns 0', () => {
      expect(median([])).toBe(0)
    })
  })
  
  describe('standardDeviation', () => {
    test('std of [1,2,3,4,5]', () => {
      expect(standardDeviation([1,2,3,4,5])).toBeCloseTo(1.414, 2)
    })
    
    test('std of constant values is 0', () => {
      expect(standardDeviation([5,5,5,5,5])).toBe(0)
    })
    
    test('empty array returns 0', () => {
      expect(standardDeviation([])).toBe(0)
    })
  })
  
  describe('percentile', () => {
    test('percentile 50 = median', () => {
      const values = [1,2,3,4,5,6,7,8,9,10]
      expect(percentile(values, 50)).toBeCloseTo(median(values), 2)
    })
    
    test('percentile 0 = min', () => {
      const values = [1,2,3,4,5]
      expect(percentile(values, 0)).toBeCloseTo(1, 2)
    })
    
    test('percentile 100 = max', () => {
      const values = [1,2,3,4,5]
      expect(percentile(values, 100)).toBeCloseTo(5, 2)
    })
    
    test('throws on invalid percentile', () => {
      expect(() => percentile([1,2,3], -10)).toThrow()
      expect(() => percentile([1,2,3], 150)).toThrow()
    })
    
    test('interpolates between values', () => {
      const values = [1,2,3,4,5]
      const p25 = percentile(values, 25)
      expect(p25).toBeGreaterThan(1)
      expect(p25).toBeLessThan(3)
    })
  })
  
  describe('correlation', () => {
    test('perfect positive correlation', () => {
      const x = [1,2,3,4,5]
      const y = [2,4,6,8,10]  // y = 2x
      expect(correlation(x, y)).toBeCloseTo(1.0, 2)
    })
    
    test('perfect negative correlation', () => {
      const x = [1,2,3,4,5]
      const y = [5,4,3,2,1]
      expect(correlation(x, y)).toBeCloseTo(-1.0, 2)
    })
    
    test('no correlation', () => {
      const x = [1,1,1,1,1]
      const y = [1,2,3,4,5]
      expect(correlation(x, y)).toBe(0)
    })
    
    test('throws on different length arrays', () => {
      expect(() => correlation([1,2,3], [1,2])).toThrow()
    })
  })
  
  describe('min/max/sum', () => {
    test('min finds smallest value', () => {
      expect(min([5,2,8,1,9])).toBe(1)
    })
    
    test('max finds largest value', () => {
      expect(max([5,2,8,1,9])).toBe(9)
    })
    
    test('sum adds all values', () => {
      expect(sum([1,2,3,4,5])).toBe(15)
    })
  })
})
