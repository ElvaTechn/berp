Plano Completo de Refatoração Visual para Neumorphism
Excelente! Agora tenho uma visão completa do seu ERP. É um sistema robusto com mais de 20 páginas, 50+ componentes reutilizáveis e um design system bem estruturado. Vou criar um plano detalhado para transformar essa interface minimalista atual no estilo Neumorphism que você deseja.

1. Fundamentos do Novo Design System Neumorphism
1.1 Conceito e Filosofia Visual
O Neumorphism (New Skeuomorphism) cria uma ilusão de elementos físicos moldados no material da interface, diferente do design flat atual que utiliza linhas, bordas e sombras simples. A filosofia central é fazer com que os elementos pareçam extrudados da superfície ou pressionados para dentro dela, criando uma experiência tátil e dimensional. Para o seu ERP, isso significa transformar cards, botões, inputs e tabelas em elementos que parecem feitos de um material único, seja ele um plástico macio ou uma superfície de silicone. A luz sempre virá do canto superior esquerdo, criando sombras consistentes que definem a profundidade de cada elemento.

1.2 Princípios de Design Adaptados para ERP
O Neumorphism puro pode apresentar problemas de acessibilidade, especialmente em interfaces de produtividade como ERPs onde usuários passam longas horas. Por isso, vou adaptar o estilo mantendo a estética Neumorphic mas garantindo contraste adequado para textos e estados ativos. A abordagem será um "Neumorphism Suave" que preserva a dimensão e as sombras características, mas utiliza cores mais saturadas para textos principais e ícones, garantindo legibilidade. O fundo não será completamente uniforme, haverá variação sutil entre áreas de conteúdo e áreas de navegação para criar hierarquia visual sem recorrer a bordas duras.

2. Tokens de Design System Neumorphism
2.1 Sistema de Cores
css
/* src/app/globals.css - NEUMORPHISM DESIGN SYSTEM */

/* ============================================
   NEUMORPHISM COLOR TOKENS
   ============================================ */

/* Light Mode Base Colors */
:root {
  /* Neumorphic Base - Off-white/Cream */
  --neu-base: #E8ECEF;
  --neu-base-light: #F5F8FA;
  --neu-base-dark: #D8DCE2;
  
  /* Surface Colors (same as base for neumorphic effect) */
  --neu-surface: #E8ECEF;
  --neu-surface-hover: #EEF2F5;
  --neu-surface-active: #E2E7EB;
  
  /* Text Colors (high contrast for accessibility) */
  --neu-text-primary: #1A1D21;
  --neu-text-secondary: #4A5058;
  --neu-text-muted: #7A8088;
  --neu-text-disabled: #A8ACB4;
  
  /* Accent Colors (Coral maintained for brand) */
  --neu-accent: #EF4444;
  --neu-accent-light: #F87171;
  --neu-accent-dark: #DC2626;
  --neu-accent-hover: #FEE2E2;
  
  /* Status Colors */
  --neu-success: #10B981;
  --neu-success-light: #D1FAE5;
  --neu-warning: #F59E0B;
  --neu-warning-light: #FEF3C7;
  --neu-error: #EF4444;
  --neu-error-light: #FEE2E2;
  --neu-info: #3B82F6;
  --neu-info-light: #DBEAFE;
  
  /* Shadow Colors */
  --neu-shadow-light: #FFFFFF;
  --neu-shadow-dark: #C4C9D0;
  
  /* Borders (subtle for neumorphism) */
  --neu-border: #D1D5DB;
  --neu-border-light: #E5E7EB;
}

/* Dark Mode Base Colors */
.dark {
  /* Neumorphic Base - Dark Gray */
  --neu-base: #2A2D33;
  --neu-base-light: #35393F;
  --neu-base-dark: #1E2126;
  
  /* Surface Colors */
  --neu-surface: #2A2D33;
  --neu-surface-hover: #32363C;
  --neu-surface-active: #25282D;
  
  /* Text Colors */
  --neu-text-primary: #F3F4F6;
  --neu-text-secondary: #D1D5DB;
  --neu-text-muted: #9CA3AF;
  --neu-text-disabled: #6B7280;
  
  /* Accent Colors (slightly lighter for dark mode) */
  --neu-accent: #F87171;
  --neu-accent-light: #FCA5A5;
  --neu-accent-dark: #EF4444;
  --neu-accent-hover: #3F1619;
  
  /* Status Colors (lighter for dark mode) */
  --neu-success: #34D399;
  --neu-success-light: #064E3B;
  --neu-warning: #FBBF24;
  --neu-warning-light: #78350F;
  --neu-error: #F87171;
  --neu-error-light: #7F1D1D;
  --neu-info: #60A5FA;
  --neu-info-light: #1E3A5F;
  
  /* Shadow Colors */
  --neu-shadow-light: #3F444C;
  --neu-shadow-dark: #15181C;
  
  /* Borders */
  --neu-border: #404550;
  --neu-border-light: #4A505C;
}
2.2 Sistema de Sombras Neumorphic
css
/* ============================================
   NEUMORPHISM SHADOW SYSTEM
   ============================================ */

/* Light Mode Shadows */
:root {
  /* Convex (extruded) - Elements that pop out */
  --neu-shadow-convex-sm: 
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
    
  --neu-shadow-convex-md: 
    4px 4px 8px var(--neu-shadow-dark),
    -4px -4px 8px var(--neu-shadow-light);
    
  --neu-shadow-convex-lg: 
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
    
  /* Concave (pressed in) - Elements that are recessed */
  --neu-shadow-concave-sm: 
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
    
  --neu-shadow-concave-md: 
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
    
  --neu-shadow-concave-lg: 
    inset 8px 8px 16px var(--neu-shadow-dark),
    inset -8px -8px 16px var(--neu-shadow-light);
    
  /* Flat (no depth - for text, icons) */
  --neu-shadow-flat: none;
}

/* Dark Mode Shadows */
.dark {
  --neu-shadow-convex-sm: 
    2px 2px 4px var(--neu-shadow-dark),
    -2px -2px 4px var(--neu-shadow-light);
    
  --neu-shadow-convex-md: 
    4px 4px 8px var(--neu-shadow-dark),
    -4px -4px 8px var(--neu-shadow-light);
    
  --neu-shadow-convex-lg: 
    8px 8px 16px var(--neu-shadow-dark),
    -8px -8px 16px var(--neu-shadow-light);
    
  --neu-shadow-concave-sm: 
    inset 2px 2px 4px var(--neu-shadow-dark),
    inset -2px -2px 4px var(--neu-shadow-light);
    
  --neu-shadow-concave-md: 
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
    
  --neu-shadow-concave-lg: 
    inset 8px 8px 16px var(--neu-shadow-dark),
    inset -8px -8px 16px var(--neu-shadow-light);
}
2.3 Tipografia Adaptada
css
/* ============================================
   NEUMORPHISM TYPOGRAPHY SYSTEM
   ============================================ */

/* Font Stack (Enhanced) */
:root {
  --neu-font: 'Inter', system-ui, -apple-system, sans-serif;
  --neu-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Smoothing */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Text Hierarchy */
.neu-text-display {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--neu-text-primary);
}

.neu-text-h1 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--neu-text-primary);
}

.neu-text-h2 {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  line-height: 1.3;
  color: var(--neu-text-primary);
}

.neu-text-h3 {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--neu-text-primary);
}

.neu-text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--neu-text-secondary);
}

.neu-text-caption {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--neu-text-muted);
}

.neu-text-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--neu-text-muted);
}
3. Especificações de Componentes Neumorphic
3.1 Cards Neumorphic
tsx
// src/components/ui/NeuCard.tsx

import { cn } from '@/lib/utils';

interface NeuCardProps {
  variant?: 'convex' | 'concave' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NeuCard({ 
  variant = 'convex', 
  size = 'md', 
  children, 
  className,
  onClick 
}: NeuCardProps) {
  const sizeClasses = {
    sm: 'p-3 rounded-xl',
    md: 'p-5 rounded-2xl',
    lg: 'p-7 rounded-3xl'
  };
  
  const shadowClasses = {
    convex: 'bg-[var(--neu-surface)] shadow-[var(--neu-shadow-convex-md)]',
    concave: 'bg-[var(--neu-surface)] shadow-[var(--neu-shadow-concave-md)]',
    flat: 'bg-[var(--neu-surface)]'
  };
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'transition-all duration-200',
        'hover:shadow-[var(--neu-shadow-convex-lg)]',
        'active:shadow-[var(--neu-shadow-concave-sm)]',
        sizeClasses[size],
        shadowClasses[variant],
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

// src/components/ui/NeuCardHeader.tsx
export function NeuCardHeader({ 
  title, 
  subtitle,
  action 
}: { 
  title: string; 
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="neu-text-h3">{title}</h3>
        {subtitle && (
          <p className="neu-text-caption mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
3.2 Botões Neumorphic
tsx
// src/components/ui/NeuButton.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        convex: `
          bg-[var(--neu-surface)]
          shadow-[var(--neu-shadow-convex-sm)]
          hover:shadow-[var(--neu-shadow-convex-md)]
          active:shadow-[var(--neu-shadow-concave-sm)]
          hover:-translate-y-0.5
          active:translate-y-0
        `,
        concave: `
          bg-[var(--neu-surface)]
          shadow-[var(--neu-shadow-concave-sm)]
          active:shadow-[var(--neu-shadow-concave-md)]
        `,
        accent: `
          bg-[var(--neu-accent)]
          text-white
          shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]
          hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]
          active:shadow-[2px_2px_4px_var(--neu-shadow-dark),-2px_-2px_4px_var(--neu-shadow-light)]
          hover:-translate-y-0.5
        `,
        ghost: `
          bg-transparent
          shadow-none
          hover:bg-[var(--neu-surface-hover)]
        `,
      },
      size: {
        sm: 'h-8 px-3 rounded-lg text-sm',
        md: 'h-10 px-5 rounded-xl text-sm',
        lg: 'h-12 px-7 rounded-2xl text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'convex',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const NeuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
NeuButton.displayName = 'NeuButton';
3.3 Inputs Neumorphic
tsx
// src/components/ui/NeuInput.tsx

import { cn } from '@/lib/utils';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="neu-text-label mb-1.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              'w-full bg-[var(--neu-surface)]',
              'shadow-[var(--neu-shadow-concave-sm)]',
              'rounded-xl px-4 py-3',
              // Text styles
              'neu-text-body',
              // Focus styles
              'focus:outline-none',
              'focus:shadow-[var(--neu-shadow-concave-md)]',
              'focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2 focus:ring-offset-transparent',
              // Error styles
              error && 'ring-2 ring-[var(--neu-error)]',
              // Disabled styles
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Icon padding
              icon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="neu-text-caption mt-1 text-[var(--neu-error)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';
3.4 Badges e Status Indicators
tsx
// src/components/ui/NeuBadge.tsx

import { cn } from '@/lib/utils';

interface NeuBadgeProps {
  variant?: 'convex' | 'concave' | 'flat';
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function NeuBadge({ 
  variant = 'convex', 
  status = 'default',
  children, 
  className 
}: NeuBadgeProps) {
  const statusColors = {
    success: {
      bg: 'bg-[var(--neu-success-light)]',
      text: 'text-[var(--neu-success)]',
    },
    warning: {
      bg: 'bg-[var(--neu-warning-light)]',
      text: 'text-[var(--neu-warning)]',
    },
    error: {
      bg: 'bg-[var(--neu-error-light)]',
      text: 'text-[var(--neu-error)]',
    },
    info: {
      bg: 'bg-[var(--neu-info-light)]',
      text: 'text-[var(--neu-info)]',
    },
    default: {
      bg: 'bg-[var(--neu-surface)]',
      text: 'text-[var(--neu-text-secondary)]',
    },
  };
  
  const shadowStyles = {
    convex: 'shadow-[var(--neu-shadow-convex-sm)]',
    concave: 'shadow-[var(--neu-shadow-concave-sm)]',
    flat: '',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full',
        'neu-text-label font-medium',
        statusColors[status].bg,
        statusColors[status].text,
        shadowStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
4. Componentes Específicos do ERP
4.1 KPI Cards do Dashboard
tsx
// src/components/dashboard/NeuKPICard.tsx

import { LucideIcon } from 'lucide-react';
import { NeuCard } from '@/components/ui/NeuCard';

interface NeuKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color?: 'default' | 'accent' | 'success' | 'warning';
}

export function NeuKPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color = 'default' 
}: NeuKPICardProps) {
  const colorClasses = {
    default: 'text-[var(--neu-text-primary)]',
    accent: 'text-[var(--neu-accent)]',
    success: 'text-[var(--neu-success)]',
    warning: 'text-[var(--neu-warning)]',
  };
  
  return (
    <NeuCard variant="convex" size="md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="neu-text-caption font-medium uppercase tracking-wide">
            {title}
          </span>
          <span className="neu-text-h1 mt-2 font-bold tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="neu-text-caption mt-1">
              {subtitle}
            </span>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-[var(--neu-success)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--neu-error)]" />
              )}
              <span className={cn(
                'neu-text-caption font-medium',
                trend.isPositive ? 'text-[var(--neu-success)]' : 'text-[var(--neu-error)]'
              )}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          'bg-[var(--neu-surface)]',
          'shadow-[var(--neu-shadow-convex-sm)]'
        )}>
          <Icon className={cn('w-6 h-6', colorClasses[color])} />
        </div>
      </div>
    </NeuCard>
  );
}
4.2 Tabelas Neumorphic
tsx
// src/components/ui/NeuTable.tsx

interface NeuTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function NeuTable({ headers, children, className }: NeuTableProps) {
  return (
    <div className={cn(
      'overflow-hidden rounded-2xl',
      'bg-[var(--neu-surface)]',
      'shadow-[var(--neu-shadow-concave-md)]'
    )}>
      <table className={cn('w-full', className)}>
        <thead>
          <tr className="border-b border-[var(--neu-border)]">
            {headers.map((header, index) => (
              <th
                key={index}
                className="neu-text-label font-semibold px-6 py-4 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--neu-border-light)]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function NeuTableRow({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr 
      className={cn(
        'transition-all duration-150',
        'hover:bg-[var(--neu-surface-hover)]',
        'active:bg-[var(--neu-surface-active)]',
        onClick && 'cursor-pointer',
        onClick && 'hover:shadow-[var(--neu-shadow-convex-sm)]'
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function NeuTableCell({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-6 py-4 neu-text-body', className)}>
      {children}
    </td>
  );
}
4.3 Sidebar Neumorphic
tsx
// src/components/layout/NeuSidebar.tsx

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

interface NeuSidebarProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (href: string) => void;
}

export function NeuSidebar({ items, activeItem, onItemClick }: NeuSidebarProps) {
  return (
    <aside className={cn(
      'w-64 min-h-screen p-4',
      'bg-[var(--neu-base)]',
      'border-r border-[var(--neu-border)]'
    )}>
      {/* Logo Area */}
      <div className="mb-8 px-2">
        <div className={cn(
          'h-12 rounded-xl',
          'bg-[var(--neu-surface)]',
          'shadow-[var(--neu-shadow-convex-md)]',
          'flex items-center justify-center'
        )}>
          <span className="neu-text-h3 font-bold text-[var(--neu-accent)]">
            BERP
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = activeItem === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => onItemClick(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                'transition-all duration-200',
                isActive
                  ? 'bg-[var(--neu-surface)] shadow-[var(--neu-shadow-concave-sm)]'
                  : 'hover:bg-[var(--neu-surface-hover)]',
                isActive ? 'text-[var(--neu-accent)]' : 'text-[var(--neu-text-secondary)]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="neu-text-body font-medium">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'ml-auto px-2 py-0.5 rounded-full text-xs font-bold',
                  'bg-[var(--neu-accent)] text-white'
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
5. Plano de Implementação por Fases
Fase 1: Fundamentos do Design System
Objetivo: Configurar as bases do Neumorphism no globals.css e criar componentes primários.

Entregáveis:

Atualização completa do src/app/globals.css com tokens Neumorphic
Criação dos componentes base: NeuCard, NeuButton, NeuInput, NeuBadge
Criação de utilitários CSS para sombras e estados
Documentação de uso dos novos componentes
Arquivos a modificar/criar:

src/app/globals.css - Substituir sistema de cores e sombras
src/components/ui/NeuCard.tsx - Novo componente
src/components/ui/NeuButton.tsx - Novo componente
src/components/ui/NeuInput.tsx - Novo componente
src/components/ui/NeuBadge.tsx - Novo componente
src/components/ui/NeuTable.tsx - Novo componente
Tempo estimado: 2-3 dias

Fase 2: Layout e Navegação
Objetivo: Transformar sidebar, header e layout principal.

Entregáveis:

NeuSidebar com efeito Neumorphic
NeuHeader com controles de tema e perfil
ClientLayout atualizado
Transições suaves entre páginas
Componentes a modificar:

src/components/layout/Sidebar.tsx
src/components/layout/ClientLayout.tsx
src/components/theme-toggle.tsx
Tempo estimado: 1-2 dias

Fase 3: Dashboard e Métricas
Objetivo: Transformar componentes do dashboard em Neumorphic.

Entregáveis:

NeuKPICard com cards convexos
NeuTrendChart com container Neumorphic
NeuPaymentDistribution com container Neumorphic
NeuTopProductsRanking com lista Neumorphic
Skeleton loaders Neumorphic
Componentes a criar/modificar:

src/components/dashboard/NeuKPICard.tsx
src/components/dashboard/NeuTrendChart.tsx
src/components/dashboard/NeuDashboardSkeleton.tsx
Atualizar DashboardSkeleton.tsx
Tempo estimado: 2 dias

Fase 4: Tabelas e Lists
Objetivo: Transformar todas as tabelas e listas do sistema.

Entregáveis:

NeuTable com design concave
NeuTableRow com estados hover
Aplicação em todas as tabelas existentes:
ProductTable
EmployeeTable
SalesTable
CompaniesTable
AuditTable
ReservationsTable
Componentes a modificar:

src/components/employees/EmployeeTable.tsx
src/components/inventory/ProductTable.tsx
src/app/sales/page.tsx (SalesTable)
src/app/admin/page.tsx (CompaniesTable)
src/app/admin/audit/page.tsx (AuditTable)
src/app/reservations/page.tsx (ReservationsTable)
Tempo estimado: 2-3 dias

Fase 5: Formulários e Modais
Objetivo: Transformar todos os inputs, selects e modais.

Entregáveis:

Inputs Neumorphic com efeito concave
Selects Neumorphic
Modais Neumorphic com overlay
Checkboxes e switches Neumorphic
Date pickers Neumorphic
Componentes a criar/modificar:

src/components/ui/NeuSelect.tsx
src/components/ui/NeuCheckbox.tsx
src/components/ui/NeuSwitch.tsx
src/components/ui/NeuModal.tsx
Atualizar todos os modais existentes:
AddEmployeeModal
EditEmployeeModal
AddProductModal
EditProductModal
AddReservationModal
Tempo estimado: 2-3 dias

Fase 6: POS e Interface Transacional
Objetivo: Transformar a interface do ponto de venda.

Entregáveis:

Product cards Neumorphic no grid
Cart sidebar Neumorphic
Botão de finalização Neumorphic
Payment method selector Neumorphic
Componentes a modificar:

src/app/sales/pos/page.tsx
Criar src/components/pos/NeuProductCard.tsx
Criar src/components/pos/NeuCartItem.tsx
Tempo estimado: 1-2 dias

Fase 7: Páginas Admin e Sistema
Objetivo: Transformar páginas de administração.

Entregáveis:

Cards de estatísticas Neumorphic
Backup controls Neumorphic
System settings Neumorphic
Subscription management Neumorphic
Componentes a modificar:

src/app/admin/page.tsx
src/app/admin/backup/page.tsx
src/app/admin/system/page.tsx
src/app/admin/subscriptions/page.tsx
Tempo estimado: 1-2 dias

Fase 8: Ajustes Finais e Acessibilidade
Objetivo: Refinar, testar acessibilidade e polish final.

Entregáveis:

Teste de contraste e acessibilidade (WCAG)
Animações refinadas com Framer Motion
Estados de loading e empty states
Documentação final