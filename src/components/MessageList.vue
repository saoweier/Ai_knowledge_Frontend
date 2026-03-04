<template>
  <div class="chat-list">
    <div
      v-for="(m, idx) in messages"
      :key="idx"
      class="chat-item"
      :class="m.role"
    >
      <img
        class="avatar"
        :src="m.role === 'expert' ? '/expert.png' : '/user.png'"
      >
      <div class="bubble">
        <template v-if="m.role === 'expert'">
          <StepSolution
            v-if="m.steps?.length"
            :guidance="m.guidance"
            :steps="m.steps"
          />
          <div
            v-else-if="m.guidance"
            class="text"
          >
            {{ m.guidance }}
          </div>
          <div
            v-else-if="m.content"
            class="text"
          >
            {{ m.content }}
          </div>

          <!-- 参考检索（可选） -->
          <div
            v-if="m.refs?.length"
            class="refs"
          >
            <div class="refs-title">
              参考内容
            </div>
            <el-timeline>
              <el-timeline-item
                v-for="(r, i) in m.refs"
                :key="i"
                :timestamp="r.chunk_id || ('#' + (i + 1))"
              >
                <div class="meta">
                  <span
                    v-if="r.score !== undefined"
                    class="muted"
                  >score: {{ r.score }}</span>
                  <span
                    v-if="r.content_type"
                    class="muted"
                  > ｜ {{ r.content_type }}</span>
                  <span
                    v-if="r.source"
                    class="muted"
                  > ｜ {{ r.source }}</span>
                </div>
                <div class="text">
                  {{ r.content || r.text || '' }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 兜底原始 JSON -->
          <details v-if="!m.steps?.length && !m.content && m.raw">
            <summary>原始响应</summary>
            <pre>{{ m.raw }}</pre>
          </details>
        </template>

        <template v-else>
          <div class="text">
            {{ m.content }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import StepSolution from './StepSolution.vue'

defineProps({
  messages: { type: Array, default: () => [] }
})
</script>

<style scoped>
.chat-list { display: flex; flex-direction: column; gap: 16px; padding: 12px 0; }
.chat-item { display: flex; gap: 12px; align-items: flex-start; }
.chat-item.user { flex-direction: row-reverse; }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.bubble { background: #f5f7fa; padding: 12px 14px; border-radius: 12px; max-width: 72%; }
.chat-item.user .bubble { background: #e6f4ff; }
.text { white-space: pre-wrap; line-height: 1.6; }
.refs { margin-top: 8px; }
.refs-title { font-weight: 600; margin-bottom: 6px; }
.meta .muted { color: #909399; font-size: 12px; margin-right: 8px; }
pre { white-space: pre-wrap; word-break: break-word; background: #fafafa; padding: 8px; border-radius: 6px; }
</style>
