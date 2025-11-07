'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, TrendingUp, PieChart, Shield, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { APP_NAME } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 md:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">

            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Plan Your Financial Future with{' '}
              <span className="text-primary">Confidence</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              AI-powered financial planning for multi-generational wealth and everyday investors.
            </p>
            
            <div className="flex justify-center">
              <Button size="xl" asChild>
                <Link href="/dashboard">
                  Start Planning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container px-4 md:px-8 py-16 bg-muted/30">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Plan Your Future
              </h2>
              <p className="text-muted-foreground text-lg">
                Comprehensive tools for complete financial planning
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Probabilistic Planning</CardTitle>
                  <CardDescription>
                    Monte Carlo simulations with success probability across scenarios
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Optimization</CardTitle>
                  <CardDescription>
                    Asset allocation, rebalancing, and tax-aware trade suggestions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Multi-Account Management</CardTitle>
                  <CardDescription>
                    Unified view across taxable, retirement, and trust accounts
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>




      </main>
      
      <Footer />
    </div>
  )
}
