<template>
  <div class="page dashboard-container">
    <!-- 移除原top-header -->
    
    <div class="main-body">
      <!-- 左侧折叠式导航栏 -->
      <aside class="sidebar-tabs">
        <div class="tab-buttons">
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'faq' }"
            @click.stop="toggleTab('faq')"
          >
            <el-icon><QuestionFilled /></el-icon>
            <span class="tab-label">常见问题</span>
          </div>
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'error' }"
            @click.stop="toggleTab('error')"
          >
            <el-icon><Warning /></el-icon>
            <span class="tab-label">故障代码</span>
          </div>
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'history' }"
            @click.stop="toggleTab('history')"
          >
            <el-icon><Clock /></el-icon>
            <span class="tab-label">历史问题</span>
          </div>
        </div>

        <!-- 弹出面板 -->
        <transition name="slide">
          <div
            v-if="activeTab"
            class="tab-panel"
            @click.stop
          >
            <!-- 右侧全高关闭把手 -->
            <div
              class="panel-close-bar"
              @click="activeTab = null"
            >
              <div class="bar-bg" />
              <div class="modern-arrow" />
            </div>

            <div class="panel-header">
              <span>{{ panelTitle }}</span>
            </div>
            
            <div class="panel-content">
              <!-- 常见问题 -->
              <div
                v-if="activeTab === 'faq'"
                class="faq-list"
              >
                <div 
                  v-for="(faq, index) in deviceFaqs" 
                  :key="index" 
                  class="list-item" 
                  @click="handleFaqClick(faq)"
                >
                  <span>{{ faq }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <!-- 故障代码 -->
              <div
                v-if="activeTab === 'error'"
                class="error-list"
              >
                <div 
                  v-for="(error, index) in errorCodes" 
                  :key="index" 
                  class="list-item error-item"
                  @click="handleErrorClick(error)"
                >
                  <div class="error-code">
                    {{ error.code }}
                  </div>
                  <div class="error-desc">
                    {{ error.description }}
                  </div>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <!-- 历史问题 -->
              <div
                v-if="activeTab === 'history'"
                class="history-list"
              >
                <div 
                  v-for="(historyItem, hidx) in chatHistory"
                  :key="hidx"
                  class="list-item"
                  @click="handleHistoryClick(historyItem.query)"
                >
                  <span>{{ historyItem.query }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </transition>
        <!-- 遮罩层 -->
        <transition name="fade">
          <div 
            v-if="activeTab" 
            class="panel-overlay" 
            @click.stop="activeTab = null"
          />
        </transition>
      </aside>


      <main class="chat-layout">
        <!-- 设备状态区域 -->
        <div
          class="device-status-bar"
          :class="{ expanded: deviceStatusExpanded }"
        >
          <div
            class="status-compact"
            @click="deviceStatusExpanded = !deviceStatusExpanded"
          >
            <div class="compact-left">
              <el-select 
                v-model="currentDevice" 
                placeholder="选择设备" 
                size="small"
                class="device-selector"
                @change="handleDeviceChange"
                @click.stop
              >
                <el-option
                  label="拉丝机101"
                  value="deviceA"
                />
                <el-option
                  label="拉丝机102"
                  value="deviceB"
                />
              </el-select>
              
              <div class="status-indicator">
                <span
                  class="status-dot"
                  :class="deviceStatus"
                />
                <span class="status-text">{{ deviceStatusText }}</span>
              </div>
            </div>

            <el-icon
              class="expand-icon"
              :class="{ rotated: deviceStatusExpanded }"
            >
              <ArrowDown />
            </el-icon>
          </div>

          <!-- 展开内容 -->
          <transition name="expand">
            <div
              v-if="deviceStatusExpanded"
              class="status-expanded"
            >
              <div class="status-grid">
                <div class="status-item">
                  <el-icon><Odometer /></el-icon>
                  <span>开机率: 95%</span>
                </div>
                <div class="status-item">
                  <el-icon><Clock /></el-icon>
                  <span>运行: 120h</span>
                </div>
                <div class="status-item">
                  <el-icon><Tools /></el-icon>
                  <span>维护: 正常</span>
                </div>
              </div>

              <div class="fault-info">
                <div
                  v-if="hasFault"
                  class="fault-alert"
                >
                  <el-alert
                    type="warning"
                    :closable="false"
                  >
                    <template #title>
                      <div class="fault-title">
                        ⚠️ 检测到故障
                      </div>
                    </template>
                    <div class="fault-details">
                      <div
                        v-for="(fault, idx) in faultList"
                        :key="idx"
                        class="fault-item"
                      >
                        <span class="fault-code">{{ fault.code }}</span>
                        <span class="fault-desc">{{ fault.description }}</span>
                      </div>
                    </div>
                  </el-alert>
                </div>
                <div
                  v-else
                  class="no-fault"
                >
                  <el-icon
                    color="#67c23a"
                    size="20"
                  >
                    <CircleCheck />
                  </el-icon>
                  <span>运行正常</span>
                </div>
              </div>

              <el-button
                type="text"
                size="small"
                @click.stop="clearAll"
              >
                <el-icon><Delete /></el-icon>
                清空对话
              </el-button>
            </div>
          </transition>
        </div>

        <!-- 聊天消息区域 -->
        <div
          ref="scrollContainer"
          class="chat-messages-container"
        >
          <div class="messages-wrapper">
            <template
              v-for="(msg, idx) in messages"
              :key="idx"
            >
              <div
                v-if="msg.role==='user'"
                class="bubble user"
              >
                <div class="bubble-content">
                  {{ msg.text }}
                  <el-tag
                    v-if="msg.feedbackType"
                    :type="msg.feedbackType === 'SUCCESS' ? 'success' : 'warning'"
                    size="small"
                    class="ml-2"
                  >
                    {{ msg.feedbackType === 'SUCCESS' ? '✓ 是' : '✗ 否' }}
                  </el-tag>
                </div>
                <div class="meta">
                  {{ formatTime(msg.time) }}
                </div>
              </div>

              <div
                v-else
                class="bubble assistant"
              >
                <div class="assistant-avatar">
                  <img src="/expert.png">
                </div>
                
                <div class="assistant-content-box">
                  <div class="assistant-head">
                    <div
                      v-if="msg.query_intent"
                      class="mb-2"
                    >
                      <el-tag
                        type="info"
                        effect="plain"
                        size="small"
                      >
                        意图：{{ msg.query_intent }}
                      </el-tag>
                    </div>
                    <div
                      v-if="msg.guidance"
                      class="guidance mb-2"
                    >
                      <el-alert
                        :title="msg.guidance"
                        type="info"
                        show-icon
                        :closable="false"
                      />
                    </div>
                  </div>

                  <div
                    v-if="msg.solution"
                    class="solution"
                  >
                    <div class="diagnosis-summary-minimal">
                      <span class="summary-item">问题概述：{{ msg.solution.problem_summary }}</span>
                      <span class="summary-divider">|</span>
                      <span class="summary-item">初步诊断：{{ msg.solution.quick_diagnosis }}</span>
                    </div>
                    <h4>📋 当前排查步骤</h4>
                    <div
                      v-if="msg.solution.troubleshooting_steps?.length"
                      class="flow-steps"
                    >
                      <div
                        v-for="(step, sidx) in msg.solution.troubleshooting_steps"
                        :key="sidx"
                        class="flow-step"
                      >
                        <div class="step-header">
                          <el-tag
                            :type="tagTypeByCategory(step.category)"
                            size="small"
                          >
                            {{ step.category }}
                          </el-tag>
                          <strong class="ml-2">{{ step.title }}</strong>
                        </div>
                        <div class="step-body">
                          <div class="instruction-card">
                            <div class="instruction-icon">
                              <el-icon><InfoFilled /></el-icon><span>操作指南</span>
                            </div>
                            <p class="desc main-instruction">
                              {{ step.description }}
                            </p>
                          </div>
                          <p class="expected">
                            <strong>预期结果：</strong>{{ step.expected_result }}
                          </p>
                          <div
                            v-if="step.images?.length"
                            class="step-images"
                          >
                            <div 
                              v-for="(url, iidx) in step.images" 
                              :key="iidx" 
                              class="image-wrapper"
                            >
                              <template v-if="isVideo(url)">
                                <video 
                                  :src="url" 
                                  controls 
                                  class="step-media-item step-video" 
                                  preload="metadata"
                                  @click.stop
                                >
                                  您的浏览器不支持视频播放。
                                </video>
                              </template>
                                
                              <template v-else>
                                <el-image
                                  :src="url"
                                  fit="cover"
                                  class="step-media-item step-img-thumb"
                                  :preview-src-list="step.images.filter(u => !isVideo(u))" 
                                  :initial-index="getUiImageIndex(step.images, url)"
                                  :preview-teleported="true"
                                  loading="lazy"
                                >
                                  <template #placeholder>
                                    <div class="image-slot">
                                      加载中...
                                    </div>
                                  </template>
                                </el-image>
                              </template>
                            </div>
                          </div>
                          
                          <div
                            v-if="step.safety_notes?.length"
                            class="safety-notes"
                          >
                            <el-alert
                              type="warning"
                              :closable="false"
                            >
                              <template #title>
                                <div>⚠️ 安全提示</div>
                                <ul>
                                  <li
                                    v-for="(note, nidx) in step.safety_notes"
                                    :key="nidx"
                                  >
                                    {{ note }}
                                  </li>
                                </ul>
                              </template>
                            </el-alert>
                          </div>

                          <div class="flow-actions">
                            <template v-if="isStandardBinary(step)">
                              <el-card
                                shadow="hover"
                                class="action-card success-card"
                                @click="handleFlowAction(msg.currentFlowId, 'SUCCESS', step.if_success)"
                              >
                                <div class="action-header">
                                  <el-icon
                                    color="#67c23a"
                                    size="20"
                                  >
                                    <CircleCheck />
                                  </el-icon>
                                  <strong>是</strong>
                                </div>
                                <div
                                  class="action-content"
                                  @click="handleContentClick($event)"
                                  v-html="renderLinkText(step.if_success)"
                                />
                                <el-button
                                  type="success"
                                  size="small"
                                  class="mt-2"
                                  @click.stop="handleFlowAction(msg.currentFlowId, 'SUCCESS', step.if_success)"
                                >
                                  点击继续 →
                                </el-button>
                              </el-card>
                              <el-card
                                shadow="hover"
                                class="action-card failed-card mt-2"
                                @click="handleFlowAction(msg.currentFlowId, 'FAILED', step.if_failed)"
                              >
                                <div class="action-header">
                                  <el-icon
                                    color="#f56c6c"
                                    size="20"
                                  >
                                    <CircleClose />
                                  </el-icon>
                                  <strong>否</strong>
                                </div>
                                <div
                                  class="action-content"
                                  @click="handleContentClick($event)"
                                  v-html="renderLinkText(step.if_failed)"
                                />
                                <el-button
                                  type="danger"
                                  size="small"
                                  class="mt-2"
                                  @click.stop="handleFlowAction(msg.currentFlowId, 'FAILED', step.if_failed)"
                                >
                                  点击继续 →
                                </el-button>
                              </el-card>
                            </template>

                            <template v-else-if="isLinearStep(step)">
                              <el-card
                                shadow="hover"
                                class="action-card next-step-card"
                                style="border-left: 5px solid #409EFF;"
                                @click="handleFlowAction(msg.currentFlowId, 'NEXT', step.if_next_step)"
                              >
                                <div class="action-header">
                                  <el-icon
                                    color="#409EFF"
                                    size="20"
                                  >
                                    <Right />
                                  </el-icon>
                                  <strong>下一步操作</strong>
                                </div>
                                <div
                                  class="action-content"
                                  @click="handleContentClick($event)"
                                  v-html="renderLinkText(step.if_next_step)"
                                />
                                <div
                                  v-if="extractLinks(step.if_next_step).length"
                                  class="action-links"
                                >
                                  <el-tag
                                    v-for="(link, lidx) in extractLinks(step.if_next_step)"
                                    :key="lidx"
                                    size="small"
                                    effect="plain"
                                  >
                                    {{ link }}
                                  </el-tag>
                                </div>
                                <el-button
                                  type="primary"
                                  size="small"
                                  class="mt-2"
                                  @click.stop="handleFlowAction(msg.currentFlowId, 'NEXT', step.if_next_step)"
                                >
                                  执行并继续 →
                                </el-button>
                              </el-card>
                            </template>

                            <template v-else-if="isBranchTerminal(step)">
                              <el-card
                                shadow="never"
                                class="flow-end-card"
                              >
                                <div class="end-header">
                                  <el-icon
                                    color="#409EFF"
                                    size="22"
                                  >
                                    <CircleCheck />
                                  </el-icon>
                                  <strong>流程已到达终点</strong>
                                </div>
                                <div class="end-content">
                                  <p>✅ 当前诊断流程已完成。</p>
                                  <p>如果问题仍未解决，请联系管理员或运维人员以获得人工支持。</p>
                                  <p
                                    v-if="terminalBranchText(step)"
                                    class="muted"
                                  >
                                    <small>{{ terminalBranchText(step) }}</small>
                                  </p>
                                </div>
                                <div class="end-actions">
                                  <el-button
                                    type="primary"
                                    size="small"
                                    @click="contactAdmin"
                                  >
                                    联系管理员
                                  </el-button>
                                  <el-button
                                    size="small"
                                    @click="copyTerminalText(step)"
                                  >
                                    复制说明
                                  </el-button>
                                </div>
                              </el-card>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>

                    <el-alert
                      v-if="msg.solution.escalation_info"
                      class="mt-1"
                      type="warning"
                      :title="msg.solution.escalation_info"
                      show-icon
                      :closable="false"
                    />

                    <el-collapse
                      v-if="msg.solution.related_knowledge?.length"
                      class="mt-2 knowledge-collapse"
                    >
                      <el-collapse-item
                        title="📚 相关知识（展开查看）"
                        name="rk"
                      >
                        <div
                          v-for="(rk, ridx) in msg.solution.related_knowledge"
                          :key="ridx"
                          class="rk-item"
                        >
                          <div class="rk-head">
                            <strong>{{ rk.chunk_id }}</strong>
                            <el-tag
                              size="small"
                              effect="plain"
                            >
                              匹配度 {{ (rk.score ?? 0).toFixed(2) }}
                            </el-tag>
                          </div>
                          <div class="rk-content">
                            {{ rk.content }}
                          </div>
                          <img
                            v-if="rk.image_path"
                            :src="rk.image_path"
                            class="rk-image"
                          >
                          <el-divider />
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>

                  <div
                    v-else
                    class="bubble-content-text"
                  >
                    {{ msg.text || '...' }}
                  </div>
                  <div class="meta">
                    {{ formatTime(msg.time) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <MessageInput
            :loading="loading"
            :default-api="api"
            :default-options="options"
            :default-memory-limit="memoryLimit"
            :is-recording="isRecording"
            :voice-enabled="voiceEnabled"
            @send="onSend"
            @clear="clearAll"
            @update:api="(v)=> api = v"
            @update:options="(v)=> options = v"
            @update:memory="(n)=> memoryLimit = n"
            @update:voice-enabled="(v) => handleVoiceToggle(v)"
            @mic-click="handleMicClick"
            @voice-toggle="handleVoiceToggle"
          />
          <div class="footer-note">
            内容由 AI 生成，请以现场实际情况为准。
            <span v-if="voiceEnabled" class="voice-status">
              | 语音模式: {{ isListening ? '监听中' : (isSpeaking ? '播报中' : '就绪') }}
            </span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, nextTick } from 'vue'
import { ElMessage , ElMessageBox} from 'element-plus'
import { ArrowRight, Odometer, Clock, CircleCheck, CircleClose, Right, QuestionFilled, Warning, Tools, Delete, ArrowDown, InfoFilled } from '@element-plus/icons-vue'
import http from '@/api/http'
import MessageInput from '@/components/MessageInput.vue'
import { useVoiceController } from '@/composables/useVoiceController'

const messages = ref([])
const loading = ref(false)
const api = ref('search_flow_solution')
const options = ref({ enableLLM: true, forceContent: 'fault_diagnosis', diversify: true })
const memoryLimit = ref(3)
const scrollContainer = ref(null)

const {
  voiceEnabled,
  isListening,
  isRecording,
  isSpeaking,
  setVoiceEnabled,
  startWakeWordDetection,
  stopWakeWordDetection,
  startRecording,
  stopRecording,
  speakText,
  stopSpeaking,
  parseVoiceCommand
} = useVoiceController()

const lastFlowActionContext = ref(null)

function handleVoiceToggle(enabled) {
  setVoiceEnabled(enabled)
  if (enabled) {
    startWakeWordDetection(() => {
      startRecording((text) => {
        const command = parseVoiceCommand(text)
        if (command && lastFlowActionContext.value) {
          const ctx = lastFlowActionContext.value
          handleFlowAction(ctx.flowId, command, ctx.actionText)
          lastFlowActionContext.value = null
        } else if (text) {
          onSend({ text, api: api.value, options: options.value })
        }
      })
    })
  } else {
    stopWakeWordDetection()
    stopSpeaking()
  }
}

function handleMicClick() {
  if (isRecording.value) {
    stopRecording()
  } else {
    stopSpeaking()
    startRecording((text) => {
      if (text) {
        const command = parseVoiceCommand(text)
        if (command && lastFlowActionContext.value) {
          const ctx = lastFlowActionContext.value
          handleFlowAction(ctx.flowId, command, ctx.actionText)
          lastFlowActionContext.value = null
        } else {
          onSend({ text, api: api.value, options: options.value })
        }
      }
    })
  }
}

async function speakGuidance(msg) {
  if (!voiceEnabled.value || isSpeaking.value) return
  
  const texts = []
  
  if (msg.guidance) {
    texts.push(msg.guidance)
  }
  
  if (msg.solution?.troubleshooting_steps?.length) {
    const step = msg.solution.troubleshooting_steps[0]
    if (step.title) texts.push(`当前步骤：${step.title}`)
    if (step.description) texts.push(`操作指南：${step.description}`)
    if (step.expected_result) texts.push(`预期结果：${step.expected_result}`)
  } else if (msg.text) {
    texts.push(msg.text)
  }
  
  const fullText = texts.join('。')
  
  if (fullText) {
    await speakText(fullText, () => {
      if (msg.solution?.troubleshooting_steps?.length) {
        lastFlowActionContext.value = {
          flowId: msg.currentFlowId,
          step: msg.solution.troubleshooting_steps[0]
        }
      }
    })
  }
}
const currentFlowId = ref(null)
// ----------------------------------------------------------------------------------------------------------
// 左侧标签状态
const activeTab = ref(null)
// 设备状态
const deviceStatusExpanded = ref(false)
const currentDevice = ref('deviceA')
const deviceStatus = ref('online') // online, warning, offline
const hasFault = ref(false)

const deviceFaqs = ref([
    '拉丝机触摸屏报PLC异常',
    '拉丝机出现设备无法启动故障',
    '拉丝机出现成型不良或花纹异常',
    '拉丝机出现拉丝机触摸屏报急停状态',
    '拉丝机触摸屏报警当前轴涨块张开',
    '拉丝机触摸屏报警伺服报警',
    '故障代码 F7011',
    '故障代码 F7016',
    '故障代码 F7800',
    '故障代码 F7801',
]);

const errorCodes = ref([
  { code: 'F7011', description: '电机超温 报警' },
  { code: 'A7910', description: '电机超温 警告' },
  { code: 'F7016', description: '电机内部温度传感器报警' },
  { code: 'F7410', description: '电流环输出受限' },
  { code: 'F7800', description: '未检测到功率单元' },
  { code: 'F7801', description: '电机过电流' },
  { code: 'F7900', description: '电机堵转过载' },
  { code: 'F30001', description: '功率单元过电流' },
  { code: 'F30002', description: '功率单元直流母线过电压' },
  { code: 'F30003', description: '功率单元：直流母线欠压' },
  { code: 'F30005', description: '功率单元：过载' },
  { code: 'F30015', description: '电机动力线缆断相' },
  { code: 'F30036', description: '功率单元内部过热' },
  { code: 'F31885', description: '编码器通讯失败' },
  { code: 'F31875', description: '编码器 1 DRIVE-CLiQ (CU)：电源电压故障' },
  { code: 'F30021', description: '接地故障' },
  { code: '整流器故障', description: '整流器故障' }
])

const faultList = ref([
  { code: 'E001', description: '电源电压不稳定' },
  { code: 'W002', description: '温度接近上限' }
])

const panelTitle = computed(() => {
  const titles = {
    faq: '常见问题',
    error: '故障代码',
    history: '历史问题'
  }
  return titles[activeTab.value] || ''
})

const deviceStatusText = computed(() => {
  const statusMap = {
    online: '在线',
    warning: '异常',
    offline: '离线'
  }
  return statusMap[deviceStatus.value] || '未知'
})
// 方法
const toggleTab = (tab) => {
  activeTab.value = activeTab.value === tab ? null : tab
}
const handleDeviceChange = (val) => {
    // 1. 清空当前对话?
    // 2. 获取新设备的状态
    // 3. 更新 deviceFaqs
    console.log('切换到设备:', val);
};
// --- 新增历史记录状态 ---
const chatHistory = ref([
    { id: 1, query: '拉丝机速度异常故障诊断流程', time: Date.now() },
    { id: 2, query: '电机过热如何处理？', time: Date.now() - 3600000 },
    { id: 3, query: '最新的设备保养手册', time: Date.now() - 7200000 },
])
// --- end 新增历史记录状态 ---

// 辅助函数：当用户发送新消息时，更新历史记录
function updateHistory(query) {
    // 限制历史记录数量，例如只保留最新的 5 条
    if (chatHistory.value.length >= 5) {
        chatHistory.value.pop() // 移除最旧的
    }
    // 添加新的记录
    chatHistory.value.unshift({ 
        id: Date.now(), 
        query: query, 
        time: Date.now() 
    })
}
// ----------------------------------------------------------------------------------------------------------
// 处理常见问题点击
function handleFaqClick(faqText) {
  onSend({
    text: faqText,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// 处理故障代码点击
function handleErrorClick(errorObj) {
  onSend({
    text: `${errorObj.code} ${errorObj.description}`,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// 处理历史记录点击
function handleHistoryClick(queryText) {
  onSend({
    text: queryText,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// ----------------------------------------------------------------------------------------------------------
// 滚动到最新用户消息位置
function scrollToLatestUserMessage() {
  if (!scrollContainer.value) return
  
  // 使用 nextTick 确保消息已渲染
  nextTick(() => {
    const userBubbles = scrollContainer.value.querySelectorAll('.bubble.user')
    if (userBubbles.length > 0) {
      const lastUserBubble = userBubbles[userBubbles.length - 1]
      lastUserBubble.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
// 主请求逻辑
async function onSend({ text, api: whichApi, options: opt }) {
  if (!text?.trim()) return
  messages.value.push({ role: 'user', text, time: Date.now() })
  scrollToLatestUserMessage()

  const endpoint = whichApi === 'search_flow_solution' ? '/search_flow_solution' : '/search'
  const lastN = pickContext(messages.value, memoryLimit.value)

  const params = {
    query_text: text,
    enable_llm_integration: !!opt.enableLLM,
    force_content_type: opt.forceContent || undefined,
    diversify_results: whichApi === 'search' ? !!opt.diversify : undefined,
    context_json: JSON.stringify(lastN)
  }

  loading.value = true
  try {
    const resp = await http.get(endpoint, { params })
    const data = resp.data || {}

    // 更新当前流程 ID
    if (data.current_flow_id) {
      currentFlowId.value = data.current_flow_id
    }

    if (data.progressive_solution) {
      const ps = data.progressive_solution
      console.log('🟢 收到 progressive_solution：', ps)
      console.log('🟢 current_flow_id:', data.current_flow_id)
      // 🧩 针对 image_path / images 做类型安全修正
      try {
          // 1. 顶层 images 可能是字符串而不是数组
          if (typeof ps.images === 'string') {
            ps.images = [ps.images]
          }

          // 2. related_knowledge 里的 image_path
          if (Array.isArray(ps.related_knowledge)) {
          ps.related_knowledge = ps.related_knowledge.map(item => {
              if (typeof item.image_path === 'string') {
              // 如果是字符串化 JSON，例如 '["url"]'
                if (item.image_path.startsWith('[')) {
                  try {
                    const parsed = JSON.parse(item.image_path)
                    item.image_path = Array.isArray(parsed) ? parsed[0] : parsed
                  } catch { /* 忽略错误，保持原样 */ }
                }
              }
              return item
            })
          }

          // 3. troubleshooting_steps 里的 images
          if (Array.isArray(ps.troubleshooting_steps)) {
          ps.troubleshooting_steps = ps.troubleshooting_steps.map(step => {
            if (typeof step.images === 'string') {
                if (step.images.startsWith('[')) {
                  try {
                    step.images = JSON.parse(step.images)
                  } catch {
                    step.images = [step.images]
                  }
                } else {
                  step.images = [step.images]
                }
              }
              return step
            })
          }
      } catch (err) {
          console.warn('🟠 progressive_solution 图片字段清理失败：', err)
      }

      // ✅ 推入消息
      const newMsg = {
          role: 'assistant',
          time: Date.now(),
          guidance: data.guidance || '',
          query_intent: data.query_intent || '',
          solution: ps,
          currentFlowId: data.current_flow_id
      }
      messages.value.push(newMsg)
      speakGuidance(newMsg)
    }
    else {
      const newMsg = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        text: data.answer || data.message || '（无可展示内容）'
      }
      messages.value.push(newMsg)
      speakGuidance(newMsg)
    }
    updateHistory(text);
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败，请检查后端服务或控制台日志')
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: '❌ 请求失败，请稍后重试。'
    })
  } finally {
    loading.value = false
  }
}

// 处理流程分支点击
async function handleFlowAction(flowId, feedbackType, actionText) {
  console.log('🔍 handleFlowAction 被调用', { flowId, feedbackType, actionText, loading: loading.value })
  if (loading.value) {
    console.log('⚠️ 正在加载中，忽略点击')
    return
  }
    const queryText = extractMainText(actionText)
    console.log('👉 处理流程分支点击：', { flowId, feedbackType, actionText, queryText })
  // 若该 actionText 标注为终点，则不再调用后端推进，直接展示终点提示
  if ((actionText || '').trim().startsWith('[流程终点]')) {
    // 把用户的点击也记录为用户消息（可选）
    const terminalText = actionText.replace(/^\[流程终点\]\s*/i, '').trim()
    messages.value.push({
      role: 'user',
      text: terminalText || '（查看终点说明）',
      feedbackType,
      time: Date.now()
    })
    scrollToLatestUserMessage()

    // 显示助手端终点消息（可用 create_flow_progression_solution 中的 quick_diagnosis 文本替代）
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: terminalBranchText({ if_failed: actionText, if_success: actionText }) || '流程已到达终点。如问题仍未解决，请联系管理员。'
    })
    // 弹出联系管理员提示（可选）
    contactAdmin()
    return
  }
  
  // 添加用户反馈消息
  messages.value.push({ 
    role: 'user', 
    text: queryText,
    feedbackType: feedbackType,
    time: Date.now() 
  })
  scrollToLatestUserMessage()

  const params = {
    query_text: queryText,
    enable_llm_integration: true,
    current_flow_id: flowId,
    feedback_type: feedbackType
  }

  loading.value = true
  try {
    const resp = await http.get('/search_flow_solution', { params })
    const data = resp.data || {}

    // 更新当前流程 ID
    if (data.current_flow_id) {
      currentFlowId.value = data.current_flow_id
    }

    if (data.progressive_solution) {
      const newMsg = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        solution: data.progressive_solution,
        currentFlowId: data.current_flow_id
      }
      messages.value.push(newMsg)
      speakGuidance(newMsg)
    } else {
      const newMsg = {
        role: 'assistant',
        time: Date.now(),
        text: data.answer || data.message || '流程已完成或无后续步骤。'
      }
      messages.value.push(newMsg)
      speakGuidance(newMsg)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败，请检查后端服务或控制台日志')
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: '❌ 请求失败，请稍后重试。'
    })
  } finally {
    loading.value = false
  }
}

// 辅助：判断文本是否标记为流程终点
function isEndpointText(text) {
  return (text || '').trim().startsWith('[流程终点]')
}

// 逻辑 A：是否是标准的二叉分支（成功/失败同时存在，且都不是终点）
// 优先级最高：如果满足此条件，忽略 if_next_step，避免混淆
function isStandardBinary(step) {
  if (!step) return false
  return step.if_success && step.if_failed && 
         !isEndpointText(step.if_success) && 
         !isEndpointText(step.if_failed)
}

// 逻辑 B：是否是线性下一步（存在 if_next_step 且不是终点）
// 优先级次之：如果不是二叉分支，但有下一步，则渲染下一步
function isLinearStep(step) {
  if (!step) return false
  // 如果 next_step 存在且没有标记为终点，则认为是线性步骤
  return step.if_next_step && !isEndpointText(step.if_next_step)
}

// 逻辑 C：是否是流程终点（修改原有的 isBranchTerminal）
// 优先级最低：如果既不是二叉，也不是线性下一步，检查是否有终点标记
function isBranchTerminal(step) {
  if (!step) return false
  
  // 1. 如果存在有效的线性下一步，绝对不是终点（这是本次需求的核心修正）
  if (isLinearStep(step)) return false

  // 2. 检查各个字段是否包含终点标记
  const candidates = [step.if_success, step.if_failed, step.if_next_step]
  return candidates.some(text => isEndpointText(text))
}

// 清空对话
function clearAll() {
  messages.value = []
  currentFlowId.value = null
  lastFlowActionContext.value = null
  stopSpeaking()
}

// 提取上下文
function pickContext(all, n) {
  const recent = all.slice(-n)
  return recent.map((m) => {
    if (m.role === 'user') return { role: 'user', content: m.text }
    if (m.solution?.troubleshooting_steps?.length) {
      const titles = m.solution.troubleshooting_steps.map(s => s.title).join('；')
      return { role: 'assistant', content: `【摘要】${m.solution.quick_diagnosis}；【步骤】${titles}` }
    }
    return { role: 'assistant', content: m.text || m.guidance || '' }
  })
}
// 获取当前图片在纯图片数组中的索引，确保放大时显示正确的那一张
function getUiImageIndex(allImages, currentUrl) {
  const imagesOnly = allImages.filter(u => !isVideo(u));
  return imagesOnly.indexOf(currentUrl);
}

// 从文本中提取主要内容（去除 <link> 标签）
function extractMainText(text) {
  console.log('🔍 extractMainText 输入:', text)
  // 调试
  if (typeof text !== 'string') console.warn('⚠️ extractMainText 收到非字符串文本:', text)
  // 🧩 类型安全保护：确保是字符串
  if (typeof text !== 'string') {
    if (text === null || text === undefined) {
      console.warn('⚠️ extractMainText 收到 null/undefined，返回空字符串')
      return ''
    }
    try {
      // 如果是对象或数组，尝试转为字符串
      text = String(text)
    } catch {
      console.error('❌ extractMainText 无法转换为字符串')
      return ''
    }
  }

  // 去掉 <link> 标签
  let t = text.replace(/<link>.*?<\/link>/g, '').trim()

  // 去掉 [流程终点] 标识
  t = t.replace(/^\[流程终点\]\s*/i, '').trim()
  
  console.log('🔍 extractMainText 输出:', t)

  return t
}


// 从文本中提取链接标签
function extractLinks(text) {
  if (!text) return []
  const matches = text.match(/<link>(.*?)<\/link>/g)
  if (!matches) return []
  return matches.map(m => m.replace(/<\/?link>/g, ''))
}

function tagTypeByCategory(category) {
  const c = (category || '').toLowerCase()
  if (c === 'flow_start') return 'primary'
  if (c === 'flow_continue') return 'success'
  if (c === 'flow_end') return 'info'
  return 'warning'
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// // 判断某个步骤的分支（if_success 或 if_failed）中是否包含流程终点标识
// function isBranchTerminal(step) {
//   if (!step) return false
//   const s1 = (step.if_success || '').trim()
//   const s2 = (step.if_failed || '').trim()
//   // 以 "[流程终点]" 开头（忽略前后空格）就认为是终点分支
//   return (s1 && s1.startsWith('[流程终点]')) || (s2 && s2.startsWith('[流程终点]'))
// }

// 返回终点分支的纯文本（去掉标识），优先取 if_failed then if_success
// 修改：获取终点文本（增加对 if_next_step 的支持）
function terminalBranchText(step) {
  if (!step) return ''
  // 按优先级检查
  const candidates = [step.if_next_step, step.if_failed, step.if_success].filter(Boolean)
  for (const t of candidates) {
    if (isEndpointText(t)) {
      return t.replace(/^\[流程终点\]\s*/i, '').trim()
    }
  }
  return ''
}

// 复制终点说明到剪贴板
async function copyTerminalText(step) {
  const text = terminalBranchText(step)
  if (!text) {
    ElMessage.warning('无可复制的终点说明')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制终点说明到剪贴板')
  } catch {
    ElMessage.warning('复制失败，请手动选择并复制')
  }
}

// 联系管理员（可定制：跳转至帮助页或弹窗展示联系方式）
function contactAdmin() {
  // 若你有路由帮助页，替换为 router.push('/help') 更友好
  ElMessageBox.alert(
    '请联系系统管理员或运维人员以获得人工支持。\n\n联系方式：运维邮箱 ops@example.com；电话：+86-10-1234-5678',
    '联系管理员',
    { confirmButtonText: '知道了', type: 'info' }
  )
}
// --- 新增函数：处理内容区点击事件 ---
function handleContentClick(event) {
  // 1. 尝试找到被点击元素中，带有 .clickable-link-tag 类的最近祖先（包含自身）
  const target = event.target.closest('.clickable-link-tag')
  
  // 2. 如果找到了，说明用户点击的是链接
  if (target) {
    // 阻止事件冒泡：这会阻止点击事件传播到 el-card 或其他父级组件
    event.stopPropagation() 
    event.preventDefault()

    // 从 data-query 属性中拿到查询文本
    const queryText = target.dataset.query
    if (queryText) {
      handleLinkClick(queryText)
    }
  }
  // 3. 如果没找到，说明用户点的是普通文本，什么都不做，事件自然冒泡
}
// --- 新增函数：处理点击 link 元素 ---
function handleLinkClick(text) {
    if (!text?.trim()) return
    
    // 注意：这里的 currentConfig 是正确的，它就是要发起的新查询
    const currentConfig = {
        text: text,
        api: api.value, // 使用当前的 API 配置
        options: options.value 
    }
    
    ElMessageBox.confirm(
        `确定以「${text}」为查询内容进行新的诊断吗？`,
        '发起新查询',
        {
            confirmButtonText: '确定查询',
            cancelButtonText: '取消',
            type: 'info',
        }
    ).then(() => {
        // 确认后，执行查询
        console.log(`🔗 发起链接查询: ${text}`)
        // 确保传递正确的对象
        onSend(currentConfig) 
    }).catch(() => {
        // 用户取消
    })
}
/**
 * 渲染包含 <link> 标签的 HTML 文本。
 * 将 <link> 标签内容转换为带有点击事件的 <span> 元素。
 * @param {string} text - 待处理的字符串。
 * @param {function} clickHandler - 触发点击时调用的函数。
 * @returns {string} 渲染后的 HTML 字符串。
 */
function renderLinkText(text) {
  if (typeof text !== 'string') return ''
  
  const linkRegex = /<link>(.*?)<\/link>/g
  
  // 生成带有 data-query 属性的 span
  let result = text.replace(linkRegex, (match, linkContent) => {
    // 对内容做一下转义，防止 data 属性被双引号截断
    const safeContent = linkContent.replace(/"/g, '&quot;')
    
    return `<span 
              class="clickable-link-tag" 
              data-query="${safeContent}"
            >${linkContent}</span>`
  })

  // 清理终点标识
  result = result.replace(/^\[流程终点\]\s*/i, '').trim()
  return result
}

function isVideo(url) {
    if (!url) return false
    // 简单地检查 URL 是否以 .mp4 结尾（不区分大小写）
    return url.toLowerCase().endsWith('.mp4')
}
</script>


<style scoped>
/* 全局样式 */
.dashboard-container {
  height: calc(100vh - 62px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  overflow: hidden;
}

.main-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ========== 左侧标签栏 ========== */
.sidebar-tabs {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  z-index: 2000;
  pointer-events: none;
}

.tab-buttons {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: auto;
  z-index: 2001;
  padding: 20px 0;
}

.tab-btn {
  width: 60px;
  height: 72px;
  background: linear-gradient(145deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%);
  border-radius: 0 16px 16px 0;
  box-shadow: 
    3px 3px 15px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 22px;
  gap: 8px;
  color: white;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  border-radius: 0 16px 0 0;
}

.tab-btn:hover::before {
  opacity: 1;
}

.tab-btn:hover {
  width: 72px;
  transform: translateX(4px);
  box-shadow: 
    5px 5px 20px rgba(102, 126, 234, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  width: 72px;
  background: linear-gradient(145deg, #409EFF 0%, #5B8FF9 50%, #6BA8FF 100%);
  box-shadow: 
    5px 5px 20px rgba(64, 158, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
}

.tab-label {
  font-size: 12px;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tab-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 340px;
  max-width: 85vw;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 
    4px 0 30px rgba(0,0,0,0.15),
    -1px 0 0 rgba(255,255,255,0.5);
  z-index: 2002;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.panel-header {
  padding: 24px;
  border-bottom: 2px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(0, 0, 0, 0.05);
}

.close-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  transform: rotate(90deg) scale(1.1);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.list-item {
  padding: 16px 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #409EFF 0%, #6BA8FF 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.list-item:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  transform: translateX(8px) scale(1.02);
  border-color: #91d5ff;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.2),
    0 8px 24px rgba(64, 158, 255, 0.1);
}

.list-item:hover::before {
  opacity: 1;
}

.faq-list .list-item,
.history-list .list-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-list .list-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.error-code {
  font-weight: 700;
  color: #f56c6c;
  font-size: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.error-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 遮罩层基础样式 */
/* 遮罩层：修正点击失效的关键 */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%);
  backdrop-filter: blur(4px);
  
  /* 核心修复点 1：必须手动恢复点击权限 */
  pointer-events: auto; 
  
  /* 核心修复点 2：层级确保在面板之下，在主页面之上 */
  z-index: -1; /* 相对于 .sidebar-tabs 的内部层级 */
}

/* 遮罩层淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

/* 面板动画 */
.slide-enter-active {
  animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  animation: slideOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* ========== 聊天主体 ========== */
.chat-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

/* ========== 设备状态栏 ========== */
.device-status-bar {
  border-bottom: 1px solid rgba(228, 231, 237, 0.6);
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.status-compact {
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.status-compact:hover {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8ecf1 100%);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.compact-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.device-selector {
  max-width: 160px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot.online {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  box-shadow: 
    0 0 12px rgba(103, 194, 58, 0.6),
    0 0 24px rgba(103, 194, 58, 0.3);
}

.status-dot.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
  box-shadow: 
    0 0 12px rgba(230, 162, 60, 0.6),
    0 0 24px rgba(230, 162, 60, 0.3);
}

.status-dot.offline {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.status-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.expand-icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.status-expanded {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.fault-info {
  margin-top: 16px;
}

.fault-alert {
  margin-bottom: 16px;
}

.fault-title {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 15px;
  color: #303133;
}

.fault-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fault-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.fault-code {
  font-weight: 700;
  color: #f56c6c;
  font-size: 14px;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  padding: 4px 10px;
  border-radius: 6px;
}

.fault-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.no-fault {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  color: #67c23a;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-to, .expand-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* ========== 聊天消息 ========== */
.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef1f6 100%);
}

.messages-wrapper {
  max-width: 920px;
  margin: 0 auto;
}

.bubble {
  margin-bottom: 20px;
  animation: fadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

.bubble.user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.bubble.user .bubble-content {
  background: linear-gradient(135deg, #409EFF 0%, #5B8FF9 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 16px 16px 4px 16px;
  max-width: 80%;
  word-break: break-word;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.3),
    0 2px 8px rgba(64, 158, 255, 0.2);
  font-weight: 500;
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

.bubble.user .bubble-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
  border-radius: 16px 16px 0 0;
}

.bubble.assistant {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.assistant-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.08);
  border: 2px solid white;
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assistant-content-box {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 18px 20px;
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.assistant-content-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF 0%, #6BA8FF 50%, #8CB9FF 100%);
}

.assistant-head {
  margin-bottom: 16px;
}

.guidance {
  margin-bottom: 16px;
}

.solution h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
}

.solution h4 {
  font-size: 15px;
  color: #606266;
  margin: 18px 0 14px;
  font-weight: 600;
}

.solution p {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #606266;
}

.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flow-step {
  border: 1px solid rgba(228, 231, 237, 0.6);
  border-radius: 14px;
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flow-step:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 2px solid rgba(228, 231, 237, 0.4);
}

.step-body {
  color: #606266;
}

.step-body .desc {
  margin-bottom: 10px;
  line-height: 1.7;
  font-size: 16px;
  font-weight: 500;
}

.step-body .expected {
  margin-bottom: 14px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
  border-left: 4px solid #409EFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  font-weight: 500;
  line-height: 1.6;
}

.safety-notes {
  margin: 14px 0;
}

.safety-notes ul {
  margin: 10px 0 0 0;
  padding-left: 24px;
}

.safety-notes li {
  margin-bottom: 6px;
  line-height: 1.6;
}

.flow-actions {
  margin-top: 20px;
}

.action-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
}

.action-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-card:active {
  transform: translateY(-2px) scale(1.01);
}

.success-card {
  border-left: 5px solid #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.success-card:hover {
  box-shadow: 
    0 8px 24px rgba(103, 194, 58, 0.2),
    0 4px 12px rgba(103, 194, 58, 0.1);
}

.failed-card {
  border-left: 5px solid #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.failed-card:hover {
  box-shadow: 
    0 8px 24px rgba(245, 108, 108, 0.2),
    0 4px 12px rgba(245, 108, 108, 0.1);
}

.next-step-card {
  border-left: 5px solid #409EFF;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
}

.next-step-card:hover {
  box-shadow: 
    0 8px 24px rgba(64, 158, 255, 0.2),
    0 4px 12px rgba(64, 158, 255, 0.1);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 15px;
}

.action-content {
  color: #606266;
  line-height: 1.7;
  margin-bottom: 10px;
  font-size: 14px;
}

.action-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.flow-end-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border: 2px solid #b3d8ff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.end-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-weight: 700;
  font-size: 17px;
}

.end-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.end-content .muted {
  color: #909399;
}

.end-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
}

.knowledge-collapse {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.rk-item {
  margin-bottom: 12px;
}

.rk-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rk-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.rk-image {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.bubble-content-text {
  color: #303133;
  line-height: 1.6;
}

.meta {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }

/* ========== 图片和视频样式 ========== */
.step-images {
  display: grid;
  gap: 14px;
  margin: 14px 0;
}

.image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.image-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.1);
}

.image-wrapper:hover::before {
  opacity: 1;
}

.step-media-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.step-img-thumb {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.step-img-thumb:hover {
  transform: scale(1.05);
}

.step-video {
  border-radius: 12px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  font-weight: 500;
}

/* ========== 输入区域 ========== */
.chat-input-area {
  border-top: 1px solid rgba(228, 231, 237, 0.6);
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 16px 20px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.footer-note {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  font-weight: 500;
  opacity: 0.8;
}

.footer-note .voice-status {
  color: #67c23a;
  font-weight: 600;
}
/* 容器：悬浮在面板右侧边缘 */


/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  pointer-events: none; /* 让鼠标事件穿透空白区域 */
}

/* 左侧工具条：始终可见，极窄设计 */
.left-toolbar {
  width: 60px; /* 极度压缩宽度 */
  height: 100%;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 上下分离 */
  padding: 16px 8px;
  box-sizing: border-box;
  pointer-events: auto; /* 恢复点击 */
  z-index: 2002;
}

.tab-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮通用样式 */
.toolbar-btn {
  width: 100%;
  aspect-ratio: 1; /* 正方形 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  background: #f5f7fa;
}

.toolbar-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}

.toolbar-btn.active {
  background: #409eff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.toolbar-btn .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.btn-label {
  font-size: 10px;
  transform: scale(0.9); /* 视觉上更小 */
}

/* 底部收起按钮组 */
.close-group {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.close-btn {
  background: #fff;
  border: 1px solid #ebeef5;
  color: #909399;
}

.close-btn:hover {
  background: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

/* 内容面板：紧贴工具条右侧 */
/* 内容面板 */
.content-panel {
  position: relative; /* 必须为相对定位，方便把手定位 */
  width: 320px;
  height: 100%;
  background: #fff;
  box-shadow: 4px 0 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 2001;
  border-left: 1px solid #f0f0f0;
  /* 预留出右侧把手的点击感应区（可选） */
  margin-right: 20px; 
}
}

/* 装饰性背景：使用柔和渐变 */
.bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 242, 245, 0.4) 100%
  );
  backdrop-filter: blur(8px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  z-index: -1;
  transition: all 0.3s;
}
/* 箭头包装器 */
.arrow-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 2;
  transition: transform 0.3s ease;
}
/* “收起”文字：纵向排列，极简感 */
.close-text {
  writing-mode: vertical-lr;
  font-size: 11px;
  color: #a8abb2;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: 500;
  opacity: 0.6;
}

/* 中心的精细刻线 */
.center-line {
  position: absolute;
  bottom: 40px;
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #dcdfe6, transparent);
  border-radius: 1px;
}

.panel-close-bar {
  position: absolute;
  top: 0;
  right: -28px; /* 稍微窄一点，更加精致 */
  width: 28px;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

/* 背景保留轻微的磨砂感，但更加通透 */
.bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(236, 237, 240, 0.95) 10%, rgba(181, 197, 205, 0.5) 100%);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 自定义大箭头 (<) */
.modern-arrow {
  position: relative;
  width: 12px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 使用伪元素绘制两条线 */
.modern-arrow::before,
.modern-arrow::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 26px;
  background-color: #ffffff;
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 上半部分线段：改为正值，使其向左倾斜 */
.modern-arrow::before {
  transform: translateY(-10px) rotate(25deg); 
}

/* 下半部分线段：改为负值，使其向左倾斜 */
.modern-arrow::after {
  transform: translateY(10px) rotate(-25deg);
}
/* --- 交互动效 --- */

/* 悬停时，背景变红，箭头变亮并呈现"挤压"感 */
.panel-close-bar:hover .bar-bg {
  background: linear-gradient(
    to right,
    rgba(77, 148, 247, 0.98) 0%,
    rgba(254, 240, 240, 0.1) 100%
  );
}

.panel-close-bar:hover .modern-arrow::before {
  background-color: #ffffff;
  transform: translateY(-9px) rotate(40deg); 
}

.panel-close-bar:hover .modern-arrow::after {
  background-color: #ffffff;
  transform: translateY(9px) rotate(-40deg);
}

/* 点击时的位移感 */
.panel-close-bar:active .modern-arrow {
  transform: translateX(-3px);
}

/* 自定义大箭头 (<) */
.modern-arrow {
  position: relative;
  width: 12px;
  height: 40px; /* 纵向拉长，更有设计感 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 使用伪元素绘制两条线 */
.modern-arrow::before,
.modern-arrow::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 24px;
  background-color: #ffffff; /* 初始颜色较淡 */
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 上半部分线段：改为正值，使其向左倾斜 */
.modern-arrow::before {
  /* 从 -25deg 改为 25deg */
  transform: translateY(-10px) rotate(25deg); 
}

/* 下半部分线段：改为负值，使其向左倾斜 */
.modern-arrow::after {
  /* 从 25deg 改为 -25deg */
  transform: translateY(10px) rotate(-25deg);
}
/* --- 交互动效 --- */

/* 悬停时，背景变红，箭头变亮并呈现“挤压”感 */
.panel-close-bar:hover .bar-bg {
  background: linear-gradient(
    to right,
    rgba(77, 148, 247, 0.95) 0%,
    rgba(254, 240, 240, 0) 100%
  );
}

.panel-close-bar:hover .modern-arrow::before {
  background-color: #1a59f8;
  /* 角度变大，增强指向感 */
  transform: translateY(-9px) rotate(40deg); 
}

.panel-close-bar:hover .modern-arrow::after {
  background-color: #254ff7;
  /* 角度变大，增强指向感 */
  transform: translateY(9px) rotate(-40deg);
}

/* 点击时的位移感 */
.panel-close-bar:active .modern-arrow {
  transform: translateX(-3px);
}


/* 极简头部 */
.mini-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  flex-shrink: 0; /* 防止压缩 */
}

.header-indicator {
  width: 3px;
  height: 14px;
  background: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

/* 滚动区域 */
.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 列表样式优化 */
.list-item {
  padding: 12px;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.list-item:hover {
  background: #f5f7fa;
}

.list-item:active {
  background: #eff3f8;
}

.list-item .text {
  font-size: 13px;
  line-height: 1.4;
  color: #333;
}

.list-item .arrow {
  color: #c0c4cc;
  font-size: 14px;
}

/* 故障代码特殊样式 */
.error-item {
  border-left: 3px solid #f56c6c;
  background: #fef0f0;
}

.error-info {
  display: flex;
  flex-direction: column;
}

.error-info .code {
  font-weight: bold;
  color: #f56c6c;
  font-size: 13px;
}

.error-info .desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
  width: 0; /* 挤压效果 */
}




@media (min-width: 769px) and (max-width: 1024px) {
  .tab-panel {
    width: 280px;
  }

  .step-images {
    grid-template-columns: repeat(2, 1fr);
  }

  .image-wrapper {
    height: 200px;
  }
}

@media (min-width: 1025px) {
  .step-images {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .image-wrapper {
    height: 240px;
  }
}

/* Element Plus 深度样式覆盖 */
:deep(.el-image-viewer__wrapper) {
  z-index: 9999;
}

:deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

:deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

:deep(.el-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 可点击链接样式 */
.clickable-link-tag {
  color: #409EFF;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(64, 158, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-weight: 600;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.clickable-link-tag:hover {
  background: rgba(64, 158, 255, 0.2);
  color: #3075e6;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 元素标签优化 */
:deep(.el-tag--primary) {
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
  border-color: #b3d8ff;
  color: #409EFF;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border-color: #b3e19d;
  color: #67c23a;
}

:deep(.el-tag--warning) {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-color: #f5dab1;
  color: #e6a23c;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
  border-color: #d3d4d6;
  color: #909399;
}

/* 滚动条美化 */
.panel-content::-webkit-scrollbar,
.chat-messages-container::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track,
.chat-messages-container::-webkit-scrollbar-track {
  background: linear-gradient(180deg, #f1f1f1 0%, #e8e8e8 100%);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb,
.chat-messages-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c1c1c1 0%, #b1b1b1 100%);
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-content::-webkit-scrollbar-thumb:hover,
.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a8a8a8 0%, #989898 100%);
}
/* --- 弱化诊断概要 --- */
.diagnosis-summary-minimal {
  font-size: 12px;
  color: #909399;
  margin-bottom: 14px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.summary-divider {
  color: #dcdfe6;
}

/* --- 强化核心描述卡片 --- */
.instruction-card {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-left: 5px solid #409eff;
  padding: 14px 18px;
  margin: 14px 0;
  border-radius: 0 10px 10px 0;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.12),
    0 2px 8px rgba(64, 158, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.instruction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
  border-radius: 0 10px 0 0;
}

.instruction-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #40a0ff;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.main-instruction {
  font-size: 16px !important;
  line-height: 1.7;
  color: #303133 !important;
  font-weight: 600;
  margin: 0 !important;
  position: relative;
  z-index: 1;
}

/* 移除原有的 h3 样式或隐藏 */
.solution h3 {
  display: none;
}
</style>
