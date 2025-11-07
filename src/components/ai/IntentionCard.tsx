'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export interface Intention {
  id: string
  title: string
  description: string
  complexity: 'simple' | 'moderate' | 'complex'
  category: 'retirement' | 'portfolio' | 'goals' | 'tax' | 'analysis'
  estimatedTime?: string
  action: () => void
}

interface IntentionCardProps {
  intention: Intention
  variant?: 'default' | 'featured'
}

export function IntentionCard({ intention, variant = 'default' }: IntentionCardProps) {
  const complexityColor = {
    simple: 'text-green-600',
    moderate: 'text-amber-600',
    complex: 'text-red-600',
  }

  const isFeatured = variant === 'featured'

  return (
    <Card 
      className={`
        cursor-pointer transition-all hover:shadow-lg hover:border-primary
        ${isFeatured ? 'border-primary bg-primary/5' : ''}
      `}
      onClick={intention.action}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {intention.title}
              {isFeatured && <Sparkles className="h-4 w-4 text-primary" />}
            </CardTitle>
            <CardDescription className="text-sm">
              {intention.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={`capitalize font-medium ${complexityColor[intention.complexity]}`}>
              {intention.complexity}
            </span>
            {intention.estimatedTime && (
              <>
                <span>•</span>
                <span>{intention.estimatedTime}</span>
              </>
            )}
          </div>
          <Button size="sm" variant="ghost">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
