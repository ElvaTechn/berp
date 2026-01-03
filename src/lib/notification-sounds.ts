/**
 * ================================================================
 * NOTIFICATION SOUNDS - BIZCONTROL 360 ERP
 * ================================================================
 * Beep synthesized sounds for notifications (no audio files needed)
 * ================================================================
 */

// Web Audio API context
let audioContext: AudioContext | null = null;

// Initialize audio context (lazy)
function getAudioContext(): AudioContext {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext!;
}

/**
 * Play a beep sound with specified frequency and duration
 * @param frequency - Frequency in Hz (default: 800)
 * @param duration - Duration in ms (default: 100)
 * @param volume - Volume 0-1 (default: 0.3)
 */
export function playBeep(frequency = 800, duration = 100, volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
}

/**
 * Notification sound presets
 */
export const NotificationSounds = {
  /** Success sound (high pleasant beep) */
  success: () => {
    playBeep(1000, 100, 0.2); // High frequency, short
    setTimeout(() => playBeep(1200, 80, 0.15), 100); // Even higher
  },

  /** Error sound (low alert beep) */
  error: () => {
    playBeep(400, 150, 0.3); // Low frequency, longer
    setTimeout(() => playBeep(350, 150, 0.25), 150); // Even lower
  },

  /** Warning sound (medium beep) */
  warning: () => {
    playBeep(600, 120, 0.25); // Medium frequency
  },

  /** Info sound (neutral beep) */
  info: () => {
    playBeep(700, 80, 0.2); // Neutral tone
  },

  /** Sale completed (double beep) */
  saleComplete: () => {
    playBeep(800, 100, 0.25);
    setTimeout(() => playBeep(1000, 100, 0.2), 150);
  },

  /** Item added to cart (quick beep) */
  itemAdded: () => {
    playBeep(900, 50, 0.15); // Very short
  },

  /** Button click (subtle beep) */
  click: () => {
    playBeep(1000, 30, 0.1); // Very short and quiet
  },
};

/**
 * Play notification sound with haptic feedback
 * @param type - Type of notification
 * @param enableSound - Whether to play sound (default: true)
 * @param enableHaptic - Whether to vibrate (default: true)
 */
export function playNotification(
  type: keyof typeof NotificationSounds,
  enableSound = true,
  enableHaptic = true
) {
  // Play sound
  if (enableSound) {
    NotificationSounds[type]();
  }

  // Play haptic feedback
  if (enableHaptic && 'vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      success: [50, 50, 50],
      error: [100, 50, 100],
      warning: 75,
      info: 50,
      saleComplete: [50, 100, 100],
      itemAdded: 30,
      click: 10,
    };
    navigator.vibrate(patterns[type] || 50);
  }
}

/**
 * Resume audio context (needed after user interaction on some browsers)
 */
export function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}
