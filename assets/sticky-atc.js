if (!customElements.get('sticky-atc')) {
  class StickyAtc extends HTMLElement {
    constructor() {
      super();
      this.observer = null;
      this.mutationObserver = null;
      this.onStickyClick = this.handleStickyClick.bind(this);
      this.onVariantChange = this.syncProductState.bind(this);
    }

    connectedCallback() {
      this.mainSubmitBtn = document.querySelector('product-form .product-form__submit');
      this.stickyBtn = this.querySelector('[data-sticky-submit]');
      this.stickyPrice = this.querySelector('[data-sticky-price]');
      this.defaultLabel = this.stickyBtn?.textContent.trim() || 'Add to cart';

      if (!this.mainSubmitBtn || !this.stickyBtn) return;

      this.stickyBtn.addEventListener('click', this.onStickyClick);

      // Show bar only after the shopper scrolls past the main Add to Cart button
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          this.classList.toggle('is-visible', scrolledPast);
          this.setAttribute('aria-hidden', String(!scrolledPast));
        },
        { threshold: 0 }
      );
      this.observer.observe(this.mainSubmitBtn);

      // Mirror disabled/sold-out state when Dawn updates the main button
      this.mutationObserver = new MutationObserver(() => this.syncProductState());
      this.mutationObserver.observe(this.mainSubmitBtn, {
        attributes: true,
        attributeFilter: ['disabled'],
        childList: true,
        subtree: true,
      });

      // Listen for Dawn variant picker changes to keep price updated
      this.variantPicker = document.querySelector('variant-selects, variant-radios');
      if (this.variantPicker) {
        this.variantPicker.addEventListener('change', this.onVariantChange);
      }
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.mutationObserver?.disconnect();
      this.stickyBtn?.removeEventListener('click', this.onStickyClick);
      this.variantPicker?.removeEventListener('change', this.onVariantChange);
    }

    handleStickyClick() {
      if (!this.mainSubmitBtn || this.mainSubmitBtn.disabled) return;
      this.mainSubmitBtn.click();
    }

    syncProductState() {
      if (!this.mainSubmitBtn || !this.stickyBtn) return;

      const isDisabled = this.mainSubmitBtn.disabled;
      this.stickyBtn.disabled = isDisabled;

      const mainLabel = this.mainSubmitBtn.querySelector('span')?.textContent.trim();
      if (isDisabled && mainLabel) {
        this.stickyBtn.textContent = mainLabel;
      } else {
        this.stickyBtn.textContent = this.defaultLabel;
      }

      // Sync visible price after Dawn finishes swapping the variant DOM
      window.setTimeout(() => {
        const activePrice =
          document.querySelector('.product__info-wrapper .price--on-sale .price-item--sale') ||
          document.querySelector('.product__info-wrapper .price-item--regular');

        if (activePrice && this.stickyPrice) {
          this.stickyPrice.textContent = activePrice.textContent.trim();
        }
      }, 250);
    }
  }

  customElements.define('sticky-atc', StickyAtc);
}