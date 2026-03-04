<template>
  <div class="input-wrap">
    <div class="main-input-row">
      <el-button
        :type="isRecording ? 'danger' : 'default'"
        :icon="isRecording ? VideoPause : Microphone"
        circle
        :class="{ 'recording': isRecording }"
        :disabled="!voiceEnabled || loading"
        @click="handleMicClick"
      />
      
      <el-input
        v-model="text"
        placeholder="请输入设备故障或问题…"
        clearable
        @keyup.enter="emitSend"
      />
      
      <el-tooltip 
        :content="voiceEnabled ? '语音模式已开启' : '开启语音模式'" 
        placement="top"
      >
        <el-switch
          v-model="voiceEnabled"
          active-color="#67c23a"
          inactive-color="#dcdfe6"
          class="voice-switch"
          @change="handleVoiceToggle"
        />
      </el-tooltip>
      
      <el-popover
        placement="top"
        :width="300"
        trigger="click"
      >
        <template #reference>
          <el-button 
            circle 
            type="info" 
            plain 
            :icon="Setting"
            title="高级配置"
          />
        </template>
        
        <div class="input-settings-panel">
          <h4>⚙️ LLM 策略配置</h4>
          <el-divider class="my-2" />
          
          <div class="setting-item">
            <label>API 模型:</label>
            <el-select
              v-model="api"
              size="small"
              style="width: 180px;"
            >
              <el-option
                label="增强搜索（带解决方案）"
                value="search_with_solution"
              />
              <el-option
                label="基础搜索"
                value="search"
              />
            </el-select>
          </div>

          <div class="setting-item mt-3">
            <label>启用 LLM 整合:</label>
            <el-switch v-model="options.enableLLM" />
          </div>

          <div class="setting-item mt-3">
            <label>上下文记忆 (条):</label>
            <el-input-number
              v-model="memory"
              :min="3"
              :max="12"
              :step="1"
              size="small"
              controls-position="right"
              style="width: 120px;"
            />
          </div>
          <span class="muted memory-hint">最近 {{ memory }} 条消息计入上下文。</span>
          
          <el-divider class="my-3" />
          
          <h4>高级选项</h4>

          <div class="setting-item mt-3">
            <label>多样化结果:</label>
            <el-switch
              v-if="api === 'search'"
              v-model="options.diversify"
            />
            <el-tag
              v-else
              size="small"
              type="info"
            >
              仅基础搜索可用
            </el-tag>
          </div>
          
          <div class="setting-item mt-3">
            <label>强制内容类型:</label>
            <el-input
              v-model="options.forceContent"
              placeholder="force_content_type"
              size="small"
              style="width: 180px"
            />
          </div>
        </div>
      </el-popover>
      
      <el-button
        type="primary"
        :loading="loading"
        class="action-button"
        @click="emitSend"
      >
        发送
      </el-button>
      
      <!-- <el-button @click="$emit('clear')" class="action-button">清空</el-button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Setting, Microphone, VideoPause } from '@element-plus/icons-vue'

const props = defineProps({
  defaultApi: String,
  defaultOptions: Object,
  defaultMemoryLimit: Number,
  loading: Boolean,
  isRecording: Boolean,
  voiceEnabled: Boolean
})

const emit = defineEmits([
  'send',
  'clear',
  'update:api',
  'update:options',
  'update:memory',
  'update:voiceEnabled',
  'micClick',
  'voiceToggle'
])

const text = ref('')
const api = ref(props.defaultApi || 'search_with_solution')
const options = ref({
  enableLLM: props.defaultOptions?.enableLLM ?? true,
  forceContent: props.defaultOptions?.forceContent || '',
  diversify: props.defaultOptions?.diversify ?? true
})
const memory = ref(props.defaultMemoryLimit ?? 3)
const voiceEnabled = ref(props.voiceEnabled ?? false)

watch(api, (v) => emit('update:api', v))
watch(options, (v) => emit('update:options', v), { deep: true })
watch(memory, (n) => emit('update:memory', Number(n)))
watch(voiceEnabled, (v) => emit('update:voiceEnabled', v))

const isRecording = computed(() => props.isRecording)

function emitSend() {
  if (!text.value.trim()) return
  emit('send', {
    text: text.value,
    api: api.value,
    options: options.value
  })
  text.value = ''
}

function handleMicClick() {
  emit('micClick')
}

function handleVoiceToggle(val) {
  emit('voiceToggle', val)
}
</script>

<style scoped>
.input-wrap {
  padding: 0;
}

.main-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.main-input-row .el-input {
  max-width: 1800px;
  width: 100%;
  flex-shrink: 1;
  justify-content: center;
  --el-input-height: 48px; 
}

.main-input-row :deep(.el-input__inner) {
    font-size: 16px; 
}

.settings-button {
  flex-shrink: 0;
  width: 48px; 
  height: 48px; 
  padding: 0;
}

.action-button {
  flex-shrink: 0;
  height: 48px;
  font-size: 16px;
  min-width: 80px;
}

.main-input-row .el-button:not([type="primary"]) {
    background-color: #f2f6fc;
    color: #606266;
    border-color: #dcdfe6;
}

.main-input-row .el-button.recording {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

.voice-switch {
  --el-switch-on-color: #67c23a;
  --el-switch-off-color: #dcdfe6;
}

.input-settings-panel h4 {
    margin: 0;
    font-size: 16px; 
    color: #303133;
}
.input-settings-panel .el-divider.my-2 {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
}
.input-settings-panel .el-divider.my-3 {
    margin-top: 12px !important;
    margin-bottom: 12px !important;
}
.input-settings-panel .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px; 
    margin-bottom: 8px;
}
.input-settings-panel .setting-item label {
    color: #606266;
    flex-shrink: 0;
    margin-right: 10px;
}
.input-settings-panel .el-select, 
.input-settings-panel .el-input,
.input-settings-panel .el-input-number {
    width: 120px; 
}
.memory-hint {
    display: block;
    text-align: right;
    margin-top: -6px;
    color: #909399;
    font-size: 13px;
}
</style>