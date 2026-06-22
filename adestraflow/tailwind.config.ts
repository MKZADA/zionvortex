import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EDEAE2",        // pedra/areia - claro o suficiente pro campo, sob sol
        surface: "#FFFFFF",
        ink: "#1F2A22",       // verde-preto profundo, cor de texto principal
        "ink-muted": "#5C6A60",
        primary: {
          DEFAULT: "#2F4B3C",  // verde musgo - ações principais
          dark: "#20342A",
          light: "#3F614F",
        },
        accent: {
          DEFAULT: "#C76B2E",  // âmbar queimado - CTA, "enviar", destaque
          dark: "#A5571F",
        },
        warn: "#B8442A",       // ferrugem - alerta, dificuldade alta, pacote acabando
        rope: "#8B6B43",       // corda - elemento de progresso de pacote
        "rope-light": "#C9B391",
        line: "#D9D3C5",       // bordas, divisores
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
