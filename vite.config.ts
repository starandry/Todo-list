import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: './',
    plugins: [
        react(),
        {
            name: 'fix-html-paths',
            transformIndexHtml(html) {
                return html
                    .replace(/ src="\/assets\//g, ' src="./assets/')
                    .replace(/ href="\/assets\//g, ' href="./assets/')
            },
        },
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    }
                },
            },
        },
    },
})
