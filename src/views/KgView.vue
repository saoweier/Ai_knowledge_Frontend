<template>
  <div class="kg-page">
    <section class="kg-canvas-panel">
      <div class="kg-topbar">
        <div class="kg-topbar-main">
          <div>
            <p class="eyebrow">KnowGraph 一期</p>
            <h1>故障诊断图谱治理工作台</h1>
          </div>
          <div class="kg-topbar-actions">
            <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark">
              {{ isConnected ? 'Neo4j 已连接' : 'Neo4j 未连接' }}
            </el-tag>
            <el-button :loading="isConnecting" type="primary" @click="connectToDatabase">
              {{ isConnected ? '刷新连接' : '连接图谱服务' }}
            </el-button>
            <el-button :disabled="!isConnected" :loading="isScanning" @click="refreshDashboard">
              刷新总览
            </el-button>
          </div>
        </div>

        <div class="kg-stats-grid">
          <button class="stat-card" type="button" @click="setActiveTab('overview')">
            <span class="stat-label">总节点数</span>
            <strong>{{ overviewStats.nodes }}</strong>
          </button>
          <button class="stat-card" type="button" @click="setActiveTab('overview')">
            <span class="stat-label">总关系数</span>
            <strong>{{ overviewStats.relationships }}</strong>
          </button>
          <button class="stat-card stat-card-warning" type="button" @click="jumpToGovernance('root')">
            <span class="stat-label">根节点错放</span>
            <strong>{{ overviewStats.root_anomaly_count }}</strong>
          </button>
          <button class="stat-card stat-card-warning" type="button" @click="jumpToGovernance('orphans')">
            <span class="stat-label">孤立节点</span>
            <strong>{{ overviewStats.orphan_count }}</strong>
          </button>
          <button class="stat-card stat-card-accent" type="button" @click="jumpToGovernance('unmapped')">
            <span class="stat-label">断链 / 重复映射</span>
            <strong>{{ overviewStats.unmapped_count }}</strong>
          </button>
          <button class="stat-card stat-card-danger" type="button" @click="jumpToGovernance('steps')">
            <span class="stat-label">步骤异常</span>
            <strong>{{ overviewStats.invalid_step_count }}</strong>
          </button>
        </div>
      </div>

      <div class="kg-graph-shell">
        <div id="graph-container" ref="graphContainerRef" />
        <div v-if="!isConnected" class="kg-overlay">
          <el-empty description="先连接后端图谱服务，再加载治理视图">
            <el-button type="primary" @click="connectToDatabase">连接图谱服务</el-button>
          </el-empty>
        </div>
      </div>
    </section>

    <aside class="kg-sidebar">
      <el-tabs v-model="activeTab" class="kg-tabs">
        <el-tab-pane label="总览" name="overview">
          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>全局状态</span>
                <el-tag size="small" :type="isConnected ? 'success' : 'info'">
                  {{ isConnected ? '服务可用' : '待连接' }}
                </el-tag>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item">
                <span>默认知识库</span>
                <strong>{{ overviewStats.collection_name || '-' }}</strong>
              </div>
              <div class="info-item">
                <span>故障节点数</span>
                <strong>{{ overviewStats.root_fault_count }}</strong>
              </div>
            </div>
            <div class="overview-actions">
              <el-button :disabled="!isConnected" :loading="isScanning" @click="refreshDashboard">
                异常扫描
              </el-button>
              <el-button :disabled="!isConnected" type="primary" @click="runMainlineQuery">
                加载主链路
              </el-button>
            </div>
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>异常概览</span>
                <el-tag size="small" type="warning">{{ governanceTotal }} 项</el-tag>
              </div>
            </template>
            <div class="overview-list">
              <button class="overview-row" type="button" @click="jumpToGovernance('root')">
                <span>根节点污染</span>
                <strong>{{ governance.rootAnomalies.length }}</strong>
              </button>
              <button class="overview-row" type="button" @click="jumpToGovernance('orphans')">
                <span>孤立节点</span>
                <strong>{{ governance.orphans.length }}</strong>
              </button>
              <button class="overview-row" type="button" @click="jumpToGovernance('unmapped')">
                <span>映射断链/重复</span>
                <strong>{{ governance.unmapped.length }}</strong>
              </button>
              <button class="overview-row" type="button" @click="jumpToGovernance('steps')">
                <span>步骤结构异常</span>
                <strong>{{ governance.invalidSteps.length }}</strong>
              </button>
            </div>
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <span>视图范围</span>
            </template>
            <div class="preset-list">
              <el-button :disabled="!isConnected" @click="runMainlineQuery">故障诊断主链路</el-button>
              <el-button :disabled="!isConnected" @click="runFaultQuery">Fault + Step</el-button>
              <el-button :disabled="!isConnected" @click="runAllQuery">全图采样</el-button>
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="查询与治理" name="governance">
          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>图谱查询</span>
                <el-button link :disabled="!isConnected" @click="runQuery">执行</el-button>
              </div>
            </template>
            <el-form :disabled="!isConnected" label-width="80px">
              <el-form-item label="视图">
                <el-select v-model="queryPreset" style="width: 100%">
                  <el-option label="故障诊断主链路" value="mainline" />
                  <el-option label="Fault + Step" value="faults" />
                  <el-option label="全图采样" value="all" />
                </el-select>
              </el-form-item>
              <el-form-item label="标签">
                <el-select v-model="searchType" style="width: 100%" clearable>
                  <el-option label="全部" value="all" />
                  <el-option v-for="label in allNodeLabels" :key="label" :label="label" :value="label" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="searchKeyword" placeholder="按 name / description / chunk_ids 过滤" />
              </el-form-item>
            </el-form>
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>根节点污染</span>
                <el-tag size="small" type="warning">{{ governance.rootAnomalies.length }}</el-tag>
              </div>
            </template>
            <div v-if="governance.rootAnomalies.length" class="issue-list">
              <button
                v-for="item in governance.rootAnomalies"
                :key="`root-${item.node.id}`"
                class="issue-item"
                type="button"
                @click="inspectGovernanceNode(item.node.id)"
              >
                <strong>{{ getNodeTitle(item.node) }}</strong>
                <span>{{ item.node.labels.join(', ') }}</span>
                <small class="issue-hint">{{ getGovernanceIssueHint(item, 'root') }}</small>
              </button>
            </div>
            <el-empty v-else description="未发现根节点错放" />
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>孤立节点</span>
                <el-tag size="small">{{ governance.orphans.length }}</el-tag>
              </div>
            </template>
            <div v-if="governance.orphans.length" class="issue-list">
              <button
                v-for="item in governance.orphans"
                :key="`orphan-${item.node.id}`"
                class="issue-item"
                type="button"
                @click="inspectGovernanceNode(item.node.id)"
              >
                <strong>{{ getNodeTitle(item.node) }}</strong>
                <span>{{ item.node.labels.join(', ') }}</span>
                <small class="issue-hint">{{ getGovernanceIssueHint(item, 'orphans') }}</small>
              </button>
            </div>
            <el-empty v-else description="未发现孤立节点" />
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>映射断链</span>
                <el-tag size="small" type="danger">{{ governance.unmapped.length }}</el-tag>
              </div>
            </template>
            <div v-if="governance.unmapped.length" class="issue-list">
              <button
                v-for="item in governance.unmapped"
                :key="`map-${item.node.id}`"
                class="issue-item"
                type="button"
                @click="inspectGovernanceNode(item.node.id)"
              >
                <strong>{{ getNodeTitle(item.node) }}</strong>
                <span>{{ item.mapping_status }} / {{ formatChunkIds(item.chunk_ids) }}</span>
                <small class="issue-hint">{{ getGovernanceIssueHint(item, 'unmapped') }}</small>
              </button>
            </div>
            <el-empty v-else description="未发现断链或重复映射" />
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <div class="card-header">
                <span>步骤结构异常</span>
                <el-tag size="small" type="danger">{{ governance.invalidSteps.length }}</el-tag>
              </div>
            </template>
            <div v-if="governance.invalidSteps.length" class="issue-list">
              <button
                v-for="item in governance.invalidSteps"
                :key="`step-${item.type}-${item.node.id}`"
                class="issue-item"
                type="button"
                @click="inspectGovernanceNode(item.node.id)"
              >
                <strong>{{ getNodeTitle(item.node) }}</strong>
                <span>{{ governanceReasonLabel(item.reason) }}</span>
                <small class="issue-hint">{{ getGovernanceIssueHint(item, 'steps') }}</small>
              </button>
            </div>
            <el-empty v-else description="未发现步骤结构异常" />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="编辑" name="edit" :disabled="!isConnected">
          <el-card shadow="never" class="kg-card">
            <template #header>
              <span>添加节点</span>
            </template>
            <el-form :model="newNode" :disabled="!isConnected" label-width="70px">
              <el-form-item label="类型" required>
                <el-input v-model="newNode.label" placeholder="例如 Fault / FaultStep / Entity" />
              </el-form-item>
              <el-form-item label="属性">
                <div class="property-list">
                  <div v-for="(prop, index) in newNode.properties" :key="index" class="property-row">
                    <el-select
                      v-model="prop.key"
                      filterable
                      allow-create
                      placeholder="属性名"
                      style="width: 120px"
                    >
                      <el-option label="name" value="name" />
                      <el-option label="description" value="description" />
                      <el-option label="step_id" value="step_id" />
                      <el-option label="step_order" value="step_order" />
                      <el-option label="action" value="action" />
                      <el-option label="chunk_ids" value="chunk_ids" />
                      <el-option label="image_path" value="image_path" />
                    </el-select>
                    <el-select v-model="prop.type" style="width: 88px">
                      <el-option label="文本" value="string" />
                      <el-option label="数组" value="array" />
                      <el-option label="数字" value="number" />
                      <el-option label="布尔" value="boolean" />
                    </el-select>
                    <el-input
                      v-model="prop.value"
                      :placeholder="getPlaceholderByType(prop.type)"
                      style="flex: 1"
                    />
                    <el-button
                      :icon="DeleteIcon"
                      circle
                      type="danger"
                      plain
                      :disabled="newNode.properties.length === 1"
                      @click="removeNodeProperty(index)"
                    />
                  </div>
                  <el-button :icon="PlusIcon" plain style="width: 100%" @click="addNodeProperty">
                    添加属性
                  </el-button>
                </div>
              </el-form-item>
              <el-button type="success" :loading="isAdding" style="width: 100%" @click="addNode">
                添加节点
              </el-button>
            </el-form>
          </el-card>

          <el-card shadow="never" class="kg-card">
            <template #header>
              <span>添加关系</span>
            </template>
            <el-form :model="newRelationship" :disabled="!isConnected" label-width="82px">
              <el-form-item label="源节点ID" required>
                <el-input v-model="newRelationship.fromId" />
              </el-form-item>
              <el-form-item label="目标节点ID" required>
                <el-input v-model="newRelationship.toId" />
              </el-form-item>
              <el-form-item label="关系类型" required>
                <el-select v-model="newRelationship.type" filterable allow-create style="width: 100%">
                  <el-option label="HAS_FAULT" value="HAS_FAULT" />
                  <el-option label="HAS_STEP" value="HAS_STEP" />
                  <el-option label="NEXT_STEP" value="NEXT_STEP" />
                  <el-option label="IF_SUCCESS" value="IF_SUCCESS" />
                  <el-option label="IF_FAILED" value="IF_FAILED" />
                </el-select>
              </el-form-item>
              <el-button :loading="isAdding" type="success" style="width: 100%" @click="addRelationship">
                添加关系
              </el-button>
            </el-form>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="节点详情" name="details">
          <div v-if="selectedNode" class="details-stack">
            <el-card shadow="never" class="kg-card">
              <template #header>
                <div class="card-header">
                  <span>{{ getNodeTitle(selectedNode) }}</span>
                  <div class="detail-actions">
                    <el-button v-if="!isEditingNode" size="small" type="primary" @click="startEditNode">
                      编辑
                    </el-button>
                    <el-button v-if="isEditingNode" size="small" type="success" :loading="isAdding" @click="saveNodeChanges">
                      保存
                    </el-button>
                    <el-button v-if="isEditingNode" size="small" @click="cancelEditNode">取消</el-button>
                  </div>
                </div>
              </template>
              <div v-if="!isEditingNode" class="details-block">
                <div class="info-grid">
                  <div class="info-item">
                    <span>节点 ID</span>
                    <strong>{{ selectedNode.id }}</strong>
                  </div>
                  <div class="info-item">
                    <span>标签</span>
                    <strong>{{ selectedNode.labels.join(', ') }}</strong>
                  </div>
                </div>

                <div class="properties-display">
                  <div v-for="(value, key) in selectedNode.properties" :key="key" class="property-display-item">
                    <span class="property-key">{{ key }}</span>
                    <span class="property-value">{{ formatValue(value) }}</span>
                  </div>
                </div>

                <div class="action-row">
                  <el-button type="danger" @click="deleteSelectedNode">删除节点</el-button>
                  <el-button :disabled="!isConnected" @click="loadConnectedNodes(selectedNode.id)">
                    展开一跳关系
                  </el-button>
                </div>
              </div>

              <div v-else class="details-block">
                <el-form :model="editingNode" label-width="70px">
                  <el-form-item label="类型" required>
                    <el-select v-model="editingNode.labels[0]" filterable allow-create style="width: 100%">
                      <el-option v-for="label in allNodeLabels" :key="label" :label="label" :value="label" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="属性">
                    <div class="property-list">
                      <div v-for="(prop, index) in editingNode.properties" :key="index" class="property-row">
                        <el-select v-model="prop.key" filterable allow-create placeholder="属性名" style="width: 120px">
                          <el-option label="name" value="name" />
                          <el-option label="description" value="description" />
                          <el-option label="step_id" value="step_id" />
                          <el-option label="step_order" value="step_order" />
                          <el-option label="action" value="action" />
                          <el-option label="chunk_ids" value="chunk_ids" />
                          <el-option label="image_path" value="image_path" />
                        </el-select>
                        <el-select v-model="prop.type" style="width: 88px">
                          <el-option label="文本" value="string" />
                          <el-option label="数组" value="array" />
                          <el-option label="数字" value="number" />
                          <el-option label="布尔" value="boolean" />
                        </el-select>
                        <el-input v-model="prop.value" style="flex: 1" />
                        <el-button
                          :icon="DeleteIcon"
                          circle
                          type="danger"
                          plain
                          :disabled="editingNode.properties.length === 1"
                          @click="removeEditingProperty(index)"
                        />
                      </div>
                      <el-button :icon="PlusIcon" plain style="width: 100%" @click="addEditingProperty">
                        添加属性
                      </el-button>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>

            <el-card shadow="never" class="kg-card">
              <template #header>
                <div class="card-header">
                  <span>结构诊断</span>
                  <el-tag :type="mappingDetails?.structure?.is_valid ? 'success' : 'danger'">
                    {{ mappingDetails?.structure?.is_valid ? '合规' : '异常' }}
                  </el-tag>
                </div>
              </template>
              <div class="tag-group">
                <el-tag v-for="tag in getAnomalyTags(selectedNode.id)" :key="tag" type="warning" effect="plain">
                  {{ tag }}
                </el-tag>
                <el-tag
                  v-for="issue in mappingDetails?.structure?.issues || []"
                  :key="issue"
                  type="danger"
                  effect="plain"
                >
                  {{ issue }}
                </el-tag>
                <span v-if="!getAnomalyTags(selectedNode.id).length && !(mappingDetails?.structure?.issues || []).length" class="muted">
                  未发现结构异常
                </span>
              </div>
            </el-card>

            <el-card shadow="never" class="kg-card">
              <template #header>
                <span>修复路线</span>
              </template>
              <div v-if="selectedRepairPlans.length" class="repair-plan-list">
                <section v-for="plan in selectedRepairPlans" :key="plan.key" class="repair-plan-card">
                  <div class="repair-plan-head">
                    <div>
                      <strong>{{ plan.title }}</strong>
                      <p class="repair-plan-summary">{{ plan.summary }}</p>
                    </div>
                    <el-tag :type="plan.tagType" effect="plain">{{ plan.levelText }}</el-tag>
                  </div>
                  <ol class="repair-step-list">
                    <li v-for="step in plan.steps" :key="step">{{ step }}</li>
                  </ol>
                  <div class="action-row">
                    <el-button
                      v-for="action in plan.actions"
                      :key="`${plan.key}-${action.label}`"
                      size="small"
                      :type="action.type || 'primary'"
                      plain
                      @click="runRepairAction(action)"
                    >
                      {{ action.label }}
                    </el-button>
                  </div>
                </section>
              </div>
              <el-empty v-else description="当前节点暂无可执行的修复路线" />
            </el-card>

            <el-card shadow="never" class="kg-card">
              <template #header>
                <div class="card-header">
                  <span>知识映射</span>
                  <el-tag :type="mappingStatusTagType(mappingDetails?.mapping_status)">
                    {{ mappingDetails?.mapping_status || 'unknown' }}
                  </el-tag>
                </div>
              </template>
              <div v-if="isLoadingMapping" class="loading-state">
                <el-skeleton :rows="4" animated />
              </div>
              <div v-else-if="mappingDetails" class="mapping-stack">
                <div class="info-item">
                  <span>chunk_ids</span>
                  <strong>{{ formatChunkIds(mappingDetails.chunk_ids) }}</strong>
                </div>
                <div
                  v-for="match in mappingDetails.qdrant_matches || []"
                  :key="match.chunk_id"
                  class="mapping-card"
                >
                  <div class="mapping-head">
                    <strong>{{ match.chunk_id }}</strong>
                    <el-tag :type="mappingStatusTagType(match.status)">{{ match.status }}</el-tag>
                  </div>
                  <p class="mapping-summary">
                    {{ match.points?.[0]?.summary || '未找到可预览内容' }}
                  </p>
                  <div class="tag-group">
                    <el-tag v-for="point in match.points || []" :key="point.point_id" size="small" effect="plain">
                      point {{ point.point_id }}
                    </el-tag>
                  </div>
                </div>
                <div v-if="!(mappingDetails.qdrant_matches || []).length" class="muted">
                  当前节点没有 chunk_ids。
                </div>
              </div>
            </el-card>

            <el-card shadow="never" class="kg-card">
              <template #header>
                <span>关系联查</span>
              </template>
              <div class="relation-columns">
                <div class="relation-column">
                  <h4>父节点</h4>
                  <button
                    v-for="parent in mappingDetails?.parents || []"
                    :key="`parent-${parent.relation.id}`"
                    class="relation-item"
                    type="button"
                    @click="inspectGovernanceNode(parent.node.id)"
                  >
                    <strong>{{ parent.relation.type }}</strong>
                    <span>{{ getNodeTitle(parent.node) }}</span>
                  </button>
                  <div v-if="!(mappingDetails?.parents || []).length" class="muted">无父节点</div>
                </div>
                <div class="relation-column">
                  <h4>子节点</h4>
                  <button
                    v-for="child in mappingDetails?.children || []"
                    :key="`child-${child.relation.id}`"
                    class="relation-item"
                    type="button"
                    @click="inspectGovernanceNode(child.node.id)"
                  >
                    <strong>{{ child.relation.type }}</strong>
                    <span>{{ getNodeTitle(child.node) }}</span>
                  </button>
                  <div v-if="!(mappingDetails?.children || []).length" class="muted">无子节点</div>
                </div>
              </div>
            </el-card>
          </div>

          <el-empty v-else description="点击画布节点或异常列表，查看节点详情和知识映射" />
        </el-tab-pane>
      </el-tabs>
    </aside>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Delete as DeleteIcon, Plus as PlusIcon } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';

import http from '@/api/http';

const activeTab = ref('overview');
const isConnecting = ref(false);
const isConnected = ref(false);
const isQuerying = ref(false);
const isScanning = ref(false);
const isAdding = ref(false);
const isLoadingMapping = ref(false);

const selectedNode = ref(null);
const mappingDetails = ref(null);
const allNodeLabels = ref([]);
const expandedNodes = ref(new Set());

const overviewStats = reactive({
  nodes: 0,
  relationships: 0,
  root_fault_count: 0,
  orphan_count: 0,
  root_anomaly_count: 0,
  unmapped_count: 0,
  invalid_step_count: 0,
  collection_name: '',
});

const governance = reactive({
  rootAnomalies: [],
  orphans: [],
  unmapped: [],
  invalidSteps: [],
});

const queryPreset = ref('mainline');
const searchType = ref('all');
const searchKeyword = ref('');

const isEditingNode = ref(false);
const editingNode = reactive({
  id: '',
  labels: [],
  properties: [],
});

const newNode = reactive({
  label: '',
  properties: [{ key: 'name', value: '', type: 'string' }],
});

const newRelationship = reactive({
  fromId: '',
  toId: '',
  type: '',
});

const graphContainerRef = ref(null);
const rootNodeId = ref(null);

let network = null;
let resizeObserver = null;
let resizeFrame = null;
let visNodes = new DataSet();
let visEdges = new DataSet();

const governanceTotal = computed(
  () =>
    governance.rootAnomalies.length +
    governance.orphans.length +
    governance.unmapped.length +
    governance.invalidSteps.length
);

const queryPresetMap = {
  mainline: {
    labels: ['Entity', 'Fault', 'FaultStep'],
    rels: ['HAS_FAULT', 'HAS_STEP', 'IF_SUCCESS', 'IF_FAILED', 'NEXT_STEP'],
    limit: 240,
  },
  faults: {
    labels: ['Fault', 'FaultStep'],
    rels: ['HAS_STEP', 'IF_SUCCESS', 'IF_FAILED', 'NEXT_STEP'],
    limit: 240,
  },
  all: {
    labels: [],
    rels: [],
    limit: 240,
  },
};

const labelPalette = {
  Entity: { background: '#0f766e', border: '#115e59' },
  Fault: { background: '#d97706', border: '#92400e' },
  FaultStep: { background: '#2563eb', border: '#1d4ed8' },
  default: { background: '#475569', border: '#334155' },
};

const anomalyPalette = {
  root_anomaly: '#dc2626',
  orphan: '#ea580c',
  unmapped: '#ca8a04',
  invalid_step: '#0284c7',
};

const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

const getPlaceholderByType = (type) => {
  if (type === 'array') return '输入 JSON 数组，例如 ["a","b"]';
  if (type === 'number') return '输入数字';
  if (type === 'boolean') return '输入 true / false';
  return '输入属性值';
};

const propertiesToObject = (properties) => {
  const obj = {};
  properties.forEach((prop) => {
    if (!prop.key || prop.value === '') return;
    try {
      if (prop.type === 'array') {
        obj[prop.key] = JSON.parse(prop.value);
      } else if (prop.type === 'number') {
        obj[prop.key] = Number(prop.value);
      } else if (prop.type === 'boolean') {
        obj[prop.key] = String(prop.value).toLowerCase() === 'true';
      } else {
        obj[prop.key] = prop.value;
      }
    } catch (error) {
      obj[prop.key] = prop.value;
    }
  });
  return obj;
};

const formatValue = (value) => {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value ?? '-';
};

const formatChunkIds = (chunkIds) => {
  if (!Array.isArray(chunkIds) || !chunkIds.length) return '无';
  return chunkIds.join(', ');
};

const mappingStatusTagType = (status) => {
  if (status === 'ok') return 'success';
  if (status === 'duplicated') return 'warning';
  if (status === 'broken' || status === 'missing') return 'danger';
  return 'info';
};

const governanceReasonLabel = (reason) => {
  const labelMap = {
    non_fault_under_root: '根节点下存在非 Fault 节点',
    isolated: '节点没有任何连线',
    broken: 'chunk_ids 没有命中知识库',
    duplicated: 'chunk_ids 命中了多条知识记录',
    fault_without_has_step: 'Fault 缺少入口步骤',
    branch_pair_incomplete: '分支关系不成对',
    branch_and_next_conflict: '分支关系与 NEXT_STEP 冲突',
  };
  return labelMap[reason] || reason || '待处理';
};

const getGovernanceIssueHint = (item, category) => {
  if (category === 'root') return '优先校正标签或移除错误的根节点挂载关系';
  if (category === 'orphans') return '补齐父子关系，无法确认归属时再删除';
  if (category === 'unmapped') return item.mapping_status === 'duplicated'
    ? '统一为唯一 chunk_id，并复查知识内容是否重复'
    : '补齐或修正 chunk_ids，再复查映射状态';
  if (category === 'steps') return `${governanceReasonLabel(item.reason)}，处理后重新扫描步骤结构`;
  return '查看详情并按修复路线处理';
};

const getNodeTitle = (node) => {
  if (!node) return '-';
  const properties = node.properties || {};
  return (
    properties.name ||
    properties.step_id ||
    properties.title ||
    properties.chunk_id ||
    `${node.label || node.labels?.[0] || 'Node'} #${node.id}`
  );
};

const getNodeAnomalyMeta = (nodeId) => {
  const id = String(nodeId);
  const tags = [];
  if (governance.rootAnomalies.some((item) => String(item.node.id) === id)) tags.push('root_anomaly');
  if (governance.orphans.some((item) => String(item.node.id) === id)) tags.push('orphan');
  if (governance.unmapped.some((item) => String(item.node.id) === id)) tags.push('unmapped');
  if (governance.invalidSteps.some((item) => String(item.node.id) === id)) tags.push('invalid_step');
  return tags;
};

const getAnomalyTags = (nodeId) =>
  getNodeAnomalyMeta(nodeId).map((tag) => {
    if (tag === 'root_anomaly') return '根节点错放';
    if (tag === 'orphan') return '孤立节点';
    if (tag === 'unmapped') return '知识映射异常';
    if (tag === 'invalid_step') return '步骤结构异常';
    return tag;
  });

const toDetailsNode = (node) => ({
  id: String(node.id),
  label: node.label || node.labels?.[0] || 'Node',
  labels: Array.isArray(node.labels) ? node.labels : [node.label || 'Node'],
  properties: node.properties || {},
});

const normalizeNode = (node) => {
  const normalized = toDetailsNode(node);
  const mainLabel = normalized.labels[0] || 'default';
  const palette = labelPalette[mainLabel] || labelPalette.default;
  const anomalyTags = getNodeAnomalyMeta(normalized.id);
  const borderColor = anomalyTags.length ? anomalyPalette[anomalyTags[0]] : palette.border;
  return {
    id: normalized.id,
    label: `${normalized.id}:${getNodeTitle(normalized)}`,
    labels: normalized.labels,
    properties: normalized.properties,
    shape: mainLabel === 'FaultStep' ? 'box' : 'dot',
    size: mainLabel === 'Fault' ? 28 : 24,
    color: {
      background: palette.background,
      border: borderColor,
      highlight: {
        background: palette.background,
        border: '#111827',
      },
    },
    font: {
      color: '#0f172a',
      face: 'Segoe UI',
      size: 14,
      background: 'rgba(248, 250, 252, 0.92)',
      strokeWidth: 0,
    },
    title: [
      `ID: ${normalized.id}`,
      `标签: ${normalized.labels.join(', ')}`,
      `名称: ${getNodeTitle(normalized)}`,
      anomalyTags.length ? `异常: ${getAnomalyTags(normalized.id).join(' / ')}` : '异常: 无',
    ].join('\n'),
  };
};

const normalizeEdge = (edge) => {
  const type = edge.type || 'REL';
  const colorMap = {
    HAS_FAULT: '#b45309',
    HAS_STEP: '#2563eb',
    IF_SUCCESS: '#16a34a',
    IF_FAILED: '#dc2626',
    NEXT_STEP: '#0284c7',
  };
  return {
    id: String(edge.id),
    from: String(edge.from),
    to: String(edge.to),
    label: type,
    arrows: 'to',
    color: { color: colorMap[type] || '#64748b' },
    font: {
      align: 'top',
      size: 12,
      color: '#0f172a',
      background: 'rgba(248, 250, 252, 0.9)',
      strokeWidth: 0,
    },
    title: `${type}\n${edge.from} -> ${edge.to}`,
  };
};

const applyGraphData = (nodes, edges, append = false) => {
  const normalizedNodes = nodes.map(normalizeNode);
  const normalizedEdges = edges.map(normalizeEdge);

  if (!append) {
    visNodes.clear();
    visEdges.clear();
    expandedNodes.value = new Set();
    if (normalizedNodes.length) visNodes.add(normalizedNodes);
    if (normalizedEdges.length) visEdges.add(normalizedEdges);
  } else {
    const existingNodeIds = new Set(visNodes.getIds().map(String));
    const existingEdgeIds = new Set(visEdges.getIds().map(String));
    normalizedNodes.forEach((node) => {
      if (existingNodeIds.has(node.id)) {
        visNodes.update(node);
      } else {
        visNodes.add(node);
      }
    });
    normalizedEdges.forEach((edge) => {
      if (!existingEdgeIds.has(edge.id)) {
        visEdges.add(edge);
      }
    });
  }

  if (network) {
    network.setData({ nodes: visNodes, edges: visEdges });
  }
};

const requestNetworkResize = () => {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    const container = graphContainerRef.value;
    if (!container || !network) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    network.setSize(`${Math.round(rect.width)}px`, `${Math.round(rect.height)}px`);
    network.redraw();
  });
};

const ensureNetwork = async () => {
  await nextTick();
  const container = graphContainerRef.value;
  if (!container) return;

  if (!network) {
    network = new Network(
      container,
      { nodes: visNodes, edges: visEdges },
      {
        autoResize: false,
        layout: { improvedLayout: true },
        interaction: { hover: true, tooltipDelay: 250, dragView: true },
        physics: {
          stabilization: true,
          barnesHut: {
            gravitationalConstant: -2200,
            springLength: 180,
            springConstant: 0.03,
          },
        },
        nodes: {
          borderWidth: 3,
          shadow: true,
        },
        edges: {
          smooth: true,
          width: 2,
        },
      }
    );

    network.on('click', async (params) => {
      if (!params.nodes.length) {
        selectedNode.value = null;
        mappingDetails.value = null;
        return;
      }
      await inspectGovernanceNode(params.nodes[0], false);
    });

    network.on('doubleClick', async (params) => {
      if (!params.nodes.length) return;
      const nodeId = String(params.nodes[0]);
      if (expandedNodes.value.has(nodeId)) {
        collapseNode(nodeId);
        return;
      }
      await loadConnectedNodes(nodeId);
    });

    network.on('stabilizationIterationsDone', () => {
      requestNetworkResize();
    });
  } else {
    network.setData({ nodes: visNodes, edges: visEdges });
  }

  requestNetworkResize();
};

const focusNodeInGraph = async (nodeId) => {
  const id = String(nodeId);
  if (!visNodes.get(id)) {
    await loadConnectedNodes(id);
  }
  if (network && visNodes.get(id)) {
    network.selectNodes([id]);
    network.focus(id, {
      scale: 1.05,
      animation: { duration: 400, easingFunction: 'easeInOutQuad' },
    });
  }
};

const getAllNodeLabels = async () => {
  if (!isConnected.value) return;
  const resp = await http.get('/kg/meta');
  allNodeLabels.value = Array.isArray(resp?.data?.labels) ? resp.data.labels : [];
};

const loadStats = async () => {
  const resp = await http.get('/kg/stats');
  Object.assign(overviewStats, resp?.data || {});
};

const loadGovernance = async () => {
  const [rootResp, orphanResp, unmappedResp, invalidResp] = await Promise.all([
    http.get('/kg/governance/root-anomalies'),
    http.get('/kg/governance/orphans'),
    http.get('/kg/governance/unmapped'),
    http.get('/kg/governance/invalid-steps'),
  ]);
  rootNodeId.value = rootResp?.data?.root_id != null ? String(rootResp.data.root_id) : null;
  governance.rootAnomalies = Array.isArray(rootResp?.data?.items) ? rootResp.data.items : [];
  governance.orphans = Array.isArray(orphanResp?.data?.items) ? orphanResp.data.items : [];
  governance.unmapped = Array.isArray(unmappedResp?.data?.items) ? unmappedResp.data.items : [];
  governance.invalidSteps = Array.isArray(invalidResp?.data?.items) ? invalidResp.data.items : [];
};

const refreshCurrentNodesStyle = () => {
  const nodes = visNodes.get();
  if (nodes.length) {
    visNodes.update(nodes.map((node) => normalizeNode(node)));
  }
};

const refreshDashboard = async () => {
  if (!isConnected.value) return;
  isScanning.value = true;
  try {
    await Promise.all([loadStats(), loadGovernance()]);
    refreshCurrentNodesStyle();
    ElMessage.success('总览与异常扫描已更新');
  } catch (error) {
    console.error('刷新治理数据失败:', error);
    ElMessage.error(`刷新失败: ${error?.message || '未知错误'}`);
  } finally {
    isScanning.value = false;
  }
};

const buildQueryPayload = () => {
  const preset = queryPresetMap[queryPreset.value] || queryPresetMap.mainline;
  const labels = searchType.value && searchType.value !== 'all' ? [searchType.value] : preset.labels;
  return {
    labels,
    rels: preset.rels,
    limit: preset.limit,
  };
};

const filterGraphByKeyword = (nodes, edges) => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return { nodes, edges };

  const matchedNodeIds = new Set(
    nodes
      .filter((node) =>
        Object.values(node.properties || {}).some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
      )
      .map((node) => String(node.id))
  );

  const filteredEdges = edges.filter(
    (edge) => matchedNodeIds.has(String(edge.from)) || matchedNodeIds.has(String(edge.to))
  );
  const edgeNodeIds = new Set();
  filteredEdges.forEach((edge) => {
    edgeNodeIds.add(String(edge.from));
    edgeNodeIds.add(String(edge.to));
  });

  return {
    edges: filteredEdges,
    nodes: nodes.filter(
      (node) => matchedNodeIds.has(String(node.id)) || edgeNodeIds.has(String(node.id))
    ),
  };
};

const runQuery = async () => {
  if (!isConnected.value) return;
  isQuerying.value = true;
  try {
    const payload = buildQueryPayload();
    const resp = await http.post(`/kg/graph/query?limit=${payload.limit}`, {
      labels: payload.labels,
      rels: payload.rels,
    });
    const rawNodes = Array.isArray(resp?.data?.nodes) ? resp.data.nodes : [];
    const rawEdges = Array.isArray(resp?.data?.edges) ? resp.data.edges : [];
    const filtered = filterGraphByKeyword(rawNodes, rawEdges);
    applyGraphData(filtered.nodes, filtered.edges, false);
    await ensureNetwork();
    ElMessage.success(`已加载 ${filtered.nodes.length} 个节点和 ${filtered.edges.length} 条关系`);
  } catch (error) {
    console.error('图谱查询失败:', error);
    ElMessage.error(`查询失败: ${error?.message || '未知错误'}`);
  } finally {
    isQuerying.value = false;
  }
};

const runMainlineQuery = async () => {
  queryPreset.value = 'mainline';
  searchType.value = 'all';
  await runQuery();
};

const runFaultQuery = async () => {
  queryPreset.value = 'faults';
  searchType.value = 'all';
  await runQuery();
};

const runAllQuery = async () => {
  queryPreset.value = 'all';
  searchType.value = 'all';
  await runQuery();
};

const connectToDatabase = async () => {
  isConnecting.value = true;
  try {
    const healthResp = await http.get('/kg/health');
    if (healthResp?.data?.status !== 'healthy') {
      throw new Error(healthResp?.data?.error || '图谱服务不可用');
    }

    isConnected.value = true;
    await getAllNodeLabels();
    await refreshDashboard();
    await runMainlineQuery();
    ElMessage.success('图谱治理工作台已就绪');
  } catch (error) {
    isConnected.value = false;
    console.error('连接图谱服务失败:', error);
    ElMessage.error(`连接失败: ${error?.message || '未知错误'}`);
  } finally {
    isConnecting.value = false;
  }
};

const inspectGovernanceNode = async (nodeId, switchTab = true) => {
  if (!isConnected.value) return;
  isLoadingMapping.value = true;
  try {
    const resp = await http.get(`/kg/mapping/node/${Number(nodeId)}`);
    mappingDetails.value = resp?.data || null;
    selectedNode.value = mappingDetails.value?.node ? toDetailsNode(mappingDetails.value.node) : null;
    if (switchTab) activeTab.value = 'details';
    await focusNodeInGraph(nodeId);
  } catch (error) {
    console.error('加载节点详情失败:', error);
    ElMessage.error(`节点详情加载失败: ${error?.message || '未知错误'}`);
  } finally {
    isLoadingMapping.value = false;
  }
};

const jumpToGovernance = (section) => {
  activeTab.value = 'governance';
  if (section === 'root' && governance.rootAnomalies.length) {
    inspectGovernanceNode(governance.rootAnomalies[0].node.id);
  } else if (section === 'orphans' && governance.orphans.length) {
    inspectGovernanceNode(governance.orphans[0].node.id);
  } else if (section === 'unmapped' && governance.unmapped.length) {
    inspectGovernanceNode(governance.unmapped[0].node.id);
  } else if (section === 'steps' && governance.invalidSteps.length) {
    inspectGovernanceNode(governance.invalidSteps[0].node.id);
  }
};

const getGovernanceSnapshot = (nodeId) => ({
  root: governance.rootAnomalies.find((item) => String(item.node.id) === String(nodeId)) || null,
  orphan: governance.orphans.find((item) => String(item.node.id) === String(nodeId)) || null,
  unmapped: governance.unmapped.find((item) => String(item.node.id) === String(nodeId)) || null,
  invalid: governance.invalidSteps.filter((item) => String(item.node.id) === String(nodeId)),
});

const ensureEditingProperty = (key, type = 'string', value = '') => {
  const found = editingNode.properties.find((item) => item.key === key);
  if (found) return found;
  const prop = { key, type, value };
  editingNode.properties.push(prop);
  return prop;
};

const openNodeEditor = (options = {}) => {
  if (!selectedNode.value) return;
  startEditNode();
  if (options.label) {
    editingNode.labels = [options.label];
  }
  (options.ensureProperties || []).forEach((prop) => {
    ensureEditingProperty(prop.key, prop.type, prop.value);
  });
  activeTab.value = 'details';
};

const presetRelationshipEditor = ({ fromId = '', toId = '', type = '', message = '' }) => {
  newRelationship.fromId = fromId ? String(fromId) : '';
  newRelationship.toId = toId ? String(toId) : '';
  newRelationship.type = type || '';
  activeTab.value = 'edit';
  if (message) ElMessage.info(message);
};

const deleteRelationshipById = async (relId, relationLabel = '关系') => {
  if (!relId || !isConnected.value) return;
  try {
    await ElMessageBox.confirm(
      `确认删除 ${relationLabel} 吗？`,
      '删除关系确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      }
    );
  } catch (error) {
    return;
  }

  isAdding.value = true;
  try {
    await http.post('/kg/rels/delete', { id: Number(relId) });
    visEdges.remove(String(relId));
    await refreshDashboard();
    if (selectedNode.value) {
      await inspectGovernanceNode(selectedNode.value.id, false);
    }
    ElMessage.success(`${relationLabel} 已删除`);
  } catch (error) {
    console.error('删除关系失败:', error);
    ElMessage.error(`删除关系失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const getMissingBranchType = () => {
  const children = mappingDetails.value?.children || [];
  const relTypes = children.map((item) => item.relation.type);
  const hasSuccess = relTypes.includes('IF_SUCCESS');
  const hasFailed = relTypes.includes('IF_FAILED');
  if (hasSuccess && !hasFailed) return 'IF_FAILED';
  if (!hasSuccess && hasFailed) return 'IF_SUCCESS';
  return '';
};

const selectedRepairPlans = computed(() => {
  if (!selectedNode.value || !mappingDetails.value) return [];

  const plans = [];
  const snapshot = getGovernanceSnapshot(selectedNode.value.id);
  const childRelations = mappingDetails.value.children || [];
  const parentRelations = mappingDetails.value.parents || [];

  if (snapshot.root) {
    const wrongRootRelation = parentRelations.find((item) => (
      item.relation.type === 'HAS_FAULT' && (String(item.node.id) === rootNodeId.value || item.node.properties?.name === '故障诊断')
    ));
    const canRetag = !selectedNode.value.labels.includes('Fault');
    plans.push({
      key: 'root-anomaly',
      title: '根节点污染修复',
      summary: '该节点被错误挂在根节点的 HAS_FAULT 主链上，先判断它是否应为 Fault，再决定改标签还是移除错误关系。',
      levelText: '高优先级',
      tagType: 'warning',
      steps: [
        '先确认当前节点是否真的是故障节点。',
        '若节点本身就是故障，直接把标签修正为 Fault。',
        '若节点不属于主故障链，删除根节点到当前节点的错误 HAS_FAULT 关系，再重新挂到正确位置。',
      ],
      actions: [
        ...(canRetag ? [{ key: 'edit-label-fault', label: '改为 Fault 标签', type: 'primary' }] : []),
        ...(wrongRootRelation ? [{ key: 'delete-relation', label: '移除错误根挂载', type: 'danger', payload: { id: wrongRootRelation.relation.id, label: `关系 ${wrongRootRelation.relation.type}` } }] : []),
        { key: 'expand-node', label: '展开周边关系', type: 'info' },
      ],
    });
  }

  if (snapshot.orphan) {
    const isFault = selectedNode.value.labels.includes('Fault');
    const isStep = selectedNode.value.labels.includes('FaultStep');
    const orphanActions = [];
    if (isFault && rootNodeId.value) {
      orphanActions.push({
        key: 'preset-relationship',
        label: '预填根节点挂载',
        type: 'primary',
        payload: { fromId: rootNodeId.value, toId: selectedNode.value.id, type: 'HAS_FAULT', message: '已预填根节点 -> 当前节点 的 HAS_FAULT 关系。确认无误后直接新增。' },
      });
    }
    if (isStep) {
      orphanActions.push({
        key: 'preset-relationship',
        label: '预填步骤挂载',
        type: 'primary',
        payload: { fromId: '', toId: selectedNode.value.id, type: 'HAS_STEP', message: '已预填 HAS_STEP 关系，请补充所属 Fault 的源节点 ID。' },
      });
    }
    orphanActions.push({ key: 'delete-node', label: '确认后删除节点', type: 'danger' });
    plans.push({
      key: 'orphan-node',
      title: '孤立节点修复',
      summary: '孤立节点没有任何入边或出边。优先补齐归属关系，确认是脏数据时再删除。',
      levelText: '处理中',
      tagType: 'warning',
      steps: [
        '先通过节点名称、描述和 chunk_ids 判断它属于哪个故障或步骤。',
        '能确定归属时，补齐一条父子关系，把它重新接回主链。',
        '如果节点无业务价值或无法确认来源，再执行删除。',
      ],
      actions: orphanActions,
    });
  }

  if (snapshot.unmapped) {
    plans.push({
      key: 'unmapped-node',
      title: snapshot.unmapped.mapping_status === 'duplicated' ? '重复映射修复' : '断链映射修复',
      summary: snapshot.unmapped.mapping_status === 'duplicated' ? '当前节点的 chunk_ids 命中了多条知识记录，需要统一成唯一映射。' : '当前节点的 chunk_ids 未命中知识库，需要补齐或修正映射。',
      levelText: '映射修复',
      tagType: 'danger',
      steps: [
        '先检查下方知识映射卡，确认当前 chunk_ids 是否为空、错误或重复。',
        '进入编辑模式修正 chunk_ids，保持与知识库中的唯一 chunk_id 一致。',
        '保存后重新刷新概览，确认该节点从断链或重复列表中移除。',
      ],
      actions: [{ key: 'edit-properties', label: '编辑 chunk_ids', type: 'primary', payload: { ensureProperties: [{ key: 'chunk_ids', type: 'array', value: '[]' }] } }],
    });
  }

  const structureIssues = new Set([...(mappingDetails.value.structure?.issues || []), ...snapshot.invalid.map((item) => item.reason)]);

  if (structureIssues.has('fault_without_has_step')) {
    plans.push({
      key: 'fault-without-step',
      title: '入口步骤缺失修复',
      summary: 'Fault 节点没有 HAS_STEP 入口步骤，排障链无法开始。',
      levelText: '流程缺口',
      tagType: 'danger',
      steps: [
        '若步骤节点尚不存在，先在编辑页新增一个 FaultStep 节点。',
        '再给当前 Fault 补一条 HAS_STEP 关系，指向入口步骤。',
        '刷新扫描，确认该 Fault 已具备完整入口。',
      ],
      actions: [
        { key: 'preset-relationship', label: '预填 HAS_STEP 关系', type: 'primary', payload: { fromId: selectedNode.value.id, toId: '', type: 'HAS_STEP', message: '已预填当前 Fault 的 HAS_STEP 关系，请补充入口步骤 ID。' } },
        { key: 'switch-edit-tab', label: '去新增步骤节点', type: 'info' },
      ],
    });
  }

  if (structureIssues.has('branch_pair_incomplete')) {
    const missingType = getMissingBranchType();
    plans.push({
      key: 'branch-pair-incomplete',
      title: '分支补齐修复',
      summary: '当前步骤只配置了成功或失败分支中的一侧，流程语义不完整。',
      levelText: '结构修复',
      tagType: 'warning',
      steps: [
        '先确认当前步骤是否需要条件分支。',
        '如果需要分支，就补齐缺失的 IF_SUCCESS 或 IF_FAILED。',
        '如果实际上是线性流程，请删除已有的单侧分支关系，改成 NEXT_STEP。',
      ],
      actions: [
        ...(missingType ? [{ key: 'preset-relationship', label: `预填 ${missingType} 关系`, type: 'primary', payload: { fromId: selectedNode.value.id, toId: '', type: missingType, message: `已预填 ${missingType} 关系，请补充目标步骤 ID。` } }] : []),
        { key: 'expand-node', label: '展开当前步骤链路', type: 'info' },
      ],
    });
  }

  if (structureIssues.has('branch_and_next_conflict')) {
    const conflictRelations = childRelations.filter((item) => ['NEXT_STEP', 'IF_SUCCESS', 'IF_FAILED'].includes(item.relation.type));
    plans.push({
      key: 'branch-next-conflict',
      title: '分支冲突修复',
      summary: '当前步骤同时存在条件分支和 NEXT_STEP，必须保留一种结构，避免执行路径冲突。',
      levelText: '结构冲突',
      tagType: 'danger',
      steps: [
        '如果这是判断步骤，保留 IF_SUCCESS 与 IF_FAILED，删除 NEXT_STEP。',
        '如果这是线性步骤，删除所有分支边，仅保留 NEXT_STEP。',
        '删除后刷新详情和异常扫描，确认结构恢复合规。',
      ],
      actions: conflictRelations.map((item) => ({ key: 'delete-relation', label: `删除 ${item.relation.type} -> ${getNodeTitle(item.node)}`, type: item.relation.type === 'NEXT_STEP' ? 'danger' : 'warning', payload: { id: item.relation.id, label: `关系 ${item.relation.type}` } })),
    });
  }

  return plans;
});

const runRepairAction = async (action) => {
  if (!action) return;
  if (action.key === 'edit-label-fault') {
    openNodeEditor({ label: 'Fault' });
    return;
  }
  if (action.key === 'edit-properties') {
    openNodeEditor(action.payload || {});
    return;
  }
  if (action.key === 'preset-relationship') {
    presetRelationshipEditor(action.payload || {});
    return;
  }
  if (action.key === 'switch-edit-tab') {
    activeTab.value = 'edit';
    return;
  }
  if (action.key === 'expand-node') {
    await loadConnectedNodes(selectedNode.value.id);
    return;
  }
  if (action.key === 'delete-relation') {
    await deleteRelationshipById(action.payload?.id, action.payload?.label);
    return;
  }
  if (action.key === 'delete-node') {
    await deleteSelectedNode();
  }
};

const startEditNode = () => {
  if (!selectedNode.value) return;
  isEditingNode.value = true;
  editingNode.id = selectedNode.value.id;
  editingNode.labels = [...selectedNode.value.labels];
  editingNode.properties = Object.entries(selectedNode.value.properties || {}).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? JSON.stringify(value) : String(value),
    type: Array.isArray(value)
      ? 'array'
      : typeof value === 'number'
        ? 'number'
        : typeof value === 'boolean'
          ? 'boolean'
          : 'string',
  }));
  if (!editingNode.properties.length) {
    editingNode.properties.push({ key: '', value: '', type: 'string' });
  }
};

const cancelEditNode = () => {
  isEditingNode.value = false;
  editingNode.id = '';
  editingNode.labels = [];
  editingNode.properties = [];
};

const addEditingProperty = () => {
  editingNode.properties.push({ key: '', value: '', type: 'string' });
};

const removeEditingProperty = (index) => {
  if (editingNode.properties.length > 1) editingNode.properties.splice(index, 1);
};

const saveNodeChanges = async () => {
  if (!selectedNode.value || !isConnected.value) return;
  isAdding.value = true;
  try {
    const resp = await http.post('/kg/nodes/update', {
      id: Number(selectedNode.value.id),
      label: editingNode.labels[0],
      properties: propertiesToObject(editingNode.properties),
    });
    const updatedNode = toDetailsNode(resp?.data || {});
    selectedNode.value = updatedNode;
    mappingDetails.value = {
      ...(mappingDetails.value || {}),
      node: {
        id: Number(updatedNode.id),
        label: updatedNode.labels[0],
        labels: updatedNode.labels,
        properties: updatedNode.properties,
      },
    };
    visNodes.update(normalizeNode(updatedNode));
    isEditingNode.value = false;
    await refreshDashboard();
    ElMessage.success('节点更新成功');
  } catch (error) {
    console.error('更新节点失败:', error);
    ElMessage.error(`更新失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const addNodeProperty = () => {
  newNode.properties.push({ key: '', value: '', type: 'string' });
};

const removeNodeProperty = (index) => {
  if (newNode.properties.length > 1) newNode.properties.splice(index, 1);
};

const addNode = async () => {
  if (!isConnected.value || !newNode.label.trim()) {
    ElMessage.warning('请填写节点类型');
    return;
  }
  isAdding.value = true;
  try {
    const resp = await http.post('/kg/nodes', {
      label: newNode.label.trim(),
      properties: propertiesToObject(newNode.properties),
    });
    const createdNode = toDetailsNode(resp?.data || {});
    visNodes.add(normalizeNode(createdNode));
    newNode.label = '';
    newNode.properties = [{ key: 'name', value: '', type: 'string' }];
    await refreshDashboard();
    ElMessage.success('节点添加成功');
  } catch (error) {
    console.error('添加节点失败:', error);
    ElMessage.error(`添加失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const addRelationship = async () => {
  if (!isConnected.value || !newRelationship.fromId || !newRelationship.toId || !newRelationship.type) {
    ElMessage.warning('请填写完整的关系信息');
    return;
  }
  isAdding.value = true;
  try {
    const resp = await http.post('/kg/relationships', {
      start_id: Number(newRelationship.fromId),
      end_id: Number(newRelationship.toId),
      rel_type: newRelationship.type,
      properties: {},
    });
    visEdges.add(
      normalizeEdge({
        id: resp?.data?.id,
        from: Number(newRelationship.fromId),
        to: Number(newRelationship.toId),
        type: resp?.data?.type || newRelationship.type,
      })
    );
    newRelationship.fromId = '';
    newRelationship.toId = '';
    newRelationship.type = '';
    await refreshDashboard();
    ElMessage.success('关系添加成功');
  } catch (error) {
    console.error('添加关系失败:', error);
    ElMessage.error(`添加失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const deleteSelectedNode = async () => {
  if (!selectedNode.value || !isConnected.value) return;
  try {
    await ElMessageBox.confirm(
      `确定删除节点 "${getNodeTitle(selectedNode.value)}" 及其所有关系吗？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }
    );
  } catch (error) {
    return;
  }

  isAdding.value = true;
  try {
    await http.post('/kg/nodes/delete', { id: Number(selectedNode.value.id) });
    visNodes.remove(String(selectedNode.value.id));
    selectedNode.value = null;
    mappingDetails.value = null;
    await refreshDashboard();
    ElMessage.success('节点删除成功');
  } catch (error) {
    console.error('删除节点失败:', error);
    ElMessage.error(`删除失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const loadConnectedNodes = async (startNodeId) => {
  if (!isConnected.value) return;
  try {
    const resp = await http.post('/kg/graph/expand', { nodeId: Number(startNodeId) });
    const nodes = Array.isArray(resp?.data?.nodes) ? resp.data.nodes : [];
    const edges = Array.isArray(resp?.data?.edges) ? resp.data.edges : [];
    applyGraphData(nodes, edges, true);
    expandedNodes.value.add(String(startNodeId));
    ElMessage.success(`已展开 ${nodes.length} 个节点 / ${edges.length} 条关系`);
  } catch (error) {
    console.error('展开节点失败:', error);
    ElMessage.error(`展开失败: ${error?.message || '未知错误'}`);
  }
};

const collapseNode = (nodeId) => {
  const id = String(nodeId);
  const relatedEdges = visEdges.get().filter((edge) => edge.from === id || edge.to === id);
  const removableNodes = [];
  const removableEdges = [];

  relatedEdges.forEach((edge) => {
    const otherId = edge.from === id ? edge.to : edge.from;
    const otherEdges = visEdges.get().filter((item) => item.from === otherId || item.to === otherId);
    const keptEdges = otherEdges.filter(
      (item) => !(item.from === id || item.to === id)
    );
    if (!keptEdges.length) removableNodes.push(otherId);
    removableEdges.push(edge.id);
  });

  if (removableEdges.length) visEdges.remove(removableEdges);
  if (removableNodes.length) visNodes.remove(removableNodes);
  expandedNodes.value.delete(id);
};

const handleResizeObserverError = () => {
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (String(message || '').includes('ResizeObserver loop')) return true;
    if (originalError) return originalError(message, source, lineno, colno, error);
    return false;
  };
};

watch(activeTab, async () => {
  await nextTick();
  requestNetworkResize();
});

onMounted(async () => {
  handleResizeObserverError();
  await nextTick();
  if (graphContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      requestNetworkResize();
    });
    resizeObserver.observe(graphContainerRef.value);
  }
  window.addEventListener('resize', requestNetworkResize);
  await ensureNetwork();
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  window.removeEventListener('resize', requestNetworkResize);
  if (network) network.destroy();
  window.onerror = null;
});
</script>

<style scoped>
.kg-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 24%),
    #e5eef5;
  color: #0f172a;
  align-items: start;
  overflow: visible;
}

.kg-canvas-panel {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  height: calc(100vh - 24px);
  max-height: calc(100vh - 24px);
  padding: 16px;
  gap: 14px;
}

.kg-topbar {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.86);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
  padding: 18px 20px;
}

.kg-topbar-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #0f766e;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kg-topbar h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.kg-topbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.kg-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  border: 0;
  border-radius: 18px;
  padding: 14px;
  text-align: left;
  background: linear-gradient(160deg, #ffffff, #e2e8f0);
  color: inherit;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 26px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #475569;
}

.stat-card-warning {
  background: linear-gradient(160deg, #fff7ed, #fed7aa);
}

.stat-card-accent {
  background: linear-gradient(160deg, #fefce8, #fde68a);
}

.stat-card-danger {
  background: linear-gradient(160deg, #eff6ff, #bfdbfe);
}

.kg-graph-shell {
  position: relative;
  height: 100%;
  min-height: 0;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.8)),
    repeating-linear-gradient(
      90deg,
      rgba(148, 163, 184, 0.08),
      rgba(148, 163, 184, 0.08) 1px,
      transparent 1px,
      transparent 32px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(148, 163, 184, 0.08),
      rgba(148, 163, 184, 0.08) 1px,
      transparent 1px,
      transparent 32px
    );
}

#graph-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.kg-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(248, 250, 252, 0.88);
}

.kg-sidebar {
  border-left: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  min-height: 0;
}

.kg-tabs {
  padding: 12px 14px 24px;
}

.kg-card {
  margin-bottom: 14px;
  border-radius: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-item {
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
}

.info-item span {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-item strong {
  font-size: 14px;
  word-break: break-word;
}

.overview-actions,
.preset-list,
.action-row,
.detail-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.overview-actions {
  margin-top: 14px;
}

.overview-list {
  display: grid;
  gap: 10px;
}

.overview-row,
.issue-item,
.relation-item {
  width: 100%;
  text-align: left;
  border: 1px solid #dbe4ee;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.overview-row:hover,
.issue-item:hover,
.relation-item:hover {
  transform: translateY(-1px);
  border-color: #60a5fa;
}

.overview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-list,
.details-stack,
.mapping-stack {
  display: grid;
  gap: 10px;
}

.issue-item strong,
.relation-item strong {
  display: block;
  margin-bottom: 4px;
}

.issue-item span,
.relation-item span,
.muted {
  color: #64748b;
  font-size: 12px;
}

.issue-hint {
  display: block;
  margin-top: 6px;
  color: #0f766e;
  font-size: 12px;
  line-height: 1.5;
}

.property-list {
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #dbe4ee;
}

.property-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.details-block,
.loading-state {
  display: grid;
  gap: 12px;
}

.properties-display {
  display: grid;
  gap: 8px;
}

.property-display-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
}

.property-key {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
}

.property-value {
  word-break: break-word;
}

.tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.repair-plan-list {
  display: grid;
  gap: 12px;
}

.repair-plan-card {
  border: 1px solid #dbe4ee;
  border-radius: 16px;
  padding: 14px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
}

.repair-plan-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.repair-plan-summary {
  margin: 6px 0 0;
  color: #475569;
  line-height: 1.6;
}

.repair-step-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.7;
}

.repair-step-list li + li {
  margin-top: 6px;
}

.mapping-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  background: #fffefc;
}

.mapping-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.mapping-summary {
  margin: 10px 0;
  color: #334155;
  line-height: 1.6;
}

.relation-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.relation-column {
  display: grid;
  gap: 8px;
}

.relation-column h4 {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 1360px) {
  .kg-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .kg-canvas-panel {
    position: static;
    height: min(72vh, 760px);
    max-height: none;
  }

  .kg-sidebar {
    border-left: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.24);
  }

  .kg-stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .kg-canvas-panel {
    padding: 12px;
    height: min(68vh, 640px);
  }

  .kg-topbar-main,
  .kg-stats-grid,
  .info-grid,
  .relation-columns,
  .property-row {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .kg-stats-grid {
    display: grid;
  }

  .stat-card strong {
    font-size: 22px;
  }

  .kg-topbar h1 {
    font-size: 22px;
  }
}
</style>
