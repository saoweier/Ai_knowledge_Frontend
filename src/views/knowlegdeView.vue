<template>
  <div class="page">
    <el-card>
      <div class="header">
        <div class="brand">
          <img
            src="/expert.png"
            alt="expert"
          >
          <div>
            <div class="title">
              设备智能专家
            </div>
            <div class="subtitle">
              基于向量知识库 + LLM 的智能诊断
            </div>
          </div>
        </div>
        <el-button
          type="primary"
          size="small"
          style="margin-left: auto;"
          @click="goToUserManagement"
        >
          用户管理
        </el-button>
      </div>
    </el-card>

    <el-card class="mt-2">
      <h3>知识库管理</h3>
      <el-form
        :inline="true"
        class="mt-1"
      >
        <el-form-item>
          <el-input
            v-model="searchQuery"
            placeholder="输入搜索关键词"
            clearable
            @keyup.enter="searchChunks"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="searchChunks"
          >
            搜索
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="mt-1">
        <el-button
          type="success"
          @click="showCreateDialog"
        >
          新增知识点
        </el-button>
        <el-upload
          :action="`/upload/image`"
          :http-request="uploadImage"
          accept="image/*,video/*"
          :show-file-list="false"
          style="display: inline-block; margin-left: 10px;"
        >
          <el-button type="info">
            上传图片/视频
          </el-button>
        </el-upload>
        <el-upload
          :action="`/collections/final_chunk_knowledge_v1.1/import`"
          :http-request="importData"
          accept=".json"
          :show-file-list="false"
          style="display: inline-block; margin-left: 10px;"
        >
          <el-button type="warning">
            导入JSON
          </el-button>
        </el-upload>
        <el-button
          type="danger"
          style="margin-left: 10px;"
          @click="exportData"
        >
          导出JSON
        </el-button>
      </div>

      <el-table
        :data="chunks"
        class="mt-2"
        stripe
        :loading="loading"
      >
        <el-table-column
          prop="payload.chunk_id"
          label="Chunk ID"
          width="200"
        />
        <el-table-column
          prop="payload.content"
          label="内容"
          show-overflow-tooltip
        />
        <el-table-column
          label="多媒体"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.payload.image_path"
              size="small"
            >
              有附件
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="payload.created_at"
          label="创建时间"
          width="160"
        />
        <el-table-column
          prop="payload.updated_at"
          label="更新时间"
          width="160"
        />
        <el-table-column
          label="操作"
          width="200"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteChunk(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <div class="pagination-info">
          共 {{ total }} 条记录，当前第 {{ currentPage }} 页
        </div>
        <div class="pagination-controls">
          <el-button 
            :disabled="currentPage === 1 || loading" 
            size="small"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            :disabled="currentPage === 1 || loading" 
            size="small"
            @click="goToPrevPage"
          >
            上一页
          </el-button>
          <span class="page-indicator">{{ currentPage }} / {{ totalPages || '?' }}</span>
          <el-button 
            :disabled="!hasNextPage || loading" 
            size="small"
            @click="goToNextPage"
          >
            下一页
          </el-button>
          <el-button 
            :disabled="currentPage === totalPages || loading || !totalPages" 
            size="small"
            @click="goToLastPage"
          >
            末页
          </el-button>
          <div class="page-size-selector">
            <span>每页</span>
            <el-select
              v-model="pageSize"
              size="small"
              style="width: 80px; margin: 0 8px;"
              @change="handlePageSizeChange"
            >
              <el-option
                :value="10"
                label="10"
              />
              <el-option
                :value="20"
                label="20"
              />
              <el-option
                :value="50"
                label="50"
              />
              <el-option
                :value="100"
                label="100"
              />
            </el-select>
            <span>条</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="智能总结辅助">
          <el-switch
            v-model="form.use_llm_assist"
            active-text="启用"
            inactive-text="禁用"
          />
          <el-tooltip
            content="启用后将通过 LLM 自动规整内容并补全 Chunk ID、Topic、Category 等字段。"
            placement="top"
          >
            <el-icon style="margin-left: 8px;">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          label="Chunk ID"
          prop="chunk_id"
        >
          <el-input
            v-model="form.chunk_id"
            placeholder="请输入Chunk ID"
          />
        </el-form-item>
        <el-form-item
          label="内容"
          prop="content"
        >
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item
          label="类别"
          prop="category"
        >
          <el-select
            v-model="form.category"
            placeholder="选择或输入类别"
            style="width: 100%;"
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片/视频路径"
          prop="image_path"
        >
          <el-input
            v-model="form.image_path"
            placeholder="上传后自动生成，也可手动输入"
          >
            <template #append>
              <el-upload
                :action="`/upload/image`"
                :http-request="uploadImage"
                accept="image/*,video/*"
                :show-file-list="false"
              >
                <el-button :icon="Plus" />
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import http from '@/api/http2';
import { QuestionFilled, Plus } from '@element-plus/icons-vue'; // 确保引入图标
// import { useUserStore } from '@/stores/user';

// Router 和用户存储
const router = useRouter();
// const user = useUserStore();

// 状态
const searchQuery = ref('');
const chunks = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增知识点');

// 游标管理 - 使用栈结构存储游标历史
const cursorStack = ref([null]); // 第一页的游标是 null
const nextCursor = ref(null); // 当前页的下一页游标
const hasNextPage = ref(true); // 是否有下一页

// 计算总页数
const totalPages = computed(() => {
  if (!total.value || !pageSize.value) return 0;
  return Math.ceil(total.value / pageSize.value);
});

const form = reactive({
  id: '',
  chunk_id: '',
  content: '',
  tags: [],
  topic: '',
  entity: [],
  related_chunks: [],
  source_file: '',
  source_type: '',
  type: '',
  image_path: '',
  category: '',
  use_llm_assist: false,
});

const formRef = ref(null);
const formRules = {
  chunk_id: [{ required: true, message: '请输入Chunk ID', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
};

const categoryOptions = ref([]);

// 导航
const goToUserManagement = () => {
  router.push('/usermanage');
};

// 获取动态选项
const fetchOptions = async () => {
  try {
    const response = await http.get('/collections/final_chunk_knowledge_v1.1/stats');
    const fieldStats = response.data.field_stats;
    categoryOptions.value = fieldStats.category?.sample_values || [];
  } catch (error) {
    ElMessage.error('获取选项失败');
    console.error('请求发生错误:', error);
  }
};

// 获取总数
const fetchTotalCount = async () => {
  try {
    const response = await http.get('/collections/final_chunk_knowledge_v1.1/count');
    total.value = response.data.count;
  } catch (error) {
    console.warn('无法获取总数');
  }
};

// 获取知识点列表 - 修复版
const fetchChunks = async (cursor = null, pageNum = null) => {
  loading.value = true;
  try {
    // 构造请求参数
    const params = {
      limit: pageSize.value,
      search: searchQuery.value || undefined
    };

    // 优先级判断：如果传入了pageNum，说明是跳转模式（首页、末页或重置）
    if (pageNum !== null) {
      params.page = pageNum;
    } 
    // 否则如果传入了 cursor，说明是基于游标的顺序翻页（上一页、下一页）
    else if (cursor !== null) {
      params.offset = cursor;
    }

    console.log('请求参数:', params);

    const response = await http.get(`/collections/final_chunk_knowledge_v1.1/points`, { params });
    const resData = response.data;

    // 1. 更新表格数据
    if (resData.points && Array.isArray(resData.points)) {
      chunks.value = resData.points.map(item => ({
        ...item,
        payload: {
          ...item.payload,
          tags: Array.isArray(item.payload?.tags) ? item.payload.tags : [],
        }
      }));
    } else {
      chunks.value = [];
    }

    // 2. 更新总数
    if (resData.total_count !== undefined) {
      total.value = resData.total_count;
    }

    // 3. 更新游标状态
    nextCursor.value = resData.next_offset;
    hasNextPage.value = !!resData.next_offset && chunks.value.length === pageSize.value;

    // 4. 重要：如果是页码跳转模式，需要重置游标栈
    if (pageNum !== null) {
      currentPage.value = pageNum;
      cursorStack.value = [null]; // 重置栈，第一页永远是 null
      // 如果跳转的是非第一页，且有后续游标，可以把当前结果的逻辑接入
      if (pageNum > 1 && resData.next_offset) {
          // 这里不做复杂处理，保持简单：跳转后重新建立游标链
      }
    }

  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 首页跳转
const goToPage = async (page) => {
  if (page === 1) {
    await fetchChunks(null, 1); // 传入 pageNum = 1
  }
};

// 末页跳转
const goToLastPage = async () => {
  if (loading.value || !totalPages.value) return;
  const last = totalPages.value;
  if (currentPage.value === last) return;
  
  await fetchChunks(null, last); // 传入 pageNum = last
};

// 下一页 (基于游标)
const goToNextPage = async () => {
  if (!hasNextPage.value || loading.value || !nextCursor.value) return;
  
  const currentCursor = nextCursor.value;
  cursorStack.value.push(currentCursor);
  currentPage.value++;
  await fetchChunks(currentCursor, null); // 传 cursor，不传 pageNum
};

// 上一页 (基于栈)
const goToPrevPage = async () => {
  if (currentPage.value <= 1 || loading.value) return;

  if (cursorStack.value.length > 1) {
    cursorStack.value.pop(); // 弹出当前页游标
    currentPage.value--;
    const prevCursor = cursorStack.value[cursorStack.value.length - 1];
    await fetchChunks(prevCursor, null);
  } else {
    // 兜底方案：如果栈空了（比如刚跳转完末页），使用页码向前推
    await fetchChunks(null, currentPage.value - 1);
  }
};


// 处理每页条数变化
const handlePageSizeChange = async () => {
  // 重置到第一页
  currentPage.value = 1;
  cursorStack.value = [null];
  await fetchChunks(null);
};

// 搜索知识点
const searchChunks = async () => {
  currentPage.value = 1;
  cursorStack.value = [null];
  
  if (!searchQuery.value.trim()) {
    await fetchChunks(null);
    return;
  }
  
  loading.value = true;
  try {
    const response = await http.post(`/collections/final_chunk_knowledge_v1.1/search`, {
      query: searchQuery.value,
      limit: pageSize.value,
      score_threshold: 0.5,
    });

    chunks.value = (response.data?.results || []).map(item => ({
      ...item,
      payload: {
        ...item.payload,
      },
    }));
    total.value = response.data?.count || 0;
    hasNextPage.value = false; // 搜索结果不支持翻页
  } catch (error) {
    ElMessage.error('搜索失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = async () => {
  searchQuery.value = '';
  currentPage.value = 1;
  cursorStack.value = [null];
  await fetchTotalCount();
  await fetchChunks(null);
};

// 显示新增对话框
const showCreateDialog = () => {
  dialogTitle.value = '新增知识点';
  Object.keys(form).forEach(key => {
    if (key === 'use_llm_assist') {
      form[key] = false;
    } else {
      form[key] = Array.isArray(form[key]) ? [] : '';
    }
  });
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = async (row) => {
  dialogTitle.value = '编辑知识';
  dialogVisible.value = false;
  
  await nextTick();
  
  Object.assign(form, {
    id: row.id,
    chunk_id: row.payload.chunk_id || '',
    content: row.payload.content || '',
    tags: row.payload.tags || [],
    topic: row.payload.topic || '',
    entity: row.payload.entity || [],
    related_chunks: row.payload.related_chunks || [],
    source_file: row.payload.source_file || '',
    source_type: row.payload.source_type || '',
    type: row.payload.type || '',
    image_path: row.payload.image_path || '',
    category: row.payload.category || '',
    use_llm_assist: false,
  });
  
  dialogVisible.value = true;
};

// 相似度检查函数
const checkSimilarity = async () => {
  try {
    const requestBody = {
      payload: {
        title: form.topic,
        content: form.content,
        image_path: form.image_path,
        tags: form.tags || [],
        metadata: {
          chunk_id: form.chunk_id,
          entity: form.entity || {},
          related_chunks: form.related_chunks || [],
          source_file: form.source_file,
          source_type: form.source_type,
          type: form.type,
        },
      },
      use_llm_assist: form.use_llm_assist
    };

    const res = await http.post(
      `/collections/final_chunk_knowledge_v1.1/check_similarity`,
      { requestBody }
    );

    return res.data;
  } catch (error) {
    console.error('相似度检查失败:', error);
    throw error;
  }
};

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;

  try {
    if (!form.id) {
      const similarityResult = await checkSimilarity();
      
      if (similarityResult.similar_point) {
        const { id, score, content_snippet, chunk_id } = similarityResult.similar_point;
        
        try {
          await ElMessageBox.confirm(
            `检测到高度相似的现有知识点（${id}）！相似度：${(score * 100).toFixed(2)}%）：
            
Chunk ID: ${chunk_id}
内容片段: ${content_snippet}

是否继续创建新知识点？`,
            '相似内容提醒',
            {
              confirmButtonText: '继续创建',
              cancelButtonText: '取消',
              type: 'warning',
              dangerouslyUseHTMLString: false,
              distinguishCancelAndClose: true,
            }
          );
        } catch (error) {
          ElMessage.info('已取消创建');
          loading.value = false;
          return;
        }
      }
    }

    const payload = {
      title: form.topic,
      content: form.content,
      image_path: form.image_path,
      tags: form.tags || [],
      metadata: {
        chunk_id: form.chunk_id,
        entity: form.entity || {},
        related_chunks: form.related_chunks || [],
        source_file: form.source_file,
        source_type: form.source_type,
        type: form.type,
      },
    };

    const requestBody = {
      payload,
      use_llm_assist: form.use_llm_assist
    };

    if (form.id) {
      await http.put(
        `/collections/final_chunk_knowledge_v1.1/points/${form.id}`,
        requestBody
      );
      ElMessage.success('更新成功');
    } else {
      const res = await http.post(
        `/collections/final_chunk_knowledge_v1.1/points`,
        requestBody
      );
      ElMessage.success('创建成功');
      if (res?.data?.id) {
        form.id = res.data.id;
      }
    }

    dialogVisible.value = false;
    await fetchChunks(cursorStack.value[cursorStack.value.length - 1]);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(form.id ? '更新失败' : '创建失败');
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};

// 删除知识点
const deleteChunk = (id) => {
  ElMessageBox.confirm('确定删除此知识点？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true;
    try {
      await http.delete(`/collections/final_chunk_knowledge_v1.1/points/${id}`);
      ElMessage.success('删除成功');
      await fetchChunks(cursorStack.value[cursorStack.value.length - 1]);
    } catch (error) {
      ElMessage.error('删除失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  });
};

// 修改：上传图片/视频
const uploadImage = async (options) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    const response = await http.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    // 更新表单路径
    form.image_path = response.data.path;
    
    if (response.data.type === 'video') {
        ElMessage.success('视频上传成功');
    } else {
        ElMessage.success('图片上传成功');
    }
  } catch (error) {
    ElMessage.error('上传失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 导入数据
const importData = async (options) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    const response = await http.post(`/collections/final_chunk_knowledge_v1.1/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    ElMessage.success(`导入成功，导入 ${response.data.imported_count} 条数据`);
    currentPage.value = 1;
    cursorStack.value = [null];
    await fetchChunks(null);
  } catch (error) {
    ElMessage.error('导入失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 导出数据
const exportData = async () => {
  loading.value = true;
  try {
    const response = await http.get(`/collections/final_chunk_knowledge_v1.1/export`);
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge_export_${new Date().toISOString()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(async () => {
  await fetchOptions();
  await fetchTotalCount();
  await fetchChunks(null);
});
</script>

<style scoped>
.page {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand img {
  width: 48px;
  height: 48px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.mt-1 {
  margin-top: 16px;
}

.mt-2 {
  margin-top: 24px;
}

/* 改进的分页样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;
}

.pagination-info {
  color: #606266;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-indicator {
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

.page-size-selector {
  display: flex;
  align-items: center;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid #dcdfe6;
  color: #606266;
  font-size: 14px;
}
</style>