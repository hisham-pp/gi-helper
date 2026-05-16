import nextVitals from "eslint-config-next/core-web-vitals.js";

const config = [
  nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**"],
  },
];

export default config;
