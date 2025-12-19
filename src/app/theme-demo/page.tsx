import { ThemeToggle } from '@/components/theme-toggle';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

/**
 * Página de Demonstração do Dual Theme System
 * Mostra todos os componentes com Light & Dark Mode
 */
export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0a0a0a]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic">
              🌓 Dual Theme System
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Light High-Tech & Dark Maximalist
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        
        {/* Section: Cards com Sombras Coloridas */}
        <section>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 italic">
            📦 Cards com Sombras Coloridas
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No <strong>Light Mode</strong>, os cards têm sombras coloridas vibrantes. 
            No <strong>Dark Mode</strong>, mantêm o estilo espacial com bordas sutis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card Blue */}
            <div className="card card-blue hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Faturação Total
                </h3>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                125.000
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                MZN este mês
              </p>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  +12%
                </span>
                <span className="text-slate-500 dark:text-slate-500 text-xs">
                  vs. anterior
                </span>
              </div>
            </div>

            {/* Card Purple */}
            <div className="card card-purple hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Produtos
                </h3>
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                1,245
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                itens em stock
              </p>
              <div className="flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                  -3%
                </span>
                <span className="text-slate-500 dark:text-slate-500 text-xs">
                  vs. anterior
                </span>
              </div>
            </div>

            {/* Card Green */}
            <div className="card card-green hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Clientes
                </h3>
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                892
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                clientes ativos
              </p>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  +24%
                </span>
                <span className="text-slate-500 dark:text-slate-500 text-xs">
                  vs. anterior
                </span>
              </div>
            </div>

            {/* Card Orange */}
            <div className="card card-orange hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Crescimento
                </h3>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                +47%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                este trimestre
              </p>
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  +8%
                </span>
                <span className="text-slate-500 dark:text-slate-500 text-xs">
                  vs. anterior
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Botões */}
        <section>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 italic">
            🔘 Botões Adaptativos
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="
              bg-gradient-to-r from-blue-600 to-indigo-600 
              hover:from-blue-700 hover:to-indigo-700
              text-white font-bold px-6 py-3 rounded-xl
              shadow-lg shadow-blue-500/30
              hover:scale-105 transition-all duration-300
            ">
              Primary Button
            </button>

            <button className="
              bg-slate-100 dark:bg-white/10 
              hover:bg-slate-200 dark:hover:bg-white/20
              text-slate-900 dark:text-white
              font-bold px-6 py-3 rounded-xl
              border border-slate-300 dark:border-white/10
              hover:scale-105 transition-all duration-300
            ">
              Secondary Button
            </button>

            <button className="
              bg-transparent 
              hover:bg-slate-100 dark:hover:bg-white/5
              text-slate-900 dark:text-white
              font-bold px-6 py-3 rounded-xl
              border-2 border-slate-300 dark:border-white/20
              hover:scale-105 transition-all duration-300
            ">
              Outline Button
            </button>

            <button className="
              bg-gradient-to-r from-red-600 to-pink-600
              hover:from-red-700 hover:to-pink-700
              text-white font-bold px-6 py-3 rounded-xl
              shadow-lg shadow-red-500/30
              hover:scale-105 transition-all duration-300
            ">
              Danger Button
            </button>
          </div>
        </section>

        {/* Section: Badges */}
        <section>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 italic">
            🏷️ Badges de Status
          </h2>
          <div className="flex flex-wrap gap-3">
            <span className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-green-100 dark:bg-green-500/20
              text-green-700 dark:text-green-400
              border border-green-200 dark:border-green-500/30
              flex items-center gap-2
            ">
              <CheckCircle className="w-4 h-4" />
              Ativo
            </span>

            <span className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-orange-100 dark:bg-orange-500/20
              text-orange-700 dark:text-orange-400
              border border-orange-200 dark:border-orange-500/30
              flex items-center gap-2
            ">
              <Clock className="w-4 h-4" />
              Pendente
            </span>

            <span className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-red-100 dark:bg-red-500/20
              text-red-700 dark:text-red-400
              border border-red-200 dark:border-red-500/30
              flex items-center gap-2
            ">
              <AlertCircle className="w-4 h-4" />
              Inativo
            </span>

            <span className="
              px-4 py-2 rounded-full text-sm font-bold
              bg-blue-100 dark:bg-blue-500/20
              text-blue-700 dark:text-blue-400
              border border-blue-200 dark:border-blue-500/30
              flex items-center gap-2
            ">
              <Star className="w-4 h-4" />
              Premium
            </span>
          </div>
        </section>

        {/* Section: Forms */}
        <section>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 italic">
            📝 Formulários
          </h2>
          <div className="card max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nome Completo
                </label>
                <input 
                  type="text"
                  placeholder="Digite seu nome..."
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-white dark:bg-[#0a0a0a]
                    border border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  placeholder="seu@email.com"
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-white dark:bg-[#0a0a0a]
                    border border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Mensagem
                </label>
                <textarea 
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-white dark:bg-[#0a0a0a]
                    border border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent
                    transition-all duration-200
                    resize-none
                  "
                />
              </div>

              <button className="
                w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                hover:from-blue-700 hover:to-indigo-700
                text-white font-bold px-6 py-3 rounded-xl
                shadow-lg shadow-blue-500/30
                hover:scale-[1.02] transition-all duration-300
              ">
                Enviar Mensagem
              </button>
            </div>
          </div>
        </section>

        {/* Section: Glass Effect */}
        <section>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 italic">
            🔮 Glass Effect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                Card com Efeito de Vidro
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Backdrop blur com transparência. Perfeito para overlays e modais.
              </p>
              <button className="
                bg-white/20 dark:bg-white/10 
                hover:bg-white/30 dark:hover:bg-white/20
                text-slate-900 dark:text-white
                font-bold px-4 py-2 rounded-lg
                border border-white/30 dark:border-white/20
                backdrop-blur-sm
              ">
                Ver Mais
              </button>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                Outro Card de Vidro
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                O efeito funciona em ambos os temas, adaptando automaticamente.
              </p>
              <button className="
                bg-gradient-to-r from-blue-500/80 to-purple-500/80
                hover:from-blue-600/80 hover:to-purple-600/80
                text-white font-bold px-4 py-2 rounded-lg
                backdrop-blur-sm
              ">
                Ação
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            🌓 <strong className="text-slate-900 dark:text-white">Dual Theme System</strong> - Light High-Tech & Dark Maximalist
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Implementado com next-themes • BizControl 360
          </p>
        </div>
      </footer>
    </div>
  );
}
