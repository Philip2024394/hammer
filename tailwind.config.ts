import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#000000",
          surface: "#0c0c0c",
          line: "#1f1f1f",
          accent: "#FFD60A",
        accentSoft: "#fff59c",
          text: "#f5f5f5",
          muted: "#a3a3a3"
        }
      },
      fontSize: {
        // WCAG floor — never go below 13px on this app
        xs: ["13px", { lineHeight: "1.45" }],
        sm: ["14px", { lineHeight: "1.5" }]
      }
    }
  },
  plugins: []
};

export default config;
