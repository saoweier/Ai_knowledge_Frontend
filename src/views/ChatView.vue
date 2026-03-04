<template>
  <div class="app">
    <!-- 左侧整块侧边栏 -->
    <aside
      class="sidebar"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <div class="sidebar-header">
        <span
          v-show="!sidebarCollapsed"
          class="sidebar-title"
        >设备智能专家</span>
        <el-button
          class="collapse-btn"
          type="text"
          size="large"
          circle
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <el-icon size="20">
            <ArrowLeft v-if="!sidebarCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </el-button>
      </div>

      <transition name="fade">
        <div
          v-show="!sidebarCollapsed"
          class="sidebar-content"
        >
          <el-scrollbar class="sidebar-body">
            <div
              v-for="(s, i) in sessions"
              :key="i"
              class="session-item"
              :class="{ active: i === activeSession }"
              @click="switchSession(i)"
            >
              <div class="session-title">
                {{ s.title }}
              </div>
              <div class="session-time">
                {{ formatTime(s.updatedAt) }}
              </div>
            </div>
          </el-scrollbar>

          <div class="sidebar-footer">
            <el-button
              size="small"
              type="primary"
              plain
              @click="newSession"
            >
              新建对话
            </el-button>
          </div>
        </div>
      </transition>
    </aside>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="!sidebarCollapsed" 
      class="sidebar-overlay"
      @click="sidebarCollapsed = true"
    />

    <!-- 移动端菜单按钮（始终存在，通过CSS控制显示） -->
    <button 
      class="mobile-menu-btn"
      :class="{ 'is-hidden': !sidebarCollapsed }"
      aria-label="打开菜单"
      @click="sidebarCollapsed = false"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line
          x1="3"
          y1="12"
          x2="21"
          y2="12"
        />
        <line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
        />
        <line
          x1="3"
          y1="18"
          x2="21"
          y2="18"
        />
      </svg>
    </button>

    <!-- 右侧主区域 -->
    <main class="main">
      <!-- 顶部总结区（无消息时居中） -->
      <div
        v-if="messages.length === 0"
        class="summary"
      >
        <img
          src="/expert.png"
          class="summary-logo"
          alt="Logo"
        >
        <h2 class="summary-title">
          设备智能专家
        </h2>
        <p class="summary-subtitle">
          基于向量知识库 + LLM 的工业级智能诊断系统
        </p>
      </div>

      <!-- 对话区 -->
      <div
        v-else
        class="chat"
      >
        <el-scrollbar class="messages">
          <template
            v-for="(msg, idx) in messages"
            :key="idx"
          >
            <!-- 用户消息 -->
            <div
              v-if="msg.role === 'user'"
              class="bubble user"
            >
              <div class="bubble-content">
                {{ msg.text }}
              </div>
              <div class="meta">
                {{ formatTime(msg.time) }}
              </div>
            </div>
            
            <!-- 助手消息 -->
            <div
              v-else
              class="bubble assistant"
            >
              <!-- 引导信息 -->
              <div
                v-if="msg.guidance"
                class="guidance-alert"
              >
                <el-alert
                  :title="msg.guidance"
                  type="info"
                  show-icon
                  :closable="false"
                />
              </div>

              <!-- 结构化解决方案 -->
              <div
                v-if="msg.solution"
                class="solution-container"
              >
                <!-- 问题摘要 -->
                <div class="problem-summary">
                  <h3>问题摘要</h3>
                  <p>{{ msg.solution.problem_summary }}</p>
                </div>

                <!-- 快速诊断 -->
                <div
                  v-if="msg.solution.quick_diagnosis"
                  class="quick-diagnosis"
                >
                  <el-tag
                    type="success"
                    size="large"
                  >
                    <el-icon><CircleCheck /></el-icon>
                    {{ msg.solution.quick_diagnosis }}
                  </el-tag>
                </div>

                <!-- 故障排查步骤 -->
                <div
                  v-if="msg.solution.troubleshooting_steps?.length"
                  class="troubleshooting-steps"
                >
                  <h3>排查步骤</h3>
                  
                  <el-timeline>
                    <el-timeline-item
                      v-for="(step, stepIdx) in msg.solution.troubleshooting_steps"
                      :key="stepIdx"
                      :color="getStepColor(step.category)"
                      :hollow="msg.stepsState?.[stepIdx]"
                      size="large"
                    >
                      <el-card class="step-card">
                        <!-- 步骤头部 -->
                        <template #header>
                          <div class="step-header">
                            <div class="step-title-row">
                              <el-tag
                                :type="getCategoryType(step.category)"
                                size="small"
                              >
                                {{ getCategoryLabel(step.category) }}
                              </el-tag>
                              <h4>步骤 {{ step.step_number }}: {{ step.title }}</h4>
                            </div>
                            <el-checkbox
                              v-model="msg.stepsState[stepIdx]"
                              size="large"
                              @change="updateStepState(idx, stepIdx)"
                            >
                              完成
                            </el-checkbox>
                          </div>
                        </template>

                        <!-- 步骤描述 -->
                        <div class="step-description">
                          <p v-html="formatDescription(step.description)" />
                        </div>

                        <!-- 图片/视频展示 -->
                        <div
                          v-if="step.images?.length"
                          class="step-media"
                        >
                          <h5>参考资料</h5>
                          <div class="media-grid">
                            <div
                              v-for="(mediaUrl, mediaIdx) in step.images"
                              :key="mediaIdx"
                              class="media-item"
                            >
                              <!-- 视频 -->
                              <video
                                v-if="isVideo(mediaUrl)"
                                :src="mediaUrl"
                                controls
                                class="media-video"
                                preload="metadata"
                              >
                                您的浏览器不支持视频播放
                              </video>
                              
                              <!-- 图片 -->
                              <el-image
                                v-else
                                :src="mediaUrl"
                                :preview-src-list="[mediaUrl]"
                                fit="cover"
                                class="media-image"
                                lazy
                              >
                                <template #error>
                                  <div class="image-error">
                                    <el-icon><Picture /></el-icon>
                                    <span>加载失败</span>
                                  </div>
                                </template>
                              </el-image>
                            </div>
                          </div>
                        </div>

                        <!-- 预期结果 -->
                        <div
                          v-if="step.expected_result"
                          class="step-expected"
                        >
                          <el-icon color="#67c23a">
                            <Select />
                          </el-icon>
                          <strong>预期结果:</strong> {{ step.expected_result }}
                        </div>

                        <!-- 工具需求 -->
                        <div
                          v-if="step.tools_needed?.length"
                          class="step-tools"
                        >
                          <el-icon><Tools /></el-icon>
                          <strong>所需工具:</strong>
                          <el-tag
                            v-for="(tool, toolIdx) in step.tools_needed"
                            :key="toolIdx"
                            size="small"
                            class="tool-tag"
                          >
                            {{ tool }}
                          </el-tag>
                        </div>

                        <!-- 安全提示 -->
                        <div
                          v-if="step.safety_notes?.length"
                          class="step-safety"
                        >
                          <el-alert
                            type="warning"
                            :closable="false"
                          >
                            <template #title>
                              <el-icon><Warning /></el-icon>
                              <strong>安全提示</strong>
                            </template>
                            <ul class="safety-list">
                              <li
                                v-for="(note, noteIdx) in step.safety_notes"
                                :key="noteIdx"
                              >
                                {{ note }}
                              </li>
                            </ul>
                          </el-alert>
                        </div>

                        <!-- 失败处理 -->
                        <div
                          v-if="step.if_failed"
                          class="step-failed"
                        >
                          <el-icon color="#f56c6c">
                            <WarningFilled />
                          </el-icon>
                          <strong>失败处理:</strong> {{ step.if_failed }}
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>

              <!-- 纯文本回复 -->
              <div
                v-else
                class="text-response"
              >
                {{ msg.text }}
              </div>

              <div class="meta">
                {{ formatTime(msg.time) }}
              </div>
            </div>
          </template>
        </el-scrollbar>
      </div>

      <!-- 输入框 -->
      <div :class="['input-wrapper', { 'input-center': messages.length === 0, 'input-bottom': messages.length > 0 }]">
        <MessageInput
          :loading="loading"
          :default-api="api"
          :default-options="options"
          :default-memory-limit="memoryLimit"
          @send="onSend"
          @clear="clearAll"
          @update:api="(v) => api = v"
          @update:options="(v) => options = v"
          @update:memory="(n) => memoryLimit = n"
        />
      </div>
    </main>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  ArrowRight, 
  CircleCheck, 
  Select, 
  Tools, 
  Warning, 
  WarningFilled,
  Picture 
} from '@element-plus/icons-vue'
import http from '@/api/http'
import MessageInput from '@/components/MessageInput.vue'
// import { useUserStore } from "@/stores/user"

// const user = useUserStore()

// 会话管理
const sidebarCollapsed = ref(true)
const sessions = ref([{ title: '当前对话', messages: [], updatedAt: Date.now() }])
const activeSession = ref(0)
const messages = ref(sessions.value[0].messages)

function switchSession(i) {
  activeSession.value = i
  messages.value = sessions.value[i].messages
}

function newSession() {
  sessions.value.unshift({ title: '新对话', messages: [], updatedAt: Date.now() })
  switchSession(0)
}

// 对话状态
const loading = ref(false)
const api = ref('search_with_solution')
const options = ref({ enableLLM: true, forceContent: '', diversify: true })
const memoryLimit = ref(3)

// 发送消息
async function onSend({ text, api: whichApi, options: opt }) {
  if (!text?.trim()) return
  
  messages.value.push({ role: 'user', text, time: Date.now() })

  const lastN = pickContext(messages.value, memoryLimit.value)
  const endpoint = whichApi === 'search_with_solution' ? '/search_with_solution' : '/search'
  let params = { query_text: text }

  if (whichApi === 'search_with_solution') {
    params.enable_llm_integration = !!opt.enableLLM
    if (opt.forceContent) params.force_content_type = opt.forceContent
  } else {
    if (opt.forceContent) params.force_content_type = opt.forceContent
    params.diversify_results = !!opt.diversify
  }

  loading.value = true
  try {
    let resp
    try {
      resp = await http.get(endpoint, {
        params: { ...params, context_json: JSON.stringify(lastN) }
      })
    } catch (err) {
      if (err?.response?.status === 422) {
        resp = await http.get(endpoint, { params })
      } else {
        throw err
      }
    }

    const data = resp.data || {}

    if (data.progressive_solution) {
      const steps = data.progressive_solution?.troubleshooting_steps || []
      messages.value.push({
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        solution: data.progressive_solution,
        stepsState: steps.map(() => false)
      })
    } else {
      const textAnswer = data.answer || data.message || data.guidance || '（无可展示内容）'
      messages.value.push({
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        text: textAnswer
      })
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败,请检查后端服务或控制台日志')
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: '❌ 请求失败,请稍后重试。'
    })
  } finally {
    loading.value = false
  }
}

function clearAll() {
  messages.value = []
}

function pickContext(all, n) {
  const recent = all.slice(-n)
  return recent.map((m) => {
    if (m.role === 'user') {
      return { role: 'user', content: m.text }
    } else {
      if (m.solution?.troubleshooting_steps?.length) {
        const titles = m.solution.troubleshooting_steps.map(s => s.title).join('；')
        return {
          role: 'assistant',
          content: `【摘要】${m.solution.quick_diagnosis || ''}；【步骤】${titles}`
        }
      }
      return { role: 'assistant', content: m.text || m.guidance || '' }
    }
  })
}

// UI 辅助函数
function formatTime(ts) {
  const d = new Date(ts)
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDescription(desc) {
  if (!desc) return ''
  // 将分号分隔的内容转为列表
  return desc.split('；').map(item => `<p>• ${item.trim()}</p>`).join('')
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

function getStepColor(category) {
  const colors = {
    inspection: '#409EFF',
    adjustment: '#E6A23C',
    replacement: '#F56C6C',
    test: '#67C23A'
  }
  return colors[category] || '#909399'
}

function getCategoryType(category) {
  const types = {
    inspection: 'primary',
    adjustment: 'warning',
    replacement: 'danger',
    test: 'success'
  }
  return types[category] || 'info'
}

function getCategoryLabel(category) {
  const labels = {
    inspection: '检查',
    adjustment: '调整',
    replacement: '更换',
    test: '测试'
  }
  return labels[category] || '其他'
}

function updateStepState(msgIdx, stepIdx) {
  console.log(`步骤 ${stepIdx + 1} 状态更新`)
}
</script>


<style scoped>
/* ==================== 全局布局 ==================== */
.app {
  display: flex;
  height: calc(100vh - 64px); /* 减去导航栏高度 */
  height: calc(100dvh - 64px); /* 动态视口高度，避免移动端地址栏问题 */
  max-height: calc(100vh - 64px);
  max-height: calc(100dvh - 64px);
  overflow: hidden;
  background: #f5f7fb;
  position: relative;
}

/* ==================== 侧边栏样式 ==================== */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 64px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.collapse-btn {
  color: #9ca3af;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #fff;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.sidebar-body {
  flex: 1;
  padding: 8px 0;
}

.session-item {
  padding: 12px 16px;
  margin: 4px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.session-item.active {
  background: rgba(59, 130, 246, 0.2);
  border-left: 3px solid #3b82f6;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  color: #f3f4f6;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: 12px;
  color: #9ca3af;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer .el-button {
  width: 100%;
}

/* 侧边栏遮罩层 (仅移动端显示) */
.sidebar-overlay {
  display: none;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  position: fixed;
  top: 56px;
  left: 16px;
  z-index: 998;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: none; /* PC端默认隐藏 */
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1e293b;
  padding: 0;
  outline: none;
}

.mobile-menu-btn.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8);
}

.mobile-menu-btn:hover {
  background: #f8fafc;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.mobile-menu-btn:active {
  transform: scale(0.95) translateY(0);
}

.mobile-menu-btn svg {
  display: block;
}

/* ==================== 主内容区域 ==================== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-width: 0; /* 防止 flex 子元素溢出 */
  height: 100%;
}

/* ==================== 欢迎页 ==================== */
.summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.summary-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.summary-subtitle {
  font-size: 16px;
  color: #64748b;
  max-width: 500px;
  line-height: 1.6;
}

/* ==================== 对话区域 ==================== */
.chat {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：允许 flex 子元素正确缩小 */
}

.messages {
  flex: 1;
  padding: 24px;
}

.messages > div {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== 消息气泡 ==================== */
.bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 16px;
  line-height: 1.6;
  word-wrap: break-word;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.bubble.assistant {
  align-self: flex-start;
  background: white;
  color: #1e293b;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.bubble-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
}

.bubble.assistant .meta {
  color: #94a3b8;
}

/* ==================== 解决方案样式 ==================== */
.guidance-alert {
  margin-bottom: 16px;
}

.solution-container {
  margin-top: 12px;
}

.problem-summary {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  margin-bottom: 20px;
}

.problem-summary h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.problem-summary p {
  font-size: 14px;
  color: #475569;
  margin: 0;
  line-height: 1.6;
}

.quick-diagnosis {
  margin-bottom: 24px;
}

.quick-diagnosis .el-tag {
  padding: 8px 16px;
  font-size: 14px;
}

.troubleshooting-steps h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

/* ==================== 步骤卡片 ==================== */
.step-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.step-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.step-title-row h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-description {
  margin-bottom: 16px;
}

.step-description p {
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
  margin: 0;
}

/* ==================== 媒体网格 ==================== */
.step-media {
  margin: 16px 0;
}

.step-media h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.media-item {
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.media-image,
.media-video {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #94a3b8;
  gap: 8px;
}

/* ==================== 步骤详情元素 ==================== */
.step-expected,
.step-tools,
.step-failed {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: #475569;
}

.step-tools {
  flex-wrap: wrap;
}

.tool-tag {
  margin-left: 4px;
  margin-top: 4px;
}

.step-safety {
  margin-top: 12px;
}

.safety-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 13px;
}

.safety-list li {
  margin-bottom: 4px;
}

/* ==================== 文本回复 ==================== */
.text-response {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
}

/* ==================== 输入框区域 ==================== */
.input-wrapper {
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
}

.input-wrap {
  width: 80%;
}


.input-wrapper.input-center {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.input-wrapper.input-center :deep(.message-input) {
  max-width: 800px;
  width: 100%;
}

.input-wrapper.input-bottom :deep(.message-input) {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==================== 响应式设计 - 平板 ==================== */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .bubble {
    max-width: 80%;
  }
  
  .summary-logo {
    width: 100px;
    height: 100px;
  }
  
  .summary-title {
    font-size: 28px;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* ==================== 响应式设计 - 移动端 ==================== */
@media (max-width: 768px) {
  /* 显示移动端菜单按钮 */
  .mobile-menu-btn {
    display: flex !important; /* 强制显示 */
  }
  .input-wrap {
    width: 100%;
  }
  /* 侧边栏变为抽屉式 */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    z-index: 1001;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  /* 显示遮罩层 */
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* 主内容区域占满 */
  .main {
    width: 100%;
  }
  
  /* 消息气泡调整 */
  .bubble {
    max-width: 85%;
    padding: 12px 16px;
  }
  
  .messages {
    padding: 16px;
  }
  
  /* 欢迎页调整 */
  .summary {
    padding: 16px;
  }
  
  .summary-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }
  
  .summary-title {
    font-size: 24px;
  }
  
  .summary-subtitle {
    font-size: 14px;
  }
  
  /* 输入框调整 */
  .input-wrapper {
    padding: 12px 16px;
  }
  
  .input-wrapper.input-center :deep(.message-input),
  .input-wrapper.input-bottom :deep(.message-input) {
    max-width: 100%;
  }
  
  /* 步骤卡片调整 */
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .step-title-row {
    width: 100%;
  }
  
  .step-title-row h4 {
    font-size: 14px;
  }
  
  /* 媒体网格调整 */
  .media-grid {
    grid-template-columns: 1fr;
  }
  
  .media-image,
  .media-video {
    height: 200px;
  }
  
  /* 问题摘要调整 */
  .problem-summary {
    padding: 12px;
  }
  
  .problem-summary h3 {
    font-size: 15px;
  }
  
  .problem-summary p {
    font-size: 13px;
  }
  
  /* 工具标签换行 */
  .step-tools {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ==================== 响应式设计 - 小屏手机 ==================== */
@media (max-width: 480px) {
  .sidebar {
    width: 260px;
  }
  
  .bubble {
    max-width: 90%;
    font-size: 14px;
    padding: 10px 14px;
  }
  
  .messages {
    padding: 12px;
  }
  
  .summary-logo {
    width: 64px;
    height: 64px;
  }
  
  .summary-title {
    font-size: 20px;
  }
  
  .summary-subtitle {
    font-size: 13px;
  }
  
  .step-description p {
    font-size: 13px;
  }
  
  .media-image,
  .media-video {
    height: 180px;
  }
  
  .input-wrapper {
    padding: 10px 12px;
  }
}

/* ==================== 横屏适配 ==================== */
@media (max-height: 600px) and (orientation: landscape) {
  .summary-logo {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
  }
  
  .summary-title {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .summary-subtitle {
    font-size: 13px;
  }
  
  .messages {
    padding: 12px 16px;
  }
  
  .bubble {
    padding: 8px 12px;
  }
}

/* ==================== 打印样式 ==================== */
@media print {
  .sidebar,
  .input-wrapper,
  .collapse-btn,
  .el-checkbox {
    display: none !important;
  }
  
  .main {
    width: 100%;
  }
  
  .bubble {
    max-width: 100%;
    break-inside: avoid;
  }
}
</style>