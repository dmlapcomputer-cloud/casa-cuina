/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {

      /* ================================
         TIPOGRAFÍA
      ================================= */
      fontFamily: {
        // Para títulos principales (h1, h2 elegantes)
        display: ['"Playfair Display"', 'serif'],

        // Para subtítulos si usas font-serif
        serif: ['"Playfair Display"', 'serif'],

        // Para texto general y UI
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        label : ['Inter', 'system-ui', 'sans-serif'],
      },

      /* ================================
         ESCALA TIPOGRÁFICA
      ================================= */
      fontSize: {
        hero: ['clamp(3rem, 8vw, 4.5rem)', {
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }],

        section: ['clamp(2.25rem, 5vw, 3rem)', {
          lineHeight: '1.2'
        }],

        'item-title': ['1.875rem', {
          lineHeight: '1.2',
          letterSpacing: '0.05em'
        }],

        tagline: ['1.5rem', {
          lineHeight: '1.4'
        }],

        body: ['1rem', {
          lineHeight: '1.6'
        }],

        'price-lg': ['1.875rem', {
          lineHeight: '1',
          fontWeight: '700'
        }],

        label: ['0.75rem', {
          lineHeight: '1',
          letterSpacing: '0.15em',
          fontWeight: '700'
        }],
      },

      /* ================================
         COLORES
      ================================= */
      colors: {
        primary: {
          DEFAULT: '#c3612c',
          dark: '#9A6224',
          light: '#D4935E',
          soft: '#F5E6D3',
        },
        'dark-accent': '#1e293b',
        'stone-bg': '#F9F8F6',
        'ui-subtle': '#eef0f5',  // fondo sutil azulado para botones
        stone: {
          bg: '#FCFAF7',
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          800: '#292524',
          900: '#1C1917',
        },
      },

      /* ================================
         LETTER SPACING PERSONALIZADO
      ================================= */
      letterSpacing: {
        'ultra-wide': '0.35em',
        'super-wide': '0.5em',
        tightest: '-0.04em',
      },

      /* ================================
         ANIMACIONES
      ================================= */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }

    },
  },
  plugins: [],
}
