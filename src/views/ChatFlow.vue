<template>
  <div class="page dashboard-container">
    <!-- 移除原top-header -->
    
    <div class="main-body">
      <!-- 左侧折叠式导航栏 -->
      <aside class="sidebar-tabs">
        <div class="tab-buttons">
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'faq' }"
            @click.stop="toggleTab('faq')"
          >
            <el-icon><QuestionFilled /></el-icon>
            <span class="tab-label">常见问题</span>
          </div>
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'error' }"
            @click.stop="toggleTab('error')"
          >
            <el-icon><Warning /></el-icon>
            <span class="tab-label">故障代码</span>
          </div>
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'history' }"
            @click.stop="toggleTab('history')"
          >
            <el-icon><Clock /></el-icon>
            <span class="tab-label">历史问题</span>
          </div>
          <div 
            class="tab-btn tab-btn-video" 
            :class="{ active: activeTab === 'mechanical' }"
            @click.stop="toggleTab('mechanical')"
          >
            <el-icon><InfoFilled /></el-icon>
            <span class="tab-label">机械拆装</span>
          </div>
        </div>

        <!-- 弹出面板 -->
        <transition name="slide">
          <div
            v-if="activeTab"
            class="tab-panel"
            @click.stop
          >
            <!-- 右侧全高关闭把手 -->
            <div
              class="panel-close-bar"
              @click="activeTab = null"
            >
              <div class="bar-bg" />
              <div class="modern-arrow" />
            </div>

            <div class="panel-header">
              <span>{{ panelTitle }}</span>
            </div>
            
            <div
              class="panel-content"
              :class="{ 'panel-content-mechanical': activeTab === 'mechanical' }"
            >
              <!-- 常见问题 -->
              <div
                v-if="activeTab === 'faq'"
                class="faq-list"
              >
                <div 
                  v-for="(faq, index) in deviceFaqs" 
                  :key="index" 
                  class="list-item" 
                  @click="handleFaqClick(faq)"
                >
                  <span>{{ faq }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <!-- 故障代码 -->
              <div
                v-if="activeTab === 'error'"
                class="error-list"
              >
                <div 
                  v-for="(error, index) in errorCodes" 
                  :key="index" 
                  class="list-item error-item"
                  @click="handleErrorClick(error)"
                >
                  <div class="error-code">
                    {{ error.code }}
                  </div>
                  <div class="error-desc">
                    {{ error.description }}
                  </div>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <!-- 故障流程卡片 -->
              <div
                v-if="activeTab === 'history'"
                class="history-list"
              >
                <div 
                  v-for="(historyItem, hidx) in chatHistory"
                  :key="hidx"
                  class="list-item"
                  @click="handleHistoryClick(historyItem.query)"
                >
                  <span>{{ historyItem.query }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <div
                v-if="activeTab === 'mechanical'"
                class="mechanical-panel"
              >

                <div
                  v-if="mechanicalVideoLoading"
                  class="mechanical-empty"
                >
                  正在加载机械拆装视频...
                </div>

                <div
                  v-else-if="!mechanicalVideoGroups.length"
                  class="mechanical-empty"
                >
                  暂未检测到机械拆装视频。
                </div>

                <template v-else>
                  <div class="mechanical-main">
                    <div class="mechanical-groups">
                      <section
                        v-for="group in mechanicalVideoGroups"
                        :key="group.key"
                        class="mechanical-group"
                        :class="{ expanded: expandedMechanicalGroups[group.key] }"
                      >
                        <button
                          type="button"
                          class="mechanical-group-toggle"
                          @click="toggleMechanicalGroup(group.key)"
                        >
                          <div>
                            <strong>{{ group.name }}</strong>
                            <span>{{ group.items.length }} 个视频</span>
                          </div>
                          <el-icon :class="{ expanded: expandedMechanicalGroups[group.key] }">
                            <ArrowRight />
                          </el-icon>
                        </button>

                        <div
                          v-if="expandedMechanicalGroups[group.key]"
                          class="mechanical-group-items"
                        >
                          <button
                            v-for="item in group.items"
                            :key="item.id"
                            type="button"
                            class="mechanical-video-item"
                            :class="{ active: selectedMechanicalVideo?.id === item.id }"
                            @click="selectMechanicalVideo(item)"
                          >
                            <span class="mechanical-video-title">{{ item.title }}</span>
                            <span class="mechanical-video-summary">{{ item.summary }}</span>
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </transition>
        <!-- 遮罩层 -->
        <transition name="fade">
          <div 
            v-if="activeTab" 
            class="panel-overlay" 
            @click.stop="activeTab = null"
          />
        </transition>
      </aside>


      <main class="chat-layout">
        <header
          class="flow-shell-header"
          :class="{ compact: messages.length > 0 }"
        >
          <div class="flow-shell-copy">
            <p class="flow-eyebrow">Flow 工作台</p>
            <h1>图谱诊断与分支推进</h1>
            <p class="flow-header-copy">围绕当前故障流程推进判断与操作，把主要空间留给消息和步骤卡片。</p>
          </div>
        </header>



        <!-- 聊天消息区域 -->
        <div
          ref="scrollContainer"
          class="chat-messages-container"
        >
          <div class="messages-wrapper">
            <section
              v-if="messages.length === 0"
              class="flow-empty-state"
            >
              <div class="flow-empty-card">
                <h2>先发起一个诊断问题，系统再给出下一步、成功/失败分支和终点提示。</h2>
                <p>可以直接输入故障现象、报警码，也可以通过语音说“下一步”“是”“否”来推进已经生成的流程。</p>
              </div>
              <div class="flow-starter-grid">
                <button
                  v-for="prompt in starterPrompts"
                  :key="prompt"
                  type="button"
                  class="flow-starter"
                  @click="handleFaqClick(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </section>

            <template
              v-for="(msg, idx) in messages"
              :key="idx"
            >
              <div
                v-if="msg.role==='user'"
                class="bubble user"
              >
                <div class="bubble-content">
                  {{ msg.text }}
                  <el-tag
                    v-if="msg.feedbackType"
                    :type="msg.feedbackType === 'SUCCESS' ? 'success' : 'warning'"
                    size="small"
                    class="ml-2"
                  >
                    {{ msg.feedbackType === 'SUCCESS' ? '✓ 是' : '✗ 否' }}
                  </el-tag>
                </div>
                <div class="meta">
                  {{ formatTime(msg.time) }}
                </div>
              </div>

              <div
                v-else
                class="bubble assistant"
              >
                <div class="assistant-avatar">
                  <img src="/expert.png">
                </div>
                
                <div class="assistant-content-box">
                  <div class="assistant-head">
                    <div
                      v-if="msg.guidance"
                      class="guidance mb-2"
                    >
                      <el-alert
                        :title="msg.guidance"
                        type="info"
                        show-icon
                        :closable="false"
                      />
                    </div>
                  </div>

                  <div
  v-if="msg.solution"
  class="solution flow-repair-card"
>
  <div class="flow-repair-header">
    <div class="flow-repair-agent">
      <div class="flow-repair-avatar">智</div>
      <div>
        <div class="flow-repair-title-row">
          <span class="flow-repair-agent-name">流程诊断助手</span>
          <span class="flow-repair-badge">ChatFlow</span>
        </div>
        <p class="flow-repair-time">{{ formatTime(msg.time) }}</p>
      </div>
    </div>
  </div>

  <div class="flow-repair-summary">
    <div class="flow-repair-note">流程诊断卡 · 单卡片推进</div>
    <div class="flow-repair-summary-box">
      <strong>{{ msg.solution.problem_summary }}</strong>
      <span>{{ getFlowSummaryText(msg.solution) }}</span>
    </div>
  </div>

  <template v-if="getOrderedFlowNodes(msg.solution).length">
    <div class="flow-shell">
      <div class="flow-step-strip">
        <button
          v-for="(node, nodeIndex) in getOrderedFlowNodes(msg.solution)"
          :key="node.step_id"
          class="flow-step-pill"
          :class="{
            'is-active': isActiveFlowNode(msg, node),
            'is-current': isCurrentFlowNode(msg, node),
            'has-next': nodeIndex < getOrderedFlowNodes(msg.solution).length - 1,
            'has-binary-branches': getFlowNodeDisplayActions(node).length > 1
          }"
          @click="setActiveFlowStep(msg, node.step_id)"
        >
          <span class="flow-step-pill-index">{{ getFlowStepIndex(msg.solution, node.step_id) }}</span>
          <span class="flow-step-pill-copy">
            <strong>{{ node.title }}</strong>
            <small>{{ getFlowStepLabel(msg, node) }}</small>
            <span
              v-if="getFlowNodeDisplayActions(node).length"
              class="flow-step-branch-map"
              :class="{ 'is-binary': getFlowNodeDisplayActions(node).length > 1 }"
            >
              <span class="flow-step-branch-stem"></span>
              <span
                v-for="(action, actionIndex) in getFlowNodeDisplayActions(node)"
                :key="`${node.step_id}-${action.action_key}-pill`"
                class="flow-step-branch-row"
                :class="[
                  `tone-${getFlowActionTone(action)}`,
                  {
                    'is-top': actionIndex === 0,
                    'is-bottom': actionIndex === getFlowNodeDisplayActions(node).length - 1
                  }
                ]"
              >
                <span class="flow-step-branch-key">{{ getFlowActionMiniLabel(action) }}</span>
                <span class="flow-step-branch-link">{{ getFlowActionBranchLabel(msg.solution, action) }}</span>
              </span>
            </span>
          </span>
        </button>
      </div>

      <div
        v-if="getActiveFlowNode(msg)"
        class="flow-focus-panel"
        :class="{
          'is-current': isCurrentFlowNode(msg, getActiveFlowNode(msg)),
          'is-preview': !isCurrentFlowNode(msg, getActiveFlowNode(msg))
        }"
      >
        <div class="flow-focus-header">
          <div>
            <p class="flow-focus-kicker">
              步骤 {{ getFlowStepIndex(msg.solution, getActiveFlowNode(msg).step_id) }} / {{ getOrderedFlowNodes(msg.solution).length }}
            </p>
            <h4>{{ getActiveFlowNode(msg).title }}</h4>
          </div>
          <span class="flow-focus-state">
            {{ isCurrentFlowNode(msg, getActiveFlowNode(msg)) ? '当前执行' : '预览节点' }}
          </span>
        </div>

        <div class="flow-focus-layout">
          <div class="flow-focus-main">
            <p class="flow-focus-desc">{{ getActiveFlowNode(msg).description || '该步骤暂无补充说明。' }}</p>
            <p
              v-if="getActiveFlowNode(msg).condition"
              class="flow-focus-condition"
            >
              判断条件：{{ getActiveFlowNode(msg).condition }}
            </p>

            <div
              v-if="getActiveFlowNode(msg).images?.length"
              class="flow-focus-media"
            >
              <div
                v-for="(url, iidx) in getActiveFlowNode(msg).images"
                :key="`${getActiveFlowNode(msg).step_id}-${iidx}`"
                class="flow-focus-media-item"
              >
                <template v-if="isVideo(url)">
                  <video
                    :src="url"
                    controls
                    class="step-media-item step-video"
                    preload="metadata"
                    @click.stop
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </template>
                <template v-else>
                  <el-image
                    :src="url"
                    fit="cover"
                    class="step-media-item step-img-thumb"
                    :preview-src-list="getActiveFlowNode(msg).images.filter(u => !isVideo(u))"
                    :initial-index="getUiImageIndex(getActiveFlowNode(msg).images, url)"
                    :preview-teleported="true"
                    loading="lazy"
                  >
                    <template #placeholder>
                      <div class="image-slot">加载中...</div>
                    </template>
                  </el-image>
                </template>
              </div>
            </div>
          </div>

          <div
            v-if="(getActiveFlowNode(msg).actions || []).length"
            class="flow-focus-side"
          >
            <div class="flow-branch-section">
              <div class="flow-repair-note">当前步骤分支</div>
              <div
                class="flow-branch-grid"
              >
                <article
                  v-for="action in getActiveFlowNode(msg).actions"
                  :key="`${getActiveFlowNode(msg).step_id}-${action.action_key}`"
                  class="flow-branch-card"
                  :class="[`tone-${getFlowActionTone(action)}`]"
                >
                  <div class="flow-branch-card-head">
                    <span class="flow-action-button-copy">{{ action.is_terminal ? '终点步骤' : '目标步骤' }}</span>
                    <span class="flow-branch-kind">{{ action.is_terminal ? '终点' : '后续' }}</span>
                  </div>
                  <p class="flow-branch-card-title">{{ getFlowActionPreview(action) }}</p>
                  <button
                    v-if="isCurrentFlowNode(msg, getActiveFlowNode(msg))"
                    type="button"
                    class="flow-action-button"
                    :class="[`tone-${getFlowActionTone(action)}`]"
                    @click="handleFlowAction(msg, action)"
                  >
                    <span class="flow-action-button-label">{{ getFlowActionButtonText(action) }}</span>
                    <span class="flow-action-button-copy">{{ action.is_terminal ? '切换到终点说明' : '切换到下一节点' }}</span>
                  </button>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!(getActiveFlowNode(msg).actions || []).length"
          class="flow-branch-empty"
        >
          当前步骤没有可继续推进的分支。
        </div>

        <div
          v-if="msg.solution.inline_notice"
          class="flow-inline-notice"
        >
          {{ msg.solution.inline_notice }}
        </div>

        <div
          v-if="!isCurrentFlowNode(msg, getActiveFlowNode(msg))"
          class="flow-preview-tip"
        >
          当前展示的是预览节点。真正可执行的按钮始终挂在“当前执行”节点上。
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flow-repair-summary-box fallback">
      <strong>{{ msg.solution.problem_summary }}</strong>
      <span>{{ getFlowSummaryText(msg.solution) }}</span>
    </div>
    <div
      v-if="msg.solution.troubleshooting_steps?.length"
      class="flow-repair-fallback-steps"
    >
      <div
        v-for="(step, sidx) in msg.solution.troubleshooting_steps"
        :key="`fallback-${sidx}`"
        class="flow-repair-fallback-step"
      >
        <div class="flow-repair-fallback-step-head">
          <span class="flow-step-pill-index">{{ step.step_number || sidx + 1 }}</span>
          <strong>{{ step.title }}</strong>
        </div>
        <p>{{ step.description }}</p>
      </div>
    </div>
  </template>


<el-alert
                      v-if="msg.solution.escalation_info"
                      class="mt-1"
                      type="warning"
                      :title="msg.solution.escalation_info"
                      show-icon
                      :closable="false"
                    />
                    <el-collapse
                      v-if="msg.solution.related_knowledge?.length"
                      class="mt-2 knowledge-collapse"
                    >
                      <el-collapse-item
                        title="📚 相关知识（展开查看）"
                        name="rk"
                      >
                        <div
                          v-for="(rk, ridx) in msg.solution.related_knowledge"
                          :key="ridx"
                          class="rk-item"
                        >
                          <div class="rk-head">
                            <strong>{{ getKnowledgeDisplayTitle(rk, ridx, '参考项') }}</strong>
                            <el-tag
                              size="small"
                              effect="plain"
                            >
                              匹配度 {{ (rk.score ?? 0).toFixed(2) }}
                            </el-tag>
                          </div>
                          <div class="rk-content">
                            {{ formatKnowledgeContent(rk.content) }}
                          </div>
                          <img
                            v-if="rk.image_path"
                            :src="rk.image_path"
                            class="rk-image"
                          >
                          <el-divider />
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>

                  <div
                    v-else-if="msg.mechanicalVideo"
                    class="mechanical-message-card"
                  >
                    <div class="mechanical-message-head">
                      <div>
                        <p class="mechanical-detail-eyebrow">{{ msg.mechanicalVideo.group_name }} · {{ msg.mechanicalVideo.operation }}</p>
                        <h3>{{ msg.mechanicalVideo.title }}</h3>
                      </div>
                      <span class="mechanical-detail-file">{{ msg.mechanicalVideo.filename }}</span>
                    </div>
                    <p class="mechanical-detail-description">
                      {{ msg.mechanicalVideo.description || '描述待补充' }}
                    </p>
                    <div class="mechanical-knowledge">
                      <span
                        v-for="point in msg.mechanicalVideo.knowledge_points || []"
                        :key="point"
                        class="mechanical-knowledge-chip"
                      >
                        {{ point }}
                      </span>
                    </div>
                    <video
                      :src="msg.mechanicalVideo.video_url"
                      controls
                      class="mechanical-video-player mechanical-video-player-preview"
                      preload="metadata"
                      title="点击放大播放"
                      @click="openMechanicalVideoPreview(msg.mechanicalVideo)"
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>

                  <div
                    v-else-if="msg.results?.length"
                    class="related-knowledge compact-results"
                  >
                    <h4>Top 向量命中</h4>
                    <template v-if="hasOverviewGuide(msg.results)">
                      <div class="rk-card overview-card">
                        <div class="rk-header">
                          <strong>{{ getKnowledgeDisplayTitle(msg.results[0], 0, '结果') }}</strong>
                          <span>{{ formatScore(msg.results[0]?.score) }}</span>
                        </div>
                        <div class="rk-content">
                          {{ formatKnowledgeContent(msg.results[0]?.content) }}
                        </div>
                      </div>
                      <div
                        v-if="getOverviewChildren(msg.results).length"
                        class="knowledge-link-row"
                      >
                        <button
                          v-for="(rk, ridx) in getOverviewChildren(msg.results)"
                          :key="`${rk.chunk_id || 'child'}-${ridx}`"
                          type="button"
                          class="knowledge-link-btn"
                          :class="{ active: getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id === rk.chunk_id }"
                          @click="setSelectedKnowledge(`${idx}-results`, rk.chunk_id)"
                        >
                          {{ getKnowledgeDisplayTitle(rk, ridx, '细节') }}
                        </button>
                      </div>
                      <div
                        v-if="getSelectedKnowledge(`${idx}-results`, msg.results)"
                        class="rk-card detail-card"
                      >
                        <div class="rk-header">
                          <strong>{{ getKnowledgeDisplayTitle(getSelectedKnowledge(`${idx}-results`, msg.results), 0, '细节') }}</strong>
                          <span>{{ formatScore(getSelectedKnowledge(`${idx}-results`, msg.results)?.score) }}</span>
                        </div>
                        <div class="rk-content">
                          {{ formatKnowledgeContent(getSelectedKnowledge(`${idx}-results`, msg.results)?.content) }}
                        </div>
                        <div
                          v-if="getKnowledgeChildren(getSelectedKnowledge(`${idx}-results`, msg.results), msg.results).length"
                          class="knowledge-link-row nested"
                        >
                          <button
                            v-for="(item, nestedIndex) in getKnowledgeChildren(getSelectedKnowledge(`${idx}-results`, msg.results), msg.results)"
                            :key="`${item.chunk_id || 'nested'}-${nestedIndex}`"
                            type="button"
                            class="knowledge-link-btn secondary"
                            :class="{ active: getSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${idx}-results`, msg.results))?.chunk_id === item.chunk_id }"
                            @click="setSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, item.chunk_id)"
                          >
                            {{ getKnowledgeDisplayTitle(item, nestedIndex, '下一级') }}
                          </button>
                        </div>
                        <div
                          v-if="getSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${idx}-results`, msg.results))"
                          class="rk-card nested-detail-card"
                        >
                          <div class="rk-header">
                            <strong>{{ getKnowledgeDisplayTitle(getSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${idx}-results`, msg.results)), 0, '下一级') }}</strong>
                            <span>{{ formatScore(getSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${idx}-results`, msg.results))?.score) }}</span>
                          </div>
                          <div class="rk-content">
                            {{ formatKnowledgeContent(getSelectedKnowledge(`${idx}-results-${getSelectedKnowledge(`${idx}-results`, msg.results)?.chunk_id}`, msg.results, getSelectedKnowledge(`${idx}-results`, msg.results))?.content) }}
                          </div>
                        </div>
                        <div
                          v-if="isOverviewItem(getSelectedKnowledge(`${idx}-results`, msg.results)) && !getKnowledgeChildren(getSelectedKnowledge(`${idx}-results`, msg.results), msg.results).length"
                          class="knowledge-actions"
                        >
                          <button
                            type="button"
                            class="knowledge-drill-btn"
                            @click="drillIntoKnowledge(getSelectedKnowledge(`${idx}-results`, msg.results))"
                          >
                            继续查看下一层
                          </button>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-for="(rk, ridx) in msg.results"
                        :key="`${rk.chunk_id || 'result'}-${ridx}`"
                        class="rk-card"
                      >
                        <div class="rk-header">
                          <strong>{{ getKnowledgeDisplayTitle(rk, ridx, '结果') }}</strong>
                          <span>{{ formatScore(rk.score) }}</span>
                        </div>
                        <div class="rk-content">
                          {{ formatKnowledgeContent(rk.content) }}
                        </div>
                      </div>
                    </template>
                  </div>

                  <div
                    v-else
                    class="bubble-content-text"
                  >
                    {{ msg.text || '...' }}
                  </div>
                  <div class="meta">
                    {{ formatTime(msg.time) }}
                  </div>
                </div>
              </div>
            </template>

            <div
              v-if="loading"
              class="bubble assistant loading-bubble"
              aria-live="polite"
            >
              <div class="assistant-avatar thinking-avatar">
                <img
                  src="/expert.png"
                  alt="assistant thinking"
                >
              </div>

              <div class="assistant-content-box thinking-card flow-thinking-card">
                <div class="thinking-head">
                  <span class="thinking-kicker">流程推进中</span>
                  <strong>正在判断当前分支并生成下一步操作</strong>
                </div>
                <div class="thinking-wave" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div class="thinking-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p class="thinking-copy">系统正在结合当前反馈、流程节点和知识库内容整理下一张步骤卡。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div
            v-if="voiceEnabled || recognizedText || lastError"
            class="voice-briefing"
          >
            <div class="voice-briefing-main">
              <span
                class="voice-state-dot"
                :class="[voiceStatusTone, { pulsing: isRecording || isSpeaking }]"
              />
              <strong>语音状态：{{ voiceStateLabel }}</strong>
              <span v-if="voiceEnabled && recognizedText">已识别"{{ recognizedText }}"</span>
              <span v-else-if="voiceEnabled && lastError">{{ lastError }}</span>
              <span v-else-if="voiceEnabled && currentFlowGuidance">{{ currentFlowGuidance }}</span>
            </div>
            <div
              v-if="voiceEnabled"
              class="voice-briefing-side"
            >
              支持命令：下一步 / 是 / 否
            </div>
          </div>
          <MessageInput
            :loading="loading"
            :default-api="api"
            :default-options="options"
            :default-memory-limit="memoryLimit"
            :collection-options="collectionOptions"
            :collection-loading="collectionLoading"
            :is-recording="isRecording"
            :is-speaking="isSpeaking"
            :voice-enabled="voiceEnabled"
            :placeholder="'输入故障描述或直接说出流程指令，例如：下一步、是、否'"
            :context-hint="'支持：下一步 / 是 / 否'"
            :mode-label="'ChatFlow 流程'"
            :voice-state-label="voiceStateLabel"
            :voice-tone="voiceStatusTone"
            :recognized-text="recognizedText"
            :voice-error="lastError"
            @send="onSend"
            @clear="clearAll"
            @update:api="(v)=> api = v"
            @update:options="(v)=> options = v"
            @update:memory="(n)=> memoryLimit = n"
            @update:voice-enabled="(v) => handleVoiceToggle(v)"
            @mic-click="handleMicClick"
            @stop-speaking="stopSpeaking"
          />
          <div class="footer-note">
            内容由 AI 生成，请以现场实际情况为准。
            <span v-if="voiceEnabled" class="voice-status">
              | {{ voiceStateLabel }}
            </span>
          </div>
        </div>

        <el-dialog
          v-model="mechanicalPreviewVisible"
          width="min(960px, 92vw)"
          class="mechanical-preview-dialog"
          destroy-on-close
          align-center
        >
          <video
            v-if="expandedMechanicalVideo?.video_url"
            :src="expandedMechanicalVideo.video_url"
            controls
            autoplay
            class="mechanical-preview-player"
            preload="metadata"
          >
            您的浏览器不支持视频播放。
          </video>
        </el-dialog>
      </main>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight, Clock, QuestionFilled, Warning, InfoFilled } from '@element-plus/icons-vue'
import http from '@/api/http'
import MessageInput from '@/components/MessageInput.vue'
import { useVoiceController } from '@/composables/useVoiceController'

const messages = ref([])
const loading = ref(false)
const api = ref('search_flow_solution')
const options = ref({ enableLLM: false, collectionName: '', forceContent: 'fault_diagnosis', diversify: true })
const memoryLimit = ref(3)
const scrollContainer = ref(null)
const collectionOptions = ref([])
const collectionLoading = ref(false)
const selectedKnowledgeMap = ref({})

const {
  voiceEnabled,
  isRecording,
  isSpeaking,
  recognizedText,
  lastError,
  voiceStateLabel,
  voiceStatusTone,
  checkVoiceHealth,
  setVoiceEnabled,
  startWakeWordDetection,
  stopWakeWordDetection,
  startRecording,
  stopRecording,
  speakText,
  stopSpeaking,
  parseVoiceCommand
} = useVoiceController()

const lastFlowActionContext = ref(null)
const starterPrompts = [
    
]

const latestFlowMessage = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i -= 1) {
    const candidate = messages.value[i]
    if (candidate?.solution) return candidate
  }
  return null
})

const currentFlowGuidance = computed(() => {
  if (!voiceEnabled.value) return '语音控制已关闭，请先开启语音助手。'
  if (latestFlowMessage.value?.guidance) return latestFlowMessage.value.guidance
  return '可以直接说下一步或完成当前步骤。'
})

function getFlowGraph(solution) {
  return solution?.flow_graph || null
}

function getOrderedFlowNodes(solution) {
  const graph = getFlowGraph(solution)
  if (!graph) return []
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  const nodeMap = new Map(nodes.map((node) => [node.step_id, node]))
  const orderedIds = Array.isArray(graph.ordered_step_ids) ? graph.ordered_step_ids : []
  const ordered = orderedIds.map((id) => nodeMap.get(id)).filter(Boolean)
  return ordered.length ? ordered : nodes
}

function getFlowNodeById(solution, stepId) {
  return getOrderedFlowNodes(solution).find((node) => node.step_id === stepId) || null
}

function getCurrentFlowStepId(solution) {
  return solution?.current_step_id || getOrderedFlowNodes(solution)[0]?.step_id || ''
}

function getActiveFlowStepId(msg) {
  return msg?.activeStepId || getCurrentFlowStepId(msg?.solution)
}

function setActiveFlowStep(msg, stepId) {
  if (msg && stepId) msg.activeStepId = stepId
}

function getActiveFlowNode(msg) {
  return getFlowNodeById(msg?.solution, getActiveFlowStepId(msg)) || getFlowNodeById(msg?.solution, getCurrentFlowStepId(msg?.solution)) || getOrderedFlowNodes(msg?.solution)[0] || null
}

function isCurrentFlowNode(msg, node) {
  return !!node && node.step_id === getCurrentFlowStepId(msg?.solution)
}

function isActiveFlowNode(msg, node) {
  return !!node && node.step_id === getActiveFlowStepId(msg)
}

function getFlowStepIndex(solution, stepId) {
  const ordered = getOrderedFlowNodes(solution)
  const index = ordered.findIndex((node) => node.step_id === stepId)
  return index >= 0 ? index + 1 : '-'
}

function getFlowStepLabel(msg, node) {
  if (!node) return ''
  if (isCurrentFlowNode(msg, node)) return '当前步骤'
  if (isActiveFlowNode(msg, node)) return '查看中'
  if (node.is_terminal) return '终点节点'
  return '流程节点'
}

function getFlowSummaryText(solution) {
  const candidates = [solution?.flow_summary, solution?.quick_diagnosis]
    .map((item) => extractMainText(item || ''))
    .filter(Boolean)
  const problemSummary = extractMainText(solution?.problem_summary || '')
  const deduped = candidates.filter((item, index) => candidates.indexOf(item) === index && item !== problemSummary)
  return deduped[0] || candidates[0] || '已进入流程排查，请按照当前步骤继续处理。'
}
function getRawFlowActionText(action) {
  return action?.target_action_text || action?.terminal_message || ''
}

function getFlowActionText(action) {
  return extractMainText(getRawFlowActionText(action))
}

function getFlowActionBranchLabel(solution, action) {
  if (!action) return ''
  const targetIndex = action?.target_step_id ? getFlowStepIndex(solution, action.target_step_id) : ''
  if (targetIndex && targetIndex !== '-') return `${action.label}→${targetIndex}`
  return action.label || '分支'
}

function getFlowActionMiniLabel(action) {
  const normalized = String(action?.action_key || '').toUpperCase()
  if (normalized === 'IF_SUCCESS') return '成功'
  if (normalized === 'IF_FAILED') return '失败'
  return '下一步'
}

function getFlowActionOrder(action) {
  const normalized = String(action?.action_key || '').toUpperCase()
  if (normalized === 'IF_SUCCESS') return 0
  if (normalized === 'IF_FAILED') return 1
  return 2
}

function getFlowNodeDisplayActions(node) {
  if (!Array.isArray(node?.actions)) return []
  return [...node.actions].sort((left, right) => getFlowActionOrder(left) - getFlowActionOrder(right))
}

function getFlowActionPreview(action) {
  return action?.target_step_title || getFlowActionText(action) || (action?.is_terminal ? '流程在此结束' : '等待后端返回下一节点')
}


function getFlowActionButtonText(action) {
  const normalized = String(action?.action_key || '').toUpperCase()
  if (normalized === 'IF_SUCCESS') return '选择正常分支'
  if (normalized === 'IF_FAILED') return '选择异常分支'
  return '继续到下一步'
}

function mapFlowActionFeedback(actionKey) {
  const normalized = String(actionKey || '').toUpperCase()
  if (normalized === 'IF_SUCCESS') return 'SUCCESS'
  if (normalized === 'IF_FAILED') return 'FAILED'
  return 'NEXT'
}

function getFlowActionTone(action) {
  const normalized = String(action?.action_key || '').toUpperCase()
  if (normalized === 'IF_SUCCESS') return 'success'
  if (normalized === 'IF_FAILED') return 'danger'
  return 'primary'
}

function normalizeProgressiveSolution(ps) {
  if (!ps || typeof ps !== 'object') return ps

  if (typeof ps.images === 'string') {
    ps.images = ps.images.startsWith('[') ? JSON.parse(ps.images) : [ps.images]
  }

  if (Array.isArray(ps.related_knowledge)) {
    ps.related_knowledge = ps.related_knowledge.map((item) => {
      if (typeof item.image_path === 'string' && item.image_path.startsWith('[')) {
        try {
          const parsed = JSON.parse(item.image_path)
          item.image_path = Array.isArray(parsed) ? parsed[0] : parsed
        } catch {
          // ignore
        }
      }
      return item
    })
  }

  if (Array.isArray(ps.troubleshooting_steps)) {
    ps.troubleshooting_steps = ps.troubleshooting_steps.map((step) => {
      if (typeof step.images === 'string') {
        try {
          step.images = step.images.startsWith('[') ? JSON.parse(step.images) : [step.images]
        } catch {
          step.images = [step.images]
        }
      }
      return step
    })
  }

  if (ps.flow_graph && Array.isArray(ps.flow_graph.nodes)) {
    ps.flow_graph.nodes = ps.flow_graph.nodes.map((node) => {
      if (typeof node.images === 'string') {
        try {
          node.images = node.images.startsWith('[') ? JSON.parse(node.images) : [node.images]
        } catch {
          node.images = [node.images]
        }
      }
      return node
    })
  }

  return ps
}

function setVoiceActionContext(msg) {
  if (!msg?.solution) {
    lastFlowActionContext.value = null
    return
  }

  const activeNode = getActiveFlowNode(msg)
  if (!activeNode) {
    lastFlowActionContext.value = null
    return
  }

  lastFlowActionContext.value = {
    msg,
    step: activeNode
  }
}

function safeRunPostResponse(taskName, fn) {
  try {
    fn()
  } catch (error) {
    console.error(`[ChatFlow] post-response task failed: ${taskName}`, error)
  }
}

function handleFlowAction(msg, action) {
  if (!msg?.solution || !action) return

  const targetId = action?.target_step_id
  const targetNode = targetId ? getFlowNodeById(msg.solution, targetId) : null

  if (targetNode) {
    msg.solution.current_step_id = targetNode.step_id
    msg.solution.current_step_title = targetNode.title || msg.solution.current_step_title
    msg.activeStepId = targetNode.step_id
    msg.solution.inline_notice = ''
    if (targetNode?.images?.length) {
      msg.solution.images = targetNode.images
    }
    setVoiceActionContext(msg)
    return
  }

  msg.solution.inline_notice = getFlowActionText(action) || '当前分支没有配置可展示的后续步骤。'
  setVoiceActionContext(msg)
}

async function fetchCollections() {
  collectionLoading.value = true
  try {
    const response = await http.get('/kb/collections')
    const items = Array.isArray(response.data) ? response.data : []
    collectionOptions.value = items.map((item) => ({
      label: `${item.name}${typeof item.points_count === 'number' ? ` (${item.points_count})` : ''}`,
      value: item.name
    }))
  } catch (error) {
    console.error(error)
    collectionOptions.value = []
  } finally {
    collectionLoading.value = false
  }
}

async function handleVoiceToggle(enabled) {
  if (enabled) {
    const health = await checkVoiceHealth()
    if (!health.asrAvailable) {
      ElMessage.warning('语音识别依赖未就绪，当前无法启用语音助手')
      setVoiceEnabled(false)
      stopWakeWordDetection()
      stopSpeaking()
      return
    }
    if (!health.ttsAvailable) {
      ElMessage.info('当前仅可使用语音识别，语音播报未安装依赖')
    }
  }

  setVoiceEnabled(enabled)
  if (enabled) {
    startWakeWordDetection(() => {
      startRecording((text) => {
        const command = parseVoiceCommand(text)
        if (command && handleRecognizedFlowCommand(command)) return
        if (text) {
          onSend({ text, api: api.value, options: options.value })
        }
      })
    })
  } else {
    stopWakeWordDetection()
    stopSpeaking()
  }
}

function handleMicClick() {
  if (isRecording.value) {
    stopRecording()
  } else {
    stopSpeaking()
    startRecording((text) => {
      if (text) {
        const command = parseVoiceCommand(text)
        if (command && handleRecognizedFlowCommand(command)) return
        if (text) {
          onSend({ text, api: api.value, options: options.value })
        }
      }
    })
  }
}

function handleRecognizedFlowCommand(command) {
  const ctx = lastFlowActionContext.value
  if (!ctx?.msg || !ctx?.step) {
    ElMessage.warning('当前没有可推进的流程节点')
    return false
  }

  const action = (ctx.step.actions || []).find((item) => mapFlowActionFeedback(item.action_key) === command)
  if (!action) {
    ElMessage.warning('当前步骤不支持该语音指令')
    return false
  }

  handleFlowAction(ctx.msg, action)
  return true
}

async function speakGuidance(msg) {
  if (!voiceEnabled.value || isSpeaking.value) return
  
  const texts = []
  
  if (msg.guidance) {
    texts.push(msg.guidance)
  }
  
  if (msg.solution?.troubleshooting_steps?.length) {
    const step = msg.solution.troubleshooting_steps[0]
    if (step.title) texts.push(`当前步骤：${step.title}`)
    if (step.description) texts.push(`操作指南：${step.description}`)
    if (step.expected_result) texts.push(`预期结果：${step.expected_result}`)
  } else if (msg.text) {
    texts.push(msg.text)
  }
  
  const fullText = texts.join('。')
  
  if (fullText) {
    await speakText(fullText, () => {
      if (msg.solution?.troubleshooting_steps?.length) {
        setVoiceActionContext(msg)
      }
    })
  }
}
const currentFlowId = ref(null)
// ----------------------------------------------------------------------------------------------------------
// 左侧标签状态
const activeTab = ref(null)
const mechanicalVideoGroups = ref([])
const mechanicalVideoLoading = ref(false)
const selectedMechanicalVideo = ref(null)
const expandedMechanicalGroups = ref({})
const BACKEND_MEDIA_PORT = '8093'
const mechanicalPreviewVisible = ref(false)
const expandedMechanicalVideo = ref(null)


const deviceFaqs = ref([
    '拉丝机触摸屏报PLC异常',
    '拉丝机出现设备无法启动故障',
    '拉丝机出现成型不良或花纹异常',
    '拉丝机出现拉丝机触摸屏报急停状态',
    '拉丝机触摸屏报警当前轴涨块张开',
    '拉丝机触摸屏报警伺服报警',
    '故障代码 F7011',
    '故障代码 F7016',
    '故障代码 F7800',
    '故障代码 F7801',
]);

const errorCodes = ref([
  { code: 'F7011', description: '电机超温 报警' },
  { code: 'A7910', description: '电机超温 警告' },
  { code: 'F7016', description: '电机内部温度传感器报警' },
  { code: 'F7410', description: '电流环输出受限' },
  { code: 'F7800', description: '未检测到功率单元' },
  { code: 'F7801', description: '电机过电流' },
  { code: 'F7900', description: '电机堵转过载' },
  { code: 'F30001', description: '功率单元过电流' },
  { code: 'F30002', description: '功率单元直流母线过电压' },
  { code: 'F30003', description: '功率单元：直流母线欠压' },
  { code: 'F30005', description: '功率单元：过载' },
  { code: 'F30015', description: '电机动力线缆断相' },
  { code: 'F30036', description: '功率单元内部过热' },
  { code: 'F31885', description: '编码器通讯失败' },
  { code: 'F31875', description: '编码器 1 DRIVE-CLiQ (CU)：电源电压故障' },
  { code: 'F30021', description: '接地故障' },
  { code: '整流器故障', description: '整流器故障' }
])

const panelTitle = computed(() => {
  const titles = {
    faq: '常见问题',
    error: '故障代码',
    history: '历史案例',
    mechanical: '机械拆装'
  }
  return titles[activeTab.value] || ''
})

// 方法
const toggleTab = (tab) => {
  activeTab.value = activeTab.value === tab ? null : tab
}

function buildExpandedMechanicalGroups(groups) {
  const nextState = {}
  groups.forEach((group, index) => {
    nextState[group.key] = index === 0
  })
  return nextState
}

function getBackendMediaOrigin() {
  if (typeof window === 'undefined') return ''
  const { protocol, hostname, port, origin } = window.location
  if (!port || port === BACKEND_MEDIA_PORT) return origin
  return `${protocol}//${hostname}:${BACKEND_MEDIA_PORT}`
}

function normalizeMediaUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value
  }

  const cleanedPath = value.startsWith('/api/uploads/') ? value.replace(/^\/api/, '') : value
  if (cleanedPath.startsWith('/uploads/')) {
    return `${getBackendMediaOrigin()}${cleanedPath}`
  }
  return cleanedPath
}

function normalizeMechanicalVideo(item) {
  if (!item) return null
  return {
    ...item,
    video_url: normalizeMediaUrl(item.video_url)
  }
}

function showMechanicalVideoMessage(item) {
  const normalizedItem = normalizeMechanicalVideo(item)
  if (!normalizedItem) return

  selectedMechanicalVideo.value = normalizedItem
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage?.mechanicalVideo?.id === normalizedItem.id) {
    lastMessage.mechanicalVideo = normalizedItem
    lastMessage.time = Date.now()
  } else {
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: normalizedItem.description || normalizedItem.title,
      mechanicalVideo: normalizedItem
    })
  }
  scrollToLatestMessage()
}

function openMechanicalVideoPreview(item) {
  expandedMechanicalVideo.value = normalizeMechanicalVideo(item)
  if (!expandedMechanicalVideo.value?.video_url) return
  mechanicalPreviewVisible.value = true
}

async function fetchMechanicalVideos() {
  mechanicalVideoLoading.value = true
  try {
    const response = await http.get('/mechanical-videos')
    const groups = (Array.isArray(response.data?.groups) ? response.data.groups : []).map((group) => ({
      ...group,
      items: Array.isArray(group.items) ? group.items.map(normalizeMechanicalVideo) : []
    }))
    mechanicalVideoGroups.value = groups
    expandedMechanicalGroups.value = buildExpandedMechanicalGroups(groups)
    selectedMechanicalVideo.value = null
  } catch (error) {
    console.error(error)
    mechanicalVideoGroups.value = []
    expandedMechanicalGroups.value = {}
    selectedMechanicalVideo.value = null
    ElMessage.error('机械拆装视频加载失败')
  } finally {
    mechanicalVideoLoading.value = false
  }
}

function toggleMechanicalGroup(groupKey) {
  expandedMechanicalGroups.value = {
    ...expandedMechanicalGroups.value,
    [groupKey]: !expandedMechanicalGroups.value[groupKey]
  }
}

function selectMechanicalVideo(item) {
  showMechanicalVideoMessage(item)
}
// --- 新增历史记录状态 ---
const chatHistory = ref([
    { id: 1, query: '拉丝机速度异常故障诊断流程', time: Date.now() },
    { id: 2, query: '电机过热如何处理？', time: Date.now() - 3600000 },
    { id: 3, query: '最新的设备保养手册', time: Date.now() - 7200000 },
])
// --- end 新增历史记录状态 ---

// 辅助函数：当用户发送新消息时，更新历史记录
function updateHistory(query) {
    // 限制历史记录数量，例如只保留最新的 5 条
    if (chatHistory.value.length >= 5) {
        chatHistory.value.pop() // 移除最旧的
    }
    // 添加新的记录
    chatHistory.value.unshift({ 
        id: Date.now(), 
        query: query, 
        time: Date.now() 
    })
}
// ----------------------------------------------------------------------------------------------------------
// 处理常见问题点击
function handleFaqClick(faqText) {
  onSend({
    text: faqText,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// 处理故障代码点击
function handleErrorClick(errorObj) {
  onSend({
    text: `${errorObj.code} ${errorObj.description}`,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// 处理历史记录点击
function handleHistoryClick(queryText) {
  onSend({
    text: queryText,
    api: api.value,
    options: options.value
  })
  activeTab.value = null
}
// ----------------------------------------------------------------------------------------------------------
function scrollToLatestMessage() {
  if (!scrollContainer.value) return
  
  nextTick(() => {
    const bubbles = scrollContainer.value.querySelectorAll('.bubble')
    if (bubbles.length > 0) {
      const latestBubble = bubbles[bubbles.length - 1]
      latestBubble.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
// 主请求逻辑
async function onSend({ text, api: whichApi, options: opt, displayText }) {
  if (!text?.trim()) return
  const shownText = displayText || text
  messages.value.push({ role: 'user', text: shownText, time: Date.now() })
  scrollToLatestMessage()

  const endpoint = whichApi === 'search_flow_solution' ? '/search_flow_solution' : '/search'
  const lastN = pickContext(messages.value, memoryLimit.value)

  const params = {
    query_text: text,
    enable_llm_integration: !!opt.enableLLM,
    collection_name: opt.collectionName || undefined,
    force_content_type: opt.forceContent || undefined,
    diversify_results: whichApi === 'search' ? !!opt.diversify : undefined,
    context_json: JSON.stringify(lastN)
  }

  loading.value = true
  try {
    const resp = await http.get(endpoint, { params })
    const data = resp.data || {}

    // 更新当前流程 ID
    if (data.current_flow_id) {
      currentFlowId.value = data.current_flow_id
    }

    if (data.progressive_solution) {
      const ps = normalizeProgressiveSolution(data.progressive_solution)
      console.log('🟢 收到 progressive_solution：', ps)
      console.log('🟢 current_flow_id:', data.current_flow_id)

      const newMsg = {
        role: 'assistant',
        time: Date.now(),
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        solution: ps,
        results: Array.isArray(data.results) ? data.results : [],
        currentFlowId: data.current_flow_id,
        activeStepId: getCurrentFlowStepId(ps)
      }
      if (newMsg.solution) newMsg.solution.inline_notice = ''
      messages.value.push(newMsg)
      safeRunPostResponse('setVoiceActionContext', () => setVoiceActionContext(newMsg))
      safeRunPostResponse('speakGuidance', () => {
        void speakGuidance(newMsg)
      })
    }
    else {
      const newMsg = {
        role: 'assistant',
        time: Date.now(),
        results: Array.isArray(data.results) ? data.results : [],
        guidance: data.guidance || '',
        query_intent: data.query_intent || '',
        text: data.answer || data.message || '（无可展示内容）'
      }
      messages.value.push(newMsg)
      safeRunPostResponse('speakGuidance', () => {
        void speakGuidance(newMsg)
      })
    }
    updateHistory(shownText);
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败，请检查后端服务或控制台日志')
    messages.value.push({
      role: 'assistant',
      time: Date.now(),
      text: '❌ 请求失败，请稍后重试。'
    })
    scrollToLatestMessage()
  } finally {
    loading.value = false
  }
}



// 逻辑 A：是否是标准的二叉分支（成功/失败同时存在，且都不是终点）
// 优先级最高：如果满足此条件，忽略 if_next_step，避免混淆
function clearAll() {
  messages.value = []
  currentFlowId.value = null
  lastFlowActionContext.value = null
  stopSpeaking()

}
function formatScore(score) {
  const value = Number(score)
  return Number.isFinite(value) ? value.toFixed(3) : '0.000'
}

function getKnowledgeDisplayTitle(item, index, fallbackPrefix = '结果') {
  return item?.title || item?.chunk_id || `${fallbackPrefix} ${index + 1}`
}

function formatKnowledgeContent(content) {
  return String(content || '')
    .replace(/\|/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isOverviewItem(item) {
  return /overview/i.test(String(item?.chunk_id || ''))
}

function hasOverviewGuide(items) {
  return Array.isArray(items) && items.length > 1 && isOverviewItem(items[0])
}

function getOverviewChildren(items) {
  if (!hasOverviewGuide(items)) return []
  const root = items[0]
  const directChildren = getKnowledgeChildren(root, items)
  return directChildren.length ? directChildren : items.slice(1)
}

function getKnowledgeChildren(parentItem, items) {
  if (!parentItem || !Array.isArray(items)) return []
  const parentId = String(parentItem?.chunk_id || '')
  if (!parentId) return []
  return items.filter((item) => String(item?.metadata?.parent_chunk_id || '') === parentId)
}

function setSelectedKnowledge(key, chunkId) {
  selectedKnowledgeMap.value = {
    ...selectedKnowledgeMap.value,
    [key]: chunkId
  }
}

function getSelectedKnowledge(key, items, parentItem = null) {
  const children = parentItem ? getKnowledgeChildren(parentItem, items) : getOverviewChildren(items)
  if (!children.length) return null
  const selectedId = selectedKnowledgeMap.value[key]
  return children.find((item) => item.chunk_id === selectedId) || children[0]
}

function drillIntoKnowledge(item) {
  if (!item) return
  onSend({
    text: `__kb_drill__:${item?.chunk_id || ''} ${item?.title || ''}`.trim(),
    displayText: `继续查看：${item?.title || item?.chunk_id || ''}`,
    api: api.value,
    options: options.value
  })
}

// 提取上下文
function pickContext(all, n) {
  const recent = all.slice(-n)
  return recent.map((m) => {
    if (m.role === 'user') return { role: 'user', content: m.text }
    if (m.solution?.troubleshooting_steps?.length) {
      const titles = m.solution.troubleshooting_steps.map(s => s.title).join('；')
      return { role: 'assistant', content: `【摘要】${m.solution.quick_diagnosis}；【步骤】${titles}` }
    }
    return { role: 'assistant', content: m.text || m.guidance || '' }
  })
}
// 获取当前图片在纯图片数组中的索引，确保放大时显示正确的那一张
function getUiImageIndex(allImages, currentUrl) {
  const imagesOnly = allImages.filter(u => !isVideo(u));
  return imagesOnly.indexOf(currentUrl);
}

// 从文本中提取主要内容（去除 <link> 标签）
function extractMainText(text) {
  console.log('🔍 extractMainText 输入:', text)
  // 调试
  if (typeof text !== 'string') console.warn('⚠️ extractMainText 收到非字符串文本:', text)
  // 🧩 类型安全保护：确保是字符串
  if (typeof text !== 'string') {
    if (text === null || text === undefined) {
      console.warn('⚠️ extractMainText 收到 null/undefined，返回空字符串')
      return ''
    }
    try {
      // 如果是对象或数组，尝试转为字符串
      text = String(text)
    } catch {
      console.error('❌ extractMainText 无法转换为字符串')
      return ''
    }
  }

  // 去掉 <link> 标签
  let t = text.replace(/<link>.*?<\/link>/g, '').trim()

  // 去掉 [流程终点] 标识
  t = t.replace(/^\[流程终点\]\s*/i, '').trim()
  
  console.log('🔍 extractMainText 输出:', t)

  return t
}


// 从文本中提取链接标签
function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// // 判断某个步骤的分支（if_success 或 if_failed）中是否包含流程终点标识
// function isBranchTerminal(step) {
//   if (!step) return false
//   const s1 = (step.if_success || '').trim()
//   const s2 = (step.if_failed || '').trim()
//   // 以 "[流程终点]" 开头（忽略前后空格）就认为是终点分支
//   return (s1 && s1.startsWith('[流程终点]')) || (s2 && s2.startsWith('[流程终点]'))
// }

// 返回终点分支的纯文本（去掉标识），优先取 if_failed then if_success
// 修改：获取终点文本（增加对 if_next_step 的支持）
// --- 新增函数：处理内容区点击事件 ---
function isVideo(url) {
    if (!url) return false
    url = normalizeMediaUrl(url)
    // 简单地检查 URL 是否以 .mp4 结尾（不区分大小写）
    return url.toLowerCase().endsWith('.mp4')
}

watch(() => messages.value.length, () => {
  scrollToLatestMessage()
})

watch(loading, (value) => {
  if (value) {
    scrollToLatestMessage()
  }
})

onMounted(() => {
  fetchCollections()
  fetchMechanicalVideos()
})
</script>


<style scoped>
/* 全局样式 */
.dashboard-container {
  height: calc(100vh - 62px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  overflow: hidden;
}

.main-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* ========== 左侧标签栏 ========== */
.sidebar-tabs {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  z-index: 2000;
  pointer-events: none;
}

.tab-buttons {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: auto;
  z-index: 2001;
  padding: 20px 0;
}

.tab-btn {
  width: 56px;
  height: 68px;
  background: linear-gradient(145deg, #1f5c54 0%, #2f7d72 50%, #4b9b8f 100%);
  border-radius: 0 14px 14px 0;
  box-shadow: 
    3px 3px 15px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 22px;
  gap: 8px;
  color: white;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  border-radius: 0 16px 0 0;
}

.tab-btn:hover::before {
  opacity: 1;
}

.tab-btn:hover {
  width: 64px;
  transform: translateX(3px);
  box-shadow: 
    5px 5px 20px rgba(102, 126, 234, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  width: 64px;
  background: linear-gradient(145deg, #0f766e 0%, #159a8c 50%, #4bb3a7 100%);
  box-shadow: 
    5px 5px 20px rgba(64, 158, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
}

.tab-label {
  font-size: 12px;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tab-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  max-width: 85vw;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 
    4px 0 30px rgba(0,0,0,0.15),
    -1px 0 0 rgba(255,255,255,0.5);
  z-index: 2002;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.panel-header {
  padding: 24px;
  border-bottom: 2px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(0, 0, 0, 0.05);
}

.close-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  transform: rotate(90deg) scale(1.1);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.panel-content-mechanical {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-item {
  padding: 16px 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #409EFF 0%, #6BA8FF 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.list-item:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  transform: translateX(8px) scale(1.02);
  border-color: #91d5ff;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.2),
    0 8px 24px rgba(64, 158, 255, 0.1);
}

.list-item:hover::before {
  opacity: 1;
}

.faq-list .list-item,
.history-list .list-item {
  display: flex;
  align-items: center;
  gap: 10px;
}


.tab-btn-video {
  background: linear-gradient(145deg, #9a3412 0%, #c05621 50%, #dd6b20 100%);
}

.tab-btn-video.active {
  background: linear-gradient(145deg, #7c2d12 0%, #b45309 50%, #ea580c 100%);
}

.mechanical-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.mechanical-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.mechanical-empty,
.mechanical-detail {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.mechanical-empty {
  padding: 18px;
  color: #64748b;
}

.mechanical-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 50%;
  min-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
}

.mechanical-group {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(93, 108, 101, 0.18);
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(247, 242, 234, 0.88));
  box-shadow: 0 8px 20px rgba(25, 39, 34, 0.07);
  transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
}

.mechanical-group::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(183, 97, 43, 0.92), rgba(117, 58, 22, 0.92));
  opacity: 0.66;
}

.mechanical-group:hover {
  border-color: rgba(140, 88, 47, 0.3);
  box-shadow: 0 12px 26px rgba(25, 39, 34, 0.1);
}

.mechanical-group.expanded {
  border-color: rgba(133, 73, 34, 0.34);
  box-shadow: 0 16px 32px rgba(25, 39, 34, 0.12);
}

.mechanical-group-toggle {
  width: 100%;
  border: 0;
  padding: 15px 18px 15px 20px;
  background:
    linear-gradient(90deg, rgba(110, 61, 28, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(255, 248, 241, 0.98), rgba(246, 239, 230, 0.96));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: #5a341b;
  cursor: pointer;
  transition: background 0.22s ease, color 0.22s ease;
}

.mechanical-group.expanded .mechanical-group-toggle {
  background:
    linear-gradient(90deg, rgba(110, 61, 28, 0.12), transparent 40%),
    linear-gradient(180deg, rgba(255, 244, 232, 0.99), rgba(244, 233, 220, 0.98));
  color: #4b2c17;
}

.mechanical-group-toggle > div {
  min-width: 0;
  flex: 1;
}

.mechanical-group-toggle strong,
.mechanical-group-toggle span {
  display: block;
  text-align: left;
}

.mechanical-group-toggle strong {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.mechanical-group-toggle span {
  margin-top: 5px;
  color: #8a5a39;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mechanical-group-toggle .el-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(106, 62, 31, 0.08);
  color: #7b4a26;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
}

.mechanical-group.expanded .mechanical-group-toggle .el-icon {
  background: rgba(106, 62, 31, 0.14);
  color: #5b3418;
}

.mechanical-group-toggle .el-icon.expanded {
  transform: rotate(90deg);
}

.mechanical-group-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 14px 16px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.72), rgba(244, 238, 229, 0.88));
  border-top: 1px solid rgba(120, 92, 70, 0.08);
}

.mechanical-video-item {
  width: 100%;
  border: 1px solid rgba(126, 110, 92, 0.16);
  border-radius: 14px;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(250, 246, 240, 0.94));
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.mechanical-video-item:hover {
  transform: translateY(-1px);
  border-color: rgba(167, 96, 51, 0.34);
  box-shadow: 0 10px 18px rgba(74, 55, 41, 0.1);
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(247, 239, 229, 0.98));
}

.mechanical-video-item.active {
  border-color: rgba(130, 72, 36, 0.42);
  box-shadow: inset 0 0 0 1px rgba(130, 72, 36, 0.1), 0 12px 24px rgba(74, 55, 41, 0.12);
  background: linear-gradient(180deg, rgba(255, 246, 236, 0.98), rgba(246, 235, 222, 0.98));
}

.mechanical-video-title {
  font-weight: 700;
  color: #1e293b;
}

.mechanical-video-summary {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.mechanical-detail {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1 1 50%;
  min-height: 220px;
  overflow-y: auto;
  min-height: 0;
}

.mechanical-detail-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mechanical-detail-head h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
}

.mechanical-detail-eyebrow {
  margin: 0 0 4px;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.mechanical-detail-file {
  color: #64748b;
  font-size: 12px;
  word-break: break-all;
}

.mechanical-detail-description {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.mechanical-knowledge {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mechanical-knowledge-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(154, 52, 18, 0.08);
  color: #9a3412;
  font-size: 12px;
}

.mechanical-video-player {
  width: 100%;
  border-radius: 14px;
  background: #0f172a;
}

.error-list .list-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.error-code {
  font-weight: 700;
  color: #f56c6c;
  font-size: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.error-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 遮罩层基础样式 */
/* 遮罩层：修正点击失效的关键 */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%);
  backdrop-filter: blur(4px);
  
  /* 核心修复点 1：必须手动恢复点击权限 */
  pointer-events: auto; 
  
  /* 核心修复点 2：层级确保在面板之下，在主页面之上 */
  z-index: -1; /* 相对于 .sidebar-tabs 的内部层级 */
}

/* 遮罩层淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

/* 面板动画 */
.slide-enter-active {
  animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  animation: slideOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* ========== 聊天主体 ========== */
.chat-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.flow-shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 18px 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 249, 250, 0.92) 100%);
  border-bottom: 1px solid rgba(228, 231, 237, 0.55);
  flex-shrink: 0;
}

.flow-shell-header.compact {
  gap: 12px;
}

.flow-shell-copy {
  max-width: 760px;
}

.flow-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.flow-shell-copy h1,
.flow-shell-copy p {
  margin: 0;
}

.flow-shell-copy h1 {
  font-size: 23px;
  color: #1f2937;
}

.flow-shell-copy p:last-child {
  margin-top: 4px;
  color: #64748b;
  line-height: 1.5;
  font-size: 13px;
}

.flow-header-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(100px, 1fr));
  gap: 10px;
}

.flow-metric-card {
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 118, 110, 0.12);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.flow-metric-card span,
.flow-metric-card strong {
  display: block;
}

.flow-metric-card span {
  font-size: 12px;
  color: #64748b;
}

.flow-metric-card strong {
  margin-top: 6px;
  color: #1f2937;
}

/* 设备状态卡片 */
.device-status-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-size: 12px;
  color: #64748b;
}

.device-status-compact {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-selector-mini {
  width: 100px;
}

.device-selector-mini :deep(.el-input__wrapper) {
  padding: 4px 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: #67c23a;
}

.status-dot.warning {
  background: #e6a23c;
}

.status-dot.offline {
  background: #909399;
}

.status-text {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

/* ========== 设备状态栏 ========== */
.device-status-bar {
  border-bottom: 1px solid rgba(228, 231, 237, 0.6);
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.status-compact {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.status-compact:hover {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8ecf1 100%);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.compact-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.device-selector {
  max-width: 160px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot.online {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  box-shadow: 
    0 0 12px rgba(103, 194, 58, 0.6),
    0 0 24px rgba(103, 194, 58, 0.3);
}

.status-dot.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
  box-shadow: 
    0 0 12px rgba(230, 162, 60, 0.6),
    0 0 24px rgba(230, 162, 60, 0.3);
}

.status-dot.offline {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.status-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.expand-icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.status-expanded {
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.fault-info {
  margin-top: 16px;
}

.fault-alert {
  margin-bottom: 16px;
}

.fault-title {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 15px;
  color: #303133;
}

.fault-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fault-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.fault-code {
  font-weight: 700;
  color: #f56c6c;
  font-size: 14px;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  padding: 4px 10px;
  border-radius: 6px;
}

.fault-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.no-fault {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border-radius: 12px;
  color: #67c23a;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-to, .expand-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* ========== 聊天消息 ========== */
.chat-messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef1f6 100%);
}

.messages-wrapper {
  max-width: 1320px;
  margin: 0 auto;
}

.flow-empty-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0 4px;
}

.flow-empty-card {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 118, 110, 0.08);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.flow-empty-card h2,
.flow-empty-card p {
  margin: 0;
}

.flow-empty-card p {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
}

.flow-starter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.flow-starter {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(15, 118, 110, 0.1);
  background: rgba(255, 255, 255, 0.82);
  color: #1f2937;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.flow-starter:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.bubble {
  margin-bottom: 14px;
  animation: fadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

.bubble.user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.bubble.user .bubble-content {
  background: linear-gradient(135deg, #409EFF 0%, #5B8FF9 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 16px 16px 4px 16px;
  max-width: 80%;
  word-break: break-word;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.3),
    0 2px 8px rgba(64, 158, 255, 0.2);
  font-weight: 500;
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

.bubble.user .bubble-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
  border-radius: 16px 16px 0 0;
}

.bubble.assistant {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.assistant-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.08);
  border: 2px solid white;
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assistant-content-box {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 16px 18px;
  border-radius: 18px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.assistant-content-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF 0%, #6BA8FF 50%, #8CB9FF 100%);
}

.assistant-head {
  margin-bottom: 10px;
}

.guidance {
  margin-bottom: 16px;
}

.solution h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
}

.solution h4 {
  font-size: 14px;
  color: #606266;
  margin: 12px 0 10px;
  font-weight: 600;
}

.solution p {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #606266;
}

.flow-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.flow-step {
  border: 1px solid rgba(228, 231, 237, 0.6);
  border-radius: 18px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flow-step:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(228, 231, 237, 0.55);
}

.step-body {
  color: #606266;
}

.step-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(360px, 0.95fr);
  gap: 18px;
  align-items: start;
}

.step-text-panel {
  min-width: 0;
}

.step-media-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-content: start;
}

.step-body .desc {
  margin-bottom: 8px;
  line-height: 1.55;
  font-size: 14px;
  font-weight: 500;
}

.step-body .expected {
  margin-bottom: 10px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
  border-left: 3px solid #409EFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  font-weight: 500;
  line-height: 1.45;
  font-size: 13px;
}

.safety-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.safety-inline-label {
  font-size: 12px;
  color: #b45309;
  font-weight: 700;
}

.safety-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 12px;
}

.safety-notes ul {
  margin: 10px 0 0 0;
  padding-left: 24px;
}

.safety-notes li {
  margin-bottom: 6px;
  line-height: 1.6;
}

.flow-actions {
  margin-top: 12px;
}

.action-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
}

.action-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-card:active {
  transform: translateY(-2px) scale(1.01);
}

.success-card {
  border-left: 5px solid #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.success-card:hover {
  box-shadow: 
    0 8px 24px rgba(103, 194, 58, 0.2),
    0 4px 12px rgba(103, 194, 58, 0.1);
}

.failed-card {
  border-left: 5px solid #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.failed-card:hover {
  box-shadow: 
    0 8px 24px rgba(245, 108, 108, 0.2),
    0 4px 12px rgba(245, 108, 108, 0.1);
}

.next-step-card {
  border-left: 5px solid #409EFF;
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
}

.next-step-card:hover {
  box-shadow: 
    0 8px 24px rgba(64, 158, 255, 0.2),
    0 4px 12px rgba(64, 158, 255, 0.1);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 15px;
}

.action-content {
  color: #606266;
  line-height: 1.7;
  margin-bottom: 10px;
  font-size: 14px;
}

.action-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.flow-end-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border: 2px solid #b3d8ff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.end-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-weight: 700;
  font-size: 17px;
}

.end-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.end-content .muted {
  color: #909399;
}

.end-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
}

.knowledge-collapse {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.rk-item {
  margin-bottom: 12px;
}

.rk-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rk-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-line;
}

.overview-card {
  border: 1px solid rgba(15, 118, 110, 0.2);
  background: linear-gradient(180deg, #f6fffc 0%, #ffffff 100%);
}

.detail-card {
  margin-top: 10px;
}

.knowledge-link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.knowledge-link-btn {
  border: 1px solid rgba(15, 118, 110, 0.18);
  background: #ffffff;
  color: #0f766e;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-link-btn:hover,
.knowledge-link-btn.active {
  background: #0f766e;
  color: #ffffff;
  border-color: #0f766e;
}

.knowledge-link-row.nested {
  margin-top: 12px;
}

.knowledge-link-btn.secondary {
  background: rgba(15, 118, 110, 0.08);
}

.nested-detail-card {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.82);
}

.knowledge-actions {
  margin-top: 10px;
}

.knowledge-drill-btn {
  border: 1px solid rgba(15, 118, 110, 0.18);
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.rk-image {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.bubble-content-text {
  color: #303133;
  line-height: 1.6;
}

.meta {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }

/* ========== 图片和视频样式 ========== */
.image-wrapper {
  position: relative;
  width: 100%;
  min-height: 168px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.image-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.1);
}

.image-wrapper:hover::before {
  opacity: 1;
}

.step-media-item {
  width: 100%;
  height: 100%;
  min-height: 168px;
  max-height: 120px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.step-img-thumb {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.step-img-thumb:hover {
  transform: scale(1.05);
}

.step-video {
  border-radius: 12px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  font-weight: 500;
}

/* ========== 输入区域 ========== */
.chat-input-area {
  border-top: 1px solid rgba(228, 231, 237, 0.6);
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 8px 12px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  margin-top: auto;
  position: relative;
  bottom: auto;
  z-index: 2;
}

.voice-briefing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, #edf7f4 0%, #f7faf9 100%);
  color: #29423f;
  flex-wrap: wrap;
}

.voice-briefing-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.voice-state-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #94a3b8;
}

.voice-state-dot.info {
  background: #0f766e;
}

.voice-state-dot.warning {
  background: #d97706;
}

.voice-state-dot.success {
  background: #15803d;
}

.voice-state-dot.danger {
  background: #dc2626;
}

.voice-state-dot.neutral {
  background: #94a3b8;
}

.voice-state-dot.pulsing {
  animation: statusPulse 1.2s infinite;
}

.voice-briefing-side {
  font-size: 12px;
  color: #64748b;
}

.footer-note {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  font-weight: 500;
  opacity: 0.8;
}

.footer-note .voice-status {
  color: #67c23a;
  font-weight: 600;
}

@keyframes statusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.34);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(15, 118, 110, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(15, 118, 110, 0);
  }
}
/* 容器：悬浮在面板右侧边缘 */


/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
.flow-shell-header {
  flex-direction: column;
}

.flow-header-metrics,
.flow-starter-grid,
.flow-steps {
  grid-template-columns: 1fr;
}

.step-layout {
  grid-template-columns: 1fr;
}

.step-media-panel {
  grid-template-columns: 1fr;
}

.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  pointer-events: none; /* 让鼠标事件穿透空白区域 */
}

/* 左侧工具条：始终可见，极窄设计 */
.left-toolbar {
  width: 60px; /* 极度压缩宽度 */
  height: 100%;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 上下分离 */
  padding: 16px 8px;
  box-sizing: border-box;
  pointer-events: auto; /* 恢复点击 */
  z-index: 2002;
}

.tab-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮通用样式 */
.toolbar-btn {
  width: 100%;
  aspect-ratio: 1; /* 正方形 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  background: #f5f7fa;
}

.toolbar-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}

.toolbar-btn.active {
  background: #409eff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.toolbar-btn .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.btn-label {
  font-size: 10px;
  transform: scale(0.9); /* 视觉上更小 */
}

/* 底部收起按钮组 */
.close-group {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.close-btn {
  background: #fff;
  border: 1px solid #ebeef5;
  color: #909399;
}

.close-btn:hover {
  background: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

/* 内容面板：紧贴工具条右侧 */
/* 内容面板 */
.content-panel {
  position: relative; /* 必须为相对定位，方便把手定位 */
  width: 320px;
  height: 100%;
  background: #fff;
  box-shadow: 4px 0 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 2001;
  border-left: 1px solid #f0f0f0;
  /* 预留出右侧把手的点击感应区（可选） */
  margin-right: 20px; 
}
}

/* 装饰性背景：使用柔和渐变 */
.bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 242, 245, 0.4) 100%
  );
  backdrop-filter: blur(8px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  z-index: -1;
  transition: all 0.3s;
}
/* 箭头包装器 */
.arrow-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 2;
  transition: transform 0.3s ease;
}
/* “收起”文字：纵向排列，极简感 */
.close-text {
  writing-mode: vertical-lr;
  font-size: 11px;
  color: #a8abb2;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: 500;
  opacity: 0.6;
}

/* 中心的精细刻线 */
.center-line {
  position: absolute;
  bottom: 40px;
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, #dcdfe6, transparent);
  border-radius: 1px;
}

.panel-close-bar {
  position: absolute;
  top: 0;
  right: -28px; /* 稍微窄一点，更加精致 */
  width: 28px;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

/* 背景保留轻微的磨砂感，但更加通透 */
.bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(236, 237, 240, 0.95) 10%, rgba(181, 197, 205, 0.5) 100%);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 自定义大箭头 (<) */
.modern-arrow {
  position: relative;
  width: 12px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 使用伪元素绘制两条线 */
.modern-arrow::before,
.modern-arrow::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 26px;
  background-color: #ffffff;
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 上半部分线段：改为正值，使其向左倾斜 */
.modern-arrow::before {
  transform: translateY(-10px) rotate(25deg); 
}

/* 下半部分线段：改为负值，使其向左倾斜 */
.modern-arrow::after {
  transform: translateY(10px) rotate(-25deg);
}
/* --- 交互动效 --- */

/* 悬停时，背景变红，箭头变亮并呈现"挤压"感 */
.panel-close-bar:hover .bar-bg {
  background: linear-gradient(
    to right,
    rgba(77, 148, 247, 0.98) 0%,
    rgba(254, 240, 240, 0.1) 100%
  );
}

.panel-close-bar:hover .modern-arrow::before {
  background-color: #ffffff;
  transform: translateY(-9px) rotate(40deg); 
}

.panel-close-bar:hover .modern-arrow::after {
  background-color: #ffffff;
  transform: translateY(9px) rotate(-40deg);
}

/* 点击时的位移感 */
.panel-close-bar:active .modern-arrow {
  transform: translateX(-3px);
}

/* 自定义大箭头 (<) */
.modern-arrow {
  position: relative;
  width: 12px;
  height: 40px; /* 纵向拉长，更有设计感 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 使用伪元素绘制两条线 */
.modern-arrow::before,
.modern-arrow::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 24px;
  background-color: #ffffff; /* 初始颜色较淡 */
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 上半部分线段：改为正值，使其向左倾斜 */
.modern-arrow::before {
  /* 从 -25deg 改为 25deg */
  transform: translateY(-10px) rotate(25deg); 
}

/* 下半部分线段：改为负值，使其向左倾斜 */
.modern-arrow::after {
  /* 从 25deg 改为 -25deg */
  transform: translateY(10px) rotate(-25deg);
}
/* --- 交互动效 --- */

/* 悬停时，背景变红，箭头变亮并呈现“挤压”感 */
.panel-close-bar:hover .bar-bg {
  background: linear-gradient(
    to right,
    rgba(77, 148, 247, 0.95) 0%,
    rgba(254, 240, 240, 0) 100%
  );
}

.panel-close-bar:hover .modern-arrow::before {
  background-color: #1a59f8;
  /* 角度变大，增强指向感 */
  transform: translateY(-9px) rotate(40deg); 
}

.panel-close-bar:hover .modern-arrow::after {
  background-color: #254ff7;
  /* 角度变大，增强指向感 */
  transform: translateY(9px) rotate(-40deg);
}

/* 点击时的位移感 */
.panel-close-bar:active .modern-arrow {
  transform: translateX(-3px);
}


/* 极简头部 */
.mini-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  flex-shrink: 0; /* 防止压缩 */
}

.header-indicator {
  width: 3px;
  height: 14px;
  background: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

/* 滚动区域 */
.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 列表样式优化 */
.list-item {
  padding: 12px;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  border: 1px solid transparent;
}

.list-item:hover {
  background: #f5f7fa;
}

.list-item:active {
  background: #eff3f8;
}

.list-item .text {
  font-size: 13px;
  line-height: 1.4;
  color: #333;
}

.list-item .arrow {
  color: #c0c4cc;
  font-size: 14px;
}

/* 故障代码特殊样式 */
.error-item {
  border-left: 3px solid #f56c6c;
  background: #fef0f0;
}

.error-info {
  display: flex;
  flex-direction: column;
}

.error-info .code {
  font-weight: bold;
  color: #f56c6c;
  font-size: 13px;
}

.error-info .desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
  width: 0; /* 挤压效果 */
}




@media (min-width: 769px) and (max-width: 1024px) {
  .tab-panel {
    width: 280px;
  }

  .step-images {
    grid-template-columns: repeat(2, 1fr);
  }

  .image-wrapper {
    height: 200px;
  }
}

@media (min-width: 1025px) {
  .step-images {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .image-wrapper {
    height: 240px;
  }
}

/* Element Plus 深度样式覆盖 */
:deep(.el-image-viewer__wrapper) {
  z-index: 9999;
}

:deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

:deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

:deep(.el-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 可点击链接样式 */
.clickable-link-tag {
  color: #409EFF;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(64, 158, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-weight: 600;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.clickable-link-tag:hover {
  background: rgba(64, 158, 255, 0.2);
  color: #3075e6;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 元素标签优化 */
:deep(.el-tag--primary) {
  background: linear-gradient(135deg, #ecf5ff 0%, #e1f0ff 100%);
  border-color: #b3d8ff;
  color: #409EFF;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4ff 100%);
  border-color: #b3e19d;
  color: #67c23a;
}

:deep(.el-tag--warning) {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-color: #f5dab1;
  color: #e6a23c;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
  border-color: #d3d4d6;
  color: #909399;
}

/* 滚动条美化 */
.panel-content::-webkit-scrollbar,
.chat-messages-container::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track,
.chat-messages-container::-webkit-scrollbar-track {
  background: linear-gradient(180deg, #f1f1f1 0%, #e8e8e8 100%);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb,
.chat-messages-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c1c1c1 0%, #b1b1b1 100%);
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-content::-webkit-scrollbar-thumb:hover,
.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a8a8a8 0%, #989898 100%);
}
/* --- 弱化诊断概要 --- */
.diagnosis-summary-minimal {
  font-size: 12px;
  color: #909399;
  margin-bottom: 14px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.summary-divider {
  color: #dcdfe6;
}

/* --- 强化核心描述卡片 --- */
.instruction-card {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-left: 5px solid #409eff;
  padding: 14px 18px;
  margin: 14px 0;
  border-radius: 0 10px 10px 0;
  box-shadow: 
    0 4px 16px rgba(64, 158, 255, 0.12),
    0 2px 8px rgba(64, 158, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.instruction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
  border-radius: 0 10px 0 0;
}

.instruction-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #40a0ff;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.main-instruction {
  font-size: 16px !important;
  line-height: 1.7;
  color: #303133 !important;
  font-weight: 600;
  margin: 0 !important;
  position: relative;
  z-index: 1;
}

/* 移除原有的 h3 样式或隐藏 */
.solution h3 {
  display: none;
}

.dashboard-container,
.page.dashboard-container {
  min-height: calc(100vh - 76px);
  background: transparent;
}

.main-body {
  display: grid;
  grid-template-columns: minmax(248px, 308px) minmax(0, 1fr);
  gap: clamp(12px, 1.8vw, 20px);
  padding: clamp(10px, 1.6vw, 18px);
  min-height: calc(100vh - 76px);
}

.sidebar-tabs {
  position: sticky;
  top: 92px;
  align-self: start;
  padding: 18px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(24, 59, 54, 0.96), rgba(16, 38, 35, 0.96));
  border: 1px solid rgba(65, 88, 80, 0.14);
  box-shadow: var(--shadow-md);
}

.tab-buttons {
  display: grid;
  gap: 10px;
}

.tab-btn {
  min-height: 54px;
  padding: 0 16px;
  border-radius: 18px;
  color: rgba(244, 242, 235, 0.76);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease;
}

.tab-btn.active,
.tab-btn:hover {
  transform: translateY(-1px);
  color: #fffaf4;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(180, 107, 49, 0.12));
  border-color: rgba(244, 222, 195, 0.28);
}

.tab-panel {
  margin-top: 16px;
  border-radius: 24px;
  background: rgba(255, 251, 246, 0.92);
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: 0 20px 50px rgba(26, 34, 31, 0.14);
  overflow: hidden;
}

.panel-header {
  padding: 18px 20px 12px;
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  color: var(--text);
}

.panel-content {
  padding: 0 14px 14px;
}

.list-item {
  min-height: 58px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(65, 88, 80, 0.08);
  background: rgba(255, 251, 246, 0.88);
}

.chat-layout {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.flow-shell-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, rgba(180, 107, 49, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.92), rgba(248, 243, 236, 0.78));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.flow-eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.flow-shell-copy h1 {
  margin: 0;
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1.15;
  color: var(--text);
}

.flow-header-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 12px;
  min-width: min(100%, 520px);
}

.flow-metric-card {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 251, 246, 0.76);
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.flow-metric-card span,
.metric-label {
  display: block;
  color: var(--text-faint);
  font-size: 12px;
}

.flow-metric-card strong {
  display: block;
  margin-top: 6px;
  color: var(--text);
  font-size: 15px;
}

.chat-messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px;
}

.messages-wrapper {
  max-width: 1240px;
  min-height: 100%;
  margin: 0 auto;
}

.flow-empty-state {
  display: grid;
  gap: 16px;
}

.flow-empty-card {
  padding: clamp(20px, 3vw, 28px);
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.9), rgba(246, 240, 232, 0.74));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.flow-empty-card h2 {
  margin: 0;
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: clamp(1.35rem, 2.1vw, 1.9rem);
  line-height: 1.3;
}

.flow-empty-card p {
  margin: 12px 0 0;
  color: var(--text-soft);
  line-height: 1.75;
}

.flow-starter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.flow-starter {
  min-height: 116px;
  padding: 18px;
  border-radius: 22px;
  text-align: left;
  border: 1px solid rgba(65, 88, 80, 0.12);
  background: rgba(255, 251, 246, 0.86);
  box-shadow: 0 18px 34px rgba(26, 34, 31, 0.06);
}

.bubble.user,
.bubble.assistant {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.bubble.user {
  justify-content: flex-end;
}

.bubble.user .bubble-content,
.assistant-content-box {
  position: relative;
  width: min(100%, 1020px);
  border-radius: 28px;
  box-shadow: 0 22px 48px rgba(26, 34, 31, 0.08);
}

.bubble.user .bubble-content {
  padding: 18px 20px;
  color: #fffaf4;
  background: linear-gradient(135deg, #255f56 0%, #173f3a 100%);
}

.assistant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 251, 246, 0.9);
  box-shadow: 0 16px 30px rgba(31, 98, 89, 0.12);
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assistant-content-box {
  padding: 20px 22px 18px;
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.92), rgba(250, 244, 237, 0.82));
  border: 1px solid rgba(65, 88, 80, 0.12);
}

.assistant-content-box::before {
  height: 3px;
  background: linear-gradient(90deg, var(--brand), rgba(180, 107, 49, 0.72));
  border-radius: 28px 28px 0 0;
}

.diagnosis-summary-minimal {
  padding: 10px 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(222, 239, 233, 0.76), rgba(255, 251, 246, 0.8));
  border: 1px solid rgba(31, 98, 89, 0.12);
  color: var(--text-soft);
}

.solution h4,
.related-knowledge h4 {
  margin: 16px 0 12px;
  font-family: 'Sora', 'Noto Sans SC', sans-serif;
  font-size: 18px;
  color: var(--text);
}

.flow-steps {
  display: grid;
  gap: 16px;
}

.flow-step,
.rk-card,
.flow-end-card {
  border-radius: 24px;
  background: rgba(255, 251, 246, 0.84);
  border: 1px solid rgba(65, 88, 80, 0.1);
  box-shadow: 0 18px 32px rgba(26, 34, 31, 0.06);
}

.flow-step {
  padding: 18px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.step-header strong {
  font-size: 16px;
  color: var(--text);
}

.step-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
  gap: 18px;
}

.instruction-card {
  margin: 0;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(222, 239, 233, 0.76), rgba(255, 251, 246, 0.84));
  border-left: none;
  border: 1px solid rgba(31, 98, 89, 0.12);
  box-shadow: none;
}

.instruction-icon {
  color: var(--brand);
}

.main-instruction,
.expected,
.rk-content,
.bubble-content-text,
.action-content {
  color: var(--text);
  line-height: 1.8;
}

.safety-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.safety-inline-label {
  font-weight: 700;
  color: var(--accent);
}

.safety-chip {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(180, 107, 49, 0.12);
  color: #8b4f22;
}

.step-media-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.image-wrapper {
  min-height: 180px;
  border-radius: 20px;
  background: rgba(243, 236, 228, 0.82);
  box-shadow: none;
  border: 1px solid rgba(65, 88, 80, 0.08);
}

.image-wrapper:hover {
  transform: translateY(-2px);
}

.flow-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.action-card,
.flow-end-card {
  border-radius: 22px !important;
}

.action-card :deep(.el-card__body),
.flow-end-card :deep(.el-card__body) {
  padding: 16px;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.action-header strong {
  color: var(--text);
}

.action-content {
  min-height: 72px;
}

.knowledge-link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.knowledge-link-btn,
.knowledge-drill-btn {
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(31, 98, 89, 0.18);
  background: rgba(255, 251, 246, 0.92);
  color: var(--brand);
  font-weight: 700;
}

.knowledge-link-btn.active,
.knowledge-link-btn:hover,
.knowledge-drill-btn:hover {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%);
  color: #fffaf4;
  border-color: transparent;
}

.rk-header,
.rk-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.rk-card {
  padding: 16px;
}

.chat-input-area {
  position: relative;
  bottom: auto;
  z-index: 2;
  flex-shrink: 0;
  margin-top: auto;
  display: block;
  visibility: visible;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(244, 239, 230, 0) 0%, rgba(244, 239, 230, 0.92) 18%, rgba(244, 239, 230, 0.98) 100%);
}

.voice-briefing {
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(222, 239, 233, 0.74), rgba(255, 251, 246, 0.84));
  border: 1px solid rgba(31, 98, 89, 0.12);
}

.footer-note {
  color: var(--text-faint);
}

@media (max-width: 1200px) {
  .main-body {
    grid-template-columns: 1fr;
  }

  .sidebar-tabs {
    position: relative;
    top: 0;
    height: auto;
    max-height: min(60vh, 720px);
  }
}

@media (max-width: 960px) {
  .flow-shell-header,
  .step-layout,
  .flow-actions,
  .flow-header-metrics,
  .flow-starter-grid {
    grid-template-columns: 1fr;
  }

  .flow-shell-header {
    flex-direction: column;
    padding: 18px;
    border-radius: 24px;
  }

  .step-media-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .main-body {
    padding: 10px;
    gap: 12px;
    min-height: calc(100vh - 64px);
  }

  .sidebar-tabs {
    padding: 12px;
    border-radius: 24px;
  }

  .tab-buttons {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tab-btn {
    min-height: 48px;
    padding: 0 10px;
    justify-content: center;
  }

  .tab-label {
    display: none;
  }

  .bubble.user,
  .bubble.assistant {
    gap: 10px;
    align-items: flex-start;
  }

  .assistant-avatar {
    width: 40px;
    height: 40px;
    border-radius: 16px;
  }

  .bubble.user .bubble-content,
  .assistant-content-box {
    width: 100%;
    padding: 16px;
    border-radius: 24px;
  }

  .flow-step,
  .rk-card {
    padding: 14px;
    border-radius: 20px;
  }
}

.dashboard-container,
.page.dashboard-container {
  min-height: calc(100vh - 76px);
}

.main-body {
  display: grid;
  grid-template-columns: minmax(220px, 268px) minmax(0, 1fr);
  gap: 14px;
  padding: 12px;
}

.sidebar-tabs {
  position: sticky;
  top: 88px;
  left: auto;
  bottom: auto;
  width: auto;
  align-self: start;
  padding: 14px;
  pointer-events: auto;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(24, 59, 54, 0.96), rgba(16, 38, 35, 0.96));
  border: 1px solid rgba(65, 88, 80, 0.14);
  box-shadow: var(--shadow-md);
  z-index: 2;
}

.tab-buttons {
  position: static;
  top: auto;
  left: auto;
  transform: none;
  display: grid;
  gap: 8px;
  padding: 0;
}

.tab-btn {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border-radius: 16px;
  justify-content: flex-start;
  flex-direction: row;
  gap: 10px;
  font-size: 16px;
  box-shadow: none;
}

.tab-btn:hover,
.tab-btn.active {
  width: 100%;
  transform: translateY(-1px);
}

.tab-label {
  font-size: 13px;
  letter-spacing: 0;
}

.tab-panel {
  position: relative;
  inset: auto;
  width: 100%;
  max-width: none;
  margin-top: 12px;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(26, 34, 31, 0.14);
  z-index: 1;
}

.panel-header {
  padding: 16px 18px 10px;
  font-size: 15px;
  background: transparent;
  box-shadow: none;
}

.panel-content {
  padding: 0 12px 12px;
}

.panel-close-bar,
.panel-overlay {
  display: none !important;
}

.list-item {
  margin-bottom: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  transform: none !important;
}

.chat-layout {
  gap: 12px;
  background: transparent;
}

.flow-shell-header {
  padding: 14px 18px;
  border-radius: 24px;
}

.flow-shell-copy h1 {
  font-size: clamp(1.22rem, 2vw, 1.65rem);
  line-height: 1.15;
}

.flow-header-metrics {
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 8px;
}

.flow-metric-card {
  padding: 10px 12px;
  border-radius: 16px;
}

.flow-metric-card strong {
  font-size: 13px;
}

@media (max-width: 1200px) {
  .main-body {
    grid-template-columns: 1fr;
  }

  .sidebar-tabs {
    position: relative;
    top: 0;
  }

  .tab-buttons {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tab-btn {
    justify-content: center;
  }
}

@media (max-width: 720px) {
  .main-body {
    padding: 10px;
  }

  .sidebar-tabs {
    padding: 10px;
    border-radius: 20px;
  }

  .tab-buttons {
    gap: 6px;
  }

  .tab-btn {
    height: 44px;
    padding: 0 10px;
  }

  .tab-label {
    display: none;
  }

  .flow-shell-header {
    padding: 12px 14px;
  }

  .flow-shell-copy h1 {
    font-size: 1.1rem;
  }

  .flow-header-metrics {
    grid-template-columns: 1fr 1fr;
  }
}

.flow-shell-header {
  justify-content: flex-start;
  padding: 10px 14px;
  min-height: auto;
}

.flow-shell-copy {
  max-width: 820px;
}

.flow-eyebrow {
  margin-bottom: 2px;
  font-size: 11px;
}

.flow-shell-copy h1 {
  font-size: 1.05rem;
}

.flow-header-copy {
  margin: 2px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.flow-header-metrics,
.flow-metric-card {
  display: none !important;
}

@media (max-width: 720px) {
  .flow-shell-header {
    padding: 8px 10px;
  }
}

.loading-bubble {
  align-items: flex-start;
}

.thinking-avatar {
  position: relative;
  overflow: hidden;
}

.thinking-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(231, 180, 93, 0.28));
  animation: avatarPulse 1.8s var(--ease-out-quart) infinite;
}

.thinking-card {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 12px;
}

.thinking-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    radial-gradient(circle at top right, rgba(231, 180, 93, 0.18), transparent 44%),
    linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(246, 238, 224, 0.92));
  pointer-events: none;
}

.thinking-card > * {
  position: relative;
  z-index: 1;
}

.flow-thinking-card {
  padding: 18px 18px 16px;
}

.thinking-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
}

.thinking-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(28, 78, 71, 0.08);
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.thinking-head strong {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
}

.thinking-wave {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  min-height: 24px;
}

.thinking-wave span {
  width: 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(24, 59, 54, 0.88), rgba(193, 137, 59, 0.82));
  transform-origin: center bottom;
  animation: thinkingBars 1.1s var(--ease-out-quart) infinite;
}

.thinking-wave span:nth-child(1) {
  height: 10px;
}

.thinking-wave span:nth-child(2) {
  height: 18px;
  animation-delay: 0.12s;
}

.thinking-wave span:nth-child(3) {
  height: 14px;
  animation-delay: 0.24s;
}

.thinking-lines {
  display: grid;
  gap: 9px;
}

.thinking-lines span {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(206, 186, 149, 0.24), rgba(255, 255, 255, 0.9), rgba(206, 186, 149, 0.24));
  background-size: 220% 100%;
  animation: shimmerTrack 1.8s linear infinite;
}

.thinking-lines span:nth-child(1) {
  width: min(100%, 340px);
}

.thinking-lines span:nth-child(2) {
  width: min(88%, 296px);
  animation-delay: 0.18s;
}

.thinking-lines span:nth-child(3) {
  width: min(76%, 240px);
  animation-delay: 0.34s;
}

.thinking-copy {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.7;
}

@keyframes avatarPulse {
  0%, 100% {
    opacity: 0.64;
  }
  50% {
    opacity: 1;
  }
}

@keyframes thinkingBars {
  0%, 100% {
    transform: scaleY(0.68);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1.16);
    opacity: 1;
  }
}

@keyframes shimmerTrack {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thinking-avatar::after,
  .thinking-wave span,
  .thinking-lines span {
    animation: none !important;
  }
}

@media (max-width: 720px) {
  .flow-thinking-card {
    padding: 16px 14px 14px;
  }

  .thinking-head {
    gap: 6px 10px;
  }

  .thinking-head strong {
    font-size: 14px;
  }
}

.bubble.assistant {
  gap: 12px;
}

.bubble.user .bubble-content {
  max-width: min(58%, 420px);
  padding: 12px 16px;
  border-radius: 18px 18px 6px 18px;
  background: linear-gradient(145deg, #1e6a61 0%, #174d46 100%);
  box-shadow: 0 16px 30px rgba(23, 72, 65, 0.16);
  font-size: 14px;
  line-height: 1.68;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border-color: rgba(255, 251, 246, 0.9);
  box-shadow: 0 12px 24px rgba(23, 39, 35, 0.08);
}

.assistant-content-box {
  width: min(calc(100% - 40px), 720px);
  padding: 10px 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(247, 241, 233, 0.92));
  border: 1px solid rgba(65, 88, 80, 0.1);
  box-shadow: 0 18px 34px rgba(27, 42, 37, 0.07);
}

.assistant-content-box::before {
  height: 2px;
  background: linear-gradient(90deg, rgba(31, 98, 89, 0.92), rgba(180, 107, 49, 0.78));
}

.assistant-head {
  margin-bottom: 8px;
}

.diagnosis-summary-minimal {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-bottom: 10px;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.55;
}

.summary-item {
  color: var(--text-soft);
}

.summary-divider {
  color: rgba(82, 99, 93, 0.45);
}

.solution h4,
.related-knowledge.compact-results h4 {
  margin: 10px 0 8px;
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}

.flow-steps {
  gap: 12px;
}

.flow-step {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(65, 88, 80, 0.1);
  background: linear-gradient(180deg, rgba(252, 249, 244, 0.96), rgba(244, 237, 228, 0.86));
  box-shadow: 0 14px 28px rgba(27, 42, 37, 0.05);
  transition:
    transform 220ms var(--ease-out-quart),
    box-shadow 220ms var(--ease-out-quart),
    border-color 220ms var(--ease-out-quart);
}

.flow-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(27, 42, 37, 0.08);
  border-color: rgba(180, 107, 49, 0.18);
}

.step-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.step-header strong {
  font-size: 14px;
  line-height: 1.45;
}

.step-layout {
  gap: 14px;
}

.instruction-card {
  padding: 12px 13px;
  border-radius: 14px;
  background: rgba(255, 251, 246, 0.88);
  border: 1px solid rgba(65, 88, 80, 0.08);
}

.instruction-icon {
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--brand);
}

.step-body .desc,
.bubble-content-text,
.rk-content {
  font-size: 13px;
  line-height: 1.68;
  color: #34423e;
}

.step-body .expected {
  margin-bottom: 8px;
  padding: 8px 10px;
  border-left: 3px solid var(--accent);
  background: linear-gradient(135deg, rgba(244, 228, 211, 0.6), rgba(255, 250, 244, 0.92));
  box-shadow: none;
}

.flow-actions {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.action-card,
.action-card :deep(.el-card__body) {
  border-radius: 16px;
}

.action-card {
  min-height: 0;
  border: 1px solid rgba(65, 88, 80, 0.08);
  transition:
    transform 220ms var(--ease-out-quart),
    box-shadow 220ms var(--ease-out-quart),
    border-color 220ms var(--ease-out-quart);
}

.action-card :deep(.el-card__body) {
  padding: 12px 13px 13px;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-header {
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.action-content {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.62;
}

.action-card .el-button {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.action-links :deep(.el-tag) {
  min-height: 24px;
  border-radius: 999px;
}

.flow-end-card {
  border-radius: 18px;
}

.meta {
  margin-top: 6px;
  font-size: 11px;
}

@media (max-width: 900px) {
  .step-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .bubble.assistant {
    gap: 10px;
  }

  .assistant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  .bubble.user .bubble-content,
  .assistant-content-box {
    width: 100%;
    max-width: 100%;
    padding: 11px 12px;
    border-radius: 18px;
  }

  .bubble.user .bubble-content {
    margin-left: 14px;
    max-width: min(84%, 320px);
  }

  .flow-step {
    padding: 12px;
    border-radius: 16px;
  }

  .flow-focus-media {
    grid-template-columns: repeat(2, minmax(0, 92px));
    gap: 8px;
  }

  .step-media-item {
    min-height: 72px;
    max-height: 72px;
  }

  .action-card :deep(.el-card__body) {
    padding: 11px 12px 12px;
  }
}

.mechanical-message-card {
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.94), rgba(246, 240, 232, 0.84));
  border: 1px solid rgba(65, 88, 80, 0.12);
  box-shadow: var(--shadow-sm);
}

.mechanical-message-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.page.dashboard-container,
.dashboard-container {
  height: calc(100vh - 76px) !important;
  min-height: calc(100vh - 76px) !important;
  overflow: hidden;
}

.main-body {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  align-items: stretch;
}

.chat-layout {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.chat-messages-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.messages-wrapper {
  min-height: auto;
  padding-bottom: 8px;
}

.chat-input-area {
  position: sticky;
  bottom: 0;
  margin-top: 0;
  z-index: 3;
}

.panel-header {
  flex-shrink: 0;
}

.panel-content {
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.panel-content-mechanical {
  min-height: 0;
  height: 100%;
  overflow-y: auto;
}

.faq-list,
.error-list,
.history-list {
  min-height: 0;
}

.mechanical-panel {
  display: block;
  min-height: 0;
  height: auto;
  overflow: visible;
}

.mechanical-main {
  display: block;
  min-height: 0;
}

.mechanical-groups {
  min-height: 0;
  overflow: visible;
  padding-right: 0;
}

.mechanical-group + .mechanical-group {
  margin-top: 12px;
}


.sidebar-tabs {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  align-self: stretch;
  height: calc(100vh - 104px);
  max-height: calc(100vh - 104px);
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  contain: layout paint;
}

.tab-buttons {
  position: relative;
  top: auto;
  z-index: 3;
  padding-bottom: 12px;
  background: inherit;
  flex-shrink: 0;
}

.tab-btn {
  position: relative;
  width: 100%;
  min-height: 50px;
  padding: 0 14px 0 16px;
  border-radius: 18px;
  justify-content: flex-start;
  flex-direction: row;
  gap: 10px;
  font-size: 15px;
  color: rgba(246, 242, 236, 0.82);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 248, 238, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.tab-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(221, 158, 90, 0.2), rgba(124, 72, 37, 0.1));
  opacity: 0;
  transition: opacity 0.18s ease, background 0.18s ease;
}

.tab-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.tab-btn:hover {
  transform: translateY(-1px);
  color: #fff8f2;
  border-color: rgba(244, 214, 179, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(182, 117, 56, 0.08));
  box-shadow: 0 10px 20px rgba(8, 18, 17, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.tab-btn:hover::before {
  opacity: 0.72;
}

.tab-btn.active {
  transform: translateY(-1px);
  color: #fffaf4;
  border-color: rgba(245, 217, 184, 0.24);
  background:
    linear-gradient(90deg, rgba(181, 108, 48, 0.18), transparent 45%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.14), rgba(188, 122, 62, 0.14));
  box-shadow: 0 14px 24px rgba(8, 18, 17, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.tab-btn.active::before {
  opacity: 1;
  background: linear-gradient(180deg, rgba(255, 208, 153, 0.98), rgba(192, 106, 46, 0.98));
}

.tab-btn-video {
  background:
    linear-gradient(90deg, rgba(152, 78, 29, 0.16), transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(188, 94, 35, 0.1));
}

.tab-btn-video.active {
  background:
    linear-gradient(90deg, rgba(188, 94, 35, 0.24), transparent 50%),
    linear-gradient(180deg, rgba(255, 246, 237, 0.18), rgba(196, 96, 35, 0.18));
}

.tab-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.tab-panel {
  position: relative;
  min-height: 0;
  max-height: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(243, 225, 201, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 251, 246, 0.95), rgba(246, 240, 232, 0.92));
  box-shadow: 0 22px 42px rgba(17, 28, 26, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.panel-header {
  position: relative;
  flex-shrink: 0;
  padding: 16px 18px 12px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #2f332d;
  background:
    linear-gradient(90deg, rgba(184, 118, 58, 0.1), transparent 48%),
    linear-gradient(180deg, rgba(255, 252, 248, 0.96), rgba(248, 242, 234, 0.9));
  border-bottom: 1px solid rgba(136, 103, 73, 0.1);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.35);
}

.panel-header::before {
  content: '';
  position: absolute;
  left: 18px;
  bottom: 0;
  width: 48px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(185, 107, 44, 0.95), rgba(114, 64, 29, 0.95));
}

.tab-panel {
  min-height: 0;
  max-height: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}

.mechanical-message-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mechanical-video-player-preview {
  width: min(100%, 420px);
  max-height: 236px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  align-self: flex-start;
  cursor: zoom-in;
}

.mechanical-preview-player {
  width: 100%;
  max-height: 72vh;
  border-radius: 18px;
  background: #0f172a;
}

.mechanical-preview-dialog :deep(.el-dialog) {
  border-radius: 24px;
}

.mechanical-preview-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.flow-repair-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flow-repair-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.flow-repair-agent {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flow-repair-avatar {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 45%, #dcfce7 100%);
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.flow-repair-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flow-repair-agent-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.flow-repair-badge {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 700;
}

.flow-repair-time {
  margin: 2px 0 0;
  font-size: 10px;
  color: #94a3b8;
}

.flow-repair-note {
  display: inline-flex;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 700;
}

.flow-repair-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flow-repair-summary-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #475569;
  line-height: 1.55;
}

.flow-repair-summary-box strong {
  color: #0f172a;
  font-size: 13px;
}

.flow-shell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-focus-layout {
  display: grid;
  grid-template-columns: minmax(0, 5.6fr) minmax(164px, 1fr);
  gap: 0;
  align-items: stretch;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.98) 70%, rgba(241, 245, 249, 0.98) 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  overflow: hidden;
}

.flow-focus-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 10px 14px 10px 2px;
}

.flow-focus-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  position: sticky;
  top: 0;
  align-self: start;
  padding: 10px 0 10px 12px;
  border-left: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(241, 245, 249, 0.98));
}

.flow-step-strip {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding: 4px 10px 8px 2px;
  scrollbar-width: thin;
}

.flow-step-pill {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 188px;
  max-width: 208px;
  padding: 10px 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
}

.flow-step-pill.has-next::after {
  content: '';
  position: absolute;
  top: 22px;
  left: calc(100% + 4px);
  width: 14px;
  height: 2px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.55), rgba(59, 130, 246, 0.32));
  border-radius: 999px;
}

.flow-step-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.flow-step-pill.is-active {
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 14px 32px rgba(59, 130, 246, 0.12);
}

.flow-step-pill.is-current {
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
}

.flow-step-pill-index {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.flow-step-pill-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.flow-step-pill-copy strong {
  font-size: 12px;
  line-height: 1.35;
  color: #0f172a;
}

.flow-step-pill-copy small {
  color: #64748b;
  font-size: 10px;
}

.flow-focus-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.flow-focus-panel.is-current {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 16px 36px rgba(59, 130, 246, 0.08);
}

.flow-focus-panel.is-preview {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.flow-focus-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.flow-focus-kicker {
  margin: 0 0 3px;
  font-size: 10px;
  color: #64748b;
  letter-spacing: 0.04em;
}

.flow-focus-header h4 {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
  color: #0f172a;
}

.flow-focus-state {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0c4a6e;
  font-size: 10px;
  font-weight: 700;
}

.flow-focus-desc,
.flow-focus-condition,
.flow-inline-notice,
.flow-preview-tip,
.flow-branch-card-copy,
.flow-branch-empty {
  margin: 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

.flow-step-pill-branches,
.flow-step-branch-map {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 5px;
}

.flow-step-branch-chip,
.flow-step-branch-row {
  display: flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 7px 3px 14px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
}

.flow-step-branch-map {
  position: relative;
  padding-left: 4px;
}

.flow-step-branch-stem {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  width: 1px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.2), rgba(59, 130, 246, 0.32), rgba(148, 163, 184, 0.2));
}

.flow-step-branch-row {
  position: relative;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  border: 1px solid transparent;
}

.flow-step-branch-row::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 8px;
  height: 1px;
  background: currentColor;
  opacity: 0.32;
  transform: translateY(-50%);
}

.flow-step-branch-chip.tone-primary,
.flow-step-branch-row.tone-primary {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.16);
}

.flow-step-branch-chip.tone-success,
.flow-step-branch-row.tone-success {
  background: #dcfce7;
  color: #166534;
  border-color: rgba(34, 197, 94, 0.16);
}

.flow-step-branch-chip.tone-danger,
.flow-step-branch-row.tone-danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.16);
}

.flow-step-branch-key {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
}

.flow-step-branch-link {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  opacity: 0.88;
}

.flow-focus-condition {
  color: #0f766e;
}

.flow-focus-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 120px));
  justify-content: flex-start;
  gap: 8px;
}

.flow-focus-media-item {
  min-width: 0;
}

.flow-branch-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 0 2px;
  min-height: 100%;
}

.flow-branch-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.flow-branch-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #ffffff;
  min-width: 0;
}

.flow-branch-card.tone-primary {
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
  border-color: rgba(59, 130, 246, 0.18);
}

.flow-branch-card.tone-success {
  background: linear-gradient(180deg, #f4fff7 0%, #ecfdf5 100%);
  border-color: rgba(34, 197, 94, 0.18);
}

.flow-branch-card.tone-danger {
  background: linear-gradient(180deg, #fff7f7 0%, #fef2f2 100%);
  border-color: rgba(239, 68, 68, 0.18);
}

.flow-branch-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.flow-branch-chip,
.flow-branch-kind {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.flow-branch-chip {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.flow-branch-kind {
  background: rgba(255, 255, 255, 0.65);
  color: #475569;
}

.flow-branch-card-title {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.flow-action-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.flow-action-button:hover {
  transform: translateY(-1px);
}

.flow-action-button.tone-primary {
  background: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.22);
}

.flow-action-button.tone-success {
  background: #15803d;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(21, 128, 61, 0.22);
}

.flow-action-button.tone-danger {
  background: #b91c1c;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(185, 28, 28, 0.22);
}

.flow-action-button-label {
  font-size: 12px;
  font-weight: 800;
}

.flow-action-button-copy {
  font-size: 10px;
  line-height: 1.4;
  opacity: 0.92;
}

.flow-inline-notice {
  padding: 8px 10px;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
}

.flow-preview-tip,
.flow-branch-empty {
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
}

.flow-repair-fallback-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-repair-fallback-step {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.95);
}

.flow-repair-fallback-step-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.flow-repair-fallback-step p {
  margin: 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .assistant-content-box {
    width: min(calc(100% - 40px), 540px);
  }

  .flow-focus-layout {
    grid-template-columns: 1fr;
    gap: 10px;
    border: none;
    background: transparent;
  }

  .flow-focus-side {
    position: static;
    padding: 0;
    border-left: none;
    background: transparent;
  }

  .flow-step-strip {
    gap: 12px;
  }

  .flow-step-pill.has-next::after {
    width: 8px;
  }

  .flow-focus-header,
  .flow-branch-card-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .flow-step-pill {
    min-width: 164px;
    max-width: 180px;
  }

  .flow-focus-main {
    padding: 0;
  }

  .flow-focus-media {
    grid-template-columns: repeat(2, minmax(0, 72px));
  }

  .step-media-item {
    min-height: 54px;
    max-height: 54px;
  }
}

</style>


