if (!customElements.get('promo-countdown')) {
  class PromoCountdown extends HTMLElement {
    constructor() {
      super();
      this.intervalId = null;
    }

    connectedCallback() {
      this.endDateStr = this.dataset.endDate;
      this.hideOnExpire = this.dataset.hideOnExpire === 'true';

      this.gridEl = this.querySelector('[data-timer-grid]');
      this.expiredEl = this.querySelector('[data-expired-text]');
      this.daysEl = this.querySelector('[data-days]');
      this.hoursEl = this.querySelector('[data-hours]');
      this.minutesEl = this.querySelector('[data-minutes]');
      this.secondsEl = this.querySelector('[data-seconds]');

      this.targetTimestamp = Date.parse(this.endDateStr);

      if (Number.isNaN(this.targetTimestamp)) {
        this.handleExpired();
        return;
      }

      this.updateTimer();
      this.intervalId = window.setInterval(() => this.updateTimer(), 1000);
    }

    disconnectedCallback() {
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    updateTimer() {
      const diffMs = this.targetTimestamp - Date.now();

      if (diffMs <= 0) {
        this.disconnectedCallback();
        this.handleExpired();
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      this.daysEl.textContent = String(days).padStart(2, '0');
      this.hoursEl.textContent = String(hours).padStart(2, '0');
      this.minutesEl.textContent = String(minutes).padStart(2, '0');
      this.secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    handleExpired() {
      const parentSection = this.closest('.promo-countdown');

      // Keep visible inside Shopify Theme Editor so merchants can still edit it
      if (this.hideOnExpire && !window.Shopify?.designMode && parentSection) {
        parentSection.hidden = true;
        return;
      }

      if (this.gridEl) this.gridEl.hidden = true;
      if (this.expiredEl) this.expiredEl.hidden = false;
    }
  }

  customElements.define('promo-countdown', PromoCountdown);
}