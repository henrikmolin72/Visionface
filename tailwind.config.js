/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        clinicalWhite: '#FFFFFF',
        softMint: '#E3F2FD',
        roseDust: '#FCE4EC',
        primary: '#E3F2FD', // primary color for action buttons
        textDark: '#1F2937', 
        textMuted: '#6B7280',
      }
    },
  },
  plugins: [],
}
