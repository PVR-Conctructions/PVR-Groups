/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e8edf5',
                    100: '#c5d0e6',
                    200: '#9fb2d6',
                    300: '#7993c5',
                    400: '#5c7cb9',
                    500: '#3f65ad',
                    600: '#345498',
                    700: '#284280',
                    800: '#1a3a6b',
                    900: '#0d1f3c',
                },
                gold: {
                    50: '#fdf8ec',
                    100: '#f9eed0',
                    200: '#f2dca1',
                    300: '#e8c76e',
                    400: '#d4a843',
                    500: '#c4952e',
                    600: '#a87823',
                    700: '#8a5d1e',
                    800: '#72491c',
                    900: '#5f3c1b',
                },
                dark: {
                    bg: '#0f1520',
                    card: '#1a2233',
                    border: '#2a3548',
                }
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-gold': 'pulseGold 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulseGold: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 67, 0.4)' },
                    '50%': { boxShadow: '0 0 0 20px rgba(212, 168, 67, 0)' },
                },
            },
        },
    },
    plugins: [],
}
