import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css' // 导入 Tailwind CSS

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')

const RESIZE_OBSERVER_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
]

const shouldIgnoreResizeObserver = (value) => {
  const message = String(value?.message || value?.reason?.message || value?.reason || value || '')
  return RESIZE_OBSERVER_ERRORS.some((item) => message.includes(item))
}

const ignoreResizeObserverError = (event) => {
  if (!shouldIgnoreResizeObserver(event)) return
  event.preventDefault?.()
  event.stopImmediatePropagation?.()
}

window.addEventListener('error', ignoreResizeObserverError)
window.addEventListener('unhandledrejection', ignoreResizeObserverError)
