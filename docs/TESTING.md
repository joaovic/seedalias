# Testing Guide

This guide provides comprehensive testing strategies for Seed Alias.

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Manual Testing](#manual-testing)
3. [Test Cases](#test-cases)
4. [Browser Compatibility](#browser-compatibility)
5. [Edge Cases](#edge-cases)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Accessibility Testing](#accessibility-testing)

---

## Testing Overview

Seed Alias uses **manual testing** due to its small size and client-side nature. No automated test framework is required, but systematic testing is essential.

### Testing Levels

| Level | Scope | Frequency |
|-------|-------|-----------|
| Unit | Individual functions | During development |
| Integration | Module interactions | After changes |
| System | Full feature workflows | Before release |
| Acceptance | User scenarios | Before deployment |
| Regression | Existing features still work | With each change |

### Test Environment Setup

```bash
# Start local server
python -m http.server 8000

# Open browser developer tools
# F12 or Right-click → Inspect
```

---

## Manual Testing

### Basic Workflow Test

**Goal:** Verify core encryption/decryption works

**Steps:**

1. **Encrypt a seed:**
   - [ ] Open application
   - [ ] Enter passphrase: `test-passphrase-123`
   - [ ] Enter seed: `abandon about above absent abuse access accident account accuse achieve acid acquired`
   - [ ] Click "Encrypt"
   - [ ] Verify output appears and displays byte count

2. **View encrypted output:**
   - [ ] Check encrypted message is hex string
   - [ ] Verify "Save" button is enabled

3. **Decrypt the seed:**
   - [ ] Enter same passphrase in decrypt panel
   - [ ] Click "Decrypt"
   - [ ] Verify decrypted seed matches original
   - [ ] Check no error message displayed

4. **Save encrypted file:**
   - [ ] Click "Save" button
   - [ ] Verify file downloads as `encrypted-key.txt`
   - [ ] Open file, verify it contains hex string

5. **Load encrypted file:**
   - [ ] Delete content from encrypted message field
   - [ ] Use file input to load saved file
   - [ ] Verify encrypted message field repopulates
   - [ ] Try to decrypt - should succeed

### Scramble Workflow Test

**Goal:** Verify scramble/unscramble works correctly

**Steps:**

1. **Enable scramble after encryption:**
   - [ ] Complete basic encryption
   - [ ] Check "Enable Scramble" checkbox
   - [ ] Verify scramble controls appear

2. **Enter scramble code:**
   - [ ] Code input appears red (invalid initially)
   - [ ] Enter code: `0102`
   - [ ] Code turns green (valid)
   - [ ] "Scramble" button becomes enabled

3. **Scramble the data:**
   - [ ] Click "Scramble" button
   - [ ] Verify scrambled output appears
   - [ ] Check "Unscramble" checkbox auto-checked in decrypt panel

4. **Save scrambled file:**
   - [ ] Click "Save" button
   - [ ] Verify file downloads as `scrambled-key.txt`

5. **Unscramble and decrypt:**
   - [ ] Enter unscramble code: `0102` (same as scramble)
   - [ ] Code should turn green
   - [ ] Click "Unscramble" button
   - [ ] Verify unscrambled data matches original encrypted
   - [ ] Enter passphrase and decrypt
   - [ ] Verify decrypted seed matches original

### Copy/Paste Workflow Test

**Goal:** Verify copy/paste operations work

**Steps:**

1. **Encrypt a seed**
2. **Copy encrypted value:**
   - [ ] Select all encrypted text (Ctrl+A in field)
   - [ ] Copy (Ctrl+C)
   - [ ] Paste into another application
   - [ ] Verify all characters copied

3. **Paste into decrypt:**
   - [ ] Clear encrypted message field
   - [ ] Paste (Ctrl+V) copied value
   - [ ] Decrypt - should succeed

---

## Test Cases

### Test Suite 1: Basic Encryption/Decryption

| # | Input | Expected Output | Status |
|---|-------|-----------------|--------|
| 1.1 | 12-word seed | Encrypts successfully | ☐ |
| 1.2 | 24-word seed | Encrypts successfully | ☐ |
| 1.3 | BIP39 mnemonic | Encrypts successfully | ☐ |
| 1.4 | Random text | Encrypts successfully | ☐ |
| 1.5 | Single word | Encrypts successfully | ☐ |
| 1.6 | Very long text | Encrypts successfully | ☐ |

### Test Suite 2: Passphrase Validation

| # | Input | Expected Output | Status |
|---|-------|-----------------|--------|
| 2.1 | Empty passphrase | Alert: "Please provide passphrase" | ☐ |
| 2.2 | Whitespace only | Alert: "Please provide passphrase" | ☐ |
| 2.3 | Single character | Encrypts successfully | ☐ |
| 2.4 | Long passphrase | Encrypts successfully | ☐ |
| 2.5 | Passphrase with spaces | Encrypts successfully | ☐ |
| 2.6 | Passphrase with special chars | Encrypts successfully | ☐ |
| 2.7 | Passphrase with emojis | Encrypts successfully | ☐ |
| 2.8 | Passphrase with unicode | Encrypts successfully | ☐ |

### Test Suite 3: Decryption Errors

| # | Condition | Expected Output | Status |
|---|-----------|-----------------|--------|
| 3.1 | Wrong passphrase | "Decryption error" in red | ☐ |
| 3.2 | Corrupted encrypted data | "Decryption error" in red | ☐ |
| 3.3 | Missing first byte | "Decryption error" in red | ☐ |
| 3.4 | Empty encrypted field | Alert or error | ☐ |
| 3.5 | Invalid hex format | Alert or error | ☐ |

### Test Suite 4: Scramble Validation

| # | Input | Expected Output | Status |
|---|-------|-----------------|--------|
| 4.1 | Code: `0102` | Valid (green) | ☐ |
| 4.2 | Code: `0102030405` | Valid (green) | ☐ |
| 4.3 | Code: `010` | Invalid (red) | ☐ |
| 4.4 | Code: `9999` (out of range) | Invalid (red) | ☐ |
| 4.5 | Code with letters | Input rejected | ☐ |
| 4.6 | Code with spaces | Input rejected | ☐ |
| 4.7 | Empty code | Invalid (red) | ☐ |

### Test Suite 5: File Operations

| # | Operation | Expected Output | Status |
|---|-----------|-----------------|--------|
| 5.1 | Save encrypted file | File downloads | ☐ |
| 5.2 | Load encrypted file | Content populates field | ☐ |
| 5.3 | Load text file | Content populates field | ☐ |
| 5.4 | Load non-text file | Alert: "Please select text file" | ☐ |
| 5.5 | Save scrambled file | File downloads | ☐ |
| 5.6 | Load scrambled file | Content populates field | ☐ |

### Test Suite 6: UI Interactions

| # | Interaction | Expected Output | Status |
|---|-------------|-----------------|--------|
| 6.1 | Click eye icon | Passphrase visibility toggles | ☐ |
| 6.2 | Click eye twice | Visibility returns to original | ☐ |
| 6.3 | Check scramble checkbox | Scramble controls appear | ☐ |
| 6.4 | Uncheck scramble checkbox | Scramble controls disappear | ☐ |
| 6.5 | Click encrypt before seed | Alert displayed | ☐ |
| 6.6 | Check unscramble checkbox | Unscramble controls appear | ☐ |
| 6.7 | Type in code field | Validation updates in real-time | ☐ |

---

## Browser Compatibility

### Supported Browsers

Test on each supported browser:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 37+ | ☐ | Primary target |
| Firefox | 34+ | ☐ | |
| Safari | 11+ | ☐ | Requires HTTPS for Web Crypto |
| Edge | 12+ | ☐ | Chromium-based |
| Opera | 24+ | ☐ | Chromium-based |

### Testing Procedure

**For each browser:**

1. Open `index.html` or local server URL
2. Run Test Suite 1 (Basic Encryption/Decryption)
3. Note any differences in behavior
4. Document any errors in browser console

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad, Android)
- [ ] Mobile (iPhone, Android)

### Screen Reader Testing

**Using NVDA (Windows) or VoiceOver (Mac):**

- [ ] All form labels are read correctly
- [ ] Button purposes are clear
- [ ] Error messages are announced
- [ ] Output displays are readable

---

## Edge Cases

### Edge Case 1: Maximum Input Length

**Purpose:** Verify handling of very large seeds

**Test:**
```javascript
// In browser console:
const largeText = 'word '.repeat(10000);
// Paste into seed field and encrypt
```

**Expected:** Encrypts successfully without freezing

### Edge Case 2: Special Characters

**Purpose:** Test Unicode and special character handling

**Seeds to test:**
```
abandon about 🔐 unicode (with emoji)
abandon about ñ á é í ó ú (with accents)
abandon about Ṃ ā ḩ ē (with diacritics)
```

**Expected:** All encrypt/decrypt correctly

### Edge Case 3: Rapid Operations

**Purpose:** Test handling of quick successive operations

**Steps:**
1. Encrypt
2. Immediately click encrypt again
3. Verify no corruption or race conditions

### Edge Case 4: Tab Switching

**Purpose:** Test behavior when switching browser tabs

**Steps:**
1. Start encryption (with PBKDF2 delay)
2. Switch to another tab
3. Switch back
4. Verify encryption completes correctly

### Edge Case 5: Browser Back Button

**Purpose:** Test history handling

**Steps:**
1. Encrypt and decrypt
2. Click browser back button
3. Verify form state preserved or cleared appropriately
4. Verify no sensitive data displayed

### Edge Case 6: Copy During Processing

**Purpose:** Test clipboard operations during encryption

**Steps:**
1. Start encryption
2. During PBKDF2 delay, copy something else
3. After encryption, copy encrypted value
4. Paste and verify integrity

### Edge Case 7: Window Resize

**Purpose:** Test responsive layout

**Steps:**
1. Resize browser window smaller (mobile)
2. Verify layout adjusts
3. Verify all buttons/inputs accessible
4. Resize back to normal

### Edge Case 8: Very Weak Passphrase

**Purpose:** Verify security even with weak passphrases

**Test:**
```
Passphrase: "a"
Encrypted with this should still take ~200ms (PBKDF2 delay)
```

**Expected:** PBKDF2 iterations still applied (security)

---

## Performance Testing

### Encryption Speed

**Goal:** Verify acceptable performance

**Test:**
```javascript
// In browser console:
console.time('encrypt');
// Perform encryption
console.timeEnd('encrypt');
```

**Expected Times:**
- PBKDF2 key derivation: 100-500ms (intentional)
- Encryption: <10ms
- Total: 100-510ms

### Decryption Speed

**Expected:** <10ms (after key derivation)

### Large File Handling

**Test:**
```
Seed size: 1KB of data
Expected: Still <50ms encryption
```

### Memory Usage

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot before encryption
3. Perform 10+ encrypt/decrypt cycles
4. Take heap snapshot after
5. Verify no significant memory growth

---

## Security Testing

⚠️ **Critical:** Never use real seed phrases for testing.

### Test 1: Verify No Logging

**Steps:**
1. Open DevTools → Console
2. Perform encrypt/decrypt
3. Verify console is empty (no passphrase/seed logged)

**Expected:** No sensitive data in console output

### Test 2: Verify No Network Requests

**Steps:**
1. Open DevTools → Network tab
2. Perform encrypt/decrypt
3. Verify no HTTP/HTTPS requests

**Expected:** Network tab remains empty

### Test 3: Verify HTTPS Enforcement

**If deployed to production:**

1. Try accessing via `http://` (not HTTPS)
2. Browser should warn or refuse to use Web Crypto API
3. Verify application cannot function

### Test 4: Verify No localStorage/sessionStorage

**Steps:**
1. Open DevTools → Application → Storage
2. Check localStorage
3. Check sessionStorage
4. Verify both empty

**Expected:** No sensitive data stored

### Test 5: Cross-Site Scripting (XSS)

**Test:**
```
Seed input: <script>alert('XSS')</script>
Expected: No alert (content treated as text)
```

### Test 6: SQL Injection (N/A)

Not applicable - no database connections

### Test 7: Sensitive Data in Files

**Test:**
1. Download encrypted file
2. View in text editor
3. Verify content is only hex string
4. Search for passphrase - should not be present

---

## Accessibility Testing

### Keyboard Navigation

**Steps:**
1. Disable mouse (or use keyboard only)
2. Press Tab to navigate
3. Verify all controls reachable
4. Verify Enter activates buttons

**Expected:** All features accessible via keyboard

### Color Contrast

**Using accessibility checker:**
1. Open DevTools → Lighthouse → Accessibility
2. Verify contrast ratios meet WCAG AA standard
3. Check form labels are readable

### Screen Reader

**Using NVDA or VoiceOver:**
1. Read entire page
2. Verify form labels are announced
3. Verify button purposes are clear
4. Verify error messages are announced

### Mobile Accessibility

1. Test on mobile device
2. Verify tap targets are large enough
3. Verify form fields easily tappable
4. Verify no horizontal scroll required

---

## Pre-Release Checklist

Before deploying a new version:

- [ ] All test suites pass
- [ ] Tested on all browsers
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Security review complete
- [ ] No console errors
- [ ] Accessibility verified
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version number incremented

---

## Test Report Template

Use this template when testing:

```markdown
## Test Report - Version X.Y.Z

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Browser/OS

### Results

#### Manual Testing
- [ ] Basic encryption/decryption - ✅ Pass / ❌ Fail
- [ ] Passphrase validation - ✅ Pass / ❌ Fail
- [ ] Decryption errors - ✅ Pass / ❌ Fail
- [ ] Scramble feature - ✅ Pass / ❌ Fail
- [ ] File operations - ✅ Pass / ❌ Fail

#### Browser Compatibility
- [ ] Chrome - ✅ Pass / ❌ Fail
- [ ] Firefox - ✅ Pass / ❌ Fail
- [ ] Safari - ✅ Pass / ❌ Fail
- [ ] Edge - ✅ Pass / ❌ Fail

#### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```

---

**Testing is critical for maintaining security and reliability. Thank you for testing thoroughly!**

See [CONTRIBUTING.md](CONTRIBUTING.md) for the pull request process.
