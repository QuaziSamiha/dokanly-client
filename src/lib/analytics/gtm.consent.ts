type ConsentState = "granted" | "denied";

const CONSENT_STORAGE_KEY = "cookie-consent";

export function updateConsent(state: ConsentState): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  }]);
  localStorage.setItem(CONSENT_STORAGE_KEY, state);
}

export function getStoredConsent(): ConsentState | null {
  return localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentState | null;
}
