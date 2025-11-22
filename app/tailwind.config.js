/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use the CSS variables we defined in layout.tsx
        inter: ['var(--font-inter)', 'sans-serif'],
        noto: ['var(--font-noto)', 'sans-serif'],
        // Set defaults if needed (optional)
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}