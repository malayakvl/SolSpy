import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './__vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],
    silenceDeprecations: ['legacy-js-api'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['PT Sans Caption', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    extend: {
        color: {
            purple: {
                100: '#e7dcfd',
                500: '#6248A1FF',
                700: '#830874',
                800: '#221a69',
                850: '#6b21a8'
            },
            gray: {
                100: '#f6f8fa',
            },
            blue: {
                100: '#3ce4f0'
            },
            fukcia: {
                100: '#f76ab0'
            },
            red: {
                550: '#860000'
            }
        }
    },
    plugins: [forms],
};
