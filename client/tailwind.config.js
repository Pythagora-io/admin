// Import design tokens
// Note: We need to use a different approach since the tokens are ES modules
const tokens = {
  colors: {
    white: "#F7F8F8",
    grey: "#7D8294",
    black: "#0B0912",
    blue: "#3057E1",
    yellow: "#FFD11A",
    red: "#F34222",
    background: "#0B0912",
    windowBlur: "rgba(17, 16, 22, 0.80)",
    strokeDark: "rgba(247, 248, 248, 0.10)",
    redOpacity20: "rgba(243, 66, 34, 0.20)",
    whiteOpacity05: "rgba(247, 248, 248, 0.05)",
  },
  borderRadius: {
    sm: "8px",
    md: "16px",
    full: "9999px",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    15: "60px",
  },
  effects: {
    blur: "blur(16px)",
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    fontFamily: {
      sans: ["Geist", "sans-serif"],
    },
    extend: {
      // Custom colors from design tokens
      colors: {
        "app-white": tokens.colors.white,
        "app-grey": tokens.colors.grey,
        "app-black": tokens.colors.black,
        "app-blue": tokens.colors.blue,
        "app-yellow": tokens.colors.yellow,
        "app-red": tokens.colors.red,
        "app-background": tokens.colors.background,
        "app-window-blur": tokens.colors.windowBlur,
        "app-stroke-dark": tokens.colors.strokeDark,
        "app-red-opacity-20": tokens.colors.redOpacity20,
        "app-white-opacity-05": tokens.colors.whiteOpacity05,

        // Original theme colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // Custom border radius from design tokens
      borderRadius: {
        "app-sm": tokens.borderRadius.sm,
        "app-md": tokens.borderRadius.md,
        "app-full": tokens.borderRadius.full,

        // Original border radius
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Custom spacing from design tokens
      spacing: {
        "app-1": tokens.spacing[1],
        "app-2": tokens.spacing[2],
        "app-3": tokens.spacing[3],
        "app-4": tokens.spacing[4],
        "app-5": tokens.spacing[5],
        "app-6": tokens.spacing[6],
        "app-8": tokens.spacing[8],
        "app-10": tokens.spacing[10],
        "app-15": tokens.spacing[15],
      },

      // Custom backdrop blur from design tokens
      backdropBlur: {
        app: tokens.effects.blur.replace("blur(", "").replace(")", ""),
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
