# RW-010: CI/CD Design Specification

## Overview
Production-grade GitHub Actions workflow for Playwright test automation. Designed for current scale (34 tests) with foundation for future growth (300+ tests).

## Design Principles

1. **Appropriate for Current Scale** — No sharding yet (overkill for <50 tests)
2. **Future-Proof Foundation** — Blob reporter enables easy sharding later
3. **Fast Feedback** — Browser caching, parallel execution, optimized install
4. **Professional Presentation** — HTML reports, status badges, clean output

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Trigger: push to main, PR to main, manual dispatch         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Job: playwright-tests                                      │
│  ├── Runner: ubuntu-latest                                  │
│  ├── Node: 18 (or match project)                            │
│  └── Steps:                                                 │
│      1. Checkout code                                       │
│      2. Setup Node + cache (yarn/npm)                       │
│      3. Cache Playwright browsers                           │
│      4. Install dependencies                                │
│      5. Install Playwright browsers (if cache miss)         │
│      6. Run tests (blob reporter)                           │
│      7. Merge blob reports → HTML                           │
│      8. Upload HTML report artifact                         │
│      9. (Optional) Comment PR with results                  │
└─────────────────────────────────────────────────────────────┘
```

## Reporter Strategy

### Current (34 tests)
```typescript
// playwright.config.ts
reporter: process.env.CI ? 'blob' : 'html',
```
- Blob reporter for CI (enables merging, future sharding)
- HTML reporter merged from blobs

### Future (300+ tests) — Easy Migration
```typescript
reporter: process.env.CI ? 'blob' : 'html',
// Add to workflow:
// - shard: [1/4, 2/4, 3/4, 4/4]
// - Merge all blob reports
```

## Caching Strategy

### 1. Dependency Cache (Node/Yarn)
- Key: `yarn.lock` hash + runner OS
- Path: `.yarn/cache` (or `node_modules` for npm)

### 2. Playwright Browser Cache
- Key: Playwright version from `@playwright/test`
- Path: `~/.cache/ms-playwright`
- Saves 2-3 minutes per run when hit

## Workflow Configuration

### File: `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:  # Manual trigger

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'  # or 'npm' if using npm
      
      - name: Get Playwright version
        id: playwright-version
        run: echo "version=$(yarn list @playwright/test --json | jq -r '.data.trees[].name' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')" >> $GITHUB_OUTPUT
        shell: bash
      
      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ steps.playwright-version.outputs.version }}-${{ runner.os }}
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: yarn playwright install --with-deps chromium
      
      - name: Run Playwright tests
        run: yarn playwright test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}  # If needed for factories
      
      - name: Merge blob reports
        if: always()
        run: yarn playwright merge-reports --reporter=html blob-report/
      
      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## README Badge

Add to `README.md`:

```markdown
[![Playwright Tests](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml)
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **No sharding** | 34 tests = ~1-2 min. Sharding adds complexity without benefit |
| **Blob reporter** | Foundation for future sharding. Merge step is trivial now, essential later |
| **Chromium only in CI** | Faster install, sufficient coverage. Full suite locally |
| **7-day retention** | Balance visibility vs storage. Adjust as needed |
| `workflow_dispatch` | Manual runs for debugging flaky tests |
| `concurrency.cancel-in-progress` | Kill stale runs on new pushes |

## Future Improvements (When >100 Tests)

1. **Sharding**: Split to 4 parallel jobs
   ```yaml
   strategy:
     matrix:
       shard: [1/4, 2/4, 3/4, 4/4]
   ```

2. **Comment on PR**: Post test results as PR comment

3. **Flaky test detection**: Separate job to retry flakes

4. **Performance trends**: Track test duration over time

## Acceptance Criteria

- [ ] Workflow triggers on push/PR to main
- [ ] Uses blob reporter in CI
- [ ] Caches Playwright browsers
- [ ] Generates HTML report artifact
- [ ] Badge displays in README
- [ ] Completes in <5 minutes (with cache hit)

## Files to Create/Modify

**Create:**
- `.github/workflows/playwright.yml`

**Modify:**
- `playwright.config.ts` — add blob reporter for CI
- `README.md` — add badge

## Notes for Cursor

1. Use `yarn` commands (project uses Yarn)
2. Match Node version to project's `.nvmrc` or `package.json` engines
3. Blob report directory is `blob-report/` (default)
4. Merged HTML report goes to `playwright-report/` (default)
5. DATABASE_URL may be needed if tests use Prisma factories directly