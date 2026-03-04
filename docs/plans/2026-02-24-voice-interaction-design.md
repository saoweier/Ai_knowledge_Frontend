# 语音交互功能设计文档

## 概述

为设备维保知识库前端 ChatFlow 页面添加语音交互功能，支持语音输入、唤醒词激活、自动播报和语音指令控制。

## 功能需求

1. **语音开关**: 在输入区域添加语音交互模式开关
2. **麦克风输入**: 按钮触发语音录入，转换为文本
3. **唤醒词**: "维修助手"激活语音输入服务
4. **自动播报**: 将"操作指南"内容自动播报
5. **语音指令**: 支持"是"/"否"/"下一步"语音按钮操作

## 技术方案

### 语音引擎
- **ASR (语音识别)**: 自建后端服务
- **TTS (语音合成)**: 自建后端服务
- **唤醒词检测**: 后端检测

### 唤醒词工作模式
- 手动触发 + 后台监听
- 用户开启语音开关后，后台监听唤醒词
- 检测到"维修助手"后自动激活录入

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (Vue 3)                          │
├─────────────────────────────────────────────────────────┤
│  ChatFlow.vue                                           │
│  ├── voiceEnabled (开关状态)                             │
│  ├── isListening (监听状态)                              │
│  └── useVoiceController (语音控制器 composable)          │
│                                                         │
│  MessageInput.vue                                       │
│  └── 麦克风按钮 + 语音开关                                │
├─────────────────────────────────────────────────────────┤
│               useVoiceController.ts (新增)              │
│  ├── startListening()  开始监听唤醒词                    │
│  ├── stopListening()   停止监听                          │
│  ├── speak(text)       TTS播报                          │
│  └── handleWakeWord()  处理唤醒词                        │
├─────────────────────────────────────────────────────────┤
│                    后端 (FastAPI)                        │
├─────────────────────────────────────────────────────────┤
│  新增接口:                                               │
│  POST /voice/asr     语音识别                           │
│  POST /voice/tts     语音合成                           │
│  POST /voice/detect_wake    唤醒词检测                  │
└─────────────────────────────────────────────────────────┘
```

## 前端组件设计

### MessageInput.vue 修改

```
修改前:  [ 输入框 ] [设置按钮] [发送按钮]

修改后:  [🎤按钮] [ 输入框 ] [语音开关] [设置按钮] [发送按钮]
```

### useVoiceController.ts

```typescript
// 核心状态
const voiceEnabled = ref(false)     // 语音模式开关
const isListening = ref(false)      // 是否正在监听唤醒词
const isRecording = ref(false)      // 是否正在录音
const isSpeaking = ref(false)       // 是否正在播报

// 核心方法
startWakeWordDetection()  // 开启后台唤醒词监听
stopWakeWordDetection()   // 停止监听
recordAndSend()           // 录音并发送
speakText(text)           // TTS播报
handleVoiceCommand(cmd)   // 处理"是/否/下一步"指令
```

### ChatFlow.vue 修改

- 监听响应返回，自动播报 guidance 或 step.description
- 播报完毕后，若语音模式开启，自动监听按钮指令

## 后端 API 设计

### 新增接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | `/voice/asr` | 语音识别 | `FormData: audio_file` |
| POST | `/voice/tts` | 语音合成 | `{"text": "要合成的文本"}` |
| POST | `/voice/detect_wake` | 唤醒词检测 | `FormData: audio_chunk` |

### 响应格式

```python
# ASR 响应
{"text": "识别出的文本", "confidence": 0.95}

# TTS 响应
# 直接返回 audio/mpeg 二进制流

# 唤醒词检测响应
{"detected": true, "keyword": "维修助手"}
```

## 后端语音服务建议

推荐使用开源方案:
- **ASR**: FunASR (阿里开源) 或 Whisper
- **TTS**: edge-tts (微软Edge免费TTS) 或 Coqui TTS
- **唤醒词**: Porcupine 或 Sherpa-ONNX

## 实现计划

### Phase 1: 前端基础设施
1. 创建 `useVoiceController.ts` composable
2. 修改 `MessageInput.vue` 添加麦克风按钮和语音开关
3. 修改 `ChatFlow.vue` 集成语音控制器

### Phase 2: 后端 API
1. 创建 `voice.py` 路由模块
2. 实现 ASR 接口
3. 实现 TTS 接口
4. 实现唤醒词检测接口

### Phase 3: 功能集成
1. 语音输入 → 文本 → 发送
2. 响应自动播报
3. 语音指令控制按钮

## 交互流程

1. 用户开启语音开关 → 进入"待唤醒"状态
2. 用户点击麦克风 或 说出"维修助手" → 进入"录入"状态
3. 语音 → 后端ASR → 文本 → 填入输入框/发送
4. 后端返回响应 → TTS播报"操作指南"内容
5. 播报完毕 → 自动监听"是/否/下一步"语音指令
