# RealWorld Playwright Test Suite

Production-grade test automation for the [RealWorld](https://github.com/gothinkster/realworld) demo application (Conduit — a Medium clone).

[![Playwright Tests](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml)

---

## 🎯 Overview

This project demonstrates **senior-level test automation practices** including:

- **Page Object Model (POM)** architecture for maintainability
- **TypeScript** with strict mode for type safety
- **Fixtures** for test isolation and reusable setup
- **Parallel execution** with 4 workers in CI
- **Multi-browser testing** (Chromium, Firefox, WebKit)
- **Test tagging** for selective execution (@smoke, @auth, @regression)
- **CI/CD** with GitHub Actions and comprehensive reporting
- **Visual regression** and accessibility testing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (v22 recommended)
- Yarn package manager
- MySQL 8.0+ (for local app instance)

### Installation

```bash
# Install dependencies
yarn install

# Install Playwright browsers
yarn playwright install

# Setup database (see main app README)
cp .env.example .env
# Configure DATABASE_URL and PRIVATE_JWK
yarn db:migrate
```

### Running Tests

```bash
# Run all tests
yarn test

# Run with UI mode
yarn test:ui

# Run smoke tests only
yarn test:smoke

# Run auth tests only
yarn test:auth

# Show HTML report
yarn test:report
```

### Linting & Formatting

```bash
# Run ESLint
yarn lint

# Fix ESLint issues
yarn lint:fix

# Format with Prettier
yarn prettier
```

---

## 🏗️ Architecture

### Folder Structure

```
.
├── tests/                    # Test files
│   ├── auth/                 # Authentication tests
│   ├── article/              # Article CRUD tests
│   ├── feed/                 # Feed and navigation tests
│   ├── profile/              # Profile and settings tests
│   ├── api/                  # API/GraphQL tests
│   ├── visual/               # Visual regression tests
│   └── accessibility/        # Accessibility tests
├── pages/                    # Page Object Models
│   ├── BasePage.ts           # Base page with common methods
│   ├── LoginPage.ts          # Login page interactions
│   ├── RegisterPage.ts       # Registration page
│   ├── ArticlePage.ts        # Article CRUD
│   ├── FeedPage.ts           # Home/feed page
│   ├── ProfilePage.ts        # User profiles
│   └── components/           # Component objects
│       └── Navigation.ts     # Navigation bar
├── fixtures/                 # Test fixtures and setup
│   ├── fixtures.ts           # Custom test fixtures
│   ├── global-setup.ts       # Global setup
│   └── global-teardown.ts    # Global teardown
└── utils/                    # Test utilities
```

### Design Principles

1. **Page Object Model**: Separate page interactions from test logic
2. **Role-based selectors**: Use `getByRole()` for resilient, accessible selectors
3. **Test isolation**: Fresh browser context and test user per test
4. **DRY fixtures**: Reusable setup via custom fixtures
5. **Explicit waits**: No arbitrary timeouts, use Playwright's auto-waiting

---

## 🧪 Test Coverage

| Feature | Tests | Tags |
|---------|-------|------|
| Authentication | 5 | @auth @smoke |
| Article CRUD | 6 | @article |
| Feed & Navigation | 4 | @feed |
| Comments | 3 | @social |
| Profile | 4 | @profile |
| API/GraphQL | 4 | @api |
| Visual Regression | 3 | @visual |
| Accessibility | 2 | @accessibility |

**Total: 25-35 tests**

---

## 🏷️ Test Tags

Use tags to run specific test suites:

```bash
# Smoke tests (critical path)
yarn test --grep @smoke

# All authentication tests
yarn test --grep @auth

# Regression suite (everything except visual)
yarn test --grep @regression

# API tests only
yarn test --grep @api
```

| Tag | Description |
|-----|-------------|
| @smoke | Critical path tests, run on every PR |
| @auth | Login, registration, session management |
| @article | Article CRUD operations |
| @feed | Feed navigation and pagination |
| @social | Comments, favorites, following |
| @profile | User profiles and settings |
| @api | GraphQL API tests |
| @visual | Visual regression tests |
| @accessibility | WCAG compliance tests |
| @regression | Full test suite |

---

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:
- **Parallel execution**: 4 workers in CI
- **Retries**: 2 retries on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop + mobile (Pixel 5, iPhone 12)
- **Reporting**: HTML + JUnit XML
- **Artifacts**: Screenshots, videos, traces on failure

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `PRIVATE_JWK` | JWT private key for auth |
| `CI` | Set automatically in CI, enables retries |

---

## 📊 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/playwright.yml`):

1. **Lint & Format Check** — Runs ESLint and Prettier
2. **Playwright Tests** — Runs tests in 4 parallel shards
3. **Artifacts** — Uploads HTML reports and JUnit XML

### Scheduled Runs

Daily smoke tests at 8 AM UTC to catch regressions.

---

## 📝 Best Practices

### Writing Tests

```typescript
import { test, expect } from '../fixtures/fixtures';

test('user can create article', async ({ articlePage, testUser }) => {
  // Arrange: Login and navigate
  await articlePage.gotoNewArticle();
  
  // Act: Create article
  await articlePage.createArticle(
    'Test Title',
    'Test Description',
    'Test body content',
    ['tag1', 'tag2']
  );
  
  // Assert: Verify article created
  await expect(articlePage.getArticleTitle()).toBe('Test Title');
});
```

### Page Object Example

```typescript
export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByRole('textbox', { name: /email/i });
  readonly passwordInput = this.page.getByRole('textbox', { name: /password/i });
  readonly signInButton = this.page.getByRole('button', { name: /sign in/i });

  async login(email: string, password: string): Promise<void> {
    await this.safeFill(this.emailInput, email);
    await this.safeFill(this.passwordInput, password);
    await this.safeClick(this.signInButton);
  }
}
```

---

## 📈 Test Reports

### HTML Report

```bash
yarn test:report
```

Features:
- Test timeline with screenshots
- Trace viewer for debugging
- Video playback of failures
- Performance metrics

### JUnit XML

Generated at `playwright-report/junit.xml` for CI integration.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Test Framework | Playwright 1.58+ |
| Language | TypeScript 4.7+ (strict mode) |
| Linting | ESLint + @typescript-eslint |
| Formatting | Prettier |
| CI/CD | GitHub Actions |
| Reporting | Playwright HTML + JUnit |
| Visual Testing | Playwright Screenshot |
| Accessibility | @axe-core/playwright |

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [RealWorld Spec](https://github.com/gothinkster/realworld/tree/main/api)

---

## 📄 License

MIT — See [LICENSE](../LICENSE) for details.

---

Built with ❤️ as a portfolio piece demonstrating modern test automation practices.
