# RoboAdvisor - Modern Financial Planning Platform

A comprehensive, free, and modern web-based robo-advisory platform for personal financial planning. Built with Next.js, React, and Cloudflare Workers for global edge performance.

## Features

### Core Planning Tools
- **Retirement Planning**: Calculate retirement corpus for early, normal, or late retirement with detailed projections
- **Goal Planning**: Manage up to 6 non-recurring goals (education, home, vehicle, etc.) and 4 recurring goals (vacations, festivals)
- **Coast FIRE Calculator**: Determine when you can stop active investing and let compound interest work
- **Asset Allocation**: Custom allocation with preset profiles (conservative to very aggressive)
- **Cash Flow Projections**: Detailed year-by-year cash flow analysis
- **Portfolio Visualization**: Interactive charts for portfolio and cash flow tracking

### Modern Features
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first, works seamlessly on all devices
- **Real-time Calculations**: Instant updates as you adjust parameters
- **Data Persistence**: Local storage for saving plans and preferences
- **Beautiful UI**: Modern design with Tailwind CSS and Radix UI components

### Coming Soon
- **Bucket Strategy Simulator**: Gamified post-retirement corpus management
- **Product Recommendations**: PlumbLine-style mutual fund suggestions
- **Professional Advisor Dashboard**: Multi-client management for financial advisors
- **Authentication**: OAuth and passwordless login options
- **Video Guides**: Comprehensive tutorials and help center

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand with persistence
- **Charts**: Recharts for data visualization
- **Hosting**: Cloudflare Pages (static export)
- **Database** (planned): Cloudflare D1, Durable Objects
- **Authentication** (planned): Cloudflare Access or Auth0

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm, yarn, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/RoboAdvisor.git
cd RoboAdvisor
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
# or
bun run build
```

This creates an optimized static export in the `/out` directory.

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: 18 or higher

3. Deploy!

The app will be available globally on Cloudflare's edge network.

### Manual Deployment

```bash
npm run build
npx wrangler pages deploy ./out
```

## Project Structure

```
RoboAdvisor/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard
│   │   ├── retirement/        # Retirement planning
│   │   ├── goals/            # Goal planning
│   │   ├── portfolio/        # Portfolio analysis
│   │   ├── coast-fire/       # Coast FIRE calculator
│   │   └── onboarding/       # User onboarding
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── calculators/      # Financial calculators
│   │   └── charts/           # Data visualization
│   ├── lib/
│   │   ├── utils.ts          # Utility functions
│   │   └── constants.ts      # App constants
│   ├── store/
│   │   └── useFinancialStore.ts  # Zustand store
│   └── types/
│       └── index.ts          # TypeScript types
├── public/                    # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Financial Calculations

### Retirement Corpus
```typescript
corpusNeeded = presentValueOfAnnuity(
  futureMonthlyExpenses,
  realReturnRate,
  retirementYears
)
```

### Future Value (SIP)
```typescript
FV = P × [((1 + r)^n - 1) / r] × (1 + r)
```

Where:
- P = Monthly investment
- r = Monthly return rate
- n = Number of months

### Coast FIRE Number
```typescript
coastFIRENumber = targetCorpus / (1 + r)^years
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [x] Core retirement planning calculator
- [x] Goal planning module
- [x] Coast FIRE calculator
- [x] Portfolio visualization
- [x] Cash flow projections
- [x] Dark mode support
- [ ] Bucket strategy simulator
- [ ] Product recommendation engine
- [ ] User authentication
- [ ] Database integration
- [ ] Advisor dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered insights

## Inspiration

This project is inspired by the popular Freefincal Robo Advisory Tool, with a modern web-first approach to make comprehensive financial planning accessible to everyone.

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is for educational and informational purposes only. It does not constitute financial advice. Please consult with a certified financial planner before making investment decisions.

## Support

For questions or support, please open an issue on GitHub or contact us at support@roboadvisor.com

---

Built with ❤️ for the financial planning community
