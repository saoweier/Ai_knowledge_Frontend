// composables/useSessionMonitor.js - 会话监控Hook
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 监控用户活动和会话超时
 * @param {Object} options 配置选项
 */
export function useSessionMonitor(options = {}) {
  const router = useRouter()
  const store = useUserStore()

  const {
    checkInterval = 30000, // 检查间隔(毫秒) - 默认30秒
    inactivityTimeout = 15 * 60 * 1000, // 连续未操作超时
    warningTime = 120000, // 超时前警告时间(毫秒) - 默认2分钟
    onWarning = null, // 警告回调
    onExpired = null // 过期回调
  } = options

  let checkTimer = null
  let warningTimer = null

  // 用户活动事件列表
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ]

  const scheduleWarning = () => {
    if (warningTimer) {
      clearTimeout(warningTimer)
      warningTimer = null
    }

    if (!store.isLoggedIn) return

    const elapsed = Date.now() - store.lastActivityTime
    const remaining = inactivityTimeout - elapsed
    const timeUntilWarning = remaining - warningTime

    if (remaining <= warningTime) {
      onWarning?.()
      return
    }

    if (timeUntilWarning > 0) {
      warningTimer = setTimeout(() => {
        if (store.isLoggedIn) {
          onWarning?.()
        }
      }, timeUntilWarning)
    }
  }

  // 处理用户活动
  const handleActivity = () => {
    if (store.isLoggedIn) {
      store.updateActivity()
      scheduleWarning()
    }
  }

  // 定期检查会话状态
  const checkSession = () => {
    if (store.isLoggedIn && store.isSessionExpired()) {
      handleSessionExpired()
    }
  }

  // 处理会话过期
  const handleSessionExpired = () => {
    console.warn('会话已过期')
    
    if (onExpired) {
      onExpired()
    }

    store.logout()
    router.push({
      path: '/login',
      query: { expired: '1', redirect: router.currentRoute.value.fullPath }
    })
  }

  // 启动监控
  const startMonitoring = () => {
    stopMonitoring()

    // 添加活动事件监听
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // 初始化活动
    scheduleWarning()

    // 启动定期检查
    checkTimer = setInterval(checkSession, checkInterval)
  }

  // 停止监控
  const stopMonitoring = () => {
    // 移除活动事件监听
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity)
    })

    // 清除定时器
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }

    if (warningTimer) {
      clearTimeout(warningTimer)
      warningTimer = null
    }
  }

  // 组件挂载时启动
  onMounted(() => {
    if (store.isLoggedIn) {
      startMonitoring()
    }
  })

  watch(() => store.isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      startMonitoring()
      return
    }
    stopMonitoring()
  })

  // 组件卸载时停止
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    startMonitoring,
    stopMonitoring
  }
}
