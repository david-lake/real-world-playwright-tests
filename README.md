# RealWorld Playwright Test Suite

[![Playwright Tests](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/david-lake/real-world-playwright-tests/actions/workflows/playwright.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green.svg)](https://playwright.dev/)

> **Production-grade E2E test automation for the RealWorld spec**  
> A comprehensive demonstration of modern test architecture using Playwright, featuring Page Object Model, test factories, database isolation, CI/CD integration, and **AI-native test generation**.

## 🎯 What This Project Demonstrates

This isn't just a collection of tests — it's a **reference implementation** of how to build maintainable, scalable E2E test suites for modern web applications.

- ✅ **Test Architecture** — How to structure large E2E suites
- ✅ **Playwright Best Practices** — Fixtures, POM, component objects
- ✅ **Database Testing** — Prisma integration for test data
- ✅ **CI/CD Integration** — GitHub Actions with service containers
- ✅ **Test Isolation** — Guaranteed clean state per test
- ✅ **Maintainable Code** — TypeScript, clear abstractions, DRY principles
- ✅ **AI-Native Development** — Agent-driven test planning, generation, and healing

**Built for:** SDETs, QA Engineers, and developers who want to see professional-grade test automation patterns in action.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TEST ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Test Specs │───▶│   Fixtures   │───▶│  DB Cleaner  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                              │
│         ▼                   ▼                              │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │   App Class  │◀───│   Factories  │                      │
│  └──────────────┘    └──────────────┘                      │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Page Objects │───▶│ Components   │───▶│  RealWorld   │  │
│  └──────────────┘    └──────────────┘    │     App      │  │
│                                          └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Pattern | Implementation | Why It Matters |
|---------|---------------|----------------|
| **Page Object Model** | `tests/pages/*.page.ts` | Separates page structure from test logic — change the UI in one place |
| **Component Objects** | `tests/components/*.component.ts` | Reusable interactions for shared UI (header, feed, etc.) |
| **Test Factories** | `tests/factories/*.factory.ts` | Programmatic data creation via Prisma — fast, reliable test setup |
| **App Class** | `tests/utils/app.ts` | Single entry point to all page objects — clean, discoverable API |
| **DB Isolation** | `tests/utils/db.ts` | Resets database before each test — no flaky cross-test pollution |
| **Custom Fixtures** | `tests/fixtures/test.fixture.ts` | Composable test context with automatic cleanup |

## 📊 Test Coverage

### Authentication (`authentication.spec.ts`)
- ✅ User registration (success, duplicate username, duplicate email)
- ✅ Login flows (valid credentials, invalid password, unregistered email)
- ✅ Session persistence across page reloads
- ✅ Logout functionality
- ✅ Protected route access control

### Articles (`articles.spec.ts`)
- ✅ Article creation with validation
- ✅ Article editing with verification
- ✅ Article deletion
- ✅ Favouriting/unfavouriting articles

### Comments (`comments.spec.ts`)
- ✅ Guest comment restrictions (view-only, no posting)
- ✅ Authenticated user commenting
- ✅ Comment deletion (own vs others)

### Feeds (`feeds.spec.ts`)
- ✅ Global feed (all articles, guest view)
- ✅ Personal feed (followed users only)
- ✅ Pagination and infinite scroll
- ✅ Feed switching
- ✅ Profile feeds (my articles, favorited articles)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8
- Yarn (via Corepack)

### 1. Clone & Install

```bash
git clone https://github.com/david-lake/real-world-playwright-tests.git
cd real-world-playwright-tests
yarn install
```

### 2. Setup Database

```bash
# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env with your MySQL credentials
# Default: mysql://root:pass@localhost/real_blog?useUnicode=true&characterEncoding=utf8&useSSL=false

# Run migrations
yarn prisma migrate deploy

# Generate JWK keys for auth
yarn generate:jwk
# Copy PRIVATE_JWK to .env and PUBLIC_JWK to lib/constants.ts
```

### 3. Start the App

```bash
yarn dev
```

App runs at `http://localhost:3000`

### 4. Run Tests

```bash
# Run all tests (headless)
yarn playwright test

# Run with UI mode for debugging
yarn playwright test --ui

# Run specific spec
yarn playwright test authentication.spec.ts

# Run with browser visible
yarn playwright test --headed
```

## 🏭 Project Structure

```
tests/
├── pages/                 # Page Object Models
│   ├── home.page.ts
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── article.page.ts
│   ├── editor.page.ts
│   ├── profile.page.ts
│   └── settings.page.ts
├── components/            # Reusable UI components
│   ├── header.component.ts
│   └── feed.component.ts
├── factories/             # Test data generation
│   ├── user.factory.ts    # Create users via Prisma
│   └── article.factory.ts # Create articles, comments, follows
├── utils/                 # Test utilities
│   ├── app.ts            # App class (pages entry point)
│   └── db.ts             # Database reset utilities
├── fixtures/              # Playwright fixtures
│   └── test.fixture.ts   # Custom test with DB cleaner
├── *.spec.ts              # Test specifications
│   ├── authentication.spec.ts
│   ├── articles.spec.ts
│   ├── comments.spec.ts
│   └── feeds.spec.ts
└── .github/agents/        # AI Agent Instructions
    ├── playwright-test-planner.agent.md
    ├── playwright-test-generator.agent.md
    └── playwright-test-healer.agent.md

specs/                     # Test Plans (root level)
├── authentication-test-plan.md
├── article-test-plan.md
├── feed-test-plan.md
└── cicd-design.md
```

## 🔧 Key Features

### 1. Database-Level Test Isolation

Unlike many E2E suites that rely on UI cleanup, we reset the **entire database** before each test:

```typescript
// tests/utils/db.ts
export async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.favorites.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.articlesTags.deleteMany(),
    prisma.article.deleteMany(),
    prisma.follows.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tag.deleteMany(),
  ]);
}
```

This guarantees **zero cross-test pollution** — every test starts from a known clean state.

### 2. Prisma-Powered Factories

Test data is created directly in the database via Prisma — no UI clicking required:

```typescript
// Create a user with random data
const user = await createUser();

// Create an article for that user
const article = await createArticle(user.id);

// Set up a follow relationship
await createFollowRelationship(follower.id, author.id);
```

**Benefits:**
- 10x faster than UI-based setup
- No brittle UI dependencies for test prerequisites
- Full control over test data state

### 3. Fluent Page Object API

Tests read like English:

```typescript
test('successful login', async ({ app, user }) => {
  await app.login.open();
  await app.login.login(user.email, user.password);
  await app.home.expectLoaded();
  await app.header.expectLoggedIn(user.username);
});
```

Each page object encapsulates:
- **Selectors** — Centralized, maintainable
- **Actions** — What a user can do on this page
- **Assertions** — What should be visible/verifyable

### 4. Component Reusability

Shared UI (header, feed) are Component Objects used across multiple pages:

```typescript
// Used in home.page.ts, article.page.ts, profile.page.ts
await app.header.gotoLogin();
await app.header.expectLoggedIn(username);
await app.feed.expectArticleVisible(articleTitle);
```

## 🔄 Continuous Integration

Every push and PR automatically runs the full test suite via GitHub Actions.

### CI Pipeline

```yaml
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Checkout  │──▶│ Setup MySQL │──▶│   Install   │──▶│   Run Tests │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                          │
                                                          ▼
                                                    ┌─────────────┐
                                                    │   Upload    │
                                                    │   Report    │
                                                    └─────────────┘
```

### Features

- **MySQL Service** — Fresh database per CI run
- **Browser Caching** — Faster subsequent runs
- **Parallelization Safety** — Single worker with DB isolation
- **Artifact Uploads** — HTML reports retained for 7 days
- **Average Runtime** — ~2 minutes with cache

[View Latest CI Runs →](https://github.com/david-lake/real-world-playwright-tests/actions)

## 🧪 Why This Approach?

### Compared to Basic Playwright Tests

| Basic Approach | This Architecture |
|----------------|-------------------|
| Inline selectors | Page Object Models |
| Hardcoded test data | Factory-generated data |
| UI-based setup/cleanup | Database-level operations |
| Tests depend on each other | Complete test isolation |
| Copy-paste assertions | Reusable assertion methods |
| Manual cleanup | Automatic DB reset |

### Real-World Benefits

1. **Maintainability** — UI changes? Update one page object, not 50 tests
2. **Reliability** — No flaky tests from leftover data or race conditions
3. **Speed** — DB operations beat UI interactions every time
4. **Clarity** — Tests document behavior, not implementation details
5. **Scale** — Easy to add new tests without reinventing patterns

## 🤖 AI-Native Test Development

This test suite is designed for **AI-augmented workflows**. The `.github/agents/` directory contains specialized AI agents that can plan, generate, and maintain tests autonomously.

### AI Agent Ecosystem

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Test Planner** | Explores the app and creates comprehensive test plans | `specs/*.md` files |
| **Test Generator** | Converts test plans into executable Playwright code | `*.spec.ts` files |
| **Test Healer** | Diagnoses and fixes failing tests automatically | CI failures |

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-NATIVE WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Test Planner │───▶│  Test Plan   │───▶│   Review     │      │
│  │    Agent      │    │   (specs/)   │    │   & Refine   │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                   │              │
│                                                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   CI/CD      │◀───│  Generated   │◀───│  Test Gen    │      │
│  │   Pipeline   │    │   Tests      │    │   Agent      │      │
│  └──────┬───────┘    └──────────────┘    └──────────────┘      │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │    Failed    │───▶│  Test Healer │                           │
│  │    Tests     │    │    Agent     │                           │
│  └──────────────┘    └──────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Using AI Agents to Extend Coverage

#### Option 1: Plan New Features

Point the Test Planner agent at a new feature:

```bash
# Agent explores the app and creates a test plan
specs/profile-settings-test-plan.md
```

The agent will:
- Navigate through the UI
- Identify all interactive elements
- Document happy paths and edge cases
- Output a comprehensive test plan

#### Option 2: Generate Tests from Plans

Feed the test plan to the Test Generator agent:

```bash
# Agent reads the spec and generates test code
tests/profile-settings.spec.ts
```

The agent will:
- Read the test plan from `specs/`
- Examine existing patterns in the codebase
- Generate tests following established conventions
- Use existing page objects and fixtures

#### Option 3: Auto-Heal Failing Tests

When CI detects failures, the Test Healer agent:

```bash
# Agent diagnoses and fixes
tests/flaky-test.spec.ts → FIXED
```

The agent will:
- Analyze failure traces and screenshots
- Identify root causes (selector changes, timing, etc.)
- Apply fixes following best practices
- Verify the fix passes

### Example: Adding Tags Feature

**Step 1:** Planner explores tags UI → creates `specs/tags-test-plan.md`

**Step 2:** Generator reads plan → creates `tests/tags.spec.ts`

**Step 3:** Tests run in CI → any failures auto-healed

**Result:** Feature coverage increased with minimal manual effort.

### Why This Matters

Traditional test automation requires **manual effort** for every new feature. AI-native testing means:

- ⚡ **10x faster coverage** — Agents write tests while you focus on architecture
- 🔄 **Self-maintaining** — Healer agents keep tests green as UI changes
- 📈 **Infinite scalability** — Coverage grows with agent hours, not people hours
- 🎯 **Consistency** — Agents always follow established patterns

This isn't the future — it's **how this repo was built**.

## 📝 Writing New Tests (Manual)

Prefer to write tests yourself? Follow this pattern:

### 1. Create a Test Plan

Document the behavior you're testing in `specs/`:

```markdown
## Feature: Article Creation

### Test Cases
- TC001: Create article with valid data
- TC002: Validation errors for empty fields
- TC003: Article appears in global feed immediately
```

### 2. Add Factory Methods (if needed)

```typescript
// tests/factories/article.factory.ts
export async function createDraftArticle(userId: number) {
  return prisma.article.create({
    data: { /* ... */ }
  });
}
```

### 3. Write the Test

```typescript
// tests/articles.spec.ts
import { test } from '@fixtures/test.fixture';

test('create article draft', async ({ app, user }) => {
  await app.login.open();
  await app.login.login(user.email, user.password);
  
  await app.editor.open();
  await app.editor.createDraft({
    title: 'My Draft',
    body: 'Draft content'
  });
  
  await app.editor.expectDraftSaved();
});
```

## 🔗 Resources

- [RealWorld Spec](https://github.com/gothinkster/realworld)
- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test agents]([https://playwright.dev/](https://playwright.dev/docs/test-agents))
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Built with:** Playwright • TypeScript • Prisma • GitHub Actions • AI Agents

**Status:** ✅ Production-ready CI/CD | 🤖 AI-native test generation | 🎯 SDET candidate — open to opportunities
