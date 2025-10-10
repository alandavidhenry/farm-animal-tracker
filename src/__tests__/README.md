# Test Suite Documentation

## Overview

This project uses **Jest** as the testing framework with **React Testing Library** for component tests. The test suite provides comprehensive coverage for API routes, React components, and utility functions.

## Test Structure

```
src/
├── app/api/
│   ├── animals/__tests__/route.test.ts     # Animals API business logic tests
│   └── weights/__tests__/route.test.ts     # Weights API business logic tests
├── components/
│   ├── forms/__tests__/
│   │   ├── animal-registration-form.test.tsx
│   │   └── weight-recording-form.test.tsx
│   └── ui/__tests__/
│       └── theme-toggle.test.tsx
├── contexts/__tests__/
│   └── theme-context.test.tsx              # Theme context provider tests
└── lib/__tests__/
    └── prisma.test.ts                      # Prisma client tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci
```

### Running Specific Test Files

```bash
# Run tests for a specific component
npm test -- animal-registration-form

# Run tests matching a pattern
npm test -- --testPathPatterns="components"

# Run a single test file
npm test -- src/components/forms/__tests__/animal-registration-form.test.tsx
```

## Test Coverage

**Overall Coverage: 75.84%** (up from 38.98%)

### Coverage by Category

**Custom Application Code (Non-Standard):**

- ✅ API Routes (Animals): 100% coverage
- ✅ API Routes (Weights): 100% coverage
- ✅ Authentication Config (lib/auth.ts): 64.28% coverage
- ✅ Session Provider: 100% coverage
- ✅ Middleware: 66.66% coverage
- ✅ Animal Registration Form: 100% coverage
- ✅ Weight Recording Form: 100% coverage
- ✅ Theme Toggle: 100% coverage
- ✅ Theme Context: 100% coverage
- ✅ Prisma Client: 100% coverage

**Excluded from Coverage (Next.js Boilerplate):**

- ⚪ Page components (layout.tsx, page.tsx, signin/page.tsx) - 0% coverage
- ⚪ API auth route handler - 0% coverage (NextAuth generated)

### Test Categories

**API Route Tests:**

- Business logic tests (50 tests): Validation, authentication, database operations
- Integration tests (22 tests): Full HTTP request/response cycle testing

**Component Tests (32 tests):**

- Form behavior and validation
- User interactions
- Error handling
- Accessibility

**Authentication Tests (11 tests):**

- Credential validation
- JWT callbacks
- Session management
- Authorization logic

**Middleware Tests (8 tests):**

- Route protection patterns
- Configuration validation

## Test Configuration

### jest.config.js

- Uses Next.js Jest configuration
- Test environment: jsdom (for React components)
- Module path aliases configured (`@/` → `src/`)
- Coverage collection from `src/**/*.{ts,tsx}`

### jest.setup.js

Provides global mocks for:

- Next.js navigation hooks
- NextAuth session management
- localStorage (for jsdom environment)
- matchMedia (for theme detection)

## Writing New Tests

### Component Tests Example

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### API Logic Tests Example

```typescript
/**
 * @jest-environment node
 */

import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    myModel: {
      findMany: jest.fn()
    }
  }
}))

describe('API Business Logic', () => {
  it('should fetch data correctly', async () => {
    (prisma.myModel.findMany as jest.Mock).mockResolvedValue([...])

    const result = await prisma.myModel.findMany()

    expect(result).toHaveLength(1)
  })
})
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
2. **User-centric**: Test components from the user's perspective
3. **Mock External Dependencies**: Mock API calls, database operations, and third-party services
4. **Accessibility**: Use accessible queries (`getByRole`, `getByLabelText`)
5. **Async Handling**: Use `waitFor` for asynchronous operations
6. **Clean Up**: Tests automatically clean up after each run

## Continuous Integration

The `test:ci` script is optimized for CI/CD pipelines:

- Runs once (no watch mode)
- Generates coverage reports
- Limits worker processes for stability
- Designed for GitHub Actions integration

## Troubleshooting

### Common Issues

**Tests failing with "window is not defined"**

- Ensure API tests use `@jest-environment node` comment
- Check that browser mocks are conditionally applied in jest.setup.js

**Component tests timing out**

- Increase timeout in `waitFor` options
- Check for missing `await` keywords on async operations

**Mock not working**

- Ensure mocks are defined before imports
- Clear mocks between tests with `jest.clearAllMocks()`

## Future Improvements

- [ ] Integration tests for full API routes with Next.js request/response
- [ ] E2E tests with Playwright or Cypress
- [ ] Visual regression testing
- [ ] Performance testing for large datasets
- [ ] Database integration tests with test containers

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
