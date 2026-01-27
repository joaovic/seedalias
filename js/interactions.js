/**
 * PHASE 4: Interactions & Polish
 * Comprehensive interaction handlers for animations and micro-interactions
 */

(function() {
  'use strict';

  // ========================================
  // 1. ENCRYPTION/DECRYPTION ANIMATIONS
  // ========================================

  /**
   * Create and show a spinner element during processing
   */
  function createSpinner(container = null) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner spinner-small';
    spinner.setAttribute('aria-hidden', 'true');
    if (container) {
      container.appendChild(spinner);
    }
    return spinner;
  }

  /**
   * Handle encryption button state transitions
   */
  function handleEncryptionProcess(button, resultCallback) {
    const originalHTML = button.innerHTML;
    const processState = button.querySelector('.process-state');

    // Encrypt phase: show loading spinner
    button.disabled = true;
    const spinner = createSpinner(processState);

    // Execute callback (actual encryption)
    return new Promise((resolve) => {
      setTimeout(() => {
        resultCallback(() => {
          // Success phase: show checkmark briefly
          const checkmark = document.createElement('span');
          checkmark.className = 'checkmark';
          processState.innerHTML = '';
          processState.appendChild(checkmark);

          // Reset button after 1.5s
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
            resolve();
          }, 1500);
        });
      }, 300); // Allow CSS animation to start
    });
  }

  /**
   * Create result display element with animation
   */
  function displayResult(value, type = 'encrypted') {
    const resultDiv = document.createElement('div');
    resultDiv.className = `result-display ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}`;

    // Monospace font for encrypted/decrypted values
    resultDiv.textContent = value;
    resultDiv.style.fontFamily = '"Fira Code", "IBM Plex Mono", monospace';
    resultDiv.setAttribute('data-result-type', type);

    return resultDiv;
  }

  /**
   * Copy to clipboard with feedback animation
   */
  function setupCopyButton(button, textToCopy) {
    button.addEventListener('click', async function(e) {
      e.preventDefault();

      try {
        await navigator.clipboard.writeText(textToCopy);

        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.textContent = '✓ Copied!';

        const rect = button.getBoundingClientRect();
        feedback.style.position = 'fixed';
        feedback.style.top = (rect.top - 40) + 'px';
        feedback.style.left = (rect.left) + 'px';

        document.body.appendChild(feedback);

        // Change icon briefly
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = 'var(--success)';

        // Clean up after animation
        setTimeout(() => {
          feedback.remove();
          button.innerHTML = originalIcon;
          button.style.color = '';
        }, 2000);

        // Security: Clear clipboard after 30 seconds
        setTimeout(() => {
          navigator.clipboard.writeText('');
        }, 30000);
      } catch (err) {
        console.error('Failed to copy:', err);
        button.classList.add('error');
        setTimeout(() => button.classList.remove('error'), 1000);
      }
    });
  }

  // ========================================
  // 2. BUTTON INTERACTIONS
  // ========================================

  /**
   * Setup all primary buttons with enhanced hover/click states
   */
  function setupPrimaryButtons() {
    const buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(button => {
      // Add ripple effect on click
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /**
   * Setup save buttons with special transitions
   */
  function setupSaveButtons() {
    const saveButtons = document.querySelectorAll('.save-button');

    saveButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        // Show loading state
        const originalHTML = this.innerHTML;
        this.innerHTML = '<span class="spinner"></span> Saving...';
        this.disabled = true;

        // Simulate save duration
        setTimeout(() => {
          // Success state
          this.innerHTML = '<i class="fas fa-check"></i> Saved!';
          this.classList.add('success');

          setTimeout(() => {
            this.innerHTML = originalHTML;
            this.disabled = false;
            this.classList.remove('success');
          }, 2000);
        }, 800);
      });
    });
  }

  // ========================================
  // 3. INPUT INTERACTIONS
  // ========================================

  /**
   * Setup passphrase visibility toggle
   */
  function setupPassphraseToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (!input || !toggle) return;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isPassword = input.type === 'password';

      // Toggle input type
      input.type = isPassword ? 'text' : 'password';

      // Update icon
      this.classList.toggle('far fa-eye');
      this.classList.toggle('far fa-eye-slash');

      // Animate
      this.style.animation = 'eye-toggle 0.3s ease-out';
      setTimeout(() => {
        this.style.animation = '';
      }, 300);
    });
  }

  /**
   * Setup input focus states with visual feedback
   */
  function setupInputFocusStates() {
    const inputs = document.querySelectorAll('.form-control, .form-select');

    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });

      // Real-time validation feedback
      input.addEventListener('input', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
          this.classList.remove('is-valid-custom');
          this.classList.add('is-invalid-custom');
        } else if (this.value.trim()) {
          this.classList.add('is-valid-custom');
          this.classList.remove('is-invalid-custom');
        }
      });
    });
  }

  // ========================================
  // 4. FILE UPLOAD INTERACTIONS
  // ========================================

  /**
   * Setup file upload zone with drag-and-drop feedback
   */
  function setupFileUploadZone(zoneId, inputId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    if (!zone || !input) return;

    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop zone on drag
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.classList.remove('drag-over');
      }, false);
    });

    // Handle drops
    zone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;

      input.files = files;

      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
    }, false);

    // Allow click to select files
    zone.addEventListener('click', () => {
      input.click();
    });
  }

  // ========================================
  // 5. SCRAMBLE PANEL ANIMATIONS
  // ========================================

  /**
   * Setup scramble options panel reveal animation
   */
  function setupScramblePanel(checkboxId, panelId) {
    const checkbox = document.getElementById(checkboxId);
    const panel = document.getElementById(panelId);

    if (!checkbox || !panel) return;

    checkbox.addEventListener('change', function() {
      if (this.checked) {
        panel.classList.add('visible');
      } else {
        panel.classList.remove('visible');
      }
    });
  }

  // ========================================
  // 6. TOGGLE SWITCHES
  // ========================================

  /**
   * Setup custom toggle switch styling and behavior
   */
  function setupToggleSwitches() {
    const switches = document.querySelectorAll('.toggle-switch');

    switches.forEach(switchEl => {
      const input = switchEl.querySelector('input[type="checkbox"]');
      if (!input) return;

      switchEl.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Keyboard support
      input.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          input.checked = !input.checked;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  // ========================================
  // 7. TOOLTIP SETUP
  // ========================================

  /**
   * Initialize tooltips for helpful hints
   */
  function setupTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');

    tooltips.forEach(element => {
      const tooltipText = element.getAttribute('data-tooltip');
      if (!tooltipText) return;

      element.classList.add('tooltip');

      const tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'tooltiptext';
      tooltipDiv.textContent = tooltipText;

      element.appendChild(tooltipDiv);
    });
  }

  /**
   * Add common helpful tooltips
   */
  function addDefaultTooltips() {
    const tooltips = {
      'algorithm-indicator': 'AES-256-GCM: Advanced Encryption Standard with 256-bit keys and Galois/Counter Mode authentication',
      'scramble-code-info': 'Provide byte position pairs (e.g., 0102, 2107) to scramble your encrypted seed',
      'passphrase-hint': 'Use a memorable sentence you can always remember. Never write it down.',
    };

    Object.entries(tooltips).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.setAttribute('data-tooltip', text);
      }
    });
  }

  // ========================================
  // 8. LOADING STATES
  // ========================================

  /**
   * Show loading spinner in element
   */
  function showLoading(element, message = 'Processing...') {
    if (!element) return;

    const originalHTML = element.innerHTML;
    const spinner = createSpinner();
    element.innerHTML = '';
    element.appendChild(spinner);
    element.append(` ${message}`);
    element.dataset.originalHTML = originalHTML;
    element.disabled = true;
  }

  /**
   * Hide loading spinner and restore original state
   */
  function hideLoading(element) {
    if (!element || !element.dataset.originalHTML) return;

    element.innerHTML = element.dataset.originalHTML;
    element.disabled = false;
    delete element.dataset.originalHTML;
  }

  // ========================================
  // 9. STATUS ANIMATIONS
  // ========================================

  /**
   * Show success state with animation
   */
  function showSuccess(container, message = 'Success!') {
    if (!container) return;

    const successDiv = document.createElement('div');
    successDiv.className = 'state-success';
    successDiv.textContent = message;

    container.appendChild(successDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      successDiv.style.opacity = '0';
      successDiv.style.transform = 'translateY(-10px)';
      successDiv.style.transition = 'all 0.3s ease-out';

      setTimeout(() => successDiv.remove(), 300);
    }, 3000);
  }

  /**
   * Show error state with animation
   */
  function showError(container, message = 'Error!') {
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'state-error';
    errorDiv.textContent = message;

    container.appendChild(errorDiv);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transform = 'translateY(-10px)';
      errorDiv.style.transition = 'all 0.3s ease-out';

      setTimeout(() => errorDiv.remove(), 300);
    }, 4000);
  }

  // ========================================
  // 10. THEME TOGGLE ANIMATION
  // ========================================

  /**
   * Setup theme toggle with smooth icon animation
   */
  function setupThemeToggleAnimation() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function() {
      const icon = this.querySelector('i');
      if (icon) {
        // Rotate and fade effect
        icon.style.animation = 'icon-rotate 0.6s ease-in-out';
        setTimeout(() => {
          icon.style.animation = '';
        }, 600);
      }
    });
  }

  // ========================================
  // 11. ACCORDION ENHANCEMENTS
  // ========================================

  /**
   * Setup accordion button transitions
   */
  function setupAccordionTransitions() {
    const buttons = document.querySelectorAll('.accordion-button');

    buttons.forEach(button => {
      button.addEventListener('click', function() {
        // Visual feedback
        this.style.backgroundColor = 'var(--accent-primary)';
        setTimeout(() => {
          this.style.backgroundColor = '';
        }, 200);
      });
    });
  }

  // ========================================
  // 12. VALIDATION MESSAGE ANIMATIONS
  // ========================================

  /**
   * Show validation message with animation
   */
  function showValidationMessage(element, message, isValid) {
    if (!element) return;

    element.classList.remove('valid', 'invalid');
    element.classList.add(isValid ? 'valid' : 'invalid');
    element.textContent = message;
    element.style.display = 'block';
    element.style.animation = 'slide-down-success 0.3s ease-out';
  }

  // ========================================
  // 13. PUBLIC API
  // ========================================

  // Export functions for use in other scripts
  window.Interactions = {
    createSpinner,
    handleEncryptionProcess,
    displayResult,
    setupCopyButton,
    setupPrimaryButtons,
    setupSaveButtons,
    setupPassphraseToggle,
    setupInputFocusStates,
    setupFileUploadZone,
    setupScramblePanel,
    setupToggleSwitches,
    setupTooltips,
    addDefaultTooltips,
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    setupThemeToggleAnimation,
    setupAccordionTransitions,
    showValidationMessage,
  };

  // ========================================
  // 14. INITIALIZATION
  // ========================================

  /**
   * Initialize all interactions on DOM ready
   */
  function initializeInteractions() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeInteractions);
      return;
    }

    // Setup all interactions
    setupPrimaryButtons();
    setupSaveButtons();
    setupPassphraseToggle('encrypt-passphrase', 'encrypt-toggler');
    setupPassphraseToggle('decrypt-seed', 'decrypt-toggler');
    setupInputFocusStates();
    setupFileUploadZone('file-upload-zone', 'file-input');
    setupScramblePanel('apply-scramble', 'scramble-options');
    setupToggleSwitches();
    setupTooltips();
    addDefaultTooltips();
    setupThemeToggleAnimation();
    setupAccordionTransitions();

    // Setup copy buttons (will be called from security.js with specific elements)
    const copyButtons = document.querySelectorAll('[data-copy-target]');
    copyButtons.forEach(button => {
      const targetId = button.getAttribute('data-copy-target');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        setupCopyButton(button, targetElement.textContent);
      }
    });

    console.log('Phase 4 Interactions initialized');
  }

  // Start initialization
  initializeInteractions();

})();
