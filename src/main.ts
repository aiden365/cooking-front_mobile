import { createApp } from 'vue'
import router from './router'
import './style.css'
import '@nutui/touch-emulator'
import '@nutui/nutui/dist/packages/toast/index.css'
import { IconFont } from '@nutui/icons-vue'
import '@nutui/icons-vue/dist/style_iconfont.css'
import App from './App.vue'
import { setupMock } from '../mock'
import { CalendarCard,Toast } from '@nutui/nutui'
setupMock()

createApp(App).use(router).use(Toast).use(IconFont).use(CalendarCard).mount('#app')
