export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      colors: {
        void: '#050608',
        carbon: '#0b0f14',
        panel: '#10161d',
        line: '#1e2933',
        soft: '#94a3b8',
        ice: '#b9f7ff',
        signal: '#72d5ff'
      },
      boxShadow: {
        glow: '0 0 30px rgba(114, 213, 255, 0.12)'
      }
    }
  },
  plugins: []
};
