# Technical Architecture

This document describes the technical architecture of the Seed Alias application.

## Overview

Seed Alias is a client-side web application that uses the Web Crypto API for cryptographic operations. All processing happens entirely in the browser - no data is ever transmitted to external servers.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    index.html                            │   │
│  │  ┌─────────────────┐        ┌─────────────────────────┐  │   │
│  │  │  Encrypt Panel  │        │     Decrypt Panel       │  │   │
│  │  │  - Passphrase   │        │  - Encrypted seed       │  │   │
│  │  │  - Seed input   │        │  - Passphrase           │  │   │
│  │  │  - Scramble     │        │  - Unscramble           │  │   │
│  │  └────────┬────────┘        └────────────┬────────────┘  │   │
│  └───────────┼──────────────────────────────┼───────────────┘   │
│              │                              │                   │
│  ┌───────────▼──────────────────────────────▼───────────────┐   │
│  │                     crypto.js                            │   │
│  │  - PBKDF2 Key Derivation                                 │   │
│  │  - AES-256-GCM Encryption/Decryption                     │   │
│  │  - File I/O Operations                                   │   │
│  └───────────┬──────────────────────────────┬───────────────┘   │
│              │                              │                   │
│  ┌───────────▼──────────────────────────────▼───────────────┐   │
│  │                    scramble.js                           │   │
│  │  - Byte Scrambling/Unscrambling                          │   │
│  │  - Scramble Code Validation                              │   │
│  │  - Scrambled File I/O                                    │   │
│  └───────────┬──────────────────────────────────────────────┘   │
│              │                                                  │
│  ┌───────────▼──────────────────────────────────────────────┐   │
│  │                   Web Crypto API                         │   │
│  │  (Browser Native Cryptographic Functions)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Module Structure

### index.html
The main entry point containing the user interface structure.

**Responsibilities:**
- Defines the two-panel layout (Encrypt/Decrypt)
- Loads Bootstrap 5.3 for styling
- Loads Font Awesome for icons
- Includes Google Fonts (IBM Plex Mono, Inter)
- Loads modular CSS files (variables, theme, typography, animations, security, advanced, i18n)
- Loads modular JavaScript files (theme, security, interactions, crypto, scramble, i18n)

### js/crypto.js
Core encryption module implementing all cryptographic operations.

**Key Components:**
- `message` object - Holds encryption state (salt, iv, encrypted data, key, additional data)
- Key derivation pipeline using PBKDF2
- AES-256-GCM encryption/decryption
- File save/load operations for encrypted seeds
- Passphrase visibility toggle

### js/scramble.js
Optional obfuscation layer for additional security.

**Key Components:**
- `message` object - Holds scramble state
- Byte swap operations based on position codes
- Input validation for scramble codes
- File save/load operations for scrambled seeds
- Scramble code validation

### js/theme.js
Theme management module for dark/light mode switching.

**Key Components:**
- Theme toggle functionality
- localStorage persistence
- System preference detection
- Smooth theme transitions

### style.css
Main stylesheet that imports modular CSS files.

**Key Components:**
- Imported modules: variables.css, typography.css, theme.css, animations.css, security.css, advanced.css, i18n.css
- General layout styles
- Bootstrap overrides
- Application-wide styles

### js/security.js
Security features and validation module.

**Key Components:**
- Passphrase strength meter calculation
- Scramble code validation
- Copy to clipboard functionality
- Clipboard security timer
- Status badge updates
- Byte count tracking

### js/interactions.js
UI interaction handlers and animations module.

**Key Components:**
- Encrypt/decrypt button interactions
- Scramble panel animations
- File upload visual feedback
- Ripple effects
- Loading spinners
- Tooltip system
- Success/error notifications
- Advanced visual effects

### js/i18n/i18n.js
Internationalization module for multi-language support.

**Key Components:**
- Language detection and switching
- Translation loading and management
- Locale-specific formatting
- Language persistence in localStorage

## Cryptographic Pipeline

### Encryption Flow

```
Passphrase
            │
            ▼
┌─────────────────────────┐
│ SHA-256 Hash            │
│ (produces 64-char hex)  │
└───────────┬─────────────┘
            │
    ┌───────┴───────┬────────────────┐
    ▼               ▼                ▼
┌─────────┐   ┌──────────┐    ┌─────────────┐
│ Salt    │   │ IV       │    │ Key Material│
│ (32 B)  │   │ (16 B)   │    │             │
│ from    │   │ from     │    │             │
│ hash    │   │ reversed │    │             │
│         │   │ hash     │    │             │
└────┬────┘   └────┬─────┘    └──────┬──────┘
     │             │                 │
     └──────┬──────┴─────────────────┘
            ▼
┌─────────────────────────┐
│ PBKDF2                  │
│ - 100,000 iterations    │
│ - SHA-256 hash function │
│ - 256-bit output        │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ AES-256-GCM Key         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐      ┌─────────────┐
│ AES-256-GCM Encrypt     │◄─────│ Seed Phrase │
│ - Uses derived key      │      │ (plaintext) │
│ - Uses IV from hash     │      └─────────────┘
│ - Uses additional data  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Encrypted Seed          │
│ (hex string output)     │
└─────────────────────────┘
```

### Decryption Flow

```
Encrypted Seed (hex) + Passphrase
            │
            ▼
┌─────────────────────────┐
│ Regenerate Key Material │
│ (same process as above) │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Convert hex to bytes    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ AES-256-GCM Decrypt     │
│ - Verify auth tag       │
│ - Decrypt ciphertext    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Original Seed Phrase    │
└─────────────────────────┘
```

### Scramble/Unscramble Flow

```
Encrypted Seed + Scramble Code
            │
            ▼
┌─────────────────────────┐
│ Parse scramble code     │
│ (4-digit pairs)         │
│ e.g., "21071312" →      │
│ [(21,7), (13,12)]       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Swap bytes at positions │
│ (iterate forward)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Scrambled Seed          │
└─────────────────────────┘

Unscramble: Same process but iterate in reverse order
```

## Data Flow

### Message Object Structure

```javascript
const message = {
  salt: Uint8Array(32),          // Derived from passphrase hash
  iv: Uint8Array(16),            // Initialization vector from reversed hash
  encrypted: ArrayBuffer,        // Encrypted ciphertext with auth tag
  secretKey: CryptoKey,          // PBKDF2 key material
  additionalData: Uint8Array(16) // GCM additional authenticated data
};
```

### Hex Encoding

All encrypted output is encoded as hexadecimal strings for:
- Human readability
- Easy copy/paste
- Text file storage compatibility

## Security Properties

### AES-256-GCM
- **Confidentiality:** 256-bit key provides strong encryption
- **Authenticity:** GCM mode provides built-in authentication
- **Integrity:** Any tampering will cause decryption to fail

### PBKDF2
- **Brute-force resistance:** 100,000 iterations slow down attacks
- **Salt:** Prevents rainbow table attacks
- **Deterministic:** Same passphrase always produces same key

### Scramble Layer
- **Obscurity:** Makes encrypted data harder to analyze
- **Reversible:** Required code to undo transformation
- **Defense in depth:** Additional layer if primary encryption is compromised

## Browser Compatibility

The application requires Web Crypto API support:

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| SubtleCrypto | 37+ | 34+ | 11+ | 12+ |
| PBKDF2 | 37+ | 34+ | 11+ | 12+ |
| AES-GCM | 37+ | 34+ | 11+ | 12+ |
| File API | 6+ | 3.6+ | 6+ | 12+ |

## Performance Considerations

- **Key Derivation:** The 100,000 PBKDF2 iterations intentionally slow down the process (~100-500ms depending on hardware)
- **Encryption/Decryption:** Typically completes in <10ms for seed-sized data
- **UI Updates:** Fade animations provide feedback without blocking operations

## Error Handling

| Error Condition | Handling |
|-----------------|----------|
| Empty passphrase | Alert message, operation blocked |
| Decryption failure | Error message displayed, styled in red |
| Invalid file type | Alert message on file load |
| Invalid scramble code | Button disabled, input styled red |
