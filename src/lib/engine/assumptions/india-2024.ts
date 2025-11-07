import { MarketAssumptions } from './types'

/**
 * India Market Assumptions - Q4 2024
 * 
 * Calibration Methodology:
 * - Equity returns: 25-year Nifty 50 CAGR (1999-2024)
 * - Volatility: Realized annual volatility over same period
 * - Debt: Current 10Y G-Sec yield as baseline
 * - Inflation: 10-year average CPI
 * - Correlations: Pearson correlation on monthly returns (2014-2024)
 * 
 * Data Sources:
 * - NSE India (https://www.nseindia.com/market-data/live-market-indices)
 * - RBI (https://www.rbi.org.in/Scripts/BS_ViewYieldCurve.aspx)
 * - MoSPI (https://mospi.gov.in/)
 * 
 * Last Updated: 2024-11-07
 * Next Review: 2025-01-01
 */
export const INDIA_2024_Q4: MarketAssumptions = {
  version: "2024-Q4",
  effectiveDate: new Date("2024-10-01"),
  region: "IN",
  
  assetClasses: {
    'equity-nifty50': {
      id: 'equity-nifty50',
      label: 'Nifty 50 Large Cap Equity',
      category: 'equity',
      nominalReturn: {
        mean: 12.0,        // Historical 25Y CAGR: 13.2%, adjusted for CAPE
        volatility: 18.0,  // Realized annualized vol
      },
      realReturn: {
        mean: 6.0,         // 12% - 6% inflation
        volatility: 19.2,  // Slightly higher due to inflation uncertainty
      },
      tradingCost: 10,     // 10 bps (0.1%) - includes STT, brokerage, slippage
    },
    
    'debt-govt-10y': {
      id: 'debt-govt-10y',
      label: '10-Year Government Bond',
      category: 'debt',
      nominalReturn: {
        mean: 7.2,         // Current 10Y G-Sec yield (Nov 2024)
        volatility: 4.5,   // Bond price volatility
      },
      realReturn: {
        mean: 1.2,         // 7.2% - 6% inflation
        volatility: 5.0,
      },
      tradingCost: 5,      // 5 bps
    },
    
    'gold': {
      id: 'gold',
      label: 'Gold (Physical/ETF)',
      category: 'commodity',
      nominalReturn: {
        mean: 8.0,         // Long-run: inflation + 2% risk premium
        volatility: 15.0,  // Moderate volatility
      },
      realReturn: {
        mean: 2.0,
        volatility: 15.5,
      },
      tradingCost: 50,     // Higher for physical; 10 bps for Gold ETF
    },
    
    'cash': {
      id: 'cash',
      label: 'Cash / Savings Account',
      category: 'cash',
      nominalReturn: {
        mean: 4.0,         // Current savings account rate
        volatility: 0.5,   // Minimal volatility
      },
      realReturn: {
        mean: -2.0,        // Negative real return (4% - 6%)
        volatility: 0.5,
      },
      tradingCost: 0,
    }
  },
  
  /**
   * Correlation Matrix
   * Order: [equity, debt, gold, cash]
   * 
   * Calculated from monthly returns (2014-2024):
   * - Equity-Debt: Low positive (flight to quality offset by both falling)
   * - Equity-Gold: Negative (gold as crisis hedge)
   * - Debt-Gold: Low positive
   * - Cash uncorrelated (zero volatility)
   */
  correlationMatrix: [
    // equity  debt   gold   cash
    [  1.00,  0.15, -0.10,  0.00 ],  // equity
    [  0.15,  1.00,  0.05,  0.00 ],  // debt
    [ -0.10,  0.05,  1.00,  0.00 ],  // gold
    [  0.00,  0.00,  0.00,  1.00 ]   // cash
  ],
  
  /**
   * Market Regimes
   * 
   * Calibrated using Hidden Markov Model on Nifty 50 monthly returns
   * Probability = long-run steady-state probability
   * Duration = average time spent in regime before transition
   */
  regimes: [
    {
      id: 'normal',
      probability: 0.70,   // 70% of the time
      duration: {
        mean: 5.0,         // 5 years average
        volatility: 2.0
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'debt-govt-10y': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'gold': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    },
    {
      id: 'bear',
      probability: 0.20,   // 20% of the time
      duration: {
        mean: 1.5,         // 18 months average
        volatility: 0.8
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: -0.3, volatilityMultiplier: 2.0 },  // -30% returns, 2x vol
        'debt-govt-10y': { returnMultiplier: 1.2, volatilityMultiplier: 0.8 },   // Flight to safety
        'gold': { returnMultiplier: 1.5, volatilityMultiplier: 1.3 },            // Crisis hedge
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    },
    {
      id: 'crisis',
      probability: 0.10,   // 10% of the time
      duration: {
        mean: 0.5,         // 6 months (short but severe)
        volatility: 0.3
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: -1.5, volatilityMultiplier: 3.0 },  // Crash
        'debt-govt-10y': { returnMultiplier: 1.5, volatilityMultiplier: 1.5 },
        'gold': { returnMultiplier: 2.0, volatilityMultiplier: 2.0 },
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    }
  ],
  
  inflation: {
    mean: 6.0,           // 10-year average CPI (2014-2024)
    volatility: 2.0,     // Year-to-year variation
    persistence: 0.6,    // Moderate autocorrelation
    regimeAdjustments: {
      'normal': 0,
      'bear': -1.0,      // Deflationary pressure
      'crisis': -2.0,    // Demand collapse
      'stagflation': 3.0 // (not in current regime set)
    }
  }
}
