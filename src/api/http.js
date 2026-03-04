import axios from 'axios'
import { useUserStore } from '@/stores/user'  // 如果你用的是 pinia

const http = axios.create({
  baseURL: '/api',
  timeout: 600000
})

// 请求拦截器：自动带上 token
http.interceptors.request.use(
  (config) => {
    try {
      const store = useUserStore()
      if (store?.token) {
        config.headers.Authorization = `Bearer ${store.token}`
      }
    } catch (e) {
      console.warn('[AUTH WARN] No user store found')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：你原来的逻辑保持不变
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[HTTP ERROR]', err?.response || err)
    return Promise.reject(err)
  }
)

export default http
