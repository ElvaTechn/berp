// Type definitions for PWA functionality

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    beforeinstallprompt: PWAInstallPrompt;
  }
}

export { PWAInstallPrompt };