# Article Feature Test Plan

## Overview
This test plan covers article creation, editing, deletion, favouriting, and commenting in the Next.js Real World application.

## Test Environment
- **Base URL:** http://localhost:3000
- **Framework:** Playwright
- **Browser:** Chromium

---

## Test Suite 1: Article Creation

### AT-001: Successful Article Creation
**Preconditions:** User is logged in (`app`, `testUser` fixtures).

**Steps:**
1. Navigate to homepage `/`.
2. Click "New article" link in the header.
3. Fill in valid article title, description, body, and at least one tag.
4. Click "Publish Article" button.

**Expected Result:**
- User is redirected to the new article detail page.
- Article title, body, and tags are visible on the page.
- Header still shows authenticated state for `testUser.username`.

**Selector / Fixture / Test Data Notes:**
- Use `app.header.isLoggedIn(testUser.username)` to verify authenticated header before and after publishing.
- Use `getByRole('link', { name: "New article" })` to open `/editor`.
- Use page object methods (e.g. `app.editor.createArticle(articleData)`) once implemented.
- Article data should be unique per test (e.g. timestamp in title).

**Multi-point Assertions:**
- Assert editor page is loaded before filling (e.g. "New Article" heading visible).
- Assert article detail page heading matches submitted title.
- Assert article body text matches submitted body.
- Assert at least one tag chip is visible with the submitted tag name.

---

### AT-002: Article Creation Validation Errors
**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `/editor` via "New article" link.
2. Leave required fields (title and body) empty.
3. Click "Publish Article" button.

**Expected Result:**
- Article is not published.
- Validation error messages are displayed for missing fields.
- User remains on editor page.

**Selector / Fixture / Test Data Notes:**
- Use `app.editor.goto()` and `app.editor.isLoaded()` for navigation.
- Use `getByRole('button', { name: "Publish Article" })` for submission.
- Use `app.editor.expectValidationError(message)` helpers to assert validation messages when implemented.

**Multi-point Assertions:**
- Assert editor heading remains visible.
- Assert no navigation to article detail URL.
- Assert specific validation messages (e.g. "title can't be blank", "body can't be blank") are visible.

---

## Test Suite 2: Article Editing

### AT-003: Edit Own Article Successfully
**Preconditions:** User is logged in; at least one article exists created by this user (can be created in test via API/factory).

**Steps:**
1. From homepage, navigate to own article detail page (e.g. via profile or global feed).
2. Click "Edit Article" button/link.
3. Update article title and body.
4. Click "Publish Article" / "Update Article" button.

**Expected Result:**
- User is redirected back to the updated article detail page.
- Updated title and body are displayed.
- Article slug/URL remains valid.

**Selector / Fixture / Test Data Notes:**
- Prefer `app.article.createOwnedArticle(testUser)` via factory-backed helper once available.
- Use `getByRole('button', { name: "Edit Article" })` or appropriate role-based locator.
- Use `app.editor.updateArticle(articleData)` method to express user intent.

**Multi-point Assertions:**
- Assert editor is pre-filled with the original article data before editing.
- Assert new title and body are rendered after saving.
- Assert header still shows authenticated state.

---

### AT-004: Prevent Editing Article When Not Author
**Preconditions:** Two users exist; article is created by another user.

**Steps:**
1. Log in as non-author user.
2. Navigate to article detail page owned by another user.

**Expected Result:**
- No "Edit Article" button or link is visible for the non-author.

**Selector / Fixture / Test Data Notes:**
- Use factories to create `authorUser` and `otherUser`, plus an article linked to `authorUser`.
- Use `app.article.goto(articleSlug)` helper.
- Use `expect(...).not.toBeVisible()` on "Edit Article" control.

**Multi-point Assertions:**
- Assert article content (title, body) is visible to the non-author.
- Assert "Edit Article" and "Delete Article" controls are not visible for the non-author.

---

## Test Suite 3: Article Deletion

### AT-005: Delete Own Article
**Preconditions:** User is logged in and is the author of at least one article.

**Steps:**
1. Navigate to own article detail page.
2. Click "Delete Article" button.

**Expected Result:**
- User is redirected back to homepage or profile feed.
- Deleted article no longer appears in the feed for that user.

**Selector / Fixture / Test Data Notes:**
- Use `getByRole('button', { name: "Delete Article" })` for action.
- Use `app.article.expectNotInFeed(articleTitle)` to assert removal once helper exists.

**Multi-point Assertions:**
- Assert article detail heading is not visible after deletion.
- Assert article preview card is absent from user’s article list/feed.
- Assert authenticated header remains visible.

---

## Test Suite 4: Favouriting Articles

### AT-006: Favourite and Unfavourite Article from Global Feed
**Preconditions:** User is logged in; at least one article exists in global feed not authored by this user.

**Steps:**
1. Navigate to homepage `/`.
2. Locate an article card in the global feed.
3. Click the favourite (heart) button on the article.
4. Click the favourite button again to unfavourite.

**Expected Result:**
- Favourite count increases by 1 after favouriting.
- Favourite count returns to original value after unfavouriting.
- Heart icon state reflects favourited/unfavourited status.

**Selector / Fixture / Test Data Notes:**
- Use `getByRole('button', { name: /favorite article/i })` or equivalent accessible label.
- Use `app.feed.toggleFavourite(articleTitle)` helper when building page objects.

**Multi-point Assertions:**
- Assert count text on article card updates after each click.
- Assert UI style/state (e.g. filled vs outlined heart) changes with favourite state.
- Optionally assert favourited article appears in "Favorited Articles" tab under user profile.

---

## Test Suite 5: Commenting on Articles

### AT-007: Add Comment to Article
**Preconditions:** User is logged in; article exists.

**Steps:**
1. Navigate to article detail page.
2. Scroll to comments section.
3. Enter a comment in the comment textarea.
4. Click "Post Comment" button.

**Expected Result:**
- Comment appears in the comments list below the article.
- Comment shows the correct author (current user) and timestamp.

**Selector / Fixture / Test Data Notes:**
- Use `getByPlaceholder('Write a comment...')` or appropriate label for the textarea.
- Use `getByRole('button', { name: "Post Comment" })` for submission.
- Comment text should be unique per test (e.g. `"Test comment " + Date.now()`).

**Multi-point Assertions:**
- Assert article detail header remains visible after posting.
- Assert new comment item’s text content matches the submitted comment.
- Assert comment author username matches `testUser.username`.

---

### AT-008: Prevent Commenting When Not Logged In
**Preconditions:** User is not logged in (no valid token).

**Steps:**
1. Navigate directly to an article detail page.

**Expected Result:**
- Comment editor is not interactive for guests.
- A prompt to sign in or sign up is displayed instead of the comment form.

**Selector / Fixture / Test Data Notes:**
- Ensure auth token is cleared before navigation.
- Use `expect(...).not.toBeVisible()` on comment textarea for guests.
- Use `getByRole('link', { name: "Sign in" })` / `getByRole('link', { name: "Sign up" })` near comments to assert guest prompt.

**Multi-point Assertions:**
- Assert comment textarea is hidden or disabled.
- Assert sign-in/sign-up call-to-action is visible near the comments area.

---

## Test Suite 6: Article Listing & Filters

### AT-009: Article Appears in Global Feed After Creation
**Preconditions:** User is logged in.

**Steps:**
1. Create a new article via `/editor`.
2. Navigate back to homepage `/`.

**Expected Result:**
- Newly created article appears in the global feed with correct title and description.

**Selector / Fixture / Test Data Notes:**
- Use unique article title to avoid collisions.
- Use `app.home.expectArticleInGlobalFeed(articleTitle)` helper for assertion when available.

**Multi-point Assertions:**
- Assert article preview card exists with the correct title and description.
- Assert article author name matches `testUser.username`.

---

### AT-010: Tag Filter Shows Only Matching Articles
**Preconditions:** At least two articles exist with different tag sets, one containing a specific tag.

**Steps:**
1. Navigate to homepage `/`.
2. Click on a popular tag in the tag list.

**Expected Result:**
- Feed switches to show only articles that include the selected tag.

**Selector / Fixture / Test Data Notes:**
- Use `getByRole('button', { name: tagName })` or `getByRole('link', { name: tagName })` depending on implementation.
- Article data for seeding should include clear, unique tags.

**Multi-point Assertions:**
- Assert selected tag name appears as the active feed filter/tab.
- Assert all visible article cards contain the selected tag chip.
- Optionally assert that an article known not to have the tag is not visible.

---

## Test Data & Fixtures

- Reuse existing `app` and `testUser` fixtures from `@fixtures/auth.fixture`.
- Introduce an `ArticleData` factory (future work) similar to `UserData` for creating unique article payloads.
- For tests requiring multiple users or pre-seeded articles, use database factories or API helpers to avoid relying on existing UI state.

---

## Priority Matrix

| Priority    | Tests                          | Rationale                                    |
| ----------- | ------------------------------ | -------------------------------------------- |
| P0 Critical | AT-001, AT-004, AT-005, AT-009 | Core CRUD + security boundaries + visibility |
| P1 High     | AT-002, AT-003, AT-006, AT-007 | Edit, validation, engagement features        |
| P2 Medium   | AT-008, AT-010                 | Auth boundaries (less critical), filtering   |
| P3 Low      | (none)                         | —                                            |

---

## Acceptance Criteria

1. All article tests validate both navigation and visible UI state, not just URLs.
2. All scenarios can be implemented using the `app` pattern and page objects described in `/tests/docs/ARCHITECTURE.md`.
3. Each scenario includes multi-point assertions verifying that the application state matches user expectations after actions.

