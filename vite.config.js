import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 本地开发时用 wrangler pages dev 代理 /api/*
    // 不用 wrangler 时可临时注释掉 proxy，API 会直接 404（不影响 mock 数据浏览）
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          'vant': ['vant']
        }
      }
    }
  }
})
