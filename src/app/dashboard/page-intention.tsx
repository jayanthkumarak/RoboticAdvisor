'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useFinancialStore } from '@/store/useFinancialStore'
import { IntentionCard, Intention } from '@/components/ai/IntentionCard'
import { ThinkingProcess, ThinkingStep } from '@/components/ai/ThinkingProcess'
import { RichReport, ReportSection } from '@/components/ai/RichReport'
import { getFeaturedIntentions, getQuickIntentions } from '@/lib/intentions'

export default function DashboardPage() {
  const { profile, isDarkMode } = useFinancialStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleIntention = async (intentionId: string) => {
    setIsProcessing(true)
    setShowReport(false)

    const steps: ThinkingStep[] = [
      { id: '1', label: 'Analyzing current portfolio allocation', status: 'active', detail: 'Retrieving account positions...' },
      { id: '2', label: 'Running Monte Carlo simulations', status: 'pending', detail: '10,000 scenarios' },
      { id: '3', label: 'Computing optimal rebalancing trades', status: 'pending' },
      { id: '4', label: 'Generating recommendations', status: 'pending' },
    ]
    
    setThinkingSteps(steps)

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setThinkingSteps(prev => prev.map((step, index) => {
        if (index === i) return { ...step, status: 'completed', duration: Math.random() * 1000 + 500 }
        if (index === i + 1) return { ...step, status: 'active' }
        return step
      }))
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    setIsProcessing(false)
    setShowReport(true)
  }

  const featuredIntentions = getFeaturedIntentions(profile).map(i => ({
    ...i,
    action: () => handleIntention(i.id)
  }))

  const quickIntentions = getQuickIntentions().map(i => ({
    ...i,
    action: () => handleIntention(i.id)
  }))

  const reportSections: ReportSection[] = [
    {
      title: 'Portfolio Analysis',
      description: 'Current state and optimization opportunities',
      metrics: [
        {
          label: 'Retirement Success Probability',
          value: '73%',
          change: { value: 8, direction: 'up', period: 'vs last month' },
          insight: 'Increased contributions improved outlook',
        },
        {
          label: 'Portfolio Value',
          value: '₹45.2L',
          change: { value: 12.3, direction: 'up', period: 'YTD' },
        },
        {
          label: 'Allocation Drift',
          value: '8.5%',
          change: { value: 3.2, direction: 'up', period: 'from target' },
          insight: 'Rebalancing recommended',
        },
      ],
      insights: [
        'Current equity allocation (68%) exceeds target (60%) by 8 percentage points',
        'Increasing monthly SIP by ₹8,500 would raise success probability to 90%',
        'Tax-loss harvesting opportunity identified: potential ₹45,000 savings',
      ],
      actions: [
        {
          label: 'View Detailed Projections',
          onClick: () => {},
          variant: 'default',
        },
        {
          label: 'Execute Rebalancing',
          onClick: () => {},
          variant: 'outline',
        },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile ? `Welcome back, ${profile.name}` : 'Financial Planning Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-2">
              What would you like to work on?
            </p>
          </div>

          {/* Featured Intention */}
          {!isProcessing && !showReport && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recommended Next Action</h2>
              <div className="grid gap-4">
                {featuredIntentions.map(intention => (
                  <IntentionCard
                    key={intention.id}
                    intention={intention}
                    variant="featured"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Intentions */}
          {!isProcessing && !showReport && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickIntentions.map(intention => (
                  <IntentionCard
                    key={intention.id}
                    intention={intention}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processing View */}
          {isProcessing && (
            <ThinkingProcess 
              steps={thinkingSteps}
              onComplete={() => {}}
            />
          )}

          {/* Report View */}
          {showReport && (
            <RichReport
              title="Portfolio Optimization Report"
              subtitle="Generated based on your current holdings and goals"
              sections={reportSections}
              onExport={() => console.log('Export')}
              onShare={() => console.log('Share')}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
