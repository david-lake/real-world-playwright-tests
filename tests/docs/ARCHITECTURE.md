## Test achitecture and best practices to follow

### Locator Priority (Strict Order)
1. `getByRole()` — Primary method (buttons, links, headings)
2. `getByLabel()` — Form controls with labels
3. `getByPlaceholder()` — Inputs without labels
4. `getByText()` — Non-interactive elements only
5. `getByTestId()` — Last resort when user-facing locators impossible

### Inline Locators
Define locators directly inside methods by default:

```typescript
async enterShippingInfo(user: User) {
  await this.page.getByPlaceholder('First Name').fill(user.firstName);
  await this.page.getByRole('button', { name: 'Continue' }).click();
}
```

Promote to class fields only when used in 3+ methods or tests need direct access.

### Meaningful Actions
Methods must represent user intent + verification:

| ❌ Bad (Thin Wrapper) | ✅ Good (Meaningful Action) |
|----------------------|----------------------------|
| `clickCheckout()` | `proceedToCheckout()` — clicks AND verifies URL |
| `fillFirstName(text)` | `enterShippingInfo(user: User)` — fills all fields |

### Web-First Assertions
Always use Playwright's auto-retrying assertions:

```typescript
await expect(this.page).toHaveURL(/checkout/);
await expect(this.cartItems).toHaveCount(2);
await expect(this.errorMessage).toBeVisible();
```

### Typed Test Data
Create typed data objects in `tests/data/`:

```typescript
export interface User {
  username: string;
  email: string;
  password: string;
}
```

### General

- Don't polute the code with comments, only comment for complex lines

## 6. Test Isolation with Data Setup/Teardown

### Critical Rule: Never Assume Test Data Exists
**Each test must create its own test data.** Tests that rely on pre-existing data will fail when run in isolation or in CI.

### Data Setup Patterns

**Direct Database Setup**
Use factories in `tests/factories/` to create data via Prisma/ORM:

```typescript
import { test as base, expect } from '@playwright/test';
import { createUser, deleteUserByEmail } from '../factories/user.factory';

const test = base.extend<{
  testUser: { email: string; username: string; password: string };
}>({
  testUser: async ({}, use) => {
    // Create user directly in DB
    const user = await createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!'
    });

    await use({
      email: user.email,
      username: user.username,
      password: user.plainPassword
    });

    // Cleanup after test
    await deleteUserByEmail(user.email);
  },
});

test('user can login with registered credentials', async ({ page, testUser }) => {
  // Now testUser exists in DB - proceed with test
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(testUser.email);
  // ... rest of test
});
```

### Data Uniqueness
Always generate unique data to avoid conflicts when tests run in parallel:

```typescript
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'TestPassword123!'
  };
}
```

### Cleanup Strategy
- **Preferred**: Use fixture `use()` callback for automatic cleanup
- **Alternative**: Use `test.afterEach()` for cleanup
- **Last resort**: Use unique data and global cleanup (least reliable)

### Before Generating Any Test
Ask yourself:
1. [ ] What data does this test need to exist before it runs?
2. [ ] How will I create that data (factory or UI)?
3. [ ] How will I ensure the data is unique (timestamps/random)?
4. [ ] How will I clean up after the test?

**Never generate a test that assumes data exists without showing how it's created.**

## 7. Project Structure

Organize tests using this folder structure:

```
tests/
├── components/     # Reusable UI component helpers (global)
├── data/           # Type data structure
├── factories/      # Test data factories for DB setup/cleanup
├── fixtures/       # Custom test fixtures for setup/teardown
├── pages/          # Page Object Models — one class per page/section
└── *.spec.ts       # Test files grouped by feature
```

### Components Folder
**Purpose:** Reusable UI component interactions that appear across multiple pages.

**What belongs here:**
- Navigation components (header, sidebar, footer)
- Common form elements (date pickers, search bars, dropdowns)
- Modal/dialog interactions
- Toast/notification handlers
- Reusable button groups or action menus

**Example:**
```typescript
// tests/components/navigation.component.ts
export class NavigationComponent {
  constructor(private page: Page) {}

  async clickHome() {
    await this.page.getByRole('link', { name: /home/i }).click();
    await expect(this.page).toHaveURL('/');
  }

  async clickSettings() {
    await this.page.getByRole('link', { name: /settings/i }).click();
    await expect(this.page).toHaveURL('/settings');
  }
}
```

### Factories Folder
**Purpose:** Create and clean up test data directly in the database.

**What belongs here:**
- User factories (createUser, deleteUser)
- Article/post factories
- Comment factories
- Any domain entity that needs test data
- Cleanup functions for data teardown

**Example:**
```typescript
// tests/factories/user.factory.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createUser(overrides = {}) {
  const user = await prisma.user.create({
    data: {
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: await hashPassword('TestPass123!'),
      ...overrides
    }
  });
  return { ...user, plainPassword: 'TestPass123!' };
}

export async function deleteUserByEmail(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}
```

### Fixtures Folder
**Purpose:** Extend Playwright's base test with custom fixtures.

**What belongs here:**
- Authentication fixtures (auto-login users)
- Database seeding fixtures
- Common setup patterns shared across test files
- Page object fixtures for clean test imports

**Example:**
```typescript
// tests/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { createUser, deleteUserByEmail } from '../factories/user.factory';

export const test = base.extend<{
  authenticatedUser: { email: string; username: string };
}>({
  authenticatedUser: async ({ page }, use) => {
    const user = await createUser();
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill(user.email);
    await page.getByRole('textbox', { name: /password/i }).fill(user.plainPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');

    await use({ email: user.email, username: user.username });

    await deleteUserByEmail(user.email);
  },
});
```

### Pages Folder
**Purpose:** Page Object Models for complex page interactions.

**What belongs here:**
- One POM class per page or major section
- Page-specific locators, methods and assertions
- Business logic and user flows
- Page navigation methods

**Example:**
```typescript
// tests/pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Username').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await expect(this.page).toHaveURL('/');
  }
}
```

### Test Files (*.spec.ts)
**Purpose:** Actual test implementations.

**What belongs here:**
- Test suites organized by feature
- Test cases with steps and assertions
- Feature-specific beforeEach setup
- Import and use fixtures, pages, and factories

**Structure:**
```typescript
import { test, expect } from '../fixtures/auth.fixture';
import { createArticle } from '../factories/article.factory';

test.describe('Article Management', () => {
  test('user can create article', async ({ page, authenticatedUser }) => {
    // Test implementation using fixtures and factories
  });
});
```

## Verification Checklist — BEFORE Marking Complete

**You MUST complete this checklist and run tests before considering the task done.**

### Step 1: Rule Compliance Verification
Review the generated test file(s) and verify:

- [ ] **Locator Priority**: All locators use `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()` (no CSS/XPath)
- [ ] **Inline Locators**: Locators defined inside methods by default (only promoted to class fields if used 3+ times or tests need access)
- [ ] **Meaningful Actions**: Methods represent user intent + verification (e.g., `proceedToCheckout()` not `clickCheckout()`)
- [ ] **Web-First Assertions**: All assertions use `await expect(locator).toBeVisible()` not `expect(await locator.isVisible())`
- [ ] **Typed Test Data**: Using interfaces/types for data, not primitive strings
- [ ] **Test Isolation**: Test creates its own data (factory or UI setup) — never assumes pre-existing data
- [ ] **Data Uniqueness**: Test data uses timestamps/random to avoid conflicts in parallel runs
- [ ] **Cleanup Strategy**: Fixture teardown or `afterEach` cleanup is implemented
- [ ] **Folder Structure**: Files placed in correct folders (components/, factories/, fixtures/, pages/, *.spec.ts)
- [ ] **No Direct Page Access**: Tests interact through POMs/fixtures, not `page` directly
