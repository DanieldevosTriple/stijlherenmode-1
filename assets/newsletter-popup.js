// assets/newsletter-popup.js

class NewsletterPopup {
    constructor() {
      this.overlay = document.querySelector('[data-popup-overlay]');
      this.closeBtn = document.querySelector('[data-popup-close]');
      this.form = document.querySelector('[data-popup-form]');
      this.mainContent = document.querySelector('[data-popup-main]');
      this.successContent = document.querySelector('[data-popup-success]');
      
      // Get settings from Shopify section
      this.settings = {
        showOn: this.overlay.dataset.showOn,
        delay: parseInt(this.overlay.dataset.delay, 10) * 1000,
        showOnce: this.overlay.dataset.showOnce === 'true',
        cookieName: this.overlay.dataset.cookieName,
        cookieDuration: parseInt(this.overlay.dataset.cookieDuration, 10),
        confirmationDuration: parseInt(this.overlay.dataset.confirmationDuration, 10) * 1000
      };
      
      this.init();
    }
    
    init() {
      if (!this.shouldShowPopup()) return;
      
      setTimeout(() => {
        this.show();
      }, this.settings.delay);
      
      this.closeBtn.addEventListener('click', () => this.hide());
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      });
      
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hide();
        }
      });
    }
    
    shouldShowPopup() {
      if (this.settings.showOn === 'homepage' && !document.body.classList.contains('template-index')) {
        return false;
      }
      
      if (this.settings.showOnce && this.getCookie(this.settings.cookieName)) {
        return false;
      }
      
      return true;
    }
    
    show() {
      this.overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    
    hide() {
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
      if (this.settings.showOnce) {
        this.setCookie();
      }
    }
    
    async handleSubmit(e) {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      
      try {
        // Add your newsletter subscription logic here
        // await fetch('/contact', { ... });
        
        this.showSuccess();
        this.setCookie();
        setTimeout(() => this.hide(), this.settings.confirmationDuration);
      } catch (error) {
        console.error('Newsletter subscription failed:', error);
      }
    }
    
    showSuccess() {
      this.mainContent.style.display = 'none';
      this.successContent.style.display = 'block';
    }
    
    setCookie() {
      const date = new Date();
      date.setTime(date.getTime() + (this.settings.cookieDuration * 24 * 60 * 60 * 1000));
      document.cookie = `${this.settings.cookieName}=true; expires=${date.toUTCString()}; path=/`;
    }
    
    getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
  }
  
  // Initialize popup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NewsletterPopup());
  } else {
    new NewsletterPopup();
  }