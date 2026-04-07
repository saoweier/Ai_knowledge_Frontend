import { computed, onUnmounted, ref } from 'vue'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

const VOICE_STATE_META = {
  off: { label: '未开启', tone: 'neutral' },
  idle: { label: '待机中', tone: 'neutral' },
  listening: { label: '监听中', tone: 'info' },
  recording: { label: '录音中', tone: 'danger' },
  recognizing: { label: '识别中', tone: 'warning' },
  speaking: { label: '播报中', tone: 'success' },
  error: { label: '异常', tone: 'danger' }
}

export function useVoiceController() {
  const voiceEnabled = ref(false)
  const isListening = ref(false)
  const isRecording = ref(false)
  const isSpeaking = ref(false)
  const isWakeWordMode = ref(false)
  const recognizedText = ref('')
  const lastError = ref('')
  const voiceState = ref('off')
  const voiceCapabilities = ref({
    asrAvailable: null,
    ttsAvailable: null,
    wakeWords: []
  })

  let mediaRecorder = null
  let audioChunks = []
  let wakeWordInterval = null
  let currentAudio = null
  let stream = null

  const voiceStateLabel = computed(() => VOICE_STATE_META[voiceState.value]?.label || '未知状态')
  const voiceStatusTone = computed(() => VOICE_STATE_META[voiceState.value]?.tone || 'neutral')

  const VOICE_COMMANDS = {
    YES: ['是', '对的', '正确', '确认', '确定', '是的'],
    NO: ['否', '不是', '不对', '错误', '取消'],
    NEXT: ['下一步', '继续', '下一个', '执行并继续']
  }

  function setState(state, errorMessage = '') {
    voiceState.value = state
    lastError.value = errorMessage
  }

  function clearRecognizedText() {
    recognizedText.value = ''
  }

  async function checkVoiceHealth(forceRefresh = false) {
    const cached = voiceCapabilities.value
    if (
      !forceRefresh
      && typeof cached.asrAvailable === 'boolean'
      && typeof cached.ttsAvailable === 'boolean'
    ) {
      return cached
    }

    try {
      const response = await http.get('/voice/health', { timeout: 10000 })
      const nextValue = {
        asrAvailable: !!response.data?.asr_available,
        ttsAvailable: !!response.data?.tts_available,
        wakeWords: Array.isArray(response.data?.wake_words) ? response.data.wake_words : []
      }
      voiceCapabilities.value = nextValue
      return nextValue
    } catch (error) {
      console.error('语音健康检查失败:', error)
      const fallback = {
        asrAvailable: false,
        ttsAvailable: false,
        wakeWords: []
      }
      voiceCapabilities.value = fallback
      return fallback
    }
  }

  async function initMediaStream() {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持麦克风访问')
    }

    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    return stream
  }

  async function startWakeWordDetection(onWakeWord) {
    if (!voiceEnabled.value || wakeWordInterval) return

    try {
      await initMediaStream()
      isListening.value = true
      isWakeWordMode.value = true
      setState('listening')

      wakeWordInterval = setInterval(async () => {
        if (!voiceEnabled.value || !isListening.value || isRecording.value || isSpeaking.value) return

        try {
          const audioBlob = await recordChunk(1000)
          const detected = await detectWakeWord(audioBlob)
          if (detected) {
            clearRecognizedText()
            ElMessage.success('检测到唤醒词“维修助手”')
            if (onWakeWord) onWakeWord()
          }
        } catch (error) {
          console.warn('唤醒词检测错误:', error)
        }
      }, 1200)

      ElMessage.info('语音助手已就绪，可说“维修助手”或点击麦克风开始')
    } catch (error) {
      console.error('无法访问麦克风:', error)
      isListening.value = false
      isWakeWordMode.value = false
      setState('error', '无法访问麦克风，请检查权限设置')
      ElMessage.error(lastError.value)
    }
  }

  function stopWakeWordDetection() {
    isListening.value = false
    isWakeWordMode.value = false
    if (wakeWordInterval) {
      clearInterval(wakeWordInterval)
      wakeWordInterval = null
    }
    if (!isRecording.value && !isSpeaking.value) {
      setState(voiceEnabled.value ? 'idle' : 'off')
    }
  }

  function recordChunk(duration = 1000) {
    return new Promise((resolve, reject) => {
      if (!stream) {
        reject(new Error('没有音频流'))
        return
      }

      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => chunks.push(event.data)
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }))
      recorder.onerror = (event) => reject(event)

      recorder.start()
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop()
      }, duration)
    })
  }

  async function startRecording(onResult) {
    if (!voiceEnabled.value || isRecording.value) return

    try {
      await initMediaStream()
      audioChunks = []
      clearRecognizedText()
      lastError.value = ''

      mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        isRecording.value = false
        setState('recognizing')
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const text = await recognizeSpeech(audioBlob)
        if (text && onResult) {
          onResult(text)
        }
        if (!isSpeaking.value) {
          setState(voiceEnabled.value && isListening.value ? 'listening' : (voiceEnabled.value ? 'idle' : 'off'))
        }
      }

      mediaRecorder.start()
      isRecording.value = true
      setState('recording')
      ElMessage.info('正在录音，请说出问题或命令')
    } catch (error) {
      console.error('录音失败:', error)
      isRecording.value = false
      setState('error', '录音失败，请检查麦克风权限')
      ElMessage.error(lastError.value)
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
  }

  async function recognizeSpeech(audioBlob) {
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'recording.webm')

    try {
      const response = await http.post('/voice/asr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })

      const text = response.data?.text?.trim?.() || ''
      recognizedText.value = text

      if (!text) {
        setState('error', '未识别到有效语音，请重试')
        ElMessage.warning(lastError.value)
        return null
      }

      return text
    } catch (error) {
      console.error('语音识别失败:', error)
      setState('error', '语音识别失败，请检查网络或稍后重试')
      ElMessage.error(lastError.value)
      return null
    }
  }

  async function detectWakeWord(audioBlob) {
    const formData = new FormData()
    formData.append('audio_chunk', audioBlob, 'chunk.webm')

    try {
      const response = await http.post('/voice/detect_wake', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      })
      return response.data?.detected || false
    } catch {
      return false
    }
  }

  async function speakText(text, onEnd) {
    if (!text || isSpeaking.value) return

    try {
      setState('speaking')
      isSpeaking.value = true

      const response = await http.post(
        '/voice/tts',
        { text },
        { responseType: 'blob', timeout: 60000 }
      )

      const responseType = response.headers?.['content-type'] || 'audio/mpeg'
      const audioBlob = new Blob([response.data], { type: responseType })
      const audioUrl = URL.createObjectURL(audioBlob)

      if (currentAudio) {
        currentAudio.pause()
        URL.revokeObjectURL(currentAudio.src)
      }

      currentAudio = new Audio(audioUrl)

      currentAudio.onended = () => {
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
        setState(voiceEnabled.value && isListening.value ? 'listening' : (voiceEnabled.value ? 'idle' : 'off'))
        if (onEnd) onEnd()
      }

      currentAudio.onerror = () => {
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
        setState('error', '音频播放失败')
      }

      await currentAudio.play()
    } catch (error) {
      console.error('语音合成失败:', error)
      isSpeaking.value = false
      setState('error', '语音播报失败，请稍后重试')
    }
  }

  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause()
      if (currentAudio.src) URL.revokeObjectURL(currentAudio.src)
      currentAudio = null
    }
    isSpeaking.value = false
    if (!isRecording.value) {
      setState(voiceEnabled.value && isListening.value ? 'listening' : (voiceEnabled.value ? 'idle' : 'off'))
    }
  }

  function parseVoiceCommand(text) {
    if (!text) return null

    const normalized = text.trim().toLowerCase()

    for (const command of VOICE_COMMANDS.YES) {
      if (normalized.includes(command)) return 'SUCCESS'
    }

    for (const command of VOICE_COMMANDS.NO) {
      if (normalized.includes(command)) return 'FAILED'
    }

    for (const command of VOICE_COMMANDS.NEXT) {
      if (normalized.includes(command)) return 'NEXT'
    }

    return null
  }

  function cleanup() {
    stopWakeWordDetection()
    stopRecording()
    stopSpeaking()
    clearRecognizedText()

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }

    setState(voiceEnabled.value ? 'idle' : 'off')
  }

  function setVoiceEnabled(enabled) {
    voiceEnabled.value = enabled
    clearRecognizedText()
    lastError.value = ''
    if (!enabled) {
      cleanup()
      setState('off')
      return
    }
    setState('idle')
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    voiceEnabled,
    isListening,
    isRecording,
    isSpeaking,
    isWakeWordMode,
    recognizedText,
    lastError,
    voiceState,
    voiceStateLabel,
    voiceStatusTone,
    voiceCapabilities,
    checkVoiceHealth,
    clearRecognizedText,
    setVoiceEnabled,
    startWakeWordDetection,
    stopWakeWordDetection,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    parseVoiceCommand,
    cleanup
  }
}
