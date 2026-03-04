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

const ignoreResizeObserverError = () => {
  const resizeObserverErrMsg = 'ResizeObserver loop completed with undelivered notifications.';
  window.addEventListener('error', (e) => {
    if (e.message === resizeObserverErrMsg) {
      e.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (String(e.reason) === resizeObserverErrMsg) {
      e.stopImmediatePropagation();
    }
  });
};

ignoreResizeObserverError();


// main.js
const resizeObserverErr = (e) => {
  if (
    e.message ===
    "ResizeObserver loop completed with undelivered notifications."
  ) {
    e.stopImmediatePropagation();
  }
};
window.addEventListener("error", resizeObserverErr);
window.addEventListener("unhandledrejection", resizeObserverErr);