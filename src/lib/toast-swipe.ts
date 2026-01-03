/**
 * ================================================================
 * TOAST SWIPE-TO-DISMISS - BIZCONTROL 360 ERP
 * ================================================================
 * Custom swipe gesture handler for dismissing toasts
 * Usage: Add to toast container or individual toasts
 * ================================================================
 */

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
}

/**
 * Add swipe-to-dismiss to a toast element
 * @param element - Toast HTMLElement
 * @param onDismiss - Callback when swiped
 * @param threshold - Swipe distance threshold in px (default: 100)
 */
export function enableSwipeToDismiss(
  element: HTMLElement,
  onDismiss: () => void,
  threshold = 100
) {
  const state: SwipeState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
  };

  const handleStart = (clientX: number, clientY: number) => {
    state.startX = clientX;
    state.startY = clientY;
    state.currentX = clientX;
    state.isDragging = true;
    element.style.transition = 'none';
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!state.isDragging) return;

    const deltaX = clientX - state.startX;
    const deltaY = clientY - state.startY;

    // Only horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      state.currentX = clientX;
      element.style.transform = `translateX(${deltaX}px)`;
      element.style.opacity = String(1 - Math.abs(deltaX) / threshold);
    }
  };

  const handleEnd = () => {
    if (!state.isDragging) return;

    const deltaX = state.currentX - state.startX;
    element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    if (Math.abs(deltaX) > threshold) {
      // Dismiss
      element.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
      element.style.opacity = '0';
      setTimeout(onDismiss, 300);
    } else {
      // Reset
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }

    state.isDragging = false;
  };

  // Touch events
  element.addEventListener('touchstart', (e) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  });

  element.addEventListener('touchmove', (e) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  });

  element.addEventListener('touchend', handleEnd);

  // Mouse events (for testing on desktop)
  element.addEventListener('mousedown', (e) => {
    handleStart(e.clientX, e.clientY);
  });

  element.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  element.addEventListener('mouseup', handleEnd);
  element.addEventListener('mouseleave', handleEnd);

  // Cleanup
  return () => {
    element.removeEventListener('touchstart', handleStart as any);
    element.removeEventListener('touchmove', handleMove as any);
    element.removeEventListener('touchend', handleEnd);
    element.removeEventListener('mousedown', handleStart as any);
    element.removeEventListener('mousemove', handleMove as any);
    element.removeEventListener('mouseup', handleEnd);
    element.removeEventListener('mouseleave', handleEnd);
  };
}
