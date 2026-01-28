# User Guide

This comprehensive guide walks you through all features of Seed Alias for securing your cryptocurrency seed phrases.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Encrypting Your Seed](#encrypting-your-seed)
3. [Decrypting Your Seed](#decrypting-your-seed)
4. [UI Features](#ui-features)
5. [Using the Scramble Feature](#using-the-scramble-feature)
6. [Working with Files](#working-with-files)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
7. [FAQ](#faq)

---

## Getting Started

### Opening the Application

**Option 1: Direct Browser Open**
1. Navigate to the `seedalias` folder
2. Double-click `index.html`
3. The application opens in your default browser

**Option 2: Local Web Server**
```bash
# Navigate to the project folder
cd /path/to/seedalias

# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .
```
Then open `http://localhost:8000` in your browser.

### Interface Overview

The application has two main panels:

```
┌─────────────────────┬─────────────────────┐
│      ENCRYPT        │       DECRYPT       │
│    (Green header)   │    (Blue header)    │
│                     │                     │
│  - Passphrase       │  - Encrypted seed   │
│  - Seed input       │  - Passphrase       │
│  - Encrypt button   │  - Decrypt button   │
│  - Scramble option  │  - Unscramble opt   │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

---

## Encrypting Your Seed

### Step-by-Step Encryption

#### Step 1: Enter Your Passphrase
1. Click the "Passphrase" field in the Encrypt panel
2. Type your memorable passphrase
3. Click the eye icon to verify what you typed
4. Observe the strength meter below the field showing passphrase strength

**Passphrase Tips:**
- Use a sentence you'll never forget
- Example: "My grandmother makes the best apple pie since 1985!"
- Avoid: Single words, birthdays, common phrases
- Aim for "Strong" or "Very Strong" rating on the strength meter

#### Step 2: Enter Your Seed Phrase
1. Click the "Seed to encrypt" field
2. Type or paste your wallet seed words
3. Include spaces between words

**Example seed format:**
```
word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
```

#### Step 3: Encrypt
1. Click the green **Encrypt** button
2. Wait for the encrypted result to appear
3. You'll see: `abc123def456...[XX bytes total]`

#### Step 4: Save Your Encrypted Seed
1. Click the **Save** button
2. A file named `encrypted-key.txt` downloads
3. Store this file securely

### Verification
**IMPORTANT:** Always verify your encryption worked:
1. Note that your passphrase was copied to the Decrypt panel
2. The encrypted value appears in both the display and decrypt input
3. Click the copy button (top-right of output box) to copy encrypted value
4. Click **Decrypt** to verify you can recover your seed
5. **Only after successful verification** should you consider your backup valid

---

## UI Features

### Passphrase Strength Meter
- Located below passphrase input fields
- Shows real-time strength assessment
- Color-coded bar: Red (Weak) → Yellow (Moderate) → Green (Strong)
- Displays strength text: "Weak", "Moderate", "Strong", or "Very Strong"
- Shows entropy (bits) for technical users
- Helps ensure you're using strong passphrases

### Copy to Clipboard
- Copy button in top-right corner of encrypted/scrambled output boxes
- Click to copy value to clipboard
- Shows "Copied!" feedback animation and checkmark
- Displays security warning toast: "Clipboard will be cleared in 30 seconds"
- Auto-clears clipboard after 30 seconds for security

### Theme Toggle
- Located in top-right corner of page header
- Click to switch between light and dark themes
- Smooth color transitions (400ms)
- Preference saved to localStorage automatically
- Respects system preference on first visit

### Status Indicators
- Color-coded badges show encryption/decryption state
- Green with lock icon: Encrypted
- Orange with random icon: Scrambled
- Gray circle: Waiting for input
- Green check: Success
- Red X: Error

### Animations & Feedback
- Smooth button click animations with ripple effects
- Loading spinners during encryption/decryption operations
- Slide-in/out animations for scramble panels
- Fade-in effects for encrypted/decrypted results
- Focus states with subtle border glow on input fields
- Error shake animation for failed operations

### Background Effects
- Light theme: Subtle cross-hatch grain texture with grid pattern
- Dark theme: SVG noise texture with hexagonal blockchain pattern
- Vignette effect for visual depth
- Professional "Cryptographic Vault" aesthetic
- All textures are CSS-generated (no external images)

---

## Decrypting Your Seed

### Step-by-Step Decryption

#### Step 1: Load Your Encrypted Seed

**Option A: Paste directly**
1. Open your saved `encrypted-key.txt`
2. Copy the entire contents
3. Paste into the "Encrypted seed" field

**Option B: Use file loader**
1. Click **Choose File** button
2. Select your `encrypted-key.txt`
3. The content loads automatically

#### Step 2: Enter Your Passphrase
1. Click the "Passphrase" field in the Decrypt panel
2. Type the exact same passphrase used for encryption
3. Click eye icon to verify if needed

#### Step 3: Decrypt
1. Click the blue **Decrypt** button
2. Your original seed phrase appears below

### Handling Decryption Errors

If you see **"*** Decryption error ***"**:

| Possible Cause | Solution |
|----------------|----------|
| Wrong passphrase | Re-enter passphrase carefully |
| Corrupted encrypted data | Try loading file again |
| Used scramble | Enable unscramble and provide code |
| Typo in passphrase | Check caps lock, special characters |

---

## Using the Scramble Feature

The scramble feature adds an extra layer of protection by rearranging bytes in your encrypted seed.

### When to Use Scramble

- When storing encrypted files in less secure locations
- When you want an additional secret (the scramble code)
- For defense-in-depth security

### Understanding Scramble Codes

Scramble codes tell the system which bytes to swap:

```
Code Format: AABB (4 digits per swap)
- AA = first position (01-99)
- BB = second position (01-99)

Examples:
- 0102 → Swap byte 1 with byte 2
- 1520 → Swap byte 15 with byte 20
- 01021520 → Two swaps: 1↔2, then 15↔20
```

**Rules:**
- Positions start at 1 (not 0)
- Single digits need leading zero: position 5 = "05"
- Positions cannot exceed the encrypted data length
- Code length must be divisible by 4

### Step-by-Step Scrambling

#### Step 1: Encrypt First
1. Complete the encryption process above
2. Check "Scramble your encrypted seed?"
3. The scramble controls appear

#### Step 2: Enter Scramble Code
1. Type your scramble code (e.g., `01051015`)
2. The button enables when the code is valid
3. Invalid codes show in red

#### Step 3: Scramble
1. Click the yellow **Scramble** button
2. View the scrambled result
3. Click **Save** to download `scrambled-key.txt`

### Step-by-Step Unscrambling

#### Step 1: Load Scrambled File
1. In the Decrypt panel, check "Unscramble scrambled encrypted seed?"
2. Use the file loader to select your scrambled file
3. Or paste the scrambled content directly

#### Step 2: Enter Unscramble Code
1. Enter the SAME code used for scrambling
2. Click the yellow **Unscramble** button
3. The unscrambled encrypted seed fills in automatically

#### Step 3: Decrypt
1. Enter your passphrase
2. Click **Decrypt** as normal
3. Your seed phrase appears

---

## Working with Files

### File Formats

| File | Contents | Purpose |
|------|----------|---------|
| `encrypted-key.txt` | Hex string | Basic encrypted backup |
| `scrambled-key.txt` | Hex string (scrambled) | Enhanced security backup |

### File Content Example

```
8a3f2c1b7d4e5f6a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a
```

Files contain only the hexadecimal encrypted data with no metadata.

### Best Practices for File Storage

**Local Storage:**
```
✓ Encrypted external drive
✓ Encrypted folder (VeraCrypt, etc.)
✓ Multiple backup copies
✗ Desktop or Downloads folder
✗ Unencrypted USB drive
```

**Cloud Storage (if necessary):**
```
1. Encrypt with passphrase
2. Scramble with memorable code
3. Compress to password-protected ZIP
4. Upload compressed file
5. Store passphrase, scramble code, and ZIP password separately
```

---

## Troubleshooting

### Common Issues

#### Encrypt Button Not Working
- **Cause:** Empty passphrase
- **Solution:** Enter a passphrase first

#### Scramble Button Stays Disabled
- **Cause:** Invalid scramble code
- **Solution:** Ensure code length is divisible by 4 and positions are valid

#### Decryption Shows Error
- **Cause:** Wrong passphrase or corrupted data
- **Solution:** Verify passphrase; try reloading file

#### File Won't Load
- **Cause:** Wrong file type
- **Solution:** Only .txt files are supported

#### Page Is Unresponsive
- **Cause:** Very long seed or browser issue
- **Solution:** Refresh page and retry

### Browser Compatibility Issues

If features don't work:
1. Use Chrome, Firefox, Safari, or Edge (latest versions)
2. Ensure JavaScript is enabled
3. Try a private/incognito window
4. Disable browser extensions

---

## FAQ

### General Questions

**Q: Is my seed sent to any server?**
A: No. All operations happen entirely in your browser. No data leaves your computer.

**Q: Can I use this offline?**
A: Yes! Download all files and open `index.html` locally. No internet required after loading.

**Q: What if I forget my passphrase?**
A: There is NO recovery option. The encryption cannot be reversed without the exact passphrase. This is by design for security.

**Q: Is this open source?**
A: Yes. You can inspect all code in the JavaScript files.

### Security Questions

**Q: Is this secure enough for large holdings?**
A: While the cryptography is strong (AES-256-GCM), security also depends on your passphrase strength, environment security, and operational practices. For very large holdings, consider professional security consultation.

**Q: Should I use scramble?**
A: It's optional but recommended for cloud storage or any situation where the encrypted file might be accessed by others.

**Q: Can someone decrypt my seed if they have the encrypted file?**
A: Only if they also know your passphrase (and scramble code if used). With a strong passphrase, brute-force attacks are impractical.

### Usage Questions

**Q: Can I encrypt multiple seeds?**
A: Yes, but encrypt each with a different passphrase or save to separate files.

**Q: What's the maximum seed length?**
A: There's no practical limit. Standard 12 or 24 word seeds work fine.

**Q: Can I use this for other sensitive data?**
A: While designed for seeds, it works for any text you want to encrypt.

### Technical Questions

**Q: Why is the IV derived from the passphrase?**
A: This makes the encryption deterministic and reproducible without storing additional data. For one-time seed encryption, this is acceptable.

**Q: What happens if I use the wrong unscramble code?**
A: The data will be incorrectly unscrambled and decryption will fail.

**Q: Why 100,000 PBKDF2 iterations?**
A: This balances security (making brute-force slow) with usability (still completes in under a second on modern hardware).

---

## Quick Reference Card

```
ENCRYPT:
1. Enter passphrase
2. Enter seed
3. Click Encrypt
4. (Optional) Scramble
5. Save file

DECRYPT:
1. Load file (or paste)
2. (If scrambled) Enter code + Unscramble
3. Enter passphrase
4. Click Decrypt

SCRAMBLE CODE FORMAT:
- 4 digits per swap
- Position 1-99 (use leading zeros: 01, 02, etc.)
- Example: 01021520 = swap 1↔2, then 15↔20

FILES:
- encrypted-key.txt (basic)
- scrambled-key.txt (enhanced)

REMEMBER:
- Never share passphrase
- Test decrypt before trusting backup
- Multiple backups in different locations
```
