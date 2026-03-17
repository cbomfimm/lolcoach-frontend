import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        gold: {
          DEFAULT: "#C89B3C",
          light: "#F0E6D3",
          dark: "#785A28",
          glow: "#C8AA6E",
        },
        arcane: {
          blue: "#0BC4E3",
          purple: "#7B68EE",
          dark: "#010A13",
          panel: "#0a1628",
          border: "#1e3a5f",
        },
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        "shimmer-gold": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "hex-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(200,155,60,0.4)" },
          "50%": { borderColor: "rgba(200,155,60,1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "counter-up": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "particle-rise": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-80px) scale(0)", opacity: "0" },
        },
      },
      animation: {
        spotlight: "spotlight 2s ease 0.75s 1 forwards",
        "shimmer-gold": "shimmer-gold 4s linear infinite",
        "hex-pulse": "hex-pulse 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "scan-line": "scan-line 6s linear infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.8s ease forwards",
        "slide-in-left": "slide-in-left 0.8s ease forwards",
        "slide-in-right": "slide-in-right 0.8s ease forwards",
        "counter-up": "counter-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "particle-rise": "particle-rise 1.5s ease-out infinite",
      },
      backgroundImage: {
        "hex-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C89B3C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
