import { INDIA_2024_Q4 } from '../india-2024'
import { getAssumptions, getLatestAssumptions, listAvailableAssumptions, AssumptionNotFoundError } from '../loader'

describe('Assumptions Module', () => {
  describe('India 2024-Q4 Assumptions', () => {
    test('version matches expected format', () => {
      expect(INDIA_2024_Q4.version).toMatch(/^\d{4}-Q[1-4]$/)
    })
    
    test('all asset classes have positive expected returns', () => {
      for (const [id, params] of Object.entries(INDIA_2024_Q4.assetClasses)) {
        if (id !== 'cash') {  // Cash can have negative real return
          expect(params.nominalReturn.mean).toBeGreaterThan(0)
        }
      }
    })
    
    test('equity expected return > debt expected return', () => {
      const equity = INDIA_2024_Q4.assetClasses['equity-nifty50'].nominalReturn.mean
      const debt = INDIA_2024_Q4.assetClasses['debt-govt-10y'].nominalReturn.mean
      expect(equity).toBeGreaterThan(debt)
    })
    
    test('equity volatility > debt volatility', () => {
      const equityVol = INDIA_2024_Q4.assetClasses['equity-nifty50'].nominalReturn.volatility
      const debtVol = INDIA_2024_Q4.assetClasses['debt-govt-10y'].nominalReturn.volatility
      expect(equityVol).toBeGreaterThan(debtVol)
    })
    
    test('correlation matrix is symmetric', () => {
      const corr = INDIA_2024_Q4.correlationMatrix
      for (let i = 0; i < corr.length; i++) {
        for (let j = 0; j < corr.length; j++) {
          expect(corr[i][j]).toBeCloseTo(corr[j][i])
        }
      }
    })
    
    test('correlation matrix diagonal is all 1.0', () => {
      const corr = INDIA_2024_Q4.correlationMatrix
      for (let i = 0; i < corr.length; i++) {
        expect(corr[i][i]).toBe(1.0)
      }
    })
    
    test('all correlations between -1 and 1', () => {
      const corr = INDIA_2024_Q4.correlationMatrix
      for (let i = 0; i < corr.length; i++) {
        for (let j = 0; j < corr.length; j++) {
          expect(corr[i][j]).toBeGreaterThanOrEqual(-1)
          expect(corr[i][j]).toBeLessThanOrEqual(1)
        }
      }
    })
    
    test('regime probabilities sum to 1.0', () => {
      const total = INDIA_2024_Q4.regimes.reduce((sum, r) => sum + r.probability, 0)
      expect(total).toBeCloseTo(1.0)
    })
    
    test('bear market reduces equity returns', () => {
      const bearRegime = INDIA_2024_Q4.regimes.find(r => r.id === 'bear')!
      const equityMultiplier = bearRegime.assetClassMultipliers['equity-nifty50'].returnMultiplier
      expect(equityMultiplier).toBeLessThan(0)
    })
    
    test('crisis increases volatility across assets', () => {
      const crisisRegime = INDIA_2024_Q4.regimes.find(r => r.id === 'crisis')!
      for (const [asset, multipliers] of Object.entries(crisisRegime.assetClassMultipliers)) {
        if (asset !== 'cash') {
          expect(multipliers.volatilityMultiplier).toBeGreaterThanOrEqual(1.0)
        }
      }
    })
  })
  
  describe('Assumptions Loader', () => {
    test('loads India 2024-Q4 assumptions', () => {
      const assumptions = getAssumptions('IN', '2024-Q4')
      expect(assumptions.version).toBe('2024-Q4')
      expect(assumptions.region).toBe('IN')
    })
    
    test('throws error for non-existent region', () => {
      expect(() => getAssumptions('XX', '2024-Q4')).toThrow(AssumptionNotFoundError)
    })
    
    test('throws error for non-existent version', () => {
      expect(() => getAssumptions('IN', '1999-Q1')).toThrow(AssumptionNotFoundError)
    })
    
    test('getLatestAssumptions returns current version', () => {
      const assumptions = getLatestAssumptions('IN')
      expect(assumptions.version).toBe('2024-Q4')
    })
    
    test('lists all available assumptions', () => {
      const list = listAvailableAssumptions()
      expect(list).toContainEqual({ region: 'IN', version: '2024-Q4' })
    })
  })
})
