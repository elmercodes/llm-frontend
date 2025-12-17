import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        panel: "var(--color-panel)",
        card: "var(--color-card)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        "accent-contrast": "var(--color-accent-contrast)",
        "assistant": "var(--color-assistant)",
        "user": "var(--color-user)"
      },
      boxShadow: {
        soft: "0 18px 45px -30px rgba(15, 23, 42, 0.35)",
        glow: "0 0 0 1px rgba(15, 23, 42, 0.08), 0 12px 25px -20px rgba(15, 23, 42, 0.5)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
