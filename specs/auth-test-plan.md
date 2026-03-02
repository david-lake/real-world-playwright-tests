# User Authentication Test Plan

## Overview
This test plan covers all user authentication flows for the Next.js Real World application.

## Test Environment
- **Base URL:** http://localhost:3000
- **Framework:** Playwright
- **Browser:** Chromium

---

## Test Suite 1: User Registration

### TC-001: Successful User Registration
**Preconditions:** User is not logged in, no account with test data exists
**Steps:**
1. Navigate to `/register`
2. Fill in unique username, valid email, and password
3. Click "Sign up" button
4. Verify user is redirected or token is stored
**Expected Result:** User is successfully registered and logged in

### TC-002: Registration with Duplicate Username
**Preconditions:** User with username "existinguser" exists
**Steps:**
1. Navigate to `/register`
2. Fill in username "existinguser", unique email, valid password
3. Click "Sign up" button
**Expected Result:** Error message "Username or email had been used" is displayed

### TC-003: Registration with Duplicate Email
**Preconditions:** User with email "test@example.com" exists
**Steps:**
1. Navigate to `/register`
2. Fill in unique username, email "test@example.com", valid password
3. Click "Sign up" button
**Expected Result:** Error message "Username or email had been used" is displayed

### TC-004: Registration with Invalid Email Format
**Preconditions:** None
**Steps:**
1. Navigate to `/register`
2. Fill in username, invalid email (e.g., "notanemail"), valid password
3. Click "Sign up" button
**Expected Result:** Validation error "Invalid email" is displayed

### TC-005: Registration with Missing Required Fields
**Preconditions:** None
**Steps:**
1. Navigate to `/register`
2. Leave all fields empty
3. Click "Sign up" button
**Expected Result:** Validation errors for required fields are displayed

### TC-006: Registration with Weak Password
**Preconditions:** None
**Steps:**
1. Navigate to `/register`
2. Fill in valid username, email, and very short password (e.g., "123")
3. Click "Sign up" button
**Expected Result:** Appropriate validation message or registration succeeds

### TC-007: Guest-Only Restriction on Registration Page
**Preconditions:** User is already logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/register` directly via URL
**Expected Result:** User is redirected to homepage

---

## Test Suite 2: User Login

### TC-008: Successful Login with Email and Password
**Preconditions:** User account exists with known credentials
**Steps:**
1. Navigate to `/login`
2. Enter valid email and password
3. Click "Sign in" button
**Expected Result:** User is successfully logged in and redirected to homepage

### TC-009: Login with Invalid Password
**Preconditions:** User account exists
**Steps:**
1. Navigate to `/login`
2. Enter valid email but incorrect password
3. Click "Sign in" button
**Expected Result:** Error message "Bad Credentials" is displayed

### TC-010: Login with Non-Existent Email
**Preconditions:** None
**Steps:**
1. Navigate to `/login`
2. Enter email that doesn't exist in system and any password
3. Click "Sign in" button
**Expected Result:** Error message "Bad Credentials" is displayed

### TC-011: Login with Empty Fields
**Preconditions:** None
**Steps:**
1. Navigate to `/login`
2. Leave email and password fields empty
3. Click "Sign in" button
**Expected Result:** Validation errors for required fields are displayed

### TC-012: Guest-Only Restriction on Login Page
**Preconditions:** User is already logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/login` directly via URL
**Expected Result:** User is redirected to homepage

---

## Test Suite 3: Protected Routes

### TC-013: Access Settings Page When Authenticated
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/settings`
**Expected Result:** Settings page loads successfully with user's current information

### TC-014: Access Settings Page When Not Authenticated
**Preconditions:** User is not logged in (no valid token)
**Steps:**
1. Clear any stored authentication token
2. Navigate to `/settings` directly via URL
**Expected Result:** User is redirected to `/login`

### TC-015: Access Editor Page When Authenticated
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/editor`
**Expected Result:** Editor page loads successfully

### TC-016: Access Editor Page When Not Authenticated
**Preconditions:** User is not logged in
**Steps:**
1. Clear any stored authentication token
2. Navigate to `/editor` directly via URL
**Expected Result:** User is redirected to `/login`

---

## Test Suite 4: User Profile Update

### TC-017: Update User Profile Successfully
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/settings`
3. Modify bio or image field
4. Click "Update Settings" button
**Expected Result:** Profile is updated successfully, success message displayed

### TC-018: Update Password
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/settings`
3. Enter new password in password field
4. Click "Update Settings" button
**Expected Result:** Password is updated, user can login with new password

### TC-019: Update Profile with Duplicate Username
**Preconditions:** User is logged in, another user exists with taken username
**Steps:**
1. Log in as existing user
2. Navigate to `/settings`
3. Change username to one that already exists
4. Click "Update Settings" button
**Expected Result:** Error message "Username or email had been used" is displayed

### TC-020: Update Profile with Duplicate Email
**Preconditions:** User is logged in, another user exists with taken email
**Steps:**
1. Log in as existing user
2. Navigate to `/settings`
3. Change email to one that already exists
4. Click "Update Settings" button
**Expected Result:** Error message "Username or email had been used" is displayed

---

## Test Suite 5: Logout

### TC-021: Successful Logout
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Navigate to `/settings`
3. Click "Or click here to logout" button
**Expected Result:** User is logged out, token is removed from localStorage, redirected to homepage

### TC-022: Token Removed After Logout
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Verify token exists in localStorage
3. Perform logout
4. Check localStorage for token
**Expected Result:** Token is removed from localStorage

---

## Test Suite 6: Session Persistence

### TC-023: Session Persists on Page Refresh
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Refresh the page
3. Verify user is still logged in
**Expected Result:** User session persists after page refresh

### TC-024: Session Persists on Browser Restart
**Preconditions:** User is logged in
**Steps:**
1. Log in as an existing user
2. Close browser completely
3. Reopen browser and navigate to the app
4. Verify user is still logged in
**Expected Result:** User session persists after browser restart

---

## Test Suite 7: Token Validation

### TC-025: Invalid Token Handling
**Preconditions:** User has invalid/expired token stored
**Steps:**
1. Manually set an invalid token in localStorage
2. Navigate to a protected page like `/settings`
**Expected Result:** User is redirected to login or token is cleared

### TC-026: Malformed Token Handling
**Preconditions:** None
**Steps:**
1. Set a malformed token string in localStorage
2. Navigate to a protected page like `/settings`
**Expected Result:** Appropriate error handling or redirect to login

---

## Test Suite 8: Navigation & UX

### TC-027: Link from Login to Register
**Preconditions:** User is on login page
**Steps:**
1. Navigate to `/login`
2. Click "Need an account?" link
**Expected Result:** User is navigated to `/register`

### TC-028: Link from Register to Login
**Preconditions:** User is on register page
**Steps:**
1. Navigate to `/register`
2. Click "Have an account?" link
**Expected Result:** User is navigated to `/login`

### TC-029: Loading State During Login
**Preconditions:** None
**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Sign in" button
4. Observe loading state
**Expected Result:** Loading spinner or indicator is shown during authentication

### TC-030: Loading State During Registration
**Preconditions:** None
**Steps:**
1. Navigate to `/register`
2. Enter valid credentials
3. Click "Sign up" button
4. Observe loading state
**Expected Result:** Loading spinner or indicator is shown during registration

---

## Test Data Requirements

| Field | Valid Test Data | Invalid Test Data |
|-------|-----------------|-------------------|
| Email | test@example.com | notanemail, empty |
| Password | SecurePass123! | "", "123" |
| Username | testuser123 | "", existing username |
| Bio | "This is my bio" | >300 characters |
| Image URL | https://example.com/image.jpg | invalid-url |

---

## Test Fixtures

Test users should be created in the database with known credentials for testing:
- User 1: username="testuser", email="test@example.com", password="TestPass123"
- User 2: username="existinguser", email="existing@example.com", password="TestPass123"

---

## Priority Matrix

| Priority | Test Cases |
|----------|-------------|
| P0 (Critical) | TC-001, TC-008, TC-013, TC-014, TC-021 |
| P1 (High) | TC-002, TC-003, TC-009, TC-010, TC-017, TC-022, TC-023 |
| P2 (Medium) | TC-004, TC-005, TC-011, TC-012, TC-015, TC-016, TC-018, TC-024, TC-025, TC-027, TC-028 |
| P3 (Low) | TC-006, TC-007, TC-019, TC-020, TC-026, TC-029, TC-030 |

---

## Acceptance Criteria

1. All P0 and P1 test cases must pass
2. Authentication flow works for registration, login, and logout
3. Protected routes correctly redirect unauthenticated users
4. Guest-only pages correctly redirect authenticated users
5. Error messages are displayed appropriately for invalid inputs
6. Token is properly stored and cleared
7. User session persists across page refreshes

