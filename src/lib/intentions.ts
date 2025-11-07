import { Intention } from '@/components/ai/IntentionCard'

export const RETIREMENT_INTENTIONS: Intention[] = [
  {
    id: 'optimize-retirement-success',
    title: 'Maximize retirement success probability to 90%+',
    description: 'Monte Carlo analysis with SIP/age/expense adjustments to reach target confidence',
    complexity: 'complex',
    category: 'retirement',
    estimatedTime: '~30s',
    action: () => {},
  },
  {
    id: 'early-retirement-feasibility',
    title: 'Evaluate early retirement at age X',
    description: 'Project corpus growth and withdrawal sustainability for custom retirement age',
    complexity: 'complex',
    category: 'retirement',
    estimatedTime: '~25s',
    action: () => {},
  },
  {
    id: 'retirement-income-gap',
    title: 'Identify and close retirement income shortfall',
    description: 'Calculate gap between projected corpus and needs, suggest corrective actions',
    complexity: 'moderate',
    category: 'retirement',
    estimatedTime: '~20s',
    action: () => {},
  },
]

export const PORTFOLIO_INTENTIONS: Intention[] = [
  {
    id: 'rebalance-portfolio',
    title: 'Generate tax-efficient rebalancing trades',
    description: 'Identify allocation drift and create trade list to restore target weights',
    complexity: 'moderate',
    category: 'portfolio',
    estimatedTime: '~15s',
    action: () => {},
  },
  {
    id: 'optimize-allocation',
    title: 'Optimize asset allocation for risk-adjusted returns',
    description: 'Modern portfolio theory optimization with constraints and glidepath',
    complexity: 'complex',
    category: 'portfolio',
    estimatedTime: '~35s',
    action: () => {},
  },
  {
    id: 'tax-loss-harvest',
    title: 'Identify tax-loss harvesting opportunities',
    description: 'Find positions with unrealized losses and suggest replacement securities',
    complexity: 'moderate',
    category: 'tax',
    estimatedTime: '~20s',
    action: () => {},
  },
  {
    id: 'factor-analysis',
    title: 'Analyze portfolio factor exposures',
    description: 'Evaluate concentration in size, value, momentum, quality factors',
    complexity: 'complex',
    category: 'analysis',
    estimatedTime: '~25s',
    action: () => {},
  },
]

export const GOAL_INTENTIONS: Intention[] = [
  {
    id: 'allocate-budget-goals',
    title: 'Allocate monthly budget across financial goals',
    description: 'Priority-based optimizer to distribute SIP across multiple goals',
    complexity: 'moderate',
    category: 'goals',
    estimatedTime: '~18s',
    action: () => {},
  },
  {
    id: 'goal-trade-off',
    title: 'Analyze trade-offs between conflicting goals',
    description: 'Show impact of prioritizing one goal over others with timelines',
    complexity: 'moderate',
    category: 'goals',
    estimatedTime: '~22s',
    action: () => {},
  },
  {
    id: 'goal-feasibility',
    title: 'Assess feasibility of all active goals',
    description: 'Monte Carlo probability of achieving each goal given current trajectory',
    complexity: 'complex',
    category: 'goals',
    estimatedTime: '~30s',
    action: () => {},
  },
]

export const ANALYSIS_INTENTIONS: Intention[] = [
  {
    id: 'monte-carlo-projection',
    title: 'Project portfolio growth with uncertainty bands',
    description: '10,000 scenario simulation showing 10th/50th/90th percentile outcomes',
    complexity: 'moderate',
    category: 'analysis',
    estimatedTime: '~12s',
    action: () => {},
  },
  {
    id: 'stress-test',
    title: 'Stress test portfolio against market scenarios',
    description: 'Simulate 2008 crisis, inflation shock, stagflation impacts on plan',
    complexity: 'complex',
    category: 'analysis',
    estimatedTime: '~28s',
    action: () => {},
  },
  {
    id: 'sensitivity-analysis',
    title: 'Analyze sensitivity to key assumptions',
    description: 'Show how changes in returns, inflation, contributions affect outcomes',
    complexity: 'simple',
    category: 'analysis',
    estimatedTime: '~10s',
    action: () => {},
  },
  {
    id: 'what-if-scenario',
    title: 'Model custom what-if scenario',
    description: 'Project impact of life events: job change, house purchase, inheritance',
    complexity: 'moderate',
    category: 'analysis',
    estimatedTime: '~15s',
    action: () => {},
  },
]

export const TAX_INTENTIONS: Intention[] = [
  {
    id: 'asset-location',
    title: 'Optimize asset location across account types',
    description: 'Place tax-inefficient assets in tax-advantaged accounts for maximum efficiency',
    complexity: 'complex',
    category: 'tax',
    estimatedTime: '~25s',
    action: () => {},
  },
  {
    id: 'withdrawal-strategy',
    title: 'Optimize withdrawal order in retirement',
    description: 'Sequence withdrawals from taxable/IRA/Roth to minimize lifetime taxes',
    complexity: 'complex',
    category: 'tax',
    estimatedTime: '~30s',
    action: () => {},
  },
]

export const ALL_INTENTIONS: Intention[] = [
  ...RETIREMENT_INTENTIONS,
  ...PORTFOLIO_INTENTIONS,
  ...GOAL_INTENTIONS,
  ...ANALYSIS_INTENTIONS,
  ...TAX_INTENTIONS,
]

export function getFeaturedIntentions(profile?: any): Intention[] {
  if (!profile) {
    return [ANALYSIS_INTENTIONS[0]]
  }

  return [RETIREMENT_INTENTIONS[0]]
}

export function getIntentionsByCategory(category: string): Intention[] {
  return ALL_INTENTIONS.filter(i => i.category === category)
}

export function getQuickIntentions(): Intention[] {
  return [
    PORTFOLIO_INTENTIONS[0],
    GOAL_INTENTIONS[0],
    ANALYSIS_INTENTIONS[0],
  ]
}
