# Security Documentation

This document details the security considerations, threat model, and best practices for using Seed Alias.

## Security Overview

Seed Alias implements multiple layers of security to protect your cryptocurrency seed phrases:

1. **Strong Encryption** - AES-256-GCM authenticated encryption
2. **Key Derivation** - PBKDF2 with 100,000 iterations
3. **Client-Side Processing** - All operations happen locally in your browser
4. **Optional Obfuscation** - Byte scrambling for defense in depth

## Cryptographic Specifications

### AES-256-GCM

| Property | Value |
|----------|-------|
| Algorithm | AES (Advanced Encryption Standard) |
| Key Size | 256 bits |
| Mode | GCM (Galois/Counter Mode) |
| Authentication | Built-in AEAD |
| IV Size | 128 bits (16 bytes) |

**Why AES-256-GCM?**
- Provides both confidentiality and authenticity
- Widely reviewed and trusted algorithm
- Native browser support via Web Crypto API
- Detects any tampering with ciphertext

### PBKDF2 Key Derivation

| Property | Value |
|----------|-------|
| Algorithm | PBKDF2 |
| Iterations | 100,000 |
| Hash Function | SHA-256 |
| Salt Size | 256 bits (32 bytes) |
| Output | 256-bit AES key |

**Why 100,000 iterations?**
- Significantly slows brute-force attacks
- Each password guess requires ~100,000 hash operations
- Balances security with usability (sub-second on modern hardware)

### Derivation Process

```
Passphrase
    │
    ├──→ SHA-256 Hash (64 hex chars)
    │         │
    │         ├──→ Salt: First 32 bytes of hash
    │         │
    │         ├──→ IV: First 16 bytes of REVERSED hash
    │         │
    │         ├──→ Additional Data: Bytes 16-32 of hash
    │         │
    │         └──→ Key Material: Full hash as PBKDF2 input
    │
    └──→ PBKDF2 (100,000 iterations) ──→ AES-256 Key
```

## Threat Model

### What Seed Alias Protects Against

| Threat | Protection |
|--------|------------|
| **Seed theft from plain text** | Encryption hides seed contents |
| **Brute force (weak passphrase)** | PBKDF2 iterations slow attacks |
| **Ciphertext tampering** | GCM authentication detects changes |
| **Memory dumps** | Browser garbage collection (not guaranteed) |
| **Network interception** | No network transmission occurs |

### What Seed Alias Does NOT Protect Against

| Threat | Explanation |
|--------|-------------|
| **Keyloggers** | Can capture passphrase as typed |
| **Screen capture malware** | Can capture displayed seed |
| **Browser extensions** | Malicious extensions can read page content |
| **Compromised browser** | Attacker controls crypto operations |
| **Physical access** | Attacker can observe or extract data |
| **Weak passphrases** | "password123" is easily guessable |
| **Forgotten passphrases** | No recovery mechanism exists |
| **Clipboard attacks** | Copied data can be intercepted |

## Security Best Practices

### Passphrase Selection

**DO:**
- Use a memorable sentence or phrase
- Include mixed case, numbers, special characters
- Make it at least 20 characters long
- Use something personally meaningful but not guessable
- Example: "My first car was a blue 1995 Honda Civic!"

**DON'T:**
- Use dictionary words alone
- Use personal info (birthdays, names, addresses)
- Use the same passphrase elsewhere
- Write down the passphrase
- Share the passphrase with anyone

### Passphrase Strength Estimates

| Passphrase Type | Entropy | Time to Crack* |
|-----------------|---------|----------------|
| 4 random words | ~44 bits | Days |
| 8 character mixed | ~52 bits | Months |
| 12 character mixed | ~78 bits | Millennia |
| 20+ char sentence | ~100+ bits | Heat death of universe |

*Assuming 1 trillion guesses/second against raw hash (not accounting for PBKDF2)

### Environment Security

**Before using Seed Alias:**

1. **Use a clean browser profile**
   - Disable all extensions
   - Clear browsing data
   - Use incognito/private mode if possible

2. **Verify the source**
   - Check the URL carefully
   - Verify file integrity if running locally
   - Never use links from untrusted sources

3. **Secure your environment**
   - Use a trusted, malware-free computer
   - Ensure no one can observe your screen
   - Close other tabs and applications

4. **After use**
   - Close the browser completely
   - Clear clipboard if used
   - Consider restarting browser

### File Storage Recommendations

**Encrypted Seed Files:**

| Storage Location | Risk Level | Recommendation |
|------------------|------------|----------------|
| Local drive (encrypted) | Low | Acceptable |
| Local drive (unencrypted) | Medium | Use scramble feature |
| USB drive (encrypted) | Low | Good for backup |
| Cloud storage | Medium-High | Use scramble + password-protected archive |
| Email | High | Not recommended |
| Shared drives | High | Not recommended |

**Recommended Backup Strategy:**
1. Encrypt seed with strong passphrase
2. Apply scramble with memorable code
3. Compress to password-protected ZIP/7z
4. Store on multiple offline drives
5. Keep drives in separate physical locations

## The Scramble Feature

### Purpose
The scramble feature provides an additional obfuscation layer that:
- Makes encrypted data appear more random
- Requires knowledge of scramble code to reverse
- Provides defense in depth if encryption is somehow weakened

### How It Works

```
Original Encrypted Bytes: [A][B][C][D][E][F]...
Scramble Code: 0304
After Scramble:           [A][B][D][C][E][F]...
                               ↑   ↑
                               Swapped positions 3 and 4
```

### Scramble Security Properties

| Property | Detail |
|----------|--------|
| Reversibility | Fully reversible with correct code |
| Key space | Limited (depends on encrypted length) |
| Purpose | Obfuscation, not encryption |
| Strength | Should NOT be relied upon alone |

### Scramble Code Best Practices

- Use a memorable number (phone number, date in DDMMYYYY format, etc.)
- Keep separate from encrypted file
- Remember: this is obfuscation, not encryption

## Potential Vulnerabilities

### Deterministic IV
The IV is derived from the passphrase hash, making it deterministic. This means:
- Same passphrase always produces same IV
- Not a vulnerability for single-use seeds
- Consider using different passphrases for different seeds

### No Password Confirmation
The interface allows encryption without confirming the passphrase. Users should:
- Immediately test decryption after encrypting
- Never delete original seed until verified

### JavaScript Security
As a browser-based application:
- Source code is visible and inspectable
- No code signing or integrity verification built-in
- Users should verify they're running authentic code

## Audit Recommendations

If auditing this code, pay attention to:

1. **crypto.js lines 46-78**: Key derivation parameters
2. **crypto.js lines 110-151**: Encryption implementation
3. **crypto.js lines 199-240**: Decryption implementation
4. **crypto.js lines 242-248**: Parameter derivation from passphrase
5. **scramble.js lines 11-30**: Scramble implementation
6. **scramble.js lines 32-49**: Unscramble implementation

## Reporting Security Issues

If you discover a security vulnerability:
1. Do not disclose publicly
2. Contact the project maintainer directly
3. Provide detailed reproduction steps
4. Allow reasonable time for a fix

## Disclaimer

This software is provided for educational and personal use. The developers:
- Make no guarantees about the security of funds
- Cannot recover lost passphrases
- Are not responsible for any loss of funds
- Recommend professional security audits for high-value use cases

**Always maintain backup access to your seeds through other secure means.**
