# Quality Gates Summary

## Overview

The Farm Animal Tracker implements a two-tier quality gate system to ensure code quality without slowing down development.

## Tier 1: Pre-commit (Fast) ⚡

**Location:** `.husky/pre-commit`

**Runs on:** Every `git commit`

**What it checks:**
- ✅ ESLint (code quality rules)
- ✅ Prettier (code formatting)
- ✅ TypeScript (type checking)

**Duration:** ~5-10 seconds

**Bypass:** `git commit --no-verify -m "message"`

## Tier 2: CI/CD (Thorough) 🔒

**Location:** `.github/workflows/ci.yml`

**Runs on:**
- Push to `main` or `dev` branches
- Pull requests to `main` or `dev`

**What it checks:**
- ✅ All pre-commit checks (lint, format, types)
- ✅ **Full test suite (101 tests)**
- ✅ **Code coverage (minimum 70%)**
- ✅ Next.js build verification
- ✅ Prisma client generation

**Duration:** ~2-3 minutes

**Cannot bypass** - Required for merging

## Quality Metrics

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| Test Coverage | 75.84% | 70% | ✅ PASS |
| Total Tests | 101 | N/A | ✅ PASS |
| API Routes | 100% | N/A | ✅ PASS |
| Components | 100% | N/A | ✅ PASS |
| Custom Code | 100% | N/A | ✅ PASS |

## Developer Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. Developer writes code                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 2. git commit                                   │
│    Pre-commit hook runs (fast checks)          │
│    - Lint                                       │
│    - Format                                     │
│    - Type check                                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │  Checks pass?  │
          └────────┬───────┘
                   │
        ┌──────────┴──────────┐
        │                     │
       NO                    YES
        │                     │
        ▼                     ▼
  ┌──────────┐        ┌──────────────┐
  │  Commit  │        │   Commit     │
  │  Fails   │        │  Succeeds    │
  └──────────┘        └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  git push    │
                      └──────┬───────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  GitHub Actions CI Starts    │
              │  - Lint                      │
              │  - Format                    │
              │  - Type check                │
              │  - Run all tests (101)       │
              │  - Check coverage (70%)      │
              │  - Build application         │
              └──────────────┬───────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  All checks    │
                    │     pass?      │
                    └────────┬───────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                 NO                    YES
                  │                     │
                  ▼                     ▼
          ┌──────────────┐      ┌──────────────┐
          │  CI Fails    │      │   CI Passes  │
          │  PR Blocked  │      │   Can Merge  │
          └──────────────┘      └──────────────┘
```

## Why This Approach?

### Fast Pre-commit Hook
**Pros:**
- ✅ Instant feedback on code style issues
- ✅ Doesn't slow down development workflow
- ✅ Catches basic errors before they reach the repo
- ✅ Encourages clean, formatted code

**What we don't include:**
- ❌ Tests (too slow for every commit)
- ❌ Coverage checks (not needed locally)
- ❌ Build verification (handled in CI)

### Comprehensive CI
**Pros:**
- ✅ Thorough validation before merging
- ✅ Catches regressions across entire codebase
- ✅ Ensures coverage standards are met
- ✅ Runs in isolated, reproducible environment
- ✅ Blocks bad code from entering main branch

## Recommended Branch Protection

**GitHub Settings → Branches → Branch protection rules:**

For `main` branch:
- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging
  - Select: `test` (Test & Coverage job)
  - Select: `build` (Build Application job)
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ⚪ Include administrators (optional)

This ensures:
1. No one can push directly to `main`
2. All code must pass tests
3. Coverage must meet threshold (70%)
4. Application must build successfully

## Local Testing

Even though tests don't run in pre-commit, you should still run them locally:

```bash
# Before pushing
npm test

# Or in watch mode during development
npm run test:watch

# Check coverage
npm run test:coverage
```

## Monitoring

### View CI Status
1. Go to repository on GitHub
2. Click "Actions" tab
3. View latest workflow runs
4. Click on a run to see detailed logs

### View Coverage Reports
**In CI:**
- Included in test job logs
- Shows coverage summary

**Locally:**
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Troubleshooting

### Pre-commit hook not running
```bash
# Reinstall hooks
npm run prepare

# Or manually
chmod +x .husky/pre-commit
```

### CI fails but pre-commit passed
This is normal! CI runs more comprehensive checks (tests, coverage, build).

**To debug:**
```bash
# Run the same checks CI runs
npm run lint
npm run format:check
npx tsc --noEmit
npm run test:ci
npm run build
```

### Want to skip pre-commit for WIP commits
```bash
git commit --no-verify -m "wip: experimenting"
```

**Note:** You still can't merge until CI passes!

## Future Enhancements

Consider adding:
- [ ] Security scanning (Snyk, Dependabot)
- [ ] License compliance checks
- [ ] Bundle size monitoring
- [ ] Performance budgets
- [ ] Visual regression testing
- [ ] Automated dependency updates
- [ ] Slack/Discord notifications

## Summary

| Check | Pre-commit | CI |
|-------|-----------|-----|
| Lint | ✅ | ✅ |
| Format | ✅ | ✅ |
| Type Check | ✅ | ✅ |
| Tests | ❌ | ✅ |
| Coverage | ❌ | ✅ |
| Build | ❌ | ✅ |
| **Speed** | ⚡ Fast | 🔒 Thorough |
| **Purpose** | Quick feedback | Quality gate |
