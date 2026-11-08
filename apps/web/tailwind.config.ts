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
    },
  },
  plugins: [],
};

export default config;

