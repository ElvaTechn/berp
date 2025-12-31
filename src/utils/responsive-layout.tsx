// Utilitários para responsividade consistente em todas as páginas
// Aplica wrappers de scroll horizontal e spacing mobile automaticamente

export function withMobileScroll(children: React.ReactNode, isMobile: boolean, hasManyItems = false) {
  const itemCount = Array.isArray(children) ? children.length : 0;
  const needsScroll = isMobile && (hasManyItems || itemCount > 3);

  return (
    <>
      {needsScroll && (
        <div className="flex justify-center mb-2 px-4">
          <span className="neu-text-caption text-[var(--neu-text-muted)] text-sm">
            ← Deslize para mais →
          </span>
        </div>
      )}
      <div className={isMobile ? `-mx-4 sm:mx-0 overflow-x-auto scrollbar-hide` : ''}>
        {children}
      </div>
      {isMobile && <div className="px-4"></div>}
    </>
  );
}
