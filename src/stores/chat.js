// src/stores/chat.js
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],        // { role: 'user'|'assistant', content: string, guidance?, hasSteps? }
    memoryLimit: 3
  }),

  getters: {
    lastExpert: (s) => {
      const rev = [...s.messages].reverse()
      return rev.find(m => m.role !== 'user') || null
    },
    // 发给后端的上下文（不包含“当前这次用户输入”，由 ChatView 在 addUserMessage 之前或之后控制）
    contextForBackend: (s) => {
      // 只保留 user/assistant 两类
      const hist = s.messages.filter(m => m.role === 'user' || m.role === 'assistant')
      if (!s.memoryLimit || s.memoryLimit <= 0) return []
      return hist.slice(-s.memoryLimit * 2).map(m => ({
        role: m.role,
        content: m.content,
        guidance: m.guidance || '',
        hasSteps: !!m.hasSteps,
        time: m.time || Date.now()
      }))
    }
  },

  actions: {
    addUserMessage(text) {
      this.messages.push({ role: 'user', content: text, time: Date.now() })
    },
    addExpertMessage(payload) {
      // payload: { guidance, steps, refs, quick_diagnosis, escalation_info, content, raw }
      const hasSteps = Array.isArray(payload.steps) && payload.steps.length > 0
      const summary = payload.guidance || payload.quick_diagnosis || payload.content || ''
      this.messages.push({
        role: 'assistant',
        content: summary,
        guidance: payload.guidance || '',
        hasSteps,
        steps: payload.steps || [],
        refs: payload.refs || [],
        quick_diagnosis: payload.quick_diagnosis || '',
        escalation_info: payload.escalation_info || '',
        raw: payload.raw || null,
        time: Date.now()
      })
    },
    clear() {
      this.messages = []
    }
  }
})
