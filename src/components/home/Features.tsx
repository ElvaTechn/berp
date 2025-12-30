/**
 * ================================================================
 * FEATURES SECTION - BIZ360 ERP
 * ================================================================
 * Grid de funcionalidades do sistema
 * ================================================================
 */

import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield 
} from 'lucide-react';
import { GlassCard } from './GlassCard';

const features = [
  {
    icon: ShoppingCart,
    title: 'Ponto de Venda',
    description: 'Sistema POS completo com interface rápida e intuitiva. Controle vendas, emita recibos e gerencie pagamentos em tempo real.',
    color: 'text-orange-500'
  },
  {
    icon: Package,
    title: 'Gestão de Estoque',
    description: 'Controle total do inventário com alertas automáticos, rastreamento de produtos e gestão de fornecedores.',
    color: 'text-blue-500'
  },
  {
    icon: DollarSign,
    title: 'Financeiro',
    description: 'Controle de fluxo de caixa, contas a pagar e receber, conciliação bancária e relatórios financeiros detalhados.',
    color: 'text-green-500'
  },
  {
    icon: Users,
    title: 'Recursos Humanos',
    description: 'Gestão completa de funcionários, folha de pagamento, controle de ponto e gestão de benefícios.',
    color: 'text-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Relatórios e Analytics',
    description: 'Dashboards interativos, relatórios personalizáveis e análises em tempo real para tomada de decisões estratégicas.',
    color: 'text-pink-500'
  },
  {
    icon: Shield,
    title: 'Segurança Enterprise',
    description: 'Criptografia ponta-a-ponta, backup automático, controle de acesso por níveis e conformidade com LGPD.',
    color: 'text-yellow-500'
  }
];

export function Features() {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Tudo que Sua Empresa
            <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Precisa em Um Só Lugar
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mt-6">
            Sistema completo para gestão empresarial com módulos integrados e interface moderna
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              variant="medium"
              hover
              className="group"
              animate
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`mb-6 inline-flex p-4 rounded-2xl bg-white/5 ${feature.color} transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10`}>
                <feature.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 group-hover:text-orange-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-6 flex items-center gap-2 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Saiba mais</span>
                <svg className="w-4 h-4 transform translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
