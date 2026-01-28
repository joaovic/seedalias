# JavaScript API Reference

This document provides detailed documentation for all functions and objects in the Seed Alias application.

---

## crypto.js Module

The crypto module is an IIFE (Immediately Invoked Function Expression) that handles all encryption and decryption operations.

### Global Objects

#### `message`
Internal state object storing encryption parameters.

```javascript
const message = {
  salt: null,           // Uint8Array(32) - Encryption salt
  iv: null,             // Uint8Array(16) - Initialization vector
  encrypted: null,      // ArrayBuffer - Encrypted data
  secretKey: null,      // CryptoKey - Key material for derivation
  additionalData: null  // Uint8Array(16) - GCM additional data
};
```

---

### Functions

#### `hashValue(val)`
Computes SHA-256 hash of a string value.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `val` | `string` | Value to hash |

**Returns:** `Promise<string>` - 64-character hexadecimal hash

**Example:**
```javascript
const hash = await hashValue("my passphrase");
// Returns: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
```

---

#### `hexStringToArrayBuffer(str)`
Converts a hexadecimal string to a Uint8Array.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `str` | `string` | Hexadecimal string (even length) |

**Returns:** `Uint8Array` - Byte array

**Example:**
```javascript
const bytes = hexStringToArrayBuffer("48656c6c6f");
// Returns: Uint8Array [72, 101, 108, 108, 111]
```

---

#### `arrayBufferToHexString(buffer)`
Converts an ArrayBuffer to a hexadecimal string.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `buffer` | `ArrayBuffer` | Binary data |

**Returns:** `string` - Hexadecimal representation

**Example:**
```javascript
const hex = arrayBufferToHexString(new Uint8Array([72, 101, 108, 108, 111]).buffer);
// Returns: "48656c6c6f"
```

---

#### `getKeyMaterial(passphrase)`
Imports a passphrase as key material for PBKDF2 derivation.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `passphrase` | `string` | User's passphrase (already hashed) |

**Returns:** `Promise<CryptoKey>` - Key material for derivation

**Details:**
- Uses the Web Crypto API `importKey` function
- Imports as raw format with PBKDF2 algorithm
- Key is not extractable
- Enabled for `deriveBits` and `deriveKey` operations

---

#### `getDerivedKey(keyMaterial, salt)`
Derives an AES-256-GCM key from key material using PBKDF2.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `keyMaterial` | `CryptoKey` | Output from `getKeyMaterial()` |
| `salt` | `Uint8Array` | 32-byte salt value |

**Returns:** `Promise<CryptoKey>` - Derived AES-256-GCM key

**Details:**
- Algorithm: PBKDF2
- Iterations: 100,000
- Hash: SHA-256
- Output: AES-GCM 256-bit key
- Key is extractable
- Enabled for `encrypt` and `decrypt` operations

---

#### `getMessageEncoding()`
Retrieves and encodes the seed phrase from the input field.

**Parameters:** None

**Returns:** `Uint8Array` - UTF-8 encoded seed phrase

**DOM Element:** `#seed`

---

#### `asUint8Array(val, s)`
Hashes a value and extracts the first `s` bytes as a Uint8Array.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `val` | `string` | Value to hash |
| `s` | `number` | Number of bytes to extract |

**Returns:** `Promise<Uint8Array>` - First `s` bytes of the SHA-256 hash

**Example:**
```javascript
const salt = await asUint8Array("mypassphrase", 32);
// Returns: Uint8Array(32) with first 32 bytes of SHA-256 hash
```

---

#### `encrypt()`
Main encryption function. Encrypts the seed phrase using the passphrase.

**Parameters:** None (reads from DOM)

**Returns:** `Promise<void>`

**Process:**
1. Validates passphrase is not empty
2. Copies passphrase to decrypt panel for convenience
3. Calculates message data (salt, IV, key material, additional data)
4. Derives AES-256-GCM key
5. Encrypts seed phrase with AES-GCM
6. Displays truncated encrypted value with byte count
7. Populates encrypted-message field
8. Enables scramble checkbox

**DOM Elements:**
- Input: `#encrypt-passphrase`, `#seed`
- Output: `.encrypt .encrypted-value`, `#encrypted-message`

---

#### `decrypt()`
Main decryption function. Decrypts the encrypted seed using the passphrase.

**Parameters:** None (reads from DOM)

**Returns:** `Promise<void>`

**Process:**
1. Validates passphrase is not empty
2. Calculates message data from passphrase
3. Converts hex string to ArrayBuffer
4. Derives same AES-256-GCM key
5. Attempts decryption with AES-GCM
6. Displays decrypted seed phrase or error message

**DOM Elements:**
- Input: `#decrypt-passphrase`, `#encrypted-message`
- Output: `.decrypt .decrypted-value`

**Error Handling:**
- On decryption failure, displays "*** Decryption error ***" in red

---

#### `calcMessageData(passphrase)`
Calculates all encryption parameters from the passphrase.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `passphrase` | `string` | User's passphrase |

**Returns:** `Promise<void>`

**Updates `message` object with:**
- `salt`: 32 bytes from passphrase hash
- `iv`: 16 bytes from reversed passphrase hash
- `secretKey`: Key material from passphrase hash
- `additionalData`: 16 bytes from substring of passphrase hash

---

#### `saveToFile()`
Saves the encrypted seed to a downloadable text file.

**Parameters:** None

**Returns:** `void`

**Output:** Downloads `encrypted-key.txt`

---

#### `saveOrOpenBlob(blob, fileName)`
Helper function to trigger file download.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `blob` | `Blob` | File content |
| `fileName` | `string` | Name for downloaded file |

**Returns:** `void`

---

#### `loadKeyFromFile(event, fileSelected)`
Loads encrypted seed from a text file.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `event` | `Event` | File input change event |
| `fileSelected` | `HTMLInputElement` | File input element |

**Returns:** `void`

**Validation:** Only accepts text files (MIME type matching `text.*`)

---

#### `addTogglerEventListener(passphrase, toggler)`
Sets up show/hide toggle for password fields.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `passphrase` | `string` | ID of password input element |
| `toggler` | `string` | ID of toggle icon element |

**Returns:** `void`

**Behavior:**
- Toggles input type between `password` and `text`
- Toggles `fa-eye-slash` class on icon

---

#### `seedAliasMain()`
Main initialization function for the crypto module.

**Parameters:** None

**Returns:** `void`

**Initializes:**
- Password visibility toggles for all passphrase fields
- Encrypt button click handler
- Save button click handler
- Decrypt button click handler
- File load input handler

---

## scramble.js Module

The scramble module is an IIFE that handles optional byte scrambling for additional obfuscation.

### Global Objects

#### `message`
Internal state object for scramble operations.

```javascript
const message = {
  salt: null,
  iv: null,
  encrypted: null,
  secretKey: null,
  additionalData: null,
  scrambled: null      // Scrambled hex string
};
```

---

### Functions

#### `scramble(code)`
Scrambles the encrypted seed by swapping byte positions.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `code` | `string` | 4-digit pair positions (e.g., "01020304") |

**Returns:** `void`

**Process:**
1. Splits encrypted hex into 2-character bytes
2. Parses code into position pairs
3. Swaps bytes at specified positions (forward iteration)
4. Updates scrambled display and storage
5. Automatically checks unscramble checkbox in decrypt panel

**Example:**
```javascript
scramble("0102");
// Swaps byte at position 1 with byte at position 2
```

---

#### `unscramble(code)`
Reverses the scramble operation to restore original encrypted seed.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `code` | `string` | Same code used for scrambling |

**Returns:** `void`

**Process:**
1. Splits scrambled hex into 2-character bytes
2. Parses code into position pairs
3. Swaps bytes at specified positions (reverse iteration)
4. Updates encrypted-message field for decryption

**Important:** Uses reverse iteration to undo scramble operations in correct order.

---

#### `saveToFile()`
Saves the scrambled seed to a downloadable text file.

**Parameters:** None

**Returns:** `void`

**Output:** Downloads `scrambled-key.txt`

---

#### `saveOrOpenBlob(blob, fileName)`
Helper function to trigger file download.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `blob` | `Blob` | File content |
| `fileName` | `string` | Name for downloaded file |

**Returns:** `void`

---

#### `loadScrambledKeyFromFile(event, fileSelected)`
Loads scrambled seed from a text file.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `event` | `Event` | File input change event |
| `fileSelected` | `HTMLInputElement` | File input element |

**Returns:** `void`

---

#### `scrambleMain()`
Main initialization function for the scramble module.

**Parameters:** None

**Returns:** `void`

**Initializes:**
- `numericValidation(evt)` - Restricts input to numeric only
- `scrambleValidation(message, input, button)` - Validates scramble codes
- `scrambleCodeValidation(evt)` - Validates encrypt panel scramble code
- `unscrambleCodeValidation(evt)` - Validates decrypt panel unscramble code
- Checkbox handlers for showing/hiding scramble controls
- Button handlers for scramble/unscramble operations
- File load handlers for scrambled files

---

### Validation Functions (Internal)

#### `numericValidation(evt)`
Prevents non-numeric key input.

**Validation:** Key codes 48-57 only (digits 0-9)

---

#### `scrambleValidation(message, input, button)`
Validates scramble code format and bounds.

**Validation Rules:**
- Code length must be > 0
- Message length must be > 0
- Code length must be divisible by 4
- Position values must not exceed message byte length

**UI Feedback:**
- Valid: Green text color, button enabled
- Invalid: Red text color, button disabled

---

## Event Flow Diagram

```
User Action                    Function Called
─────────────────────────────────────────────────
Click Encrypt          →       encrypt()
Click Save             →       saveToFile()
Click Decrypt          →       decrypt()
Load File (decrypt)    →       loadKeyFromFile()
Click Eye Icon         →       showHidePassphrase()
Check Scramble         →       (shows scramble controls)
Click Scramble         →       scramble()
Click Scrambled Save   →       saveToFile() (scramble.js)
Check Unscramble       →       (shows unscramble controls)
Load File (unscramble) →       loadScrambledKeyFromFile()
Click Unscramble       →       unscramble()
Type Scramble Code     →       scrambleValidation()
```

---

## js/theme.js Module

The theme module manages dark/light mode switching with localStorage persistence.

### Global Variables

#### `theme`
Current active theme ('light' or 'dark').

---

### Functions

#### `init()`
Initializes theme from localStorage or system preference.

**Parameters:** None

**Returns:** `void`

**Process:**
1. Check localStorage for saved preference
2. If not found, detect system color scheme preference
3. Apply theme to document body
4. Setup theme toggle button handler

---

#### `toggleTheme()`
Switches between light and dark themes.

**Parameters:** None

**Returns:** `void`

**Process:**
1. Determine current theme
2. Switch to opposite theme
3. Save new preference to localStorage
4. Update document body data-theme attribute

---

#### `setTheme(themeName)`
Sets a specific theme.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `themeName` | `string` | Theme name ('light' or 'dark') |

**Returns:** `void`

**Behavior:**
- Updates `document.body.setAttribute('data-theme', themeName)`
- Saves preference to localStorage

---

#### `saveTheme(themeName)`
Saves theme preference to localStorage.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `themeName` | `string` | Theme name ('light' or 'dark') |

**Returns:** `void`

**Storage Key:** `'seedalias-theme'`

---

#### `loadTheme()`
Loads theme preference from localStorage.

**Parameters:** None

**Returns:** `string | null` - Theme name or null if not found

---

#### `getSystemTheme()`
Detects system color scheme preference.

**Parameters:** None

**Returns:** `string` - 'dark' or 'light'

**Uses:** `window.matchMedia('(prefers-color-scheme: dark)')`

---

---

## js/security.js Module

The security module provides security indicators, validation, and clipboard management.

### Global Objects

#### `SecurityIndicators`
Exposed API object for external access if needed.

```javascript
window.SecurityIndicators = {
  updateStatusBadge,
  updateByteCount,
  calculatePassphraseStrength,
  validateScrambleCode
};
```

---

### Functions

#### `calculatePassphraseStrength(passphrase)`
Calculates passphrase strength and entropy.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `passphrase` | `string` | Passphrase to evaluate |

**Returns:** `object` - Strength metrics

```javascript
{
  level: 'weak' | 'moderate' | 'strong' | 'very-strong',
  text: string,  // "Weak (80.5 bits)"
  score: number,  // 0-7
  entropy: number // Bits of entropy
}
```

**Scoring Criteria:**
- Length: >=8 (+1), >=12 (+1), >=16 (+1), >=24 (+2)
- Character sets: lowercase (+1), uppercase (+1), digits (+1), special (+1)
- Entropy: Math.log2(charsetSize) * length

---

#### `updateStrengthMeter(inputId, barId, textId)`
Sets up real-time passphrase strength meter.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `inputId` | `string` | Passphrase input element ID |
| `barId` | `string` | Strength bar element ID |
| `textId` | `string` | Strength text element ID |

**Returns:** `void`

**Behavior:**
- Listens for input events on passphrase field
- Updates strength bar color and width
- Updates text with strength level and entropy

---

#### `validateScrambleCode(code)`
Validates scramble code format.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `code` | `string` | Scramble code to validate |

**Returns:** `object`

```javascript
{
  valid: boolean,
  message: string  // Error message or success description
}
```

**Validation Rules:**
- Length must be divisible by 4
- Must contain only digits

---

#### `setupScrambleValidation(inputId, validationId)`
Sets up real-time scramble code validation.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `inputId` | `string` | Scramble code input element ID |
| `validationId` | `string` | Validation message element ID |

**Returns:** `void`

**Behavior:**
- Adds invalid/valid custom classes to input
- Shows validation message with icon
- Updates on every input event

---

#### `updateStatusBadge(badgeId, status, text)`
Updates status badge appearance and content.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `badgeId` | `string` | Status badge element ID |
| `status` | `string` | Badge status ('encrypted', 'scrambled', 'success', 'error') |
| `text` | `string` | Custom badge text (optional) |

**Returns:** `void`

**Status Types:**
- `'encrypted'` - Green lock icon
- `'scrambled'` - Orange random icon
- `'success'` - Green check icon
- `'error'` - Red times icon
- `null` - Gray circle icon

---

#### `updateByteCount(elementId, value)`
Updates byte count display.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `elementId` | `string` | Byte count element ID |
| `value` | `string` | Value to calculate bytes from |

**Returns:** `void`

**Behavior:**
- Calculates byte count using Blob size
- Displays as "X bytes"

---

#### `setupCopyButton(buttonId, valueSelector)`
Sets up copy to clipboard functionality.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `buttonId` | `string` | Copy button element ID |
| `valueSelector` | `string` | CSS selector for value element |

**Returns:** `void`

**Behavior:**
- Copies text to clipboard on click
- Shows "Copied!" feedback
- Displays clipboard security warning
- Auto-clears clipboard after 30 seconds

---

#### `showClipboardSecurityWarning()`
Displays security warning toast about clipboard clearing.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Creates warning toast element
- Auto-removes after 5 seconds
- Shows warning icon and message

---

#### `clearClipboardAfterDelay(delay)`
Automatically clears clipboard after delay.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `delay` | `number` | Delay in milliseconds (default: 30000) |

**Returns:** `void`

**Behavior:**
- Cancels any previous timeout
- clears clipboard using `navigator.clipboard.writeText('')`

---

#### `observeEncryptedValue()`
Observes encrypted value changes and updates UI.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Uses MutationObserver on encrypted value element
- Updates status badge and byte count on changes

---

#### `observeScrambledValue()`
Observes scrambled value changes and updates UI.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Uses MutationObserver on scrambled value element
- Updates status badge on changes

---

#### `observeDecryptedValue()`
Observes decrypted value changes and updates UI.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Uses MutationObserver on decrypted value element
- Updates status badge on changes

---

#### `observeUnscrambledValue()`
Observes unscrambled value changes and updates UI.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Uses MutationObserver on unscrambled value element
- Updates status badge on changes

---

#### `setupWarningDismiss()`
Sets up security warning dismissal.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Handles dismiss button click
- Removes warning from DOM

---

## js/interactions.js Module

The interactions module handles UI animations, micro-interactions, and user feedback.

### Functions

#### `init()`
Initializes all interaction handlers.

**Parameters:** None

**Returns:** `void`

**Initializes:**
- Button ripple effects
- Input animations
- Loading spinners
- File upload feedback
- Toast notifications
- Tooltip system
- Password visibility toggles

---

#### `setupButtonRipple()`
Adds ripple effect to all buttons.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Creates circular ripple on button click
- Animates ripple expansion and fade
- Removes ripple after animation

---

#### `setupInputAnimations()`
Adds focus effects to inputs.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Adds border glow on focus
- Smooth transition animations
- Validates input on blur

---

#### `setupLoadingSpinners()`
Configures loading states for buttons.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Shows spinner on button during operations
- Disables button during loading
- Restores button state on completion

---

#### `setupFileUploadFeedback()`
Adds drag-and-drop feedback for file inputs.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Highlights drop zone on drag over
- Shows loading animation during file read
- Updates UI on successful load

---

#### `setupToastNotifications()`
Configures notification system.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Creates toast notification element
- Shows success/error notifications
- Auto-dismisses after timeout

---

#### `setupTooltipSystem()`
Initializes tooltips with positioning.

**Parameters:** None

**Returns:** `void`

**Behavior:**
- Creates tooltips on hover
- Positions tooltips near elements
- Ensures accessibility

---

#### `showSuccessNotification(message)`
Displays success notification.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message` | `string` | Success message |

**Returns:** `void`

---

#### `showErrorNotification(message)`
Displays error notification.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message` | `string` | Error message |

**Returns:** `void`

---
