'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Command } from 'lucide-react'
import { Intention } from './IntentionCard'

interface CommandBarProps {
  onExecute: (intention: Intention) => void
  getSuggestions: (query: string) => Intention[]
  isActive?: boolean
}

export function CommandBar({ onExecute, getSuggestions, isActive = false }: CommandBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Intention[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (query.trim().length > 0) {
      const results = getSuggestions(query)
      setSuggestions(results)
      setSelectedIndex(0)
      setIsOpen(results.length > 0)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [query, getSuggestions])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          handleExecute(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        inputRef.current?.blur()
        break
    }
  }

  const handleExecute = (intention: Intention) => {
    onExecute(intention)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const complexityColor = {
    simple: 'text-green-600 dark:text-green-400',
    moderate: 'text-amber-600 dark:text-amber-400',
    complex: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="What would you like to analyze?"
          className="w-full h-14 pl-12 pr-20 text-lg rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </div>
    </div>
  )
}

interface CommandSuggestionsProps {
  suggestions: Intention[]
  selectedIndex: number
  onSelect: (intention: Intention) => void
  onHover: (index: number) => void
}

export function CommandSuggestions({ 
  suggestions, 
  selectedIndex, 
  onSelect, 
  onHover 
}: CommandSuggestionsProps) {
  const complexityColor = {
    simple: 'text-green-600 dark:text-green-400',
    moderate: 'text-amber-600 dark:text-amber-400',
    complex: 'text-red-600 dark:text-red-400',
  }

  if (suggestions.length === 0) return null

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={() => onHover(index)}
          className={`
            w-full px-6 py-4 text-left transition-all rounded-lg
            ${index === selectedIndex 
              ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]' 
              : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/50'
            }
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base mb-1.5">
                {suggestion.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {suggestion.description}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0 mt-1">
              <span className={`font-medium ${complexityColor[suggestion.complexity]}`}>
                {suggestion.complexity}
              </span>
              {suggestion.estimatedTime && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {suggestion.estimatedTime}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
