export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        leaf: {
          DEFAULT: "#2f7d32",
          50: "#f2fcf3",
          100: "#e1f7e3",
          200: "#c2eec6",
          300: "#92e09b",
          400: "#5bcc68",
          500: "#36b043",
          600: "#279130",
          700: "#217327",
          800: "#1e5b22",
          900: "#1b4c1f",
          950: "#0b2b0f"
        },
        field: {
          DEFAULT: "#f3f8ed",
          dark: "#0b0f19"
        },
        soil: {
          DEFAULT: "#6f4e37",
          50: "#faf6f0",
          100: "#f3e8d9",
          500: "#6f4e37",
          900: "#3b2314"
        },
        mustard: {
          DEFAULT: "#f6c445",
          light: "#fef8e7",
          dark: "#d99e16"
        },
        panel: {
          light: "rgba(255, 255, 255, 0.75)",
          dark: "rgba(17, 24, 39, 0.75)"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px"
      },
      boxShadow: {
        "premium": "0 8px 32px 0 rgba(0, 0, 0, 0.04)",
        "premium-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.08)",
        "glow-green": "0 0 15px 0 rgba(47, 125, 50, 0.15)",
        "glow-blue": "0 0 15px 0 rgba(37, 99, 235, 0.15)"
      },
      animation: {
        "shimmer": "shimmer 2s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 3s infinite ease-in-out"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        scan: {
          "0%, 100%": { top: "0%" },
          "50%": { top: "100%" }
        }
      }
    }
  },
  plugins: []
};
