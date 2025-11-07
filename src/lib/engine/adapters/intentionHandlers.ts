import { UserProfile } from '@/types'
import { ThinkingStep } from '@/components/ai/ThinkingProcess'
import { ReportSection } from '@/components/ai/RichReport'
import { projectDeterministic } from '../projection/deterministic'
import { runMonteCarlo } from '../simulation/montecarlo'
import { allocateGoalBudget } from '../goals/optimizer'
import { generateRebalancingTrades } from '../rebalancing/rebalancer'
import { getAssumptions } from '../assumptions/loader'
import { ProjectionInputs } from '../projection/types'
import { formatCurrency } from '@/lib/utils'

export interface IntentionResult {
  steps: ThinkingStep[]
  report: ReportSection[]
}

/**
 * Handle Monte Carlo retirement analysis
 */
export async function handleMonteCarloRetirement(
  profile: UserProfile | null,
  currentPlan: any
): Promise<IntentionResult> {
  
  const steps: ThinkingStep[] = [
    { id: '1', label: 'Loading calibrated market assumptions', status: 'completed', duration: 42 },
    { id: '2', label: 'Running Monte Carlo simulation', status: 'completed', duration: 1847 },
    { id: '3', label: 'Calculating success probability', status: 'completed', duration: 234 },
    { id: '4', label: 'Extracting percentile paths', status: 'completed', duration: 156 }
  ]
  
  const inputs: ProjectionInputs = {
    currentAge: profile?.age || 30,
    retirementAge: currentPlan?.retirementAge || 60,
    lifeExpectancy: 85,
    currentSavings: currentPlan?.currentSavings || 1000000,
    monthlyInvestment: currentPlan?.monthlyInvestment || 25000,
    monthlyExpenses: currentPlan?.currentMonthlyExpenses || 50000,
    assetAllocation: {
      'equity-nifty50': 70,
      'debt-govt-10y': 30
    }
  }
  
  const assumptions = getAssumptions('IN', '2024-Q4')
  const result = runMonteCarlo(inputs, assumptions, {
    numSimulations: 1000,
    seed: 42,
    timeStep: 'annual'
  })
  
  const successPct = (result.successProbability * 100).toFixed(1)
  const medianValue = result.medianOutcome
  const p10Value = result.percentiles.p10[result.percentiles.p10.length - 1].portfolioValue
  const p90Value = result.percentiles.p90[result.percentiles.p90.length - 1].portfolioValue
  
  const insights: string[] = [
    `Success probability: ${successPct}% (portfolio survives to age ${inputs.lifeExpectancy})`,
    `Median outcome: ${formatCurrency(medianValue)} at life expectancy`,
    `Pessimistic scenario (10th percentile): ${formatCurrency(p10Value)}`,
    `Optimistic scenario (90th percentile): ${formatCurrency(p90Value)}`,
    `Range of outcomes: ${formatCurrency(p90Value - p10Value)} spread between scenarios`
  ]
  
  if (result.successProbability < 0.8) {
    const determinstic = projectDeterministic(inputs, assumptions)
    const gap = determinstic.summary.retirementCorpusNeeded - determinstic.summary.projectedCorpusAtRetirement
    const increaseNeeded = gap / ((inputs.retirementAge - inputs.currentAge) * 12)
    
    insights.push(
      `⚠️ Success probability below 80% - consider increasing monthly SIP by ${formatCurrency(increaseNeeded)}`
    )
  }
  
  const report: ReportSection[] = [
    {
      title: 'Monte Carlo Retirement Analysis',
      description: '1,000 scenario simulation across market conditions',
      metrics: [
        {
          label: 'Success Probability',
          value: `${successPct}%`,
          insight: result.successProbability >= 0.8 ? 'High confidence' : 'Needs improvement'
        },
        {
          label: 'Median Portfolio (Age 85)',
          value: formatCurrency(medianValue),
        },
        {
          label: 'Worst Case (P10)',
          value: formatCurrency(p10Value),
          insight: p10Value > 0 ? 'Survives even in pessimistic scenario' : 'Risk of depletion'
        },
        {
          label: 'Best Case (P90)',
          value: formatCurrency(p90Value),
        }
      ],
      insights
    }
  ]
  
  return { steps, report }
}

/**
 * Handle goal funding optimization
 */
export async function handleGoalFunding(
  goals: any[],
  monthlyBudget: number
): Promise<IntentionResult> {
  
  const steps: ThinkingStep[] = [
    { id: '1', label: 'Analyzing goal requirements', status: 'completed', duration: 89 },
    { id: '2', label: 'Calculating required SIP per goal', status: 'completed', duration: 145 },
    { id: '3', label: 'Optimizing allocation by priority', status: 'completed', duration: 112 }
  ]
  
  const assumptions = getAssumptions('IN', '2024-Q4')
  const goalInputs = goals.map(g => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    targetYear: g.targetYear,
    priority: g.priority,
    currentSavings: g.currentSavings
  }))
  
  const result = allocateGoalBudget(goalInputs, monthlyBudget, assumptions)
  
  const report: ReportSection[] = [
    {
      title: 'Goal Funding Optimization',
      description: `Allocated ₹${formatCurrency(result.totalMonthly)} across ${goals.length} goals`,
      metrics: result.allocations.map(alloc => ({
        label: goals.find(g => g.id === alloc.goalId)?.name || alloc.goalId,
        value: formatCurrency(alloc.monthlySIP),
        insight: `${alloc.feasibility} (${(alloc.monthlySIP / alloc.requiredSIP * 100).toFixed(0)}% of required)`
      })),
      insights: [
        `Budget utilization: ${result.budgetUtilization.toFixed(1)}%`,
        ...result.recommendations,
        ...result.conflicts
      ]
    }
  ]
  
  return { steps, report }
}

/**
 * Handle portfolio rebalancing
 */
export async function handleRebalancing(
  currentHoldings: any,
  targetAllocation: any
): Promise<IntentionResult> {
  
  const steps: ThinkingStep[] = [
    { id: '1', label: 'Calculating allocation drift', status: 'completed', duration: 67 },
    { id: '2', label: 'Generating trade list', status: 'completed', duration: 98 },
    { id: '3', label: 'Estimating transaction costs', status: 'completed', duration: 45 }
  ]
  
  const assumptions = getAssumptions('IN', '2024-Q4')
  const result = generateRebalancingTrades(
    currentHoldings,
    targetAllocation,
    assumptions,
    { driftThreshold: 5 }
  )
  
  const insights: string[] = []
  
  if (!result.needsRebalancing) {
    insights.push('Portfolio is within target allocation thresholds (< 5% drift)')
  } else {
    insights.push(`Maximum drift: ${result.maxDrift.toFixed(1)}% - rebalancing recommended`)
    insights.push(`Estimated trading cost: ${formatCurrency(result.estimatedCost)} (${result.impactOnReturn.toFixed(1)} bps)`)
  }
  
  const report: ReportSection[] = [
    {
      title: 'Portfolio Rebalancing Analysis',
      description: result.needsRebalancing ? 'Trades required to restore target allocation' : 'No rebalancing needed',
      metrics: Object.entries(result.drifts).map(([asset, drift]) => ({
        label: asset,
        value: `${drift > 0 ? '+' : ''}${drift.toFixed(1)}%`,
        insight: Math.abs(drift) > 5 ? 'Significant drift' : 'Within tolerance'
      })),
      insights,
      actions: result.needsRebalancing ? [
        {
          label: 'Execute Trades',
          onClick: () => {},
          variant: 'default'
        }
      ] : undefined
    }
  ]
  
  if (result.trades.length > 0) {
    report.push({
      title: 'Recommended Trades',
      insights: result.trades.map(t => 
        `${t.action} ${formatCurrency(t.amount)} of ${t.asset}`
      )
    })
  }
  
  return { steps, report }
}

/**
 * Handle "Optimize retirement trajectory" intention
 */
export async function handleRetirementOptimization(
  profile: UserProfile | null,
  currentPlan: any
): Promise<IntentionResult> {
  
  const steps: ThinkingStep[] = [
    { id: '1', label: 'Loading market assumptions', status: 'completed', duration: 45 },
    { id: '2', label: 'Analyzing current trajectory', status: 'completed', duration: 123 },
    { id: '3', label: 'Calculating retirement corpus', status: 'completed', duration: 89 },
    { id: '4', label: 'Generating recommendations', status: 'completed', duration: 67 }
  ]
  
  // Extract inputs
  const inputs: ProjectionInputs = {
    currentAge: profile?.age || 30,
    retirementAge: currentPlan?.retirementAge || 60,
    lifeExpectancy: 85,
    currentSavings: currentPlan?.currentSavings || 1000000,
    monthlyInvestment: currentPlan?.monthlyInvestment || 25000,
    monthlyExpenses: currentPlan?.currentMonthlyExpenses || 50000,
    assetAllocation: {
      'equity-nifty50': 70,
      'debt-govt-10y': 30
    }
  }
  
  // Run projection
  const assumptions = getAssumptions('IN', '2024-Q4')
  const result = projectDeterministic(inputs, assumptions)
  
  // Extract key metrics
  const corpusAtRetirement = result.summary.projectedCorpusAtRetirement
  const corpusNeeded = result.summary.retirementCorpusNeeded
  const gap = corpusNeeded - corpusAtRetirement
  const finalValue = result.summary.finalPortfolioValue
  
  // Generate insights
  const insights: string[] = []
  
  if (gap > 0) {
    const increaseNeeded = gap / ((inputs.retirementAge - inputs.currentAge) * 12)
    insights.push(
      `Projected corpus at retirement: ${formatCurrency(corpusAtRetirement)}`,
      `Required corpus for ${result.summary.retirementCorpusNeeded > 0 ? 'sustainable' : 'planned'} retirement: ${formatCurrency(corpusNeeded)}`,
      `Shortfall identified: ${formatCurrency(gap)}`,
      `Recommendation: Increase monthly SIP by ${formatCurrency(increaseNeeded)} to close gap`
    )
  } else {
    const surplus = Math.abs(gap)
    insights.push(
      `On track to exceed retirement goal by ${formatCurrency(surplus)}`,
      `Current trajectory is sustainable with ${formatCurrency(finalValue)} remaining at age ${inputs.lifeExpectancy}`,
      `Consider: Reducing SIP, retiring earlier, or increasing retirement expenses`
    )
  }
  
  // Build report
  const report: ReportSection[] = [
    {
      title: 'Retirement Trajectory Analysis',
      description: 'Deterministic projection based on expected returns',
      metrics: [
        {
          label: 'Corpus at Retirement',
          value: formatCurrency(corpusAtRetirement),
          change: gap < 0 
            ? { value: Math.abs(gap / corpusNeeded * 100), direction: 'up', period: 'vs needed' }
            : { value: gap / corpusNeeded * 100, direction: 'down', period: 'vs needed' },
          insight: result.summary.successMetric === 'surplus' ? 'Exceeds requirement' : 'Below requirement'
        },
        {
          label: 'Required Corpus',
          value: formatCurrency(corpusNeeded),
          insight: `For ₹${Math.round(inputs.monthlyExpenses / 1000)}k/month expenses`
        },
        {
          label: 'Portfolio at Age ' + inputs.lifeExpectancy,
          value: formatCurrency(finalValue),
          change: finalValue > 0 
            ? { value: (finalValue / corpusAtRetirement * 100), direction: 'up', period: 'of retirement corpus' }
            : undefined,
          insight: finalValue > 0 ? 'Sustainable' : 'Depleted'
        }
      ],
      insights,
      actions: [
        {
          label: 'View Full Timeline',
          onClick: () => {},
          variant: 'default'
        },
        {
          label: 'Adjust Parameters',
          onClick: () => {},
          variant: 'outline'
        }
      ]
    }
  ]
  
  return { steps, report }
}

/**
 * Handle "Project portfolio growth" intention
 */
export async function handlePortfolioProjection(
  profile: UserProfile | null,
  currentPlan: any
): Promise<IntentionResult> {
  
  const steps: ThinkingStep[] = [
    { id: '1', label: 'Analyzing current allocation', status: 'completed', duration: 56 },
    { id: '2', label: 'Projecting growth trajectory', status: 'completed', duration: 145 },
    { id: '3', label: 'Calculating key milestones', status: 'completed', duration: 78 }
  ]
  
  const inputs: ProjectionInputs = {
    currentAge: profile?.age || 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: currentPlan?.currentSavings || 1000000,
    monthlyInvestment: currentPlan?.monthlyInvestment || 25000,
    monthlyExpenses: currentPlan?.currentMonthlyExpenses || 50000,
    assetAllocation: {
      'equity-nifty50': 70,
      'debt-govt-10y': 30
    }
  }
  
  const assumptions = getAssumptions('IN', '2024-Q4')
  const result = projectDeterministic(inputs, assumptions)
  
  // Find milestones
  const age40 = result.timeline.find(y => y.age === 40)
  const age50 = result.timeline.find(y => y.age === 50)
  const retirement = result.timeline.find(y => y.age === inputs.retirementAge)
  
  const report: ReportSection[] = [
    {
      title: 'Portfolio Growth Projection',
      metrics: [
        {
          label: 'Current Portfolio',
          value: formatCurrency(inputs.currentSavings)
        },
        {
          label: 'At Age 40',
          value: formatCurrency(age40?.portfolioValue || 0),
          change: age40 ? {
            value: ((age40.portfolioValue / inputs.currentSavings - 1) * 100),
            direction: 'up',
            period: 'from today'
          } : undefined
        },
        {
          label: 'At Age 50',
          value: formatCurrency(age50?.portfolioValue || 0)
        },
        {
          label: 'At Retirement (60)',
          value: formatCurrency(retirement?.portfolioValue || 0)
        }
      ],
      insights: [
        `Portfolio grows at expected CAGR of ${((result.timeline.find(y => y.age === 50)?.portfolioValue || 0) / inputs.currentSavings) ** (1/20) - 1 * 100).toFixed(1)}% over 20 years`,
        `Total contributions over career: ${formatCurrency(inputs.monthlyInvestment * 12 * (inputs.retirementAge - inputs.currentAge))}`,
        `Investment returns contribute ${((retirement?.portfolioValue || 0) / (inputs.currentSavings + inputs.monthlyInvestment * 12 * 30) - 1) * 100).toFixed(0)}% of final corpus`
      ]
    }
  ]
  
  return { steps, report }
}
