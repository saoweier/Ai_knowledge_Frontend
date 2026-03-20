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
import { Microphone, Setting, VideoPause } from '@element-plus/icons-vue'

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
const options = ref({
  enableLLM: props.defaultOptions?.enableLLM ?? true,
  forceContent: props.defaultOptions?.forceContent || '',
  diversify: props.defaultOptions?.diversify ?? true
})
const memory = ref(props.defaultMemoryLimit ?? 3)
const voiceEnabled = ref(props.voiceEnabled ?? false)

const placeholderText = computed(() => props.placeholder || '请输入问题，按 Enter 发送，Shift + Enter 换行')

watch(() => props.defaultApi, (value) => {
  if (value) api.value = value
})

watch(() => props.defaultOptions, (value) => {
  options.value = {
    enableLLM: value?.enableLLM ?? true,
    forceContent: value?.forceContent || '',
    diversify: value?.diversify ?? true
  }
}, { deep: true })

watch(() => props.defaultMemoryLimit, (value) => {
  if (typeof value === 'number') memory.value = value
})

watch(() => props.voiceEnabled, (value) => {
  voiceEnabled.value = !!value
})

watch(api, (value) => emit('update:api', value))
watch(options, (value) => emit('update:options', value), { deep: true })
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
</style>
