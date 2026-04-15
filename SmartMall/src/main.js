import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'remixicon/fonts/remixicon.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from './stores/user'

// 1. 先创建 app
const app = createApp(App)

// 2. 创建 pinia 实例
const pinia = createPinia()

// 3. 挂载插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

const userStore = useUserStore(pinia)
userStore.hydrateFromStorage()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 4. 最后挂载
app.mount('#app')
