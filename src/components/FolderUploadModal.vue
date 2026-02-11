<template>
  <div>
    <!-- 打开弹框按钮 -->
    <button @click="showModal = true" class="upload-btn">上传文件夹</button>

    <!-- 上传文件夹弹框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>上传文件夹</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <!-- 上传设置 -->
          <div v-if="!uploading && files.length > 0" class="upload-settings">
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="keepFolderStructure" />
                保持文件夹结构
              </label>
            </div>
            <div class="setting-item">
              <label>并行上传数量:</label>
              <select v-model="concurrentLimit" class="concurrent-select">
                <option value="3">3个</option>
                <option value="5">5个</option>
                <option value="10">10个</option>
                <option value="20">20个</option>
              </select>
            </div>
          </div>

          <!-- 文件夹上传区域 -->
          <div
            class="upload-area"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            :class="{ 'drag-over': dragOver }"
          >
            <input
              type="file"
              ref="fileInput"
              webkitdirectory
              directory
              multiple
              @change="handleFolderSelect"
              style="display: none"
            />

            <div class="upload-placeholder" @click="triggerFileInput">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>点击或拖拽文件夹到这里</p>
              <p class="hint">支持选择整个文件夹上传</p>
            </div>
          </div>

          <!-- 文件列表 -->
          <div v-if="files.length > 0" class="file-list">
            <div class="file-list-header">
              <h4>
                选择的文件 ({{ files.length }}个, 总计 {{ formatFileSize(totalSize) }})
              </h4>
              <button v-if="!uploading" @click="clearFiles" class="clear-btn">
                清空
              </button>
            </div>
            <div class="files-container">
              <div
                v-for="(file, index) in files"
                :key="index"
                class="file-item"
                :class="{
                  uploading: file.status === 'uploading',
                  success: file.status === 'success',
                  error: file.status === 'error',
                }"
              >
                <div class="file-info">
                  <span class="file-name">{{ file.path || file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="file-status">
                  <span v-if="file.status === 'waiting'" class="status-waiting"
                    >等待中</span
                  >
                  <span v-if="file.status === 'uploading'" class="status-uploading"
                    >上传中...</span
                  >
                  <span v-if="file.status === 'success'" class="status-success"
                    >✓ 成功</span
                  >
                  <span v-if="file.status === 'error'" class="status-error">✗ 失败</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-info">
              <div class="progress-stats">
                <span>上传进度: {{ progress }}%</span>
                <span
                  >成功: {{ successCount }} / 失败: {{ errorCount }} / 等待:
                  {{ waitingCount }}</span
                >
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
            </div>

            <div v-if="activeUploads.length > 0" class="active-uploads">
              <h5>正在上传 ({{ activeUploads.length }}个):</h5>
              <div
                v-for="upload in activeUploads"
                :key="upload.index"
                class="active-upload"
              >
                <span class="active-file-name">{{ upload.fileName }}</span>
                <span class="active-file-progress">{{ upload.progress }}%</span>
              </div>
            </div>

            <div v-if="uploadError" class="error-message">
              <p>上传出错: {{ uploadError }}</p>
              <div class="error-actions">
                <button @click="retryFailed" class="retry-btn">重试失败文件</button>
                <button @click="cancelUpload" class="cancel-btn">取消上传</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn" :disabled="uploading">
            取消
          </button>
          <button
            v-if="!uploading && files.length > 0"
            @click="clearFiles"
            class="clear-all-btn"
          >
            清空列表
          </button>
          <button
            @click="startUpload"
            class="upload-confirm-btn"
            :disabled="files.length === 0 || uploading"
          >
            {{ uploading ? '上传中...' : `开始上传 (${files.length}个文件)` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定义props接收fileIds
const props = defineProps({
  fileIds: {
    type: [String, Number],
    required: true,
  },
  apiBaseUrl: {
    type: String,
    default: '', // 如果没有传入，则使用相对路径
  },
  maxConcurrent: {
    type: Number,
    default: 5, // 默认最大并发数
  },
});

// 状态
const showModal = ref(false);
const dragOver = ref(false);
const files = ref([]);
const uploading = ref(false);
const progress = ref(0);
const uploadError = ref('');
const fileInput = ref(null);
const keepFolderStructure = ref(true);
const concurrentLimit = ref(5);
const activeUploads = ref([]);
const uploadController = ref(null); // 用于取消上传的AbortController

// 计算属性
const totalSize = computed(() => {
  return files.value.reduce((total, file) => total + file.size, 0);
});

const successCount = computed(() => {
  return files.value.filter((file) => file.status === 'success').length;
});

const errorCount = computed(() => {
  return files.value.filter((file) => file.status === 'error').length;
});

const waitingCount = computed(() => {
  return files.value.filter((file) => file.status === 'waiting' || !file.status).length;
});

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件夹选择
const handleFolderSelect = (event) => {
  const selectedFiles = Array.from(event.target.files);
  files.value = selectedFiles.map((file) => ({
    file,
    name: file.name,
    path: file.webkitRelativePath || file.name,
    size: file.size,
    status: 'waiting', // 初始状态
  }));
  dragOver.value = false;
};

// 处理拖放
const handleDrop = (event) => {
  const items = Array.from(event.dataTransfer.items);
  const fileItems = items.filter((item) => item.kind === 'file');

  if (fileItems.length > 0) {
    const filePromises = fileItems.map((item) => {
      if (item.webkitGetAsEntry) {
        return new Promise((resolve) => {
          const entry = item.webkitGetAsEntry();
          if (entry.isDirectory) {
            readDirectory(entry, entry.name, resolve);
          } else {
            entry.file((file) => {
              resolve([{ file, path: entry.name }]);
            });
          }
        });
      } else {
        return Promise.resolve([]);
      }
    });

    Promise.all(filePromises).then((results) => {
      const allFiles = results.flat();
      files.value = allFiles.map((item) => ({
        file: item.file,
        name: item.file.name,
        path: item.path,
        size: item.file.size,
        status: 'waiting',
      }));
    });
  }

  dragOver.value = false;
};

// 递归读取目录
const readDirectory = (entry, path, resolve) => {
  const files = [];
  const reader = entry.createReader();

  reader.readEntries((entries) => {
    const promises = entries.map((entry) => {
      return new Promise((resolveEntry) => {
        if (entry.isDirectory) {
          readDirectory(entry, path + '/' + entry.name, resolveEntry);
        } else {
          entry.file((file) => {
            resolveEntry([{ file, path: path + '/' + entry.name }]);
          });
        }
      });
    });

    Promise.all(promises).then((results) => {
      resolve(results.flat());
    });
  });
};

// 清空文件列表
const clearFiles = () => {
  files.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 开始并行上传
const startUpload = async () => {
  if (files.value.length === 0) return;

  uploading.value = true;
  uploadError.value = '';
  progress.value = 0;
  activeUploads.value = [];

  // 初始化文件状态
  files.value.forEach((file) => {
    file.status = 'waiting';
  });

  // 创建AbortController用于取消上传
  uploadController.value = new AbortController();

  try {
    const concurrent = parseInt(concurrentLimit.value);
    const totalFiles = files.value.length;
    let completed = 0;

    // 创建上传任务队列
    const uploadTasks = files.value.map((fileItem, index) => ({
      index,
      fileItem,
      status: 'waiting',
    }));

    // 并行上传函数
    const uploadBatch = async (batch) => {
      const uploadPromises = batch.map(async (task) => {
        const { index, fileItem } = task;

        // 更新文件状态
        files.value[index].status = 'uploading';

        // 添加到活动上传列表
        activeUploads.value.push({
          index,
          fileName: fileItem.path || fileItem.name,
          progress: 0,
        });

        try {
          // 使用FormData传输文件
          const formData = new FormData();
          formData.append('file', fileItem.file);
          formData.append('upload_type', 'folder');
          formData.append('overwrite', true);

          // 如果保持文件夹结构，添加路径信息
          if (keepFolderStructure.value && fileItem.path) {
            formData.append('relativePath', fileItem.path);
          }

          // 构建API URL
          const apiUrl = props.apiBaseUrl
            ? `${props.apiBaseUrl}/rest/api4/api/datasets/${props.fileIds}/upload`
            : `/rest/api4/api/datasets/${props.fileIds}/upload`;

          // 使用fetch上传
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            signal: uploadController.value.signal,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
              // 可以添加其他需要的headers
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          // 上传成功
          files.value[index].status = 'success';
        } catch (error) {
          if (error.name === 'AbortError') {
            files.value[index].status = 'waiting'; // 取消上传，重置为等待
          } else {
            files.value[index].status = 'error';
            files.value[index].error = error.message;
          }
          throw error;
        } finally {
          // 从活动上传列表移除
          const activeIndex = activeUploads.value.findIndex(
            (item) => item.index === index,
          );
          if (activeIndex > -1) {
            activeUploads.value.splice(activeIndex, 1);
          }

          // 更新进度
          completed++;
          progress.value = Math.round((completed / totalFiles) * 100);
        }
      });

      return Promise.allSettled(uploadPromises);
    };

    // 分批上传
    for (let i = 0; i < uploadTasks.length; i += concurrent) {
      const batch = uploadTasks.slice(i, i + concurrent);
      await uploadBatch(batch);

      // 如果上传被取消，退出循环
      if (uploadController.value.signal.aborted) {
        break;
      }
    }

    // 检查上传结果
    const failedFiles = files.value.filter((file) => file.status === 'error');
    if (failedFiles.length > 0) {
      uploadError.value = `${failedFiles.length} 个文件上传失败`;
    } else {
      // 所有文件上传成功
      alert(`上传完成！共上传了 ${files.value.length} 个文件`);
      resetUpload();
      showModal.value = false;
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('上传出错:', error);
      uploadError.value = error.message;
    }
  } finally {
    if (uploadController.value?.signal.aborted) {
      uploading.value = false;
    }
  }
};

// 重试失败的文件
const retryFailed = () => {
  const failedFiles = files.value.filter((file) => file.status === 'error');
  if (failedFiles.length === 0) return;

  // 重置失败文件的状态
  files.value.forEach((file) => {
    if (file.status === 'error') {
      file.status = 'waiting';
    }
  });

  uploadError.value = '';
  startUpload();
};

// 取消上传
const cancelUpload = () => {
  if (uploadController.value) {
    uploadController.value.abort();
    uploading.value = false;
    uploadError.value = '上传已取消';

    // 重置所有上传中的文件状态
    files.value.forEach((file) => {
      if (file.status === 'uploading') {
        file.status = 'waiting';
      }
    });
  }
};

// 关闭弹框
const closeModal = () => {
  if (uploading.value) {
    if (confirm('上传正在进行中，确定要取消并关闭吗？')) {
      cancelUpload();
      showModal.value = false;
      resetUpload();
    }
  } else {
    showModal.value = false;
    resetUpload();
  }
};

// 重置上传状态
const resetUpload = () => {
  files.value = [];
  uploading.value = false;
  progress.value = 0;
  uploadError.value = '';
  activeUploads.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  uploadController.value = null;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
/* 按钮样式 */
.upload-btn {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #66b1ff;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

/* 上传设置 */
.upload-settings {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.setting-item input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.concurrent-select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.concurrent-select:focus {
  outline: none;
  border-color: #409eff;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.upload-area:hover,
.drag-over {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder svg {
  color: #409eff;
  margin-bottom: 10px;
}

.hint {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

/* 文件列表样式 */
.file-list {
  margin-top: 20px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.file-list-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.clear-btn {
  padding: 4px 12px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.clear-btn:hover {
  background-color: #f78989;
}

.files-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 5px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  transition: background-color 0.3s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item.uploading {
  background-color: #f0f7ff;
}

.file-item.success {
  background-color: #f0f9eb;
}

.file-item.error {
  background-color: #fef0f0;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 10px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.file-size {
  color: #999;
  white-space: nowrap;
  font-size: 12px;
  min-width: 60px;
  text-align: right;
}

.file-status {
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
  min-width: 60px;
  text-align: right;
}

.status-waiting {
  color: #909399;
}

.status-uploading {
  color: #409eff;
}

.status-success {
  color: #67c23a;
}

.status-error {
  color: #f56c6c;
}

/* 上传进度样式 */
.upload-progress {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.progress-info {
  margin-bottom: 15px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #409eff;
  transition: width 0.3s;
  border-radius: 4px;
}

/* 活动上传列表 */
.active-uploads {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.active-uploads h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.active-upload {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.active-upload:last-child {
  border-bottom: none;
}

.active-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 10px;
  color: #666;
}

.active-file-progress {
  color: #409eff;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

/* 错误信息样式 */
.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 4px;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.error-message p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 10px;
}

.retry-btn,
.cancel-btn {
  padding: 6px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
}

.retry-btn {
  background-color: #f56c6c;
  color: white;
}

.retry-btn:hover {
  background-color: #f78989;
}

.cancel-btn {
  background-color: #909399;
  color: white;
}

.cancel-btn:hover {
  background-color: #a6a9ad;
}

/* 模态框底部样式 */
.modal-footer {
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.clear-all-btn,
.upload-confirm-btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: none;
  transition: background-color 0.3s;
  min-width: 80px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #e8e8e8;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-all-btn {
  background-color: #f5f5f5;
  color: #666;
  margin-right: auto;
}

.clear-all-btn:hover {
  background-color: #e8e8e8;
}

.upload-confirm-btn {
  background-color: #409eff;
  color: white;
}

.upload-confirm-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.upload-confirm-btn:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}
</style>
