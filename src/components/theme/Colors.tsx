// 🇲🇿 PALETA DE CORES INSPIRADA EM MOÇAMBIQUE
export const colors = {
  // Praias de Moçambique - Cores primárias vibrantes
  ocean: {
    50: '#e0f7ff',
    100: '#b3e9ff',
    200: '#80dbff',
    300: '#4dcdff',
    400: '#26c1ff',
    500: '#00b5ff', // Turquesa intenso das águas de Tofo
    600: '#009ee6',
    700: '#0084cc',
    800: '#006bb3',
    900: '#004380',
  },
  
  coral: {
    50: '#fff0ed',
    100: '#ffd7cc',
    200: '#ffb8a3',
    300: '#ff9879',
    400: '#ff7d59',
    500: '#ff6139', // Coral vivo do pôr do sol em Vilanculos
    600: '#f54d2d',
    700: '#e63821',
    800: '#d62415',
    900: '#c00000',
  },
  
  sun: {
    50: '#fffbea',
    100: '#fff3c4',
    200: '#ffe999',
    300: '#ffdd6b',
    400: '#ffd147',
    500: '#ffc524', // Amarelo sol intenso
    600: '#f5b300',
    700: '#e69e00',
    800: '#d68900',
    900: '#c07000',
  },
  
  // Savana - Tons terrosos secundários
  terracota: {
    50: '#fef4f0',
    100: '#fce0d6',
    200: '#f9c7b6',
    300: '#f6ab93',
    400: '#f39578',
    500: '#f07f5c', // Terracota quente
    600: '#e6693d',
    700: '#d9522a',
    800: '#c93c1a',
    900: '#b02200',
  },
  
  savanna: {
    50: '#f5f7f0',
    100: '#e6ead6',
    200: '#d3dbb8',
    300: '#bcc997',
    400: '#a8b97c',
    500: '#94a961', // Verde-oliva da savana
    600: '#7f9448',
    700: '#6a7e32',
    800: '#566820',
    900: '#425210',
  },
  
  // Néons para CTAs
  neon: {
    magenta: '#ff006e', // Magenta elétrico
    lime: '#b0ff00', // Lima néon
    cyan: '#00fff5', // Ciano néon
    pink: '#ff00bf', // Rosa néon
  },
  
  // Dark mode - quase preto
  dark: {
    900: '#0a0a0a',
    800: '#141414',
    700: '#1e1e1e',
    600: '#2a2a2a',
    500: '#3a3a3a',
  }
};

// Gradientes complexos multi-direcionais
export const gradients = {
  ocean: 'linear-gradient(135deg, #00b5ff 0%, #ff6139 50%, #ffc524 100%)',
  sunset: 'linear-gradient(135deg, #ff6139 0%, #f07f5c 50%, #ffc524 100%)',
  savanna: 'linear-gradient(135deg, #94a961 0%, #f07f5c 50%, #ffc524 100%)',
  neon: 'linear-gradient(135deg, #ff006e 0%, #b0ff00 50%, #00fff5 100%)',
  dark: 'linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 50%, #2a2a2a 100%)',
  radial: 'radial-gradient(circle at 50% 50%, #00b5ff 0%, #ff6139 50%, #0a0a0a 100%)',
  mesh: `
    radial-gradient(at 40% 20%, #00b5ff 0px, transparent 50%),
    radial-gradient(at 80% 0%, #ff6139 0px, transparent 50%),
    radial-gradient(at 0% 50%, #ffc524 0px, transparent 50%),
    radial-gradient(at 80% 50%, #ff006e 0px, transparent 50%),
    radial-gradient(at 0% 100%, #94a961 0px, transparent 50%),
    radial-gradient(at 80% 100%, #00fff5 0px, transparent 50%)
  `
};

export default colors;
