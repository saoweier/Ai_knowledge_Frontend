<template>
  <div class="user-management-layout">
    <!-- 左侧工业风装饰 -->
    <div class="left-panel">
      <div class="gear gear-1" />
      <div class="gear gear-2" />
      <div class="gear gear-3" />
      <div class="brand-content">
        <h1 class="brand-title">
          用户管理系统
        </h1>
        <p class="brand-sub">
          User Management Platform
        </p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <span>用户权限管理</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔐</span>
            <span>密码安全管控</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚙️</span>
            <span>系统配置管理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧功能卡片 -->
    <div class="right-panel">
      <div class="card">
        <!-- 功能选择器 -->
        <div class="tab-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-btn', { 'active': activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- 新增用户 -->
        <div
          v-if="activeTab === 'register'"
          class="tab-content"
        >
          <div class="card-header">
            <h2 class="card-title">
              新增用户
            </h2>
            <p class="card-subtitle">
              创建新的系统账户
            </p>
          </div>

          <form
            class="form"
            @submit.prevent="register"
          >
            <div class="field">
              <label for="reg-username">用户名</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input 
                  id="reg-username"
                  v-model="registerForm.username" 
                  type="text" 
                  placeholder="请输入用户名"
                  :class="{ 'error': registerForm.usernameError }"
                  @blur="validateRegisterUsername"
                  @input="clearRegisterUsernameError"
                >
              </div>
              <span
                v-if="registerForm.usernameError"
                class="error-text"
              >{{ registerForm.usernameError }}</span>
            </div>

            <div class="field">
              <label for="reg-password">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="reg-password"
                  v-model="registerForm.password" 
                  :type="registerForm.showPassword ? 'text' : 'password'" 
                  placeholder="请输入密码"
                  :class="{ 'error': registerForm.passwordError }"
                  @blur="validateRegisterPassword"
                  @input="clearRegisterPasswordError"
                >
                <button 
                  type="button" 
                  class="toggle-password" 
                  @click="registerForm.showPassword = !registerForm.showPassword"
                >
                  {{ registerForm.showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span
                v-if="registerForm.passwordError"
                class="error-text"
              >{{ registerForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="reg-confirm-password">确认密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="reg-confirm-password"
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入密码"
                  :class="{ 'error': registerForm.confirmPasswordError }"
                  @blur="validateConfirmPassword"
                  @input="clearConfirmPasswordError"
                >
              </div>
              <span
                v-if="registerForm.confirmPasswordError"
                class="error-text"
              >{{ registerForm.confirmPasswordError }}</span>
            </div>

            <div class="field">
              <label class="checkbox-wrapper">
                <input
                  v-model="registerForm.isAdmin"
                  type="checkbox"
                >
                <span class="checkmark" />
                <span class="checkbox-label">
                  <span class="role-icon">👨‍💼</span>
                  管理员权限
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              class="btn"
              :class="{ 'loading': registerForm.isLoading }"
              :disabled="registerForm.isLoading"
            >
              <span v-if="!registerForm.isLoading">创建用户</span>
              <span
                v-else
                class="loading-content"
              >
                <span class="spinner" />
                创建中...
              </span>
            </button>
          </form>
        </div>

        <!-- 修改密码 -->
        <div
          v-if="activeTab === 'change'"
          class="tab-content"
        >
          <div class="card-header">
            <h2 class="card-title">
              修改密码
            </h2>
            <p class="card-subtitle">
              更改您的账户密码
            </p>
          </div>

          <form
            class="form"
            @submit.prevent="changePassword"
          >
            <div class="field">
              <label for="new-password">新密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="new-password"
                  v-model="changeForm.newPassword" 
                  :type="changeForm.showPassword ? 'text' : 'password'" 
                  placeholder="请输入新密码"
                  :class="{ 'error': changeForm.passwordError }"
                  @blur="validateChangePassword"
                  @input="clearChangePasswordError"
                >
                <button 
                  type="button" 
                  class="toggle-password" 
                  @click="changeForm.showPassword = !changeForm.showPassword"
                >
                  {{ changeForm.showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span
                v-if="changeForm.passwordError"
                class="error-text"
              >{{ changeForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="change-confirm-password">确认新密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="change-confirm-password"
                  v-model="changeForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  :class="{ 'error': changeForm.confirmPasswordError }"
                  @blur="validateChangeConfirmPassword"
                  @input="clearChangeConfirmPasswordError"
                >
              </div>
              <span
                v-if="changeForm.confirmPasswordError"
                class="error-text"
              >{{ changeForm.confirmPasswordError }}</span>
            </div>

            <button 
              type="submit" 
              class="btn"
              :class="{ 'loading': changeForm.isLoading }"
              :disabled="changeForm.isLoading"
            >
              <span v-if="!changeForm.isLoading">修改密码</span>
              <span
                v-else
                class="loading-content"
              >
                <span class="spinner" />
                修改中...
              </span>
            </button>
          </form>
        </div>

        <!-- 重设密码 (管理员) -->
        <div
          v-if="activeTab === 'reset'"
          class="tab-content"
        >
          <div class="card-header">
            <h2 class="card-title">
              重设密码
            </h2>
            <p class="card-subtitle">
              管理员重置用户密码
            </p>
          </div>

          <form
            class="form"
            @submit.prevent="resetPassword"
          >
            <div class="field">
              <label for="reset-username">目标用户名</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input 
                  id="reset-username"
                  v-model="resetForm.username" 
                  type="text" 
                  placeholder="请输入要重置密码的用户名"
                  :class="{ 'error': resetForm.usernameError }"
                  @blur="validateResetUsername"
                  @input="clearResetUsernameError"
                >
              </div>
              <span
                v-if="resetForm.usernameError"
                class="error-text"
              >{{ resetForm.usernameError }}</span>
            </div>

            <div class="field">
              <label for="reset-new-password">新密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="reset-new-password"
                  v-model="resetForm.newPassword" 
                  :type="resetForm.showPassword ? 'text' : 'password'" 
                  placeholder="请输入新密码"
                  :class="{ 'error': resetForm.passwordError }"
                  @blur="validateResetPassword"
                  @input="clearResetPasswordError"
                >
                <button 
                  type="button" 
                  class="toggle-password" 
                  @click="resetForm.showPassword = !resetForm.showPassword"
                >
                  {{ resetForm.showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span
                v-if="resetForm.passwordError"
                class="error-text"
              >{{ resetForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="reset-confirm-password">确认新密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="reset-confirm-password"
                  v-model="resetForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  :class="{ 'error': resetForm.confirmPasswordError }"
                  @blur="validateResetConfirmPassword"
                  @input="clearResetConfirmPasswordError"
                >
              </div>
              <span
                v-if="resetForm.confirmPasswordError"
                class="error-text"
              >{{ resetForm.confirmPasswordError }}</span>
            </div>

            <button 
              type="submit" 
              class="btn btn-warning"
              :class="{ 'loading': resetForm.isLoading }"
              :disabled="resetForm.isLoading"
            >
              <span v-if="!resetForm.isLoading">重置密码</span>
              <span
                v-else
                class="loading-content"
              >
                <span class="spinner" />
                重置中...
              </span>
            </button>
          </form>
        </div>

        <div class="footer-links">
          <a
            href="#"
            @click.prevent="goBack"
          >返回主页</a>
          <span class="separator">|</span>
          <a
            href="#"
            @click.prevent="showHelp"
          >使用帮助</a>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import http from '@/api/http'

const router = useRouter()
const store = useUserStore()
// 检查用户是否已登录
if (!store.token) {
  router.push('/login')
}

// 标签页配置
const tabs = [
  { key: 'register', label: '新增用户', icon: '👥' },
  { key: 'change', label: '修改密码', icon: '🔒' },
  { key: 'reset', label: '重设密码', icon: '🔧' }
]

const activeTab = ref('register')

// 新增用户表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  isAdmin: false,
  showPassword: false,
  isLoading: false,
  usernameError: '',
  passwordError: '',
  confirmPasswordError: ''
})

// 修改密码表单
const changeForm = reactive({
  newPassword: '',
  confirmPassword: '',
  showPassword: false,
  isLoading: false,
  passwordError: '',
  confirmPasswordError: ''
})

// 重设密码表单
const resetForm = reactive({
  username: '',
  newPassword: '',
  confirmPassword: '',
  showPassword: false,
  isLoading: false,
  usernameError: '',
  passwordError: '',
  confirmPasswordError: ''
})

// 消息提示
const message = reactive({
  show: false,
  type: 'info',
  text: ''
})

// 标签页切换
function switchTab(tab) {
  activeTab.value = tab
  // 清理所有表单
  resetAllForms()
}

function resetAllForms() {
  // 重置注册表单
  Object.assign(registerForm, {
    username: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    showPassword: false,
    isLoading: false,
    usernameError: '',
    passwordError: '',
    confirmPasswordError: ''
  })
  
  // 重置修改密码表单
  Object.assign(changeForm, {
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    isLoading: false,
    passwordError: '',
    confirmPasswordError: ''
  })
  
  // 重置重设密码表单
  Object.assign(resetForm, {
    username: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    isLoading: false,
    usernameError: '',
    passwordError: '',
    confirmPasswordError: ''
  })
}

// 验证函数 - 注册
function validateRegisterUsername() {
  if (!registerForm.username.trim()) {
    registerForm.usernameError = '请输入用户名'
    return false
  }
  if (registerForm.username.length < 3) {
    registerForm.usernameError = '用户名至少3个字符'
    return false
  }
  registerForm.usernameError = ''
  return true
}

function validateRegisterPassword() {
  if (!registerForm.password) {
    registerForm.passwordError = '请输入密码'
    return false
  }
  if (registerForm.password.length < 6) {
    registerForm.passwordError = '密码至少6位'
    return false
  }
  registerForm.passwordError = ''
  return true
}

function validateConfirmPassword() {
  if (!registerForm.confirmPassword) {
    registerForm.confirmPasswordError = '请确认密码'
    return false
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerForm.confirmPasswordError = '两次输入的密码不一致'
    return false
  }
  registerForm.confirmPasswordError = ''
  return true
}

function clearRegisterUsernameError() {
  registerForm.usernameError = ''
}

function clearRegisterPasswordError() {
  registerForm.passwordError = ''
}

function clearConfirmPasswordError() {
  registerForm.confirmPasswordError = ''
}

// 验证函数 - 修改密码
function validateChangePassword() {
  if (!changeForm.newPassword) {
    changeForm.passwordError = '请输入新密码'
    return false
  }
  if (changeForm.newPassword.length < 6) {
    changeForm.passwordError = '密码至少6位'
    return false
  }
  changeForm.passwordError = ''
  return true
}

function validateChangeConfirmPassword() {
  if (!changeForm.confirmPassword) {
    changeForm.confirmPasswordError = '请确认新密码'
    return false
  }
  if (changeForm.newPassword !== changeForm.confirmPassword) {
    changeForm.confirmPasswordError = '两次输入的密码不一致'
    return false
  }
  changeForm.confirmPasswordError = ''
  return true
}

function clearChangePasswordError() {
  changeForm.passwordError = ''
}

function clearChangeConfirmPasswordError() {
  changeForm.confirmPasswordError = ''
}

// 验证函数 - 重设密码
function validateResetUsername() {
  if (!resetForm.username.trim()) {
    resetForm.usernameError = '请输入用户名'
    return false
  }
  resetForm.usernameError = ''
  return true
}

function validateResetPassword() {
  if (!resetForm.newPassword) {
    resetForm.passwordError = '请输入新密码'
    return false
  }
  if (resetForm.newPassword.length < 6) {
    resetForm.passwordError = '密码至少6位'
    return false
  }
  resetForm.passwordError = ''
  return true
}

function validateResetConfirmPassword() {
  if (!resetForm.confirmPassword) {
    resetForm.confirmPasswordError = '请确认新密码'
    return false
  }
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    resetForm.confirmPasswordError = '两次输入的密码不一致'
    return false
  }
  resetForm.confirmPasswordError = ''
  return true
}

function clearResetUsernameError() {
  resetForm.usernameError = ''
}

function clearResetPasswordError() {
  resetForm.passwordError = ''
}

function clearResetConfirmPasswordError() {
  resetForm.confirmPasswordError = ''
}

// 消息提示
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

// 业务函数
async function register() {
  const isUsernameValid = validateRegisterUsername()
  const isPasswordValid = validateRegisterPassword()
  const isConfirmValid = validateConfirmPassword()
  
  if (!isUsernameValid || !isPasswordValid || !isConfirmValid) {
    showMessage('请检查输入信息', 'error')
    return
  }

  registerForm.isLoading = true
  
  try {
    const data = {
      username: registerForm.username,
      password: registerForm.password,
      is_admin: registerForm.isAdmin
    }
    
    await http.post('/register', data)
    
    showMessage(`用户 ${registerForm.username} 创建成功！`, 'success')
    
    // 清理表单
    Object.assign(registerForm, {
      username: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
      showPassword: false
    })
    
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.detail || '创建用户失败'
    showMessage(errorMsg, 'error')
  } finally {
    registerForm.isLoading = false
  }
}

async function changePassword() {
  const isPasswordValid = validateChangePassword()
  const isConfirmValid = validateChangeConfirmPassword()
  
  if (!isPasswordValid || !isConfirmValid) {
    showMessage('请检查输入信息', 'error')
    return
  }

  changeForm.isLoading = true
  
  try {
    const data = {
      new_password: changeForm.newPassword
    }
    
    await http.post('/change-password', data)
    
    showMessage('密码修改成功！', 'success')
    
    // 清理表单
    Object.assign(changeForm, {
      newPassword: '',
      confirmPassword: '',
      showPassword: false
    })
    
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.detail || '修改密码失败'
    showMessage(errorMsg, 'error')
  } finally {
    changeForm.isLoading = false
  }
}

async function resetPassword() {
  const isUsernameValid = validateResetUsername()
  const isPasswordValid = validateResetPassword()
  const isConfirmValid = validateResetConfirmPassword()
  
  if (!isUsernameValid || !isPasswordValid || !isConfirmValid) {
    showMessage('请检查输入信息', 'error')
    return
  }

  resetForm.isLoading = true
  
  try {
    const data = {
      username: resetForm.username,
      new_password: resetForm.newPassword
    }
    
    await http.post('/reset-password', data)
    
    showMessage(`用户 ${resetForm.username} 的密码重置成功！`, 'success')
    
    // 清理表单
    Object.assign(resetForm, {
      username: '',
      newPassword: '',
      confirmPassword: '',
      showPassword: false
    })
    
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.detail || '重置密码失败'
    showMessage(errorMsg, 'error')
  } finally {
    resetForm.isLoading = false
  }
}

function goBack() {
  router.push('/')
}

function showHelp() {
  showMessage('如需帮助，请联系系统管理员', 'info')
}
</script>

<style scoped>
/* 继承登录页面的基础样式，这里只写额外的样式 */
.user-management-layout {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.left-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 480px;
}

/* 标签页样式 */
.tab-header {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  gap: 0.25rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
}

.tab-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 1rem;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 表单样式 */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
  font-size: 1.1rem;
}

input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.toggle-password:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.error-text {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* 复选框样式 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark:after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.role-icon {
  font-size: 1.1rem;
}

/* 按钮样式 */
.btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.btn.btn-warning:hover:not(:disabled) {
  box-shadow: 0 10px 25px rgba(245, 87, 108, 0.3);
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 工业风装饰 */
.gear {
  position: absolute;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.gear-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 15
}
.gear-2 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 5%;
  animation-duration: 30s;
}
.gear-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 25%;
  animation-duration: 15s;
}
</style>