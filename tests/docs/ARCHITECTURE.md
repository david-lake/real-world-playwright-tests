# Test Architecture & Best Practices

## Philosophy

**Tests should read like user stories.** Each test expresses clear user intent with minimal boilerplate. If you can't understand what the test does in 10 seconds, it's wrong.

**Example of the final style:**
```typescript
test('TC-008: Successful login with valid email and password', async ({ app, testUser }) => {
  await app.login.goto();
  await app.login.loginAs(testUser);
  await app.home.isLoaded();
  await app.header.isLoggedIn(testUser.username);
});
```

---

## Project Structure

```
tests/
├── components/        # Global UI components (header, footer, navigation, notifications, modals etc)
├── factories/         # Database factories for test data setup/cleanup
├── fixtures/          # Custom Playwright fixtures (auth, app, testUser)
├── pages/             # Page Object Models + App class
│   ├── app.ts         # Combines all pages/components
│   ├── home.page.ts
│   ├── login.page.ts
│   └── ...
├── docs/              # Architecture documentation
└── *.spec.ts          # Test files grouped by feature
```

---

## The App Pattern

**All pages and components are accessed through a single `app` object.**

```typescript
// fixtures/auth.fixture.ts
import { App } from '@pages/app';

export const test = base.extend<{
  testUser: UserData;
  app: App;
}>({
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});
```

```typescript
// tests/pages/app.ts
export class App {
  readonly login: LoginPage;
  readonly register: RegisterPage;
  readonly settings: SettingsPage;
  readonly home: HomePage;
  readonly header: Header;

  constructor(readonly page: Page) {
    this.login = new LoginPage(page);
    this.register = new RegisterPage(page);
    this.settings = new SettingsPage(page);
    this.home = new HomePage(page);
    this.header = new Header(page);
  }
}
```

**Benefits:**
- Tests are clean: `await app.login.goto()` instead of `const loginPage = new LoginPage(page)`
- Single import in tests: `import { test } from '@fixtures/auth.fixture'`
- All pages/components available via autocomplete

---

## Test Structure

### The Standard Test Pattern

Every authentication test follows this pattern:

```typescript
test('TC-XXX: Clear description of what user is doing', async ({ app, testUser }) => {
  // 1. Navigate to starting page
  await app.login.goto();

  // 2. Perform action (login, register, logout)
  await app.login.loginAs(testUser);

  // 3. Verify landing page loaded
  await app.home.isLoaded();

  // 4. Verify auth state via UI (NOT just URL)
  await app.header.isLoggedIn(testUser.username);
});
```

### Strong Assertions (NOT Just URLs)

**❌ Bad: Only checking URL**
```typescript
await app.login.loginAs(testUser);
await expect(page).toHaveURL('/');  // This doesn't prove login worked!
```

**✅ Good: Checking UI state**
```typescript
await app.login.loginAs(testUser);
await app.home.isLoaded();
await app.header.isLoggedIn(testUser.username);  // Verifies Settings, New Article, username links visible
```

**State Verification Methods:**

```typescript
// Header component - use for all auth state checks
await app.header.isLoggedIn(username);   // Verifies authenticated UI
await app.header.isLoggedOut();          // Verifies guest UI

// Page load verification
await app.home.isLoaded();
await app.login.isLoaded();
await app.settings.isLoaded();
```

---

## Locator Priority (Strict Order)

1. `getByRole()` — Primary method (buttons, links, headings)
2. `getByLabel()` — Form controls with labels
3. `getByPlaceholder()` — Inputs without labels
4. `getByText()` — Non-interactive elements only
5. `getByTestId()` — Last resort when user-facing locators impossible

**❌ Never use:**
- CSS selectors (`input[placeholder="Email"]`)
- XPath
- Text contains when exact match possible

**✅ Example:**
```typescript
async loginAs(user: UserData) {
  await this.page.getByPlaceholder('Email').fill(user.email);
  await this.page.getByPlaceholder('Password').fill(user.password);
  await this.page.getByRole('button', { name: "Sign in" }).click();
}
```

---

## Page Object Model Patterns

### Every Page Has `goto()` and `isLoaded()`

```typescript
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.isLoaded();  // Verify we actually landed
  }

  async isLoaded() {
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async loginAs(user: UserData) {
    await this.page.getByPlaceholder('Email').fill(user.email);
    await this.page.getByPlaceholder('Password').fill(user.password);
    await this.page.getByRole('button', { name: "Sign in" }).click();
  }
}
```

### Methods Represent User Intent

**❌ Bad:**
```typescript
async fillEmail(email: string) { ... }
async fillPassword(password: string) { ... }
async clickSignInButton() { ... }
```

**✅ Good:**
```typescript
async loginAs(user: UserData) {
  await this.page.getByPlaceholder('Email').fill(user.email);
  await this.page.getByPlaceholder('Password').fill(user.password);
  await this.page.getByRole('button', { name: "Sign in" }).click();
}
```

---

## Test Data & Factories

### User Factory Pattern

```typescript
// tests/factories/user.factory.ts
export interface UserData {
  username: string;
  email: string;
  password: string;
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

export async function createUser(overrides: Partial<UserData> = {}): Promise<TestUser> {
  // Creates user directly in database via Prisma
  // Returns user with plainPassword for test login
}

export async function deleteUserByEmail(email: string) {
  // Cleanup for parallel-safe test isolation
}
```

### Fixture with Automatic Cleanup

```typescript
// tests/fixtures/auth.fixture.ts
export const test = base.extend<{
  testUser: UserData;
  app: App;
}>({
  testUser: async ({}, use) => {
    const user = await createUser();

    await use({
      username: user.username,
      email: user.email,
      password: user.plainPassword,
    });

    // Cleanup after test using unique email (parallel-safe)
    await deleteUserByEmail(user.email);
  },
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});
```

---

## Path Aliases

**Always use path aliases for imports:**

```typescript
// ✅ Good
import { test } from '@fixtures/auth.fixture';
import { generateUniqueUser } from '@factories/user.factory';
import { LoginPage } from '@pages/login.page';
import { Header } from '@components/header.component';

// ❌ Bad
import { test } from '../fixtures/auth.fixture';
import { generateUniqueUser } from '../factories/user.factory';
```

**Configured in tsconfig.json:**
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

---

## Test Isolation Rules

### 1. Each Test Creates Its Own Data

**❌ Never assume data exists:**
```typescript
test('login works', async ({ app }) => {
  await app.login.goto();
  await app.login.loginAs({ email: 'existing@user.com', password: 'pass' });  // NO!
});
```

**✅ Use fixture to create user:**
```typescript
test('login works', async ({ app, testUser }) => {
  await app.login.goto();
  await app.login.loginAs(testUser);
  await app.home.isLoaded();
});
```

### 2. Unique Data for Parallel Safety

Always use `generateUniqueUser()` to avoid conflicts:

```typescript
test('registration', async ({ app }) => {
  const userData = generateUniqueUser();  // Unique for this test
  await app.login.goto();
  await app.login.gotoNeedAnAccount();
  await app.register.register(userData.username, userData.email, userData.password);
  await app.home.isLoaded();
});
```

### 3. Per-Test Cleanup (Not Global)

**❌ Bad: Global cleanup that deletes all users**
```typescript
test.afterEach(async () => {
  await deleteAllUsers();  // Breaks parallel tests!
});
```

**✅ Good: Per-test cleanup via fixture**
```typescript
testUser: async ({}, use) => {
  const user = await createUser();
  await use({ ... });
  await deleteUserByEmail(user.email);  // Only delete this test's user
},
```

---

## Component Pattern

Components are for **global UI elements** that appear on multiple pages:

```typescript
// tests/components/header.component.ts
export class Header {
  constructor(private page: Page) {}

  // State verification methods (NOT navigation)
  async isLoggedIn(username: string) {
    await expect(this.page.getByRole('link', { name: "Settings" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "New article" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: username })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "Sign in" })).not.toBeVisible();
  }

  async isLoggedOut() {
    await expect(this.page.getByRole('link', { name: "Sign in" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "Sign up" })).toBeVisible();
    await expect(this.page.getByRole('link', { name: "Settings" })).not.toBeVisible();
  }
}
```

**Components verify state. Pages perform actions.**

---

## Code Style Rules

### 1. Minimal Comments

**❌ Don't comment obvious code:**
```typescript
// Navigate to login page
await app.login.goto();

// Enter email and password
await app.login.loginAs(testUser);

// Check that we are logged in
await app.header.isLoggedIn(testUser.username);
```

**✅ Code should be self-documenting:**
```typescript
await app.login.goto();
await app.login.loginAs(testUser);
await app.home.isLoaded();
await app.header.isLoggedIn(testUser.username);
```

### 2. No Unused Code

Remove any methods, imports, or files not used by current tests.

### 3. Use `UserData` Type

```typescript
import type { UserData } from '@factories/user.factory';

async loginAs(user: UserData) { ... }
```

### 4. Exact String Matches

Use exact string matches for locators (not regex when exact works):

```typescript
// ✅ Good
await this.page.getByRole('link', { name: "Settings" })

// ❌ Overly complex
await this.page.getByRole('link', { name: /^settings$/i })
```

---

## Complete Working Example

**Test file:**
```typescript
import { test } from '@fixtures/auth.fixture';
import { generateUniqueUser } from '@factories/user.factory';

test.describe('Registration', () => {
  test('TC-001: Successful User Registration', async ({ app }) => {
    const userData = generateUniqueUser();

    await app.login.goto();
    await app.login.gotoNeedAnAccount();
    await app.register.register(userData.username, userData.email, userData.password);
    await app.home.isLoaded();
    await app.header.isLoggedIn(userData.username);
  });
});
```

**Supporting files:**
- `tests/fixtures/auth.fixture.ts` — Provides `app` and `testUser`
- `tests/pages/app.ts` — Combines all pages/components
- `tests/pages/login.page.ts` — `goto()`, `isLoaded()`, `loginAs()`, `gotoNeedAnAccount()`
- `tests/pages/register.page.ts` — `register()` method
- `tests/pages/home.page.ts` — `isLoaded()` verification
- `tests/components/header.component.ts` — `isLoggedIn()` state check
- `tests/factories/user.factory.ts` — `generateUniqueUser()`, `createUser()`, `deleteUserByEmail()`

---

## Agent Task Checklist

When generating tests, verify:

- [ ] **App Pattern**: All tests use `({ app, testUser })` fixture
- [ ] **Strong Assertions**: Use `app.header.isLoggedIn()` not just URL checks
- [ ] **Locator Priority**: `getByRole()` > `getByLabel()` > `getByPlaceholder()`
- [ ] **Path Aliases**: Use `@fixtures/`, `@pages/`, `@components/`, `@factories/`
- [ ] **Test Data**: Use `testUser` fixture or `generateUniqueUser()`
- [ ] **Cleanup**: Per-test cleanup via fixture, not global `afterEach`
- [ ] **Page Methods**: `goto()`, `isLoaded()`, and action methods like `loginAs()`
- [ ] **No CSS Selectors**: Semantic locators only
- [ ] **Minimal Comments**: Code is self-documenting
- [ ] **User Intent**: Methods describe what user is doing, not technical steps
