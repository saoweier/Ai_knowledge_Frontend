<template>
  <div class="kg-manager">
    <div class="kg-graph">
      <div id="graph-container" />
      
      <div
        v-if="!isConnected"
        class="kg-placeholder"
      >
        <el-empty description="请先连接数据库并加载图谱">
          <el-button
            type="primary"
            @click="connectToDatabase"
          >
            连接数据库
          </el-button>
        </el-empty>
      </div>
    </div>

    <div class="kg-sidebar">
      <el-tabs
        v-model="activeTab"
        class="custom-tabs"
      >
        <el-tab-pane
          label="连接与查询"
          name="connect"
        >
          <el-card
            shadow="never"
            class="mb-4"
          >
            <template #header>
              <div class="card-header">
                <span>数据库连接</span>
                <el-tag :type="isConnected ? 'success' : 'danger'">
                  {{ isConnected ? '已连接' : '未连接' }}
                </el-tag>
              </div>
            </template>
            <el-form
              :model="dbConfig"
              label-width="80px"
            >
              <el-form-item label="URL">
                <el-input
                  v-model="dbConfig.serverUrl"
                  size="small"
                />
              </el-form-item>
              <el-form-item label="用户">
                <el-input
                  v-model="dbConfig.username"
                  size="small"
                />
              </el-form-item>
              <el-form-item label="密码">
                <el-input
                  v-model="dbConfig.password"
                  type="password"
                  size="small"
                  show-password
                />
              </el-form-item>
              <el-button 
                type="primary" 
                :loading="isConnecting" 
                style="width: 100%;"
                @click="connectToDatabase"
              >
                {{ isConnected ? '重新连接' : '连接数据库' }}
              </el-button>
            </el-form>
          </el-card>

          <el-card shadow="never">
            <template #header>
              <span>图谱查询</span>
            </template>
            <el-form
              :disabled="!isConnected"
              label-width="80px"
            >
              <el-form-item label="节点类型">
                <el-select
                  v-model="searchType"
                  placeholder="选择节点类型"
                  style="width: 100%;"
                >
                  <el-option
                    label="所有节点"
                    value="all"
                  />
                  <el-option 
                    v-for="label in allNodeLabels"
                    :key="label"
                    :label="label"
                    :value="label"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input
                  v-model="searchKeyword"
                  placeholder="输入名称或标题"
                />
              </el-form-item>
              <el-button 
                type="success" 
                :loading="isQuerying" 
                style="width: 100%;" 
                @click="noCodeQuery"
              >
                执行查询
              </el-button>
            </el-form>
          </el-card>
        </el-tab-pane>

        <el-tab-pane
          label="数据编辑"
          name="edit"
          :disabled="!isConnected"
        >
          <el-card
            shadow="never"
            class="mb-4"
          >
            <template #header>
              <span>添加节点</span>
            </template>
            <el-form
              :model="newNode"
              :disabled="!isConnected"
              label-width="80px"
            >
              <el-form-item
                label="类型"
                required
              >
                <el-input
                  v-model="newNode.label"
                  placeholder="例如: Person, Book, Company"
                />
              </el-form-item>
              
              <el-form-item label="属性">
                <div class="property-list">
                  <div
                    v-for="(prop, index) in newNode.properties"
                    :key="index"
                    class="property-item"
                  >
                    <div class="property-row">
                      <el-select 
                        v-model="prop.key" 
                        placeholder="选择或输入属性名"
                        filterable
                        allow-create
                        style="width: 120px;"
                      >
                        <el-option
                          label="name"
                          value="name"
                        />
                        <el-option
                          label="title"
                          value="title"
                        />
                        <el-option
                          label="description"
                          value="description"
                        />
                        <el-option
                          label="content"
                          value="content"
                        />
                        <el-option
                          label="chunk_ids"
                          value="chunk_ids"
                        />
                        <el-option
                          label="image_path"
                          value="image_path"
                        />
                      </el-select>
                      <el-select 
                        v-model="prop.type" 
                        style="width: 80px; margin-right: 8px;"
                        size="small"
                      >
                        <el-option
                          label="文本"
                          value="string"
                        />
                        <el-option
                          label="数组"
                          value="array"
                        />
                        <el-option
                          label="数字"
                          value="number"
                        />
                        <el-option
                          label="布尔"
                          value="boolean"
                        />
                      </el-select>
                      <el-input 
                        v-if="prop.type !== 'array'"
                        v-model="prop.value" 
                        :placeholder="getPlaceholderByType(prop.type)"
                        style="flex: 1; margin: 0 8px;"
                      />
                      <el-input 
                        v-else
                        v-model="prop.value" 
                        placeholder="输入数组，如：[&quot;item1&quot;, &quot;item2&quot;, &quot;item3&quot;]"
                        style="flex: 1; margin: 0 8px;"
                      />
                      <el-button 
                        type="danger" 
                        size="small" 
                        :icon="ElIconDelete"
                        :disabled="newNode.properties.length === 1"
                        @click="removeNodeProperty(index)"
                      />
                    </div>
                  </div>
                  <el-button 
                    type="primary" 
                    size="small" 
                    :icon="ElIconPlus"
                    style="width: 100%; margin-top: 8px;"
                    @click="addNodeProperty"
                  >
                    添加属性
                  </el-button>
                </div>
              </el-form-item>
              
              <el-button
                type="success"
                :loading="isAdding"
                style="width: 100%;"
                @click="addNode"
              >
                添加节点
              </el-button>
            </el-form>
          </el-card>

          <el-card shadow="never">
            <template #header>
              <span>添加关系</span>
            </template>
            <el-form
              :model="newRelationship"
              :disabled="!isConnected"
              label-width="120px"
            >
              <el-form-item
                label="源节点ID"
                required
              >
                <el-input
                  v-model="newRelationship.fromId"
                  placeholder="输入源节点的ID"
                />
              </el-form-item>
              <el-form-item
                label="目标节点ID"
                required
              >
                <el-input
                  v-model="newRelationship.toId"
                  placeholder="输入目标节点的ID"
                />
              </el-form-item>
              <el-form-item
                label="关系类型"
                required
              >
                <el-select 
                  v-model="newRelationship.type" 
                  placeholder="选择或输入关系类型"
                  filterable
                  allow-create
                  style="width: 100%;"
                >
                  <el-option
                    label="KNOWS"
                    value="KNOWS"
                  />
                  <el-option
                    label="WORKS_FOR"
                    value="WORKS_FOR"
                  />
                  <el-option
                    label="LIVES_IN"
                    value="LIVES_IN"
                  />
                  <el-option
                    label="REVIEWED"
                    value="REVIEWED"
                  />
                  <el-option
                    label="OWNS"
                    value="OWNS"
                  />
                  <el-option
                    label="FRIEND_OF"
                    value="FRIEND_OF"
                  />
                  <el-option
                    label="PARENT_OF"
                    value="PARENT_OF"
                  />
                  <el-option
                    label="LOCATED_IN"
                    value="LOCATED_IN"
                  />
                  <el-option
                    label="IF_SUCCESS"
                    value="IF_SUCCESS"
                  />
                  <el-option
                    label="IF_FAILED"
                    value="IF_FAILED"
                  />
                  <el-option
                    label="NEXT_STEP"
                    value="NEXT_STEP"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item
                v-if="newRelationship.properties.length > 0"
                label="关系属性"
              >
                <div class="property-list">
                  <div
                    v-for="(prop, index) in newRelationship.properties"
                    :key="index"
                    class="property-item"
                  >
                    <div class="property-row">
                      <el-select 
                        v-model="prop.key" 
                        placeholder="属性名"
                        filterable
                        allow-create
                        style="width: 120px;"
                      >
                        <el-option
                          label="since"
                          value="since"
                        />
                        <el-option
                          label="weight"
                          value="weight"
                        />
                        <el-option
                          label="type"
                          value="type"
                        />
                        <el-option
                          label="score"
                          value="score"
                        />
                      </el-select>
                      <el-input 
                        v-model="prop.value" 
                        placeholder="属性值"
                        style="flex: 1; margin: 0 8px;"
                      />
                      <el-button 
                        type="danger" 
                        size="small" 
                        :icon="ElIconDelete"
                        @click="removeRelationshipProperty(index)"
                      />
                    </div>
                  </div>
                </div>
              </el-form-item>
              
              <el-button 
                type="text" 
                size="small" 
                :icon="ElIconPlus"
                style="margin-bottom: 16px;"
                @click="addRelationshipProperty"
              >
                添加关系属性
              </el-button>
              
              <el-button
                type="success"
                :loading="isAdding"
                style="width: 100%;"
                @click="addRelationship"
              >
                添加关系
              </el-button>
            </el-form>
          </el-card>
        </el-tab-pane>

        <el-tab-pane
          label="节点详情"
          name="details"
          :disabled="!selectedNode"
        >
          <el-card
            v-if="selectedNode"
            shadow="never"
          >
            <template #header>
              <div class="card-header">
                <span>节点详情</span>
                <div>
                  <el-button 
                    v-if="!isEditingNode" 
                    type="primary" 
                    size="small" 
                    @click="startEditNode"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    v-if="isEditingNode" 
                    type="success" 
                    size="small" 
                    :loading="isAdding"
                    @click="saveNodeChanges"
                  >
                    保存
                  </el-button>
                  <el-button 
                    v-if="isEditingNode" 
                    size="small" 
                    @click="cancelEditNode"
                  >
                    取消
                  </el-button>
                </div>
              </div>
            </template>
            
            <!-- 查看模式 -->
            <div
              v-if="!isEditingNode"
              class="node-details-content"
            >
              <div class="detail-item">
                <strong>ID:</strong> {{ selectedNode.id }}
              </div>
              <div class="detail-item">
                <strong>类型:</strong> {{ selectedNode.labels.join(', ') }}
              </div>
              <div class="detail-item">
                <strong>属性:</strong>
                <div class="properties-display">
                  <div
                    v-for="(value, key) in selectedNode.properties"
                    :key="key"
                    class="property-display-item"
                  >
                    <span class="property-key">{{ key }}:</span>
                    <span class="property-value">{{ value }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4">
                <el-button
                  type="danger"
                  @click="deleteSelectedNode"
                >
                  删除节点
                </el-button>
              </div>
            </div>
            
            <!-- 编辑模式 -->
            <div
              v-else
              class="node-edit-content"
            >
              <el-form
                :model="editingNode"
                label-width="80px"
              >
                <el-form-item label="ID">
                  <el-input
                    :value="editingNode.id"
                    disabled
                  />
                </el-form-item>
                
                <el-form-item
                  label="类型"
                  required
                >
                  <el-select 
                    v-model="editingNode.labels[0]" 
                    placeholder="选择或输入节点类型"
                    filterable
                    allow-create
                    style="width: 100%;"
                  >
                    <el-option 
                      v-for="label in allNodeLabels"
                      :key="label"
                      :label="label"
                      :value="label"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="属性">
                  <div class="property-list">
                    <div
                      v-for="(prop, index) in editingNode.properties"
                      :key="index"
                      class="property-item"
                    >
                      <div class="property-row">
                        <el-select 
                          v-model="prop.key" 
                          placeholder="属性名"
                          filterable
                          allow-create
                          style="width: 120px;"
                        >
                          <el-option
                            label="name"
                            value="name"
                          />
                          <el-option
                            label="title"
                            value="title"
                          />
                          <el-option
                            label="description"
                            value="description"
                          />
                          <el-option
                            label="content"
                            value="content"
                          />
                          <el-option
                            label="chunk_id"
                            value="chunk_id"
                          />
                          <el-option
                            label="chunk_ids"
                            value="chunk_ids"
                          />
                          <el-option
                            label="image_path"
                            value="image_path"
                          />
                          <el-option
                            label="address"
                            value="address"
                          />
                        </el-select>
                        <el-input 
                          v-model="prop.value" 
                          placeholder="属性值"
                          style="flex: 1; margin: 0 8px;"
                        />
                        <el-button 
                          type="danger" 
                          size="small" 
                          :icon="ElIconDelete"
                          :disabled="editingNode.properties.length === 1"
                          @click="removeEditingProperty(index)"
                        />
                      </div>
                    </div>
                    <el-button 
                      type="primary" 
                      size="small" 
                      :icon="ElIconPlus"
                      style="width: 100%; margin-top: 8px;"
                      @click="addEditingProperty"
                    >
                      添加属性
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
          <div
            v-else
            class="details-placeholder"
          >
            点击图谱中的节点查看详情
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ElMessage, ElMessageBox } from 'element-plus';
import http from '@/api/http';

const activeTab = ref('connect');
const isConnecting = ref(false);
const isConnected = ref(false);
const isQuerying = ref(false);
const isAdding = ref(false);
const selectedNode = ref(null);
const allNodeLabels = ref([]);

const expandedNodes = ref(new Set());
const isEditingNode = ref(false);
const editingNode = reactive({
  id: '',
  labels: [],
  properties: []
});

const dbConfig = reactive({
  serverUrl: 'http://localhost:8093/api/kg',
  username: '',
  password: ''
});

const searchType = ref('all');
const searchKeyword = ref('');

const newNode = reactive({
  label: '',
  properties: [{ key: 'name', value: '', type: 'string' }]
});
const newRelationship = reactive({ fromId: '', toId: '', type: '', properties: [] });

let network = null;
let visNodes = new DataSet();
let visEdges = new DataSet();

const labelColorMap = new Map();
const getNodeColor = (label) => {
  if (!labelColorMap.has(label)) {
    const hash = Array.from(label).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20);
    const lightness = 45 + (Math.abs(hash) % 15);
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    labelColorMap.set(label, color);
  }
  return labelColorMap.get(label);
};

const getPlaceholderByType = (type) => {
  switch (type) {
    case 'number':
      return '输入数字，如：123';
    case 'boolean':
      return '输入 true 或 false';
    case 'string':
    default:
      return '输入属性值';
  }
};

const propertiesToObject = (properties) => {
  const obj = {};
  properties.forEach((prop) => {
    if (prop.key && prop.value !== '') {
      try {
        switch (prop.type) {
          case 'array':
            obj[prop.key] = JSON.parse(prop.value);
            break;
          case 'number':
            obj[prop.key] = Number(prop.value);
            break;
          case 'boolean':
            obj[prop.key] = String(prop.value).toLowerCase() === 'true';
            break;
          case 'string':
          default:
            obj[prop.key] = prop.value;
            break;
        }
      } catch (error) {
        obj[prop.key] = prop.value;
      }
    }
  });
  return obj;
};

const normalizeNode = (node) => {
  const nodeId = String(node.id);
  const labels = Array.isArray(node.labels)
    ? node.labels
    : [node.label || 'Node'];
  const properties = node.properties || {};
  const displayLabel =
    properties.name ||
    properties.title ||
    properties.id ||
    labels[0] ||
    'Node';

  return {
    id: nodeId,
    label: `${nodeId}:${displayLabel}`,
    labels,
    properties,
    title: `ID: ${nodeId}\n类型: ${labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(properties, null, 2)}`,
    color: getNodeColor(labels[0] || 'Unknown')
  };
};

const normalizeEdge = (edge) => {
  const type = edge.type || edge.label || 'REL';
  const properties = edge.properties || {};
  const edgeId = String(edge.id);
  const from = String(edge.from);
  const to = String(edge.to);

  return {
    id: edgeId,
    from,
    to,
    label: type,
    arrows: 'to',
    title: `ID: ${edgeId}\n类型: ${type}\n从: ${from}\n到: ${to}\n属性: ${JSON.stringify(properties, null, 2)}`,
    color: { color: '#888' }
  };
};

const applyGraphData = (nodes, edges, append = false) => {
  if (!append) {
    visNodes.clear();
    visEdges.clear();
    expandedNodes.value.clear();
    selectedNode.value = null;
  }

  if (append) {
    const existingNodeIds = new Set(visNodes.getIds().map(String));
    const existingEdgeIds = new Set(visEdges.getIds().map(String));

    const nodesToAdd = nodes
      .map(normalizeNode)
      .filter((n) => !existingNodeIds.has(n.id));
    const edgesToAdd = edges
      .map(normalizeEdge)
      .filter((e) => !existingEdgeIds.has(e.id));

    if (nodesToAdd.length > 0) visNodes.add(nodesToAdd);
    if (edgesToAdd.length > 0) visEdges.add(edgesToAdd);
    return;
  }

  visNodes.add(nodes.map(normalizeNode));
  visEdges.add(edges.map(normalizeEdge));
};

const initializeNetwork = () => {
  const container = document.getElementById('graph-container');
  if (!container) {
    setTimeout(initializeNetwork, 100);
    return;
  }

  const data = { nodes: visNodes, edges: visEdges };
  const options = {
    layout: { hierarchical: false },
    interaction: {
      hover: true,
      tooltipDelay: 300,
      hideEdgesOnDrag: false,
      hideNodesOnDrag: false
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2000,
        springConstant: 0.002,
        springLength: 200
      }
    },
    edges: {
      smooth: true,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      font: { align: 'top', size: 12 }
    },
    nodes: {
      shape: 'dot',
      size: 30,
      font: {
        size: 12,
        color: '#000',
        strokeWidth: 2,
        strokeColor: '#ffffff'
      },
      borderWidth: 2,
      chosen: {
        node: (values, id, selected) => {
          if (selected) {
            values.size = 35;
            values.borderWidth = 3;
          }
        }
      }
    },
    configure: { enabled: false },
    autoResize: false
  };

  try {
    network = new Network(container, data, options);

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        selectedNode.value = visNodes.get(nodeId);
        activeTab.value = 'details';
      } else {
        selectedNode.value = null;
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = String(params.nodes[0]);
        if (expandedNodes.value.has(nodeId)) {
          collapseNode(nodeId);
        } else {
          loadConnectedNodes(nodeId);
        }
      }
    });

    const handleResize = () => {
      if (network) {
        try {
          network.fit();
        } catch (e) {
          // Ignore fit errors during resize/teardown
        }
      }
    };

    window.addEventListener('resize', handleResize);
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
  } catch (error) {
    console.error('Network initialization failed:', error);
  }
};

const connectToDatabase = async () => {
  isConnecting.value = true;
  try {
    const healthResp = await http.get('/kg/health');
    if (healthResp?.data?.status !== 'healthy') {
      throw new Error(healthResp?.data?.error || '图谱服务不可用');
    }

    isConnected.value = true;
    ElMessage.success('图谱服务连接成功！');
    if (!network) initializeNetwork();
    await getAllNodeLabels();
  } catch (error) {
    isConnected.value = false;
    ElMessage.error(`连接失败: ${error?.message || '未知错误'}`);
  } finally {
    isConnecting.value = false;
  }
};

const getAllNodeLabels = async () => {
  if (!isConnected.value) return;
  try {
    const resp = await http.get('/kg/meta');
    allNodeLabels.value = Array.isArray(resp?.data?.labels) ? resp.data.labels : [];
  } catch (error) {
    console.error('获取节点标签失败:', error);
  }
};

const noCodeQuery = async () => {
  if (!isConnected.value) return;
  isQuerying.value = true;

  if (network) {
    network.destroy();
    network = null;
  }

  try {
    const payload = {
      labels: searchType.value !== 'all' ? [searchType.value] : [],
      rels: []
    };
    const resp = await http.post('/kg/graph/query?limit=200', payload);

    let nodes = Array.isArray(resp?.data?.nodes) ? resp.data.nodes : [];
    let edges = Array.isArray(resp?.data?.edges) ? resp.data.edges : [];

    const keyword = searchKeyword.value.trim().toLowerCase();
    if (keyword) {
      const matchedNodeIds = new Set(
        nodes
          .filter((n) => {
            const props = n.properties || {};
            return Object.values(props).some((v) => String(v).toLowerCase().includes(keyword));
          })
          .map((n) => String(n.id))
      );

      edges = edges.filter((e) => matchedNodeIds.has(String(e.from)) || matchedNodeIds.has(String(e.to)));
      const edgeNodeIds = new Set();
      edges.forEach((e) => {
        edgeNodeIds.add(String(e.from));
        edgeNodeIds.add(String(e.to));
      });
      nodes = nodes.filter((n) => matchedNodeIds.has(String(n.id)) || edgeNodeIds.has(String(n.id)));
    }

    applyGraphData(nodes, edges, false);
    initializeNetwork();

    ElMessage.success(`查询成功，共找到 ${visNodes.length} 个节点和 ${visEdges.length} 个关系`);
  } catch (error) {
    console.error('查询执行失败:', error);
    ElMessage.error(`查询失败: ${error?.message || '未知错误'}`);
  } finally {
    isQuerying.value = false;
  }
};

const startEditNode = () => {
  if (!selectedNode.value) return;

  isEditingNode.value = true;
  editingNode.id = selectedNode.value.id;
  editingNode.labels = [...selectedNode.value.labels];

  editingNode.properties = Object.entries(selectedNode.value.properties || {}).map(([key, value]) => {
    let type = 'string';
    let displayValue = String(value);

    if (Array.isArray(value)) {
      type = 'array';
      displayValue = JSON.stringify(value);
    } else if (typeof value === 'number') {
      type = 'number';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    }

    return { key, value: displayValue, type };
  });

  if (editingNode.properties.length === 0) {
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
  if (editingNode.properties.length > 1) {
    editingNode.properties.splice(index, 1);
  }
};

const saveNodeChanges = async () => {
  if (!isConnected.value || !selectedNode.value) return;

  if (!editingNode.labels[0]) {
    ElMessage.warning('请输入节点类型');
    return;
  }

  const validProps = editingNode.properties.filter((prop) => prop.key && prop.value !== '');
  if (validProps.length === 0) {
    ElMessage.warning('请至少添加一个有效属性');
    return;
  }

  isAdding.value = true;

  try {
    const nodeId = Number(selectedNode.value.id);
    const newLabel = editingNode.labels[0];
    const newProperties = propertiesToObject(editingNode.properties);

    const resp = await http.post('/kg/nodes/update', {
      id: nodeId,
      label: newLabel,
      properties: newProperties,
    });

    const updated = {
      id: String(resp?.data?.id ?? nodeId),
      labels: Array.isArray(resp?.data?.labels)
        ? resp.data.labels
        : selectedNode.value.labels,
      properties: resp?.data?.properties || newProperties
    };

    const displayLabel =
      updated.properties.name || updated.properties.title || updated.labels[0] || 'Node';

    const nodeUpdate = {
      id: updated.id,
      label: `${updated.id}:${displayLabel}`,
      labels: updated.labels,
      properties: updated.properties,
      title: `ID: ${updated.id}\n类型: ${updated.labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(updated.properties, null, 2)}`,
      color: getNodeColor(updated.labels[0] || 'Unknown')
    };

    visNodes.update(nodeUpdate);
    selectedNode.value = nodeUpdate;
    isEditingNode.value = false;
    ElMessage.success('节点更新成功！');
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
  if (newNode.properties.length > 1) {
    newNode.properties.splice(index, 1);
  }
};

const addRelationshipProperty = () => {
  newRelationship.properties.push({ key: '', value: '', type: 'string' });
};

const removeRelationshipProperty = (index) => {
  newRelationship.properties.splice(index, 1);
};

const addNode = async () => {
  if (!isConnected.value) return;
  if (!newNode.label.trim()) {
    ElMessage.warning('请输入节点类型');
    return;
  }

  const validProps = newNode.properties.filter((prop) => prop.key && prop.value !== '');
  if (validProps.length === 0) {
    ElMessage.warning('请至少添加一个有效属性');
    return;
  }

  isAdding.value = true;
  try {
    const props = propertiesToObject(newNode.properties);
    const resp = await http.post('/kg/nodes', {
      label: newNode.label.trim(),
      properties: props
    });

    const nodeRaw = {
      id: resp?.data?.id,
      labels: Array.isArray(resp?.data?.labels) ? resp.data.labels : [newNode.label.trim()],
      properties: resp?.data?.properties || props
    };

    const nodeToAdd = normalizeNode(nodeRaw);
    visNodes.add(nodeToAdd);
    ElMessage.success(`节点 "${nodeToAdd.label}" 添加成功！`);

    newNode.label = '';
    newNode.properties = [{ key: 'name', value: '', type: 'string' }];
  } catch (error) {
    console.error('添加节点失败:', error);
    ElMessage.error(`添加失败: ${error?.message || '未知错误'}`);
  } finally {
    isAdding.value = false;
  }
};

const addRelationship = async () => {
  if (!isConnected.value) return;
  if (!newRelationship.fromId || !newRelationship.toId || !newRelationship.type) {
    ElMessage.warning('请填写所有必填字段');
    return;
  }

  isAdding.value = true;
  try {
    const props = propertiesToObject(newRelationship.properties);
    const startId = Number(newRelationship.fromId);
    const endId = Number(newRelationship.toId);

    const resp = await http.post('/kg/relationships', {
      start_id: startId,
      end_id: endId,
      rel_type: newRelationship.type,
      properties: props
    });

    const edgeToAdd = normalizeEdge({
      id: resp?.data?.id,
      from: startId,
      to: endId,
      type: resp?.data?.type || newRelationship.type,
      properties: resp?.data?.properties || props
    });

    visEdges.add(edgeToAdd);
    ElMessage.success('关系添加成功！');

    newRelationship.fromId = '';
    newRelationship.toId = '';
    newRelationship.type = '';
    newRelationship.properties = [];
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
      `确定要删除节点 "${selectedNode.value.label}" 及其所有关系吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    isAdding.value = true;
    try {
      await http.post('/kg/nodes/delete', { id: Number(selectedNode.value.id) });
      visNodes.remove({ id: selectedNode.value.id });
      selectedNode.value = null;
      ElMessage.success('节点删除成功！');
    } catch (error) {
      console.error('删除节点失败:', error);
      ElMessage.error(`删除失败: ${error?.message || '未知错误'}`);
    } finally {
      isAdding.value = false;
    }
  } catch (error) {
    // User cancelled delete confirmation
  }
};

const loadConnectedNodes = async (startNodeId) => {
  if (!isConnected.value) return;
  isQuerying.value = true;

  try {
    const resp = await http.post('/kg/graph/expand', { nodeId: Number(startNodeId) });
    const nodes = Array.isArray(resp?.data?.nodes) ? resp.data.nodes : [];
    const edges = Array.isArray(resp?.data?.edges) ? resp.data.edges : [];

    applyGraphData(nodes, edges, true);
    expandedNodes.value.add(String(startNodeId));
    ElMessage.success(`已加载 ${nodes.length} 个节点和 ${edges.length} 个关系`);
  } catch (error) {
    console.error('加载关联节点失败:', error);
    ElMessage.error(`加载关联节点失败: ${error?.message || '未知错误'}`);
  } finally {
    isQuerying.value = false;
  }
};

const collapseNode = (nodeId) => {
  try {
    const connectedEdges = visEdges.get().filter((edge) => edge.from === nodeId || edge.to === nodeId);

    const connectedNodeIds = new Set();
    connectedEdges.forEach((edge) => {
      if (edge.from === nodeId) {
        connectedNodeIds.add(edge.to);
      } else if (edge.to === nodeId) {
        connectedNodeIds.add(edge.from);
      }
    });

    const nodesToRemove = [];
    const edgesToRemove = [];

    connectedNodeIds.forEach((connectedNodeId) => {
      const nodeEdges = visEdges.get().filter((edge) => edge.from === connectedNodeId || edge.to === connectedNodeId);
      const otherConnections = nodeEdges.filter((edge) => !(edge.from === nodeId || edge.to === nodeId));

      if (otherConnections.length === 0) {
        nodesToRemove.push(connectedNodeId);
        nodeEdges.forEach((edge) => {
          if (!edgesToRemove.includes(edge.id)) {
            edgesToRemove.push(edge.id);
          }
        });
      }
    });

    if (nodesToRemove.length > 0) {
      visNodes.remove(nodesToRemove);
    }
    if (edgesToRemove.length > 0) {
      visEdges.remove(edgesToRemove);
    }

    expandedNodes.value.delete(String(nodeId));
    ElMessage.success(`已收拢节点，移除了 ${nodesToRemove.length} 个相关节点`);
  } catch (error) {
    console.error('收拢节点失败:', error);
    ElMessage.error(`收拢失败: ${error?.message || '未知错误'}`);
  }
};

const handleResizeObserverError = () => {
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (message && message.toString().includes('ResizeObserver loop')) {
      return true;
    }
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver loop')) {
      event.preventDefault();
      return;
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
};

onMounted(() => {
  handleResizeObserverError();
  setTimeout(() => {
    initializeNetwork();
  }, 100);
});

onUnmounted(() => {
  if (network) network.destroy();
  window.onerror = null;
  window.onunhandledrejection = null;
});
</script>

<style scoped>
.kg-manager {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.kg-graph {
  flex: 1;
  position: relative;
  background: #f8f9fa;
}

#graph-container {
  width: 100%;
  height: 100%;
}

.kg-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.kg-sidebar {
  width: 550px;
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-details-content {
  line-height: 1.6;
}

.node-details-content pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.details-placeholder {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.property-list {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.property-item {
  margin-bottom: 8px;
}

.property-item:last-child {
  margin-bottom: 0;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-row .el-select {
  min-width: 120px;
}

.property-row .el-input {
  flex: 1;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.custom-tabs .el-tabs__content {
  padding: 20px;
}
</style>
