<template>
  <div class="maintenance-layout">
    <div class="container">
      <div class="content-wrapper">
        <aside class="sidebar">
          <div class="sidebar-section">
            <h3 class="section-title">
              <span>📋</span>设备列表
            </h3>
            <div class="search-box">
              <el-input
                v-model="searchText"
                placeholder="搜索设备名称或编号"
                prefix-icon="Search"
                clearable
              />
            </div>
            <div class="filter-box">
              <el-select
                v-model="filterType"
                placeholder="设备类型"
                clearable
                size="small"
              >
                <el-option
                  v-for="type in mockData.equipmentTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.name"
                />
              </el-select>
              <el-select
                v-model="filterStatus"
                placeholder="运行状态"
                clearable
                size="small"
              >
                <el-option
                  label="运行中"
                  value="运行中"
                />
                <el-option
                  label="停机"
                  value="停机"
                />
                <el-option
                  label="维护中"
                  value="维护中"
                />
              </el-select>
              <el-select
                v-model="filterDue"
                placeholder="到期状态"
                clearable
                size="small"
              >
                <el-option
                  label="即将到期"
                  value="即将到期"
                />
                <el-option
                  label="已过期"
                  value="已过期"
                />
                <el-option
                  label="正常"
                  value="正常"
                />
              </el-select>
            </div>
            <div class="equipment-list">
              <div
                v-for="item in filteredEquipment"
                :key="item.id"
                class="equipment-item"
                :class="{ 'active': selectedEquipment?.id === item.id }"
                @click="selectEquipment(item)"
              >
                <div class="item-header">
                  <span class="item-name">{{ item.name }}</span>
                  <el-tag
                    :type="getStatusType(item.status)"
                    size="small"
                  >
                    {{ item.status }}
                  </el-tag>
                </div>
                <div class="item-detail">
                  <span>编号: {{ item.id }}</span>
                  <span>类型: {{ item.type }}</span>
                </div>
                <div class="item-due">
                  <span :class="getDueClass(item.nextMaintenanceDate)">
                    下次保养: {{ formatDate(item.nextMaintenanceDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="section-title">
              <span>⚠️</span>待保养设备
            </h3>
            <el-tabs
              v-model="activeTab"
              class="due-tabs"
            >
              <el-tab-pane
                label="即将到期"
                name="due"
              >
                <template #label>
                  <span>即将到期</span>
                  <el-badge
                    :value="dueSoonCount"
                    :max="99"
                    type="warning"
                    class="tab-badge"
                  />
                </template>
                <div class="due-list">
                  <div
                    v-for="item in dueSoonEquipment"
                    :key="item.id"
                    class="due-item"
                    @click="selectEquipment(item)"
                  >
                    <span class="due-name">{{ item.name }}</span>
                    <span class="due-days">{{ getDaysDue(item.nextMaintenanceDate) }}天后到期</span>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane
                label="已过期"
                name="overdue"
              >
                <template #label>
                  <span>已过期</span>
                  <el-badge
                    :value="overdueCount"
                    :max="99"
                    type="danger"
                    class="tab-badge"
                  />
                </template>
                <div class="due-list">
                  <div
                    v-for="item in overdueEquipment"
                    :key="item.id"
                    class="due-item overdue"
                    @click="selectEquipment(item)"
                  >
                    <span class="due-name">{{ item.name }}</span>
                    <span class="due-days">已过期{{ Math.abs(getDaysDue(item.nextMaintenanceDate)) }}天</span>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="sidebar-section">
            <h3 class="section-title">
              <span>📝</span>保养模板
            </h3>
            <div class="template-list">
              <div
                v-for="template in mockData.maintenanceTemplates"
                :key="template.id"
                class="template-item"
              >
                <div class="template-name">
                  {{ template.name }}
                </div>
                <div class="template-cycle">
                  周期: {{ template.cycle }}天
                </div>
                <div class="template-content">
                  {{ template.content }}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="main-content">
          <div
            v-if="selectedEquipment"
            class="equipment-detail"
          >
            <div class="detail-header">
              <h2>{{ selectedEquipment.name }}</h2>
              <div class="detail-actions">
                <el-button
                  type="primary"
                  @click="showMaintenanceForm = true"
                >
                  <span>🔧</span>快速保养
                </el-button>
              </div>
            </div>

            <div class="detail-cards">
              <div class="info-card">
                <h3>基本信息</h3>
                <el-descriptions
                  :column="2"
                  border
                >
                  <el-descriptions-item label="设备编号">
                    {{ selectedEquipment.id }}
                  </el-descriptions-item>
                  <el-descriptions-item label="设备类型">
                    {{ selectedEquipment.type }}
                  </el-descriptions-item>
                  <el-descriptions-item label="所在位置">
                    {{ selectedEquipment.location }}
                  </el-descriptions-item>
                  <el-descriptions-item label="生产厂家">
                    {{ selectedEquipment.manufacturer }}
                  </el-descriptions-item>
                  <el-descriptions-item label="运行状态">
                    <el-tag :type="getStatusType(selectedEquipment.status)">
                      {{ selectedEquipment.status }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="购置日期">
                    {{ formatDate(selectedEquipment.purchaseDate) }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    label="下次保养"
                    :span="2"
                  >
                    <span :class="getDueClass(selectedEquipment.nextMaintenanceDate)">
                      {{ formatDate(selectedEquipment.nextMaintenanceDate) }}
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="template-card">
                <h3>保养模板</h3>
                <el-table
                  :data="mockData.maintenanceTemplates"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="name"
                    label="模板名称"
                  />
                  <el-table-column
                    prop="cycle"
                    label="周期(天)"
                    width="100"
                  />
                  <el-table-column
                    prop="content"
                    label="保养内容"
                  />
                </el-table>
              </div>
            </div>

            <div class="records-card">
              <h3>保养记录</h3>
              <el-timeline>
                <el-timeline-item
                  v-for="record in equipmentRecords"
                  :key="record.id"
                  :timestamp="formatDate(record.date)"
                  placement="top"
                >
                  <el-card>
                    <div class="record-content">
                      <div class="record-header">
                        <el-tag :type="getRecordStatusType(record.status)">
                          {{ record.type }}
                        </el-tag>
                        <span class="record-executor">执行人: {{ record.executor }}</span>
                      </div>
                      <div class="record-body">
                        <p>保养内容: {{ record.content }}</p>
                        <p
                          v-if="record.problem"
                          class="problem-text"
                        >
                          ⚠️ 发现问题: {{ record.problem }}
                        </p>
                        <p
                          v-if="record.result"
                          class="result-text"
                        >
                          ✅ 处理结果: {{ record.result }}
                        </p>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>

          <div
            v-else
            class="placeholder"
          >
            <span class="placeholder-icon">📋</span>
            <p>请从左侧选择设备查看详情</p>
          </div>
        </main>
      </div>
    </div>

    <el-dialog
      v-model="showMaintenanceForm"
      title="保养记录录入"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="maintenanceFormRef"
        :model="maintenanceForm"
        :rules="maintenanceRules"
        label-width="100px"
      >
        <el-form-item
          label="设备"
          prop="equipmentId"
        >
          <el-select
            v-model="maintenanceForm.equipmentId"
            placeholder="选择设备"
            style="width: 100%"
          >
            <el-option
              v-for="item in mockData.equipment"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="保养类型"
          prop="type"
        >
          <el-select
            v-model="maintenanceForm.type"
            placeholder="选择类型"
            style="width: 100%"
          >
            <el-option
              v-for="template in mockData.maintenanceTemplates"
              :key="template.id"
              :label="template.name"
              :value="template.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="保养日期"
          prop="date"
        >
          <el-date-picker
            v-model="maintenanceForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          label="保养内容"
          prop="content"
        >
          <el-input
            v-model="maintenanceForm.content"
            type="textarea"
            :rows="3"
            placeholder="请输入保养内容"
          />
        </el-form-item>

        <el-form-item label="发现问题">
          <el-input
            v-model="maintenanceForm.problem"
            type="textarea"
            :rows="2"
            placeholder="如发现问题请详细说明"
          />
        </el-form-item>

        <el-form-item label="处理结果">
          <el-input
            v-model="maintenanceForm.result"
            type="textarea"
            :rows="2"
            placeholder="如进行了处理请说明结果"
          />
        </el-form-item>

        <el-form-item
          label="执行人员"
          prop="executor"
        >
          <el-input
            v-model="maintenanceForm.executor"
            placeholder="请输入执行人员姓名"
          />
        </el-form-item>

        <el-form-item
          label="保养状态"
          prop="status"
        >
          <el-radio-group v-model="maintenanceForm.status">
            <el-radio label="正常">
              正常
            </el-radio>
            <el-radio label="异常">
              异常
            </el-radio>
            <el-radio label="待处理">
              待处理
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="附件上传">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            multiple
          >
            <el-button icon="Upload">
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅用于演示，不实际上传
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showMaintenanceForm = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="submitMaintenance"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterDue = ref('')
const selectedEquipment = ref(null)
const activeTab = ref('due')
const showMaintenanceForm = ref(false)
const maintenanceFormRef = ref(null)

const maintenanceForm = reactive({
  equipmentId: '',
  type: '',
  date: '',
  content: '',
  problem: '',
  result: '',
  executor: '',
  status: '正常'
})

const maintenanceRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  type: [{ required: true, message: '请选择保养类型', trigger: 'change' }],
  date: [{ required: true, message: '请选择保养日期', trigger: 'change' }],
  content: [{ required: true, message: '请输入保养内容', trigger: 'blur' }],
  executor: [{ required: true, message: '请输入执行人员', trigger: 'blur' }],
  status: [{ required: true, message: '请选择保养状态', trigger: 'change' }]
}

const mockData = {
  equipmentTypes: [
    { id: 1, name: '拉丝机' },
    { id: 2, name: '漏板' },
    { id: 3, name: '卸筒' }
  ],
  equipment: [
    {
      id: 'LS101',
      name: '101拉丝机',
      type: '拉丝机',
      location: '1号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-01-15',
      nextMaintenanceDate: '2025-02-05'
    },
    {
      id: 'LS102',
      name: '102拉丝机',
      type: '拉丝机',
      location: '1号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-03-20',
      nextMaintenanceDate: '2025-02-10'
    },
    {
      id: 'LS103',
      name: '103拉丝机',
      type: '拉丝机',
      location: '2号通路',
      manufacturer: '天辰',
      status: '停机',
      purchaseDate: '2023-05-10',
      nextMaintenanceDate: '2025-02-15'
    },
    {
      id: 'LS104',
      name: '104拉丝机',
      type: '拉丝机',
      location: '2号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-07-25',
      nextMaintenanceDate: '2025-01-28'
    },
    {
      id: 'LB001',
      name: '101漏板',
      type: '漏板',
      location: '1号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-02-08',
      nextMaintenanceDate: '2025-02-03'
    },
    {
      id: 'LB002',
      name: '102漏板',
      type: '漏板',
      location: '1号通路',
      manufacturer: '天辰',
      status: '维护中',
      purchaseDate: '2023-04-15',
      nextMaintenanceDate: '2025-02-08'
    },
    {
      id: 'LB003',
      name: '103漏板',
      type: '漏板',
      location: '2号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-06-20',
      nextMaintenanceDate: '2025-02-12'
    },
    {
      id: 'LS201',
      name: '201拉丝机',
      type: '拉丝机',
      location: '2号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-01-30',
      nextMaintenanceDate: '2025-01-25'
    },
    {
      id: 'LS202',
      name: '202拉丝机',
      type: '拉丝机',
      location: '2号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-08-12',
      nextMaintenanceDate: '2025-02-18'
    },
    {
      id: 'LS303',
      name: '303拉丝机',
      type: '拉丝机',
      location: '3号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-10-05',
      nextMaintenanceDate: '2025-02-20'
    },
    {
      id: 'LS301',
      name: '301拉丝机',
      type: '拉丝机',
      location: '3号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-11-18',
      nextMaintenanceDate: '2025-02-25'
    },
    {
      id: 'LB004',
      name: '4号漏板',
      type: '漏板',
      location: '3号通路',
      manufacturer: '天辰',
      status: '运行中',
      purchaseDate: '2023-12-22',
      nextMaintenanceDate: '2025-01-30'
    }
  ],
  maintenanceTemplates: [
    { id: 1, name: '日常保养', cycle: 7, content: '检查油位、清洁滤网、检查紧固件' },
    { id: 2, name: '周检', cycle: 7, content: '全面检查各部件运行状态、检查电气线路' },
    { id: 3, name: '月检', cycle: 30, content: '更换润滑油、检查密封件、校准传感器' },
    { id: 4, name: '季检', cycle: 90, content: '全面保养、更换易损件、性能测试' },
    { id: 5, name: '年检', cycle: 365, content: '大保养、更换主要部件、系统升级' }
  ],
  maintenanceRecords: [
    {
      id: 1,
      equipmentId: 'LS101',
      type: '月检',
      date: '2025-01-05',
      content: '更换润滑油、检查密封件',
      problem: '发现密封件轻微磨损',
      result: '已更换新密封件',
      executor: '张三',
      status: '正常',
      attachment: ''
    },
    {
      id: 2,
      equipmentId: 'LS101',
      type: '周检',
      date: '2025-01-28',
      content: '全面检查各部件运行状态',
      problem: '',
      result: '',
      executor: '李四',
      status: '正常',
      attachment: ''
    },
    {
      id: 3,
      equipmentId: 'LB001',
      type: '周检',
      date: '2025-01-27',
      content: '检查漏板温度、流量计',
      problem: '发现温度波动较大',
      result: '已调整控制参数',
      executor: '王五',
      status: '正常',
      attachment: ''
    },
    {
      id: 4,
      equipmentId: 'LS201',
      type: '月检',
      date: '2025-01-20',
      content: '更换轴承润滑脂、检查绝缘',
      problem: '',
      result: '',
      executor: '赵六',
      status: '正常',
      attachment: ''
    },
    {
      id: 5,
      equipmentId: 'LS102',
      type: '周检',
      date: '2025-01-30',
      content: '全面检查各部件',
      problem: '发现传动带磨损',
      result: '已记录，计划更换',
      executor: '张三',
      status: '待处理',
      attachment: ''
    }
  ]
}

const filteredEquipment = computed(() => {
  return mockData.equipment.filter(item => {
    const matchSearch = !searchText.value || 
      item.name.includes(searchText.value) || 
      item.id.includes(searchText.value)
    const matchType = !filterType.value || item.type === filterType.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    
    let matchDue = true
    if (filterDue.value) {
      const daysDue = getDaysDue(item.nextMaintenanceDate)
      if (filterDue.value === '即将到期') {
        matchDue = daysDue >= 0 && daysDue <= 7
      } else if (filterDue.value === '已过期') {
        matchDue = daysDue < 0
      } else if (filterDue.value === '正常') {
        matchDue = daysDue > 7
      }
    }
    
    return matchSearch && matchType && matchStatus && matchDue
  })
})

const dueSoonEquipment = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return mockData.equipment.filter(item => {
    const nextDate = new Date(item.nextMaintenanceDate)
    return nextDate >= today && nextDate <= sevenDaysLater
  })
})

const overdueEquipment = computed(() => {
  const today = new Date()
  return mockData.equipment.filter(item => {
    const nextDate = new Date(item.nextMaintenanceDate)
    return nextDate < today
  })
})

const dueSoonCount = computed(() => dueSoonEquipment.value.length)

const overdueCount = computed(() => overdueEquipment.value.length)

const equipmentRecords = computed(() => {
  if (!selectedEquipment.value) return []
  return mockData.maintenanceRecords
    .filter(record => record.equipmentId === selectedEquipment.value.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

function selectEquipment(item) {
  selectedEquipment.value = item
  maintenanceForm.equipmentId = item.id
}

function getStatusType(status) {
  const map = {
    '运行中': 'success',
    '停机': 'info',
    '维护中': 'warning'
  }
  return map[status] || 'info'
}

function getDueClass(dateStr) {
  const daysDue = getDaysDue(dateStr)
  if (daysDue < 0) return 'text-danger'
  if (daysDue <= 7) return 'text-warning'
  return 'text-success'
}

function getDaysDue(dateStr) {
  const today = new Date()
  const dueDate = new Date(dateStr)
  const diffTime = dueDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRecordStatusType(status) {
  const map = {
    '正常': 'success',
    '异常': 'danger',
    '待处理': 'warning'
  }
  return map[status] || 'info'
}

function submitMaintenance() {
  maintenanceFormRef.value.validate((valid) => {
    if (valid) {
      mockData.maintenanceRecords.push({
        id: mockData.maintenanceRecords.length + 1,
        equipmentId: maintenanceForm.equipmentId,
        type: maintenanceForm.type,
        date: maintenanceForm.date,
        content: maintenanceForm.content,
        problem: maintenanceForm.problem,
        result: maintenanceForm.result,
        executor: maintenanceForm.executor,
        status: maintenanceForm.status,
        attachment: ''
      })
      
      ElMessage.success('保养记录保存成功')
      showMaintenanceForm.value = false
      
      Object.assign(maintenanceForm, {
        equipmentId: selectedEquipment.value?.id || '',
        type: '',
        date: '',
        content: '',
        problem: '',
        result: '',
        executor: '',
        status: '正常'
      })
    }
  })
}
</script>

<style scoped>
.maintenance-layout {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
  padding: 20px;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 104px);
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sidebar-section:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.search-box {
  margin-bottom: 12px;
}

.filter-box {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-box .el-select {
  flex: 1;
  min-width: 80px;
}

.equipment-list {
  max-height: 400px;
  overflow-y: auto;
}

.equipment-item {
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.equipment-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.equipment-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.item-detail {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.item-due {
  font-size: 12px;
}

.text-danger {
  color: #e53e3e;
  font-weight: 600;
}

.text-warning {
  color: #ed8936;
  font-weight: 600;
}

.text-success {
  color: #38a169;
}

.due-tabs {
  margin-top: 8px;
}

.tab-badge {
  margin-left: 8px;
}

.due-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 12px;
}

.due-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff7ed;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.due-item:hover {
  background: #ffedd5;
  transform: translateX(4px);
}

.due-item.overdue {
  background: #fef2f2;
}

.due-item.overdue:hover {
  background: #fee2e2;
}

.due-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 13px;
}

.due-days {
  font-size: 12px;
  color: #ed8936;
  font-weight: 600;
}

.due-item.overdue .due-days {
  color: #e53e3e;
}

.template-list {
  max-height: 300px;
  overflow-y: auto;
}

.template-item {
  padding: 12px;
  border-radius: 10px;
  background: #f0f9ff;
  margin-bottom: 8px;
  border-left: 4px solid #3b82f6;
}

.template-name {
  font-weight: 600;
  color: #1e3a8a;
  font-size: 14px;
  margin-bottom: 4px;
}

.template-cycle {
  font-size: 12px;
  color: #3b82f6;
  margin-bottom: 4px;
}

.template-content {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.equipment-detail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.info-card,
.template-card,
.records-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.records-card {
  grid-column: 1 / -1;
}

.info-card h3,
.template-card h3,
.records-card h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-content {
  padding: 8px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-executor {
  font-size: 13px;
  color: #718096;
}

.record-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
}

.problem-text {
  color: #ed8936 !important;
}

.result-text {
  color: #38a169 !important;
}

.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  min-height: 400px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder p {
  font-size: 16px;
  color: #718096;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .detail-cards {
    grid-template-columns: 1fr;
  }
}
</style>
