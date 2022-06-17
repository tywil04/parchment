/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(blue|red|green|yellow|cyan|purple|orange)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'dark:hover', 'active', 'dark:active'],
    },
    {
      pattern: /ring-(blue|red|green|yellow|cyan|purple|orange)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'dark:hover', 'active', 'dark:active'],
    },
    {
      pattern: /shadow-(blue|red|green|yellow|cyan|purple|orange)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'dark:hover', 'active', 'dark:active'],
    },
  ],
}