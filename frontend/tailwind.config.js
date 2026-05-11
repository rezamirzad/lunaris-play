/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          DEFAULT: 'var(--bg-app)',
          card: 'var(--bg-card)',
        },
        content: {
          strong: 'var(--text-strong)',
          base: 'var(--text-base)',
        },
        brand: {
          accent: 'var(--brand-accent)',
          'accent-glow': 'var(--accent-glow)',
        },
      },
      fontSize: {
        'fluid-xs': 'clamp(0.7rem, 0.6rem + 0.5vw, 0.9rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',
        'fluid-xl': 'clamp(2rem, 1.5rem + 2vw, 5rem)',
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
