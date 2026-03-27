<template>
  <div class="login-layout">
    <!-- 左侧 AI 知识库品牌展示 -->
    <div class="left-panel">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="gradient-orb orb-1" />
        <div class="gradient-orb orb-2" />
        <div class="grid-pattern" />
      </div>
      
      <div class="brand-content">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h1 class="brand-title">
          AI知识库智能平台
        </h1>
        <p class="brand-sub">
          Intelligent Knowledge Management System
        </p>
        
        <!-- 功能特性 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>智能问答</h4>
              <p>基于AI大模型的智能问答系统</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <circle cx="5" cy="6" r="2"/>
                <circle cx="19" cy="6" r="2"/>
                <circle cx="5" cy="18" r="2"/>
                <circle cx="19" cy="18" r="2"/>
                <path d="M7 7l3 3M14 14l3 3M7 17l3-3M14 10l3-3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>知识图谱</h4>
              <p>可视化知识关联与分析</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>实时预警</h4>
              <p>设备状态监控与智能预警</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="right-panel">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            欢迎回来
          </h2>
          <p class="card-subtitle">
            请登录您的账户
          </p>
        </div>

        <!-- 会话过期提示 -->
        <div
          v-if="showExpiredMessage"
          class="expired-warning"
        >
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span>您的会话已过期,请重新登录</span>
        </div>

        <form
          class="login-form"
          @submit.prevent="login"
        >
          <div class="field">
            <label for="username">用户名</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input 
                id="username"
                v-model="username" 
                type="text" 
                placeholder="请输入用户名"
                :class="{ 'error': usernameError }"
                autocomplete="username"
                @blur="validateUsername"
                @input="clearUsernameError"
              >
            </div>
            <span
              v-if="usernameError"
              class="error-text"
            >{{ usernameError }}</span>
          </div>

          <div class="field">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input 
                id="password"
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                :class="{ 'error': passwordError }"
                autocomplete="current-password"
                @blur="validatePassword"
                @input="clearPasswordError"
              >
              <button 
                type="button" 
                class="toggle-password" 
                :title="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span
              v-if="passwordError"
              class="error-text"
            >{{ passwordError }}</span>
          </div>

          <div class="remember-forgot">
            <label class="remember-me">
              <input
                v-model="rememberMe"
                type="checkbox"
              >
              <span class="custom-checkbox">
                <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span class="remember-text">记住我 <span class="duration">(保持15分钟登录)</span></span>
            </label>
            <a
              href="#"
              class="forgot-link"
              @click.prevent="showForgotPassword"
            >忘记密码?</a>
          </div>

          <button 
            type="submit" 
            class="btn"
            :class="{ 'loading': isLoading }"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">登录</span>
            <span
              v-else
              class="loading-content"
            >
              <span class="spinner" />
              登录中...
            </span>
          </button>
        </form>

        <div class="divider">
          <span>或</span>
        </div>

        <div class="quick-login">
          <button
            class="quick-btn"
            title="演示账户快速登录"
            @click="quickLogin"
          >
            <svg class="quick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z"/>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            演示账户登录
          </button>
        </div>

        <div class="footer-links">
          <a
            href="#"
            @click.prevent="showHelp"
          >使用帮助</a>
          <span class="separator">|</span>
          <a
            href="#"
            @click.prevent="showContact"
          >联系技术支持</a>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div
      v-if="message.show"
      :class="['message', message.type]"
    >
      <svg v-if="message.type === 'success'" class="message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <svg v-else-if="message.type === 'error'" class="message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <svg v-else class="message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>{{ message.text }}</span>
      <button
        class="message-close"
        @click="hideMessage"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import http from '@/api/http'

const router = useRouter()
const route = useRoute()
const store = useUserStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const isLoading = ref(false)
const showExpiredMessage = ref(false)

// 验证错误状态
const usernameError = ref('')
const passwordError = ref('')

// 消息提示
const message = reactive({
  show: false,
  type: 'info',
  text: ''
})

// 检查是否是会话过期跳转
onMounted(() => {
  if (route.query.expired === '1') {
    showExpiredMessage.value = true
    showMessage('会话已过期,请重新登录', 'error')
  }
})

// 验证函数
function validateUsername() {
  if (!username.value.trim()) {
    usernameError.value = '请输入用户名'
    return false
  }
  if (username.value.length < 3) {
    usernameError.value = '用户名至少3个字符'
    return false
  }
  usernameError.value = ''
  return true
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = '请输入密码'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = '密码至少6位'
    return false
  }
  passwordError.value = ''
  return true
}

function clearUsernameError() {
  usernameError.value = ''
}

function clearPasswordError() {
  passwordError.value = ''
}

// 显示消息
function showMessage(text, type = 'info') {
  message.text = text
  message.type = type
  message.show = true
  setTimeout(() => {
    hideMessage()
  }, 5000)
}

function hideMessage() {
  message.show = false
}

// 登录函数
async function login() {
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  
  if (!isUsernameValid || !isPasswordValid) {
    showMessage('请检查输入信息', 'error')
    return
  }

  isLoading.value = true
  
  try {
    const formData = new URLSearchParams()
    formData.append('username', username.value)
    formData.append('password', password.value)
    
    const res = await http.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    // 设置token(会自动写入cookie)
    store.setToken(res.data.access_token)
    
    // 设置用户信息
    store.setUserInfo({
      username: username.value,
      role: username.value === 'admin' ? 'admin' : 'user'
    })
    
    showMessage('登录成功!会话有效期15分钟', 'success')
    
    // 跳转到原来要访问的页面或首页
    const redirect = route.query.redirect || '/'
    setTimeout(() => {
      router.push(redirect)
    }, 1000)
    
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.detail || '登录失败,请检查用户名或密码'
    showMessage(errorMsg, 'error')
  } finally {
    isLoading.value = false
  }
}

// 快速登录演示账户
function quickLogin() {
  username.value = 'vistor'
  password.value = '123456'
  showMessage('已填入演示账户信息', 'info')
}

// 忘记密码
function showForgotPassword() {
  showMessage('请联系管理员重置密码,电话:400-xxx-xxxx', 'info')
}

// 显示帮助
function showHelp() {
  showMessage('如需帮助,请查看用户手册或联系技术支持', 'info')
}

// 显示联系方式
function showContact() {
  showMessage('技术支持:support@company.com 或 400-xxx-xxxx', 'info')
}
</script>



<style>
/* ====================================
   AI 知识库风格登录页
   Fonts: Space Grotesk + DM Sans
   Color: Blue (#2563EB) based theme
==================================== */

/* 全局布局 */
.login-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
  overflow: hidden;
}

/* ========================
   左侧展示区 (AI 主题)
========================== */
.left-panel {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  position: relative;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e3a5f 50%, #0f172a 100%);
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  bottom: -50px;
  right: -50px;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* 品牌内容 */
.brand-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.logo-section {
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: white;
}

.brand-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 48px 0;
  font-weight: 400;
}

/* 功能特性 */
.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  animation: fadeUp 0.6s ease forwards;
  opacity: 0;
}

.feature-item:nth-child(1) { animation-delay: 0.1s; }
.feature-item:nth-child(2) { animation-delay: 0.2s; }
.feature-item:nth-child(3) { animation-delay: 0.3s; }

.feature-icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 12px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon-wrapper {
  background: rgba(59, 130, 246, 0.25);
  transform: translateX(4px);
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: #60a5fa;
}

.feature-text h4 {
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

/* =====================
   右侧登录卡片
======================== */
.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #ffffff;
}

.card {
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  animation: fadeIn 0.5s ease;
}

/* 标题 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card-subtitle {
  color: #64748b;
  margin: 8px 0 0 0;
  font-size: 15px;
}

/* 过期警告 */
.expired-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #92400e;
}

.warning-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* 表单字段 */
.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

.input-wrapper.error {
  border-color: #ef4444;
}

.input-wrapper.error:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  margin-right: 12px;
  flex-shrink: 0;
}

.input-wrapper input {
  flex: 1;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  background: transparent;
  border: none;
  outline: none;
  color: #1e293b;
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

/* 密码切换 */
.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.toggle-password:hover {
  opacity: 1;
}

.eye-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

/* 错误文本 */
.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  margin-top: 6px;
  font-size: 13px;
}

/* 记住我 / 忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #374151;
}

.remember-me input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 4px;
  border: 1.6px solid #cbd5e1;
  background: #ffffff;
  transition: all 0.15s ease;
}

.checkmark {
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s ease;
  stroke: #ffffff;
}

.remember-me input[type="checkbox"]:checked + .custom-checkbox {
  background: #2563eb;
  border-color: #2563eb;
}

.remember-me input[type="checkbox"]:checked + .custom-checkbox .checkmark {
  opacity: 1;
  transform: scale(1);
}

.remember-me input[type="checkbox"]:focus + .custom-checkbox {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.remember-text {
  display: inline-block;
  line-height: 1;
}

.duration {
  color: #94a3b8;
  font-size: 12px;
  margin-left: 4px;
}

.forgot-link {
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* 登录按钮 */
.btn {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 14px 0;
  border-radius: 10px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn.loading {
  background: #93c5fd;
}

/* 加载动画 */
.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分割线 */
.divider {
  text-align: center;
  margin: 24px 0;
  color: #94a3b8;
  font-size: 14px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 30px);
  height: 1px;
  background: #e2e8f0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  display: inline-block;
  padding: 0 12px;
  background: #ffffff;
  position: relative;
}

/* 快速登录按钮 */
.quick-btn {
  width: 100%;
  background: #ffffff;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quick-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.quick-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

/* 页尾链接 */
.footer-links {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
}

.footer-links a:hover {
  color: #2563eb;
}

.separator {
  color: #cbd5e1;
}

/* 消息提示 */
.message {
  position: fixed;
  right: 20px;
  top: 20px;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
  font-size: 14px;
  max-width: 360px;
}

.message.success {
  border-left: 4px solid #16a34a;
}

.message.error {
  border-left: 4px solid #dc2626;
}

.message.info {
  border-left: 4px solid #2563eb;
}

.message-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.message.success .message-icon { color: #16a34a; }
.message.error .message-icon { color: #dc2626; }
.message.info .message-icon { color: #2563eb; }

.message-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  margin-left: auto;
}

.message-close:hover {
  opacity: 1;
}

.message-close svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

/* 动画 */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ======================
   响应式设计
======================== */

/* 平板 (隐藏左侧面板) */
@media (max-width: 1024px) {
  .left-panel {
    display: none;
  }
  
  .right-panel {
    flex: 1;
    background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .login-layout {
    overflow-y: auto;
  }
  
  .right-panel {
    padding: 24px 20px;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .card {
    padding: 32px 24px;
    box-shadow: none;
  }
  
  .card-title {
    font-size: 24px;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .message {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .forgot-link {
    align-self: flex-end;
    margin-top: -4px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .right-panel {
    padding: 24px 16px;
  }
  
  .card {
    padding: 28px 20px;
  }
  
  .btn {
    padding: 12px 0;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .separator {
    display: none;
  }
}

.login-layout {
  background:
    radial-gradient(circle at top left, rgba(31, 98, 89, 0.1), transparent 24%),
    radial-gradient(circle at bottom right, rgba(180, 107, 49, 0.12), transparent 22%),
    linear-gradient(180deg, #f4efe6 0%, #f7f3ec 100%);
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

.left-panel {
  background:
    radial-gradient(circle at 20% 20%, rgba(180, 107, 49, 0.16), transparent 22%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08), transparent 18%),
    linear-gradient(160deg, #143934 0%, #102824 52%, #1d4f47 100%);
}

.orb-1 {
  background: radial-gradient(circle, rgba(180, 107, 49, 0.7) 0%, transparent 68%);
}

.orb-2 {
  background: radial-gradient(circle, rgba(31, 98, 89, 0.56) 0%, transparent 70%);
}

.grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}

.logo-icon,
.feature-icon-wrapper {
  background: rgba(255, 250, 244, 0.1);
  border-color: rgba(255, 233, 207, 0.2);
  box-shadow: none;
}

.logo-icon svg,
.feature-icon {
  color: #f2c792;
}

.brand-title,
.feature-text h4 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
}

.brand-sub,
.feature-text p {
  color: rgba(255, 245, 236, 0.68);
}

.right-panel {
  background: transparent;
}

.card {
  max-width: 430px;
  padding: 34px 30px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(246, 240, 232, 0.92));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-lg);
}

.card-title {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 24px;
  color: var(--text);
}

.card-subtitle {
  color: var(--text-soft);
}

.expired-warning {
  background: rgba(244, 228, 211, 0.72);
  border-color: rgba(180, 107, 49, 0.28);
  color: #8b4f22;
}

.field label,
.remember-me,
.remember-text {
  color: var(--text);
}

.input-wrapper {
  background: rgba(255, 251, 246, 0.8);
  border-color: rgba(65, 88, 80, 0.12);
  border-radius: 16px;
}

.input-wrapper:focus-within {
  border-color: rgba(31, 98, 89, 0.3);
  box-shadow: 0 0 0 4px rgba(31, 98, 89, 0.08);
}

.input-icon,
.eye-icon,
.duration,
.divider,
.footer-links a,
.quick-icon {
  color: var(--text-faint);
}

.btn {
  border-radius: 16px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  box-shadow: 0 16px 26px rgba(31, 98, 89, 0.18);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--brand-strong) 0%, #113833 100%);
  box-shadow: 0 18px 30px rgba(31, 98, 89, 0.22);
}

.quick-btn {
  border-radius: 16px;
  background: rgba(255, 251, 246, 0.78);
  border-color: rgba(65, 88, 80, 0.12);
  color: var(--text-soft);
}

.quick-btn:hover {
  background: rgba(244, 228, 211, 0.38);
  border-color: rgba(180, 107, 49, 0.24);
}

.forgot-link,
.footer-links a:hover {
  color: var(--brand);
}

.message {
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-md);
}

@media (max-width: 1024px) {
  .right-panel {
    background:
      radial-gradient(circle at top left, rgba(31, 98, 89, 0.1), transparent 24%),
      linear-gradient(180deg, #f4efe6 0%, #f7f3ec 100%);
  }
}

@media (max-width: 768px) {
  .card {
    padding: 28px 22px;
    border-radius: 24px;
  }
}

.login-layout {
  isolation: isolate;
}

.left-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 38%, rgba(180, 107, 49, 0.08));
  pointer-events: none;
}

.brand-content,
.card {
  animation: loginRise 720ms var(--ease-out-expo) both;
}

.brand-content {
  animation-delay: 80ms;
}

.card {
  animation-delay: 140ms;
  transform-origin: center top;
}

.logo-icon,
.feature-icon-wrapper,
.btn,
.quick-btn,
.toggle-password,
.message-close {
  transition:
    transform 220ms var(--ease-out-quart),
    box-shadow 220ms var(--ease-out-quart),
    background-color 220ms var(--ease-out-quart),
    border-color 220ms var(--ease-out-quart),
    color 220ms var(--ease-out-quart),
    opacity 220ms var(--ease-out-quart);
}

.logo-icon {
  position: relative;
  overflow: hidden;
}

.logo-icon::after,
.btn::after,
.quick-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 50%, transparent 80%);
  transform: translateX(-120%);
  transition: transform 680ms var(--ease-out-expo);
  pointer-events: none;
}

.logo-icon:hover,
.feature-item:hover .feature-icon-wrapper {
  transform: translateY(-2px);
}

.logo-icon:hover::after,
.btn:hover::after,
.quick-btn:hover::after {
  transform: translateX(120%);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 34px 72px rgba(27, 42, 37, 0.16);
}

.input-wrapper {
  transition:
    transform 220ms var(--ease-out-quart),
    border-color 220ms var(--ease-out-quart),
    box-shadow 220ms var(--ease-out-quart),
    background-color 220ms var(--ease-out-quart);
}

.input-wrapper:hover {
  transform: translateY(-1px);
  border-color: rgba(180, 107, 49, 0.18);
}

.input-wrapper:focus-within {
  transform: translateY(-1px);
}

.toggle-password {
  border-radius: 10px;
}

.toggle-password:hover {
  transform: scale(1.06);
  background: rgba(31, 98, 89, 0.08);
}

.btn,
.quick-btn {
  position: relative;
  overflow: hidden;
}

.btn:hover:not(:disabled),
.quick-btn:hover {
  transform: translateY(-2px);
}

.btn:active:not(:disabled),
.quick-btn:active,
.toggle-password:active,
.message-close:active {
  transform: scale(0.98);
}

.quick-btn:hover {
  box-shadow: 0 18px 34px rgba(180, 107, 49, 0.14);
}

.footer-links a,
.forgot-link {
  position: relative;
  transition: color 180ms var(--ease-out-quart);
}

.footer-links a::after,
.forgot-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0.2);
  transform-origin: left center;
  opacity: 0;
  transition:
    transform 180ms var(--ease-out-quart),
    opacity 180ms var(--ease-out-quart);
}

.footer-links a:hover::after,
.forgot-link:hover::after {
  transform: scaleX(1);
  opacity: 0.9;
}

.message {
  animation: toastRise 360ms var(--ease-out-expo);
}

@keyframes loginRise {
  0% {
    opacity: 0;
    transform: translateY(22px) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastRise {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
