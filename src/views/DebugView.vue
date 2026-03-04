<template>
  <div class="page">
    <el-card>
      <el-button
        type="primary"
        @click="fetchData"
      >
        获取内容分布
      </el-button>
    </el-card>

    <el-card
      v-if="ready"
      class="mt-2"
    >
      <h4>内容分布</h4>
      <div
        ref="chart"
        style="height: 420px;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const chart = ref(null)
const chartInstance = ref(null)
const ready = ref(false)
const raw = ref(null)

async function fetchData() {
  try {
    const { data } = await http.get('/debug/content_distribution')
    raw.value = data
    await nextTick()
    draw()
  } catch (e) {
    console.error(e)
    ElMessage.error('获取失败，请检查控制台与后端服务')
  }
}

function draw() {
  const el = chart.value
  if (!el) return
  if (!chartInstance.value) chartInstance.value = echarts.init(el)

  const data = Array.isArray(raw.value)
    ? raw.value
    : Object.entries(raw.value || {}).map(([name, value]) => ({ name, value }))

  chartInstance.value.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: '65%', data }]
  })
  ready.value = true
}

onBeforeUnmount(() => {
  if (chartInstance.value) chartInstance.value.dispose()
})
</script>

<style scoped>
.page { padding: 20px; }
.mt-2 { margin-top: 20px; }
</style>
