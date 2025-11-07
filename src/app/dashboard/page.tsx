'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useFinancialStore } from '@/store/useFinancialStore'
import { CommandBar, CommandSuggestions } from '@/components/ai/CommandBar'
import { ThinkingProcess, ThinkingStep } from '@/components/ai/ThinkingProcess'
import { RichReport, ReportSection } from '@/components/ai/RichReport'
import { Intention } from '@/components/ai/IntentionCard'
import { getIntelligentSuggestions } from '@/lib/nlp/matcher'
import { handleRetirementOptimization, handlePortfolioProjection } from '@/lib/engine/adapters/intentionHandlers'

export default function DashboardPage() {
  const { isDarkMode, profile, retirementPlan } = useFinancialStore()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Intention[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])

  // Command bar is active (bottom position) when: typing, processing, or showing report
  const isActive = query.length > 0 || isProcessing || showReport

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleGetSuggestions = (q: string): Intention[] => {
    if (q.trim().length < 2) {
      setSuggestions([])
      return []
    }
    
    const results = getIntelligentSuggestions(q)
    setSuggestions(results)
    setSelectedIndex(0)
    setQuery(q)
    return results
  }

  const [reportSections, setReportSections] = useState<ReportSection[]>([])

  const handleExecute = async (intention: Intention) => {
    setIsProcessing(true)
    setShowReport(false)

    // Call real engine based on intention
    let result
    
    if (intention.id.includes('retirement') || intention.id === 'optimize-retirement-success') {
      result = await handleRetirementOptimization(profile, retirementPlan)
    } else if (intention.id.includes('projection') || intention.id === 'monte-carlo-projection') {
      result = await handlePortfolioProjection(profile, retirementPlan)
    } else {
      // Fallback for not-yet-implemented intentions
      result = await handleRetirementOptimization(profile, retirementPlan)
    }
    
    // Animate through thinking steps
    setThinkingSteps(result.steps.map(s => ({ ...s, status: 'pending' })))
    
    for (let i = 0; i < result.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      setThinkingSteps(prev => prev.map((step, index) => {
        if (index === i) return { ...result.steps[i], status: 'completed' }
        if (index === i + 1) return { ...result.steps[i + 1], status: 'active' }
        return step
      }))
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    setReportSections(result.report)
    setIsProcessing(false)
    setShowReport(true)
  }



  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Content Area - grows to fill space */}
        <div className={`
          flex-1 container px-4 md:px-8 transition-all duration-500 ease-in-out
          ${isActive ? 'py-8' : 'flex items-center justify-center'}
        `}>
          {/* Suggestions appear here when typing */}
          {query.length > 0 && !isProcessing && !showReport && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
              {suggestions.length > 0 ? (
                <CommandSuggestions
                  suggestions={suggestions}
                  selectedIndex={selectedIndex}
                  onSelect={handleExecute}
                  onHover={setSelectedIndex}
                />
              ) : (
                <div className="w-full max-w-3xl mx-auto text-center py-12">
                  <p className="text-muted-foreground">
                    No matching analyses found. Try refining your query.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
              <ThinkingProcess 
                steps={thinkingSteps}
                onComplete={() => {}}
              />
            </div>
          )}

          {/* Report */}
          {showReport && (
            <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
              <RichReport
                title="Portfolio Optimization Report"
                subtitle="Generated based on your current holdings and goals"
                sections={reportSections}
                onExport={() => console.log('Export')}
                onShare={() => console.log('Share')}
              />
            </div>
          )}

          {/* Empty state - command bar is in center below */}
        </div>

        {/* Command Bar - transitions from center to bottom */}
        <div className={`
          container px-4 md:px-8 transition-all duration-500 ease-in-out
          ${isActive 
            ? 'pb-8 pt-0' 
            : 'pb-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full'
          }
        `}>
          <CommandBar
            onExecute={handleExecute}
            getSuggestions={handleGetSuggestions}
            isActive={isActive}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
