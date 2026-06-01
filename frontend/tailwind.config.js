/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Minecraft palette
        mc: {
          grass: '#7B8D3A',
          grassDark: '#5C6B2A',
          wood: '#C4A46C',
          woodDark: '#8B6914',
          stone: '#808080',
          stoneDark: '#5A5A5A',
          gold: '#FFD700',
          goldDark: '#B8860B',
          dirt: '#8B6914',
          // UI backgrounds
          bgDark: '#1a1a2e',
          bgDarker: '#0f0f1a',
          // Text
          textLight: '#f0f0f0',
          textMuted: '#a0a0a0',
          // Button states
          btnHover: '#5C6B2A',
          btnActive: '#4A561F',
          // Board
          boardDark: '#1e3a5f',
          boardLight: '#e8d5b7',
          // Overworld
          overworld: '#7B8D3A',
          // Nether
          nether: '#8B2500',
          netherGlow: '#FF4500',
          // End
          end: '#4B0082',
          endGlow: '#9D4EDD',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        board: {
          dark: '#1e3a5f',
          light: '#e8d5b7',
        },
      },
      fontFamily: {
        // Pixel/Minecraft-style font
        pixel: ['Minecraftia', 'Press Start 2P', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // Custom animations
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 5px #FFD700, 0 0 10px #FFD70040' },
          '50%': { boxShadow: '0 0 15px #FFD700, 0 0 25px #FFD70060' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // Custom background images
      backgroundImage: {
        'wood-texture': "url('/assets/textures/wood.png')",
        'stone-texture': "url('/assets/textures/stone.png')",
        'grass-texture': "url('/assets/textures/grass.png')",
      },
      boxShadow: {
        'wood': '4px 4px 0 #5C3010, inset 0 0 0 2px #8B6914',
        'wood-hover': '5px 5px 0 #5C3010, inset 0 0 0 2px #B8860B',
        'stone': '4px 4px 0 #3A3A3A, inset 0 0 0 2px #808080',
        'stone-hover': '5px 5px 0 #3A3A3A, inset 0 0 0 2px #A0A0A0',
        'glow-gold': '0 0 10px #FFD700, 0 0 20px #FFD70060',
      },
    },
  },
  plugins: [],
};