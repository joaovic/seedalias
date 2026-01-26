# Contributing to Seed Alias

Thank you for your interest in contributing to Seed Alias! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Guidelines](#coding-guidelines)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Security Considerations](#security-considerations)

---

## Code of Conduct

By participating in this project, you agree to be respectful and constructive. We're committed to providing a welcoming environment for all contributors regardless of background.

---

## How Can I Contribute?

### Reporting Bugs

Found a bug? Here's how to report it:

1. **Check existing issues** - Search [GitHub Issues](../../issues) first
2. **Provide details:**
   - Browser and OS version
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/error messages if applicable
3. **Title format:** `[BUG] Brief description`

**Example:**
```
[BUG] Decryption fails with special characters in passphrase

Browser: Firefox 123.0 on Windows 11
Steps:
1. Enter passphrase with special chars: "test@#$123"
2. Encrypt a seed
3. Try to decrypt
Expected: Seed decrypts successfully
Actual: "Decryption error" displayed
```

### Suggesting Enhancements

Have a feature idea? Let's discuss it:

1. **Check existing issues** - Is this already discussed?
2. **Describe the feature:**
   - What problem does it solve?
   - How would a user interact with it?
   - Any potential drawbacks?
3. **Title format:** `[FEATURE] Brief description`

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples or clarifications
- Update outdated information
- Create new guides or tutorials

### Code Contributions

Want to contribute code? Follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes** (see [Coding Guidelines](#coding-guidelines))
4. **Test thoroughly** (see [docs/TESTING.md](TESTING.md))
5. **Submit a pull request** (see [Pull Request Process](#pull-request-process))

---

## Development Setup

### Prerequisites

- Modern browser (Chrome 37+, Firefox 34+, Safari 11+, Edge 12+)
- Text editor or IDE
- Git
- Optional: Node.js (for local server)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/joaovic/seedalias.git
   cd seedalias
   ```

2. **Open in browser:**
   - **Option A:** Double-click `index.html`
   - **Option B:** Run a local server
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js
     npx serve .
     ```
     Then visit `http://localhost:8000`

3. **Test your changes** - Make sure everything works as expected

---

## Coding Guidelines

### JavaScript Style

We follow these conventions:

#### Naming Conventions
```javascript
// Constants - UPPER_SNAKE_CASE
const PBKDF2_ITERATIONS = 100000;

// Functions - camelCase
const calculateHash = (value) => { /* ... */ };

// Classes - PascalCase (if used)
class CryptoManager { /* ... */ }

// Private/internal functions - prefix with underscore
const _internalHelper = () => { /* ... */ };
```

#### Code Style
```javascript
// Use arrow functions for consistency
const myFunc = (param) => {
  // code
};

// Use const by default, let when necessary, avoid var
const immutableValue = 42;
let mutableValue = 0;

// Use template literals
const message = `Hello, ${name}!`;

// Single vs. double quotes - use consistent style (currently single)
const str = 'using single quotes';

// Formatting
if (condition) {
  // 2-space indentation
  doSomething();
}
```

### Comments and Documentation

#### Function Documentation
```javascript
/**
 * Encrypts a seed phrase using a passphrase
 * 
 * @param {string} passphrase - The user's memorable passphrase
 * @param {string} seed - The seed phrase to encrypt
 * @returns {Promise<string>} Encrypted seed as hex string
 * 
 * @example
 * const encrypted = await encrypt('my passphrase', 'word1 word2...');
 */
const encrypt = async (passphrase, seed) => {
  // implementation
};
```

#### Inline Comments
```javascript
// Use comments to explain WHY, not WHAT
// Bad:
x = x + 1; // increment x

// Good:
// Increment iteration counter to track number of processed items
x = x + 1;
```

### Modular Structure

- Keep functions focused and single-purpose
- Use IIFE (Immediately Invoked Function Expression) for module encapsulation
- Avoid global variables
- Use `const message = {}` pattern for state management within modules

### Error Handling

```javascript
// Validate inputs early
if (!passphrase || passphrase.trim() === '') {
  alert('Please provide a passphrase');
  return;
}

// Use try-catch for async operations
try {
  const result = await crypto.subtle.decrypt(...);
} catch (error) {
  console.error('Decryption failed:', error);
  displayError('Decryption error');
}
```

---

## Commit Messages

Use clear, descriptive commit messages:

### Format
```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring without feature changes
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Build, dependencies, or tooling changes
- `security:` Security-related fixes

### Examples
```
feat: add export to multiple file formats

fix: correct IV calculation in encryption pipeline

docs: update API reference for PBKDF2 function

security: increase PBKDF2 iterations from 50k to 100k
```

### Guidelines
- Keep subject line under 50 characters
- Capitalize the subject line
- Don't end subject with a period
- Use present tense ("add" not "added")
- Wrap body at 72 characters
- Explain WHAT and WHY, not HOW

---

## Pull Request Process

### Before Submitting

1. **Update documentation** - Add docs for new features
2. **Test thoroughly** - See [docs/TESTING.md](TESTING.md)
3. **Run through checklist:**
   - [ ] Code follows style guidelines
   - [ ] No console errors or warnings
   - [ ] Changes are tested on multiple browsers
   - [ ] Documentation is updated
   - [ ] Commit messages are clear
   - [ ] No unrelated changes

### PR Title Format

```
[TYPE] Concise description of change
```

Examples:
```
[FEATURE] Add dark mode support
[BUGFIX] Fix decryption with emoji in passphrase
[DOCS] Update security documentation
[REFACTOR] Consolidate hash functions
```

### PR Description Template

```markdown
## Description
Brief explanation of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Related Issues
Closes #123

## Testing
Describe how you tested these changes.

## Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have updated the documentation
- [ ] I have tested on at least 2 browsers
- [ ] No new warnings are generated
```

### Merging

- Maintainers will review your PR
- Address feedback and make requested changes
- Once approved, your PR will be merged

---

## Security Considerations

### Critical Guidelines

⚠️ **Security is paramount in this project.** Before contributing, understand:

1. **No keys or secrets in code** - Never hardcode passphrases, keys, or secrets
2. **Cryptography reviews required** - Any changes to encryption logic will be carefully reviewed
3. **No logging sensitive data** - Never log passphrases, seeds, or derived keys
4. **Test on real data** - But never commit test files with real seeds
5. **Browser APIs** - Use Web Crypto API exclusively, no external crypto libraries

### Security Checklist

- [ ] No sensitive data in console.log
- [ ] No external API calls that could leak data
- [ ] No modification of cryptographic algorithms
- [ ] Code reviewed for timing attacks
- [ ] XSS vulnerabilities checked
- [ ] All changes validated against SECURITY.md

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security concerns to the maintainers
2. Include detailed description of the vulnerability
3. Include steps to reproduce
4. Allow time for a fix before public disclosure

---

## Questions?

- Check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [docs/ARCHITECTURE.md](ARCHITECTURE.md) for system details
- Look at [docs/API.md](API.md) for function reference
- Create an issue to discuss your question

---

## Recognition

Contributors will be recognized in:
- Release notes for significant contributions
- CHANGELOG.md for feature/bug fix contributions
- Project README for substantial work

---

**Thank you for contributing to Seed Alias! 🙏**
