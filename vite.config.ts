// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import NutUIResolver from '@nutui/auto-import-resolver'
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 开启 unplugin 插件，自动引入 NutUI 组件
    Icons({
      compiler: 'vue3',
      autoInstall: true, // 开启自动安装对应的图标集
    }),
    Components({
      resolvers: [NutUIResolver(), IconsResolver({
        prefix: 'icon', // 设置图标前缀，如 <icon-mdi-account />
      })],
    }),
  ]
})