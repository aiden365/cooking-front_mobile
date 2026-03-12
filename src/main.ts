import { createApp } from 'vue'
import router from './router'
import './style.css'
import '@nutui/touch-emulator'
import { IconFont } from '@nutui/icons-vue'
import '@nutui/icons-vue/dist/style_iconfont.css'
import App from './App.vue'

createApp(App).use(router).use(IconFont).mount('#app')
