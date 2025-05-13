const plugin = require("tailwindcss/plugin"); // Import plugin function

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem", // Ensure 16px is available (already default for xl, adding 2xl for clarity)
      },
      colors: {
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        "toast-success-text": "hsl(var(--toast-success-text))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        placeholder: "hsl(var(--placeholder))", // Added placeholder color utility
        "background-content-glassy": "hsl(var(--background-content-glassy))", // Added for main content

        // Preserving chart and sidebar from original config if they are used elsewhere
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
          muted: {
            DEFAULT: "hsl(var(--sidebar-muted-foreground))", // For inactive icons
          },
          active: {
            DEFAULT: "hsl(var(--sidebar-active-background))",
            foreground: "hsl(var(--sidebar-active-foreground))",
          },
          hover: {
            DEFAULT: "hsl(var(--sidebar-hover-background))",
          },
        },
        highlight: "var(--highlight)",
      },
      fontFamily: {
        geist: ['"Geist"', "sans-serif"],
        "geist-mono": ['"Geist Mono"', "monospace"],
        sans: ['"Geist"', "sans-serif"], // Setting Geist as default sans-serif
      },
      fontSize: {
        // Figma: 76px, 500, -1% letter spacing
        "display-1": [
          "4.75rem",
          { letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        // Figma: 64px, 500, -2% letter spacing
        "display-2": ["4rem", { letterSpacing: "-0.02em", fontWeight: "500" }],
        // Figma: 48px, 500, -2% letter spacing
        "heading-1": ["3rem", { letterSpacing: "-0.02em", fontWeight: "500" }],
        // Figma: 36px, 500, -2% letter spacing
        "heading-2": [
          "2.25rem",
          { letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        // Figma: 24px, 500, -2% letter spacing
        "heading-3": [
          "1.5rem",
          { letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        // Figma: 20px, 500, -2% letter spacing
        subheading: [
          "1.25rem",
          { letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        // Figma: 16px, 400, 0% letter spacing
        "body-lg": ["1rem", { letterSpacing: "0em", fontWeight: "400" }],
        // Figma: 16px, 500, 0% letter spacing - NEW
        "body-lg-medium": ["1rem", { letterSpacing: "0em", fontWeight: "500" }],
        // Figma: 14px, 500, -2% letter spacing (Button Text)
        "body-md": [
          "0.875rem",
          { letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        // Figma: 14px, 400, -2% letter spacing (Regular Body/Small)
        "body-sm": [
          "0.875rem",
          { letterSpacing: "-0.02em", fontWeight: "400" },
        ],
        // Figma: 14px, 400, 0% letter spacing (Mono)
        code: [
          "0.875rem",
          {
            letterSpacing: "0em",
            fontWeight: "400",
            fontFamily: '"Geist Mono", monospace',
          },
        ],
        // Figma: 12px, 400, 0% letter spacing
        caption: ["0.75rem", { letterSpacing: "0em", fontWeight: "400" }],
        // Figma: 12px, 500, 0% letter spacing
        "caption-strong": [
          "0.75rem",
          { letterSpacing: "0em", fontWeight: "500" },
        ],
      },
      backdropBlur: {
        // Add specific value from Figma if needed, or use closest default like lg
        // '70px': '70px', // Example for arbitrary value
        lg: "16px", // Default lg might be sufficient visually
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
