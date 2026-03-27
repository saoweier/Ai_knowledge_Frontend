<template>
  <div class="extractor-page">
    <header class="hero">
      <div class="hero-title-area">
        <h1>知识提炼工作台</h1>
        <p class="hero-subtitle">先生成知识块，再生成故障图谱</p>
      </div>
    </header>

    <section class="workspace">
      <el-card class="panel input-panel compact-panel" shadow="never">
        <template #header>
          <div class="panel-header">
            <span>输入与参数</span>
            <el-button text @click="fillDemo">填充示例</el-button>
          </div>
        </template>

        <div class="input-grid">
          <div class="text-pane">
            <el-input v-model="form.title" placeholder="故障名称/标题（作为 Fault.name 候选）" class="title-input" />
            <el-input
              v-model="form.text"
              type="textarea"
              :rows="8"
              resize="vertical"
              placeholder="粘贴设备说明、故障经验或排查步骤文本"
            />
          </div>

          <div class="control-pane">
            <div class="field-row compact-fields">
              <el-input v-model="form.collectionName" placeholder="Qdrant 集合名" />
              <div class="preset-compact">
                <span class="preset-label">分块</span>
                <el-select v-model="form.presetIndex" size="small">
                  <el-option :value="0" label="小" />
                  <el-option :value="1" label="中" />
                  <el-option :value="2" label="大" />
                </el-select>
              </div>
            </div>

            <div class="action-row compact-actions">
              <el-button type="primary" :loading="loadingKnowledge" @click="generateKnowledge">生成知识</el-button>
              <el-button type="success" :loading="loadingKnowledgeIngest" :disabled="!knowledgeReady" @click="ingestKnowledge">知识入库</el-button>
              <el-button type="warning" :loading="loadingGraph" :disabled="!transform.graph.steps.length && !form.text.trim()" @click="generateGraph">生成图谱</el-button>
              <el-button type="danger" :loading="loadingGraphIngest" :disabled="!graphReady" @click="ingestGraph">图谱入库</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <div class="result-column compact-results">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span>流程提炼</span>
              <div class="header-right">
                <el-tag :type="transform.valid ? 'success' : 'warning'" size="small">
                  {{ transform.valid ? '结构合法' : '含兜底修正' }}
                </el-tag>
                <div class="zoom-controls">
                  <el-button size="small" @click="zoomOut">-</el-button>
                  <el-button size="small" @click="zoomReset">{{ Math.round(graphScale * 100) }}%</el-button>
                  <el-button size="small" @click="zoomIn">+</el-button>
                </div>
              </div>
            </div>
          </template>

          <div v-if="!transform.graph.steps.length" class="empty-box">暂无流程图</div>
          <div v-else class="graph-stage" @wheel.prevent="onGraphWheel">
            <div class="graph-viewport" :style="{ transform: `scale(${graphScale})` }">
              <svg class="graph-canvas" :viewBox="`0 0 ${graphWidth} ${graphHeight}`" preserveAspectRatio="xMidYMin meet">
                <g v-for="edge in positionedEdges" :key="edge.key">
                  <line :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2" stroke="var(--line)" stroke-width="2" />
                  <text :x="edge.lx" :y="edge.ly" fill="var(--text-soft)" font-size="11">{{ edge.label }}</text>
                </g>
                <g v-for="node in positionedSteps" :key="node.id">
                  <rect
                    :x="node.x - 170"
                    :y="node.y - 30"
                    rx="10"
                    ry="10"
                    width="340"
                    height="60"
                    fill="var(--node-bg)"
                    stroke="var(--node-border)"
                    stroke-width="1.2"
                  />
                  <text :x="node.x - 150" :y="node.y - 7" fill="var(--text-soft)" font-size="11">{{ node.id }}</text>
                  <text :x="node.x" :y="node.y + 12" text-anchor="middle" fill="var(--text-main)" font-size="13">
                    {{ clip(node.action, 34) }}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div v-if="transform.errors.length" class="error-list">
            <div v-for="(item, idx) in transform.errors" :key="idx">- {{ item }}</div>
          </div>
        </el-card>

        <div class="preview-grid">
          <el-card class="panel preview-panel" shadow="never">
            <template #header>
              <div class="panel-header">
                <span>知识块预览</span>
                <el-tag size="small" type="info">{{ payloadCount }} 条</el-tag>
              </div>
            </template>

              <div v-if="!knowledgeReady" class="empty-box">尚未生成知识预览</div>
              <template v-else>
                <div class="stat-strip">
                  <span>embedding: {{ preview.qdrant_preview?.embedding?.success_count || 0 }}/{{ payloadCount }}</span>
                  <span>route: {{ preview.routing?.route_type || '-' }}</span>
                </div>
                <div class="audit-overview">
                  <div class="audit-overview-head">
                    <div>
                      <strong>入库前审核</strong>
                      <span class="audit-overview-meta">高风险 {{ knowledgeReview.high.length }} / 中风险 {{ knowledgeReview.medium.length }} / 低风险 {{ knowledgeReview.low.length }}</span>
                    </div>
                    <el-button size="small" type="primary" plain @click="openKnowledgeAudit">查看审核面板</el-button>
                  </div>
                  <div v-if="knowledgeIssues.length" class="issue-box">
                    <div v-for="(item, idx) in knowledgeIssues.slice(0, 6)" :key="idx">
                      {{ item.type }} | {{ item.chunk_id || item.index }}
                    </div>
                  </div>
                </div>
                <pre>{{ pretty(preview.qdrant_preview?.vector_payloads) }}</pre>
                <div v-if="knowledgeIngestResult" class="result-box">
                  <h3>知识入库结果</h3>
                <pre>{{ pretty(knowledgeIngestResult) }}</pre>
              </div>
            </template>
          </el-card>

          <el-card class="panel preview-panel" shadow="never">
            <template #header>
              <div class="panel-header">
                <span>图谱预览</span>
                <el-tag size="small" type="warning">{{ graphNodeCount }} 节点 / {{ graphRelCount }} 关系</el-tag>
              </div>
            </template>

              <div v-if="!graphReady" class="empty-box">尚未生成图谱预览</div>
              <template v-else>
                <div class="audit-overview">
                  <div class="audit-overview-head">
                    <div>
                      <strong>图谱审核</strong>
                      <span class="audit-overview-meta">高风险 {{ graphReview.high.length }} / 中风险 {{ graphReview.medium.length }} / 低风险 {{ graphReview.low.length }}</span>
                    </div>
                    <el-button size="small" type="warning" plain @click="openGraphAudit">查看图谱审核</el-button>
                  </div>
                  <div v-if="graphAuditIssues.length" class="issue-box">
                    <div v-for="(item, idx) in graphAuditIssues.slice(0, 6)" :key="`graph-${idx}`">
                      {{ item.type }} | {{ item.label || item.detail || item.index }}
                    </div>
                  </div>
                </div>
                <div class="graph-preview-summary">
                  <div>Fault: {{ preview.neo4j_preview?.fault?.name }}</div>
                  <div>chunk_ids: {{ (preview.neo4j_preview?.fault?.chunk_ids || []).join(', ') || '-' }}</div>
              </div>
              <div class="graph-legend">
                <span><i class="legend-dot legend-root"></i> 根节点</span>
                <span><i class="legend-dot legend-fault"></i> 故障节点</span>
                <span><i class="legend-dot legend-step"></i> 流程步骤</span>
                <span><i class="legend-line line-next"></i> NEXT_STEP</span>
                <span><i class="legend-line line-success"></i> IF_SUCCESS</span>
                <span><i class="legend-line line-failed"></i> IF_FAILED</span>
              </div>
              <div class="graph-stage preview-graph-stage">
                <div class="graph-viewport">
                  <svg class="graph-canvas preview-graph-canvas" :viewBox="`0 0 ${previewGraphWidth} ${previewGraphHeight}`" preserveAspectRatio="xMidYMin meet">
                    <defs>
                      <marker id="preview-arrow-next" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#2a6eb6" />
                      </marker>
                      <marker id="preview-arrow-success" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#138a5b" />
                      </marker>
                      <marker id="preview-arrow-failed" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#d64545" />
                      </marker>
                      <marker id="preview-arrow-default" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#6c7a89" />
                      </marker>
                    </defs>
                    <g v-for="edge in previewPositionedEdges" :key="edge.key">
                      <path
                        :d="edge.path"
                        fill="none"
                        :stroke="edge.color"
                        :stroke-width="edge.strokeWidth"
                        :stroke-dasharray="edge.dasharray"
                        :marker-end="edge.marker"
                      />
                      <rect
                        :x="edge.labelX - (edge.labelWidth / 2)"
                        :y="edge.labelY - 10"
                        :width="edge.labelWidth"
                        height="18"
                        rx="9"
                        ry="9"
                        fill="#ffffff"
                        stroke="#d8e1ec"
                      />
                      <text :x="edge.labelX" :y="edge.labelY + 3" text-anchor="middle" fill="#4b6078" font-size="11">
                        {{ edge.label }}
                      </text>
                    </g>
                    <g v-for="node in previewPositionedNodes" :key="node.uid">
                      <rect
                        :x="node.x - (node.width / 2)"
                        :y="node.y - (node.height / 2)"
                        :width="node.width"
                        :height="node.height"
                        rx="16"
                        ry="16"
                        :fill="node.fill"
                        :stroke="node.stroke"
                        :stroke-width="node.borderWidth"
                      />
                      <text :x="node.x" :y="node.y - 10" text-anchor="middle" fill="#587089" font-size="11" font-weight="600">
                        {{ node.badge }}
                      </text>
                      <text :x="node.x" :y="node.y + 10" text-anchor="middle" fill="#10253f" font-size="13" font-weight="600">
                        {{ clip(node.displayText, node.clipLength) }}
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
              <div class="graph-structure-strip">
                <span>入口步骤: {{ previewEntryStepLabels.join(' / ') || '-' }}</span>
                <span>流程边: {{ previewFlowRelCount }}</span>
              </div>
              <pre>{{ pretty({ nodes: preview.neo4j_preview?.nodes, relationships: preview.neo4j_preview?.relationships }) }}</pre>
              <div class="result-box">
                <h3>Cypher 预览</h3>
                <pre>{{ pretty(preview.neo4j_preview?.cypher) }}</pre>
              </div>
              <div v-if="graphIngestResult" class="result-box">
                <h3>图谱入库结果</h3>
                <pre>{{ pretty(graphIngestResult) }}</pre>
              </div>
            </template>
          </el-card>
        </div>
        </div>
      </section>

    <el-drawer v-model="reviewDrawer.visible" :title="reviewDrawer.mode === 'knowledge' ? '知识入库审核' : '图谱入库审核'" size="42%">
      <template v-if="reviewDrawer.mode === 'knowledge'">
        <div class="review-panel">
          <div class="review-summary">
            <el-tag :type="knowledgeRiskTagType">{{ knowledgeRiskLabel }}</el-tag>
            <span>本次预览共 {{ payloadCount }} 条知识块，重复 chunk_id {{ selfCheck?.summary?.duplicate_chunk_id_count || 0 }} 条。</span>
          </div>
          <div class="review-section">
            <div class="review-section-title">审核策略</div>
            <el-radio-group v-model="knowledgeReviewDecision">
              <el-radio label="continue_all">全部继续写入</el-radio>
              <el-radio label="skip_duplicates">跳过疑似重复项</el-radio>
              <el-radio label="only_low_risk">仅写入低风险新增项</el-radio>
              <el-radio label="back_to_edit">返回修改原始文本后重新生成</el-radio>
            </el-radio-group>
          </div>
          <div class="review-section">
            <div class="review-section-title">高风险</div>
            <div v-if="!knowledgeReview.high.length" class="empty-mini">无</div>
            <div v-for="(item, idx) in knowledgeReview.high" :key="`kh-${idx}`" class="review-item review-item-high">
              <div>{{ item.type }} | {{ item.chunk_id || item.index }}</div>
              <div v-if="item.existing_point">相似项：{{ item.existing_point.chunk_id }} / score={{ Number(item.existing_point.score || 0).toFixed(3) }}</div>
            </div>
          </div>
          <div class="review-section">
            <div class="review-section-title">中低风险</div>
            <div v-if="!knowledgeReview.medium.length && !knowledgeReview.low.length" class="empty-mini">无</div>
            <div v-for="(item, idx) in [...knowledgeReview.medium, ...knowledgeReview.low]" :key="`km-${idx}`" class="review-item review-item-medium">
              <div>{{ item.type }} | {{ item.chunk_id || item.index }}</div>
              <div v-if="item.existing_point">相似项：{{ item.existing_point.chunk_id }} / score={{ Number(item.existing_point.score || 0).toFixed(3) }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="review-panel">
          <div class="review-summary">
            <el-tag :type="graphRiskTagType">{{ graphRiskLabel }}</el-tag>
            <span>预览包含 {{ graphNodeCount }} 个节点与 {{ graphRelCount }} 条关系。</span>
          </div>
          <div class="review-section">
            <div class="review-section-title">高风险</div>
            <div v-if="!graphReview.high.length" class="empty-mini">无</div>
            <div v-for="(item, idx) in graphReview.high" :key="`gh-${idx}`" class="review-item review-item-high">
              <div>{{ item.type }}</div>
              <div>{{ item.label || item.detail }}</div>
            </div>
          </div>
          <div class="review-section">
            <div class="review-section-title">中低风险</div>
            <div v-if="!graphReview.medium.length && !graphReview.low.length" class="empty-mini">无</div>
            <div v-for="(item, idx) in [...graphReview.medium, ...graphReview.low]" :key="`gm-${idx}`" class="review-item review-item-medium">
              <div>{{ item.type }}</div>
              <div>{{ item.label || item.detail }}</div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="review-footer">
          <el-button @click="reviewDrawer.visible = false">取消</el-button>
          <el-button
            v-if="reviewDrawer.mode === 'knowledge'"
            type="primary"
            :loading="loadingKnowledgeIngest"
            @click="performKnowledgeIngest"
          >
            确认知识入库
          </el-button>
          <el-button
            v-else
            type="danger"
            :loading="loadingGraphIngest"
            @click="performGraphIngest"
          >
            确认图谱入库
          </el-button>
        </div>
      </template>
    </el-drawer>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const PRESETS = [
  { label: '1档-小', chunkingPreset: 'small', maxVectorChunks: 1 },
  { label: '2档-中', chunkingPreset: 'medium', maxVectorChunks: 3 },
  { label: '3档-大', chunkingPreset: 'large', maxVectorChunks: 6 }
]

const form = reactive({
  text: '',
  title: '',
  presetIndex: 0,
  collectionName: 'final_chunk_knowledge_v1.1'
})

const loadingKnowledge = ref(false)
const loadingKnowledgeIngest = ref(false)
const loadingGraph = ref(false)
const loadingGraphIngest = ref(false)

const graphScale = ref(1)
const graphWidth = 860

const transform = reactive({
  valid: true,
  errors: [],
  graph: {
    steps: [],
    links: []
  }
})

const preview = reactive({
  routing: null,
  metadata: null,
  qdrant_preview: null,
  neo4j_preview: null
})

const selfCheck = ref(null)
const knowledgeIngestResult = ref(null)
const graphIngestResult = ref(null)
const knowledgeReviewDecision = ref('skip_duplicates')
const reviewDrawer = reactive({
  visible: false,
  mode: 'knowledge'
})

const currentPreset = computed(() => PRESETS[form.presetIndex] || PRESETS[1])
const effectiveParams = computed(() => ({ ...currentPreset.value }))
const knowledgeReady = computed(() => !!preview.qdrant_preview?.vector_payloads?.length)
const graphReady = computed(() => !!preview.neo4j_preview?.nodes?.length)
const payloadCount = computed(() => (preview.qdrant_preview?.vector_payloads || []).length)
const graphNodeCount = computed(() => (preview.neo4j_preview?.nodes || []).length)
const graphRelCount = computed(() => (preview.neo4j_preview?.relationships || []).length)
const knowledgeIssues = computed(() => selfCheck.value?.issues || [])
const knowledgeReview = computed(() => selfCheck.value?.review || { high: [], medium: [], low: [], ignorable: [] })
const previewGraphWidth = 980
const knowledgeRiskLabel = computed(() => {
  if (knowledgeReview.value.high.length) return '高风险'
  if (knowledgeReview.value.medium.length) return '中风险'
  if (knowledgeReview.value.low.length) return '低风险'
  return '可直接入库'
})
const knowledgeRiskTagType = computed(() => {
  if (knowledgeReview.value.high.length) return 'danger'
  if (knowledgeReview.value.medium.length) return 'warning'
  if (knowledgeReview.value.low.length) return 'info'
  return 'success'
})

const previewGraphModel = computed(() => {
  const rawNodes = Array.isArray(preview.neo4j_preview?.nodes) ? preview.neo4j_preview.nodes : []
  const rawRelationships = Array.isArray(preview.neo4j_preview?.relationships) ? preview.neo4j_preview.relationships : []
  const nodes = rawNodes.map((node, index) => ({
    ...node,
    uid: String(node?.uid || `node_${index}`),
    label: String(node?.label || 'Unknown'),
    displayText: String(node?.action || node?.name || node?.description || node?.uid || `节点${index + 1}`)
  }))
  const nodeMap = {}
  const outgoingMap = {}
  const incomingCount = {}

  nodes.forEach((node) => {
    nodeMap[node.uid] = node
    outgoingMap[node.uid] = []
    incomingCount[node.uid] = 0
  })

  const relationships = rawRelationships.map((rel, index) => {
    const sourceUid = String(rel?.source?.key?.uid || rel?.source?.key?.name || '')
    const targetUid = String(rel?.target?.key?.uid || rel?.target?.key?.name || '')
    const type = String(rel?.type || rel?.label || 'RELATED')
    return {
      key: `${type}_${sourceUid}_${targetUid}_${index}`,
      type,
      label: String(rel?.label || type),
      sourceUid,
      targetUid
    }
  }).filter((rel) => nodeMap[rel.sourceUid] && nodeMap[rel.targetUid])

  relationships.forEach((rel) => {
    outgoingMap[rel.sourceUid].push(rel)
    incomingCount[rel.targetUid] = (incomingCount[rel.targetUid] || 0) + 1
  })

  const startNodes = nodes
    .filter((node) => !incomingCount[node.uid])
    .sort((a, b) => {
      const order = { Entity: 0, Fault: 1, FaultStep: 2 }
      return (order[a.label] ?? 9) - (order[b.label] ?? 9)
    })

  if (!startNodes.length && nodes.length) startNodes.push(nodes[0])

  const levelMap = {}
  const laneMap = {}
  const queue = startNodes.map((node, idx) => ({ uid: node.uid, level: 0, lane: idx }))
  const visited = new Set()
  const relationOrder = { HAS_FAULT: 0, HAS_STEP: 1, IF_SUCCESS: 2, NEXT_STEP: 3, IF_FAILED: 4 }

  while (queue.length) {
    const current = queue.shift()
    if (!current) break
    const visitKey = `${current.uid}:${current.level}:${current.lane}`
    if (visited.has(visitKey)) continue
    visited.add(visitKey)

    if (!(current.uid in levelMap) || current.level < levelMap[current.uid]) levelMap[current.uid] = current.level
    if (!(current.uid in laneMap)) laneMap[current.uid] = current.lane

    const outgoing = [...(outgoingMap[current.uid] || [])].sort((a, b) => {
      return (relationOrder[a.type] ?? 99) - (relationOrder[b.type] ?? 99)
    })

    const stepFlowEdges = outgoing.filter((item) => ['IF_SUCCESS', 'IF_FAILED', 'NEXT_STEP'].includes(item.type))
    const hasBranchPair = (
      stepFlowEdges.length === 2 &&
      stepFlowEdges.some((item) => item.type === 'IF_SUCCESS') &&
      stepFlowEdges.some((item) => item.type === 'IF_FAILED')
    )

    outgoing.forEach((edge) => {
      let nextLane = laneMap[current.uid]
      if (hasBranchPair) {
        if (edge.type === 'IF_SUCCESS') nextLane = laneMap[current.uid] - 1
        else if (edge.type === 'IF_FAILED') nextLane = laneMap[current.uid] + 1
      }
      if (!(edge.targetUid in laneMap)) laneMap[edge.targetUid] = nextLane
      if (!(edge.targetUid in levelMap) || current.level + 1 < levelMap[edge.targetUid]) levelMap[edge.targetUid] = current.level + 1
      queue.push({ uid: edge.targetUid, level: current.level + 1, lane: laneMap[edge.targetUid] })
    })
  }

  let maxLevel = Object.values(levelMap).length ? Math.max(...Object.values(levelMap)) : 0
  nodes.forEach((node) => {
    if (!(node.uid in levelMap)) {
      maxLevel += 1
      levelMap[node.uid] = maxLevel
      laneMap[node.uid] = 0
    }
  })

  const laneValues = nodes.map((node) => laneMap[node.uid] ?? 0)
  const minLane = laneValues.length ? Math.min(...laneValues) : 0
  const maxLane = laneValues.length ? Math.max(...laneValues) : 0
  const centerLane = (minLane + maxLane) / 2

  const styledNodes = nodes.map((node) => {
    const base = {
      width: node.label === 'FaultStep' ? 260 : 220,
      height: node.label === 'FaultStep' ? 66 : 58,
      clipLength: node.label === 'FaultStep' ? 24 : 20,
      fill: '#f3f7fc',
      stroke: '#8ea4bd',
      borderWidth: 1.3,
      badge: node.label
    }
    if (node.label === 'Entity') {
      base.fill = '#eaf3ff'
      base.stroke = '#5688c7'
      base.badge = 'ROOT'
    } else if (node.label === 'Fault') {
      base.fill = '#fff3df'
      base.stroke = '#d19737'
      base.badge = 'FAULT'
    } else if (node.label === 'FaultStep') {
      base.fill = '#eef8f1'
      base.stroke = '#5da87c'
      base.badge = `STEP ${node.step_id || ''}`.trim()
    }
    return {
      ...node,
      ...base,
      x: previewGraphWidth / 2 + ((laneMap[node.uid] ?? 0) - centerLane) * 240,
      y: 70 + (levelMap[node.uid] ?? 0) * 116
    }
  })

  return { nodes: styledNodes, relationships }
})

const previewGraphHeight = computed(() => {
  const nodes = previewGraphModel.value.nodes
  const maxLevel = nodes.length ? Math.max(...nodes.map((node) => Math.round((node.y - 70) / 116))) : 0
  return Math.max(280, 150 + maxLevel * 120)
})

const previewPositionedNodes = computed(() => previewGraphModel.value.nodes)

const previewPositionedEdges = computed(() => {
  const nodeMap = {}
  previewPositionedNodes.value.forEach((node) => {
    nodeMap[node.uid] = node
  })

  const styleMap = {
    HAS_FAULT: { color: '#7a8a9b', dasharray: '4 4', marker: 'url(#preview-arrow-default)', strokeWidth: 2 },
    HAS_STEP: { color: '#7a8a9b', dasharray: '4 4', marker: 'url(#preview-arrow-default)', strokeWidth: 2 },
    NEXT_STEP: { color: '#2a6eb6', dasharray: '', marker: 'url(#preview-arrow-next)', strokeWidth: 2.6 },
    IF_SUCCESS: { color: '#138a5b', dasharray: '', marker: 'url(#preview-arrow-success)', strokeWidth: 2.6 },
    IF_FAILED: { color: '#d64545', dasharray: '', marker: 'url(#preview-arrow-failed)', strokeWidth: 2.6 }
  }

  return previewGraphModel.value.relationships.map((edge) => {
    const source = nodeMap[edge.sourceUid]
    const target = nodeMap[edge.targetUid]
    if (!source || !target) return null
    const sourceBottom = source.y + (source.height / 2)
    const targetTop = target.y - (target.height / 2)
    const midY = (sourceBottom + targetTop) / 2
    const style = styleMap[edge.type] || styleMap.HAS_STEP
    return {
      ...edge,
      ...style,
      path: `M ${source.x} ${sourceBottom} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${targetTop}`,
      labelX: (source.x + target.x) / 2,
      labelY: midY,
      labelWidth: Math.max(60, edge.label.length * 8 + 20)
    }
  }).filter(Boolean)
})

const previewEntryStepLabels = computed(() => {
  const relationshipList = previewGraphModel.value.relationships
  const nodeMap = {}
  previewGraphModel.value.nodes.forEach((node) => {
    nodeMap[node.uid] = node
  })
  return relationshipList
    .filter((item) => item.type === 'HAS_STEP')
    .map((item) => nodeMap[item.targetUid]?.displayText || item.targetUid)
})

const previewFlowRelCount = computed(() => {
  return previewGraphModel.value.relationships.filter((item) => ['NEXT_STEP', 'IF_SUCCESS', 'IF_FAILED'].includes(item.type)).length
})

const graphAuditIssues = computed(() => {
  const remoteIssues = preview.neo4j_preview?.graph_review?.issues
  if (Array.isArray(remoteIssues) && remoteIssues.length) return remoteIssues
  const issues = []
  const rawNodes = Array.isArray(preview.neo4j_preview?.nodes) ? preview.neo4j_preview.nodes : []
  const rawRelationships = Array.isArray(preview.neo4j_preview?.relationships) ? preview.neo4j_preview.relationships : []
  const nodeNameMap = {}
  rawNodes.forEach((node) => {
    const label = String(node?.label || 'Unknown')
    const text = String(node?.name || node?.action || '').trim().toLowerCase()
    if (!text) return
    const key = `${label}:${text}`
    nodeNameMap[key] = (nodeNameMap[key] || 0) + 1
  })
  Object.entries(nodeNameMap).forEach(([key, count]) => {
    if (count > 1) {
      issues.push({
        type: 'graph_duplicate_node_name',
        level: 'warning',
        label: `${key} 重复 ${count} 次`
      })
    }
  })

  const stepActionMap = {}
  rawNodes.filter((node) => String(node?.label || '') === 'FaultStep').forEach((node) => {
    const text = String(node?.action || node?.name || '').trim().toLowerCase()
    if (!text) return
    stepActionMap[text] = (stepActionMap[text] || 0) + 1
  })
  Object.entries(stepActionMap).forEach(([key, count]) => {
    if (count > 1) {
      issues.push({
        type: 'graph_step_overlap',
        level: 'warning',
        label: `${key} 重复 ${count} 次`
      })
    }
  })

  const entrySteps = rawRelationships.filter((item) => String(item?.type || item?.label || '') === 'HAS_STEP')
  if (entrySteps.length > 1) {
    issues.push({
      type: 'graph_entry_conflict',
      level: 'warning',
      detail: `检测到 ${entrySteps.length} 个入口步骤，请确认是否为同一故障流程`
    })
  }
  return issues
})

const graphReview = computed(() => {
  const remoteReview = preview.neo4j_preview?.graph_review?.review
  if (remoteReview) return remoteReview
  const review = { high: [], medium: [], low: [], ignorable: [] }
  graphAuditIssues.value.forEach((item) => {
    if (item.type === 'graph_duplicate_node_name') review.high.push(item)
    else if (item.type === 'graph_step_overlap' || item.type === 'graph_entry_conflict') review.medium.push(item)
    else review.low.push(item)
  })
  return review
})

const graphRiskLabel = computed(() => {
  if (graphReview.value.high.length) return '高风险'
  if (graphReview.value.medium.length) return '中风险'
  if (graphReview.value.low.length) return '低风险'
  return '可直接入库'
})

const graphRiskTagType = computed(() => {
  if (graphReview.value.high.length) return 'danger'
  if (graphReview.value.medium.length) return 'warning'
  if (graphReview.value.low.length) return 'info'
  return 'success'
})

const graphLayout = computed(() => {
  const steps = transform.graph.steps || []
  const links = transform.graph.links || []
  const nodeMap = {}
  const outgoingMap = {}
  const incomingCount = {}

  steps.forEach((step) => {
    nodeMap[step.id] = step
    outgoingMap[step.id] = []
    incomingCount[step.id] = 0
  })

  links.forEach((link) => {
    if (!nodeMap[link.source] || !nodeMap[link.target]) return
    outgoingMap[link.source].push(link)
    incomingCount[link.target] = (incomingCount[link.target] || 0) + 1
  })

  const startIds = steps
    .filter((step) => !incomingCount[step.id])
    .map((step) => step.id)
  if (!startIds.length && steps.length) startIds.push(steps[0].id)

  const levelMap = {}
  const laneMap = {}
  const queue = startIds.map((id, idx) => ({ id, level: 0, lane: idx }))
  const visited = new Set()

  while (queue.length) {
    const current = queue.shift()
    if (!current) break
    const { id, level, lane } = current

    if (!(id in levelMap) || level < levelMap[id]) levelMap[id] = level
    if (!(id in laneMap)) laneMap[id] = lane
    if (visited.has(`${id}:${level}:${lane}`)) continue
    visited.add(`${id}:${level}:${lane}`)

    const outgoing = [...(outgoingMap[id] || [])].sort((a, b) => {
      const order = { IF_SUCCESS: 0, NEXT_STEP: 1, IF_FAILED: 2 }
      return (order[a.label] ?? 9) - (order[b.label] ?? 9)
    })

    if (outgoing.length === 2 && outgoing.some((item) => item.label === 'IF_SUCCESS') && outgoing.some((item) => item.label === 'IF_FAILED')) {
      outgoing.forEach((edge) => {
        const nextLane = edge.label === 'IF_SUCCESS' ? lane - 1 : lane + 1
        if (!(edge.target in laneMap)) laneMap[edge.target] = nextLane
        if (!(edge.target in levelMap) || level + 1 < levelMap[edge.target]) levelMap[edge.target] = level + 1
        queue.push({ id: edge.target, level: level + 1, lane: laneMap[edge.target] })
      })
      continue
    }

    outgoing.forEach((edge) => {
      if (!(edge.target in laneMap)) laneMap[edge.target] = lane
      if (!(edge.target in levelMap) || level + 1 < levelMap[edge.target]) levelMap[edge.target] = level + 1
      queue.push({ id: edge.target, level: level + 1, lane: laneMap[edge.target] })
    })
  }

  let maxLevel = Object.values(levelMap).length ? Math.max(...Object.values(levelMap)) : 0
  steps.forEach((step) => {
    if (!(step.id in levelMap)) {
      maxLevel += 1
      levelMap[step.id] = maxLevel
      laneMap[step.id] = 0
    }
  })

  const nodes = steps.map((step) => ({
    ...step,
    level: levelMap[step.id] ?? 0,
    lane: laneMap[step.id] ?? 0
  }))

  const laneValues = nodes.map((node) => node.lane)
  const minLane = laneValues.length ? Math.min(...laneValues) : 0
  const maxLane = laneValues.length ? Math.max(...laneValues) : 0
  const centerLane = (minLane + maxLane) / 2

  return nodes.map((node) => ({
    ...node,
    x: graphWidth / 2 + (node.lane - centerLane) * 240,
    y: 60 + node.level * 104
  }))
})

const graphHeight = computed(() => {
  const nodes = graphLayout.value
  const maxLevel = nodes.length ? Math.max(...nodes.map((node) => node.level || 0)) : 0
  return Math.max(240, 120 + maxLevel * 104)
})

const positionedSteps = computed(() => graphLayout.value)

const positionedEdges = computed(() => {
  const nodeMap = {}
  positionedSteps.value.forEach((node) => {
    nodeMap[node.id] = node
  })
  return (transform.graph.links || []).map((edge, idx) => {
    const s = nodeMap[edge.source]
    const t = nodeMap[edge.target]
    if (!s || !t) return null
    return {
      key: `${edge.source}-${edge.target}-${idx}`,
      x1: s.x,
      y1: s.y + 30,
      x2: t.x,
      y2: t.y - 30,
      lx: s.x + 10,
      ly: (s.y + t.y) / 2,
      label: edge.label || 'NEXT_STEP'
    }
  }).filter(Boolean)
})

function pretty(value) {
  return JSON.stringify(value || {}, null, 2)
}

function clip(text, len) {
  const raw = String(text || '')
  return raw.length > len ? `${raw.slice(0, len)}...` : raw
}

function fillDemo() {
  form.text = '设备无法启动时，先检查电源指示灯；若指示灯正常则检查急停是否复位；若急停未复位则先复位；若仍失败则检查保险丝并更换；成功后重新启动设备。'
  form.title = '设备无法启动'
}

function zoomIn() {
  graphScale.value = Math.min(2.2, Number((graphScale.value + 0.1).toFixed(2)))
}

function zoomOut() {
  graphScale.value = Math.max(0.5, Number((graphScale.value - 0.1).toFixed(2)))
}

function zoomReset() {
  graphScale.value = 1
}

function onGraphWheel(e) {
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

async function ensureTransform() {
  if (transform.graph.steps.length) return
  const { data } = await http.post('/kb/extractor/transform', { text: form.text })
  transform.valid = !!data.valid
  transform.errors = data.errors || []
  transform.graph = data.graph || { steps: [], links: [] }
  zoomReset()
}

async function runPreviewRequest() {
  const { data } = await http.post('/kb/extractor/ingest-preview', {
    text: form.text,
    title: form.title,
    transform_graph: transform.graph.steps.length ? transform.graph : undefined,
    chunking_preset: effectiveParams.value.chunkingPreset,
    max_vector_chunks: effectiveParams.value.maxVectorChunks,
    include_embedding: true
  })
  preview.routing = data.routing
  preview.metadata = data.metadata
  preview.qdrant_preview = data.qdrant_preview
  preview.neo4j_preview = data.neo4j_preview
  transform.valid = !!data.transform?.valid
  transform.errors = data.transform?.errors || []
  transform.graph = data.transform?.graph || transform.graph
}

async function runSelfCheckQuietly() {
  const payloads = preview.qdrant_preview?.vector_payloads || []
  if (!payloads.length) {
    selfCheck.value = null
    return
  }
  const { data } = await http.post('/kb/extractor/self-check', {
    collection_name: form.collectionName,
    vector_payloads: payloads
  })
  selfCheck.value = data
}

async function ensureKnowledgeAudit() {
  if (!knowledgeReady.value) {
    ElMessage.warning('请先生成知识预览')
    return false
  }
  await runSelfCheckQuietly()
  return true
}

function openKnowledgeAudit() {
  if (!knowledgeReady.value) {
    ElMessage.warning('请先生成知识预览')
    return
  }
  ensureKnowledgeAudit().then((ok) => {
    if (!ok) return
    reviewDrawer.mode = 'knowledge'
    reviewDrawer.visible = true
  })
}

function openGraphAudit() {
  if (!graphReady.value) {
    ElMessage.warning('请先生成图谱预览')
    return
  }
  reviewDrawer.mode = 'graph'
  reviewDrawer.visible = true
}

function buildKnowledgeIngestPlan() {
  const payloads = preview.qdrant_preview?.vector_payloads || []
  const highRiskIndexes = new Set(knowledgeReview.value.high.map((item) => item.index).filter((item) => item >= 0))
  const mediumRiskIndexes = new Set(knowledgeReview.value.medium.map((item) => item.index).filter((item) => item >= 0))
  const duplicateIndexes = new Set(
    [...knowledgeReview.value.high, ...knowledgeReview.value.medium]
      .filter((item) => ['chunk_id_already_exists', 'high_similarity_existing', 'similar_topic_candidate'].includes(item.type))
      .map((item) => item.index)
      .filter((item) => item >= 0)
  )

  if (knowledgeReviewDecision.value === 'only_low_risk') {
    return {
      vector_payloads: payloads.filter((_, idx) => !highRiskIndexes.has(idx) && !mediumRiskIndexes.has(idx)),
      skip_duplicate_chunk_ids: false,
      skip_high_similarity_indexes: [],
      allow_conflict_write: false
    }
  }

  if (knowledgeReviewDecision.value === 'skip_duplicates') {
    return {
      vector_payloads: payloads,
      skip_duplicate_chunk_ids: true,
      skip_high_similarity_indexes: [...duplicateIndexes],
      allow_conflict_write: false
    }
  }

  return {
    vector_payloads: payloads,
    skip_duplicate_chunk_ids: false,
    skip_high_similarity_indexes: [],
    allow_conflict_write: true
  }
}

async function generateKnowledge() {
  if (!form.text.trim()) {
    ElMessage.warning('请先输入文本')
    return
  }
  loadingKnowledge.value = true
  try {
    await ensureTransform()
    await runPreviewRequest()
    await runSelfCheckQuietly()
    knowledgeIngestResult.value = null
    graphIngestResult.value = null
    ElMessage.success(`知识预览已生成，共 ${payloadCount.value} 条`)
  } catch (err) {
    ElMessage.error(`生成知识失败：${err?.response?.data?.detail || err.message}`)
  } finally {
    loadingKnowledge.value = false
  }
}

async function ingestKnowledge() {
  const payloads = preview.qdrant_preview?.vector_payloads || []
  if (!payloads.length) {
    ElMessage.warning('没有可入库的知识块')
    return
  }
  openKnowledgeAudit()
}

async function performKnowledgeIngest() {
  if (knowledgeReviewDecision.value === 'back_to_edit') {
    reviewDrawer.visible = false
    ElMessage.info('已返回编辑状态，请修改原始文本后重新生成')
    return
  }

  const ingestPlan = buildKnowledgeIngestPlan()
  if (!ingestPlan.vector_payloads.length) {
    ElMessage.warning('当前策略下没有可入库的低风险新增项')
    return
  }
  loadingKnowledgeIngest.value = true
  try {
    const { data } = await http.post('/kb/extractor/batch-ingest', {
      collection_name: form.collectionName,
      vector_payloads: ingestPlan.vector_payloads,
      dry_run: false,
      skip_duplicate_chunk_ids: ingestPlan.skip_duplicate_chunk_ids,
      skip_high_similarity_indexes: ingestPlan.skip_high_similarity_indexes,
      allow_conflict_write: ingestPlan.allow_conflict_write
    })
    knowledgeIngestResult.value = data
    reviewDrawer.visible = false
    if (data.ok) ElMessage.success(`知识入库完成：${data.summary?.ready_or_inserted || 0} 条`)
    else ElMessage.warning(`知识入库部分失败：${data.summary?.failed || 0} 条，跳过 ${data.summary?.skipped || 0} 条`)
  } catch (err) {
    ElMessage.error(`知识入库失败：${err?.response?.data?.detail || err.message}`)
  } finally {
    loadingKnowledgeIngest.value = false
  }
}

async function generateGraph() {
  if (!form.text.trim()) {
    ElMessage.warning('请先输入文本')
    return
  }
  loadingGraph.value = true
  try {
    await ensureTransform()
    await runPreviewRequest()
    graphIngestResult.value = null
    ElMessage.success(`图谱预览已生成，包含 ${graphNodeCount.value} 个节点`)
  } catch (err) {
    ElMessage.error(`生成图谱失败：${err?.response?.data?.detail || err.message}`)
  } finally {
    loadingGraph.value = false
  }
}

async function ingestGraph() {
  if (!preview.neo4j_preview?.cypher?.length) {
    ElMessage.warning('没有可入库的图谱结构')
    return
  }
  openGraphAudit()
}

async function performGraphIngest() {
  loadingGraphIngest.value = true
  try {
    const { data } = await http.post('/kb/extractor/graph-ingest', {
      preview: preview.neo4j_preview,
      dry_run: false,
      allow_conflict_write: false
    })
    graphIngestResult.value = data
    if (data.blocked) {
      ElMessage.warning(`图谱入库已被审核拦截：高风险 ${data.graph_review?.summary?.high_risk_count || 0} 项`)
      return
    }
    reviewDrawer.visible = false
    if (data.ok) ElMessage.success(`图谱入库完成：执行 ${data.summary?.executed || 0} 条语句`)
    else ElMessage.warning(`图谱入库部分失败：${data.summary?.failed || 0} 条`)
  } catch (err) {
    ElMessage.error(`图谱入库失败：${err?.response?.data?.detail || err.message}`)
  } finally {
    loadingGraphIngest.value = false
  }
}
</script>

<style scoped>
.extractor-page {
  --bg-main: #f4f7fb;
  --bg-card: #ffffff;
  --line: #2a6eb6;
  --line-soft: #c9d8eb;
  --text-main: #10253f;
  --text-soft: #506b88;
  --node-bg: #eef5ff;
  --node-border: #77a8e0;

  min-height: 100%;
  padding: 20px;
  background:
    radial-gradient(circle at 0 0, rgba(63, 125, 201, 0.16), transparent 28%),
    radial-gradient(circle at 100% 100%, rgba(23, 149, 94, 0.12), transparent 24%),
    var(--bg-main);
  color: var(--text-main);
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.hero {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff, #eef5ff);
  border: 1px solid var(--line-soft);
}

.hero-title-area {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.hero h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.hero-subtitle {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
}

.workspace {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.panel {
  border-radius: 16px;
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.96);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 600;
}

.graph-preview-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-bottom: 12px;
  color: var(--text-soft);
  font-size: 13px;
}

.graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 12px;
  color: var(--text-soft);
  font-size: 12px;
}

.graph-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-root {
  background: #5688c7;
}

.legend-fault {
  background: #d19737;
}

.legend-step {
  background: #5da87c;
}

.legend-line {
  width: 18px;
  height: 0;
  border-top: 3px solid currentColor;
  border-radius: 999px;
  display: inline-block;
}

.line-next {
  color: #2a6eb6;
}

.line-success {
  color: #138a5b;
}

.line-failed {
  color: #d64545;
}

.preview-graph-stage {
  margin-bottom: 12px;
  overflow: auto;
}

.preview-graph-canvas {
  min-width: 100%;
}

.graph-structure-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7fafc;
  color: var(--text-soft);
  font-size: 13px;
  border: 1px solid #dbe6f1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.input-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 14px;
}

.text-pane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.title-input {
  flex-shrink: 0;
}

.control-pane {
  display: grid;
  gap: 12px;
  align-content: start;
}

.compact-panel :deep(.el-card__body) {
  padding-top: 14px;
}

.compact-fields,
.compact-actions {
  margin-top: 0;
}

.preset-compact {
  display: flex;
  align-items: center;
  gap: 6px;
}

.preset-label {
  font-size: 13px;
  color: var(--text-soft);
}

.hint-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint-row code {
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef4fb;
  color: #33577d;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.result-column {
  display: grid;
  gap: 14px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.preview-panel pre,
.result-box pre {
  margin: 0;
  padding: 14px;
  border-radius: 12px;
  background: #0f1a28;
  color: #dbe8fb;
  overflow: auto;
  max-height: 460px;
  font-size: 12px;
  line-height: 1.55;
}

.graph-stage {
  overflow: auto;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff, #eef4fc);
  border: 1px solid #dae6f5;
  max-height: 520px;
}

.graph-viewport {
  transform-origin: top center;
  transition: transform 0.15s ease;
}

.graph-canvas {
  width: 100%;
  min-width: 820px;
  height: auto;
  display: block;
}

.empty-box {
  padding: 28px 16px;
  border-radius: 14px;
  text-align: center;
  color: var(--text-soft);
  background: #f8fbff;
  border: 1px dashed #d2e1f2;
}

.error-list,
.issue-box,
.result-box,
.graph-preview-summary,
.stat-strip {
  margin-top: 14px;
}

.error-list,
.issue-box {
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff8ec;
  color: #8b5b00;
  border: 1px solid #f1d599;
  font-size: 13px;
}

.graph-preview-summary,
.stat-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f5f9ff;
  border: 1px solid #dbe7f5;
  color: #476684;
}

.audit-overview {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid #dbe7f5;
}

.audit-overview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.audit-overview-meta {
  margin-left: 10px;
  font-size: 12px;
  color: #587089;
}

.review-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f5f9ff;
  border: 1px solid #dbe7f5;
  color: #476684;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #18324d;
}

.review-item {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.review-item-high {
  background: #fff3f1;
  border: 1px solid #f3c7c0;
  color: #9f2f21;
}

.review-item-medium {
  background: #fff8ec;
  border: 1px solid #f1d599;
  color: #8b5b00;
}

.empty-mini {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f9fc;
  color: #6a7f95;
}

.review-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.zoom-controls {
  display: flex;
  gap: 6px;
}

@media (max-width: 1200px) {
  .input-grid,
  .preview-grid,
  .field-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
  }

  .action-row {
    grid-template-columns: 1fr;
  }
}

.extractor-page {
  --bg-main: #f4efe6;
  --bg-card: rgba(255, 251, 246, 0.94);
  --line: #1f6259;
  --line-soft: rgba(65, 88, 80, 0.16);
  --text-main: #1b2a25;
  --text-soft: #52635d;
  --node-bg: #eef4f0;
  --node-border: rgba(31, 98, 89, 0.28);
  background:
    radial-gradient(circle at top left, rgba(31, 98, 89, 0.1), transparent 24%),
    radial-gradient(circle at bottom right, rgba(180, 107, 49, 0.12), transparent 22%),
    linear-gradient(180deg, #f4efe6 0%, #f7f3ec 100%);
}

.hero {
  padding: 10px 14px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.92), rgba(246, 240, 232, 0.82));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.hero h1 {
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 18px;
}

.hero-subtitle {
  font-size: 12px;
  color: var(--text-soft);
}

.panel {
  border-radius: 22px;
  border-color: rgba(65, 88, 80, 0.12);
  background: rgba(255, 251, 246, 0.9);
  box-shadow: var(--shadow-sm);
}

.graph-stage,
.empty-box,
.graph-structure-strip,
.graph-preview-summary,
.stat-strip,
.audit-overview,
.review-summary {
  border-color: rgba(65, 88, 80, 0.12);
}

.graph-stage,
.empty-box,
.graph-structure-strip,
.graph-preview-summary,
.stat-strip,
.audit-overview {
  background: rgba(255, 251, 246, 0.76);
}

.preview-panel pre,
.result-box pre {
  background: #21312d;
  color: #edf4f1;
}
</style>

