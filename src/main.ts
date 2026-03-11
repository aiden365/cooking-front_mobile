import { createApp } from 'vue'
import './style.css'
import '@nutui/touch-emulator'
import { IconFont } from '@nutui/icons-vue'
import '@nutui/icons-vue/dist/style_iconfont.css'
import App from './App.vue'
createApp(App).use(IconFont).mount('#app')
