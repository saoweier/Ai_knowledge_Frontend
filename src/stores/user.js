// stores/user.js - 用户状态管理(集成Cookie)
import { defineStore } from 'pinia'
import { setCookie, getCookie, deleteCookie, refreshCookie } from '@/utils/cookie'

const TOKEN_KEY = 'auth_token'
const LAST_ACTIVITY_KEY = 'last_activity_time'
const TOKEN_COOKIE_DURATION = 7 * 24 * 60 // 登录凭证保留 7 天
const INACTIVITY_TIMEOUT = 15 // 连续未操作 15 分钟后登出

const loadLastActivityTime = () => {
  const raw = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY) || 0)
  return Number.isFinite(raw) && raw > 0 ? raw : Date.now()
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getCookie(TOKEN_KEY) || null,
    userInfo: null,
    lastActivityTime: loadLastActivityTime()
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin',
    username: (state) => state.userInfo?.username || '用户'
  },

  actions: {
    /**
     * 设置Token并写入Cookie
     */
    setToken(token) {
      this.token = token
      setCookie(TOKEN_KEY, token, TOKEN_COOKIE_DURATION)
      this.updateActivity()
    },

    /**
     * 设置用户信息
     */
    setUserInfo(info) {
      this.userInfo = info
    },

    /**
     * 更新最后活动时间并刷新Cookie
     */
    updateActivity() {
      this.lastActivityTime = Date.now()
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(this.lastActivityTime))
      if (this.token) {
        refreshCookie(TOKEN_KEY, TOKEN_COOKIE_DURATION)
      }
    },

    /**
     * 检查会话是否过期
     * @returns {boolean} true表示已过期
     */
    isSessionExpired() {
      if (!this.token) return true
      
      // 检查Cookie是否还存在
      const cookieToken = getCookie(TOKEN_KEY)
      if (!cookieToken) {
        return true
      }

      // 检查最后活动时间
      const now = Date.now()
      const timeSinceLastActivity = now - this.lastActivityTime
      const maxInactiveTime = INACTIVITY_TIMEOUT * 60 * 1000
      
      return timeSinceLastActivity > maxInactiveTime
    },

    /**
     * 登出
     */
    logout() {
      this.token = null
      this.userInfo = null
      this.lastActivityTime = 0
      deleteCookie(TOKEN_KEY)
      window.localStorage.removeItem(LAST_ACTIVITY_KEY)
    },

    /**
     * 从Cookie恢复会话
     */
    restoreSession() {
      const token = getCookie(TOKEN_KEY)
      if (token) {
        this.token = token
        this.lastActivityTime = loadLastActivityTime()
        if (this.isSessionExpired()) {
          this.logout()
          return false
        }
        refreshCookie(TOKEN_KEY, TOKEN_COOKIE_DURATION)
        return true
      }
      return false
    },

    /**
     * 检查并处理会话超时
     * @returns {boolean} true表示会话有效
     */
    checkSession() {
      if (this.isSessionExpired()) {
        this.logout()
        return false
      }
      this.updateActivity()
      return true
    }
  }
})
