# Feed and Navigation Test Plan

## Overview
This test plan covers feed navigation, pagination, tag filtering, and user-specific feeds in the Next.js Real World application.

## Test Environment
- **Base URL:** http://localhost:3000
- **Framework:** Playwright
- **Browser:** Chromium

---

## Test Suite 1: Feed Navigation

### FT-001: Navigate to Global Feed
**Preconditions:** User is not logged in (guest state).

**Steps:**
1. Navigate to homepage `/`.
2. Verify "Global Feed" tab is visible and active by default.

**Expected Result:**
- "Global Feed" tab is visible and selected.
- Articles from all users are displayed in the feed.
- "Your Feed" tab is either not visible or visible but not selected for guests.

**Selector / Fixture / Test Data Notes:**
- Use `app.home.open()` to navigate to homepage.
- Use `getByRole('link', { name: 'Global Feed' })` for tab selection.
- Verify active state via CSS class or aria-current attribute.

**Multi-point Assertions:**
- Assert "Global Feed" tab is visible.
- Assert articles list is rendered (empty or populated).
- Assert no authentication-required elements are present for guests.

---

### FT-002: Switch Between Global Feed and Your Feed
**Preconditions:** User is logged in and follows at least one user with published articles.

**Steps:**
1. Log in as test user.
2. Navigate to homepage `/`.
3. Verify "Your Feed" and "Global Feed" tabs are visible.
4. Click "Your Feed" tab.
5. Verify feed shows articles from followed users.
6. Click "Global Feed" tab.
7. Verify feed shows all articles.

**Expected Result:**
- Feed content updates when switching tabs.
- Active tab styling reflects current selection.
- Articles are appropriate to the selected feed type.

**Selector / Fixture / Test Data Notes:**
- Use `app.home.gotoYourFeed()` and `app.home.gotoGlobalFeed()` helpers.
- Create test data: user A follows user B; user B has published articles.
- Use factories to set up follow relationship via database.

**Multi-point Assertions:**
- Assert "Your Feed" tab becomes active after click.
- Assert articles from followed user appear in "Your Feed".
- Assert "Global Feed" shows superset of articles including non-followed users.
- Assert URL may update with query parameter for feed type.

---

### FT-003: Your Feed Empty State
**Preconditions:** User is logged in and does not follow any users.

**Steps:**
1. Log in as test user who follows no one.
2. Navigate to homepage `/`.
3. Click "Your Feed" tab.

**Expected Result:**
- Empty state message is displayed (e.g., "No articles are here... yet").
- No articles are shown in the feed.

**Selector / Fixture / Test Data Notes:**
- Use fresh test user with no follow relationships.
- Use `getByText(/no articles/i)` or similar for empty state assertion.

**Multi-point Assertions:**
- Assert empty state message is visible.
- Assert no article cards are rendered.
- Assert "Global Feed" link is suggested to discover content.

---

## Test Suite 2: Pagination

### FT-004: Navigate Through Paginated Results
**Preconditions:** At least 11 articles exist in global feed (to trigger pagination).

**Steps:**
1. Navigate to homepage `/`.
2. Verify first page shows up to 10 articles.
3. Click "Next" pagination button.
4. Verify page 2 loads with remaining articles.
5. Click "Previous" pagination button.
6. Verify returns to page 1.

**Expected Result:**
- Pagination controls are visible when more than 10 articles exist.
- Page transitions load correct article subsets.
- Article count per page does not exceed 10.

**Selector / Fixture / Test Data Notes:**
- Use factory to create 11+ articles via `createArticle()` in a loop.
- Use `getByRole('link', { name: /next|>/i })` or `getByRole('button', { name: 'Next' })`.
- Track article slugs/titles to verify correct pagination.

**Multi-point Assertions:**
- Assert pagination controls are visible when > 10 articles.
- Assert exactly 10 articles on first page (if 11+ exist).
- Assert page 2 contains remaining article(s).
- Assert URL updates with `?page=2` or similar.

---

### FT-005: Pagination Disabled on Single Page
**Preconditions:** Fewer than 11 articles exist in the feed.

**Steps:**
1. Ensure exactly 5 articles exist in global feed.
2. Navigate to homepage `/`.

**Expected Result:**
- All 5 articles are displayed.
- Pagination controls are not visible (or disabled).

**Selector / Fixture / Test Data Notes:**
- Use factory to create exactly 5 articles.
- Use `expect(pagination).not.toBeVisible()` or check disabled state.

**Multi-point Assertions:**
- Assert all 5 articles are visible.
- Assert pagination controls are absent or disabled.

---

## Test Suite 3: Tag Filtering

### FT-006: Filter Feed by Tag
**Preconditions:** At least two articles exist with different tags.

**Steps:**
1. Create article A with tag "javascript".
2. Create article B with tag "ruby".
3. Navigate to homepage `/`.
4. Click on "javascript" tag in the popular tags sidebar.

**Expected Result:**
- Feed updates to show only articles tagged "javascript".
- "#javascript" appears as active filter.
- Article A is visible; Article B is not visible.

**Selector / Fixture / Test Data Notes:**
- Use `app.home.clickTag('javascript')` helper.
- Use `getByRole('link', { name: 'javascript' })` for tag buttons.
- Use distinct tags for test articles to verify filtering.

**Multi-point Assertions:**
- Assert filtered feed shows only matching articles.
- Assert tag filter pill/badge is visible indicating active filter.
- Assert non-matching articles are not visible.
- Assert "Global Feed" tab is still visible (filter applies to feed type).

---

### FT-007: Clear Tag Filter
**Preconditions:** Tag filter is currently active.

**Steps:**
1. Navigate to homepage with tag filter active (e.g., `/tag/javascript`).
2. Click "X" or "Clear filter" button (or click the active tag again).

**Expected Result:**
- Tag filter is removed.
- Feed returns to showing all articles.
- URL updates to remove tag parameter.

**Selector / Fixture / Test Data Notes:**
- Use `app.home.clearTagFilter()` helper.
- May need to click active tag again or use explicit clear button.

**Multi-point Assertions:**
- Assert tag filter indicator is no longer visible.
- Assert articles with different tags are now visible.
- Assert URL no longer contains tag parameter.

---

### FT-008: Tag Filter Empty State
**Preconditions:** Tag exists but has no articles associated with it.

**Steps:**
1. Navigate to tag filter for a tag with no articles (e.g., `/tag/emptytag`).

**Expected Result:**
- Empty state message is displayed.
- No articles are shown.

**Selector / Fixture / Test Data Notes:**
- Use unique tag name that no articles have.
- Navigate directly via URL: `/tag/nonexistent`.

**Multi-point Assertions:**
- Assert empty state message is visible.
- Assert no article cards are rendered.

---

## Test Suite 4: User Profile Feeds

### FT-009: View My Articles on User Profile
**Preconditions:** User has published at least one article.

**Steps:**
1. Log in as test user.
2. Create an article via factory or UI.
3. Navigate to user's profile page (e.g., `/profile/{username}`).
4. Verify "My Articles" tab is active by default.

**Expected Result:**
- User's articles are displayed in the feed.
- "My Articles" tab is active/selected.
- "Favorited Articles" tab is visible but not selected.

**Selector / Fixture / Test Data Notes:**
- Use `app.profile.goto(testUser.username)` for navigation.
- Use `getByRole('link', { name: 'My Articles' })` for tab.
- Profile page may be new page object to create.

**Multi-point Assertions:**
- Assert user's article(s) are visible.
- Assert "My Articles" tab is active.
- Assert correct username displayed on profile page.

---

### FT-010: View Favorited Articles on User Profile
**Preconditions:** User has favorited at least one article.

**Steps:**
1. Log in as test user.
2. Create another user and article (or use existing).
3. Favorite the article.
4. Navigate to test user's profile.
5. Click "Favorited Articles" tab.

**Expected Result:**
- Favorited articles are displayed.
- "Favorited Articles" tab is active.
- Own articles not favorited are not shown here.

**Selector / Fixture / Test Data Notes:**
- Use `app.profile.gotoFavoritedArticles()` helper.
- Use favorite functionality from article tests.

**Multi-point Assertions:**
- Assert favorited article is visible.
- Assert "Favorited Articles" tab is active.
- Assert non-favorited articles are not visible.

---

### FT-011: Empty State for Favorited Articles
**Preconditions:** User has not favorited any articles.

**Steps:**
1. Log in as fresh test user.
2. Navigate to profile page.
3. Click "Favorited Articles" tab.

**Expected Result:**
- Empty state message is displayed.
- No articles shown.

**Selector / Fixture / Test Data Notes:**
- Use fresh user with no favorites.
- Same empty state pattern as other feeds.

**Multi-point Assertions:**
- Assert empty state message is visible.
- Assert no article cards rendered.

---

### FT-012: Navigate to Author Profile from Article
**Preconditions:** Article exists in global feed.

**Steps:**
1. Navigate to homepage `/`.
2. Click on article author's username in article card.

**Expected Result:**
- User is navigated to author's profile page.
- "My Articles" tab shows articles by that author.

**Selector / Fixture / Test Data Notes:**
- Use `app.home.clickArticleAuthor(articleTitle)` helper.
- Author link is typically in article preview card.

**Multi-point Assertions:**
- Assert navigation to `/profile/{username}`.
- Assert profile page shows correct author.
- Assert author's articles are visible.

---

## Test Suite 5: Combined Filters

### FT-013: Tag Filter with Pagination
**Preconditions:** At least 11 articles exist with the same tag.

**Steps:**
1. Create 11 articles all tagged with "testtag".
2. Navigate to homepage and filter by "testtag".
3. Verify pagination appears for filtered results.
4. Click "Next" to navigate to page 2.

**Expected Result:**
- Pagination works within filtered context.
- Page 2 shows remaining tagged articles.
- Tag filter persists across pagination.

**Selector / Fixture / Test Data Notes:**
- Create articles in loop with same tag.
- Verify URL contains both tag and page parameters.

**Multi-point Assertions:**
- Assert pagination controls visible.
- Assert page 2 loads with correct subset.
- Assert tag filter still active after pagination.

---

### FT-014: Tag Filter in Your Feed
**Preconditions:** User follows author with tagged articles.

**Steps:**
1. Create user A who follows user B.
2. User B creates article with tag "specific-tag".
3. Log in as user A.
4. Navigate to "Your Feed".
5. Filter by "specific-tag".

**Expected Result:**
- Filter applies to "Your Feed" (articles from followed users).
- Only followed user's article with that tag is shown.

**Selector / Fixture / Test Data Notes:**
- Requires factory for follow relationship.
- Test interaction between feed type and tag filter.

**Multi-point Assertions:**
- Assert "Your Feed" remains active tab.
- Assert tag filter applied.
- Assert only matching article from followed user visible.

---

## Test Data & Fixtures

### Factory Requirements

**createArticles(count, overrides)** - Create multiple articles at once:
```typescript
// Create 15 articles for pagination tests
const articles = await createArticles(15, { tagList: ['test'] });
```

**createFollowRelationship(followerId, followeeId)** - Set up follow for "Your Feed":
```typescript
await createFollowRelationship(testUser.id, authorUser.id);
```

### Test Data Patterns

| Scenario | Article Count | Tags | Users |
|----------|---------------|------|-------|
| Pagination | 11+ | varied | 2-3 |
| Tag filter | 2+ | distinct | 1-2 |
| Your Feed | 3+ | varied | 2 (follower + followee) |
| Combined | 11+ | same tag | 2-3 |

---

## Priority Matrix

| Priority    | Tests                          | Rationale                                    |
| ----------- | ------------------------------ | -------------------------------------------- |
| P0 Critical | FT-001, FT-004, FT-006, FT-009 | Core feed navigation, pagination, filtering  |
| P1 High     | FT-002, FT-003, FT-005, FT-010 | Feed switching, empty states, profile feeds  |
| P2 Medium   | FT-007, FT-008, FT-011, FT-012 | Filter clearing, empty states, navigation    |
| P3 Low      | FT-013, FT-014                 | Advanced combined scenarios                  |

---

## Acceptance Criteria

1. All feed navigation works correctly (Global, Your Feed, Profile feeds).
2. Pagination functions properly with and without filters.
3. Tag filtering correctly filters articles.
4. Empty states are handled gracefully for all feed types.
5. Combined filters (tag + pagination, tag + Your Feed) work correctly.
6. All tests use `app` pattern and page objects from ARCHITECTURE.md.
7. Each scenario includes multi-point assertions verifying UI state.
