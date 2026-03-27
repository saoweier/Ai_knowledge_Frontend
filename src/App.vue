<template>
  <div id="app">
    <!-- 导航栏：仅在登录状态且非登录页时显示 -->
    <AppNavbar v-if="showNavbar" />
    
    <!-- 主内容区 -->
    <div :class="['main-content', { 'with-navbar': showNavbar }]">
      <router-view />
    </div>
    
    <!-- 会话超时警告弹窗 -->
    <transition name="modal-fade">
      <div
        v-if="showWarning"
        class="session-warning-modal"
      >
        <div class="warning-content">
          <div class="warning-icon">
            ⚠️
          </div>
          <h3>会话即将过期</h3>
          <p>若继续无操作，您的登录状态将在 <strong>2分钟</strong> 后失效</p>
          <p>是否继续保持登录状态?</p>
          <div class="warning-actions">
            <button
              class="btn-primary"
              @click="extendSession"
            >
              继续工作
            </button>
            <button
              class="btn-secondary"
              @click="logoutNow"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSessionMonitor } from '@/composables/useSessionMonitor'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()
const route = useRoute()
const store = useUserStore()
const showWarning = ref(false)

// 计算是否显示导航栏
const showNavbar = computed(() => {
  // 用户已登录 且 当前不是登录页
  return store.isLoggedIn && route.path !== '/login'
})

// 监听路由变化，确保导航栏状态正确
watch(() => route.path, (newPath) => {
  // 可以在这里添加额外的逻辑
  console.log('当前路由:', newPath, '显示导航栏:', showNavbar.value)
})

// 启动会话监控（仅在登录时）
useSessionMonitor({
  checkInterval: 30000, // 每30秒检查一次
  inactivityTimeout: 15 * 60 * 1000, // 连续无操作15分钟后退出
  warningTime: 120000, // 超时前2分钟警告
  onWarning: () => {
    // 显示警告弹窗
    if (store.isLoggedIn) {
      showWarning.value = true
    }
  },
  onExpired: () => {
    // 会话过期处理
    showWarning.value = false
  }
})

// 延长会话
function extendSession() {
  store.updateActivity()
  showWarning.value = false
}

// 立即退出
function logoutNow() {
  showWarning.value = false
  store.logout()
  router.push('/login')
}
</script>

<style>
.main-content {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.main-content > * {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.session-warning-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(26, 34, 31, 0.42);
  backdrop-filter: blur(12px);
  z-index: 10000;
}

.warning-content {
  width: min(100%, 480px);
  padding: 40px 36px;
  border-radius: 30px;
  text-align: center;
  background:
    radial-gradient(circle at top, rgba(180, 107, 49, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(246, 240, 232, 0.98));
  border: 1px solid rgba(65, 88, 80, 0.14);
  box-shadow: var(--shadow-lg);
  animation: modalSlideUp 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.warning-icon {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  margin: 0 auto 22px;
  border-radius: 26px;
  font-size: 52px;
  background: linear-gradient(135deg, rgba(180, 107, 49, 0.18), rgba(31, 98, 89, 0.14));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

.warning-content h3 {
  margin: 0 0 12px;
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.35rem, 2.2vw, 1.7rem);
  color: var(--text);
}

.warning-content p {
  margin: 0 0 10px;
  color: var(--text-soft);
  line-height: 1.7;
}

.warning-content strong {
  color: var(--accent);
}

.warning-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.warning-actions button {
  flex: 1;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.warning-actions button:hover {
  transform: translateY(-1px);
}

.btn-primary {
  color: #fffaf4;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  box-shadow: 0 14px 28px rgba(31, 98, 89, 0.18);
}

.btn-secondary {
  color: var(--text);
  background: rgba(255, 251, 246, 0.9);
  border-color: rgba(65, 88, 80, 0.14);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.24s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .warning-content {
    padding: 32px 22px;
    border-radius: 24px;
  }

  .warning-actions {
    flex-direction: column;
  }
}
</style>
