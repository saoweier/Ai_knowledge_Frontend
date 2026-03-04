// router/index.js - 集成会话管理的路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ChatView from '@/views/ChatView.vue'
import Debug from '@/views/DebugView.vue'
import LoginView from '@/views/LoginView.vue'
import UserManagementView from '@/views/UserManagement.vue'
import knowlegdeView from '@/views/knowlegdeView.vue'
import KgView from '@/views/KgView.vue'
import ChatFlow from '@/views/ChatFlow.vue'
import EquipmentMaintenanceView from '@/views/EquipmentMaintenanceView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/usermanage', name: 'UserManage', component: UserManagementView, meta: { requiresAuth: true } },
  { path: '/', name: 'Chat', component: ChatView, meta: { requiresAuth: true } },
  { path: '/debug', name: 'Debug', component: Debug, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/knowlegde', name: 'Knowlegde', component: knowlegdeView, meta: { requiresAuth: true } },
  { path: '/knowgraph', name: 'kgknowgraph', component: KgView, meta: { requiresAuth: true } },
  { path: '/chatFlow', name: 'ChatFlow', component: ChatFlow, meta: { requiresAuth: true } },
  { path: '/equipment-maintenance', name: 'EquipmentMaintenance', component: EquipmentMaintenanceView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫：控制登录、权限和会话管理
router.beforeEach((to, from, next) => {
  const store = useUserStore()

  // 如果访问登录页,已登录用户直接跳转到首页
  if (to.path === '/login' && store.isLoggedIn) {
    return next('/')
  }

  // 需要认证的页面
  if (to.meta.requiresAuth) {
    // 检查会话是否有效
    if (!store.checkSession()) {
      // 会话过期,跳转到登录页
      console.warn('会话已过期,请重新登录')
      return next({
        path: '/login',
        query: { redirect: to.fullPath, expired: '1' }
      })
    }

    // 检查管理员权限
    if (to.meta.adminOnly && !store.isAdmin) {
      console.error('权限不足')
      alert('没有权限访问该页面')
      return next('/')
    }

    // 会话有效,更新活动时间
    store.updateActivity()
  }

  next()
})

// 路由切换后也更新活动时间
router.afterEach(() => {
  const store = useUserStore()
  if (store.isLoggedIn) {
    store.updateActivity()
  }
})

export default router