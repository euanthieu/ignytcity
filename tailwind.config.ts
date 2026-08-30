import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--bg-primary)',
        },
        brand: {
          core: 'var(--brand-core)',
          vibrant: 'var(--brand-vibrant)',
        }
      }
    },
  },
  plugins: [],
}
export default config
