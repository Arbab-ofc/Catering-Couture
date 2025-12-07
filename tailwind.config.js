/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '320px', // small mobile
      sm: '481px', // mobile
      md: '769px', // tablet
      lg: '1025px', // large screens
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-muted': 'var(--bg-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        border: 'var(--border)',
        glow: 'var(--glow)',
        success: '#48BB78',
        warning: '#F6AD55',
        danger: '#F56565',
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.14)',
        subtle: '0 10px 30px rgba(0,0,0,0.08)',
        glow: '0 10px 30px var(--glow)',
      },
      backgroundImage: {
        'golden-gradient':
          'linear-gradient(135deg, #F5D08C 0%, #C9934A 40%, #A35D2D 100%)',
        'dark-sheen':
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0, transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.04) 0, transparent 35%)',
      },
      transitionTimingFunction: {
        'soft-spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
