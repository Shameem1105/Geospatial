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
        graphite: {
          950: '#0B0C0E',
          900: '#111315',
          850: '#15181B',
          800: '#181B1E',
          700: '#22272B',
          600: '#2A3036',
          500: '#38414A',
        },
        amber: {
          500: '#F5A524',
          400: '#FFB84D',
          300: '#FFC45C',
          200: '#FFE19C',
          600: '#D98911',
        },
        surface: {
          DEFAULT: '#181B1E',
          subtle: '#22272B',
          border: '#2E353D',
        },
        brand: {
          text: '#F4F2ED',
          muted: '#9CA3A8',
          success: '#35B77A',
          error: '#E45B5B',
          warning: '#F5A524',
          info: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
