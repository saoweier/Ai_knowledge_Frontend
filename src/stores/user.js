// stores/user.js - 用户状态管理(集成Cookie)
import { defineStore } from 'pinia'
import { setCookie, getCookie, deleteCookie, refreshCookie } from '@/utils/cookie'

const TOKEN_KEY = 'auth_token'
const SESSION_DURATION = 15 // 会话持续时间(分钟)

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getCookie(TOKEN_KEY) || null,
    userInfo: null,
    lastActivityTime: Date.now()
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
      setCookie(TOKEN_KEY, token, SESSION_DURATION)
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
      if (this.token) {
        refreshCookie(TOKEN_KEY, SESSION_DURATION)
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
      const maxInactiveTime = SESSION_DURATION * 60 * 1000
      
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
    },

    /**
     * 从Cookie恢复会话
     */
    restoreSession() {
      const token = getCookie(TOKEN_KEY)
      if (token) {
        this.token = token
        this.updateActivity()
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