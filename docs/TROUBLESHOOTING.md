# Troubleshooting Guide

Common issues and their solutions.

## 📋 Table of Contents

1. [Application Issues](#application-issues)
2. [Encryption/Decryption Issues](#encryptiondecryption-issues)
3. [Scramble Issues](#scramble-issues)
4. [File Operations](#file-operations)
5. [Browser Compatibility](#browser-compatibility)
6. [Performance Issues](#performance-issues)
7. [Security Concerns](#security-concerns)
8. [Getting Help](#getting-help)

---

## Application Issues

### Problem: Page won't load / Blank screen

**Symptoms:**
- Browser shows blank/white page
- No UI elements visible
- Console shows errors

**Possible Causes:**

1. **File not found**
   - Solution: Ensure `index.html` is in correct location
   - Check all files are present: `crypto.js`, `scramble.js`, `style.css`

2. **External resources blocked**
   - Solution: Check Network tab (DevTools → Network)
   - Look for failed requests to Bootstrap or Font Awesome
   - Verify you have internet connection
   - Try opening in private/incognito mode (clears extensions)

3. **JavaScript error**
   - Solution: Open DevTools (F12)
   - Check Console tab for red error messages
   - Look for syntax errors in `crypto.js` or `scramble.js`

**How to fix:**
```bash
# Verify files exist
ls -la seedalias/
# Should show: index.html crypto.js scramble.js style.css

# Start local server and check console
python -m http.server 8000
# Open http://localhost:8000
# Check DevTools Console (F12)
```

---

### Problem: UI looks broken / Missing styles

**Symptoms:**
- No colors, fonts look wrong
- Buttons look like text
- Layout is misaligned

**Possible Causes:**

1. **CSS file not loading**
   - Solution: Check `style.css` exists
   - Verify URL path is correct in `index.html`

2. **Bootstrap CSS blocked**
   - Solution: Check Network tab for Bootstrap CDN
   - Look for failed requests
   - Try adding to CSP whitelist if applicable

3. **Browser cache issue**
   - Solution: Hard refresh browser
   - Windows: Ctrl+Shift+Delete
   - Mac: Cmd+Shift+Delete
   - Or use DevTools → Disable cache (while open)

**How to fix:**
```javascript
// In browser console, check if styles loaded
document.styleSheets.length
// Should be > 0

// Check specific stylesheet
const bootstrapSheet = Array.from(document.styleSheets)
  .find(sheet => sheet.href.includes('bootstrap'));
console.log(bootstrapSheet ? 'Bootstrap loaded' : 'Bootstrap NOT loaded');
```

---

## Encryption/Decryption Issues

### Problem: "Please provide passphrase" alert

**Symptoms:**
- Alert box appears when clicking Encrypt/Decrypt
- Encryption won't proceed

**Cause:**
- Passphrase field is empty or contains only whitespace

**Solution:**
1. Check passphrase field
2. Enter a non-empty passphrase
3. Make sure no leading/trailing spaces are treated as empty
4. Try: `test` or `MySecurePhrase123`

**Example:**
```
Wrong: "" (empty)
Wrong: "   " (spaces only)
Correct: "my passphrase"
Correct: "test123!@#"
```

---

### Problem: Decryption shows "*** Decryption error ***"

**Symptoms:**
- Encrypted data displays red error message
- Red error box appears after clicking Decrypt

**Possible Causes:**

1. **Wrong passphrase**
   - Solution: Verify passphrase is correct and matches encryption
   - Passphrase is case-sensitive
   - Check for extra spaces

2. **Corrupted encrypted data**
   - Solution: Try loading original encrypted file again
   - Verify copy/paste didn't corrupt data
   - Check file wasn't modified

3. **Wrong encrypted data**
   - Solution: Verify you have correct encrypted text
   - Check you didn't accidentally edit the hex string

4. **Browser doesn't support Web Crypto API**
   - Solution: Update browser or use supported browser
   - See [Browser Compatibility](#browser-compatibility)

**How to debug:**
```javascript
// In console, after failed decrypt attempt:
console.log('Message object:', message);
console.log('Encrypted buffer length:', message.encrypted?.byteLength);

// Check if Web Crypto API available
console.log('Web Crypto available:', !!window.crypto?.subtle);
```

**Verification steps:**
1. Copy encrypted text
2. Open new browser tab
3. Check if same encrypted text decrypts with same passphrase
4. If not, try with original saved file

---

### Problem: Very slow encryption/decryption

**Symptoms:**
- Encryption takes >1 second
- UI freezes during encryption
- Page appears unresponsive

**Cause:**
- PBKDF2 key derivation is intentionally slow (~100-500ms)
- This is expected behavior for security

**Expected Performance:**
- PBKDF2: 100-500ms (intentional - slow down brute force)
- Encryption: <10ms
- Total: 100-510ms

**Not a bug if:**
- Encryption completes within 1 second
- Page remains responsive
- After encryption, decryption is fast

**Could be a problem if:**
- Encryption takes >3 seconds
- Page completely freezes (doesn't respond to clicks)
- Decryption is slow (<10ms expected)

**How to measure:**
```javascript
// In console:
const start = performance.now();
// Click Encrypt button
// After result appears:
const elapsed = performance.now() - start;
console.log(`Total time: ${elapsed}ms`);
// Should be 100-550ms
```

---

### Problem: Special characters in passphrase cause issues

**Symptoms:**
- Encryption works but decryption fails with special characters
- Emoji in passphrase doesn't work

**Cause:**
- Unicode/special character handling in different browsers

**Solution:**
```javascript
// These should all work fine:
"café" (accented)
"test@#$%" (special chars)
"пароль" (Cyrillic)
"密码" (Chinese)
"🔐🔑" (emoji)

// If having issues:
// 1. Try simpler passphrase first
// 2. Verify UTF-8 encoding
// 3. Test in different browser
// 4. Check browser console for errors
```

**Verification:**
1. Create test with ASCII: `test123`
2. If that works, issue is character encoding
3. Try simple special: `test@#$`
4. Then try complex: emoji/unicode

---

## Scramble Issues

### Problem: Scramble code shows red (invalid)

**Symptoms:**
- Scramble code input shows red text
- Scramble button is disabled

**Possible Causes:**

1. **Invalid code length**
   - Code must be divisible by 4
   - Solution: `0102` (valid), `01020304` (valid), `010` (invalid)

2. **Position out of range**
   - Position numbers exceed encrypted data length
   - Example: If encrypted is 64 bytes, can't use position 99
   - Solution: Use positions ≤ data byte length

3. **Non-numeric input**
   - Code contains letters or symbols
   - Solution: Use only digits 0-9

4. **Empty code**
   - No input in code field
   - Solution: Enter scramble code

**How to fix:**

```
Encrypted data: 64 bytes
Max position: 64 (not 65!)

Valid codes:
- "0102"              (swap bytes 1 and 2)
- "01020304"          (two swaps)
- "0102030405060708"  (four swaps)

Invalid codes:
- "010"               (not divisible by 4)
- "9999"              (positions out of range)
- "01a2"              (contains letter 'a')
```

**Verification:**
1. Check encrypted data byte length displayed
2. Calculate max position = byte count
3. Verify code positions don't exceed max
4. Verify code divisible by 4

---

### Problem: Unscramble shows different data than encrypted

**Symptoms:**
- After unscrambling, data doesn't match original encrypted
- Decryption fails after unscramble

**Possible Causes:**

1. **Wrong scramble code**
   - Unscramble code must match scramble code exactly
   - Solution: Use same code for unscramble

2. **Scramble code modified after scrambling**
   - Changing code after scrambling corrupts data
   - Solution: Save scramble code securely

3. **Data corrupted or manually edited**
   - Manual editing of hex scrambled data breaks it
   - Solution: Use saved file instead of manual copy

**Prevention:**
1. Keep scramble code safe
2. Use file save/load instead of manual copy
3. Test unscramble immediately after scramble
4. Save both encrypted and scramble code together

**Verification steps:**
1. Encrypt seed
2. Scramble with code `0102`
3. Immediately unscramble with same code
4. Verify unscrambled = encrypted
5. Then decrypt with passphrase
6. Verify equals original seed

---

## File Operations

### Problem: "Please select text file" alert

**Symptoms:**
- Alert appears when loading file
- File selection is rejected

**Possible Causes:**

1. **File is binary, not text**
   - File must be `.txt` or similar text format
   - Solution: Save as `.txt` instead of binary

2. **File MIME type incorrect**
   - Operating system thinks it's binary
   - Solution: 
     - Rename to `.txt`
     - Or save with correct extension

3. **File is compressed (.zip, .rar)**
   - Encrypted files are already binary-like
   - Solution: Save plaintext version, not compressed

**How to fix:**

```bash
# On Windows:
# Right-click file → Rename → Change extension to .txt

# On Mac/Linux:
mv encrypted-key encrypted-key.txt
# or
file encrypted-key
# Check output - should show text

# Verify file is readable:
file encrypted-key.txt
# Should output: ASCII text or similar
```

---

### Problem: Downloaded file is empty or corrupted

**Symptoms:**
- File downloads but is 0 bytes
- File opens but contains garbage
- File causes errors when loading

**Possible Causes:**

1. **Encryption didn't complete**
   - Solution: Verify "Encrypt" button shows result before saving

2. **Browser blocked file download**
   - Solution: Check browser download settings
   - Try different browser
   - Try download again

3. **Network interrupted during download**
   - Solution: Try download again
   - Use more stable connection

**How to verify:**

```javascript
// Before saving, in browser console:
const msg = document.querySelector("#encrypted-message");
console.log('Content length:', msg.value.length);
console.log('Is hex:', /^[0-9a-f]*$/i.test(msg.value));
console.log('First 20 chars:', msg.value.substring(0, 20));
```

---

### Problem: Can't drag-and-drop file

**Symptoms:**
- Drag/drop doesn't work
- Must use file picker instead

**Cause:**
- Application doesn't support drag-and-drop (design choice)
- Use file picker input instead

**Solution:**
- Click "Load" button to open file picker
- Select file from dialog
- Or copy/paste encrypted text directly

---

## Browser Compatibility

### Problem: "Web Crypto API not available"

**Symptoms:**
- Encryption/decryption doesn't work
- Browser console shows Web Crypto error
- Can't use application

**Cause:**
- Browser too old or doesn't support Web Crypto
- Web Crypto disabled (very rare)

**Solution:**
- Use supported browser (Chrome 37+, Firefox 34+, Safari 11+, Edge 12+)
- Update your browser
- Enable Web Crypto (check security settings)

**Supported Browsers:**

| Browser | Min Version |
|---------|-------------|
| Chrome | 37+ |
| Firefox | 34+ |
| Safari | 11+ |
| Edge | 12+ |
| Opera | 24+ |

**How to check:**
```javascript
// In browser console:
if (window.crypto && window.crypto.subtle) {
  console.log('✅ Web Crypto API available');
} else {
  console.log('❌ Web Crypto API NOT available');
}
```

---

### Problem: Works locally but not on deployed website

**Symptoms:**
- Application works on `localhost:8000`
- Fails when deployed to `https://mysite.com`
- Console shows security errors

**Possible Causes:**

1. **Not using HTTPS**
   - Web Crypto API requires HTTPS for security
   - Solution: Enable HTTPS on your hosting

2. **HTTPS certificate issue**
   - Self-signed or invalid certificate
   - Solution: Get valid certificate (Let's Encrypt is free)

3. **Mixed HTTP/HTTPS content**
   - Page loads over HTTPS but resources over HTTP
   - Solution: All resources must be HTTPS

4. **CSP (Content Security Policy) too strict**
   - Security policy blocks crypto operations
   - Solution: Verify CSP allows Web Crypto API

**How to fix:**

```javascript
// In browser console, check:
console.log('Location:', window.location.protocol);
// Should show: https:

// Check if crypto available:
console.log('Crypto available:', !!window.crypto?.subtle);
```

---

### Problem: Looks different on mobile

**Symptoms:**
- Layout broken on phone/tablet
- Buttons too small to tap
- Text too small to read

**Cause:**
- Bootstrap responsive layout needs testing
- Screen size too small
- Font sizes not adjusted

**Solution:**
1. Zoom out (Ctrl+- or Cmd+-)
2. Rotate phone to landscape
3. Use "Respond" mode in DevTools
4. Test on actual device

**How to test:**
```bash
# In Chrome DevTools:
# Press F12 → Toggle device toolbar (Ctrl+Shift+M)
# Select different device sizes
# Check iPhone, iPad, Android sizes
```

---

## Performance Issues

### Problem: Encryption is very slow (>2 seconds)

**Symptoms:**
- Encryption takes a very long time
- Page appears frozen
- Difficult to use

**Likely Cause:**
- PBKDF2 iterations are working correctly
- This is normal security behavior

**Expected Times:**
- 100-500ms is normal
- >1000ms might indicate system/browser issue

**How to verify it's the PBKDF2:**

```javascript
// Time just the PBKDF2 part
console.time('PBKDF2');
// Start encryption and let it complete
console.timeEnd('PBKDF2');
```

If PBKDF2 is >500ms:
- Your CPU is slower than average
- Browser is under heavy load
- System is low on resources

**Solutions:**
1. Close other applications
2. Restart browser
3. Restart computer
4. It's OK if slow - security is more important

---

### Problem: Multiple encryptions cause memory issues

**Symptoms:**
- After many encrypt/decrypt cycles, page slows down
- Memory usage grows
- Browser becomes unresponsive

**Cause:**
- Possible memory leak in repeated operations

**Solution:**
1. Refresh page (clears memory)
2. Restart browser
3. Check DevTools Memory tab for leaks
4. Report issue if consistent memory growth

**How to check for leaks:**

```javascript
// Take heap snapshots:
// DevTools → Memory → Take heap snapshot
// Perform 10 encrypt/decrypt cycles
// Take another heap snapshot
// Compare sizes - should be similar
```

---

## Security Concerns

### Concern: "Is my passphrase safe?"

**Answer:** Yes, with caveats:

✅ **Safe:**
- Passphrase never sent to server (client-only)
- Passphrase never logged to console
- Passphrase never stored in browser storage
- Only used to derive encryption key

⚠️ **Not safe:**
- If you use a weak passphrase, brute force is possible
- If someone watches your screen, they see what you type
- If your computer is compromised, everything is at risk

**Best practices:**
- Use strong, memorable passphrase
- Don't write it down
- Don't share it with anyone
- Use a different passphrase for each seed

---

### Concern: "Is my encrypted seed safe?"

**Answer:** Yes, but with considerations:

✅ **Safe:**
- AES-256-GCM is military-grade encryption
- Even if someone has encrypted file, they need passphrase
- File corruption or tampering detected immediately

⚠️ **Not safe:**
- If passphrase is weak (possible brute force)
- If someone has both encrypted file AND watches you type passphrase
- If your computer is compromised (malware could steal everything)

**Best practices:**
- Store encrypted file securely (not public cloud)
- If online storage, use password-protected archive
- Keep passphrase in your head, never written
- Use scramble feature for extra protection

---

### Concern: "What if I forget my passphrase?"

**Answer:** Unfortunately, if you forget your passphrase:

❌ **Cannot recover:**
- There is no "forgot password" recovery
- No backup passphrase option
- Encrypted seed is lost forever

**Prevention:**
- Write passphrase in secure location (safe, encrypted vault, etc.)
- Memorize passphrase
- Use passphrase you already remember
- Test with non-critical seed first

**What to do:**
1. Try variations of passphrase
2. Try common misspellings
3. Double-check you have correct encrypted file
4. If still no luck, your funds are inaccessible with this seed

---

### Concern: "Will you steal my seed?"

**Answer:** No, here's why:

- **Open source code** - Code can be audited
- **Client-side only** - No data sent anywhere
- **No accounts** - No tracking or authentication
- **No servers** - Nothing to hack
- **Your computer** - You control everything

**Verification:**
```javascript
// In DevTools Network tab:
// Perform encryption
// Should show ZERO network requests
// If you see requests, something is wrong
```

---

## Getting Help

### Check These First

1. **Search this guide** - Ctrl+F to search
2. **Check [FAQ section](USER_GUIDE.md#faq)**
3. **Read [SECURITY.md](SECURITY.md)** - Security-related questions
4. **Read [ARCHITECTURE.md](ARCHITECTURE.md)** - Technical details

### Browser Console

Most issues leave clues in the console:

1. Open DevTools (F12)
2. Go to Console tab
3. Red text = errors
4. Yellow text = warnings
5. Blue text = logs

### Still Have Issues?

1. **Document your issue:**
   - What were you doing?
   - What happened?
   - What did you expect?
   - What browser/OS?

2. **Create a GitHub issue:**
   - Go to [GitHub Issues](../../issues)
   - Click "New Issue"
   - Use template provided
   - Include details from above

3. **Don't share:**
   - Don't share your real passphrase ❌
   - Don't share your real seed phrase ❌
   - Use test data only ✅

---

**Last Resort:** If you believe there's a security issue, email maintainers directly rather than creating public issue. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
