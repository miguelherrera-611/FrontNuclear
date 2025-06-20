import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            },
            '/agenda': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            },
            '/historiaClinica': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            },
            '/servicios': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})