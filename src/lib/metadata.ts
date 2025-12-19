import { Metadata } from 'next';

export function generateMetadata(options: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const { title, description, path, keywords, image } = options;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    title: `${title} | BizControl 360`,
    description,
    keywords: keywords || [
      'bizcontrol360', 'erp', 'gestão empresarial', 'ponto de venda', 
      'inventário', 'moçambique', 'sistema comercial'
    ],
    authors: [{ name: 'BizControl 360 Team' }],
    creator: 'BizControl 360',
    publisher: 'BizControl 360',
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'pt_MZ',
      url: path ? `${baseUrl}${path}` : baseUrl,
      title: `${title} | BizControl 360`,
      description,
      siteName: 'BizControl 360',
      images: image ? [{
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      }] : [],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: `${title} | BizControl 360`,
      description,
      images: image ? [image] : [],
    },
    
    // App metadata for PWA
    appleWebApp: {
      capable: true,
      title: 'BizControl 360',
      statusBarStyle: 'default',
    },
    
    // Verification and security
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    
    // Icons
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    
    // Viewport and mobile
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    
    // Theme
    colorScheme: 'light dark',
    
    // Other meta tags
    other: {
      'theme-color': '#2563eb',
      'msapplication-TileColor': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
    },
    
    // Canonical URL
    alternates: {
      canonical: path ? `${baseUrl}${path}` : baseUrl,
    },
    
    // No index for sensitive pages
    ...(path?.includes('/admin/') && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function generatePageMetadata(page: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  return generateMetadata({
    ...page,
    image: '/api/og?title=' + encodeURIComponent(page.title),
  });
}

// Structured Data generators
export function generateOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BizControl 360',
    description: 'Sistema de Gestão Empresarial Completo para Moçambique',
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: process.env.NEXT_PUBLIC_APP_URL + '/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+258 84 000 0000',
      contactType: 'customer service',
      availableLanguage: ['Portuguese'],
    },
    sameAs: [
      process.env.NEXT_PUBLIC_APP_URL,
    ],
  };
}

export function generateWebsiteData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BizControl 360',
    description: 'Sistema de Gestão Empresarial Completo para Moçambique com Ponto de Venda, Controlo de Stock e Relatórios',
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: process.env.NEXT_PUBLIC_APP_URL + '/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BizControl 360',
    },
  };
}

export function generateProductData(product: {
  name: string;
  description: string;
  price: number;
  image?: string;
  availability?: 'InStock' | 'OutOfStock';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MZN',
      availability: product.availability || 'InStock',
    },
  };
}