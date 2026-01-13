<template>
  <div class="task-log-container">
    <!-- 头部信息 -->
    <div class="header-section">
      <div class="page-title">
        <h1>任务日志查看</h1>
      </div>

      <!-- 任务ID和路径信息 -->
      <el-card class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">任务ID:</div>
            <div class="info-value">
              <el-tag type="info" size="large"> #{{ taskLogs.task_id }} </el-tag>
            </div>
          </div>

          <div class="info-item full-width">
            <div class="info-label">日志文件路径:</div>
            <div class="info-value path-display">
              <el-input v-model="taskLogs.log_path" readonly class="path-input">
                <template #append>
                  <el-tooltip content="复制路径">
                    <el-button :icon="CopyDocument" @click="copyLogPath" />
                  </el-tooltip>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 日志内容区域 -->
    <el-card class="log-content-card">
      <template #header>
        <div class="log-header">
          <h3>日志内容</h3>
          <div class="header-actions">
            <el-tooltip content="复制所有日志">
              <el-button :icon="CopyDocument" @click="copyAllLogs" size="small" />
            </el-tooltip>
            <span class="log-count"> 共 {{ taskLogs.logs?.length || 0 }} 行 </span>
          </div>
        </div>
      </template>

      <!-- 日志显示区域 -->
      <div class="log-display-area">
        <!-- 没有日志 -->
        <div v-if="!taskLogs.logs?.length" class="no-logs">
          <el-empty description="暂无日志数据" />
        </div>

        <!-- 日志列表 -->
        <div v-else class="log-list">
          <div
            v-for="(log, index) in taskLogs.logs"
            :key="index"
            class="log-item"
            :class="getLogLineClass(log)"
          >
            <div class="log-line-number">{{ index + 1 }}</div>
            <div class="log-line-content">{{ log }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 错误详情弹窗 -->
    <el-dialog v-model="showErrorDetail" title="错误详情" width="600px">
      <div class="error-detail">
        <h4>{{ currentError.type }}</h4>
        <pre>{{ currentError.message }}</pre>
        <div v-if="currentError.file" class="error-file">
          <strong>文件:</strong> {{ currentError.file }}
        </div>
        <div v-if="currentError.line" class="error-line">
          <strong>行号:</strong> {{ currentError.line }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
import { getTasksLogs, getTasksLogStream } from '@/api';
import { useState } from '@/utils/state';

// 响应式数据
const showErrorDetail = ref(false);
const currentError = ref({});
const { states } = useState();
// 任务日志数据
const taskLogs = reactive({
  task_id: 2,
  log_path: '',
  logs: [],
});

// 生命周期
onMounted(() => {
  getTasksLog();
  getTasksLogStreams();
});

// 获取日志行样式
const getLogLineClass = (log) => {
  if (log.includes('Error:')) return 'log-error';
  if (log.includes('Warning:')) return 'log-warning';
  if (log.includes('Traceback')) return 'log-traceback';
  if (log.includes('File "')) return 'log-file';
  return '';
};

// 复制日志路径
const copyLogPath = async () => {
  try {
    await navigator.clipboard.writeText(taskLogs.log_path);
    ElMessage.success('日志路径已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};

function getTasksLog() {
  getTasksLogs(states.id).then((res) => {
    if (res.status === 200) {
      taskLogs.task_id = res.data.task_id;
      taskLogs.log_path = res.data.log_path;
      taskLogs.logs = [...res.data.logs];

      ElNotification.success({
        title: '日志',
        message: '获取日志成功',
        duration: 2000,
      });
    }
  });
}

function getTasksLogStreams() {
  getTasksLogStream(states.id).then((res) => {
    if (res.status === 200) {
      ElNotification.success({
        title: '日志流',
        message: '获取日志流成功',
        duration: 2000,
      });
    }
  });
}

// 复制所有日志
const copyAllLogs = async () => {
  try {
    const allLogs = taskLogs.logs.join('\n');
    await navigator.clipboard.writeText(allLogs);
    ElMessage.success('所有日志已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};
</script>

<style lang="less" scoped>
.task-log-container {
  padding: 20px;
  margin: 0 auto;
  background: #f5f7fa;
}

.header-section {
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
}

.info-card {
  margin-bottom: 20px;

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;

    &.full-width {
      grid-column: 1 / -1;
    }
  }

  .info-label {
    font-weight: 600;
    color: #606266;
    min-width: 100px;
  }

  .info-value {
    flex: 1;
  }

  .path-display {
    width: 100%;
  }

  .path-input {
    :deep(.el-input-group__append) {
      background-color: transparent;
      border: none;
      padding: 0 8px;
    }
  }
}

.log-content-card {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .log-count {
      color: #909399;
      font-size: 14px;
      margin-left: 10px;
    }
  }

  .log-display-area {
    flex: 1;
    overflow: hidden;
    background: #1e1e1e;
    border-radius: 6px;
    margin: 16px 0;
  }

  .no-logs {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
  }

  .log-list {
    height: 500px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.5;
    color: #d4d4d4;
    padding: 0;

    /* 滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #2d2d2d;
    }

    &::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #666;
    }
  }

  .log-item {
    display: flex;
    padding: 2px 12px;
    border-left: 3px solid transparent;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.highlighted {
      background-color: rgba(255, 255, 0, 0.1);
      animation: highlightPulse 2s ease-in-out;
    }

    &.log-error {
      border-left-color: #f56c6c;
      color: #f56c6c;
    }

    &.log-warning {
      border-left-color: #e6a23c;
      color: #e6a23c;
    }

    &.log-traceback {
      border-left-color: #909399;
      color: #909399;
    }

    &.log-file {
      border-left-color: #409eff;
      color: #409eff;
    }
  }

  .log-line-number {
    min-width: 40px;
    text-align: right;
    color: #858585;
    padding-right: 8px;
    user-select: none;
  }

  .log-line-content {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;

    :deep(.file-path) {
      color: #569cd6;
    }

    :deep(.error-type) {
      color: #f44747;
      font-weight: bold;
    }

    :deep(.error-message) {
      color: #ce9178;
    }

    :deep(.line-number) {
      color: #b5cea8;
    }
  }
}

.error-detail {
  pre {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 12px 0;
  }

  .error-file,
  .error-line {
    margin-top: 8px;
    color: #606266;
  }
}

@keyframes highlightPulse {
  0%,
  100% {
    background-color: rgba(255, 255, 0, 0.1);
  }
  50% {
    background-color: rgba(255, 255, 0, 0.2);
  }
}
</style>
