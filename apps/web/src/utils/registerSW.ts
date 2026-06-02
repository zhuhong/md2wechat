export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch((err) => console.warn('SW registration failed', err));
    });
  }
}
