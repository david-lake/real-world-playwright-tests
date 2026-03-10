# Project Architecture Extension

> **Companion to:** TestDino Playwright Skill  
> **Purpose:** Project-specific patterns that extend the base skill for this RealWorld codebase

This document captures the **unique patterns and conventions** used in this project. For general Playwright best practices (locators, assertions, fixtures, POM theory), refer to the TestDino skill.

---

## Project Folder Structure

```
tests/
├── components/        # Global UI components used across multiple pages
│   └── header.component.ts    # Navigation header with auth state checks
├── factories/         # Database factories for test data (Prisma-based)
│   ├── user.factory.ts        # User creation, cleanup, unique data
│   └── article.factory.ts     # Article creation with tags
├── fixtures/          # Playwright fixtures (test.extend)
│   └── auth.fixture.ts        # app + testUser fixtures with auto-cleanup
├── pages/             # Page Object Models + App class
│   ├── app.ts                 # Combines all pages/components
│   ├── home.page.ts           # Feed, article cards, navigation
│   ├── login.page.ts          # Authentication flows
│   ├── register.page.ts       # Registration flows
│   ├── settings.page.ts       # User settings
│   ├── article.page.ts        # Article detail, comments
│   └── editor.page.ts         # Article create/edit
├── docs/              # Architecture documentation
│   └── ARCHITECTURE.md        # This file
└── *.spec.ts          # Test files grouped by feature
    ├── authentication.spec.ts
    ├── article.spec.ts
    └── feed-navigation.spec.ts
```

### When to Use Each Folder

| Folder | Put Here | Don't Put Here |
|--------|----------|----------------|
| `components/` | UI elements appearing on **2+ pages** (header, footer, modals) | Page-specific elements, one-off locators |
| `factories/` | Functions that **create data in database** via Prisma | Test data objects, inline form data |
| `fixtures/` | Playwright `test.extend()` configurations | Page objects, test utilities |
| `pages/` | Page classes with `goto()`, `isLoaded()`, user actions | Assertions (belong in tests), raw locators |
| `*.spec.ts` | Test cases with `test.describe()` and `expect()` | Page logic, data creation, shared helpers |

---

## The App Pattern (Project-Specific)

All pages and components are accessed through a single `app` object provided by the fixture.

```typescript
// tests/fixtures/auth.fixture.ts
import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail, type TestUser } from '@factories/user.factory';
import { App } from '@pages/app';

export const test = base.extend<{
  testUser: TestUser;
  app: App;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();
    await use(user);
    await deleteUserByEmail(user.email);  // Per-test cleanup
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});
```

```typescript
// tests/pages/app.ts
export class App {
  readonly login: LoginPage;
  readonly home: HomePage;
  readonly header: Header;
  // ... all pages and components

  constructor(readonly page: Page) {
    this.login = new LoginPage(page);
    this.home = new HomePage(page);
    this.header = new Header(page);
    // ... instantiate all
  }
}
```

**Why this pattern:**
- Tests import once: `import { test } from '@fixtures/auth.fixture'`
- All pages available: `app.login`, `app.home`, `app.header`
- No manual instantiation in every test
- Autocomplete works across all pages

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Page objects | `[name].page.ts` | `login.page.ts`, `article.page.ts` |
| Components | `[name].component.ts` | `header.component.ts`, `modal.component.ts` |
| Factories | `[name].factory.ts` | `user.factory.ts`, `article.factory.ts` |
| Fixtures | `[name].fixture.ts` | `auth.fixture.ts` |
| Test files | `[feature].spec.ts` | `authentication.spec.ts` |

### Classes

| Type | Pattern | Example |
|------|---------|---------|
| Page classes | `PascalCase + Page` | `LoginPage`, `ArticlePage` |
| Component classes | `PascalCase + Component` | `HeaderComponent` (or just `Header`) |
| Factory functions | `camelCase, verb-first` | `createUser()`, `generateUniqueArticle()` |

### Methods

**Pages/Components:**
- Navigation: `goto()`, `goto[Destination]()` — `goto()`, `gotoSettings()`, `gotoNeedAnAccount()`
- State check: `expectLoaded()` — verifies page is ready
- User actions: `login()`, `register()`, `createArticle()` — describes user intent
- Error checks: `expectError()` — asserts error state

**Factories:**
- Create: `create[Entity]()` — `createUser()`, `createArticle()`
- Generate: `generateUnique[Entity]()` — `generateUniqueUser()`, `generateUniqueArticle()`
- Cleanup: `delete[Entity]By[Field]()` — `deleteUserByEmail()`, `deleteArticleBySlug()`

**Tests:**
- Describe blocks: Feature name — `test.describe('Registration')`
- Test names: Behavior description — `test('Successful user registration', ...)`

---

## Test Style: User Stories

Tests should read like a user story. If you can't understand what the test does in 10 seconds, it's wrong.

**✅ Good — reads like a story:**
```typescript
test('Successful user registration', async ({ app }) => {
  const newUser = generateUniqueUser();

  await app.home.open();
  await app.header.gotoRegister();
  await app.register.register(newUser.username, newUser.email, newUser.password);

  await app.home.expectLoaded();
  await app.header.expectLoggedIn(newUser.username);
});
```

**❌ Bad — technical, not user-focused:**
```typescript
test('register', async ({ page }) => {
  await page.goto('/');
  await page.locator('#navbar a[href="/register"]').click();
  await page.fill('input[name="username"]', 'test');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});
```

### The Standard Test Structure

```typescript
test('Clear description of behavior', async ({ app, testUser }) => {
  // 1. Setup (create data if needed)
  const article = await createArticle(testUser.id);
  
  // 2. Navigate to starting point
  await app.home.open();
  
  // 3. Perform user actions
  await app.header.gotoNewArticle();
  await app.editor.createArticle(articleData);
  
  // 4. Verify landing page loaded
  await app.article.expectLoaded();
  
  // 5. Verify UI state (NOT just URL)
  await app.article.expectCorrectDetails(articleData.title, articleData.body);
  await app.header.expectLoggedIn(testUser.username);
});
```

---

## Strong Assertions: Verify UI State

**❌ Never just check URL:**
```typescript
await app.login.login(testUser.email, testUser.password);
await expect(page).toHaveURL('/');  // Doesn't prove login worked!
```

**✅ Verify UI state:**
```typescript
await app.login.login(testUser.email, testUser.password);
await app.home.expectLoaded();
await app.header.expectLoggedIn(testUser.username);  // Verifies authenticated UI
```

### State Verification Methods

**Header component (auth state):**
```typescript
await app.header.expectLoggedIn(username);   // Settings, New Article visible
await app.header.expectLoggedOut();          // Sign in, Sign up visible
```

**Pages (load verification):**
```typescript
await app.home.expectLoaded();
await app.login.expectLoaded();
await app.article.expectLoaded();
```

---

## Database Factories (Prisma)

Factories create data directly in the database for fast, reliable test setup.

### User Factory Pattern

```typescript
// tests/factories/user.factory.ts
export interface UserData {
  username: string;
  email: string;
  password: string;
}

export interface TestUser extends UserData {
  id: number;
  plainPassword: string;  // For login in tests
}

export function generateUniqueUser(): UserData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'TestPass123!',
  };
}

export async function createUser(overrides?: Partial<UserData>): Promise<TestUser> {
  const userData = generateUniqueUser();
  const user = await prisma.user.create({
    data: {
      username: overrides?.username ?? userData.username,
      email: overrides?.email ?? userData.email,
      password: hashPassword(overrides?.password ?? userData.password),
    },
  });
  return { ...user, plainPassword: userData.password };
}

export async function deleteUserByEmail(email: string): Promise<void> {
  // Cascading cleanup of user's articles, comments, favorites, etc.
  await prisma.$transaction([...]);
}
```

### Article Factory Pattern

```typescript
// tests/factories/article.factory.ts
export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export interface CreatedArticle extends ArticleData {
  slug: string;
  id: number;
}

export function generateUniqueArticle(overrides?: Partial<ArticleData>): ArticleData {
  const timestamp = Date.now();
  return {
    title: `Test Article ${timestamp}`,
    description: `Description for ${timestamp}`,
    body: `Body content for ${timestamp}`,
    tagList: [`tag-${timestamp}`],
    ...overrides,
  };
}

export async function createArticle(
  authorId: number,
  data?: ArticleData
): Promise<CreatedArticle> {
  // Creates article + tags in database
  // Returns with slug for navigation
}

export async function deleteArticleBySlug(slug: string): Promise<void> {
  // Cascading cleanup
}
```

### Factory Usage in Tests

```typescript
// Create via fixture (auto-cleanup)
test('example', async ({ app, testUser }) => {
  // testUser created and cleaned up automatically
});

// Create manually for specific needs
test('example', async ({ app }) => {
  const author = await createUser();
  const article = await createArticle(author.id);
  
  // Test using article...
  
  await deleteArticleBySlug(article.slug);
  await deleteUserByEmail(author.email);
});
```

---

## Components vs Pages

### Components (State Verification)

Components are for **global UI elements** that appear on multiple pages. They verify state, not perform navigation.

```typescript
// tests/components/header.component.ts
export class Header {
  constructor(private page: Page) {}

  // ❌ Navigation goes in tests or page objects
  // async gotoLogin() { ... }

  // ✅ State verification
  async expectLoggedIn(username: string) {
    await expect(this.page.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Sign in' })).not.toBeVisible();
  }
}
```

### Pages (Actions)

Pages perform user actions and navigation.

```typescript
// tests/pages/login.page.ts
export class LoginPage {
  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
```

**Rule of thumb:** If it's on every page (header, footer), make it a component. If it's page-specific, keep it in the page.

---

## Path Aliases

Always use path aliases for imports. Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["tests/fixtures/*"],
      "@pages/*": ["tests/pages/*"],
      "@components/*": ["tests/components/*"],
      "@factories/*": ["tests/factories/*"]
    }
  }
}
```

**✅ Use aliases:**
```typescript
import { test } from '@fixtures/auth.fixture';
import { generateUniqueUser } from '@factories/user.factory';
import { LoginPage } from '@pages/login.page';
import { Header } from '@components/header.component';
```

**❌ Don't use relative paths:**
```typescript
import { test } from '../fixtures/auth.fixture';
import { generateUniqueUser } from '../factories/user.factory';
```

---

## Test Isolation Rules

### 1. Each Test Creates Its Own Data

```typescript
// ✅ Fixture provides isolated user
test('example', async ({ app, testUser }) => {
  await app.login.login(testUser.email, testUser.plainPassword);
});

// ❌ Never assume pre-existing data
test('example', async ({ app }) => {
  await app.login.login('existing@user.com', 'password');  // NO!
});
```

### 2. Unique Data for Parallel Safety

Always use `generateUniqueUser()` or `generateUniqueArticle()` to avoid collisions:

```typescript
const user = generateUniqueUser();  // Unique for this test
```

### 3. Per-Test Cleanup via Fixture

```typescript
testUser: async ({}, use) => {
  const user = await createUser();
  await use(user);
  await deleteUserByEmail(user.email);  // Only delete this test's user
},
```

---

## Code Style Rules

### Minimal Comments

**❌ Don't comment obvious code:**
```typescript
// Navigate to login page
await app.login.goto();

// Enter credentials
await app.login.loginAs(testUser);
```

**✅ Code should be self-documenting:**
```typescript
await app.login.goto();
await app.login.loginAs(testUser);
await app.home.expectLoaded();
await app.header.expectLoggedIn(testUser.username);
```

### No Unused Code

Remove any methods, imports, or files not used by current tests.

### Use TypeScript Types

```typescript
import type { UserData, TestUser } from '@factories/user.factory';
import type { ArticleData } from '@factories/article.factory';
```

### Exact String Matches

```typescript
// ✅ Good
await this.page.getByRole('link', { name: 'Settings' });

// ❌ Overly complex
await this.page.getByRole('link', { name: /^settings$/i });
```

---

## Agent Checklist

When generating tests for this project, verify:

- [ ] **App Pattern**: All tests use `({ app, testUser })` fixture
- [ ] **Strong Assertions**: Use `app.header.expectLoggedIn()`, not just URL checks
- [ ] **Locator Priority**: `getByRole()` > `getByLabel()` > `getByPlaceholder()`
- [ ] **Path Aliases**: `@fixtures/`, `@pages/`, `@components/`, `@factories/`
- [ ] **Test Data**: Use `testUser` fixture or `generateUniqueUser()`
- [ ] **Cleanup**: Per-test cleanup via fixture, not global `afterEach`
- [ ] **Page Methods**: `goto()`, `expectLoaded()`, and action methods like `loginAs()`
- [ ] **No CSS Selectors**: Semantic locators only
- [ ] **Minimal Comments**: Code is self-documenting
- [ ] **User Intent**: Methods describe what user is doing, not technical steps
- [ ] **File Naming**: `[name].page.ts`, `[name].component.ts`, `[feature].spec.ts`

---

## Quick Reference: Adding a New Page

1. Create `tests/pages/[name].page.ts`:
```typescript
import { Page, expect } from '@playwright/test';

export class ProfilePage {
  constructor(private page: Page) {}

  async goto(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  async expectLoaded() {
    await expect(this.page.getByRole('heading', { name: /profile/i })).toBeVisible();
  }

  async gotoMyArticles() {
    await this.page.getByRole('link', { name: 'My Articles' }).click();
  }
}
```

2. Add to `tests/pages/app.ts`:
```typescript
import { ProfilePage } from '@pages/profile.page';

export class App {
  readonly profile: ProfilePage;
  // ... other pages

  constructor(readonly page: Page) {
    this.profile = new ProfilePage(page);
    // ... other pages
  }
}
```

3. Use in test:
```typescript
test('example', async ({ app, testUser }) => {
  await app.profile.goto(testUser.username);
  await app.profile.expectLoaded();
});
```
