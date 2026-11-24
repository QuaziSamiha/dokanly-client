window.dataLayer = window.dataLayer || [];
function gtag(...args: unknown[]) {
  window.dataLayer?.push(args);
}
gtag("consent", "default", {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
});

export function onRouterTransitionStart(url: string) {
  window.dataLayer?.push({ event: "page_view", page_path: url });
}
