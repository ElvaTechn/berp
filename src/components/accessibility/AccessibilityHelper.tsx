'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AccessibilityHelperProps {
  children: React.ReactNode;
}

export default function AccessibilityHelper({ children }: AccessibilityHelperProps) {
  const [mounted, setMounted] = useState(false);
  const [skipLink, setSkipLink] = useState(false);
  const pathname = usePathname();

  // Only render after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip navigation with Escape key
      if (e.key === 'Escape') {
        setSkipLink(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSkipLink(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [mounted]);

  // Announce page changes to screen readers
  useEffect(() => {
    if (!mounted) return;

    const pageName = pathname.split('/').pop() || 'Dashboard';
    const announcement = `Navegou para ${pageName}`;
    
    // Create announcement for screen readers
    const announcementElement = document.createElement('div');
    announcementElement.setAttribute('aria-live', 'polite');
    announcementElement.setAttribute('aria-atomic', 'true');
    announcementElement.className = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';
    announcementElement.textContent = announcement;
    
    document.body.appendChild(announcementElement);
    
    // Remove announcement after delay
    const timeout = setTimeout(() => {
      if (document.body.contains(announcementElement)) {
        document.body.removeChild(announcementElement);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pathname, mounted]);

  // Add skip to main content link
  const skipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.querySelector('main, [role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't render interactive elements until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        onClick={skipToMain}
        className={`
          sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
          bg-blue-600 text-white p-2 rounded-md z-[100]
          transition-opacity duration-200
          ${skipLink ? 'opacity-0' : 'opacity-100'}
        `}
        tabIndex={skipLink ? -1 : 0}
      >
        Pular para conteúdo principal
      </a>

      {/* High contrast mode toggle - Hidden by default */}
      <button
        onClick={() => document.documentElement.classList.toggle('high-contrast')}
        className="hidden fixed top-4 right-4 z-[100] bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-md hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        aria-label="Alternar modo de alto contraste"
        title="Alto contraste"
      >
        <span className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
          Contraste alto
        </span>
        <span aria-hidden="true">🌓</span>
      </button>

      {children}
    </>
  );
}
