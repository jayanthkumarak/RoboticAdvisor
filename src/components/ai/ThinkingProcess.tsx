'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface ThinkingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  detail?: string
  duration?: number
}

interface ThinkingProcessProps {
  steps: ThinkingStep[]
  onComplete?: () => void
}

export function ThinkingProcess({ steps, onComplete }: ThinkingProcessProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const allCompleted = steps.every(s => s.status === 'completed')
    if (allCompleted && onComplete) {
      onComplete()
    }
  }, [steps, onComplete])

  return (
    <Card className="border-primary/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing your request
          </div>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  flex items-start gap-3 transition-all duration-300
                  ${step.status === 'active' ? 'opacity-100' : ''}
                  ${step.status === 'pending' ? 'opacity-40' : ''}
                  ${step.status === 'completed' ? 'opacity-70' : ''}
                `}
              >
                <div className="mt-0.5">
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {step.status === 'active' && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {step.status === 'error' && (
                    <Circle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className={`
                    text-sm font-medium
                    ${step.status === 'active' ? 'text-primary' : ''}
                    ${step.status === 'completed' ? 'text-foreground' : ''}
                    ${step.status === 'pending' ? 'text-muted-foreground' : ''}
                  `}>
                    {step.label}
                  </div>
                  
                  {step.detail && step.status === 'active' && (
                    <div className="text-xs text-muted-foreground animate-pulse">
                      {step.detail}
                    </div>
                  )}
                  
                  {step.duration && step.status === 'completed' && (
                    <div className="text-xs text-muted-foreground">
                      Completed in {step.duration}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
