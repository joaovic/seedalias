# Changelog

All notable changes to Seed Alias are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] - 2025-01-26

### Added

- **Enhanced Documentation**
  - Added comprehensive [Developer Guide](DEVELOPER.md) for developers
  - Added [Contributing Guide](CONTRIBUTING.md) with coding standards
  - Added [Testing Guide](TESTING.md) with test cases and procedures
  - Added [Deployment Guide](DEPLOYMENT.md) for hosting options
  - Added [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues
  - Added [Documentation Index](INDEX.md) as central navigation hub

- **Code Documentation**
  - Added JSDoc comments to crypto.js functions
  - Added inline comments explaining algorithm flow
  - Documented PBKDF2 key derivation process
  - Documented AES-256-GCM encryption pipeline

### Changed

- Improved existing documentation clarity

### Fixed

- Documentation consistency across all docs

### Security

- All documentation reviewed for security best practices
- Security considerations highlighted in appropriate guides

---

## [0.5.0] - 2024-December

### Added

- Comprehensive [Architecture Documentation](ARCHITECTURE.md) with system diagrams
- Complete [API Reference](API.md) for all JavaScript functions
- Detailed [Security Documentation](SECURITY.md) with cryptographic specs
- Comprehensive [User Guide](USER_GUIDE.md) with feature walkthroughs
- [README.md](../README.md) with project overview and quick start

### Security

- PBKDF2 iterations set to 100,000 for brute-force resistance
- AES-256-GCM authenticated encryption implemented
- Client-side only processing - no data sent to servers
- Web Crypto API used for all cryptographic operations

---

## [0.1.0] - Initial Release

### Added

- Core encryption/decryption functionality using AES-256-GCM
- Passphrase-based key derivation using PBKDF2
- Optional byte-scrambling feature for additional obfuscation
- File import/export for encrypted seeds
- Passphrase visibility toggle
- Bootstrap 5.3 responsive UI
- Font Awesome icons
- Cross-browser compatibility (Chrome 37+, Firefox 34+, Safari 11+, Edge 12+)

---

## Versioning

### Version Format

- **Major** (X._._ ) - Breaking changes, major features
- **Minor** (.X._ ) - New features, backward compatible
- **Patch** (._X ) - Bug fixes, documentation updates

### Support

- Latest version fully supported
- Previous versions supported for 6 months after new major release

---

## Planned Features

### Version 0.7.0 (Future)

- [ ] Dark mode toggle
- [ ] Multiple encryption algorithm support (AES-128-GCM)
- [ ] Language/localization support
- [ ] Batch encryption/decryption
- [ ] Integration tests

### Version 1.0.0 (Future)

- [ ] Official release milestone
- [ ] Increased iteration count (PBKDF2)
- [ ] Hardened security review
- [ ] Extended browser support validation

---

## Deprecated

### Version 0.5.0

- No deprecations

---

## Known Issues

### Version 0.6.0

- None reported

---

## Security Releases

The following versions contained security-related changes:

| Version | Details | Date |
|---------|---------|------|
| 0.6.0 | Documentation review for security best practices | 2025-01-26 |
| 0.5.0 | Cryptographic implementation with 100k iterations | 2024-12 |

---

## Migration Guides

### From 0.5.0 to 0.6.0

No breaking changes. All encrypted files from 0.5.0 remain compatible.

**New documentation:**
- Read [DEVELOPER.md](DEVELOPER.md) for development setup
- Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing
- See [TESTING.md](TESTING.md) for testing procedures

### From 0.1.0 to 0.5.0

No breaking changes. All encrypted files from 0.1.0 remain compatible.

**API changes:**
- Function signatures unchanged
- Module structure unchanged
- Encryption parameters unchanged

---

## Contributors

### Maintainers

- João Vicente L. F. Machado - @joaovic

### Contributors

(Open source project - contributions welcome!)

---

## Release Notes Archive

### [0.5.0] - 2024-December

**Highlights:**
- Complete documentation suite
- Architectural review and documentation
- Security documentation with specifications

### [0.1.0] - Initial Release

**Highlights:**
- Full encryption/decryption functionality
- Scramble feature for additional obfuscation
- Cross-browser compatibility

---

## Comparing Versions

To compare changes between versions:

```bash
git log --oneline v0.5.0..v0.6.0
git diff v0.5.0 v0.6.0
```

---

## How to Update

### For Users

1. Re-download latest version from GitHub
2. All existing encrypted files remain compatible
3. No data migration needed
4. No new installation required

### For Developers

1. Pull latest code: `git pull origin main`
2. Review [CHANGELOG.md](CHANGELOG.md) for breaking changes
3. See [DEVELOPER.md](DEVELOPER.md) for setup

### For DevOps

1. Redeploy from latest GitHub version
2. No database migrations needed
3. Clear CDN cache if applicable
4. No downtime required

---

## Feedback

Have suggestions for new features or improvements?

- **Feature request:** Create [GitHub Issue](../../issues) with label `enhancement`
- **Security issue:** Email maintainers directly (see [CONTRIBUTING.md](CONTRIBUTING.md))
- **Documentation:** Submit pull request with improvements
- **Bug report:** Create [GitHub Issue](../../issues) with label `bug`

---

## License

See [LICENSE](../LICENSE) file for details.

---

**Last Updated:** January 2026 | **Current Version:** 0.6.0

For more information, visit the [Documentation Index](INDEX.md).
