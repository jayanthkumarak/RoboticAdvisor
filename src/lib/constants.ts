export const APP_NAME = 'RoboAdvisor'
export const APP_DESCRIPTION = 'Modern web-based robo advisory platform for comprehensive financial planning'

export const AGE_LIMITS = {
  MIN: 18,
  MAX: 80,
}

export const RETIREMENT_AGE_LIMITS = {
  MIN: 40,
  MAX: 75,
}

export const LIFE_EXPECTANCY_DEFAULT = 85

export const INFLATION_RATE_DEFAULT = 6

export const EXPECTED_RETURN = {
  EQUITY: 12,
  DEBT: 7,
  BALANCED: 9.5,
}

export const ASSET_ALLOCATION_PRESETS = {
  CONSERVATIVE: { equity: 20, debt: 70, gold: 10 },
  MODERATE: { equity: 40, debt: 50, gold: 10 },
  BALANCED: { equity: 60, debt: 30, gold: 10 },
  AGGRESSIVE: { equity: 80, debt: 15, gold: 5 },
  VERY_AGGRESSIVE: { equity: 90, debt: 8, gold: 2 },
}

export const GOAL_TYPES = {
  NON_RECURRING: [
    'Child Education',
    'Child Marriage',
    'Home Purchase',
    'Vehicle Purchase',
    'Business Start',
    'Other Goal',
  ],
  RECURRING: [
    'Annual Vacation',
    'Festival Expenses',
    'Home Renovation',
    'Vehicle Upgrade',
  ],
}

export const INCOME_SOURCES = [
  'Salary/Business Income',
  'Rental Income',
  'Pension',
  'Other Income',
]

export const BUCKET_STRATEGY = {
  BUCKET_1_YEARS: 3,
  BUCKET_2_YEARS: 7,
  BUCKET_3_YEARS: 10,
}

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
}

export const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
]
