# AGENTS.md - RoboAdvisor

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Linting
```bash
npm run lint         # Run ESLint
```

### Deployment
```bash
npm run deploy       # Deploy to Cloudflare Pages
```

## Project Structure

### Financial Engine
```
src/lib/engine/
├── assumptions/           # Market assumptions and calibrated data
│   ├── types.ts          # Type definitions
│   ├── india-2024.ts     # India Q4 2024 calibrated assumptions
│   ├── loader.ts         # Assumption factory
│   └── __tests__/        # 15 tests
├── math/                 # Pure mathematical utilities
│   ├── compound.ts       # FV, PV, annuity formulas
│   ├── statistics.ts     # Mean, median, percentile, correlation
│   ├── random.ts         # Seeded RNG, Box-Muller normal
│   └── __tests__/        # 58 tests
├── projection/           # Deterministic cashflow projection
│   ├── types.ts          # Input/output types
│   ├── validation.ts     # Input validation
│   ├── deterministic.ts  # Main projection engine
│   └── __tests__/        # 14 tests
└── adapters/             # UI integration layer
    └── intentionHandlers.ts  # Connect intentions to engine
```

### AI-First Interface
```
src/components/ai/
├── CommandBar.tsx        # Natural language command input
├── IntentionCard.tsx     # Complex task intentions
├── ThinkingProcess.tsx   # Transparent reasoning display
└── RichReport.tsx        # One-page multi-media reports
```

## Code Conventions

- **Pure Functions:** All engine code is side-effect free and testable
- **100% Test Coverage:** Every engine module has comprehensive tests
- **TypeScript Strict:** No `any` types allowed
- **JSDoc Comments:** All public functions documented with examples
- **Validation:** All user inputs sanitized and validated

## Testing Strategy

- **Unit Tests:** Every function tested in isolation
- **Validation Against Excel:** All financial formulas verified
- **Edge Cases:** Zero rates, negative values, boundary conditions
- **Deterministic:** Seeded RNG for reproducible tests

## Current Status

✅ **Phase 1 Complete (Days 1-4):**
- Assumptions module with calibrated India 2024-Q4 data
- Math utilities (compound interest, statistics, random)
- Deterministic projection engine
- 87 passing tests

🚧 **In Progress:**
- UI integration with intention handlers
- Command bar interface connected to engine

📋 **Next:**
- Monte Carlo simulation engine
- Goal funding optimizer
- Rebalancing logic
