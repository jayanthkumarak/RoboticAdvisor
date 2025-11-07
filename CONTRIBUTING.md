# Contributing to RoboAdvisor

Thank you for your interest in contributing to RoboAdvisor! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/RoboAdvisor.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use functional components and React hooks
- Keep components small and focused on a single responsibility
- Use Tailwind CSS for styling
- Follow the ESLint and Prettier configurations

### Component Structure

```typescript
'use client' // if needed

import { useState } from 'react'
import { Component } from '@/components/ui/component'
import { utility } from '@/lib/utils'

interface ComponentProps {
  prop1: string
  prop2: number
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return <div>Component content</div>
}
```

### Financial Calculations

- All financial calculations should be well-documented
- Include the formula in comments
- Add unit tests for complex calculations
- Use accurate rounding and precision
- Consider edge cases (zero values, negative numbers, etc.)

### Testing

Before submitting a PR:

1. Run the development server and test your changes
2. Build the project: `npm run build`
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Ensure no linting errors: `npm run lint`

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. The PR will be merged once reviewed and approved by maintainers

## Feature Requests

We welcome feature requests! Please open an issue with:

- Clear description of the feature
- Use case and benefits
- Any relevant examples or mockups

## Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser and OS information

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting comments, or personal attacks
- Publishing others' private information
- Other conduct which could be considered inappropriate

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
