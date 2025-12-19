"use client";

import { motion } from 'framer-motion';
import { Settings, Shield, Database, Bell, Globe, Palette } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
                    <Settings className="w-10 h-10 text-purple-500" />
                    Configurações do <span className="text-purple-400">Sistema</span>
                </h1>
                <p className="text-slate-400 font-medium mt-1">
                    Gerir configurações globais da plataforma BIZ360
                </p>
            </motion.div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Security */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Segurança</h3>
                    <p className="text-sm text-slate-400">
                        Políticas de senha, 2FA, sessões activas
                    </p>
                </motion.div>

                {/* Database */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Base de Dados</h3>
                    <p className="text-sm text-slate-400">
                        Backup, restauro, limpeza de dados
                    </p>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Notificações</h3>
                    <p className="text-sm text-slate-400">
                        Email, SMS, alertas do sistema
                    </p>
                </motion.div>

                {/* Localization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Localização</h3>
                    <p className="text-sm text-slate-400">
                        Idioma, fuso horário, moeda padrão
                    </p>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-pink-600/10 to-pink-600/5 border border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center mb-4">
                        <Palette className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Aparência</h3>
                    <p className="text-sm text-slate-400">
                        Logo, cores, branding da plataforma
                    </p>
                </motion.div>
            </div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20"
            >
                <p className="text-sm text-purple-300">
                    <span className="font-bold">Nota:</span> Esta área está em desenvolvimento. 
                    As configurações detalhadas serão adicionadas em breve.
                </p>
            </motion.div>
        </div>
    );
}
