# Developer Guide

This guide is for developers who want to understand the codebase, modify existing functionality, or add new features to Seed Alias.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Code Architecture](#code-architecture)
4. [Module Details](#module-details)
5. [Development Workflow](#development-workflow)
6. [Common Tasks](#common-tasks)
7. [Debugging](#debugging)
8. [Performance Considerations](#performance-considerations)

---

## Project Overview

**Seed Alias** is a lightweight, client-side web application for encrypting cryptocurrency seed phrases. Key characteristics:

- **Vanilla JavaScript** - No frameworks or build tools required
- **IIFE Modules** - Each feature is an Immediately Invoked Function Expression
- **Client-Side Only** - All operations happen in the browser
- **Web Crypto API** - Uses native browser cryptographic functions
- **Bootstrap UI** - Responsive design with Bootstrap 5.3

### Technology Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Bootstrap 5.3.0 |
| Icons | Font Awesome 6.0 |
| Cryptography | Web Crypto API (native) |
| Styling | CSS3 + Bootstrap |
| JavaScript | ES6+ (Arrow functions, Promises, async/await) |

---

## File Structure

```
seedalias/
├── index.html              # Main UI - Two-panel layout (Encrypt/Decrypt)
├── css/                    # Modular CSS files
│   ├── variables.css       # CSS custom properties (colors, spacing, typography)
│   ├── typography.css      # Font definitions (IBM Plex Mono, Inter)
│   ├── theme.css          # Dark/light theme system
│   ├── animations.css     # Keyframes and transitions
│   ├── security.css       # Security indicators styling
│   └── advanced.css      # Background effects, clipboard, advanced features
├── js/                     # Modular JavaScript files
│   ├── crypto.js          # Core encryption/decryption module (IIFE)
│   ├── scramble.js        # Byte scrambling module (IIFE)
│   ├── theme.js          # Theme switching (dark/light mode)
│   ├── security.js       # Security features (strength meter, validation)
│   └── interactions.js   # UI interactions and animations
├── style.css               # Main stylesheet (imports css/ modules)
├── README.md               # User-facing project overview
├── CHANGELOG.md            # Version history
├── donation-qrcode.jpeg    # Support QR code
│
└── docs/
    ├── INDEX.md            # Documentation hub (navigation)
    ├── ARCHITECTURE.md     # System design and data flows
    ├── API.md              # Complete JavaScript API reference
    ├── SECURITY.md         # Cryptographic specs and threat model
    ├── USER_GUIDE.md       # End-user feature walkthrough
    ├── DEVELOPER.md        # This file
    ├── TESTING.md          # Testing strategies and QA
    ├── CONTRIBUTING.md     # Contribution guidelines
    ├── TROUBLESHOOTING.md  # Common issues and solutions
    ├── DEPLOYMENT.md       # Hosting and setup procedures
    └── UI_ENHANCEMENT_PLAN.md # UI/UX design specifications
```

---

## Code Architecture

### Module System

The application uses IIFE (Immediately Invoked Function Expression) for module encapsulation:

```javascript
// Module pattern used in crypto.js and scramble.js
(() => {
  // Private scope - variables here are not exposed globally
  const message = { /* state */ };
  
  const privateFunction = () => { /* ... */ };
  
  // Module initialization
  const moduleMain = () => { /* setup */ };
  
  // Self-invocation
  moduleMain();
})();
```

**Benefits:**
- No global namespace pollution
- Private state encapsulation
- Automatic initialization on page load

### Message Object Pattern

Both modules use a `message` object to maintain state:

```javascript
const message = {
  salt: null,              // Uint8Array(32) - encryption salt
  iv: null,                // Uint8Array(16) - initialization vector
  encrypted: null,         // ArrayBuffer - encrypted ciphertext
  secretKey: null,         // CryptoKey - derived encryption key
  additionalData: null,    // Uint8Array(16) - GCM auth data
  // scramble.js also has:
  scrambled: null          // string - scrambled hex representation
};
```

This object serves as the module's internal state machine, persisting data between function calls.

---

## Module Details

### crypto.js - Core Encryption Module

**Responsibility:** Handle all encryption/decryption operations

**Key Functions:**

| Function | Purpose | Async |
|----------|---------|-------|
| `hashValue(val)` | SHA-256 hash | Yes |
| `hexStringToArrayBuffer(str)` | Hex → Bytes | No |
| `arrayBufferToHexString(buffer)` | Bytes → Hex | No |
| `getKeyMaterial(passphrase)` | Import key | Yes |
| `getDerivedKey(keyMaterial, salt)` | Derive AES key | Yes |
| `getMessageEncoding()` | Read seed input | No |
| `asUint8Array(val, s)` | Hash and extract bytes | Yes |
| `calcMessageData(passphrase)` | Calculate encryption params | Yes |
| `encrypt()` | Main encryption | Yes |
| `decrypt()` | Main decryption | Yes |
| `saveToFile()` | Download encrypted file | No |
| `loadKeyFromFile()` | Load from file | No |

**DOM Selectors Used:**

```javascript
// Encrypt panel
#encrypt-passphrase      // Passphrase input
#seed                    // Seed phrase input
.encrypt-button          // Encrypt button
.save-button             // Save button
#encrypt-toggler         // Show/hide passphrase
#encrypted-message       // Encrypted output storage

// Decrypt panel
#decrypt-passphrase      // Passphrase input
.decrypt-button          // Decrypt button
#encrypted-message       // Encrypted input
.decrypt .decrypted-value // Output display

// Output displays
.encrypt .encrypted-value    // Truncated encrypted display
.decrypt .decrypted-value    // Decrypted seed display
.encrypt .error              // Error styling (red text)
```

**Flow Example - Encryption:**

```
User enters passphrase and seed
         ↓
Click "Encrypt" button
         ↓
encrypt() validates passphrase
         ↓
calcMessageData() derives encryption parameters
         ↓
getDerivedKey() creates AES-256-GCM key
         ↓
crypto.subtle.encrypt() encrypts seed
         ↓
arrayBufferToHexString() converts to hex
         ↓
Display truncated result + byte count
         ↓
Enable scramble checkbox
```

### scramble.js - Byte Scrambling Module

**Responsibility:** Optional byte-swapping for additional obfuscation

**Key Functions:**

| Function | Purpose | Async |
|----------|---------|-------|
| `scramble(code)` | Swap bytes forward | No |
| `unscramble(code)` | Swap bytes backward | No |
| `saveToFile()` | Download scrambled file | No |
| `loadScrambledKeyFromFile()` | Load from file | No |
| `scrambleValidation()` | Validate code format | No |
| `numericValidation()` | Allow only digits | No |

**Scramble Code Format:**

```
Code: "0102" → Positions 1 and 2 (1-based)
Code: "21071312" → Two swaps: (21,7) then (13,12)

Validation:
- Length must be divisible by 4
- Each pair represents byte positions (1-based)
- Positions must not exceed encrypted data length
```

**DOM Selectors Used:**

```javascript
// Encrypt panel
#scramble-checkbox           // Enable scramble
.encrypt .scramble-controls  // Container
#scramblecode                // Scramble code input
.scramble-button             // Scramble button
.scrambled-save-button       // Save scrambled file
#scramblecode-toggler        // Show/hide code

// Decrypt panel
#unscramble-checkbox         // Enable unscramble
.decrypt .scramble-controls  // Container
#unscramblecode              // Unscramble code input
.unscramble-button           // Unscramble button
#scrambled-encrypted-message // Scrambled input storage
.unscramble-load-button      // Load scrambled file
#unscramblecode-toggler      // Show/hide code
```

### js/theme.js - Theme Management Module

**Responsibility:** Handle dark/light theme switching with persistence

**Key Variables:**
- `theme` - Current theme ('light' or 'dark')

**Key Functions:**

| Function | Purpose | Async |
|----------|---------|-------|
| `init()` | Initialize theme from localStorage or system preference | No |
| `toggleTheme()` | Switch between light and dark themes | No |
| `setTheme(themeName)` | Set specific theme (light/dark) | No |
| `saveTheme(themeName)` | Save theme preference to localStorage | No |
| `loadTheme()` | Load theme from localStorage | No |
| `getSystemTheme()` | Detect system color scheme preference | No |

**Theme Storage:**
- Key: `seedalias-theme`
- Values: `'light'`, `'dark'`

### js/security.js - Security Features Module

**Responsibility:** Implement security indicators, validation, and clipboard management

**Key Functions:**

| Function | Purpose | Async |
|----------|---------|-------|
| `calculatePassphraseStrength(passphrase)` | Calculate passphrase strength score | No |
| `updateStrengthMeter(inputId, barId, textId)` | Update strength meter UI | No |
| `validateScrambleCode(code)` | Validate scramble code format | No |
| `setupScrambleValidation(inputId, validationId)` | Setup scramble code input validation | No |
| `updateStatusBadge(badgeId, status, text)` | Update status badge UI | No |
| `updateByteCount(elementId, value)` | Update byte count display | No |
| `setupCopyButton(buttonId, valueSelector)` | Setup copy to clipboard button | No |
| `showClipboardSecurityWarning()` | Display security warning toast | No |
| `clearClipboardAfterDelay(delay)` | Auto-clear clipboard after delay | No |

**Strength Levels:**
- `weak` (0-2 points)
- `moderate` (3-4 points)
- `strong` (5-6 points)
- `very strong` (7+ points)

**Scoring Criteria:**
- Length: >=8, >=12, >=16, >=24 characters
- Character sets: lowercase, uppercase, digits, special characters
- Entropy calculation: Math.log2(charsetSize) * length

### js/interactions.js - UI Interactions Module

**Responsibility:** Handle UI animations, micro-interactions, and user feedback

**Key Functions:**

| Function | Purpose | Async |
|----------|---------|-------|
| `init()` | Initialize all interaction handlers | No |
| `setupButtonRipple()` | Add ripple effect to buttons | No |
| `setupInputAnimations()` | Add input focus effects | No |
| `setupLoadingSpinners()` | Configure loading states | No |
| `setupFileUploadFeedback()` | Add drag-and-drop feedback | No |
| `setupToastNotifications()` | Configure notification system | No |
| `setupTooltipSystem()` | Initialize tooltips with positioning | No |
| `animateEncryption()` | Encryption process animation | Yes |
| `animateDecryption()` | Decryption process animation | Yes |
| `showSuccessNotification(message)` | Display success notification | No |
| `showErrorNotification(message)` | Display error notification | No |

---

## Development Workflow

### Setting Up Development Environment

1. **Clone repository:**
   ```bash
   git clone https://github.com/joaovic/seedalias.git
   cd seedalias
   ```

2. **Start local server:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   ```

3. **Open browser:** Navigate to `http://localhost:8000`

4. **Open developer tools:** F12 or Right-click → Inspect

### Making Changes

1. **Edit source files** - Changes are auto-refreshed
2. **Test in browser** - Manual testing preferred for this project
3. **Check console** - F12 → Console tab for errors
4. **Test multiple browsers** - Chrome, Firefox, Safari, Edge

### Testing Your Changes

1. **Functional testing** - Does the feature work?
2. **Edge cases** - Empty inputs, special characters, large files
3. **Cross-browser** - Test in at least 2 browsers
4. **Security** - Never log sensitive data
5. **Performance** - Check for UI lag or slowness

---

## Common Tasks

### Task: Add a New Encryption Option

**Goal:** Add a checkbox to enable/disable salt randomization

**Steps:**

1. **Add HTML checkbox** in `index.html`:
   ```html
   <div class="mb-3">
     <div class="form-check">
       <input type="checkbox" id="random-salt" class="form-check-input">
       <label class="form-check-label" for="random-salt">
         Use random salt
       </label>
     </div>
   </div>
   ```

2. **Update `calcMessageData()` in `crypto.js`:**
   ```javascript
   const calcMessageData = async passphrase => {
     const passphraseHash = await hashValue(passphrase);
     
     // Check if random salt is enabled
     const useRandomSalt = document.querySelector('#random-salt').checked;
     
     if (useRandomSalt) {
       // Generate random salt instead of deriving from hash
       message.salt = crypto.getRandomValues(new Uint8Array(32));
     } else {
       message.salt = await asUint8Array(passphraseHash, 32);
     }
     
     // ... rest of function
   };
   ```

3. **Update `encrypt()` to store salt:**
   ```javascript
   // After encryption, store salt with encrypted data
   const encryptedMessage = arrayBufferToHexString(message.encrypted);
   const saltHex = arrayBufferToHexString(message.salt);
   
   document.querySelector("#encrypted-message").value = 
     saltHex + ':' + encryptedMessage;
   ```

4. **Update `decrypt()` to extract salt:**
   ```javascript
   const encryptedValue = document.querySelector("#encrypted-message").value;
   const [saltHex, encryptedHex] = encryptedValue.split(':');
   
   message.salt = hexStringToArrayBuffer(saltHex);
   const encryptedBuf = hexStringToArrayBuffer(encryptedHex);
   ```

5. **Test thoroughly** - Both with and without random salt

### Task: Add Encryption Algorithm Selection

**Goal:** Allow users to choose between AES-256-GCM and AES-128-GCM

**Implementation Steps:**

1. Add a dropdown selector to HTML
2. Modify `getDerivedKey()` to accept algorithm parameter
3. Update `encrypt()` and `decrypt()` to use selected algorithm
4. Store algorithm choice with encrypted data
5. Test decryption with stored algorithm version

### Task: Add Copy-to-Clipboard Button

**Goal:** Add button to copy encrypted seed to clipboard

**Implementation:**

```javascript
const copyToClipboard = async (elementId) => {
  const element = document.querySelector(elementId);
  const text = element.value;
  
  try {
    await navigator.clipboard.writeText(text);
    // Show success message
    alert('Copied to clipboard!');
  } catch (error) {
    console.error('Copy failed:', error);
    alert('Failed to copy');
  }
};

// Add button in HTML
// <button type="button" class="btn btn-sm" 
//         onclick="copyToClipboard('#encrypted-message')">
//   Copy
// </button>
```

---

## Debugging

### Console Logging

```javascript
// Debugging encrypted value
console.log('Salt:', message.salt);
console.log('IV:', message.iv);
console.log('Encrypted (first 20 bytes):', message.encrypted.slice(0, 20));

// NEVER log sensitive data in production
console.log('Passphrase:', passphrase); // ❌ Security risk!
```

### Browser DevTools

**Console Tab:**
- View errors and warnings
- Run JavaScript commands
- Check variable values

```javascript
// In console, inspect message object
console.log(message);

// Call functions directly (if needed)
hashValue('test').then(result => console.log(result));
```

**Network Tab:**
- Should be empty (no external requests)
- If you see requests, something is wrong!

**Application Tab:**
- Check localStorage/sessionStorage for accidentally stored data
- Should be empty (this app doesn't use storage)

**Performance Tab:**
- Profile encryption/decryption speed
- Check for memory leaks

### Common Issues

**Issue: Decryption always fails**
- Check passphrase matches
- Verify encrypted data wasn't corrupted
- Ensure browser supports Web Crypto API
- Check console for errors

**Issue: Performance is slow**
- PBKDF2 iterations take ~100-500ms (intentional)
- Encryption itself should be <10ms
- If slower, check browser tab is not suspended

**Issue: Code doesn't work in certain browsers**
- Test Web Crypto API support
- Check browser console for errors
- Verify HTTPS (required for some browser security features)

---

## Performance Considerations

### Key Derivation (PBKDF2)

**Intentionally Slow:**
```javascript
iterations: 100000,  // 100,000 iterations
hash: "SHA-256"      // SHA-256 hash function
```

- **Purpose:** Slow down brute-force attacks
- **Duration:** ~100-500ms on modern hardware
- **UI Feedback:** Consider adding progress indicator

### Encryption/Decryption

**Should be fast:**
```javascript
// AES-256-GCM is highly optimized
const encrypted = await crypto.subtle.encrypt(...);  // <10ms
```

### Optimization Tips

1. **Lazy load modules** - Only load scramble.js if needed
2. **Debounce validation** - Don't validate on every keypress
3. **Use Web Workers** - For heavy crypto operations (if needed)
4. **Cache derived keys** - If same passphrase used multiple times

### Current Bottleneck

The PBKDF2 key derivation is the main performance bottleneck. To improve:

1. Reduce iterations (decreases security - not recommended)
2. Use GPU-accelerated hashing (if available)
3. Use Web Workers (for non-blocking UI)
4. Cache keys for repeated operations

---

## Security Best Practices for Developers

⚠️ **Remember:** This is a security-critical application.

### Do's ✅

- ✅ Use Web Crypto API exclusively
- ✅ Validate all inputs
- ✅ Clear sensitive data after use
- ✅ Use HTTPS in production
- ✅ Keep crypto operations on client
- ✅ Document security assumptions

### Don'ts ❌

- ❌ Don't log passphrases or seeds
- ❌ Don't send data to external servers
- ❌ Don't use external crypto libraries
- ❌ Don't hardcode secrets
- ❌ Don't disable security features
- ❌ Don't reduce iteration counts without justification

---

## Resources

- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [PBKDF2 Standard (RFC 2898)](https://tools.ietf.org/html/rfc2898)
- [AES-GCM Specification](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [MDN Web Docs - Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)

---

**Happy coding! Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.**
