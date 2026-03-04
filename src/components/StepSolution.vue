<template>
  <div class="step-solution">
    <div
      v-if="guidance"
      class="guidance"
    >
      <el-icon style="vertical-align: -2px; margin-right: 6px;">
        <ChatLineRound />
      </el-icon>
      {{ guidance }}
    </div>

    <el-steps
      direction="vertical"
      :active="steps.length"
      finish-status="success"
    >
      <el-step
        v-for="(s, i) in steps"
        :key="i"
        :title="s.title || ('步骤 ' + (i + 1))"
      >
        <template #description>
          <div class="desc">
            <div
              v-if="s.description || s.content"
              class="text"
            >
              {{ s.description || s.content }}
            </div>
            <ul
              v-if="Array.isArray(s.actions) && s.actions.length"
              class="actions"
            >
              <li
                v-for="(a, j) in s.actions"
                :key="j"
              >
                • {{ a }}
              </li>
            </ul>
            <div
              v-if="s.note"
              class="note"
            >
              备注：{{ s.note }}
            </div>
          </div>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<script setup>
import { ChatLineRound } from '@element-plus/icons-vue'

defineProps({
  guidance: { type: String, default: '' },
  steps: { type: Array, default: () => [] }
})
</script>

<style scoped>
.step-solution { display: flex; flex-direction: column; gap: 8px; }
.guidance { font-weight: 600; }
.desc .text { white-space: pre-wrap; line-height: 1.6; }
.actions { margin: 6px 0 0 0; padding-left: 18px; }
.note { margin-top: 6px; color: #606266; }
</style>
