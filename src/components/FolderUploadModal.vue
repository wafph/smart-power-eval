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
            <h4>选择的文件 ({{ files.length }}个)</h4>
            <div class="file-item" v-for="(file, index) in files" :key="index">
              <span class="file-name">{{ file.path || file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>

          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <p>
              上传中: {{ progress }}% ({{ currentUploadIndex + 1 }}/{{ files.length }})
            </p>
            <p v-if="currentFileName" class="current-file">
              正在上传: {{ currentFileName }}
            </p>
            <div v-if="uploadError" class="error-message">
              <p>上传出错: {{ uploadError }}</p>
              <button @click="retryUpload" class="retry-btn">重试</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn" :disabled="uploading">
            取消
          </button>
          <button
            @click="startUpload"
            class="upload-confirm-btn"
            :disabled="files.length === 0 || uploading"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
});

// 状态
const showModal = ref(false);
const dragOver = ref(false);
const files = ref([]);
const uploading = ref(false);
const progress = ref(0);
const currentUploadIndex = ref(0);
const currentFileName = ref('');
const uploadError = ref('');
const fileInput = ref(null);

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
  }));
  dragOver.value = false;
};

// 处理拖放
const handleDrop = (event) => {
  const items = Array.from(event.dataTransfer.items);
  const fileItems = items.filter((item) => item.kind === 'file');

  if (fileItems.length > 0) {
    // 获取所有文件
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

// 开始上传 - 使用串行方式调用实际API
const startUpload = async () => {
  if (files.value.length === 0) return;

  uploading.value = true;
  uploadError.value = '';
  currentUploadIndex.value = 0;
  progress.value = 0;

  try {
    // 逐个上传文件
    for (let i = 0; i < files.value.length; i++) {
      const fileItem = files.value[i];
      currentUploadIndex.value = i;
      currentFileName.value = fileItem.path || fileItem.name;

      // 使用FormData传输文件
      const formData = new FormData();
      formData.append('files', fileItem.file);
      // formData.append('upload_type', 'file');
      formData.append('upload_type', 'folder');
      formData.append('overwrite', true);
      // 如果需要保持目录结构，可以添加路径信息
      if (fileItem.path) {
        formData.append('path', fileItem.path);
      }

      // 构建API URL
      const apiUrl = props.apiBaseUrl
        ? `${props.apiBaseUrl}/rest/api4/api/datasets/${props.fileIds}/upload`
        : `/rest/api4/api/datasets/${props.fileIds}/upload`;

      // 调用实际API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // 添加认证头（根据实际情况调整）
      });

      if (!response.ok) {
        let errorMsg = `上传失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          // 如果响应不是JSON，使用默认错误信息
        }
        throw new Error(errorMsg);
      }

      // 尝试解析响应（假设返回JSON）
      try {
        const result = await response.json();
        console.log(`文件 ${fileItem.name} 上传成功:`, result);
      } catch (e) {
        console.log(`文件 ${fileItem.name} 上传成功`);
      }

      // 更新进度
      progress.value = Math.round(((i + 1) / files.value.length) * 100);
    }

    // 上传完成
    alert(`上传完成！共上传了 ${files.value.length} 个文件`);
    resetUpload();
    showModal.value = false;
  } catch (error) {
    console.error('上传出错:', error);
    uploadError.value = error.message;
    uploading.value = false;
  }
};

// 重试上传
const retryUpload = () => {
  uploadError.value = '';
  startUpload();
};

// 关闭弹框
const closeModal = () => {
  if (!uploading.value) {
    showModal.value = false;
    resetUpload();
  }
};

// 重置上传状态
const resetUpload = () => {
  files.value = [];
  uploading.value = false;
  progress.value = 0;
  currentUploadIndex.value = 0;
  currentFileName.value = '';
  uploadError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
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
  max-width: 600px;
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
  max-height: 300px;
  overflow-y: auto;
}

.file-list h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
  position: sticky;
  top: 0;
  background: white;
  padding: 5px 0;
  z-index: 1;
}

.file-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  align-items: center;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  margin-right: 10px;
}

.file-size {
  color: #999;
  white-space: nowrap;
  font-size: 12px;
}

/* 上传进度样式 */
.upload-progress {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #409eff;
  transition: width 0.3s;
  border-radius: 4px;
}

.upload-progress p {
  margin: 0 0 5px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 当前文件信息 */
.current-file {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 0;
  padding: 5px 0;
  background-color: #e8f4ff;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 错误信息样式 */
.error-message {
  margin-top: 10px;
  padding: 10px;
  background-color: #ffe6e6;
  border-radius: 4px;
  color: #d33;
  border: 1px solid #ffcccc;
}

.error-message p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.retry-btn {
  padding: 6px 15px;
  background-color: #d33;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #c00;
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
