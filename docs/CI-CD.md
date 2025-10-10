# CI/CD Pipeline

## Overview

The Farm Animal Tracker uses a two-tier quality gate system:

1. **Pre-commit hooks** (fast) - Run locally before each commit
2. **GitHub Actions CI** (thorough) - Run on push/PR to GitHub

## Pre-commit Hook (Local)

**Location:** `.husky/pre-commit`

**What it runs:**
```bash
npm run checks
```

This includes:
- ✅ ESLint (code quality)
- ✅ Prettier format check
- ✅ TypeScript type checking

**Execution time:** ~5-10 seconds

**Skip if needed:**
```bash
git commit --no-verify -m "your message"
```

## GitHub Actions CI (Remote)

**Location:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `dev` branches
- Pull requests to `main` or `dev` branches

### Test & Coverage Job

**What it runs:**
1. ✅ Linter (`npm run lint`)
2. ✅ Format check (`npm run format:check`)
3. ✅ Type check (`npx tsc --noEmit`)
4. ✅ Test suite with coverage (`npm run test:ci`)
5. ✅ Coverage threshold check (minimum 70%)
6. ⚪ Upload coverage to Codecov (optional)

**Execution time:** ~1-2 minutes

**Coverage Requirements:**
- Minimum: 70% overall coverage
- Current: 75.84%

### Build Job

**What it runs:**
1. ✅ Prisma client generation
2. ✅ Next.js build
3. ✅ Upload build artifacts

**Execution time:** ~1-2 minutes

**Note:** Requires dummy environment variables for build (provided in workflow)

## Workflow

```
Developer makes changes
         ↓
    git commit
         ↓
Pre-commit hook runs (fast checks)
         ↓
   Commit succeeds
         ↓
    git push
         ↓
GitHub Actions CI runs (full suite)
         ├── Test & Coverage ✓
         └── Build ✓
         ↓
    PR ready to merge
```

## Coverage Reporting

### Local Coverage

Run coverage locally:
```bash
npm run test:coverage
```

View detailed HTML report:
```bash
# After running coverage
open coverage/lcov-report/index.html
```

### CI Coverage

Coverage is automatically calculated in GitHub Actions. The workflow will fail if:
- Tests fail
- Coverage drops below 70%
- Build fails

### Codecov Integration (Optional)

To enable Codecov:
1. Sign up at https://codecov.io
2. Add repository
3. Add `CODECOV_TOKEN` secret to GitHub repo settings
4. Coverage reports will appear on PRs

## Environment Variables for CI

The CI workflow uses dummy environment variables for builds:

```yaml
DATABASE_URL: "sqlserver://localhost:1433;database=test;user=sa;password=test;encrypt=true"
NEXTAUTH_SECRET: "test-secret-for-build-only"
NEXTAUTH_URL: "http://localhost:3000"
```

**⚠️ Important:** These are only used for the build step. Tests use mocked database connections.

## Troubleshooting

### Pre-commit hook not running
```bash
# Reinstall hooks
npm run prepare
```

### CI failing on GitHub but passing locally
```bash
# Run the exact CI command locally
npm run test:ci

# Check for environment-specific issues
npm run lint
npm run format:check
npx tsc --noEmit
```

### Coverage below threshold
```bash
# Check current coverage
npm run test:coverage

# Identify uncovered code
open coverage/lcov-report/index.html
```

### Build failing in CI
```bash
# Test build locally with dummy env vars
DATABASE_URL="sqlserver://localhost:1433;database=test" \
NEXTAUTH_SECRET="test" \
NEXTAUTH_URL="http://localhost:3000" \
npm run build
```

## Branch Protection (Recommended)

Configure branch protection rules on GitHub:

**Settings → Branches → Add rule:**
- Branch name pattern: `main`
- ✅ Require status checks to pass before merging
  - Select: `test`
  - Select: `build`
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ⚪ Include administrators (optional)

This ensures:
- No direct pushes to main
- All tests must pass
- Coverage threshold must be met
- Build must succeed

## Performance Tips

### Speed up CI runs

1. **Use caching** (already configured):
   ```yaml
   cache: 'npm'
   ```

2. **Run jobs in parallel** (already configured):
   - Test & Build run after tests pass

3. **Limit test runs to affected files**:
   ```bash
   # In package.json
   "test:changed": "jest --changedSince=main"
   ```

### Speed up local development

1. **Use test watch mode**:
   ```bash
   npm run test:watch
   ```

2. **Run specific tests**:
   ```bash
   npm test -- animals
   ```

3. **Skip pre-commit when iterating**:
   ```bash
   git commit --no-verify -m "wip"
   ```

## Monitoring

**View CI runs:**
- Repository → Actions tab
- Click on workflow run to see details
- Download logs for debugging

**View coverage trends:**
- If using Codecov: Check dashboard
- Otherwise: Compare coverage in CI logs over time

## Next Steps

Consider adding:
- [ ] Deploy workflow (after successful build)
- [ ] Security scanning (Snyk, Dependabot)
- [ ] Performance testing
- [ ] E2E tests with Playwright
- [ ] Automated dependency updates
- [ ] Slack/Discord notifications on failures
