"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { Settings, Shield, Database, Bell, Globe, Palette } from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

export default function AdminSettingsPage() {
    const settingsCards = [
        {
            icon: Shield,
            title: 'Segurança',
            description: 'Políticas de password, 2FA, sessões activas',
            delay: 0.1,
        },
        {
            icon: Database,
            title: 'Base de Dados',
            description: 'Backup, restauro, limpeza de dados',
            delay: 0.2,
        },
        {
            icon: Bell,
            title: 'Notificações',
            description: 'Email, SMS, alertas do sistema',
            delay: 0.3,
        },
        {
            icon: Globe,
            title: 'Localização',
            description: 'Idioma, fuso horário, moeda padrão',
            delay: 0.4,
        },
        {
            icon: Palette,
            title: 'Aparência',
            description: 'Logo, cores, branding da plataforma',
            delay: 0.5,
        },
    ];

    return (
    <MaxWidthContainer size="xl">
      <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="neu-text-h1 flex items-center gap-3">
                    <Settings className="w-10 h-10 text-[var(--neu-accent)]" />
                    Configurações do Sistema
                </h1>
                <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                    Gerir configurações globais da plataforma BIZ360
                </p>
            </motion.div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: card.delay }}
                        >
                            <NeuCard 
                                variant="convex" 
                                size="md"
                                className="cursor-pointer hover:scale-[1.02] transition-transform"
                            >
                                <NeuCardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl neu-surface neu-convex-md flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-[var(--neu-accent)]" />
                                    </div>
                                    <h3 className="neu-text-h3 mb-2">{card.title}</h3>
                                    <p className="neu-text-body text-[var(--neu-text-muted)]">
                                        {card.description}
                                    </p>
                                </NeuCardContent>
                            </NeuCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <NeuCard variant="concave" size="sm">
                    <NeuCardContent className="p-6">
                        <p className="neu-text-body text-[var(--neu-accent)]">
                            <span className="font-bold">Nota:</span> Esta área está em desenvolvimento.
                            As configurações detalhadas serão adicionadas em breve.
                        </p>
                    </NeuCardContent>
                </NeuCard>
            </motion.div>
        </div>
      </MaxWidthContainer>
  );
}
