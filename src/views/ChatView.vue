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
        <div class="shell-header-copy">
          <p class="eyebrow">统一对话工作台</p>
          <h1>设备诊断与知识问答</h1>
          <p class="header-copy">统一问答、排查和知识复盘，重点保留在核心消息区。</p>
        </div>
      </header>

      <section
        class="mobile-session-rail"
        aria-label="会话切换"
      >
        <div class="mobile-session-scroll">
          <button
            v-for="(session, index) in sessions"
            :key="`mobile-${session.id}`"
            type="button"
            class="mobile-session-chip"
            :class="{ active: index === activeSession }"
            @click="switchSession(index)"
          >
            <span class="mobile-session-chip-title">{{ session.title }}</span>
            <small>{{ formatTime(session.updatedAt) }}</small>
          </button>
        </div>
        <button
          type="button"
          class="mobile-session-add"
          @click="newSession"
        >
          新建
        </button>
      </section>

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
                            <strong>{{ getKnowledgeDisplayTitle(item, refIndex, '参考项') }}</strong>
                            <span>匹配度 {{ (item.score ?? 0).toFixed(2) }}</span>
                          </div>
                          <div class="knowledge-body">{{ formatKnowledgeContent(item.content) }}</div>
                        </article>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </template>

                <template v-else-if="msg.results?.length">
                  <div class="content-section">
                    <div class="section-head">
                      <h3>Top 向量命中</h3>
                      <span>{{ msg.results.length }} 条</span>
                    </div>
                    <template v-if="hasOverviewGuide(msg.results)">
                      <article class="knowledge-card overview-card">
                        <div class="knowledge-head">
                          <strong>{{ getKnowledgeDisplayTitle(msg.results[0], 0, '结果') }}</strong>
                          <span>匹配度 {{ formatScore(msg.results[0]?.score) }}</span>
                        </div>
                        <div class="knowledge-body">{{ formatKnowledgeContent(msg.results[0]?.content) }}</div>
                      </article>
                      <div
                        v-if="getOverviewChildren(msg.results).length"
                        class="knowledge-link-row"
                      >
                        <button
                          v-for="(item, childIndex) in getOverviewChildren(msg.results)"
                          :key="`${item.chunk_id || 'child'}-${childIndex}`"
                          type="button"
                          class="knowledge-link-btn"
                          :class="{ active: getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id === item.chunk_id }"
                          @click="setSelectedKnowledge(`${index}-results`, item.chunk_id)"
                        >
                          {{ getKnowledgeDisplayTitle(item, childIndex, '细节') }}
                        </button>
                      </div>
                      <article
                        v-if="getSelectedKnowledge(`${index}-results`, msg.results)"
                        class="knowledge-card detail-card"
                      >
                        <div class="knowledge-head">
                          <strong>{{ getKnowledgeDisplayTitle(getSelectedKnowledge(`${index}-results`, msg.results), 0, '细节') }}</strong>
                          <span>匹配度 {{ formatScore(getSelectedKnowledge(`${index}-results`, msg.results)?.score) }}</span>
                        </div>
                        <div class="knowledge-body">{{ formatKnowledgeContent(getSelectedKnowledge(`${index}-results`, msg.results)?.content) }}</div>
                        <div
                          v-if="getKnowledgeChildren(getSelectedKnowledge(`${index}-results`, msg.results), msg.results).length"
                          class="knowledge-link-row nested"
                        >
                          <button
                            v-for="(item, nestedIndex) in getKnowledgeChildren(getSelectedKnowledge(`${index}-results`, msg.results), msg.results)"
                            :key="`${item.chunk_id || 'nested'}-${nestedIndex}`"
                            type="button"
                            class="knowledge-link-btn secondary"
                            :class="{ active: getSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${index}-results`, msg.results))?.chunk_id === item.chunk_id }"
                            @click="setSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, item.chunk_id)"
                          >
                            {{ getKnowledgeDisplayTitle(item, nestedIndex, '下一级') }}
                          </button>
                        </div>
                        <article
                          v-if="getSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${index}-results`, msg.results))"
                          class="knowledge-card nested-detail-card"
                        >
                          <div class="knowledge-head">
                            <strong>{{ getKnowledgeDisplayTitle(getSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${index}-results`, msg.results)), 0, '下一级') }}</strong>
                            <span>匹配度 {{ formatScore(getSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${index}-results`, msg.results))?.score) }}</span>
                          </div>
                          <div class="knowledge-body">{{ formatKnowledgeContent(getSelectedKnowledge(`${index}-results-${getSelectedKnowledge(`${index}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${index}-results`, msg.results))?.content) }}</div>
                        </article>
                        <div
                          v-if="isOverviewItem(getSelectedKnowledge(`${index}-results`, msg.results)) && !getKnowledgeChildren(getSelectedKnowledge(`${index}-results`, msg.results), msg.results).length"
                          class="knowledge-actions"
                        >
                          <button
                            type="button"
                            class="knowledge-drill-btn"
                            @click="drillIntoKnowledge(getSelectedKnowledge(`${index}-results`, msg.results))"
                          >
                            继续查看下一层
                          </button>
                        </div>
                      </article>
                    </template>
                    <template v-else>
                      <article
                        v-for="(item, resultIndex) in msg.results"
                        :key="`${item.chunk_id || 'result'}-${resultIndex}`"
                        class="knowledge-card"
                      >
                        <div class="knowledge-head">
                          <strong>{{ getKnowledgeDisplayTitle(item, resultIndex, '结果') }}</strong>
                          <span>匹配度 {{ formatScore(item.score) }}</span>
                        </div>
                        <div class="knowledge-body">{{ formatKnowledgeContent(item.content) }}</div>
                      </article>
                    </template>
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

          <div
            v-if="loading"
            class="message-row assistant loading-row"
            aria-live="polite"
          >
            <div class="assistant-avatar thinking-avatar">
              <img
                src="/expert.png"
                alt="assistant thinking"
              >
            </div>

            <div class="message-card assistant-card thinking-card">
              <div class="thinking-head">
                <span class="thinking-kicker">正在分析</span>
                <strong>正在整理诊断路径与知识依据</strong>
              </div>
              <div class="thinking-wave" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div class="thinking-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p class="thinking-copy">正在比对知识条目、提炼结论并组织更易阅读的回复。</p>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <footer class="input-dock">
        <MessageInput
          :loading="loading"
          :default-api="api"
          :default-options="options"
          :default-memory-limit="memoryLimit"
          :collection-options="collectionOptions"
          :collection-loading="collectionLoading"
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
          @clear="clearAll"
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
import { nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
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
const options = ref({ enableLLM: false, collectionName: '', forceContent: '', diversify: true })
const memoryLimit = ref(3)
const collectionOptions = ref([])
const collectionLoading = ref(false)
const selectedKnowledgeMap = ref({})

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
  '这款拉丝机有哪些特色？',
  '拉丝机安装有哪些注意事项',
  '拉丝机操作说明',
  '拉丝机保养有哪些内容'
]

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

function clearAll() {
  currentSession().messages = []
  messages.value = []
  stopSpeaking()
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

async function onSend({ text, api: whichApi, options: currentOptions, displayText }) {
  if (!text?.trim()) return

  const shownText = displayText || text
  syncSessionMeta(shownText)
  messages.value.push({ role: 'user', text: shownText, time: Date.now() })
  scrollToLatestCard()

  const lastN = pickContext(messages.value, memoryLimit.value)
  loading.value = true
  try {
    if (whichApi === 'search_with_solution') {
      const response = await http.get('/search_with_solution', {
        params: {
          query_text: text,
          enable_llm_integration: !!currentOptions.enableLLM,
          collection_name: currentOptions.collectionName || undefined,
          force_content_type: currentOptions.forceContent || undefined,
          context_json: JSON.stringify(lastN)
        }
      })


      const data = response.data || {}
      const assistantMessage = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        solution: data.progressive_solution || null,
        results: Array.isArray(data.results) ? data.results : [],
        text: data.answer || data.message || data.guidance || '（无可展示内容）'
      }
      messages.value.push(assistantMessage)
      scrollToLatestCard()
      await speakAssistantSummary(assistantMessage)
    } else {
      const params = {
        query_text: text,
        collection_name: currentOptions.collectionName || undefined,
        context_json: JSON.stringify(lastN)
      }
      if (currentOptions.forceContent) params.force_content_type = currentOptions.forceContent
      params.diversify_results = !!currentOptions.diversify

      const response = await http.get('/search', { params })
      const data = response.data || {}
      const assistantMessage = {
        role: 'assistant',
        time: Date.now(),
        results: Array.isArray(data.results) ? data.results : [],
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
  if (!message.solution && message.results?.length) {
    segments.push(`Top 命中：${(message.results[0]?.content || '').slice(0, 80)}`)
  }
  if (message.text) segments.push(message.text)
  if (!segments.length) return
  await speakText(segments.join('。'))
}

async function fetchCollections() {
  collectionLoading.value = true
  try {
    const response = await http.get('/kb/collections')
    const items = Array.isArray(response.data) ? response.data : []
    collectionOptions.value = items.map((item) => ({
      label: `${item.name}${typeof item.points_count === 'number' ? ` (${item.points_count})` : ''}`,
      value: item.name
    }))
  } catch (error) {
    console.error(error)
    collectionOptions.value = []
  } finally {
    collectionLoading.value = false
  }
}

function sendPrompt(prompt) {
  onSend({ text: prompt, api: api.value, options: options.value })
}

function scrollToLatestCard() {
  nextTick(() => {
    const wrap = messageScrollRef.value?.wrapRef
    if (wrap) {
      wrap.scrollTop = wrap.scrollHeight
    }
  })
}

watch(loading, (value) => {
  if (value) {
    scrollToLatestCard()
  }
})

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

function formatScore(score) {
  const value = Number(score)
  return Number.isFinite(value) ? value.toFixed(3) : '0.000'
}

function getKnowledgeDisplayTitle(item, index, fallbackPrefix = '结果') {
  return item?.title || item?.chunk_id || `${fallbackPrefix} ${index + 1}`
}

function formatKnowledgeContent(content) {
  return String(content || '')
    .replace(/\|/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isOverviewItem(item) {
  return /overview/i.test(String(item?.chunk_id || ''))
}

function hasOverviewGuide(items) {
  return Array.isArray(items) && items.length > 1 && isOverviewItem(items[0])
}

function getOverviewChildren(items) {
  if (!hasOverviewGuide(items)) return []
  const root = items[0]
  const directChildren = getKnowledgeChildren(root, items)
  return directChildren.length ? directChildren : items.slice(1)
}

function getKnowledgeChildren(parentItem, items) {
  if (!parentItem || !Array.isArray(items)) return []
  const parentId = String(parentItem?.chunk_id || '')
  if (!parentId) return []
  return items.filter((item) => String(item?.metadata?.parent_chunk_id || '') === parentId)
}

function setSelectedKnowledge(key, chunkId) {
  selectedKnowledgeMap.value = {
    ...selectedKnowledgeMap.value,
    [key]: chunkId
  }
}

function getSelectedKnowledge(key, items, parentItem = null) {
  const children = parentItem ? getKnowledgeChildren(parentItem, items) : getOverviewChildren(items)
  if (!children.length) return null
  const selectedId = selectedKnowledgeMap.value[key]
  return children.find((item) => item.chunk_id === selectedId) || children[0]
}

function drillIntoKnowledge(item) {
  if (!item) return
  onSend({
    text: `__kb_drill__:${item?.chunk_id || ''} ${item?.title || ''}`.trim(),
    displayText: `继续查看：${item?.title || item?.chunk_id || ''}`,
    api: api.value,
    options: options.value
  })
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

onMounted(() => {
  fetchCollections()
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
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
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

.input-dock {
  margin-top: auto;
  position: sticky;
  bottom: 0;
  z-index: 8;
  padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(238, 243, 240, 0) 0%, rgba(238, 243, 240, 0.92) 20%, rgba(238, 243, 240, 0.98) 100%);
  backdrop-filter: blur(10px);
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

.overview-card {
  border-color: rgba(15, 118, 110, 0.22);
  background: linear-gradient(180deg, #f6fffc 0%, #fbfcfb 100%);
}

.detail-card {
  margin-top: 12px;
}

.knowledge-link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.knowledge-link-btn {
  border: 1px solid rgba(15, 118, 110, 0.18);
  background: #ffffff;
  color: #0f766e;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-link-row.nested {
  margin-top: 14px;
}

.knowledge-link-btn.secondary {
  background: rgba(15, 118, 110, 0.08);
}

.nested-detail-card {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.82);
}

.knowledge-link-btn:hover,
.knowledge-link-btn.active {
  background: #0f766e;
  color: #ffffff;
  border-color: #0f766e;
}

.knowledge-body {
  margin-top: 10px;
  color: #334155;
  line-height: 1.75;
  white-space: pre-line;
}

.knowledge-actions {
  margin-top: 12px;
}

.knowledge-drill-btn {
  border: 1px solid rgba(15, 118, 110, 0.18);
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
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

.chat-workbench {
  grid-template-columns: minmax(232px, 280px) minmax(0, 1fr);
  height: calc(100vh - 76px);
  padding: clamp(10px, 1.6vw, 18px);
  gap: clamp(12px, 1.6vw, 20px);
  background: transparent;
}

.session-sidebar {
  border-radius: 30px;
  border: 1px solid rgba(65, 88, 80, 0.14);
  background:
    linear-gradient(180deg, rgba(24, 59, 54, 0.96), rgba(16, 38, 35, 0.96)),
    linear-gradient(135deg, rgba(180, 107, 49, 0.16), transparent);
  box-shadow: var(--shadow-md);
}

.brand-block p {
  color: rgba(239, 245, 242, 0.68);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-block h2 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.25rem, 1.6vw, 1.65rem);
  letter-spacing: -0.02em;
}

.collapse-btn,
.collapse-btn:hover {
  color: #f4f2eb;
  background: rgba(255, 255, 255, 0.08);
}

.session-card {
  min-height: 88px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease;
}

.session-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.session-card.active {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(180, 107, 49, 0.12));
  border-color: rgba(244, 222, 195, 0.34);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.new-session-btn {
  min-height: 48px;
  border-radius: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent) 0%, #8b4f22 100%);
  border-color: transparent;
  box-shadow: 0 14px 28px rgba(180, 107, 49, 0.22);
}

.conversation-shell {
  gap: 14px;
  padding: 0;
}

.shell-header,
.empty-state,
.input-dock,
.message-stack {
  max-width: 1240px;
}

.shell-header {
  align-items: stretch;
  padding: 22px 24px;
  border-radius: 30px;
  border: 1px solid rgba(65, 88, 80, 0.12);
  background:
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.9), rgba(248, 243, 236, 0.76));
  box-shadow: var(--shadow-sm);
}

.eyebrow {
  color: var(--accent);
}

.shell-header h1 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  letter-spacing: -0.03em;
}

.header-copy {
  max-width: 58ch;
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-soft);
}

.header-side {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-pill {
  min-width: 136px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 251, 246, 0.68);
  border: 1px solid rgba(65, 88, 80, 0.12);
  backdrop-filter: blur(10px);
}

.header-pill span {
  color: var(--text-faint);
}

.header-pill strong {
  color: var(--text);
  font-size: 15px;
}

.mobile-session-rail {
  display: none;
}

.empty-state {
  padding: clamp(20px, 3vw, 28px);
  border-radius: 30px;
  background:
    radial-gradient(circle at 0% 0%, rgba(31, 98, 89, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.88), rgba(246, 240, 232, 0.74));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.hero-logo {
  width: clamp(88px, 10vw, 112px);
  height: clamp(88px, 10vw, 112px);
  padding: 10px;
  border-radius: 28px;
  background: rgba(255, 251, 246, 0.86);
  box-shadow: 0 18px 40px rgba(31, 98, 89, 0.12);
}

.empty-hero h2 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  line-height: 1.25;
}

.prompt-card {
  min-height: 120px;
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(249, 244, 238, 0.88));
  box-shadow: 0 18px 32px rgba(26, 34, 31, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.prompt-card:hover {
  transform: translateY(-3px);
  border-color: rgba(180, 107, 49, 0.24);
  box-shadow: 0 22px 44px rgba(26, 34, 31, 0.1);
}

.message-scroll {
  padding-inline: 4px;
}

.message-stack {
  gap: 18px;
  padding: 6px 0 12px;
}

.message-row {
  align-items: flex-end;
}

.assistant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 20px;
  background: rgba(255, 251, 246, 0.88);
  box-shadow: 0 16px 30px rgba(31, 98, 89, 0.12);
}

.message-card {
  position: relative;
  width: min(100%, 980px);
  padding: 20px 22px 18px;
  border-radius: 28px;
}

.user-card {
  background: linear-gradient(135deg, #255f56 0%, #173f3a 100%);
  box-shadow: 0 24px 48px rgba(31, 98, 89, 0.18);
}

.assistant-card {
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.92), rgba(250, 244, 237, 0.82));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: 0 22px 48px rgba(26, 34, 31, 0.08);
}

.assistant-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  border-radius: 28px 28px 0 0;
  background: linear-gradient(90deg, var(--brand), rgba(180, 107, 49, 0.72));
}

.message-body,
.plain-answer,
.knowledge-body,
.step-card p {
  color: var(--text);
  font-size: 14px;
  line-height: 1.85;
}

.guidance-alert {
  border-radius: 18px;
}

.summary-grid,
.step-list {
  gap: 14px;
}

.summary-card,
.step-card,
.knowledge-card {
  border-radius: 22px;
  background: rgba(255, 251, 246, 0.82);
  border: 1px solid rgba(65, 88, 80, 0.1);
}

.summary-card.highlight {
  background: linear-gradient(180deg, rgba(222, 239, 233, 0.78), rgba(244, 228, 211, 0.58));
}

.section-head h3 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 17px;
}

.knowledge-link-btn,
.knowledge-drill-btn {
  min-height: 40px;
  border-radius: 999px;
  padding-inline: 16px;
  font-weight: 700;
}

.knowledge-link-btn:hover,
.knowledge-link-btn.active,
.knowledge-drill-btn:hover {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  border-color: transparent;
}

.media-item {
  min-height: 160px;
  border-radius: 20px;
  background: rgba(240, 234, 226, 0.8);
}

.message-time {
  color: var(--text-faint);
}

.input-dock {
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(244, 239, 230, 0) 0%, rgba(244, 239, 230, 0.9) 18%, rgba(244, 239, 230, 0.98) 100%);
}

@media (max-width: 1080px) {
  .chat-workbench {
    height: auto;
    min-height: calc(100vh - 76px);
  }

  .conversation-shell {
    min-height: calc(100vh - 112px);
  }

  .mobile-session-rail {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 2px;
  }

  .mobile-session-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
    flex: 1;
  }

  .mobile-session-chip {
    min-width: 150px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(65, 88, 80, 0.12);
    background: rgba(255, 251, 246, 0.84);
    text-align: left;
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }

  .mobile-session-chip.active {
    background: linear-gradient(135deg, rgba(31, 98, 89, 0.12), rgba(180, 107, 49, 0.12));
    border-color: rgba(31, 98, 89, 0.22);
  }

  .mobile-session-chip-title,
  .mobile-session-chip small {
    display: block;
  }

  .mobile-session-chip-title {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .mobile-session-chip small {
    color: var(--text-faint);
  }

  .mobile-session-add {
    min-width: 72px;
    min-height: 48px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--accent) 0%, #8b4f22 100%);
    color: #fffaf4;
    font-weight: 700;
    box-shadow: 0 14px 28px rgba(180, 107, 49, 0.18);
  }
}

@media (max-width: 720px) {
  .chat-workbench {
    padding: 10px;
    gap: 12px;
  }

  .shell-header {
    padding: 18px;
    border-radius: 24px;
  }

  .header-side {
    justify-content: stretch;
  }

  .header-pill {
    flex: 1;
    min-width: 0;
  }

  .message-row.assistant {
    align-items: flex-start;
  }

  .assistant-avatar {
    width: 40px;
    height: 40px;
    border-radius: 16px;
  }

  .message-card {
    width: 100%;
    padding: 18px 16px 16px;
    border-radius: 24px;
  }

  .summary-grid,
  .step-list,
  .prompt-grid,
  .media-grid {
    grid-template-columns: 1fr !important;
  }
}

.chat-workbench {
  gap: 14px;
}

.shell-header {
  padding: 14px 18px;
  border-radius: 24px;
}

.shell-header h1 {
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  line-height: 1.15;
}

.header-copy {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.55;
}

.header-side {
  gap: 8px;
}

.header-pill {
  min-width: 112px;
  padding: 10px 12px;
  border-radius: 16px;
}

.header-pill strong {
  margin-top: 4px;
  font-size: 13px;
}

.mobile-session-rail {
  margin-top: -2px;
}

@media (max-width: 720px) {
  .shell-header {
    padding: 12px 14px;
  }

  .shell-header h1 {
    font-size: 1.15rem;
  }

  .header-copy {
    display: none;
  }
}

.shell-header {
  justify-content: flex-start;
  padding: 10px 14px;
  min-height: auto;
}

.shell-header-copy {
  max-width: 760px;
}

.eyebrow {
  margin-bottom: 2px;
  font-size: 11px;
}

.shell-header h1 {
  font-size: 1.05rem;
}

.header-copy {
  margin-top: 2px;
  font-size: 12px;
}

.header-side,
.header-pill {
  display: none !important;
}

@media (max-width: 720px) {
  .shell-header {
    padding: 8px 10px;
  }

  .eyebrow {
    margin-bottom: 0;
  }
}

.loading-row {
  align-items: flex-start;
}

.thinking-avatar {
  position: relative;
  overflow: hidden;
}

.thinking-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(231, 180, 93, 0.28));
  animation: avatarPulse 1.8s var(--ease-out-quart) infinite;
}

.thinking-card {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 12px;
  padding-bottom: 18px;
}

.thinking-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    radial-gradient(circle at top right, rgba(231, 180, 93, 0.2), transparent 44%),
    linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(246, 238, 224, 0.92));
  pointer-events: none;
}

.thinking-card > * {
  position: relative;
  z-index: 1;
}

.thinking-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
}

.thinking-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(28, 78, 71, 0.08);
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.thinking-head strong {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
}

.thinking-wave {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  min-height: 24px;
}

.thinking-wave span {
  width: 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(24, 59, 54, 0.88), rgba(193, 137, 59, 0.82));
  transform-origin: center bottom;
  animation: thinkingBars 1.1s var(--ease-out-quart) infinite;
}

.thinking-wave span:nth-child(1) {
  height: 10px;
}

.thinking-wave span:nth-child(2) {
  height: 18px;
  animation-delay: 0.12s;
}

.thinking-wave span:nth-child(3) {
  height: 14px;
  animation-delay: 0.24s;
}

.thinking-lines {
  display: grid;
  gap: 9px;
}

.thinking-lines span {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(206, 186, 149, 0.24), rgba(255, 255, 255, 0.9), rgba(206, 186, 149, 0.24));
  background-size: 220% 100%;
  animation: shimmerTrack 1.8s linear infinite;
}

.thinking-lines span:nth-child(1) {
  width: min(100%, 320px);
}

.thinking-lines span:nth-child(2) {
  width: min(86%, 280px);
  animation-delay: 0.18s;
}

.thinking-lines span:nth-child(3) {
  width: min(72%, 220px);
  animation-delay: 0.34s;
}

.thinking-copy {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.7;
}

@keyframes avatarPulse {
  0%, 100% {
    opacity: 0.64;
  }
  50% {
    opacity: 1;
  }
}

@keyframes thinkingBars {
  0%, 100% {
    transform: scaleY(0.68);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.16);
    opacity: 1;
  }
}

@keyframes shimmerTrack {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thinking-avatar::after,
  .thinking-wave span,
  .thinking-lines span {
    animation: none !important;
  }
}

@media (max-width: 720px) {
  .thinking-card {
    gap: 10px;
  }

  .thinking-head {
    gap: 6px 10px;
  }

  .thinking-head strong {
    font-size: 14px;
  }
}

.message-stack {
  gap: 10px;
  padding-bottom: 10px;
}

.message-row {
  gap: 12px;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  box-shadow: 0 12px 22px rgba(23, 39, 35, 0.08);
}

.message-card {
  width: min(100%, 980px);
  border-radius: 20px;
  padding: 14px 16px;
}

.user-card {
  max-width: min(76%, 720px);
  background: linear-gradient(145deg, #1e6a61 0%, #174d46 100%);
  box-shadow: 0 18px 30px rgba(23, 72, 65, 0.16);
}

.assistant-card {
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(247, 241, 233, 0.9));
  border-color: rgba(65, 88, 80, 0.1);
  box-shadow: 0 18px 32px rgba(27, 42, 37, 0.07);
}

.message-body,
.plain-answer {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.72;
}

.message-time {
  margin-top: 8px;
  font-size: 11px;
}

.guidance-alert {
  margin-top: 0;
}

.guidance-alert :deep(.el-alert__content) {
  line-height: 1.6;
}

.summary-grid {
  gap: 8px;
  margin-top: 10px;
}

.summary-card {
  padding: 12px 14px;
  border-radius: 16px;
}

.summary-card strong {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.content-section {
  margin-top: 14px;
}

.section-head {
  margin-bottom: 10px;
}

.section-head h3 {
  font-size: 14px;
  font-weight: 700;
}

.step-list {
  gap: 10px;
}

.step-card,
.knowledge-card {
  padding: 14px;
  border-radius: 16px;
}

.step-head strong,
.knowledge-head strong {
  font-size: 14px;
  line-height: 1.45;
}

.step-card p,
.knowledge-card p,
.knowledge-body {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
}

.knowledge-link-btn,
.knowledge-drill-btn {
  min-height: 34px;
  padding: 7px 12px;
  font-size: 12px;
}

.knowledge-link-btn:hover,
.knowledge-drill-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(31, 98, 89, 0.12);
}

@media (max-width: 720px) {
  .message-stack {
    gap: 8px;
  }

  .message-row {
    gap: 10px;
  }

  .assistant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  .message-card {
    width: 100%;
    border-radius: 18px;
    padding: 13px 14px;
  }

  .user-card {
    max-width: calc(100% - 6px);
  }

  .message-body,
  .plain-answer {
    font-size: 13px;
    line-height: 1.68;
  }

  .summary-card,
  .step-card,
  .knowledge-card {
    padding: 12px;
  }
}
</style>
