# Seed Alias

A client-side web application for securely encrypting and managing cryptocurrency wallet seed phrases using memorable passphrases.

## Overview

Seed Alias provides a secure way to protect your cryptocurrency seed phrases by encrypting them with a passphrase you can easily remember. Instead of memorizing complex seed words, you create a memorable "alias" (passphrase) that encrypts and decrypts your seed.

**Version:** 1.0.0

## Features

- **AES-256-GCM Encryption** - Industry-standard authenticated encryption
- **PBKDF2 Key Derivation** - 100,000 iterations with SHA-256 for strong key generation
- **Scramble Protection** - Optional byte-swapping for additional security layer
- **Client-Side Only** - All operations happen in your browser; no data is sent to servers
- **File Import/Export** - Save and load encrypted seeds from text files
- **Passphrase Visibility Toggle** - Show/hide passphrase fields for convenience

## Quick Start

### Option 1: Open Directly
Simply open `index.html` in a modern web browser.

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```
Then navigate to `http://localhost:8000`

## Usage

### Encrypting a Seed

1. Enter your memorable passphrase in the "Passphrase" field
2. Enter your seed words in the "Seed to encrypt" field
3. Click **Encrypt**
4. (Optional) Enable scramble for additional protection
5. Click **Save** to download the encrypted seed

### Decrypting a Seed

1. Load your encrypted seed file or paste the encrypted text
2. If scrambled, check "Unscramble" and enter the scramble code
3. Enter your passphrase
4. Click **Decrypt**

### Using the Scramble Feature

The scramble feature swaps byte positions in your encrypted seed for additional obfuscation:

- Code format: 4-digit pairs (e.g., `0102` swaps bytes 1 and 2)
- Multiple swaps: Chain codes together (e.g., `21071312` performs two swaps)
- Positions are 1-based (not 0-based like array indices)
- Single-digit positions must be zero-padded (e.g., `09` for position 9)

## Project Structure

```
seedalias/
├── index.html          # Main application HTML
├── crypto.js           # Core encryption/decryption logic
├── scramble.js         # Scramble/unscramble functionality
├── style.css           # Application styles
├── README.md           # This file (quick start & overview)
├── CHANGELOG.md        # Version history and release notes
├── donation-qrcode.jpeg # Donation QR code
└── docs/               # Detailed documentation
    ├── INDEX.md            # Documentation navigation hub
    ├── ARCHITECTURE.md     # Technical architecture
    ├── API.md              # JavaScript API reference
    ├── SECURITY.md         # Cryptographic specs & threat model
    ├── USER_GUIDE.md       # Detailed usage guide
    ├── DEVELOPER.md        # Developer setup & code patterns
    ├── TESTING.md          # Testing procedures & test cases
    ├── CONTRIBUTING.md     # Contribution guidelines
    ├── TROUBLESHOOTING.md  # Common issues & solutions
    ├── DEPLOYMENT.md       # Hosting & deployment options
    └── CHANGELOG.md        # Version history
```

## Security Considerations

- **Keep your passphrase secret** - Never write it down or share it
- **Use a memorable but strong passphrase** - A sentence you'll never forget
- **Store encrypted files securely** - Avoid storing on public cloud services without additional encryption
- **Scramble for online storage** - If you must store files online, use the scramble feature first

**WARNING:** Anyone with your passphrase AND encrypted seed can access your funds. Never share these with anyone claiming to offer help.

## Technical Details

- **Encryption Algorithm:** AES-256-GCM (Authenticated Encryption)
- **Key Derivation:** PBKDF2 with 100,000 iterations using SHA-256
- **Salt:** 32 bytes derived from passphrase hash
- **IV (Nonce):** 16 bytes derived from reversed passphrase hash
- **Additional Data:** 16 bytes for GCM authentication

For more technical details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 📚 Documentation

Full documentation is available in the `docs/` folder:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[docs/INDEX.md](docs/INDEX.md)** | **Documentation hub & navigation** | Everyone |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | Comprehensive usage guide | End users |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & data flows | Developers |
| [docs/API.md](docs/API.md) | JavaScript API reference | Developers |
| [docs/SECURITY.md](docs/SECURITY.md) | Cryptographic specifications | Security-conscious users/Devs |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Development setup & patterns | Developers |
| [docs/TESTING.md](docs/TESTING.md) | Testing procedures & QA | Testers/QA |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute | Contributors |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues & solutions | Users/Developers |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hosting & deployment options | DevOps/Admins |
| [CHANGELOG.md](CHANGELOG.md) | Version history | Everyone |

**Start here:** [📖 Documentation Index](docs/INDEX.md)

## Browser Compatibility

Requires a modern browser with Web Crypto API support:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

## Dependencies

- [Bootstrap 5.3.0](https://getbootstrap.com/) - UI framework
- [Font Awesome 6.0](https://fontawesome.com/) - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

If you find this tool useful, consider supporting the project:

![Donation QR: joaovic@blink.sv](donation-qrcode.jpeg)

Address: `joaovic@blink.sv`

## License

This project is open source. See repository for license details.

## Disclaimer

This software is provided as-is. Users are responsible for the security of their own seed phrases and passphrases. The developers are not responsible for any loss of funds due to misuse, forgotten passphrases, or security breaches.
