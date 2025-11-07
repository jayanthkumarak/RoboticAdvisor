'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

export interface ReportMetric {
  label: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period?: string
  }
  insight?: string
}

export interface ReportSection {
  title: string
  description?: string
  metrics?: ReportMetric[]
  visualization?: ReactNode
  insights?: string[]
  actions?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }[]
}

interface RichReportProps {
  title: string
  subtitle?: string
  sections: ReportSection[]
  onExport?: () => void
  onShare?: () => void
}

export function RichReport({ title, subtitle, sections, onExport, onShare }: RichReportProps) {
  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onShare && (
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Metrics Grid */}
              {section.metrics && section.metrics.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.metrics.map((metric, mIndex) => (
                    <div key={mIndex} className="space-y-2">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        {metric.change && (
                          <div className={`
                            flex items-center gap-1 text-xs font-medium
                            ${metric.change.direction === 'up' ? 'text-green-600' : ''}
                            ${metric.change.direction === 'down' ? 'text-red-600' : ''}
                            ${metric.change.direction === 'neutral' ? 'text-muted-foreground' : ''}
                          `}>
                            {metric.change.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                            {metric.change.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                            {metric.change.direction === 'neutral' && <Minus className="h-3 w-3" />}
                            <span>{metric.change.value}%</span>
                            {metric.change.period && (
                              <span className="text-muted-foreground">({metric.change.period})</span>
                            )}
                          </div>
                        )}
                      </div>
                      {metric.insight && (
                        <p className="text-xs text-muted-foreground">{metric.insight}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Visualization */}
              {section.visualization && (
                <div className="rounded-lg border bg-card p-4">
                  {section.visualization}
                </div>
              )}

              {/* Insights */}
              {section.insights && section.insights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Insights</p>
                  <ul className="space-y-2">
                    {section.insights.map((insight, iIndex) => (
                      <li key={iIndex} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {section.actions && section.actions.length > 0 && (
                <div className="flex gap-2 pt-2 border-t">
                  {section.actions.map((action, aIndex) => (
                    <Button
                      key={aIndex}
                      size="sm"
                      variant={action.variant || 'outline'}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
