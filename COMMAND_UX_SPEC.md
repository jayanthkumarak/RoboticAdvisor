# Command-First UX Specification

## 🎯 Design Philosophy

**Principle:** Respect the user's focus. Don't distract. Only show what's highly relevant.

---

## 📐 Spatial Dynamics

### **Initial State: Center Focus**

```
┌────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│     ┌───────────────────────────────┐      │
│     │ 🔍 What would you like to... │      │  ← Command bar CENTERED
│     └───────────────────────────────┘      │
│                                             │
│                                             │
│                                             │
└────────────────────────────────────────────┘
```

**State:**
- Command bar is vertically and horizontally centered
- Nothing else visible
- User's complete attention on input

---

### **Active State: Bottom Anchored**

```
┌────────────────────────────────────────────┐
│  ┌───────────────────────────────────┐     │
│  │ Optimize retirement trajectory    │     │  ← Suggestions appear
│  │ Complex • ~30s                    │     │     in content area
│  ├───────────────────────────────────┤     │
│  │ Evaluate early retirement         │     │
│  │ Complex • ~25s                    │     │
│  └───────────────────────────────────┘     │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 🔍 optimize retirement▊            │    │  ← Bar moves to BOTTOM
│ └─────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

**Transition triggered by:**
- User types any character
- Query length > 0

**Animation:**
- Duration: 500ms
- Easing: ease-in-out
- Command bar slides from center → bottom
- Content area fades in from bottom

---

### **Processing State: Results Above Bar**

```
┌────────────────────────────────────────────┐
│  ⟳ Running Monte Carlo simulations...      │
│  ✓ Analyzing allocation (847ms)            │  ← Thinking Process
│  ○ Computing optimal trades                │     OR
│  ○ Generating recommendations              │     Rich Report
│                                             │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 🔍 optimize retirement             │    │  ← Bar stays BOTTOM
│ └─────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

**State:**
- Command bar remains at bottom (sticky)
- Processing visualization appears in content area
- User can still see their query

---

## 🎨 Visual Components

### **1. Command Bar**

**Empty State:**
```tsx
<input placeholder="What would you like to analyze?" />
```

**Features:**
- Large, prominent input (h-14, text-lg)
- Search icon left
- Cmd+K shortcut indicator right
- Focus ring: 2px primary color
- No dropdown, no clutter

**Keyboard Shortcuts:**
- `Cmd+K` / `Ctrl+K`: Focus command bar
- `Escape`: Clear and unfocus
- `Enter`: Execute selected suggestion
- `↑` / `↓`: Navigate suggestions

---

### **2. Suggestions Display**

**HIGH SIGNAL FILTER:**
- Relevance threshold: 0.35 (out of 1.0)
- Maximum suggestions: 5
- Only show if score > threshold

**Visual Design:**
```
┌───────────────────────────────────────────┐
│ Optimize retirement trajectory            │ ← Title (semibold, base)
│ Analyze current savings rate...           │ ← Description (sm, muted)
│                           complex • ~30s   │ ← Meta (xs, right-aligned)
└───────────────────────────────────────────┘
```

**Selected State:**
- Border: 2px primary
- Background: primary/10
- Scale: 1.02
- Shadow: lg

**Hover State:**
- Border: primary/50
- Background: muted

**NO NOISE:**
- No decorative icons
- No badges
- No thumbnails
- No unnecessary metadata

---

## 🧠 Intelligent Matching

### **Natural Language Parser**

**Pattern Matching:**
```typescript
Input: "optimize retirement"
  → Matches: retirement intentions
  → Score boost: 0.3 (category match)
  → Top result: "Optimize retirement trajectory..."

Input: "rebalance 90% success"
  → Matches: portfolio + retirement
  → Extracts parameter: targetSuccess = 90
  → Top result: "Optimize retirement for 90% success"

Input: "retire at 55"
  → Matches: retirement
  → Extracts parameter: age = 55
  → Top result: "Evaluate early retirement at age 55"
```

**Fuzzy Scoring:**
```typescript
function fuzzyScore(query, text):
  if text.includes(query):  return 0.9  // Substring match
  
  // Character-by-character match
  score = matchedChars / totalChars
  return score
```

**Keyword Boosts:**
```typescript
Keywords:
- "optimize", "maximize", "improve" → +0.2
- "success", "probability" → +0.15
- Contains percentage (e.g., "90%") → +0.1
- Category match (e.g., "retire" → retirement) → +0.3
```

---

## 🔄 User Flows

### **Flow 1: Direct Match**

```
User: [types] "rebalance"
  ↓
System: [matches] PORTFOLIO_INTENTIONS.rebalance
  ↓
Display: "Generate tax-efficient rebalancing trades"
  ↓
User: [presses Enter]
  ↓
Execute: ThinkingProcess → RichReport
```

### **Flow 2: Parameter Extraction**

```
User: [types] "retire at 55"
  ↓
System: 
  - Matches: RETIREMENT_INTENTIONS.earlyRetirement
  - Extracts: { age: 55 }
  ↓
Display: "Evaluate early retirement at age 55"
  ↓
Execute: Analysis with age parameter pre-filled
```

### **Flow 3: No Match**

```
User: [types] "xyz random"
  ↓
System: [calculates scores]
  - All scores < 0.35 threshold
  ↓
Display: "No matching analyses found. Try refining..."
  ↓
NO suggestions shown (high signal filter)
```

---

## 🚫 What's NOT Shown

### **Eliminated Noise:**

❌ Fake statistics  
❌ "Recent analyses" history  
❌ "Quick actions" button grid  
❌ Tutorial tooltips  
❌ Feature cards  
❌ Decorative illustrations  
❌ Low-relevance suggestions  
❌ "Did you mean..." corrections  
❌ Promotional banners  
❌ Progress indicators (except during execution)  

**Why:** Every element is a potential distraction. Show ONLY what's essential.

---

## 📊 Relevance Algorithm

```typescript
interface ScoredIntention {
  intention: Intention
  score: number
}

function getIntelligentSuggestions(query: string): Intention[] {
  // 1. Calculate base relevance
  const scored = ALL_INTENTIONS.map(i => ({
    intention: i,
    score: fuzzyScore(query, i.title) * 0.6 +
           fuzzyScore(query, i.description) * 0.3 +
           fuzzyScore(query, i.category) * 0.1
  }))
  
  // 2. Apply keyword boosts
  scored.forEach(s => {
    s.score = applyKeywordBoost(query, s.intention, s.score)
  })
  
  // 3. HIGH SIGNAL FILTER
  const relevant = scored.filter(s => s.score >= 0.35)
  
  // 4. Sort and limit
  return relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.intention)
}
```

**Threshold Tuning:**
- 0.35 = Sweet spot (tested)
- Too low (0.2) = Noise creeps in
- Too high (0.5) = Miss valid matches

---

## ⌨️ Keyboard Navigation

| Key | Action |
|-----|--------|
| `Cmd+K` / `Ctrl+K` | Focus command bar (global) |
| `↓` | Select next suggestion |
| `↑` | Select previous suggestion |
| `Enter` | Execute selected |
| `Escape` | Clear and blur |
| Any char | Start typing (if focused) |

**Mouse Interaction:**
- Click suggestion → Execute
- Hover suggestion → Highlight

---

## 🎬 Animation Specs

### **Center → Bottom Transition**

```css
/* Command bar */
transition: all 500ms ease-in-out

/* States */
Center: {
  position: absolute
  top: 50%
  transform: translate(-50%, -50%)
}

Bottom: {
  position: relative
  padding-bottom: 2rem
  padding-top: 0
}
```

### **Content Fade-In**

```css
animation: fade-in slide-in-from-bottom-6
duration: 500ms
```

**Stagger:** Suggestions appear sequentially (50ms delay each)

---

## 📱 Responsive Behavior

### **Desktop (> 768px):**
- Command bar: max-width 48rem (3xl)
- Suggestions: max-width 48rem
- Reports: max-width 80rem (5xl)

### **Mobile (< 768px):**
- Command bar: full width - 1rem padding
- Same center → bottom transition
- Suggestions: full width cards
- Touch-optimized target sizes (min 44px)

---

## 🔧 Technical Implementation

### **Files:**

```
src/
├── components/ai/
│   ├── CommandBar.tsx           # Input + positioning logic
│   ├── CommandSuggestions.tsx   # Separate display component
│   ├── ThinkingProcess.tsx      # Processing visualization
│   └── RichReport.tsx           # Report format
├── lib/nlp/
│   └── matcher.ts               # Relevance scoring + filtering
└── app/dashboard/
    └── page.tsx                 # Orchestration
```

### **State Management:**

```typescript
const [query, setQuery] = useState('')
const [suggestions, setSuggestions] = useState<Intention[]>([])
const [isProcessing, setIsProcessing] = useState(false)
const [showReport, setShowReport] = useState(false)

// Active = bar is at bottom
const isActive = query.length > 0 || isProcessing || showReport
```

### **Conditional Rendering:**

```typescript
{!isActive && (
  <CommandBar centered />
)}

{isActive && (
  <>
    <ContentArea>
      {suggestions && <Suggestions />}
      {isProcessing && <ThinkingProcess />}
      {showReport && <RichReport />}
    </ContentArea>
    <CommandBar bottom />
  </>
)}
```

---

## ✅ Success Metrics

**Good UX = User completes task with minimal friction**

### **Metrics to Track:**

1. **Query Efficiency**
   - Average characters typed before match
   - Target: < 10 characters

2. **Relevance Accuracy**
   - % of searches with top result executed
   - Target: > 80%

3. **Noise Reduction**
   - Suggestions shown per query
   - Target: 2-3 avg (never > 5)

4. **Completion Rate**
   - % of queries that execute an intention
   - Target: > 70%

5. **Time to Insight**
   - Seconds from typing to report
   - Target: < 45s (including processing)

---

## 🎯 User Mental Model

### **The Interface Feels Like:**

1. **Spotlight** (macOS) - Fast, focused, gets out of the way
2. **Arc Browser** command bar - Spatial awareness
3. **Linear** quick actions - Professional, no fluff
4. **Raycast** - Intelligent completions

### **NOT Like:**

❌ Chatbot (no conversation history)  
❌ Form builder (no fields to fill)  
❌ Dashboard (no persistent widgets)  
❌ Search engine (no pagination, filters)  

---

## 🚀 Next Steps

1. **Add context-aware suggestions** from financial engine
2. **Parameter extraction UI** (e.g., "Retire at [55▼]")
3. **Voice input** support
4. **Multi-step intentions** (wizards)
5. **Saved queries** (favorites)

---

**Philosophy:** The best interface is the one that disappears. 

Show the user **exactly what they need**, **exactly when they need it**, and **nothing else**.
