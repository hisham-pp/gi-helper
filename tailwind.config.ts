import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--md-sys-color-primary) / <alpha-value>)",
          foreground: "rgb(var(--md-sys-color-on-primary) / <alpha-value>)",
          container:
            "rgb(var(--md-sys-color-primary-container) / <alpha-value>)",
          "on-container":
            "rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--md-sys-color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--md-sys-color-on-secondary) / <alpha-value>)",
          container:
            "rgb(var(--md-sys-color-secondary-container) / <alpha-value>)",
          "on-container":
            "rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "rgb(var(--md-sys-color-tertiary) / <alpha-value>)",
          foreground: "rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)",
          container:
            "rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)",
          "on-container":
            "rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--md-sys-color-error) / <alpha-value>)",
          foreground: "rgb(var(--md-sys-color-on-error) / <alpha-value>)",
          container: "rgb(var(--md-sys-color-error-container) / <alpha-value>)",
          "on-container":
            "rgb(var(--md-sys-color-on-error-container) / <alpha-value>)",
        },
        background: "rgb(var(--md-sys-color-background) / <alpha-value>)",
        "on-background":
          "rgb(var(--md-sys-color-on-background) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--md-sys-color-surface) / <alpha-value>)",
          foreground: "rgb(var(--md-sys-color-on-surface) / <alpha-value>)",
          variant: "rgb(var(--md-sys-color-surface-variant) / <alpha-value>)",
          "on-variant":
            "rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)",
        },
        outline: {
          DEFAULT: "rgb(var(--md-sys-color-outline) / <alpha-value>)",
          variant: "rgb(var(--md-sys-color-outline-variant) / <alpha-value>)",
        },
        inverse: {
          surface: "rgb(var(--md-sys-color-inverse-surface) / <alpha-value>)",
          "on-surface":
            "rgb(var(--md-sys-color-inverse-on-surface) / <alpha-value>)",
          primary: "rgb(var(--md-sys-color-inverse-primary) / <alpha-value>)",
        },
        /* Legacy support */
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 20px 80px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.22), transparent 30%), radial-gradient(circle at right, rgba(250, 204, 21, 0.18), transparent 24%)",
      },
      keyframes: {
        "float-up": {
          "0%": { transform: "translateY(0) scale(0)", opacity: "0" },
          "10%": { opacity: "1", transform: "translateY(-10vh) scale(1) rotate(10deg)" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-120vh) scale(0.5) rotate(-20deg)", opacity: "0" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%) rotate(-45deg)" },
          "100%": { transform: "translateX(200%) rotate(-45deg)" },
        },
      },
      animation: {
        "float-up": "float-up 20s linear infinite",
        sweep: "sweep 15s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
