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
