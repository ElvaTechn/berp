"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

export default function AdminDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirecionar para companies por enquanto
        router.replace('/admin/companies');
    }, [router]);

    return (
    <MaxWidthContainer size="xl">
      <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">A carregar dashboard...</p>
            </div>
        </div>
      </MaxWidthContainer>
  );
}
