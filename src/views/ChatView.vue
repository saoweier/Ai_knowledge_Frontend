<template>
  <div class="chat-workbench">
    <aside
      class="session-sidebar"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <div class="sidebar-top">
        <div
          v-if="!sidebarCollapsed"
          class="brand-block"
        >
          <p>Chat 工作台</p>
          <h2>设备智能专家</h2>
        </div>
        <el-button
          class="collapse-btn"
          text
          circle
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <el-icon>
            <ArrowLeft v-if="!sidebarCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </el-button>
      </div>

      <div
        v-if="!sidebarCollapsed"
        class="sidebar-body"
      >
        <div class="sidebar-summary">
          <span>会话数 {{ sessions.length }}</span>
          <span>当前 {{ activeSession + 1 }}</span>
        </div>

        <el-scrollbar class="session-scroll">
          <button
            v-for="(session, index) in sessions"
            :key="session.id"
            type="button"
            class="session-card"
            :class="{ active: index === activeSession }"
            @click="switchSession(index)"
          >
            <strong>{{ session.title }}</strong>
            <span>{{ summarizeSession(session) }}</span>
            <small>{{ formatTime(session.updatedAt) }}</small>
          </button>
        </el-scrollbar>

        <el-button
          type="primary"
          class="new-session-btn"
          @click="newSession"
        >
          新建对话
        </el-button>
      </div>
    </aside>

    <main class="conversation-shell">
      <header
        class="shell-header"
        :class="{ compact: messages.length > 0 }"
      >
        <div>
          <p class="eyebrow">统一对话工作台</p>
          <h1>设备诊断与知识问答</h1>
          <p class="header-copy">统一问答、排查和知识复盘，重点保留在核心消息区。</p>
        </div>
        <div class="header-side">
          <div class="header-pill">
            <span>当前接口</span>
            <strong>{{ apiLabel }}</strong>
          </div>
          <div class="header-pill">
            <span>上下文</span>
            <strong>{{ memoryLimit }} 条</strong>
          </div>
        </div>
      </header>

      <section
        v-if="messages.length === 0"
        class="empty-state"
      >
        <div class="empty-hero">
          <img
            src="/expert.png"
            alt="设备智能专家"
            class="hero-logo"
          >
          <div>
            <h2>把问题描述完整一些，系统会更快给出诊断路径</h2>
            <p>适合输入故障现象、报警码、维修步骤、设备型号，或直接让系统总结知识点。</p>
          </div>
        </div>

        <div class="prompt-grid">
          <button
            v-for="prompt in recommendedPrompts"
            :key="prompt"
            type="button"
            class="prompt-card"
            @click="sendPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </section>

      <el-scrollbar
        v-else
        ref="messageScrollRef"
        class="message-scroll"
      >
        <div class="message-stack">
          <template
            v-for="(msg, index) in messages"
            :key="index"
          >
            <div
              v-if="msg.role === 'user'"
              class="message-row user"
            >
              <div class="message-card user-card">
                <div class="message-body">
                  {{ msg.text }}
                </div>
                <div class="message-time">
                  {{ formatTime(msg.time) }}
                </div>
              </div>
            </div>

            <div
              v-else
              class="message-row assistant"
            >
              <div class="assistant-avatar">
                <img
                  src="/expert.png"
                  alt="assistant"
                >
              </div>

              <div class="message-card assistant-card">
                <el-alert
                  v-if="msg.guidance"
                  type="info"
                  :closable="false"
                  class="guidance-alert"
                >
                  <template #title>
                    {{ msg.guidance }}
                  </template>
                </el-alert>

                <template v-if="msg.solution">
                  <div class="summary-grid">
                    <article class="summary-card">
                      <span>问题摘要</span>
                      <strong>{{ msg.solution.problem_summary || '未提供' }}</strong>
                    </article>
                    <article class="summary-card highlight">
                      <span>核心结论</span>
                      <strong>{{ msg.solution.quick_diagnosis || '等待进一步判断' }}</strong>
                    </article>
                  </div>

                  <div
                    v-if="msg.solution.troubleshooting_steps?.length"
                    class="content-section"
                  >
                    <div class="section-head">
                      <h3>操作建议</h3>
                      <span>共 {{ msg.solution.troubleshooting_steps.length }} 步</span>
                    </div>
                    <div class="step-list">
                      <article
                        v-for="(step, stepIndex) in msg.solution.troubleshooting_steps"
                        :key="stepIndex"
                        class="step-card"
                      >
                        <div class="step-head">
                          <el-tag
                            size="small"
                            :type="getCategoryType(step.category)"
                          >
                            {{ getCategoryLabel(step.category) }}
                          </el-tag>
                          <strong>步骤 {{ step.step_number || stepIndex + 1 }} · {{ step.title }}</strong>
                        </div>
                        <p>{{ step.description }}</p>
                        <p
                          v-if="step.expected_result"
                          class="step-expected"
                        >
                          预期结果：{{ step.expected_result }}
                        </p>
                        <div
                          v-if="step.images?.length"
                          class="media-grid"
                        >
                          <template
                            v-for="(mediaUrl, mediaIndex) in step.images"
                            :key="mediaIndex"
                          >
                            <video
                              v-if="isVideo(mediaUrl)"
                              :src="mediaUrl"
                              controls
                              class="media-item"
                            />
                            <el-image
                              v-else
                              :src="mediaUrl"
                              fit="cover"
                              class="media-item"
                              :preview-src-list="step.images.filter((item) => !isVideo(item))"
                              :initial-index="getUiImageIndex(step.images, mediaUrl)"
                              :preview-teleported="true"
                            />
                          </template>
                        </div>
                      </article>
                    </div>
                  </div>

                  <div
                    v-if="msg.solution.related_knowledge?.length"
                    class="content-section"
                  >
                    <div class="section-head">
                      <h3>参考资料</h3>
                      <span>{{ msg.solution.related_knowledge.length }} 条</span>
                    </div>
                    <el-collapse>
                      <el-collapse-item
                        title="展开查看参考知识"
                        name="references"
                      >
                        <article
                          v-for="(item, refIndex) in msg.solution.related_knowledge"
                          :key="refIndex"
                          class="knowledge-card"
                        >
                          <div class="knowledge-head">
                            <strong>{{ item.chunk_id || `参考项 ${refIndex + 1}` }}</strong>
                            <span>匹配度 {{ (item.score ?? 0).toFixed(2) }}</span>
                          </div>
                          <p>{{ item.content }}</p>
                        </article>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </template>

                <div v-else class="plain-answer">
                  {{ msg.text }}
                </div>

                <div class="message-time">
                  {{ formatTime(msg.time) }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-scrollbar>

      <footer class="input-dock">
        <MessageInput
          :loading="loading"
          :default-api="api"
          :default-options="options"
          :default-memory-limit="memoryLimit"
          :voice-enabled="voiceEnabled"
          :is-recording="isRecording"
          :is-speaking="isSpeaking"
          :placeholder="'描述设备故障、输入报警码，或让系统总结已有知识'"
          :context-hint="'输入故障、知识点或总结请求'"
          :mode-label="'Chat 对话'"
          :voice-state-label="voiceStateLabel"
          :voice-tone="voiceStatusTone"
          :recognized-text="recognizedText"
          :voice-error="lastError"
          @send="onSend"
          @update:api="(value) => api = value"
          @update:options="(value) => options = value"
          @update:memory="(value) => memoryLimit = value"
          @update:voice-enabled="(value) => handleVoiceToggle(value)"
          @voice-toggle="handleVoiceToggle"
          @mic-click="handleMicClick"
          @stop-speaking="stopSpeaking"
        />
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import http from '@/api/http'
import MessageInput from '@/components/MessageInput.vue'
import { useVoiceController } from '@/composables/useVoiceController'

const sidebarCollapsed = ref(false)
const sessions = ref([{ id: Date.now(), title: '当前对话', messages: [], updatedAt: Date.now() }])
const activeSession = ref(0)
const messages = ref(sessions.value[0].messages)
const messageScrollRef = ref(null)

const loading = ref(false)
const api = ref('search_with_solution')
const options = ref({ enableLLM: true, forceContent: '', diversify: true })
const memoryLimit = ref(3)

const {
  voiceEnabled,
  isRecording,
  isSpeaking,
  recognizedText,
  lastError,
  voiceStateLabel,
  voiceStatusTone,
  setVoiceEnabled,
  startWakeWordDetection,
  stopWakeWordDetection,
  startRecording,
  stopRecording,
  speakText,
  stopSpeaking
} = useVoiceController()

const recommendedPrompts = [
  '拉丝机触摸屏报 PLC 异常，先排查什么？',
  '故障代码 F7016 说明什么，建议怎么处理？',
  '总结一下最近一次维修记录中的关键步骤',
  '把这个问题拆成检查、调整和更换三部分建议'
]

const apiLabel = computed(() => {
  if (api.value === 'search_with_solution') return '增强搜索'
  if (api.value === 'search') return '基础搜索'
  return api.value
})

function currentSession() {
  return sessions.value[activeSession.value]
}

function syncSessionMeta(seedText = '') {
  const session = currentSession()
  if (!session) return
  session.updatedAt = Date.now()
  if (seedText && (session.title === '当前对话' || session.title === '新对话')) {
    session.title = seedText.slice(0, 16)
  }
}

function switchSession(index) {
  activeSession.value = index
  messages.value = sessions.value[index].messages
  scrollToLatestCard(false)
}

function newSession() {
  sessions.value.unshift({
    id: Date.now(),
    title: '新对话',
    messages: [],
    updatedAt: Date.now()
  })
  switchSession(0)
}

function summarizeSession(session) {
  const firstUser = session.messages.find((item) => item.role === 'user')
  if (!firstUser) return '暂无消息'
  return firstUser.text.slice(0, 18)
}

async function handleVoiceToggle(enabled) {
  setVoiceEnabled(enabled)
  if (enabled) {
    await startWakeWordDetection(() => {
      handleMicClick()
    })
  } else {
    stopWakeWordDetection()
    stopSpeaking()
  }
}

function handleMicClick() {
  if (!voiceEnabled.value) return
  if (isRecording.value) {
    stopRecording()
    return
  }

  stopSpeaking()
  startRecording((text) => {
    if (text) {
      onSend({ text, api: api.value, options: options.value })
    }
  })
}

async function onSend({ text, api: whichApi, options: currentOptions }) {
  if (!text?.trim()) return

  syncSessionMeta(text)
  messages.value.push({ role: 'user', text, time: Date.now() })
  scrollToLatestCard()

  const lastN = pickContext(messages.value, memoryLimit.value)
  loading.value = true
  try {
    if (whichApi === 'search_with_solution') {
      const thinking = ElLoading.service({
        lock: true,
        text: '模型思考中，请稍候…',
        background: 'rgba(15, 23, 42, 0.22)'
      })
      let response
      try {
        response = await http.get('/search_with_solution', {
          params: {
            query_text: text,
            enable_llm_integration: !!currentOptions.enableLLM,
            force_content_type: currentOptions.forceContent || undefined,
            context_json: JSON.stringify(lastN)
          }
        })
      } finally {
        thinking.close()
      }

      const data = response.data || {}
      const assistantMessage = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        solution: data.progressive_solution || null,
        text: data.answer || data.message || data.guidance || '（无可展示内容）'
      }
      messages.value.push(assistantMessage)
      scrollToLatestCard()
      await speakAssistantSummary(assistantMessage)
    } else {
      const params = {
        query_text: text,
        context_json: JSON.stringify(lastN)
      }
      if (currentOptions.forceContent) params.force_content_type = currentOptions.forceContent
      params.diversify_results = !!currentOptions.diversify

      const response = await http.get('/search', { params })
      const data = response.data || {}
      const assistantMessage = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        text: data.answer || data.message || data.guidance || '（无可展示内容）'
      }
      messages.value.push(assistantMessage)
      scrollToLatestCard()
      await speakAssistantSummary(assistantMessage)
    }

    syncSessionMeta()
  } catch (error) {
    console.error(error)
    ElMessage.error('请求失败，请检查后端服务或控制台日志')
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: '请求失败，请稍后重试。'
    })
  } finally {
    loading.value = false
  }
}

async function speakAssistantSummary(message) {
  if (!voiceEnabled.value || isSpeaking.value) return

  const segments = []
  if (message.guidance) segments.push(message.guidance)
  if (message.solution?.quick_diagnosis) segments.push(`核心结论：${message.solution.quick_diagnosis}`)
  if (message.text) segments.push(message.text)
  if (!segments.length) return
  await speakText(segments.join('。'))
}

function sendPrompt(prompt) {
  onSend({ text: prompt, api: api.value, options: options.value })
}

function scrollToLatestCard(smooth = true) {
  nextTick(() => {
    const wrap = messageScrollRef.value?.wrapRef
    const target = wrap?.querySelector('.message-stack .message-card:last-of-type')
    if (target) {
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
    }
  })
}

function pickContext(allMessages, count) {
  const recent = allMessages.slice(-count)
  return recent.map((message) => {
    if (message.role === 'user') return { role: 'user', content: message.text }
    if (message.solution?.troubleshooting_steps?.length) {
      const titles = message.solution.troubleshooting_steps.map((step) => step.title).join('；')
      return {
        role: 'assistant',
        content: `【摘要】${message.solution.quick_diagnosis || ''}；【步骤】${titles}`
      }
    }
    return { role: 'assistant', content: message.text || message.guidance || '' }
  })
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

function getUiImageIndex(allImages, currentUrl) {
  const imagesOnly = allImages.filter((item) => !isVideo(item))
  return imagesOnly.indexOf(currentUrl)
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

watch(() => messages.value.length, () => {
  scrollToLatestCard(false)
})
</script>

<style scoped>
.chat-workbench {
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr);
  height: calc(100vh - 64px);
  background:
    radial-gradient(circle at top left, rgba(17, 94, 89, 0.08), transparent 25%),
    linear-gradient(180deg, #f4f2eb 0%, #eef3f0 100%);
}

.session-sidebar {
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: linear-gradient(180deg, #16322f 0%, #0f201e 100%);
  color: #eaf4f1;
}

.session-sidebar.collapsed {
  width: 88px;
  padding-inline: 14px;
}

.sidebar-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.brand-block p,
.brand-block h2 {
  margin: 0;
}

.brand-block p {
  font-size: 12px;
  opacity: 0.72;
}

.brand-block h2 {
  margin-top: 4px;
  font-size: 22px;
}

.collapse-btn {
  color: #eaf4f1;
}

.sidebar-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  flex: 1;
  margin-top: 18px;
}

.sidebar-summary {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.72;
}

.session-scroll {
  flex: 1;
}

.session-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.session-card.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(151, 220, 201, 0.4);
}

.session-card strong {
  font-size: 14px;
}

.session-card span,
.session-card small {
  opacity: 0.78;
}

.new-session-btn {
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-color: #d97706;
}

.conversation-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 14px 16px 12px;
  gap: 12px;
}

.shell-header,
.empty-state,
.input-dock {
  max-width: 1340px;
  width: 100%;
  margin: 0 auto;
}

.shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 4px 0;
}

.shell-header.compact {
  gap: 12px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0f766e;
  text-transform: uppercase;
}

.shell-header h1,
.header-copy {
  margin: 0;
}

.shell-header h1 {
  font-size: 24px;
  color: #14231f;
}

.header-copy {
  margin-top: 4px;
  color: #5b6b67;
  line-height: 1.5;
  font-size: 13px;
}

.header-side {
  display: flex;
  gap: 10px;
}

.header-pill {
  min-width: 104px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(17, 94, 89, 0.1);
}

.header-pill span,
.header-pill strong {
  display: block;
}

.header-pill span {
  font-size: 12px;
  color: #64748b;
}

.header-pill strong {
  margin-top: 6px;
  color: #14231f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(17, 94, 89, 0.08);
}

.empty-hero {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
}

.hero-logo {
  width: 100px;
  height: 100px;
  border-radius: 28px;
}

.empty-hero h2,
.empty-hero p {
  margin: 0;
}

.empty-hero p {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.prompt-card {
  padding: 18px;
  border: 1px solid rgba(17, 94, 89, 0.08);
  border-radius: 18px;
  text-align: left;
  background: #fcfdfc;
  cursor: pointer;
  color: #1f2937;
  line-height: 1.6;
}

.message-scroll {
  flex: 1;
  min-height: 0;
}

.message-stack {
  max-width: 1340px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 0 12px;
}

.message-row {
  display: flex;
  gap: 14px;
}

.message-row.user {
  justify-content: flex-end;
}

.assistant-avatar {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-card {
  width: min(100%, 1040px);
  border-radius: 22px;
  padding: 16px 18px;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06);
}

.user-card {
  background: linear-gradient(135deg, #115e59 0%, #0f766e 100%);
  color: #f8fffd;
}

.assistant-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(17, 94, 89, 0.08);
}


.message-body,
.plain-answer {
  margin-top: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.guidance-alert {
  margin-top: 14px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.summary-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f7faf9;
}

.summary-card.highlight {
  background: #eef7f4;
}

.summary-card span,
.summary-card strong {
  display: block;
}

.summary-card span {
  font-size: 12px;
  color: #64748b;
}

.summary-card strong {
  margin-top: 8px;
  line-height: 1.6;
}

.content-section {
  margin-top: 18px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.section-head h3,
.section-head span {
  margin: 0;
}

.section-head h3 {
  font-size: 16px;
}

.section-head span {
  font-size: 12px;
  color: #64748b;
}

.step-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.step-card,
.knowledge-card {
  padding: 16px;
  border-radius: 18px;
  background: #fbfcfb;
  border: 1px solid rgba(15, 118, 110, 0.08);
}

.step-head,
.knowledge-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.step-card p,
.knowledge-card p {
  margin: 10px 0 0;
  line-height: 1.7;
  color: #334155;
}

.step-expected {
  color: #0f766e;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.media-item {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.message-time {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 1080px) {
  .chat-workbench {
    grid-template-columns: 1fr;
  }

  .session-sidebar {
    display: none;
  }

  .shell-header {
    flex-direction: column;
  }

  .header-side,
  .summary-grid,
  .prompt-grid,
  .media-grid,
  .step-list {
    grid-template-columns: 1fr;
    display: grid;
  }

  .empty-hero {
    grid-template-columns: 1fr;
  }
}
</style>
