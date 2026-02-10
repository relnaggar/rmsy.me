import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';


export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/build/' : '/',
    plugins: [
        laravel({
            input: [
                'resources/scss/styles.scss',
                'resources/scss/invoice.scss',
                'resources/js/main.js',
                'resources/fonts/bootstrap-icons.woff2'
            ],
            refresh: true,
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: ['node_modules'],
            },
        },
    },
    server: {
        host: true,
        hmr: {
            host: 'localhost',
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
            usePolling: true,
        },
    },
}));
