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
import neo4j from 'neo4j-driver';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- 响应式数据
const activeTab = ref('connect');
const isConnecting = ref(false);
const isConnected = ref(false);
const isQuerying = ref(false);
const isAdding = ref(false);
const selectedNode = ref(null);
const allNodeLabels = ref([]);

// 在现有的响应式数据后添加
const expandedNodes = ref(new Set()); // 跟踪已展开的节点
const isEditingNode = ref(false); // 是否正在编辑节点
const editingNode = reactive({ // 编辑中的节点数据
  id: '',
  labels: [],
  properties: []
});

const dbConfig = reactive({
  serverUrl: 'bolt://localhost:7687',
  username: 'neo4j',
  password: 'password'
});

const searchType = ref('all');
const searchKeyword = ref('');

const newNode = reactive({ 
  label: '', 
  properties: [{ key: 'name', value: '', type: 'string' }] // 改为键值对数组
});
const newRelationship = reactive({ fromId: '', toId: '', type: '', properties: [] });

// --- Neo4j 和 Vis-network 实例
let driver = null;
let network = null;
let visNodes = new DataSet();
let visEdges = new DataSet();

// --- 核心方法
const connectToDatabase = async () => {
  isConnecting.value = true;
  try {
    if (driver) await driver.close();
    driver = neo4j.driver(dbConfig.serverUrl, neo4j.auth.basic(dbConfig.username, dbConfig.password));
    await driver.verifyConnectivity();
    isConnected.value = true;
    ElMessage.success('数据库连接成功！');
    if (!network) initializeNetwork();
    await getAllNodeLabels(); 
  } catch (error) {
    console.error('连接失败:', error);
    isConnected.value = false;
    ElMessage.error(`连接失败: ${error.message}`);
  } finally {
    isConnecting.value = false;
  }
};

const getAllNodeLabels = async () => {
  if (!driver) return;
  const session = driver.session();
  try {
    const result = await session.run('CALL db.labels()');
    allNodeLabels.value = result.records.map(record => record.get('label'));
  } catch (error) {
    console.error("获取节点标签失败:", error);
  } finally {
    await session.close();
  }
};

const initializeNetwork = () => {
  const container = document.getElementById('graph-container');
  if (!container) {
    console.warn('Graph container not found, retrying...');
    setTimeout(initializeNetwork, 100);
    return;
  }
  
  const data = { nodes: visNodes, edges: visEdges };
  const options = {
    layout: { hierarchical: false },
    // 修正1: 正确配置tooltip
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
        springLength: 200,
      },
    },
    edges: {
      smooth: true,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      font: { align: 'top', size: 12 },
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
    // 添加配置以减少 ResizeObserver 问题
    configure: {
      enabled: false
    },
    // 禁用自动调整以避免 resize 循环
    autoResize: false
  };
  
  try {
    network = new Network(container, data, options);

    // 监听节点点击事件
    network.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        selectedNode.value = visNodes.get(nodeId);
        activeTab.value = 'details';
      } else {
        selectedNode.value = null;
      }
    });
    
    network.on("doubleClick", (params) => {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            if (expandedNodes.value.has(nodeId)) {
            // 如果已展开，则收拢
            collapseNode(nodeId);
            } else {
            // 如果未展开，则展开
            loadConnectedNodes(nodeId);
            }
        }
    });
    
    // 手动处理窗口大小变化
    const handleResize = () => {
      if (network) {
        try {
          network.fit();
        } catch (e) {
          // 忽略 resize 过程中的错误
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 在组件卸载时清理事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
    
  } catch (error) {
    console.error('Network initialization failed:', error);
  }
};

const noCodeQuery = async () => {
  if (!isConnected.value) return;
  isQuerying.value = true;

  if (network) {
    network.destroy();
    network = null;
  }
  visNodes.clear();
  visEdges.clear();
  expandedNodes.value.clear();
  selectedNode.value = null;

  try {
    const session = driver.session();
    let query = 'MATCH (n';
    if (searchType.value !== 'all') {
      query += `:${searchType.value}`;
    }
    query += ') ';

    if (searchKeyword.value) {
      query += `WHERE n.name CONTAINS $keyword OR n.title CONTAINS $keyword OR n.description CONTAINS $keyword `;
    }

    query += `OPTIONAL MATCH (n)-[r]-(m) RETURN n,m,r LIMIT 100`; // 增加 LIMIT

    const result = await session.run(query, { keyword: searchKeyword.value });
    console.log('Records returned:', result.records.length); // 调试记录数

    const nodes = new Map();
    const edges = new Map();

    result.records.forEach(record => {
      record.forEach(value => {
        if (neo4j.isNode(value)) {
          const nodeId = value.identity.toString();
          const displayLabel = value.properties.name || value.properties.title || value.properties.id || value.labels[0] || 'Node';
          const node = {
            id: nodeId,
            label: `${value.identity.low}:${displayLabel}`,
            labels: value.labels,
            properties: value.properties,
            title: `ID: ${value.identity.low}\n类型: ${value.labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(value.properties, null, 2)}`,
            color: getNodeColor(value.labels[0] || 'Unknown')
          };
          nodes.set(node.id, node);
        } else if (neo4j.isRelationship(value)) {
          const edge = {
            id: value.identity.toString(),
            from: value.start.toString(),
            to: value.end.toString(),
            label: value.type,
            arrows: 'to',
            title: `ID: ${value.identity.low}\n类型: ${value.type}\n从: ${value.start.low}\n到: ${value.end.low}\n属性: ${JSON.stringify(value.properties, null, 2)}`,
            color: { color: '#888' }
          };
          edges.set(edge.id, edge);
        }
      });
    });

    await session.close();
    visNodes.add(Array.from(nodes.values()));
    visEdges.add(Array.from(edges.values()));
    console.log('visNodes:', visNodes.length, 'visEdges:', visEdges.length); // 调试渲染数据

    initializeNetwork();

    ElMessage.success(`查询成功，共找到 ${visNodes.length} 个节点和 ${visEdges.length} 个关系`);

  } catch (error) {
    console.error('查询执行失败:', error);
    ElMessage.error(`查询失败: ${error.message}`);
  } finally {
    isQuerying.value = false;
  }
};

// 编辑节点相关函数
const startEditNode = () => {
  if (!selectedNode.value) return;
  
  isEditingNode.value = true;
  editingNode.id = selectedNode.value.id;
  editingNode.labels = [...selectedNode.value.labels];
  
  // 将属性对象转换为键值对数组，并检测类型
    editingNode.properties = Object.entries(selectedNode.value.properties).map(([key, value]) => {
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
    
    return {
        key,
        value: displayValue,
        type
    };
    });
    
  // 确保至少有一个属性行
  if (editingNode.properties.length === 0) {
    editingNode.properties.push({ key: '', value: '' });
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
  
  // 验证数据
  if (!editingNode.labels[0]) {
    ElMessage.warning('请输入节点类型');
    return;
  }
  
  const validProps = editingNode.properties.filter(prop => prop.key && prop.value);
  if (validProps.length === 0) {
    ElMessage.warning('请至少添加一个有效属性');
    return;
  }
  
  isAdding.value = true;
  
  try {
    const session = driver.session();
    const nodeId = selectedNode.value.id;
    const newLabel = editingNode.labels[0];
    const oldLabels = selectedNode.value.labels;
    const newProperties = propertiesToObject(editingNode.properties);
    
    // 构建更新查询
    let query = `MATCH (n) WHERE id(n) = toInteger($nodeId) `;
    
    // 如果标签改变了，先移除旧标签，再添加新标签
    if (!oldLabels.includes(newLabel)) {
      // 移除所有旧标签
      for (const oldLabel of oldLabels) {
        query += `REMOVE n:${oldLabel} `;
      }
      // 添加新标签
      query += `SET n:${newLabel} `;
    }
    
    // 清除所有现有属性，然后设置新属性
    query += `SET n = $properties RETURN n`;
    
    const result = await session.run(query, { 
      nodeId: nodeId, 
      properties: newProperties 
    });
    
    if (result.records.length === 0) {
      throw new Error('节点不存在或更新失败');
    }
    
    await session.close();
    
    // 更新本地数据
    const updatedNode = result.records[0].get('n');
    const displayLabel = updatedNode.properties.name || updatedNode.properties.title || updatedNode.labels[0] || 'Node';
    
    const nodeUpdate = {
      id: nodeId,
      label: `${updatedNode.identity.low}:${displayLabel}`,
      labels: updatedNode.labels,
      properties: updatedNode.properties,
      title: `ID: ${updatedNode.identity.low}\n类型: ${updatedNode.labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(updatedNode.properties, null, 2)}`,
      color: getNodeColor(updatedNode.labels[0] || 'Unknown')
    };
    
    // 更新 visNodes
    visNodes.update(nodeUpdate);
    
    // 更新 selectedNode
    selectedNode.value = {
      id: nodeId,
      labels: updatedNode.labels,
      properties: updatedNode.properties
    };
    
    // 退出编辑模式
    isEditingNode.value = false;
    
    ElMessage.success('节点更新成功！');
    
  } catch (error) {
    console.error('更新节点失败:', error);
    ElMessage.error(`更新失败: ${error.message}`);
  } finally {
    isAdding.value = false;
  }
};

// 节点属性管理函数
const addNodeProperty = () => {
  newNode.properties.push({ key: '', value: '', type: 'string' });
};

const removeNodeProperty = (index) => {
  if (newNode.properties.length > 1) {
    newNode.properties.splice(index, 1);
  }
};

// 关系属性管理函数
const addRelationshipProperty = () => {
  newRelationship.properties.push({ key: '', value: '' });
};

const removeRelationshipProperty = (index) => {
  newRelationship.properties.splice(index, 1);
};

// 将属性数组转换为对象
const propertiesToObject = (properties) => {
  const obj = {};
  properties.forEach(prop => {
    if (prop.key && prop.value !== '') {
      try {
        switch (prop.type) {
          case 'array':
            // 解析JSON数组
            obj[prop.key] = JSON.parse(prop.value);
            break;
          case 'number':
            obj[prop.key] = Number(prop.value);
            break;
          case 'boolean':
            obj[prop.key] = prop.value.toLowerCase() === 'true';
            break;
          case 'string':
          default:
            obj[prop.key] = prop.value;
            break;
        }
      } catch (error) {
        // 如果JSON解析失败，当作字符串处理
        console.warn(`属性 ${prop.key} 解析失败，当作字符串处理:`, error);
        obj[prop.key] = prop.value;
      }
    }
  });
  return obj;
};

// 添加辅助函数
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

const addNode = async () => {
  if (!isConnected.value) return;
  if (!newNode.label.trim()) {
    ElMessage.warning('请输入节点类型');
    return;
  }
  
  // 检查是否至少有一个有效属性
  const validProps = newNode.properties.filter(prop => prop.key && prop.value);
  if (validProps.length === 0) {
    ElMessage.warning('请至少添加一个有效属性');
    return;
  }
  
  isAdding.value = true;
  try {
    const session = driver.session();
    const props = propertiesToObject(newNode.properties);
    const query = `CREATE (n:${newNode.label} $props) RETURN n`;
    const result = await session.run(query, { props });
    await session.close();

    const createdNode = result.records[0].get('n');
    const displayLabel = createdNode.properties.name || createdNode.properties.title || createdNode.labels[0] || 'Node';
    const nodeToAdd = {
      id: createdNode.identity.toString(),
      label: `${createdNode.identity.low}:${displayLabel}`,
      labels: createdNode.labels,
      properties: createdNode.properties,
      title: `ID: ${createdNode.identity.low}\n类型: ${createdNode.labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(createdNode.properties, null, 2)}`,
      color: getNodeColor(createdNode.labels[0] || 'Unknown')
    };
    visNodes.add(nodeToAdd);
    ElMessage.success(`节点 "${displayLabel}" 添加成功！`);
    
    // 重置表单
    newNode.label = '';
    newNode.properties = [{ key: 'name', value: '' }];
  } catch (error) {
    console.error('添加节点失败:', error);
    ElMessage.error(`添加失败: ${error.message}`);
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
    const session = driver.session();
    const props = propertiesToObject(newRelationship.properties);
    
    let query = `
      MATCH (a), (b)
      WHERE id(a) = toInteger($fromId) AND id(b) = toInteger($toId)
      CREATE (a)-[r:${newRelationship.type}`;
    
    if (Object.keys(props).length > 0) {
      query += ` $props`;
    }
    
    query += `]->(b) RETURN r, a, b`;
    
    const result = await session.run(query, {
      fromId: newRelationship.fromId,
      toId: newRelationship.toId,
      props: props
    });
    
    if (result.records.length === 0) {
      throw new Error('找不到指定ID的节点');
    }
    
    await session.close();

    const relationshipRecord = result.records[0].get('r');
    const edgeToAdd = {
      id: relationshipRecord.identity.toString(),
      from: newRelationship.fromId,
      to: newRelationship.toId,
      label: newRelationship.type,
      arrows: 'to',
      title: `类型: ${newRelationship.type}\n属性: ${JSON.stringify(props, null, 2)}`
    };
    visEdges.add(edgeToAdd);
    ElMessage.success('关系添加成功！');
    
    // 重置表单
    newRelationship.fromId = '';
    newRelationship.toId = '';
    newRelationship.type = '';
    newRelationship.properties = [];
  } catch (error) {
    console.error('添加关系失败:', error);
    ElMessage.error(`添加失败: ${error.message}`);
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
        type: 'warning',
      }
    );
    
    // 用户确认删除
    isAdding.value = true;
    try {
      const session = driver.session();
      const query = `MATCH (n) WHERE id(n) = toInteger($nodeId) DETACH DELETE n`;
      await session.run(query, { nodeId: selectedNode.value.id });
      await session.close();
      visNodes.remove({ id: selectedNode.value.id });
      selectedNode.value = null;
      ElMessage.success('节点删除成功！');
    } catch (error) {
      console.error('删除节点失败:', error);
      ElMessage.error(`删除失败: ${error.message}`);
    } finally {
      isAdding.value = false;
    }
  } catch (error) {
    // 用户取消删除或点击弹窗外部，这是正常行为，不需要处理
    // console.log('用户取消删除操作');
  }
};

// 智能颜色分配 - 为每个节点类型生成一致的随机颜色
const labelColorMap = new Map();
const getNodeColor = (label) => {
  if (!labelColorMap.has(label)) {
    // 使用标签名称作为种子生成一致的颜色
    const hash = Array.from(label).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // 生成HSL颜色，确保饱和度和亮度适中，便于阅读
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash) % 15);  // 45-60%
    
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    labelColorMap.set(label, color);
  }
  return labelColorMap.get(label);
};

// 修正3: 重写loadConnectedNodes函数以避免重复ID错误
const loadConnectedNodes = async (startNodeId) => {
  if (!isConnected.value) return;
  isQuerying.value = true;

  try {
    const session = driver.session();
    const query = `
      MATCH (start) WHERE id(start) = toInteger($nodeId)
      OPTIONAL MATCH (start)-[r]-(connected) 
      RETURN start, r, connected
      LIMIT 100
    `;
    const result = await session.run(query, { nodeId: startNodeId });

    const newNodes = [];
    const newEdges = [];
    const existingNodeIds = new Set(visNodes.getIds());
    const existingEdgeIds = new Set(visEdges.getIds());

    result.records.forEach(record => {
      record.forEach(value => {
        if (neo4j.isNode(value)) {
          const nodeId = value.identity.toString();
          // 只添加不存在的节点
          if (!existingNodeIds.has(nodeId)) {
            const displayLabel = value.properties.name || value.properties.title || value.labels[0] || 'Node';
            const node = {
              id: nodeId,
              label: `${value.identity.low}:${displayLabel}`,
              labels: value.labels,
              properties: value.properties,
              title: `ID: ${value.identity.low}\n类型: ${value.labels.join(', ')}\n名称: ${displayLabel}\n属性:\n${JSON.stringify(value.properties, null, 2)}`,
              color: getNodeColor(value.labels[0] || 'Unknown')
            };
            newNodes.push(node);
            existingNodeIds.add(nodeId);
          }
        } else if (neo4j.isRelationship(value)) {
          const edgeId = value.identity.toString();
          // 只添加不存在的边
          if (!existingEdgeIds.has(edgeId)) {
            const edge = {
              id: edgeId,
              from: value.start.toString(),
              to: value.end.toString(),
              label: value.type,
              arrows: 'to',
              title: `ID: ${value.identity.low}\n类型: ${value.type}\n从: ${value.start.low}\n到: ${value.end.low}\n属性: ${JSON.stringify(value.properties, null, 2)}`,
              color: { color: '#888' }
            };
            newEdges.push(edge);
            existingEdgeIds.add(edgeId);
          }
        }
      });
    });

    await session.close();
    
    // 批量添加新节点和边
    if (newNodes.length > 0) {
      visNodes.add(newNodes);
    }
    if (newEdges.length > 0) {
      visEdges.add(newEdges);
    }
    expandedNodes.value.add(startNodeId);
    ElMessage.success(`已加载 ${newNodes.length} 个新节点和 ${newEdges.length} 个新关系`);

  } catch (error) {
    console.error("加载关联节点失败:", error);
    ElMessage.error(`加载关联节点失败: ${error.message}`);
  } finally {
    isQuerying.value = false;
  }
};

// 新增函数：收拢节点
const collapseNode = (nodeId) => {
  try {
    // 找到该节点的所有直接连接的边
    const connectedEdges = visEdges.get().filter(edge => 
      edge.from === nodeId || edge.to === nodeId
    );
    
    // 找到通过这些边连接的所有节点
    const connectedNodeIds = new Set();
    connectedEdges.forEach(edge => {
      if (edge.from === nodeId) {
        connectedNodeIds.add(edge.to);
      } else if (edge.to === nodeId) {
        connectedNodeIds.add(edge.from);
      }
    });
    
    // 检查哪些连接的节点只与当前节点相连（即移除后会孤立的节点）
    const nodesToRemove = [];
    const edgesToRemove = [];
    
    connectedNodeIds.forEach(connectedNodeId => {
      const nodeEdges = visEdges.get().filter(edge => 
        edge.from === connectedNodeId || edge.to === connectedNodeId
      );
      
      // 如果这个节点只与当前节点有连接，则可以移除
      const otherConnections = nodeEdges.filter(edge => 
        !(edge.from === nodeId || edge.to === nodeId)
      );
      
      if (otherConnections.length === 0) {
        nodesToRemove.push(connectedNodeId);
        // 添加相关的边到移除列表
        nodeEdges.forEach(edge => {
          if (!edgesToRemove.includes(edge.id)) {
            edgesToRemove.push(edge.id);
          }
        });
      }
    });
    
    // 移除节点和边
    if (nodesToRemove.length > 0) {
      visNodes.remove(nodesToRemove);
    }
    if (edgesToRemove.length > 0) {
      visEdges.remove(edgesToRemove);
    }
    
    // 标记节点为未展开
    expandedNodes.value.delete(nodeId);
    
    ElMessage.success(`已收拢节点，移除了 ${nodesToRemove.length} 个相关节点`);
    
  } catch (error) {
    console.error("收拢节点失败:", error);
    ElMessage.error(`收拢失败: ${error.message}`);
  }
};

// 全局错误处理 - 忽略 ResizeObserver 错误
// 全局错误处理 - 忽略 ResizeObserver 错误
const handleResizeObserverError = () => {
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (message && message.toString().includes('ResizeObserver loop')) {
      return true; // 阻止错误显示
    }
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  // 处理未捕获的 Promise 错误
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('ResizeObserver loop')) {
      event.preventDefault();
      return;
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
};

// --- 生命周期钩子
onMounted(() => {
  // 设置错误处理
  handleResizeObserverError();
  
  // 延迟初始化网络，避免容器大小计算问题
  setTimeout(() => {
    initializeNetwork();
  }, 100);
});

onUnmounted(() => {
  if (driver) driver.close();
  if (network) network.destroy();
  // 清理错误处理
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