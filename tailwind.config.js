/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === NEXUS GAMING Design Tokens ===
        // Background
        'bg-deep': 'rgb(var(--bg-deep))',
        'bg-base': 'rgb(var(--bg-base))',
        'bg-elevated': 'rgb(var(--bg-elevated))',
        'bg-hover': 'rgb(var(--bg-hover))',
        'bg-card': 'rgb(var(--bg-card))',
        'bg-muted': 'rgb(var(--bg-muted))',

        // Accent Primary (Cyan)
        'accent-primary': 'rgb(var(--accent-primary))',
        'accent-primary-glow': 'rgb(var(--accent-primary-glow))',
        'accent-primary-dim': 'rgb(var(--accent-primary-dim))',

        // Accent Secondary (Purple)
        'accent-secondary': 'rgb(var(--accent-secondary))',
        'accent-secondary-glow': 'rgb(var(--accent-secondary-glow))',

        // Semantic Colors
        'success': 'rgb(var(--accent-success))',
        'success-glow': 'rgb(var(--accent-success-glow))',
        'warning': 'rgb(var(--accent-warning))',
        'danger': 'rgb(var(--accent-danger))',
        'info': 'rgb(var(--accent-info))',

        // Text
        'text-primary': 'rgb(var(--text-primary))',
        'text-secondary': 'rgb(var(--text-secondary))',
        'text-muted': 'rgb(var(--text-muted))',

        // Border
        'border-subtle': 'rgb(var(--border-subtle))',
        'border-hover': 'rgb(var(--border-hover))',
        'border-focus': 'rgb(var(--border-focus))',

        // Legacy primary (for compatibility)
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
      },
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },

      // Spacing scale
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },

      // Container widths
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1440px',
        'container-3xl': '1600px',
      },

      // Typography scale
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontFamily: 'Syne, Space Grotesk, system-ui, sans-serif', fontWeight: '700' }],
        'h1': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontFamily: 'Syne, Space Grotesk, system-ui, sans-serif', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.25', fontFamily: 'Syne, Space Grotesk, system-ui, sans-serif', fontWeight: '600' }],
        'h3': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.3', fontFamily: 'Syne, Space Grotesk, system-ui, sans-serif', fontWeight: '600' }],
        'h4': ['clamp(1.125rem, 2vw, 1.25rem)', { lineHeight: '1.4', fontFamily: 'Syne, Space Grotesk, system-ui, sans-serif', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },

      // Transition tokens
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // Shadow scale
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px rgb(var(--accent-primary) / 0.3), 0 0 40px rgb(var(--accent-primary) / 0.15)',
        'glow-lg': '0 0 30px rgb(var(--accent-primary) / 0.4), 0 0 60px rgb(var(--accent-primary) / 0.2)',
        'card': '0 20px 40px -15px rgb(0 0 0 / 0.5), 0 0 30px rgb(var(--accent-primary) / 0.1)',
        'card-hover': '0 25px 50px -12px rgb(0 0 0 / 0.5), 0 0 40px rgb(var(--accent-primary) / 0.15)',
      },

      // Gradient tokens
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-secondary)) 100%)',
        'grad-hero': 'linear-gradient(145deg, rgb(var(--bg-deep)) 0%, rgb(var(--bg-base)) 50%, rgb(30, 27, 75) 100%)',
        'grad-card-glow': 'linear-gradient(180deg, rgba(var(--accent-primary), 0.08) 0%, transparent 60%)',
        'grad-btn-primary': 'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-primary-dim)) 100%)',
        'grad-btn-secondary': 'linear-gradient(135deg, rgb(var(--accent-secondary)) 0%, #9333ea 100%)',

        // Category gradients using accent colors
        'grad-cat-mice': 'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-primary-glow)) 100%)',
        'grad-cat-keyboards': 'linear-gradient(135deg, rgb(var(--accent-secondary)) 0%, rgb(var(--accent-secondary-glow)) 100%)',
        'grad-cat-headsets': 'linear-gradient(135deg, rgb(var(--accent-success)) 0%, rgb(var(--accent-success-glow)) 100%)',
        'grad-cat-monitors': 'linear-gradient(135deg, rgb(var(--accent-warning)) 0%, rgb(var(--accent-danger)) 100%)',
        'grad-cat-laptops': 'linear-gradient(135deg, rgb(var(--accent-secondary)) 0%, rgb(var(--accent-primary)) 100%)',
        'grad-cat-components': 'linear-gradient(135deg, rgb(var(--accent-danger)) 0%, rgb(255, 107, 107) 100%)',
        'grad-cat-accessories': 'linear-gradient(135deg, rgb(32, 201, 151) 0%, rgb(var(--accent-primary)) 100%)',
        'grad-cat-default': 'linear-gradient(135deg, rgb(100, 116, 139) 0%, rgb(71, 85, 105) 100%)',
      },
    },
  },
  plugins: [],
}