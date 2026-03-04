<template>
  <div class="login-layout">
    <!-- 左侧工业风装饰 -->
    <div class="left-panel">
      <div class="gear gear-1" />
      <div class="gear gear-2" />
      <div class="gear gear-3" />
      <div class="brand-content">
        <h1 class="brand-title">
          设备维保系统
        </h1>
        <p class="brand-sub">
          Maintenance & Diagnostics Platform
        </p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">🔧</span>
            <span>智能故障诊断</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>数据可视化分析</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span>实时监控预警</span>
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
          ⏰ 您的会话已过期,请重新登录
        </div>

        <form
          class="login-form"
          @submit.prevent="login"
        >
          <div class="field">
            <label for="username">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
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
              <span class="input-icon">🔒</span>
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
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
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
              <span class="checkmark" />
              记住我 (保持15分钟登录)
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
            <span>🚀</span>
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
      <span class="message-icon">
        {{ message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️' }}
      </span>
      <span>{{ message.text }}</span>
      <button
        class="message-close"
        @click="hideMessage"
      >
        ×
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
/* ============================
   全局布局（Apple 极简双栏）
=============================== */
.login-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7f9 0%, #eef1f5 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro", Roboto, sans-serif;
  color: #1d1d1f;
  overflow: hidden;
}

/* ========================
   左侧展示区（Apple 风）
========================== */
.left-panel {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 60px;
  position: relative;
  background: #f9fafc;
  border-right: 1px solid rgba(0,0,0,0.05);
}

/* 柔光背景 */
.left-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(120,150,255,0.35), transparent 60%),
              radial-gradient(circle at 70% 80%, rgba(255,180,200,0.28), transparent 70%);
  opacity: 0.8;
  pointer-events: none;
}

/* 品牌区 */
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 34px;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
}

.brand-sub {
  color: #6b7280;
  margin-bottom: 40px;
  font-size: 16px;
}

/* 特性展示 */
.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 40px 0;
}

.feature-item {
  display: flex;
  gap: 16px;
  align-items: center;
  opacity: 0;
  animation: fadeUp 0.6s ease forwards;
}

.feature-icon-wrapper {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.feature-icon {
  font-size: 22px;
}

.feature-text h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.feature-text p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 14px;
}

/* 数据条 */
.stats-bar {
  display: flex;
  gap: 24px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
}

.stat-label {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}

/* =====================
   右侧登录卡片（Apple 风）
========================= */
.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 60px;
}

.card {
  background: #ffffff;
  width: 100%;
  max-width: 380px;
  padding: 40px 36px;
  border-radius: 22px;
  box-shadow:
      0px 12px 28px rgba(0,0,0,0.08),
      0px 2px 8px rgba(0,0,0,0.04);
  position: relative;
  animation: fadeIn 0.5s ease;
}

/* 标题 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
}

.card-subtitle {
  color: #6b7280;
  margin-top: 6px;
  font-size: 15px;
}

/* 表单字段 */
.field {
  margin-bottom: 22px;
}

.field label {
  display: block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f6f7;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}

.input-wrapper input {
  flex: 1;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
}

.input-wrapper.focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
}

.input-wrapper.error {
  border-color: #ef4444;
}

/* 输入图标 */
.input-icon {
  margin-right: 8px;
}

/* 密码切换 */
.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: 0.2s;
}
.toggle-password:hover {
  opacity: 1;
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

/* 记住我/忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.forgot-link {
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}
.forgot-link:hover {
  text-decoration: underline;
}

/* Apple 风按钮 */
.btn {
  width: 100%;
  background: #0071e3;
  color: white;
  padding: 14px 0;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  background: #0a84ff;
  transform: translateY(-1px);
}

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 分割线 */
.divider {
  text-align: center;
  margin: 24px 0;
  color: #9ca3af;
  font-size: 14px;
}

.divider span {
  display: inline-block;
  padding: 0 8px;
}

/* 快速登录按钮 */
.quick-btn {
  width: 100%;
  background: #f3f4f6;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.quick-btn:hover {
  background: #e5e7eb;
}

/* 页尾链接 */
.footer-links {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.footer-link {
  font-size: 14px;
  color: #6b7280;
  text-decoration: none;
}
.footer-link:hover {
  color: #374151;
}

/* 消息提示 */
.message {
  position: fixed;
  right: 20px;
  top: 20px;
  background: white;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 999;
  animation: fadeIn 0.3s ease;
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

/* ======================
   响应式
========================= */
@media (max-width: 950px) {
  .left-panel {
    display: none;
  }
  .right-panel {
    flex: 1;
    padding: 40px 20px;
  }
}
.remember-me {
  display: inline-flex;        /* inline-flex 保证不独占行且可 flex 布局 */
  align-items: center;         /* 垂直居中对齐 checkbox 和文字 */
  gap: 10px;                   /* 图标与文字间距 */
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;         /* 防止内部文字换行（如屏幕窄时） */
  font-size: 14px;
  color: #374151;
}

/* 隐藏真实 checkbox 但保留可访问性（不占布局空间） */
.remember-me input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  pointer-events: none;
}

/* 自定义勾选框外框 */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 4px;
  border: 1.6px solid #cbd5e1; /* 轻灰边框 */
  background: #ffffff;
  box-sizing: border-box;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
  flex-shrink: 0;
}

/* 勾（SVG）初始隐藏（但保留空间）*/
.custom-checkbox .checkmark {
  width: 12px;
  height: 12px;
  display: block;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.12s ease, transform 0.12s ease;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
}

/* 选中时的样式：背景/边框/勾显示 */
.remember-me input[type="checkbox"]:checked + .custom-checkbox {
  background: #3b82f6;        /* 主题蓝，和按钮一致 */
  border-color: #3b82f6;
  transform: translateY(-1px);
}
.remember-me input[type="checkbox"]:checked + .custom-checkbox .checkmark {
  opacity: 1;
  transform: scale(1);
  stroke: white;              /* 白色勾 */
}

/* 小屏时允许换行但保持控件排列紧凑（如果父容器强制换行） */
@media (max-width: 420px) {
  .remember-me {
    gap: 8px;
    font-size: 13px;
  }
}

/* 确保“记住我”文字与持续文本处于同行 */
.remember-text {
  display: inline-block;
  line-height: 1;
  color: #374151;
}

/* 若你使用了 .duration 子元素，保持其轻微变小 */
.remember-text .duration {
  color: #6b7280;
  font-size: 12px;
  margin-left: 6px;
}

/* 确保忘记密码与记住我在同一行（依赖 .remember-forgot: display:flex） */
.remember-forgot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}
.forgot-link {
  white-space: nowrap;
}

/* 可选：增强可访问性焦点样式，keyboard 可见 */
.remember-me input[type="checkbox"]:focus + .custom-checkbox {
  box-shadow: 0 0 0 3px rgba(59,130,246,0.18);
  outline: none;
}

/* 如果你原先把 .custom-checkbox 设置为 display:block; 或宽度100%，这段样式能覆盖它 */
.custom-checkbox, .remember-text { display: inline-flex !important; }
</style>