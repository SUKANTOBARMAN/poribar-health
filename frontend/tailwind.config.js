/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#f0f6f1",100:"#dcebde",200:"#b9d7bd",300:"#8fbd96",400:"#5f9a6a",500:"#3d7a49",600:"#2c5f2d",700:"#234c25",800:"#1c3d1f",900:"#17321a" },
        rust: { 100:"#fde3d5", 500:"#c1440e", 600:"#a53a0c", 700:"#8a3009" },
      },
      fontFamily: { sans: ["'Hind Siliguri'", "'Inter'", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
