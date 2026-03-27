<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- 左侧品牌区 -->
      <div class="navbar-brand">
        <img
          src="/expert.png"
          class="logo"
          alt="Logo"
        >
        <span class="brand-text">AI知识库专家</span>
      </div>

      <!-- 汉堡菜单按钮 (移动端) -->
      <button
        class="hamburger-btn"
        :class="{ 'is-active': mobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="菜单"
      >
        <svg
          class="hamburger-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            v-if="!mobileMenuOpen"
            d="M4 6h16M4 12h16M4 18h16"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M6 18L18 6M6 6l12 12"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <!-- 中间导航链接 -->
      <div
        class="navbar-links"
        :class="{ 'is-open': mobileMenuOpen }"
      >
        <router-link
          to="/chatFlow"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>故障问答</span>
        </router-link>

        <router-link
          to="/"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>信息咨询</span>
        </router-link>
        
        <router-link
          to="/usermanage"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>用户管理</span>
        </router-link>
        
        <router-link
          to="/knowlegde"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>知识库</span>
        </router-link>
        
        <router-link
          to="/knowgraph"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3"/>
            <circle cx="5" cy="6" r="2"/>
            <circle cx="19" cy="6" r="2"/>
            <circle cx="5" cy="18" r="2"/>
            <circle cx="19" cy="18" r="2"/>
            <path d="M7 7l3 3M14 14l3 3M7 17l3-3M14 10l3-3" stroke-linecap="round"/>
          </svg>
          <span>知识图谱</span>
        </router-link>

        <router-link
          to="/knowledge-extractor"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>知识提炼</span>
        </router-link>

        <router-link
          to="/equipment-maintenance"
          class="nav-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h6" stroke-linecap="round"/>
          </svg>
          <span>维修台账</span>
        </router-link>

        <!-- 仅管理员可见 -->
        <router-link
          v-if="user.isAdmin"
          to="/debug"
          class="nav-link admin-link"
          @click="closeMobileMenu"
        >
          <svg
            class="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>调试</span>
        </router-link>
      </div>

      <!-- 右侧功能区 -->
      <div class="navbar-user">
        <!-- 消息提醒 -->
        <el-popover
          placement="bottom"
          :width="380"
          trigger="click"
        >
          <template #reference>
            <el-badge
              :value="totalMessageCount"
              :max="99"
              :hidden="totalMessageCount === 0"
              class="message-badge"
            >
              <div class="message-btn">
                <svg
                  class="message-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </el-badge>
          </template>

          <div class="message-content">
            <div
              v-if="totalMessageCount === 0"
              class="message-empty"
            >
              <svg
                class="empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>暂无消息提醒</p>
            </div>
            <div
              v-else
              class="message-list"
            >
              <div
                v-for="item in messageList"
                :key="item.id"
                class="message-item"
                @click="handleMessageClick(item)"
              >
                <div class="message-header">
                  <span :class="['message-type', item.typeClass]">
                    {{ item.type }}
                  </span>
                  <span class="message-time">{{ item.time }}</span>
                </div>
                <div class="message-body">
                  <p>{{ item.content }}</p>
                  <span :class="['message-status', item.statusClass]">
                    {{ item.statusText }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-popover>

        <!-- 用户下拉菜单 -->
        <el-dropdown
          trigger="click"
          @command="handleUserCommand"
        >
          <div class="user-dropdown">
            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitial }}
              </div>
              <span class="username">{{ displayUsername }}</span>
              <svg
                class="dropdown-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <svg
                  class="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>个人信息</span>
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <svg
                  class="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item
                v-if="user.isAdmin"
                command="manage"
              >
                <svg
                  class="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>用户管理</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                command="logout"
                class="logout-item"
              >
                <svg
                  class="dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 移动端菜单遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    />
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const user = useUserStore()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

const displayUsername = computed(() => {
  return user.userInfo?.username || '用户'
})

const getUserInitial = computed(() => {
  const username = user.userInfo?.username || 'U'
  return username.charAt(0).toUpperCase()
})

const mockEquipment = [
  { id: 'LS001', name: '1号拉丝机', nextMaintenanceDate: '2025-02-05', status: '运行中' },
  { id: 'LS002', name: '2号拉丝机', nextMaintenanceDate: '2025-02-10', status: '运行中' },
  { id: 'LS003', name: '3号拉丝机', nextMaintenanceDate: '2025-02-15', status: '停机' },
  { id: 'LS004', name: '4号拉丝机', nextMaintenanceDate: '2025-01-28', status: '运行中' },
  { id: 'LB001', name: '1号漏板', nextMaintenanceDate: '2025-02-03', status: '运行中' },
  { id: 'LB002', name: '2号漏板', nextMaintenanceDate: '2025-02-08', status: '维护中' },
  { id: 'LB003', name: '3号漏板', nextMaintenanceDate: '2025-02-12', status: '运行中' },
  { id: 'DJ001', name: '1号电机', nextMaintenanceDate: '2025-01-25', status: '运行中' },
  { id: 'DJ002', name: '2号电机', nextMaintenanceDate: '2025-02-18', status: '运行中' },
  { id: 'DJ003', name: '3号电机', nextMaintenanceDate: '2025-02-20', status: '运行中' },
  { id: 'LS005', name: '5号拉丝机', nextMaintenanceDate: '2025-02-25', status: '运行中' },
  { id: 'LB004', name: '4号漏板', nextMaintenanceDate: '2025-01-30', status: '运行中' }
]

const getDaysDue = (dateStr) => {
  const today = new Date()
  const dueDate = new Date(dateStr)
  const diffTime = dueDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const dueSoonEquipment = mockEquipment.filter(item => {
  const daysDue = getDaysDue(item.nextMaintenanceDate)
  return daysDue >= 0 && daysDue <= 7
})

const overdueEquipment = mockEquipment.filter(item => {
  const daysDue = getDaysDue(item.nextMaintenanceDate)
  return daysDue < 0
})

const maintenanceNeededEquipment = mockEquipment.filter(item => item.status === '停机' || item.status === '维护中')

const messageList = computed(() => {
  const messages = []
  
  dueSoonEquipment.forEach((item, index) => {
    const daysDue = getDaysDue(item.nextMaintenanceDate)
    messages.push({
      id: `due-soon-${index}`,
      type: '即将到期',
      typeIcon: '⚠️',
      typeClass: 'warning',
      content: `${item.name} 即将到期，距离保养还有 ${daysDue} 天`,
      time: item.nextMaintenanceDate,
      equipmentId: item.id,
      statusText: '未处理',
      statusClass: 'pending'
    })
  })
  
  overdueEquipment.forEach((item, index) => {
    const daysOverdue = Math.abs(getDaysDue(item.nextMaintenanceDate))
    messages.push({
      id: `overdue-${index}`,
      type: '已过期',
      typeIcon: '🚨',
      typeClass: 'danger',
      content: `${item.name} 保养已过期 ${daysOverdue} 天，请尽快处理`,
      time: item.nextMaintenanceDate,
      equipmentId: item.id,
      statusText: '紧急',
      statusClass: 'urgent'
    })
  })
  
  maintenanceNeededEquipment.forEach((item, index) => {
    messages.push({
      id: `maintenance-${index}`,
      type: '待维修',
      typeIcon: '🔧',
      typeClass: 'info',
      content: `${item.name} 当前状态为 ${item.status}，需要维修处理`,
      time: '今天',
      equipmentId: item.id,
      statusText: '处理中',
      statusClass: 'processing'
    })
  })
  
  return messages.sort((a, b) => {
    const priorityOrder = { 'danger': 0, 'warning': 1, 'info': 2 }
    return priorityOrder[a.typeClass] - priorityOrder[b.typeClass]
  })
})

const totalMessageCount = computed(() => messageList.value.length)

function handleMessageClick(item) {
  ElMessage.info(`跳转到 ${item.equipmentId} 详情页`)
  router.push('/equipment-maintenance')
}

function handleUserCommand(command) {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'password':
      ElMessage.info('跳转到修改密码页面')
      break
    case 'manage':
      router.push('/usermanage')
      break
    case 'logout':
      if (confirm('确定要退出登录吗？')) {
        user.logout()
        router.push('/login')
      }
      break
  }
}
</script>

<style scoped>
/* ====================================
   AI 知识库风格导航栏
   Fonts: Space Grotesk + DM Sans
   Color: Blue (#2563EB) based theme
==================================== */

.navbar {
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.navbar-container {
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 品牌区 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.navbar-brand:hover {
  transform: scale(1.02);
}

.logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
}

.brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #1e293b;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  background: #f1f5f9;
}

.hamburger-btn.is-active {
  background: #eff6ff;
}

.hamburger-icon {
  width: 22px;
  height: 22px;
  color: #475569;
  transition: color 0.2s ease;
}

.hamburger-btn.is-active .hamburger-icon {
  color: #2563eb;
}

/* 导航链接区 */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.nav-link:hover {
  color: #2563eb;
  background: #eff6ff;
}

.nav-link.router-link-active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.admin-link {
  margin-left: auto;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.05);
}

.admin-link:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
}

.admin-link.router-link-active {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
}

/* 用户区 */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.message-badge {
  cursor: pointer;
}

.message-badge:hover {
  transform: scale(1.05);
}

.message-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #dc2626;
}

.message-btn:hover {
  background: #fee2e2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.message-icon {
  width: 20px;
  height: 20px;
}

.message-content {
  max-height: 400px;
  overflow-y: auto;
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: #cbd5e1;
}

.message-empty p {
  margin: 0;
  font-size: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
}

.message-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-item.warning {
  border-left-color: #f59e0b;
}

.message-item.danger {
  border-left-color: #ef4444;
}

.message-item.info {
  border-left-color: #3b82f6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-type {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.message-type.warning {
  color: #b45309;
  background: #fef3c7;
}

.message-type.danger {
  color: #b91c1c;
  background: #fef2f2;
}

.message-type.info {
  color: #1d4ed8;
  background: #eff6ff;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
}

.message-body p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.message-status {
  display: inline-block;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.message-status.pending {
  color: #b45309;
  background: #fef3c7;
}

.message-status.urgent {
  color: #b91c1c;
  background: #fef2f2;
}

.message-status.processing {
  color: #1d4ed8;
  background: #eff6ff;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.user-info:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  color: #64748b;
  transition: transform 0.2s ease;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.el-dropdown-menu {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
}

.el-dropdown-menu__item {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 2px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.el-dropdown-menu__item:hover {
  background: #eff6ff;
  color: #2563eb;
}

.el-dropdown-menu__item:last-child {
  margin-bottom: 0;
}

.el-dropdown-menu__item.is-divided {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

.logout-item {
  color: #dc2626;
}

.logout-item:hover {
  background: #fef2f2 !important;
  color: #dc2626 !important;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* 移动端菜单遮罩 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ====================================
   响应式设计
==================================== */

/* 大屏幕 */
@media (max-width: 1200px) {
  .navbar-container {
    padding: 0 20px;
    gap: 20px;
  }

  .nav-link {
    padding: 8px 10px;
    font-size: 13px;
  }

  .nav-icon {
    width: 16px;
    height: 16px;
  }
}

/* 平板 */
@media (max-width: 1024px) {
  .navbar-links {
    gap: 2px;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .nav-link {
    padding: 8px 10px;
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .navbar {
    height: 56px;
  }

  .navbar-container {
    padding: 0 16px;
    gap: 12px;
  }

  .hamburger-btn {
    display: flex;
  }

  .brand-text {
    display: none;
  }

  .navbar-links {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    max-height: calc(100vh - 56px);
    overflow-y: auto;
  }

  .navbar-links.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .mobile-overlay {
    display: block;
  }

  .nav-link {
    padding: 12px 16px;
    font-size: 15px;
    border-radius: 8px;
    background: #f8fafc;
  }

  .nav-link span:not(.nav-icon) {
    display: inline;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }

  .admin-link {
    margin-left: 0;
    border: 1px solid #e2e8f0;
    background: #fef2f2;
  }

  .username {
    display: none;
  }

  .user-info {
    padding: 6px 10px;
  }

  .message-btn {
    width: 36px;
    height: 36px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .dropdown-arrow {
    display: none;
  }
}

/* 导航栏入场动画 */
@keyframes navSlideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.navbar {
  animation: navSlideDown 0.4s ease-out;
}

.navbar {
  height: 76px;
  background: rgba(244, 239, 230, 0.78);
  border-bottom: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: 0 18px 30px rgba(26, 34, 31, 0.06);
}

.navbar-container {
  max-width: 1480px;
  padding: 0 clamp(16px, 3vw, 32px);
}

.navbar-brand {
  gap: 14px;
}

.logo {
  width: 42px;
  height: 42px;
  padding: 5px;
  border-radius: 14px;
  background: rgba(255, 251, 246, 0.88);
  box-shadow: 0 14px 26px rgba(31, 98, 89, 0.12);
}

.brand-text {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  color: var(--text);
}

.navbar-links {
  gap: 8px;
}

.nav-link {
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 14px;
  color: var(--text-soft);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--brand);
  background: rgba(31, 98, 89, 0.1);
}

.admin-link {
  border-radius: 14px;
  border-color: rgba(180, 107, 49, 0.28);
  background: rgba(180, 107, 49, 0.1);
  color: #8b4f22;
}

.admin-link:hover,
.admin-link.router-link-active {
  color: #8b4f22;
  background: rgba(180, 107, 49, 0.16);
  border-color: rgba(180, 107, 49, 0.36);
}

.message-btn,
.user-info {
  background: rgba(255, 251, 246, 0.8);
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.message-btn {
  color: var(--accent);
}

.message-btn:hover {
  background: rgba(244, 228, 211, 0.9);
  box-shadow: 0 16px 30px rgba(180, 107, 49, 0.14);
}

.message-item {
  border-left-width: 3px;
  border-radius: 14px;
  background: rgba(255, 251, 246, 0.84);
}

.user-info {
  border-radius: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  box-shadow: 0 12px 22px rgba(31, 98, 89, 0.22);
}

.username {
  color: var(--text);
}

@media (max-width: 768px) {
  .navbar {
    height: 64px;
  }

  .navbar-links {
    top: 64px;
    padding: 14px;
    background: rgba(255, 251, 246, 0.96);
    backdrop-filter: blur(16px);
  }

  .nav-link {
    min-height: 48px;
    border-radius: 16px;
    background: rgba(255, 251, 246, 0.82);
    border: 1px solid rgba(65, 88, 80, 0.08);
  }

  .mobile-overlay {
    top: 64px;
    background: rgba(26, 34, 31, 0.28);
    backdrop-filter: blur(2px);
  }
}
</style>
