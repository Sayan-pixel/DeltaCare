// Local type definition to avoid TS2307 resolution error before node_modules is installed
export interface Config {
  content: string[];
  theme?: {
    extend?: Record<string, unknown>;
  };
  plugins?: unknown[];
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -8px rgb(15 23 42 / 0.10)",
        glow: "0 10px 30px -10px rgb(16 185 129 / 0.55)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        indeterminate: {
          "0%": { transform: "translateX(-100%)", width: "40%" },
          "100%": { transform: "translateX(260%)", width: "40%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        grow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        indeterminate: "indeterminate 1.4s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        grow: "grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
