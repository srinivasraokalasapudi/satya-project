/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#121212",
        "obsidian-light": "#1a1a1a",
        "obsidian-card": "#181818",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C766",
          dark: "#A6842A",
        },
      },
      boxShadow: {
        premium: "0 8px 30px rgba(0, 0, 0, 0.45)",
        "gold-glow": "0 8px 30px rgba(212, 175, 55, 0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

