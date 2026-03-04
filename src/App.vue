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
          <p>您的登录会话将在 <strong>2分钟</strong> 后过期</p>
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
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 主内容区 */
.main-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.main-content.with-navbar {
  height: calc(100% - 640px);
}

/* 会话警告弹窗样式 */
.session-warning-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.warning-content {
  background: white;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 460px;
  text-align: center;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.warning-icon {
  font-size: 72px;
  margin-bottom: 24px;
  animation: iconPulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3));
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.warning-content h3 {
  font-size: 26px;
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 700;
}

.warning-content p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 12px;
}

.warning-content strong {
  color: #f59e0b;
  font-weight: 700;
  font-size: 18px;
}

.warning-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: center;
}

.warning-actions button {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.warning-actions button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.5s, height 0.5s;
}

.warning-actions button:active::before {
  width: 300px;
  height: 300px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary:active,
.btn-primary:active {
  transform: translateY(0);
}

/* 弹窗过渡动画 */
.modal-fade-enter-active {
  animation: modalFadeIn 0.3s ease-out;
}

.modal-fade-leave-active {
  animation: modalFadeOut 0.3s ease-in;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .warning-content {
    margin: 20px;
    padding: 36px 28px;
    max-width: 90%;
  }

  .warning-content h3 {
    font-size: 22px;
  }

  .warning-content p {
    font-size: 14px;
  }

  .warning-actions {
    flex-direction: column;
    gap: 10px;
  }

  .warning-actions button {
    width: 100%;
  }
}
</style>