import { ref, onUnmounted } from 'vue'
import http from '@/api/http'
import { ElMessage } from 'element-plus'

export function useVoiceController() {
  const voiceEnabled = ref(false)
  const isListening = ref(false)
  const isRecording = ref(false)
  const isSpeaking = ref(false)
  const isWakeWordMode = ref(false)

  let mediaRecorder = null
  let audioChunks = []
  let wakeWordInterval = null
  let currentAudio = null
  let stream = null

  const VOICE_COMMANDS = {
    YES: ['是', '对的', '正确', '确认', '确定', '是的'],
    NO: ['否', '不是', '不对', '错误', '取消'],
    NEXT: ['下一步', '继续', '下一个', '执行并继续']
  }

  async function initMediaStream() {
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    return stream
  }

  async function startWakeWordDetection(onWakeWord) {
    if (!voiceEnabled.value) return
    
    try {
      await initMediaStream()
      isListening.value = true
      isWakeWordMode.value = true
      
      wakeWordInterval = setInterval(async () => {
        if (!isListening.value || isRecording.value || isSpeaking.value) return
        
        try {
          const audioBlob = await recordChunk(1000)
          const detected = await detectWakeWord(audioBlob)
          if (detected) {
            ElMessage.success('检测到唤醒词："维修助手"')
            if (onWakeWord) onWakeWord()
          }
        } catch (e) {
          console.warn('唤醒词检测错误:', e)
        }
      }, 1200)
      
      ElMessage.info('语音助手已就绪，请说"维修助手"或点击麦克风开始')
    } catch (e) {
      console.error('无法访问麦克风:', e)
      ElMessage.error('无法访问麦克风，请检查权限设置')
      isListening.value = false
    }
  }

  function stopWakeWordDetection() {
    isListening.value = false
    isWakeWordMode.value = false
    if (wakeWordInterval) {
      clearInterval(wakeWordInterval)
      wakeWordInterval = null
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
      
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }))
      recorder.onerror = (e) => reject(e)
      
      recorder.start()
      setTimeout(() => recorder.stop(), duration)
    })
  }

  async function startRecording(onResult) {
    if (isRecording.value) return
    
    try {
      await initMediaStream()
      audioChunks = []
      
      mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const text = await recognizeSpeech(audioBlob)
        if (text && onResult) {
          onResult(text)
        }
        isRecording.value = false
      }
      
      mediaRecorder.start()
      isRecording.value = true
      ElMessage.info('正在录音...')
    } catch (e) {
      console.error('录音失败:', e)
      ElMessage.error('录音失败，请检查麦克风权限')
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
      
      const result = response.data
      if (result.text) {
        return result.text
      }
      return null
    } catch (e) {
      console.error('语音识别失败:', e)
      ElMessage.error('语音识别失败')
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
    } catch (e) {
      return false
    }
  }

  async function speakText(text, onEnd) {
    if (!text || isSpeaking.value) return
    
    try {
      isSpeaking.value = true
      
      const response = await http.post('/voice/tts', 
        { text },
        { responseType: 'blob', timeout: 60000 }
      )
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (currentAudio) {
        currentAudio.pause()
        URL.revokeObjectURL(currentAudio.src)
      }
      
      currentAudio = new Audio(audioUrl)
      
      currentAudio.onended = () => {
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
        if (onEnd) onEnd()
      }
      
      currentAudio.onerror = () => {
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
        console.error('音频播放失败')
      }
      
      await currentAudio.play()
    } catch (e) {
      console.error('语音合成失败:', e)
      isSpeaking.value = false
    }
  }

  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    isSpeaking.value = false
  }

  function parseVoiceCommand(text) {
    if (!text) return null
    
    const normalized = text.trim().toLowerCase()
    
    for (const cmd of VOICE_COMMANDS.YES) {
      if (normalized.includes(cmd)) return 'SUCCESS'
    }
    
    for (const cmd of VOICE_COMMANDS.NO) {
      if (normalized.includes(cmd)) return 'FAILED'
    }
    
    for (const cmd of VOICE_COMMANDS.NEXT) {
      if (normalized.includes(cmd)) return 'NEXT'
    }
    
    return null
  }

  function cleanup() {
    stopWakeWordDetection()
    stopRecording()
    stopSpeaking()
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
  }

  function setVoiceEnabled(enabled) {
    voiceEnabled.value = enabled
    if (!enabled) {
      cleanup()
    }
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
