/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1F2A',
        navy: {
          DEFAULT: '#101728',
          50: '#EEF1F7',
          100: '#D7DDEA',
          700: '#182234',
          800: '#141C2C',
          900: '#101728',
        },
        paper: '#F6F7F9',
        line: '#E3E6EB',
        slate: {
          DEFAULT: '#5B6472',
        },
        amber: {
          DEFAULT: '#E3A008',
          50: '#FDF5DF',
          100: '#FBE9B8',
          600: '#C6890A',
          700: '#9C6C08',
        },
        success: '#1F8A55',
        danger: '#D64545',
        info: '#2563A6',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 23, 40, 0.06)',
        pop: '0 12px 32px rgba(16, 23, 40, 0.18)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
      },
    },
  },
  plugins: [],
}
