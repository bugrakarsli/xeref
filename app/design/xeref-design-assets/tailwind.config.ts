import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:"var(--bg)", surface:"var(--surface)", "surface-soft":"var(--surface-soft)",
        "surface-muted":"var(--surface-muted)", border:"var(--border)",
        "border-strong":"var(--border-strong)", text:"var(--text)", muted:"var(--muted)",
        faint:"var(--faint)", accent:"var(--accent)", "accent-hover":"var(--accent-hover)",
        "accent-soft":"var(--accent-soft)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
