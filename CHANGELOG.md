# Changelog

All notable changes to RoboAdvisor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-08

### Added - Initial Release

#### Core Application
- Modern Next.js 14 application with App Router
- TypeScript support throughout
- Tailwind CSS for styling
- Radix UI component library integration
- Zustand for state management with persistence
- Responsive mobile-first design
- Dark mode support with theme toggle

#### User Management
- Multi-step onboarding wizard
- User profile creation
- Risk profile assessment (Conservative to Very Aggressive)
- Currency selection (INR, USD, EUR, GBP)
- Local data persistence

#### Financial Planning Tools
- **Retirement Planning Calculator**
  - Support for early, normal, and late retirement
  - Customizable age, expenses, savings inputs
  - Inflation and return rate adjustments
  - Real-time corpus calculation
  - Shortfall/surplus analysis
  
- **Goal Planning Module**
  - Up to 6 non-recurring goals (education, home, vehicle, etc.)
  - Up to 4 recurring goals (vacation, festivals, etc.)
  - Priority setting (high/medium/low)
  - Progress tracking
  - SIP calculator integration
  
- **Coast FIRE Calculator**
  - Coast FIRE number calculation
  - Years to Coast FIRE projection
  - Required monthly savings calculator
  - Educational content about Coast FIRE
  
- **Bucket Strategy Simulator**
  - Three-bucket retirement strategy
  - Custom asset allocation per bucket
  - Withdrawal strategy recommendations
  - Years corpus will last projection

#### Visualization & Analytics
- **Portfolio Analysis Dashboard**
  - Asset allocation pie charts
  - Cash flow line charts
  - Summary statistics
  - Key milestones tracking
  
- **Interactive Charts**
  - Recharts integration
  - Responsive charts
  - Real-time data updates
  - Multiple chart types (line, pie)

#### Product Recommendations
- Mutual fund recommendations
- Risk-profile based suggestions
- Categorized by equity/debt/hybrid
- Detailed fund information:
  - Historical returns (1Y, 3Y, 5Y)
  - Expense ratios
  - AUM and AMC details
  - Exit load information

#### User Interface
- Modern, clean design
- Card-based layout
- Smooth animations
- Loading states
- Error handling
- Accessibility features:
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation
  - Focus management

#### Data Management
- Zustand store for state management
- Local storage persistence
- Auto-save functionality
- Data export/import ready

#### Deployment & Infrastructure
- Next.js static export configuration
- Cloudflare Pages ready
- GitHub Actions CI/CD workflow
- Cloudflare D1 database schema
- Wrangler configuration

#### Documentation
- Comprehensive README
- Getting Started guide
- Contributing guidelines
- Database schema documentation
- Code comments and JSDoc
- TypeScript types and interfaces

### Technical Specifications

#### Dependencies
- next: ^14.2.0
- react: ^18.3.1
- typescript: ^5.3.3
- tailwindcss: ^3.4.1
- zustand: ^4.5.0
- recharts: ^2.12.0
- lucide-react: ^0.344.0
- @radix-ui components: Latest versions

#### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

#### Performance
- First Load JS: ~88-226 KB (depending on page)
- All pages pre-rendered as static content
- Lighthouse Score: 90+ (estimated)

### Known Limitations

- No backend/database integration (frontend only)
- Data stored locally in browser only
- No user authentication
- Sample mutual fund data (not real-time)
- No email/notification features
- English language only

### Future Roadmap

#### v1.1.0 (Planned)
- User authentication integration
- Cloud data synchronization
- PDF export of financial plans
- Enhanced accessibility features

#### v1.2.0 (Planned)
- Advisor dashboard for professionals
- Multi-client management
- Real-time market data API
- Advanced analytics

#### v2.0.0 (Planned)
- Multi-language support
- Mobile app (React Native)
- AI-powered insights
- Video tutorial integration

---

## Release Notes

### v1.0.0 - Initial Release

This is the first stable release of RoboAdvisor, a modern web-based financial planning platform inspired by the popular freefincal robo advisory tool.

**What's New:**
- Complete financial planning suite
- Beautiful, modern UI with dark mode
- Comprehensive retirement planning
- Goal tracking and management
- Advanced calculators (Coast FIRE, Bucket Strategy)
- Product recommendations
- Fully responsive design
- Ready for Cloudflare Pages deployment

**Getting Started:**
```bash
npm install
npm run dev
```

**Deployment:**
```bash
npm run build
# Deploy the /out directory to Cloudflare Pages
```

**Feedback:**
We welcome your feedback! Please open issues on GitHub or contribute to the project.

---

**Contributors:** Built with ❤️ for the financial planning community

**License:** MIT License
