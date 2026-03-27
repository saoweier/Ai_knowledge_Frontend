<template>
  <div class="user-management-layout">
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h1 class="brand-title">
          用户管理系统
        </h1>
        <p class="brand-sub">
          User Management System
        </p>
        
        <!-- 功能特性 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>用户权限管理</h4>
              <p>灵活的权限控制体系</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>密码安全管控</h4>
              <p>安全的密码策略管理</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>系统配置管理</h4>
              <p>个性化的系统设置</p>
            </div>
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
            <svg
              v-if="tab.key === 'register'"
              class="tab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <svg
              v-else-if="tab.key === 'change'"
              class="tab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg
              v-else
              class="tab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
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
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
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
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
                  <svg v-if="!registerForm.showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                v-if="registerForm.passwordError"
                class="error-text"
              >{{ registerForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="reg-confirm-password">确认密码</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
                <span class="custom-checkbox">
                  <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span class="checkbox-label">管理员权限</span>
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
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
                  <svg v-if="!changeForm.showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                v-if="changeForm.passwordError"
                class="error-text"
              >{{ changeForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="change-confirm-password">确认新密码</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
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
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
                  <svg v-if="!resetForm.showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                v-if="resetForm.passwordError"
                class="error-text"
              >{{ resetForm.passwordError }}</span>
            </div>

            <div class="field">
              <label for="reset-confirm-password">确认新密码</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
  { key: 'register', label: '新增用户' },
  { key: 'change', label: '修改密码' },
  { key: 'reset', label: '重设密码' }
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
/* ====================================
   AI 知识库风格用户管理页面
   Fonts: Space Grotesk + DM Sans
   Color: Blue (#2563EB) based theme
==================================== */

.user-management-layout {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ========================
   左侧展示区 (AI 主题)
========================== */
.left-panel {
  flex: 1;
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
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.brand-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 40px 0;
  font-weight: 400;
}

/* 功能特性 */
.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(37, 99, 235, 0.3);
  padding: 10px;
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon-wrapper {
  background: rgba(37, 99, 235, 0.25);
  transform: translateX(4px);
}

.feature-icon {
  width: 22px;
  height: 22px;
  color: #60a5fa;
}

.feature-text h4 {
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.feature-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

/* =====================
   右侧功能卡片
======================== */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
}

.card {
  background: #ffffff;
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* 标签页样式 */
.tab-header {
  display: flex;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
}

.tab-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}

.tab-btn.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.tab-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 表单样式 */
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  z-index: 2;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #1e293b;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

.input-wrapper input.error {
  border-color: #ef4444;
}

.input-wrapper input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
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

.error-text {
  color: #ef4444;
  font-size: 13px;
  margin-top: 2px;
}

/* 复选框样式 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
}

.checkbox-wrapper input[type="checkbox"] {
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

.checkbox-wrapper input[type="checkbox"]:checked + .custom-checkbox {
  background: #2563eb;
  border-color: #2563eb;
}

.checkbox-wrapper input[type="checkbox"]:checked + .custom-checkbox .checkmark {
  opacity: 1;
  transform: scale(1);
}

.checkbox-wrapper input[type="checkbox"]:focus + .custom-checkbox {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  width: 100%;
  padding: 13px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
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
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.btn-warning {
  background: #f59e0b;
}

.btn.btn-warning:hover:not(:disabled) {
  background: #d97706;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 页尾链接 */
.footer-links {
  margin-top: 24px;
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
  border-left: 4px solid #ef4444;
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
.message.error .message-icon { color: #ef4444; }
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
    background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
    min-height: 100vh;
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .user-management-layout {
    overflow-y: auto;
  }
  
  .right-panel {
    padding: 24px 20px;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .card {
    padding: 24px 20px;
    box-shadow: none;
  }
  
  .tab-btn {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .tab-icon {
    width: 16px;
    height: 16px;
  }
  
  .message {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}

.user-management-layout {
  background:
    radial-gradient(circle at top left, rgba(31, 98, 89, 0.1), transparent 24%),
    radial-gradient(circle at bottom right, rgba(180, 107, 49, 0.1), transparent 20%),
    linear-gradient(180deg, #f4efe6 0%, #f7f3ec 100%);
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.left-panel {
  background:
    radial-gradient(circle at 20% 20%, rgba(180, 107, 49, 0.16), transparent 22%),
    linear-gradient(160deg, #143934 0%, #102824 52%, #1d4f47 100%);
}

.orb-1 {
  background: radial-gradient(circle, rgba(180, 107, 49, 0.7) 0%, transparent 68%);
}

.orb-2 {
  background: radial-gradient(circle, rgba(31, 98, 89, 0.56) 0%, transparent 70%);
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
.feature-text h4,
.card-title {
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
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(246, 240, 232, 0.92));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-lg);
}

.tab-header {
  background: rgba(255, 251, 246, 0.68);
  border: 1px solid rgba(65, 88, 80, 0.08);
}

.tab-btn {
  color: var(--text-soft);
  border-radius: 10px;
}

.tab-btn:hover {
  background: rgba(31, 98, 89, 0.08);
  color: var(--brand);
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  box-shadow: 0 12px 24px rgba(31, 98, 89, 0.18);
}

.field label,
.checkbox-label {
  color: var(--text);
}

.input-wrapper input {
  background: rgba(255, 251, 246, 0.82);
  border-color: rgba(65, 88, 80, 0.12);
  border-radius: 14px;
}

.input-wrapper input:focus {
  border-color: rgba(31, 98, 89, 0.3);
  box-shadow: 0 0 0 4px rgba(31, 98, 89, 0.08);
}

.btn {
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--brand-strong) 0%, #113833 100%);
  box-shadow: 0 16px 28px rgba(31, 98, 89, 0.18);
}

.btn.btn-warning {
  background: linear-gradient(135deg, var(--accent) 0%, #8b4f22 100%);
}

.btn.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #9a5929 0%, #7c431b 100%);
  box-shadow: 0 16px 28px rgba(180, 107, 49, 0.18);
}

.footer-links a:hover {
  color: var(--brand);
}

.message {
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-md);
}
</style>
