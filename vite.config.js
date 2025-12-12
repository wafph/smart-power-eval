import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // 设为 1000 KiB
  },
  base: './',
  plugins: [
    vue(),
    VueSetupExtend(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '~': '/src/assets',
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 5174, // 设置默认端口为3001
    strictPort: true, // 如果端口被占用，直接退出而不是尝试下一个可用端口
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/rest/api4': {
        // target: 'http://218.30.123.195:8601', // 后端服务器地址
        target: 'http://localhost:8601', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rest\/api4/, ''), // 移除前缀
      },
      
    },
  },
});
