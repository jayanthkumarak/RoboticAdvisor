# Getting Started with RoboAdvisor

Welcome to RoboAdvisor! This guide will help you get up and running with your modern financial planning platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

### 3. Build for Production

```bash
npm run build
```

This creates an optimized static export in the `/out` directory.

## 📱 Features Overview

### Core Features (✅ Implemented)

#### 1. **Landing Page** (`/`)
- Beautiful hero section
- Feature highlights
- Call-to-action buttons
- Responsive design

#### 2. **Onboarding** (`/onboarding`)
- Multi-step wizard
- Personal information collection
- Risk profile assessment
- Currency selection
- Creates user profile stored locally

#### 3. **Dashboard** (`/dashboard`)
- Overview of financial status
- Quick stats (retirement corpus, goals, achievements)
- Progress tracking
- Quick action cards
- Links to all planning tools

#### 4. **Retirement Planning** (`/retirement`)
- Calculate retirement corpus needed
- Support for early/normal/late retirement
- Detailed inputs:
  - Current age and retirement age
  - Life expectancy
  - Current expenses and savings
  - Monthly investment
  - Inflation and return rates
- Real-time projections
- Shortfall/surplus analysis

#### 5. **Goal Planning** (`/goals`)
- Up to 6 non-recurring goals:
  - Child Education
  - Child Marriage
  - Home Purchase
  - Vehicle Purchase
  - Business Start
  - Other Goals
- Up to 4 recurring goals:
  - Annual Vacation
  - Festival Expenses
  - Home Renovation
  - Vehicle Upgrade
- Progress tracking for each goal
- Priority setting (high/medium/low)
- Automated calculations with SIP projections

#### 6. **Portfolio Analysis** (`/portfolio`)
- Asset allocation visualization
- Cash flow projections
- Interactive charts (using Recharts)
- Three tabs:
  - Asset Allocation
  - Cash Flow Projection
  - Summary
- Key milestones tracking

#### 7. **Coast FIRE Calculator** (`/coast-fire`)
- Calculate your Coast FIRE number
- Determine when you can stop active investing
- Project future corpus growth
- Calculate required monthly savings
- Educational content about Coast FIRE

#### 8. **Bucket Strategy** (`/bucket-strategy`)
- Post-retirement corpus management
- Three-bucket approach:
  - Bucket 1: Liquid (3 years)
  - Bucket 2: Medium-term (7 years)
  - Bucket 3: Long-term (15 years)
- Asset allocation per bucket
- Rebalancing strategies
- Years-to-last projection

#### 9. **Product Recommendations** (`/recommendations`)
- Personalized mutual fund suggestions
- Based on risk profile
- Categorized by:
  - Recommended for you
  - Equity funds
  - Debt funds
- Detailed fund information:
  - Returns (1Y, 3Y, 5Y)
  - Expense ratio
  - AUM
  - Exit load
- Sample data included

## 🎨 Design Features

### Dark Mode
- Full dark mode support
- Toggle in header
- System preference detection
- Smooth transitions
- Persistent state

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly buttons
- Optimized layouts for all devices

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus states
- Sufficient color contrast

## 💾 Data Persistence

All data is stored locally in browser using Zustand with persistence:
- User profile
- Retirement plan
- Financial goals
- Income streams
- Bucket strategy
- UI preferences (dark mode)

**Note:** Data persists across sessions but stays in the browser. No backend/database is currently connected.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **State Management:** Zustand with persistence
- **Charts:** Recharts
- **Icons:** Lucide React

### Deployment Ready
- **Hosting:** Cloudflare Pages (configured)
- **Build:** Static export (`output: 'export'`)
- **CI/CD:** GitHub Actions workflow included
- **Database (planned):** Cloudflare D1 schema provided

## 📂 Project Structure

```
src/
├── app/                          # Next.js pages
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Dashboard
│   ├── retirement/              # Retirement planning
│   ├── goals/                   # Goal planning
│   ├── portfolio/               # Portfolio analysis
│   ├── coast-fire/              # Coast FIRE calculator
│   ├── bucket-strategy/         # Bucket strategy
│   ├── recommendations/         # Mutual fund recommendations
│   └── onboarding/              # User onboarding
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── layout/                  # Header, Footer
│   ├── calculators/             # Financial calculators
│   └── charts/                  # Data visualizations
├── lib/
│   ├── utils.ts                 # Utility functions
│   └── constants.ts             # App constants
├── store/
│   └── useFinancialStore.ts     # Zustand store
└── types/
    └── index.ts                 # TypeScript types
```

## 🧪 Testing Locally

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test the onboarding flow:**
   - Go to `/onboarding`
   - Fill in your details
   - Complete all 3 steps

3. **Create a retirement plan:**
   - Go to `/retirement`
   - Enter your financial details
   - Calculate your plan

4. **Add financial goals:**
   - Go to `/goals`
   - Click "Add Goal"
   - Create multiple goals

5. **View portfolio:**
   - Go to `/portfolio`
   - See visualizations and projections

## 🚀 Deployment

### Deploy to Cloudflare Pages

#### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect your repository
4. Configure build:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** 18 or higher
5. Deploy!

#### Option 2: Direct Deploy with Wrangler

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy ./out
```

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_APP_NAME=RoboAdvisor
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📈 Future Enhancements

### Phase 1 (Foundation) - ✅ COMPLETED
- ✅ Core project setup
- ✅ UI components and design system
- ✅ User onboarding
- ✅ Retirement calculator
- ✅ Goal planning
- ✅ Portfolio analysis
- ✅ Coast FIRE calculator
- ✅ Bucket strategy
- ✅ Product recommendations
- ✅ Dark mode
- ✅ Responsive design

### Phase 2 (Backend Integration) - 🚧 Planned
- [ ] User authentication (OAuth, passwordless)
- [ ] Cloudflare D1 database integration
- [ ] User accounts and data sync
- [ ] Save/load plans from cloud
- [ ] Multi-device support

### Phase 3 (Advanced Features) - 📋 Planned
- [ ] Professional advisor dashboard
- [ ] Multi-client management
- [ ] Real-time market data integration
- [ ] Advanced analytics
- [ ] PDF export of plans
- [ ] Email reports

### Phase 4 (Content & Community) - 💡 Ideas
- [ ] Video tutorials
- [ ] Interactive help center
- [ ] Community forum
- [ ] Blog with financial tips
- [ ] Multi-language support (Hindi, Tamil, etc.)

## 🐛 Troubleshooting

### Build Issues

**Problem:** `Module not found` errors
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Next.js cache issues
```bash
# Solution: Clear cache
rm -rf .next
npm run build
```

### Runtime Issues

**Problem:** Charts not displaying
- Check if data is available
- Verify Recharts is installed
- Check browser console for errors

**Problem:** Dark mode not persisting
- Check localStorage is enabled in browser
- Verify Zustand persistence is working
- Clear browser cache if needed

## 📝 Configuration

### Modify App Constants

Edit `src/lib/constants.ts`:
- Age limits
- Default inflation rates
- Expected returns
- Asset allocation presets
- Goal categories

### Customize Theme

Edit `tailwind.config.ts`:
- Colors
- Fonts
- Spacing
- Breakpoints

### Adjust Calculations

Edit `src/lib/utils.ts`:
- Financial formulas
- Currency formatting
- Date calculations

## 🎯 Best Practices

### For Users
1. Complete onboarding first
2. Create retirement plan before goals
3. Review and update plans quarterly
4. Use realistic return expectations
5. Consider inflation in all calculations

### For Developers
1. Follow TypeScript strictly
2. Use Tailwind CSS utilities
3. Keep components small and focused
4. Add proper error handling
5. Write clear comments for financial formulas

## 📞 Support

- **Documentation:** Check README.md
- **Issues:** Use GitHub Issues
- **Contributing:** See CONTRIBUTING.md
- **License:** MIT License

## 🎉 Congratulations!

You now have a fully functional, modern financial planning platform! Start planning your financial future today.

---

**Built with ❤️ for the financial planning community**
