/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      colors: {
        // Linear-inspired palette
        app: {
          bg:       '#0F0F0F', // main background
          surface:  '#141414', // panels, cards
          overlay:  '#1A1A1A', // hover states, elevated surfaces
          border:   '#1E1E1E', // subtle dividers
          border2:  '#2A2A2A', // slightly more visible borders
        },
        txt: {
          primary:   '#E2E2E2',
          secondary: '#8A8A8A',
          muted:     '#4A4A4A',
        },
        accent: {
          DEFAULT: '#5E6AD2', // Linear purple-blue
          hover:   '#6B77D8',
          muted:   '#5E6AD220',
        }
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs:    ['11px', '16px'],
        sm:    ['12px', '18px'],
        base:  ['13px', '20px'],
        md:    ['14px', '20px'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      }
    }
  },
  plugins: []
}
