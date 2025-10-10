# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode (what GitHub Actions uses)
npm run test:ci
```

## Test Structure

```
src/
├── app/api/
│   ├── animals/__tests__/
│   │   ├── route.test.ts              # Business logic tests
│   │   └── route.integration.test.ts  # HTTP integration tests
│   └── weights/__tests__/
│       ├── route.test.ts
│       └── route.integration.test.ts
├── components/
│   ├── auth/__tests__/
│   │   └── session-provider.test.tsx
│   ├── forms/__tests__/
│   │   ├── animal-registration-form.test.tsx
│   │   └── weight-recording-form.test.tsx
│   └── ui/__tests__/
│       └── theme-toggle.test.tsx
├── contexts/__tests__/
│   └── theme-context.test.tsx
├── lib/__tests__/
│   ├── auth.test.ts
│   └── prisma.test.ts
└── __tests__/
    └── middleware.test.ts
```

## Coverage Report

**Current Coverage: 75.84%**

| Category             | Coverage |
| -------------------- | -------- |
| API Routes (Animals) | 100%     |
| API Routes (Weights) | 100%     |
| Forms                | 100%     |
| UI Components        | 100%     |
| Contexts             | 100%     |
| Authentication       | 64.28%   |
| Middleware           | 66.66%   |

## Test Categories

### Unit Tests (50 tests)

Test individual functions and business logic in isolation.

**Examples:**

- Validation logic
- Data transformations
- Authentication logic
- Utility functions

### Integration Tests (22 tests)

Test API routes with full HTTP request/response cycle.

**Examples:**

- POST /api/animals with valid data
- GET /api/weights with filters
- Error handling for invalid requests

### Component Tests (32 tests)

Test React components with user interactions.

**Examples:**

- Form submission
- User input handling
- Error message display
- Theme switching

## Writing Tests

### Example: API Route Test

```typescript
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma')
jest.mock('next-auth')

describe('POST /api/animals', () => {
  it('should create animal successfully', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@test.com' } })
    ;(prisma.animal.create as jest.Mock).mockResolvedValue({
      id: 1,
      tagNumber: 'A001',
      type: 'SHEEP'
    })

    const request = new NextRequest('http://localhost:3000/api/animals', {
      method: 'POST',
      body: JSON.stringify({
        tagNumber: 'A001',
        type: 'SHEEP',
        initialWeight: 45.5
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.animal.tagNumber).toBe('A001')
  })
})
```

### Example: Component Test

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyForm from '../my-form'

describe('MyForm', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    render(<MyForm />)

    await user.type(screen.getByLabelText(/name/i), 'Test Name')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/endpoint',
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
```

## Mocking Strategy

### Prisma

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    animal: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}))
```

### NextAuth

```typescript
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))
```

### Fetch API

```typescript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mock' })
})
```

## Common Patterns

### Testing Error States

```typescript
it('should display error message on failure', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: 'Something went wrong' })
  })

  render(<MyComponent />)

  await user.click(submitButton)

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
```

### Testing Loading States

```typescript
it('should show loading indicator while submitting', async () => {
  global.fetch = jest.fn().mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 100))
  )

  render(<MyComponent />)

  await user.click(submitButton)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
```

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

## Debugging Tests

### Run specific test file

```bash
npm test -- animal-registration-form
```

### Run in watch mode with coverage

```bash
npm run test:watch -- --coverage
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### View coverage report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## CI/CD Integration

### Pre-commit Hook

**Runs:** Lint + Format + Type check
**Does NOT run:** Tests (too slow)

### GitHub Actions

**Runs on:** Push to main/dev, Pull Requests
**Includes:**

- Lint
- Format check
- Type check
- **Full test suite with coverage**
- Build verification
- Coverage threshold check (70%)

See `docs/CI-CD.md` for details.

## Troubleshooting

### "Database connection failed" errors in console

✅ **Expected behavior** - These are from integration tests that test error handling. Tests still pass.

### Tests pass locally but fail in CI

- Run `npm run test:ci` locally to match CI environment
- Check Node version matches CI (22.x)
- Clear node_modules and reinstall: `rm -rf node_modules && npm ci`

### Coverage not meeting threshold

- Run `npm run test:coverage`
- Open HTML report to find uncovered lines
- Add tests for critical paths first

### Mock not working

- Ensure mock is defined before imports
- Use `jest.clearAllMocks()` in `beforeEach`
- Check mock implementation matches actual signature

## Best Practices

1. ✅ **Test user behavior, not implementation**
   - Use `getByRole`, `getByLabelText` instead of class selectors

2. ✅ **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset state

3. ✅ **Test error cases**
   - Don't just test the happy path
   - Test validation, edge cases, failures

4. ✅ **Use meaningful test names**
   - `it('should display error when email is invalid')`
   - Not: `it('test 1')`

5. ✅ **Avoid testing implementation details**
   - Test what users see/do
   - Don't test internal state unless necessary

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Test README](./src/__tests__/README.md)
- [CI/CD Guide](./docs/CI-CD.md)
