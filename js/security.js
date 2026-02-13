(function() {
  'use strict';

  function calculatePassphraseStrength(passphrase) {
    if (!passphrase) return { level: '', text: '', score: 0, entropy: 0 };
    
    let score = 0;
    let entropy = 0;
    
    // Length-based scoring
    if (passphrase.length >= 8) score += 1;
    if (passphrase.length >= 12) score += 1;
    if (passphrase.length >= 16) score += 1;
    if (passphrase.length >= 24) score += 2; // Bonus for very long
    
    // Character set scoring
    let charsetSize = 0;
    if (/[a-z]/.test(passphrase)) {
      score += 1;
      charsetSize += 26;
    }
    if (/[A-Z]/.test(passphrase)) {
      score += 1;
      charsetSize += 26;
    }
    if (/[0-9]/.test(passphrase)) {
      score += 1;
      charsetSize += 10;
    }
    if (/[^a-zA-Z0-9]/.test(passphrase)) {
      score += 1;
      charsetSize += 32; // Special characters
    }
    
    // Calculate Shannon entropy (bits of entropy)
    entropy = Math.log2(charsetSize) * passphrase.length;
    
    // Determine strength level
    let level = '';
    let text = '';
    
    if (score <= 2) {
      level = 'weak';
      text = 'Weak';
    } else if (score <= 4) {
      level = 'moderate';
      text = 'Moderate';
    } else if (score <= 6) {
      level = 'strong';
      text = 'Strong';
    } else {
      level = 'very-strong';
      text = 'Very Strong';
    }
    
    // Add entropy to text
    if (entropy > 0) {
      text += ` (${entropy.toFixed(1)} bits)`;
    }
    
    return { level, text, score, entropy };
  }

  function updateStrengthMeter(inputId, barId, textId) {
    const input = document.getElementById(inputId);
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);
    
    if (!input || !bar || !text) return;
    
    input.addEventListener('input', function() {
      const strength = calculatePassphraseStrength(this.value);
      
      bar.className = 'strength-bar-fill';
      text.className = 'strength-text';
      
      if (strength.level) {
        bar.classList.add(strength.level);
        text.classList.add(strength.level);
        text.textContent = strength.text;
      } else {
        text.textContent = '';
      }
    });
  }

  function validateScrambleCode(code) {
    if (!code) return { valid: false, message: '' };
    if (code.length % 4 !== 0) {
      return { valid: false, message: 'Must be groups of 4 digits' };
    }
    if (!/^\d+$/.test(code)) {
      return { valid: false, message: 'Only digits allowed' };
    }
    const swaps = code.length / 4;
    return { valid: true, message: `Valid format (${swaps} swap${swaps > 1 ? 's' : ''})` };
  }

  function setupScrambleValidation(inputId, validationId) {
    const input = document.getElementById(inputId);
    const validation = document.getElementById(validationId);
    
    if (!input || !validation) return;
    
    input.addEventListener('input', function() {
      const result = validateScrambleCode(this.value);
      
      validation.className = 'validation-message';
      input.classList.remove('is-valid-custom', 'is-invalid-custom');
      
      if (this.value) {
        validation.classList.add('visible');
        if (result.valid) {
          validation.classList.add('valid');
          validation.innerHTML = '<i class="fas fa-check"></i> ' + result.message;
          input.classList.add('is-valid-custom');
        } else {
          validation.classList.add('invalid');
          validation.innerHTML = '<i class="fas fa-times"></i> ' + result.message;
          input.classList.add('is-invalid-custom');
        }
      }
    });
  }

  function updateStatusBadge(badgeId, status, text) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    
    badge.className = 'status-badge';
    
    switch (status) {
      case 'encrypted':
        badge.classList.add('status-badge-encrypted');
        badge.innerHTML = '<i class="fas fa-lock"></i> <span>' + (text || 'Encrypted') + '</span>';
        break;
      case 'scrambled':
        badge.classList.add('status-badge-scrambled');
        badge.innerHTML = '<i class="fas fa-random"></i> <span>' + (text || 'Scrambled') + '</span>';
        break;
      case 'success':
        badge.classList.add('status-badge-success');
        badge.innerHTML = '<i class="fas fa-check"></i> <span>' + (text || 'Success') + '</span>';
        break;
      case 'error':
        badge.classList.add('status-badge-error');
        badge.innerHTML = '<i class="fas fa-times"></i> <span>' + (text || 'Error') + '</span>';
        break;
      default:
        badge.classList.add('status-badge-none');
        badge.innerHTML = '<i class="fas fa-circle"></i> <span>' + (text || 'Waiting') + '</span>';
    }
  }

  function updateByteCount(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (value) {
      const bytes = new Blob([value]).size;
      element.textContent = bytes + ' bytes';
    } else {
      element.textContent = '';
    }
  }

   function setupCopyButton(buttonId, valueSelector) {
     const button = document.getElementById(buttonId);
     if (!button) return;
     
     button.addEventListener('click', function() {
       const valueElement = document.querySelector(valueSelector);
       if (!valueElement || !valueElement.textContent) return;
       
       navigator.clipboard.writeText(valueElement.textContent).then(function() {
         button.classList.add('copied');
         button.setAttribute('data-tooltip', 'Copied!');
         button.innerHTML = '<i class="fas fa-check"></i>';
         
         // Show clipboard security warning
         showClipboardSecurityWarning();
         
         // Auto-clear clipboard after 30 seconds
         clearClipboardAfterDelay(30000);
         
         setTimeout(function() {
           button.classList.remove('copied');
           button.setAttribute('data-tooltip', 'Copy to clipboard');
           button.innerHTML = '<i class="fas fa-copy"></i>';
         }, 2000);
       }).catch(function(err) {
         console.error('Failed to copy:', err);
         button.innerHTML = '<i class="fas fa-times"></i>';
         button.style.color = 'var(--error)';
         setTimeout(function() {
           button.innerHTML = '<i class="fas fa-copy"></i>';
           button.style.color = '';
         }, 1500);
       });
     });
   }

   /**
    * PHASE 5: Show clipboard security warning
    */
   function showClipboardSecurityWarning() {
     const warning = document.createElement('div');
     warning.className = 'clipboard-security-warning';
     warning.innerHTML = `
       <i class="fas fa-exclamation-circle"></i>
       <span>Clipboard will be cleared in 30 seconds for security</span>
     `;
     
     document.body.appendChild(warning);
     
     // Fade in
     setTimeout(() => {
       warning.classList.add('visible');
     }, 10);
     
     // Auto-remove after display time
     setTimeout(() => {
       warning.classList.remove('visible');
       setTimeout(() => warning.remove(), 300);
     }, 5000);
   }

   /**
    * PHASE 5: Automatically clear clipboard after delay
    */
   let clipboardClearTimeout = null;
   
   function clearClipboardAfterDelay(delay = 30000) {
     // Cancel previous timeout if exists
     if (clipboardClearTimeout) {
       clearTimeout(clipboardClearTimeout);
     }
     
     clipboardClearTimeout = setTimeout(() => {
       navigator.clipboard.writeText('').catch(err => {
         console.error('Could not clear clipboard:', err);
       });
       clipboardClearTimeout = null;
     }, delay);
   }

  function setupWarningDismiss() {
    const warning = document.getElementById('security-warning');
    const dismissBtn = document.getElementById('dismiss-warning');
    
    if (!warning || !dismissBtn) return;
    
    const dismissed = sessionStorage.getItem('security-warning-dismissed');
    if (dismissed) {
      warning.style.display = 'none';
    }
    
    dismissBtn.addEventListener('click', function() {
      warning.style.display = 'none';
      sessionStorage.setItem('security-warning-dismissed', 'true');
    });
  }

  function observeEncryptedValue() {
    const encryptedValue = document.querySelector('.encrypted-value');
    const encryptBar = document.getElementById('encrypt-bar');
    
    if (!encryptedValue) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const value = encryptedValue.textContent;
          if (value) {
            updateStatusBadge('encrypt-status', 'encrypted');
            updateByteCount('encrypt-byte-count', value);
            if (encryptBar) encryptBar.classList.add('active');
          } else {
            updateStatusBadge('encrypt-status', 'none', 'Waiting');
            updateByteCount('encrypt-byte-count', '');
            if (encryptBar) encryptBar.classList.remove('active');
          }
        }
      });
    });
    
    observer.observe(encryptedValue, { childList: true, characterData: true, subtree: true });
  }

  function observeScrambledValue() {
    const scrambledValue = document.querySelector('.scrambled-value');
    
    if (!scrambledValue) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const value = scrambledValue.textContent;
          if (value) {
            updateStatusBadge('scramble-status', 'scrambled');
          } else {
            updateStatusBadge('scramble-status', 'none', 'Waiting');
          }
        }
      });
    });
    
    observer.observe(scrambledValue, { childList: true, characterData: true, subtree: true });
  }

  function observeDecryptedValue() {
    const decryptedValue = document.querySelector('.decrypted-value');
    
    if (!decryptedValue) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const value = decryptedValue.textContent;
          if (value) {
            if (value.toLowerCase().includes('error') || value.toLowerCase().includes('failed')) {
              updateStatusBadge('decrypt-status', 'error', 'Failed');
            } else {
              updateStatusBadge('decrypt-status', 'success', 'Decrypted');
            }
          } else {
            updateStatusBadge('decrypt-status', 'none', 'Waiting');
          }
        }
      });
    });
    
    observer.observe(decryptedValue, { childList: true, characterData: true, subtree: true });
  }

  function observeUnscrambledValue() {
    const unscrambledValue = document.querySelector('.unscrambled-value');
    
    if (!unscrambledValue) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const value = unscrambledValue.textContent;
          if (value) {
            updateStatusBadge('unscramble-status', 'success', 'Unscrambled');
          } else {
            updateStatusBadge('unscramble-status', 'none', 'Waiting');
          }
        }
      });
    });
    
    observer.observe(unscrambledValue, { childList: true, characterData: true, subtree: true });
  }

  function updateOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    // Select the label span (the one that's not the dot)
    const label = indicator?.querySelector('span:not(.offline-indicator-dot)');
    if (!indicator || !label) return;

    const isOnline = navigator.onLine;

    // Set the tooltip text (same message for both states)
    const tooltipText = window.i18n?.getText?.('app.offlineTooltip') || 
      'For maximum security, work offline to protect against network-based threats like keyloggers and remote attackers';
    indicator.setAttribute('title', tooltipText);

    if (isOnline) {
      indicator.classList.add('online');
      // Update the i18n key to onlineMode and get translation
      label.setAttribute('data-i18n', 'app.onlineMode');
      label.textContent = window.i18n?.getText?.('app.onlineMode') || 'Online (Warning)';
    } else {
      indicator.classList.remove('online');
      // Update the i18n key to offlineMode and get translation
      label.setAttribute('data-i18n', 'app.offlineMode');
      label.textContent = window.i18n?.getText?.('app.offlineMode') || 'Offline Mode';
    }
  }

  function initOfflineIndicator() {
    updateOfflineIndicator();
    window.addEventListener('online', updateOfflineIndicator);
    window.addEventListener('offline', updateOfflineIndicator);
    // Re-apply correct text when language changes
    window.addEventListener('languagechange', function() {
      setTimeout(updateOfflineIndicator, 0);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    updateStrengthMeter('encrypt-passphrase', 'encrypt-strength-bar', 'encrypt-strength-text');
    
    setupScrambleValidation('scramblecode', 'scramblecode-validation');
    setupScrambleValidation('unscramblecode', 'unscramblecode-validation');
    
    setupCopyButton('copy-encrypted', '.encrypted-value');
    setupCopyButton('copy-scrambled', '.scrambled-value');
    
    setupWarningDismiss();
    
    observeEncryptedValue();
    observeScrambledValue();
    observeDecryptedValue();
    observeUnscrambledValue();

    initOfflineIndicator();
  });

  window.SecurityIndicators = {
    updateStatusBadge: updateStatusBadge,
    updateByteCount: updateByteCount,
    calculatePassphraseStrength: calculatePassphraseStrength,
    validateScrambleCode: validateScrambleCode
  };
})();
