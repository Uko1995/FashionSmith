// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pomegranate: {
          50: "#fff5ed",
          100: "#fee7d6",
          200: "#fcccac",
          300: "#f9a878",
          400: "#f67a41",
          500: "#f3561c",
          600: "#e43d12",
          700: "#bd2b11",
          800: "#962416",
          900: "#792015",
          950: "#410d09",
        },
        // Name it whatever you want
      },
    },
  },
};
