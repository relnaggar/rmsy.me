import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                // Keep font filenames predictable for preloading
                assetFileNames: (assetInfo) => {
                    if (/\.(woff2?|ttf|otf|eot)$/.test(assetInfo.name)) {
                        return 'assets/fonts/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
    plugins: [
        laravel({
            input: [
                'resources/scss/styles.scss',
                'resources/scss/cacana.scss',
                'resources/scss/invoice.scss',
                'resources/js/main.js'
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
});
