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
        <span class="brand-text">设备智能专家</span>
      </div>

      <!-- 中间导航链接 -->
      <div class="navbar-links">
        <router-link
          to="/chatFlow"
          class="nav-link"
        >
          <span class="nav-icon">🔄</span>
          <span>故障问答</span>
        </router-link>

        <router-link
          to="/"
          class="nav-link"
        >
          <span class="nav-icon">💬</span>
          <span>信息咨询</span>
        </router-link>
        
        <router-link
          to="/usermanage"
          class="nav-link"
        >
          <span class="nav-icon">👥</span>
          <span>用户管理</span>
        </router-link>
        
        <router-link
          to="/knowlegde"
          class="nav-link"
        >
          <span class="nav-icon">📚</span>
          <span>知识库</span>
        </router-link>
        
        <router-link
          to="/knowgraph"
          class="nav-link"
        >
          <span class="nav-icon">🕸️</span>
          <span>知识图谱</span>
        </router-link>

        <router-link
          to="/equipment-maintenance"
          class="nav-link"
        >
          <span class="nav-icon">📋</span>
          <span>维修台账</span>
        </router-link>

        <!-- 仅管理员可见 -->
        <router-link
          v-if="user.isAdmin"
          to="/debug"
          class="nav-link admin-link"
        >
          <span class="nav-icon">🔧</span>
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
                <span class="message-icon">🔔</span>
              </div>
            </el-badge>
          </template>

          <div class="message-content">
            <div
              v-if="totalMessageCount === 0"
              class="message-empty"
            >
              <span class="empty-icon">📭</span>
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
                    {{ item.typeIcon }} {{ item.type }}
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
              <span class="dropdown-arrow">▼</span>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <span class="dropdown-icon">👤</span>
                <span>个人信息</span>
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <span class="dropdown-icon">🔒</span>
                <span>修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item
                v-if="user.isAdmin"
                command="manage"
              >
                <span class="dropdown-icon">👥</span>
                <span>用户管理</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                command="logout"
                class="logout-item"
              >
                <span class="dropdown-icon">🚪</span>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const user = useUserStore()

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
.navbar {
  height: 64px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.navbar-container {
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 40px;
}

/* 品牌区 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s;
}

.navbar-brand:hover {
  transform: scale(1.02);
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.brand-text {
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* 导航链接区 */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.nav-link:hover::before {
  width: 80%;
}

.nav-link.router-link-active {
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.12));
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.nav-link.router-link-active::before {
  width: 80%;
}

.nav-icon {
  font-size: 16px;
  transition: transform 0.3s;
}

.nav-link:hover .nav-icon {
  transform: scale(1.15);
}

.admin-link {
  margin-left: auto;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.admin-link:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.5);
}

.admin-link.router-link-active {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
}

/* 用户区 */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-badge {
  cursor: pointer;
  transition: all 0.3s;
}

.message-badge:hover {
  transform: scale(1.1);
}

.message-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #ef4444;
}

.message-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.message-icon {
  font-size: 18px;
}

.message-content {
  max-height: 500px;
  overflow-y: auto;
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.message-empty p {
  margin: 0;
  font-size: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.message-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s;
}

.message-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-item.warning {
  border-left-color: #ed8936;
}

.message-item.danger {
  border-left-color: #e53e3e;
}

.message-item.info {
  border-left-color: #3b82f6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.message-type.warning {
  color: #c05621;
  background: #fffaf0;
}

.message-type.danger {
  color: #c53030;
  background: #fff5f5;
}

.message-type.info {
  color: #2c5282;
  background: #ebf8ff;
}

.message-time {
  font-size: 12px;
  color: #a0aec0;
}

.message-body p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
}

.message-status {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.message-status.pending {
  color: #c05621;
  background: #fffaf0;
}

.message-status.urgent {
  color: #c53030;
  background: #fff5f5;
}

.message-status.processing {
  color: #2c5282;
  background: #ebf8ff;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #667eea;
  transition: transform 0.3s;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.el-dropdown-menu {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: none;
}

.el-dropdown-menu__item {
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-dropdown-menu__item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
}

.el-dropdown-menu__item:last-child {
  margin-bottom: 0;
}

.el-dropdown-menu__item.is-divided {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

.logout-item {
  color: #e53e3e;
}

.logout-item:hover {
  color: #e53e3e !important;
  background: rgba(229, 62, 62, 0.1) !important;
}

.dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .navbar-container {
    padding: 0 20px;
    gap: 24px;
  }

  .navbar-links {
    gap: 4px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
  }

  .nav-icon {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 56px;
  }

  .navbar-container {
    gap: 16px;
  }

  .brand-text {
    display: none;
  }

  .navbar-links {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .navbar-links::-webkit-scrollbar {
    display: none;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .nav-link {
    padding: 8px;
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

  .message-icon {
    font-size: 16px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .dropdown-arrow {
    display: none;
  }
}

/* 添加导航栏入场动画 */
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
  animation: navSlideDown 0.5s ease-out;
}
</style>