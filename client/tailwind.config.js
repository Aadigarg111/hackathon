module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glow: {
          '0%, 100%': {
            opacity: 1,
            filter: 'drop-shadow(0 0 2px rgba(147, 51, 234, 0.5))',
          },
          '50%': {
            opacity: 0.8,
            filter: 'drop-shadow(0 0 5px rgba(147, 51, 234, 0.8))',
          },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        tiltIn: {
          '0%': { transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)' },
          '100%': { transform: 'perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale3d(1.02, 1.02, 1.02)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "gradient": "gradient 3s ease infinite",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
        "slideUp": "slideUp 0.5s ease-out forwards",
        "tiltIn": "tiltIn 0.2s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
      },
      backgroundSize: {
        '200%': '200%',
      },
      translate: {
        'z-0': '0px',
        'z-10': '10px',
        'z-20': '20px',
        'z-30': '30px',
        'z-40': '40px',
        'z-50': '50px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      perspective: {
        'none': 'none',
        '500': '500px',
        '1000': '1000px',
        '2000': '2000px',
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {
        ...Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [
            `.animation-delay-${(i + 1) * 100}`,
            { 'animation-delay': `${(i + 1) * 0.1}s` }
          ])
        ),
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective': {
          'perspective': '1000px',
        },
        '.perspective-500': {
          'perspective': '500px',
        },
        '.perspective-2000': {
          'perspective': '2000px',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.transform-gpu': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },
        '.translate-z-0': {
          'transform': 'translateZ(0px)',
        },
        '.translate-z-10': {
          'transform': 'translateZ(10px)',
        },
        '.translate-z-20': {
          'transform': 'translateZ(20px)',
        },
        '.translate-z-30': {
          'transform': 'translateZ(30px)',
        },
        '.translate-z-40': {
          'transform': 'translateZ(40px)',
        },
        '.translate-z-50': {
          'transform': 'translateZ(50px)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
  darkMode: ["class"],
};
