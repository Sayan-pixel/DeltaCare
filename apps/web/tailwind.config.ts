// Local type definition to avoid TS2307 resolution error before node_modules is installed
export interface Config {
  darkMode?: "media" | "class";
  content: string[];
  theme?: {
    extend?: Record<string, unknown>;
  };
  plugins?: unknown[];
}

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
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
        paper: channel("paper"),
        surface: channel("surface"),
        line: channel("line"),
        ink: {
          DEFAULT: channel("ink"),
          soft: channel("ink-soft"),
          faint: channel("ink-faint"),
        },
        brand: {
          DEFAULT: channel("brand"),
          strong: channel("brand-strong"),
          soft: channel("brand-soft"),
          on: channel("brand-on"),
        },
        accent: {
          DEFAULT: channel("accent"),
          soft: channel("accent-soft"),
        },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ['"Fraunces Variable"', "ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgb(var(--ink) / 0.03), 0 18px 40px -24px rgb(var(--ink) / 0.28)",
        lift: "0 1px 0 rgb(var(--ink) / 0.04), 0 24px 48px -20px rgb(var(--ink) / 0.35)",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        grow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        indeterminate: "indeterminate 1.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        grow: "grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        pulseDot: "pulseDot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
