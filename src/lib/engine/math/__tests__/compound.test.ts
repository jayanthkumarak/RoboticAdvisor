import {
  futureValue,
  presentValue,
  futureValueAnnuity,
  presentValueAnnuity,
  requiredSIP,
  nominalToReal,
  realToNominal,
  cagr
} from '../compound'

describe('Compound Interest Functions', () => {
  describe('futureValue', () => {
    test('matches Excel FV function', () => {
      // Excel: =FV(12%,10,0,-100000) = 310,584.82
      expect(futureValue(100000, 0.12, 10)).toBeCloseTo(310584.82, 2)
    })
    
    test('zero rate returns same value', () => {
      expect(futureValue(100000, 0, 10)).toBe(100000)
    })
    
    test('zero periods returns same value', () => {
      expect(futureValue(100000, 0.12, 0)).toBe(100000)
    })
    
    test('throws on negative present value', () => {
      expect(() => futureValue(-100, 0.12, 10)).toThrow()
    })
    
    test('throws on negative periods', () => {
      expect(() => futureValue(100000, 0.12, -5)).toThrow()
    })
  })
  
  describe('presentValue', () => {
    test('is inverse of futureValue', () => {
      const fv = futureValue(100000, 0.12, 10)
      const pv = presentValue(fv, 0.12, 10)
      expect(pv).toBeCloseTo(100000, 2)
    })
    
    test('matches Excel PV function', () => {
      // Excel: =PV(12%, 10, 0, -310584.82) = 100,000
      expect(presentValue(310584.82, 0.12, 10)).toBeCloseTo(100000, 2)
    })
  })
  
  describe('futureValueAnnuity', () => {
    test('SIP: ₹25k/month for 10Y at 12%', () => {
      const monthlyRate = 0.12 / 12
      const months = 10 * 12
      const fv = futureValueAnnuity(25000, monthlyRate, months, 'due')
      
      // Expected: ~5.8M (our formula is correct)
      expect(fv).toBeGreaterThan(5000000)
      expect(fv).toBeLessThan(6000000)
    })
    
    test('ordinary annuity < annuity due', () => {
      const ordinary = futureValueAnnuity(25000, 0.01, 120, 'ordinary')
      const due = futureValueAnnuity(25000, 0.01, 120, 'due')
      expect(due).toBeGreaterThan(ordinary)
    })
    
    test('zero rate = simple multiplication', () => {
      const fv = futureValueAnnuity(25000, 0, 120)
      expect(fv).toBe(25000 * 120)
    })
    
    test('longer period = higher value', () => {
      const fv10 = futureValueAnnuity(25000, 0.12/12, 10*12)
      const fv20 = futureValueAnnuity(25000, 0.12/12, 20*12)
      expect(fv20).toBeGreaterThan(fv10)
    })
  })
  
  describe('presentValueAnnuity', () => {
    test('retirement corpus: ₹6L/year for 30Y at 4% real', () => {
      const pv = presentValueAnnuity(600000, 0.04, 30)
      
      // Excel: =PV(4%, 30, -600000) = ~10,380,000
      expect(pv).toBeCloseTo(10380000, -4)  // Within ₹10k
    })
    
    test('zero rate = simple multiplication', () => {
      const pv = presentValueAnnuity(50000, 0, 30)
      expect(pv).toBe(50000 * 30)
    })
    
    test('higher rate = lower PV needed', () => {
      const pv4 = presentValueAnnuity(600000, 0.04, 30)
      const pv6 = presentValueAnnuity(600000, 0.06, 30)
      expect(pv6).toBeLessThan(pv4)
    })
  })
  
  describe('requiredSIP', () => {
    test('₹1Cr in 20Y at 12%', () => {
      const monthly = requiredSIP(10000000, 0.12, 20, 'monthly')
      
      // Verify by calculating FV
      const achieved = futureValueAnnuity(monthly, 0.12/12, 20*12, 'due')
      expect(achieved).toBeCloseTo(10000000, 0)
    })
    
    test('annual vs monthly gives different amounts', () => {
      const annual = requiredSIP(10000000, 0.12, 20, 'annual')
      const monthly = requiredSIP(10000000, 0.12, 20, 'monthly')
      
      expect(annual).toBeGreaterThan(monthly * 12)  // Annual needs to be higher
    })
    
    test('throws on zero or negative target', () => {
      expect(() => requiredSIP(0, 0.12, 20)).toThrow()
      expect(() => requiredSIP(-100000, 0.12, 20)).toThrow()
    })
    
    test('throws on zero or negative years', () => {
      expect(() => requiredSIP(1000000, 0.12, 0)).toThrow()
      expect(() => requiredSIP(1000000, 0.12, -5)).toThrow()
    })
  })
  
  describe('nominalToReal', () => {
    test('12% nominal, 6% inflation = 5.66% real', () => {
      const real = nominalToReal(0.12, 0.06)
      expect(real).toBeCloseTo(0.0566, 4)
    })
    
    test('is NOT simple subtraction', () => {
      const exact = nominalToReal(0.12, 0.06)
      const approx = 0.12 - 0.06
      expect(exact).not.toBeCloseTo(approx, 4)
    })
    
    test('negative real return when inflation > nominal', () => {
      const real = nominalToReal(0.04, 0.06)
      expect(real).toBeLessThan(0)
    })
  })
  
  describe('realToNominal', () => {
    test('is inverse of nominalToReal', () => {
      const real = nominalToReal(0.12, 0.06)
      const nominal = realToNominal(real, 0.06)
      expect(nominal).toBeCloseTo(0.12, 10)
    })
    
    test('6% real + 6% inflation = 12.36% nominal', () => {
      const nominal = realToNominal(0.06, 0.06)
      expect(nominal).toBeCloseTo(0.1236, 4)
    })
  })
  
  describe('cagr', () => {
    test('calculates growth rate correctly', () => {
      const growth = cagr(100000, 310584.82, 10)
      expect(growth).toBeCloseTo(0.12, 4)
    })
    
    test('no growth returns 0', () => {
      expect(cagr(100000, 100000, 10)).toBeCloseTo(0, 10)
    })
    
    test('loss returns negative CAGR', () => {
      const growth = cagr(100000, 50000, 5)
      expect(growth).toBeLessThan(0)
    })
  })
})
