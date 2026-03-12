## Cursor Prompt: Implement CI/CD Workflow (RW-010)

**Context:** You're implementing a production-grade GitHub Actions workflow for Playwright tests. Follow the design specification exactly.

**Design Source:** `specs/cicd-design.md` — read this first before implementing.

**Current State:**
- 34 tests across 4 spec files
- Uses Yarn (not npm)
- Playwright configured for Chromium
- Tests use Prisma factories (need DATABASE_URL in CI)

---

### Implementation Tasks

#### 1. Create Workflow File

**File:** `.github/workflows/playwright.yml`

**Requirements:**
- Trigger: push to main, PR to main, manual dispatch
- Concurrency: cancel in-progress runs on new pushes
- Job name: `playwright-tests`
- Runner: `ubuntu-latest`
- Timeout: 15 minutes

**Step-by-step:**
```yaml
# 1. Checkout code (actions/checkout@v4)

# 2. Setup Node.js 18 (actions/setup-node@v4)
#    - Use yarn caching: cache: 'yarn'

# 3. Get Playwright version
#    - Command: yarn list @playwright/test --json
#    - Extract version (e.g., 1.58.2)
#    - Output as step variable

# 4. Cache Playwright browsers (actions/cache@v4)
#    - Path: ~/.cache/ms-playwright
#    - Key: playwright-${{ version }}-${{ runner.os }}

# 5. Install dependencies
#    - yarn install --frozen-lockfile

# 6. Install Playwright browsers (conditional)
#    - Only if cache miss
#    - yarn playwright install --with-deps chromium
#    - --with-deps installs system dependencies

# 7. Run tests
#    - yarn playwright test
#    - Env: DATABASE_URL (use placeholder or omit if not configured)

# 8. Merge blob reports (always run, even on failure)
#    - yarn playwright merge-reports --reporter=html blob-report/

# 9. Upload HTML report (always run)
#    - actions/upload-artifact@v4
#    - Name: playwright-report
#    - Path: playwright-report/
#    - Retention: 7 days
```

#### 2. Update playwright.config.ts

**Current reporter config:**
```typescript
reporter: 'list',
```

**New reporter config:**
```typescript
reporter: process.env.CI ? 'blob' : 'html',
```

**Why:** Blob reporter in CI enables report merging and future sharding.

#### 3. Update README.md

**Add badge after main heading:**
```markdown
[![Playwright Tests](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml)
```

**Add CI section to README:**
```markdown
## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions.

- **Workflow:** `.github/workflows/playwright.yml`
- **Browser:** Chromium (CI) / All (local)
- **Reports:** HTML artifacts retained for 7 days
- **Average runtime:** ~2 minutes (with cache)

[View latest test results](https://github.com/david-lake/real-world-playwright-tests/actions)
```

---

### Critical Implementation Details

#### Playwright Version Extraction
```yaml
- name: Get Playwright version
  id: playwright-version
  run: |
    VERSION=$(yarn info @playwright/test --json | jq -r '.children.Version' || \
              yarn list @playwright/test --json | jq -r '.data.trees[0].name' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    echo "version=$VERSION" >> $GITHUB_OUTPUT
  shell: bash
```

#### Conditional Browser Install
```yaml
- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: yarn playwright install --with-deps chromium
```

#### Always Run Report Steps
```yaml
- name: Merge blob reports
  if: always()
  run: yarn playwright merge-reports --reporter=html blob-report/
```

---

### Verification Checklist

Before committing, verify:

- [ ] YAML syntax is valid (use online validator or `yamllint`)
- [ ] `playwright.config.ts` uses `process.env.CI` check
- [ ] All `uses:` actions are recent versions (v4 preferred)
- [ ] Cache keys are correct format
- [ ] `if: always()` on report steps
- [ ] Badge URL matches repo name exactly

---

### Testing the Workflow (Locally)

While you can't run GitHub Actions locally, you can verify:

1. **Blob reporter works:**
   ```bash
   CI=true yarn playwright test
   ls blob-report/  # Should exist
   ```

2. **Report merging works:**
   ```bash
   yarn playwright merge-reports --reporter=html blob-report/
   ls playwright-report/  # Should have index.html
   ```

3. **Config syntax:**
   ```bash
   npx tsc --noEmit  # TypeScript check
   ```

---

### Common Pitfalls to Avoid

❌ **Don't use npm commands** — Project uses Yarn
❌ **Don't install all browsers** — Use `--with-deps chromium` only
❌ **Don't skip blob merging** — Always merge, even on test failure
❌ **Don't hardcode Playwright version** — Extract from installed package
❌ **Don't forget `if: always()`** — Reports must upload even on failure

---

### File Summary

| File | Action | Lines |
|------|--------|-------|
| `.github/workflows/playwright.yml` | Create | ~80 |
| `playwright.config.ts` | Modify reporter line | ~1 |
| `README.md` | Add badge + section | ~10 |

---

### Post-Implementation

After pushing to a branch:
1. Create PR to main
2. Verify workflow triggers
3. Check that report artifact uploads
4. Verify badge renders in PR preview
5. Merge to main