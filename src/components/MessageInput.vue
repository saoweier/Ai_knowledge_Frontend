<template>
  <div class="input-shell">
    <div class="input-meta">
      <div class="meta-primary">
        <span class="mode-chip">{{ modeLabel }}</span>
        <span
          v-if="contextHint"
          class="context-chip"
        >
          {{ contextHint }}
        </span>
      </div>
      <div class="meta-actions">
        <button
          type="button"
          class="ghost-toggle"
          :class="{ active: settingsOpen }"
          @click="settingsOpen = !settingsOpen"
        >
          <el-icon><Setting /></el-icon>
          高级配置
        </button>
      </div>
    </div>

    <div
      v-if="voiceEnabled || recognizedText || voiceError"
      class="voice-banner"
    >
      <div class="voice-status">
        <span
          class="voice-dot"
          :class="[`tone-${voiceTone}`, { pulsing: isRecording || isSpeaking }]"
        />
        <span class="voice-label">语音状态：{{ voiceStateLabel || (voiceEnabled ? '待机中' : '未开启') }}</span>
      </div>
      <div
        v-if="recognizedText"
        class="voice-result"
      >
        已识别：{{ recognizedText }}
      </div>
      <div
        v-else-if="voiceError"
        class="voice-error"
      >
        {{ voiceError }}
      </div>
    </div>

    <div class="composer">
      <div class="composer-main">
        <el-input
          v-model="text"
          type="textarea"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :placeholder="placeholderText"
          @keydown.enter.exact.prevent="emitSend"
        />
      </div>

      <div class="composer-actions">
        <el-tooltip
          content="语音开关"
          placement="top"
        >
          <el-switch
            v-model="voiceEnabled"
            class="voice-switch"
            @change="handleVoiceToggle"
          />
        </el-tooltip>

        <el-tooltip
          :content="isRecording ? '结束录音' : '开始录音'"
          placement="top"
        >
          <el-button
            :type="isRecording ? 'danger' : 'default'"
            :icon="isRecording ? VideoPause : Microphone"
            circle
            class="action-circle"
            :class="{ recording: isRecording }"
            :disabled="!voiceEnabled || loading"
            @click="emit('micClick')"
          />
        </el-tooltip>

        <el-tooltip
          v-if="isSpeaking"
          content="停止播报"
          placement="top"
        >
          <el-button
            circle
            type="warning"
            class="action-circle"
            :icon="VideoPause"
            @click="emit('stopSpeaking')"
          />
        </el-tooltip>

        <el-tooltip content="清空对话" placement="top">
          <el-button
            type="danger"
            size="small"
            circle
            class="clear-btn"
            @click="emit('clear')"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>

        <el-button
          type="primary"
          class="send-button"
          :loading="loading"
          @click="emitSend"
        >
          发送
        </el-button>
      </div>
    </div>

    <transition name="settings-slide">
      <div
        v-if="settingsOpen"
        class="settings-panel"
      >
        <div class="settings-header">
          <span class="settings-title">高级配置</span>
          <button
            type="button"
            class="settings-collapse-btn"
            @click="settingsOpen = false"
          >
            <el-icon><ArrowUp /></el-icon>
            收起
          </button>
        </div>
        <div class="settings-grid">
          <div class="setting-card">
            <span class="setting-label">接口模式</span>
            <el-select
              v-model="api"
              size="large"
            >
              <el-option
                label="增强搜索（带解决方案）"
                value="search_with_solution"
              />
              <el-option
                label="流程搜索（ChatFlow）"
                value="search_flow_solution"
              />
              <el-option
                label="基础搜索"
                value="search"
              />
            </el-select>
          </div>

          <div class="setting-card">
            <span class="setting-label">上下文记忆</span>
            <el-input-number
              v-model="memory"
              :min="3"
              :max="12"
              :step="1"
              size="large"
              controls-position="right"
            />
            <small>最近 {{ memory }} 条消息进入上下文。</small>
          </div>

          <div class="setting-card">
            <span class="setting-label">LLM 整合</span>
            <el-switch v-model="options.enableLLM" />
            <small>关闭后只保留检索结果，不做额外整合。</small>
          </div>

          <div class="setting-card">
            <span class="setting-label">向量库</span>
            <el-select
              v-model="options.collectionName"
              size="large"
              filterable
              clearable
              :loading="collectionLoading"
              placeholder="默认向量库（当前配置）"
            >
              <el-option
                label="默认向量库（当前配置）"
                value=""
              />
              <el-option
                v-for="item in collectionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <small>可直接切换到重构后的新向量库做效果对比。</small>
          </div>

          <div class="setting-card">
            <span class="setting-label">结果多样化</span>
            <template v-if="api === 'search'">
              <el-switch v-model="options.diversify" />
            </template>
            <small v-else>仅基础搜索模式可配置。</small>
          </div>

          <div class="setting-card full-width">
            <span class="setting-label">强制内容类型</span>
            <el-input
              v-model="options.forceContent"
              size="large"
              placeholder="例如：fault_diagnosis"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Microphone, Setting, VideoPause, Delete, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  defaultApi: {
    type: String,
    default: 'search_with_solution'
  },
  defaultOptions: {
    type: Object,
    default: () => ({})
  },
  defaultMemoryLimit: {
    type: Number,
    default: 3
  },
  collectionOptions: {
    type: Array,
    default: () => []
  },
  collectionLoading: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  voiceEnabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  contextHint: {
    type: String,
    default: ''
  },
  modeLabel: {
    type: String,
    default: '对话输入'
  },
  voiceStateLabel: {
    type: String,
    default: ''
  },
  voiceTone: {
    type: String,
    default: 'neutral'
  },
  recognizedText: {
    type: String,
    default: ''
  },
  voiceError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'send',
  'clear',
  'update:api',
  'update:options',
  'update:memory',
  'update:voiceEnabled',
  'micClick',
  'voiceToggle',
  'stopSpeaking'
])

const text = ref('')
const settingsOpen = ref(false)
const api = ref(props.defaultApi || 'search_with_solution')
const normalizeOptions = (value = {}) => ({
  enableLLM: value?.enableLLM ?? false,
  collectionName: value?.collectionName || '',
  forceContent: value?.forceContent || '',
  diversify: value?.diversify ?? true
})

const isSameOptions = (left, right) => {
  const a = normalizeOptions(left)
  const b = normalizeOptions(right)
  return a.enableLLM === b.enableLLM
    && a.collectionName === b.collectionName
    && a.forceContent === b.forceContent
    && a.diversify === b.diversify
}

const options = ref(normalizeOptions(props.defaultOptions))
const memory = ref(props.defaultMemoryLimit ?? 3)
const voiceEnabled = ref(props.voiceEnabled ?? false)

const placeholderText = computed(() => props.placeholder || '请输入问题，按 Enter 发送，Shift + Enter 换行')

watch(() => props.defaultApi, (value) => {
  if (value) api.value = value
})

watch(() => props.defaultOptions, (value) => {
  const nextOptions = normalizeOptions(value)
  if (!isSameOptions(options.value, nextOptions)) {
    options.value = nextOptions
  }
}, { deep: true })

watch(() => props.defaultMemoryLimit, (value) => {
  if (typeof value === 'number') memory.value = value
})

watch(() => props.voiceEnabled, (value) => {
  voiceEnabled.value = !!value
})

watch(api, (value) => emit('update:api', value))
watch(options, (value) => {
  if (!isSameOptions(value, props.defaultOptions)) {
    emit('update:options', { ...normalizeOptions(value) })
  }
}, { deep: true })
watch(memory, (value) => emit('update:memory', Number(value)))
watch(voiceEnabled, (value) => emit('update:voiceEnabled', value))

function emitSend() {
  if (!text.value.trim() || props.loading) return
  emit('send', {
    text: text.value.trim(),
    api: api.value,
    options: options.value
  })
  text.value = ''
}

function handleVoiceToggle(value) {
  emit('voiceToggle', value)
}
</script>

<style scoped>
.input-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(17, 94, 89, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f6f7f4 100%);
  border: 1px solid rgba(20, 84, 74, 0.12);
  box-shadow: 0 12px 28px rgba(20, 84, 74, 0.07);
  width: 100%;
  box-sizing: border-box;
}

.input-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.meta-primary,
.meta-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-chip,
.context-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.mode-chip {
  background: #113d38;
  color: #f7fcfa;
}

.context-chip {
  background: #edf5f2;
  color: #37645f;
}

.ghost-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #4f6f6a;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}

.ghost-toggle.active {
  color: #113d38;
}

.voice-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f2f7f5;
  color: #29423f;
  flex-wrap: wrap;
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.voice-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #9ba7a4;
}

.voice-dot.pulsing {
  animation: pulse 1.2s infinite;
}

.tone-neutral {
  background: #94a3b8;
}

.tone-info {
  background: #0f766e;
}

.tone-warning {
  background: #d97706;
}

.tone-success {
  background: #15803d;
}

.tone-danger {
  background: #dc2626;
}

.voice-result,
.voice-error {
  font-size: 13px;
}

.voice-error {
  color: #b91c1c;
}

.composer {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.composer-main {
  flex: 1;
}

.composer-main :deep(.el-textarea__inner) {
  min-height: 78px !important;
  padding: 12px 14px;
  border-radius: 18px;
  border-color: rgba(20, 84, 74, 0.14);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
  font-size: 14px;
  line-height: 1.6;
}

.composer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.voice-switch {
  --el-switch-on-color: #0f766e;
  --el-switch-off-color: #d1d5db;
}

.action-circle {
  width: 40px;
  height: 40px;
}

.action-circle.recording {
  animation: pulse 1.2s infinite;
}

.clear-btn {
  flex-shrink: 0;
}

.send-button {
  min-width: 82px;
  height: 40px;
  border-radius: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #115e59 0%, #0f766e 100%);
  border-color: #115e59;
}

.settings-panel {
  border-top: 1px solid rgba(20, 84, 74, 0.08);
  padding-top: 2px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 12px;
  border-bottom: 1px solid rgba(20, 84, 74, 0.06);
  margin-bottom: 12px;
}

.settings-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.settings-collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid rgba(20, 84, 74, 0.18);
  border-radius: 10px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-collapse-btn:hover {
  background: #0f766e;
  color: #ffffff;
  border-color: #0f766e;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.setting-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 16px;
  background: #fbfcfb;
  border: 1px solid rgba(20, 84, 74, 0.08);
}

.setting-card.full-width {
  grid-column: 1 / -1;
}

.setting-label {
  color: #1f2937;
  font-size: 12px;
  font-weight: 700;
}

.setting-card small {
  color: #64748b;
  line-height: 1.5;
}

.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: all 0.22s ease;
}

.settings-slide-enter-from,
.settings-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.35);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

@media (max-width: 960px) {
  .composer {
    flex-direction: column;
    align-items: stretch;
  }

  .composer-actions {
    justify-content: space-between;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.input-shell {
  gap: 12px;
  padding: 16px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(31, 98, 89, 0.12), transparent 34%),
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(246, 240, 232, 0.92));
  border: 1px solid rgba(65, 88, 80, 0.14);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(16px);
}

.mode-chip,
.context-chip {
  min-height: 28px;
  padding-inline: 12px;
  border-radius: 999px;
  font-size: 12px;
}

.mode-chip {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  color: #fffaf4;
}

.context-chip {
  background: rgba(31, 98, 89, 0.08);
  color: var(--text-soft);
}

.ghost-toggle {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 251, 246, 0.8);
  border: 1px solid rgba(65, 88, 80, 0.12);
  color: var(--text-soft);
}

.ghost-toggle.active {
  color: var(--brand);
  border-color: rgba(31, 98, 89, 0.2);
}

.voice-banner {
  padding: 10px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(222, 239, 233, 0.72), rgba(255, 251, 246, 0.78));
  border: 1px solid rgba(31, 98, 89, 0.12);
}

.composer-main :deep(.el-textarea__inner) {
  min-height: 92px !important;
  padding: 16px 18px;
  border-radius: 22px;
  border-color: rgba(65, 88, 80, 0.14);
  background: rgba(255, 251, 246, 0.86);
  color: var(--text);
  font-size: 15px;
  line-height: 1.75;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.composer-main :deep(.el-textarea__inner:focus) {
  border-color: rgba(31, 98, 89, 0.34);
  box-shadow: 0 0 0 4px rgba(31, 98, 89, 0.08);
}

.composer-actions {
  gap: 10px;
}

.action-circle,
.clear-btn {
  width: 44px;
  height: 44px;
  border-radius: 16px;
}

.send-button {
  min-width: 104px;
  height: 46px;
  border-radius: 16px;
  font-size: 14px;
  background: linear-gradient(135deg, var(--accent) 0%, #8b4f22 100%);
  border-color: transparent;
  box-shadow: 0 16px 28px rgba(180, 107, 49, 0.2);
}

.settings-panel {
  margin-top: 2px;
  padding-top: 12px;
  border-top: 1px solid rgba(65, 88, 80, 0.08);
}

.settings-header {
  padding: 2px 4px 14px;
}

.settings-title {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 14px;
}

.settings-collapse-btn {
  border-radius: 999px;
  background: rgba(31, 98, 89, 0.08);
  color: var(--brand);
}

.setting-card {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 251, 246, 0.8);
  border: 1px solid rgba(65, 88, 80, 0.1);
}

.setting-label {
  color: var(--text);
}

.setting-card small {
  color: var(--text-faint);
}

@media (max-width: 960px) {
  .input-shell {
    padding: 14px;
    border-radius: 24px;
  }

  .input-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .meta-primary,
  .meta-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .composer-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .send-button {
    flex: 1;
  }
}
</style>
