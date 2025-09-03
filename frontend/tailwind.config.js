/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          hover: "hsl(var(--secondary-hover))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // Voicify specific colors
        voicify: {
          primary: "#5546FF",
          secondary: "#7C3AED",
          accent: "#F59E0B",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
          background: {
            light: "#FFFFFF",
            dark: "#181A20",
          },
          text: {
            primary: {
              light: "#212121",
              dark: "#F5F5F5",
            },
            secondary: {
              light: "#727272",
              dark: "#A3A3A3",
            },
            muted: {
              light: "#9E9E9E",
              dark: "#6B6B6B",
            },
          },
          border: {
            light: "#E5E5E5",
            dark: "#404855",
          },
          surface: {
            light: "#F7F7F7",
            dark: "#2C3038",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius-sm)",
        sm: "calc(var(--radius) - 2px)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0.01em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '0.01em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '0.01em' }],
        '5xl': ['48px', { lineHeight: '52px', letterSpacing: '0.01em' }],
        '6xl': ['60px', { lineHeight: '64px', letterSpacing: '0.01em' }],
        '7xl': ['72px', { lineHeight: '76px', letterSpacing: '0.01em' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '5.5rem',
        '92': '5.75rem',
        '96': '6rem',
        '104': '6.5rem',
        '112': '7rem',
        '128': '8rem',
        '144': '9rem',
        '160': '10rem',
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(85, 70, 255, 0.08)',
        'medium': '0 4px 25px 0 rgba(85, 70, 255, 0.12)',
        'large': '0 8px 40px 0 rgba(85, 70, 255, 0.15)',
        'xl': '0 20px 60px 0 rgba(85, 70, 255, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: 1 },
          to: { transform: "scale(0.95)", opacity: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-out-to-bottom": "slide-out-to-bottom 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}