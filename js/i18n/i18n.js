/**
 * Internationalization (i18n) Manager for Seed Alias
 * Handles language switching, translations, and persistence
 * Pattern: IIFE with localStorage persistence (following theme.js)
 */

(function() {
  'use strict';

  const LANG_KEY = 'seedalias-language';
  const DEFAULT_LANG = 'en-US';
  const AVAILABLE_LANGS = ['en-US', 'pt-BR'];
  const LANG_NAMES = {
    'en-US': { flag: '🇺🇸', name: 'English' },
    'pt-BR': { flag: '🇧🇷', name: 'Português' }
  };

  let currentLang = DEFAULT_LANG;

  /**
   * Get saved language from localStorage
   */
  function getSavedLanguage() {
    try {
      return localStorage.getItem(LANG_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * Detect browser language
   */
  function getBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      // Check for exact match
      if (AVAILABLE_LANGS.includes(browserLang)) {
        return browserLang;
      }
      // Check for language match (e.g., 'en' matches 'en-US')
      const langCode = browserLang.split('-')[0];
      const match = AVAILABLE_LANGS.find(lang => lang.startsWith(langCode));
      if (match) {
        return match;
      }
    }
    return DEFAULT_LANG;
  }

  /**
   * Save language preference to localStorage
   */
  function saveLanguage(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }

  /**
   * Get nested translation value using dot notation
   * Example: getNestedTranslation('en-US', 'encrypt.button')
   */
  function getNestedTranslation(lang, key) {
    if (!window.translations) {
      console.warn('i18n: window.translations not found');
      return null;
    }
    
    if (!window.translations[lang]) {
      console.warn('i18n: Language not found:', lang);
      return null;
    }
    
    const keys = key.split('.');
    let value = window.translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Get translation for current language with fallback
   */
  function getText(key) {
    // Try current language
    let translation = getNestedTranslation(currentLang, key);
    if (translation !== null) {
      return translation;
    }
    
    // Fallback to default language
    translation = getNestedTranslation(DEFAULT_LANG, key);
    if (translation !== null) {
      return translation;
    }
    
    // Return key if no translation found
    return key;
  }

  /**
   * Translate a single element
   */
  function translateElement(element) {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    
    const translation = getText(key);
    if (translation === null) return;
    
    // Check if element has child elements (like icons)
    if (element.children.length > 0) {
      // Find the last child span which usually contains the text
      const spans = element.querySelectorAll('span');
      if (spans.length > 0) {
        // Update the last span's text content
        spans[spans.length - 1].textContent = translation;
      } else {
        // Find any text node directly in this element
        const textNodes = Array.from(element.childNodes).filter(
          node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );
        if (textNodes.length > 0) {
          textNodes.forEach(node => {
            node.textContent = translation;
          });
        } else {
          // Set text content directly (will remove children, so we need to be careful)
          // Instead, append a text node at the end
          element.appendChild(document.createTextNode(translation));
        }
      }
    } else {
      // No children, safe to set textContent
      element.textContent = translation;
    }
  }

  /**
   * Translate placeholder attribute
   */
  function translatePlaceholder(element) {
    const key = element.getAttribute('data-i18n-placeholder');
    if (!key) return;
    
    const translation = getText(key);
    if (translation !== null) {
      element.placeholder = translation;
    }
  }

  /**
   * Translate aria-label attribute
   */
  function translateAriaLabel(element) {
    const key = element.getAttribute('data-i18n-aria');
    if (!key) return;
    
    const translation = getText(key);
    if (translation !== null) {
      element.setAttribute('aria-label', translation);
    }
  }

  /**
   * Translate tooltip data attributes
   */
  function translateTooltip(element) {
    const key = element.getAttribute('data-i18n-data-tooltip');
    if (!key) return;
    
    const translation = getText(key);
    if (translation !== null) {
      element.setAttribute('data-tooltip', translation);
    }
  }

  /**
   * Translate all elements on the page
   */
  function translatePage() {
    console.log('i18n: Translating page to', currentLang);
    
    // Translate text content
    const i18nElements = document.querySelectorAll('[data-i18n]');
    console.log('i18n: Found', i18nElements.length, 'elements with data-i18n');
    i18nElements.forEach(translateElement);
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(translatePlaceholder);
    
    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(translateAriaLabel);
    
    // Translate tooltips
    document.querySelectorAll('[data-i18n-data-tooltip]').forEach(translateTooltip);
    
    // Update lang attribute on html element
    document.documentElement.lang = currentLang;
    console.log('i18n: Translation complete');
  }

  /**
   * Update status badge text
   */
  function updateStatusText(element, statusKey) {
    const translation = getText(statusKey);
    if (translation !== null && element) {
      // For status badges that have icon + text structure
      const textSpan = element.querySelector('span:last-child') || element;
      if (textSpan !== element) {
        textSpan.textContent = translation;
      } else {
        element.textContent = translation;
      }
      element.setAttribute('data-i18n-status', statusKey);
    }
  }

  /**
   * Set language and apply translations
   */
  function setLanguage(lang) {
    console.log('i18n: Setting language to:', lang);
    
    if (!AVAILABLE_LANGS.includes(lang)) {
      console.warn('i18n: Unsupported language:', lang);
      return;
    }
    
    currentLang = lang;
    saveLanguage(lang);
    translatePage();
    updateSwitcherUI();
    
    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
    console.log('i18n: Language changed to:', lang);
  }

  /**
   * Get current language
   */
  function getCurrentLanguage() {
    return currentLang;
  }

  /**
   * Update language switcher UI
   */
  function updateSwitcherUI() {
    const toggleBtn = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    
    if (toggleBtn) {
      const flagSpan = toggleBtn.querySelector('.lang-flag');
      if (flagSpan) {
        flagSpan.textContent = LANG_NAMES[currentLang].flag;
      }
    }
    
    if (menu) {
      menu.querySelectorAll('.lang-option').forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        if (optionLang === currentLang) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
  }

  /**
   * Toggle dropdown visibility
   */
  function toggleDropdown() {
    const menu = document.getElementById('lang-menu');
    if (menu) {
      const isVisible = menu.style.display !== 'none';
      menu.style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Close dropdown
   */
  function closeDropdown() {
    const menu = document.getElementById('lang-menu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  /**
   * Handle language selection
   */
  function handleLanguageSelect(lang) {
    setLanguage(lang);
    closeDropdown();
  }

  /**
   * Initialize language switcher event listeners
   */
  function initLanguageSwitcher() {
    const toggleBtn = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    
    if (!toggleBtn || !menu) {
      console.warn('Language switcher elements not found');
      return;
    }
    
    // Toggle button click
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      toggleDropdown();
    });
    
    // Language option clicks
    menu.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        console.log('i18n: Language option clicked:', lang);
        if (lang) {
          handleLanguageSelect(lang);
        }
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  /**
   * Initialize i18n
   */
  function initI18n() {
    console.log('i18n: Initializing...');
    console.log('i18n: window.translations exists?', typeof window.translations !== 'undefined');
    
    // Determine initial language
    const savedLang = getSavedLanguage();
    const browserLang = getBrowserLanguage();
    currentLang = savedLang || browserLang || DEFAULT_LANG;
    console.log('i18n: Current language set to:', currentLang);
    
    // Save initial language if not already saved
    if (!savedLang) {
      saveLanguage(currentLang);
    }
    
    // Apply translations on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('i18n: DOM loaded, translating page...');
        translatePage();
        updateSwitcherUI();
        initLanguageSwitcher();
      });
    } else {
      console.log('i18n: DOM already loaded, translating now...');
      translatePage();
      updateSwitcherUI();
      initLanguageSwitcher();
    }
  }

  // Initialize immediately
  initI18n();

  // Expose public API
  window.i18n = {
    getText,
    getCurrentLanguage,
    setLanguage,
    translatePage,
    updateStatusText,
    AVAILABLE_LANGS,
    LANG_NAMES
  };

})();
