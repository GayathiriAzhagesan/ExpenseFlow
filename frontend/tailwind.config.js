/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#080C15',       // Deepest navy/black
          card: '#0F172A',       // Rich charcoal navy card
          cardLight: '#FFFFFF',  // Light mode card
          subtle: '#1E293B',     // Subtle surface border/bg
          primary: '#6366F1',    // Vibrant indigo
          secondary: '#06B6D4',  // Electric cyan
          accent: '#8B5CF6',     // Violet glow
          neonCyan: '#00F0FF',
          neonPurple: '#A855F7',
          success: '#10B981',
          danger: '#F43F5E',
          warning: '#F59E0B',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
