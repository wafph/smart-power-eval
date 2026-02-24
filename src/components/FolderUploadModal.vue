】
<template>
  <div>
    <!-- 打开弹框按钮 -->
    <button @click="showModal = true" class="upload-btn">上传文件/文件夹</button>

    <!-- 上传弹框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>上传文件/文件夹</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <!-- 上传类型选择 -->
          <div class="upload-type-selector">
            <button
              @click="uploadType = 'file'"
              :class="{ active: uploadType === 'file' }"
              class="type-btn"
            >
              上传文件
            </button>
            <button
              @click="uploadType = 'folder'"
              :class="{ active: uploadType === 'folder' }"
              class="type-btn"
            >
              上传文件夹
            </button>
          </div>

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

          <!-- 上传区域 -->
          <div
            class="upload-area"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            :class="{ 'drag-over': dragOver }"
          >
            <!-- 文件上传输入 -->
            <input
              v-if="uploadType !== 'folder'"
              type="file"
              ref="fileInput"
              multiple
              @change="handleFileSelect"
              style="display: none"
            />

            <!-- 文件夹上传输入 -->
            <input
              v-if="uploadType !== 'file'"
              type="file"
              ref="folderInput"
              webkitdirectory
              directory
              multiple
              @change="handleFolderSelect"
              style="display: none"
            />

            <div class="upload-placeholder" @click="triggerInput">
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
              <p v-if="uploadType === 'file'">点击选择或拖拽文件到这里</p>
              <p v-if="uploadType === 'folder'">点击选择或拖拽选文件夹到这里,默认上传文件夹内所有文件，最后上传的文件会覆盖之前的文件</p>
              <p class="hint">支持批量上传</p>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div v-if="!uploading" class="quick-actions">
            <button
              @click="addMoreFiles"
              class="quick-btn"
              v-if="uploadType !== 'folder'"
            >
              <span>➕ 添加文件</span>
            </button>
            <button
              @click="addMoreFolders"
              v-if="uploadType !== 'file'"
              class="quick-btn"
            >
              <span>📁 添加文件夹</span>
            </button>
            <button v-if="files.length > 0" @click="clearFiles" class="quick-btn">
              <span>🗑️ 清空列表</span>
            </button>
          </div>

          <!-- 文件列表 -->
          <div v-if="files.length > 0" class="file-list">
            <div class="file-list-header">
              <h4>已选择 {{ files.length }} 个项目 ({{ formatFileSize(totalSize) }})</h4>
              <div class="list-stats">
                <span class="stat-item">📁: {{ folderCount }}</span>
                <span class="stat-item">📄: {{ fileCount }}</span>
              </div>
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
                  'is-folder': file.isFolder,
                }"
              >
                <div class="file-icon">
                  <span v-if="file.isFolder">📁</span>
                  <span v-else>📄</span>
                </div>
                <div class="file-info">
                  <div class="file-name-row">
                    <span class="file-name" :title="file.path || file.name">
                      {{ file.path || file.name }}
                    </span>
                    <button
                      v-if="!uploading && file.isFolder"
                      @click.stop="removeFolder(file.name)"
                      class="remove-folder-btn"
                      title="移除文件夹"
                    >
                      ×
                    </button>
                  </div>
                  <div class="file-details">
                    <span v-if="file.isFolder" class="folder-info">
                      包含 {{ file.fileCount || 0 }} 个文件
                    </span>
                    <span v-else class="file-size">
                      {{ formatFileSize(file.size) }}
                    </span>
                    <span class="file-status" :class="'status-' + file.status">
                      {{ getStatusText(file.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-info">
              <div class="progress-stats">
                <div class="stats-grid">
                  <div class="stat-box success">
                    <span class="stat-label">成功</span>
                    <span class="stat-value">{{ successCount }}</span>
                  </div>
                  <div class="stat-box uploading">
                    <span class="stat-label">上传中</span>
                    <span class="stat-value">{{ uploadingCount }}</span>
                  </div>
                  <div class="stat-box error">
                    <span class="stat-label">失败</span>
                    <span class="stat-value">{{ errorCount }}</span>
                  </div>
                  <div class="stat-box waiting">
                    <span class="stat-label">等待</span>
                    <span class="stat-value">{{ waitingCount }}</span>
                  </div>
                </div>
                <div class="progress-percent">{{ progress }}%</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
            </div>

            <div v-if="activeUploads.length > 0" class="active-uploads">
              <h5>正在上传 ({{ activeUploads.length }}个):</h5>
              <div v-for="upload in activeUploads" :key="upload.id" class="active-upload">
                <div class="active-file-icon">
                  <span v-if="upload.isFolder">📁</span>
                  <span v-else>📄</span>
                </div>
                <div class="active-file-info">
                  <span class="active-file-name">{{ upload.fileName }}</span>
                  <div class="active-file-progress">
                    <div class="mini-progress-bar">
                      <div
                        class="mini-progress-fill"
                        :style="{ width: upload.progress + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ upload.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="uploadError" class="error-message">
              <div class="error-header">
                <span>⚠️ 上传出错: {{ uploadError }}</span>
              </div>
              <div class="error-actions">
                <button @click="retryFailed" class="retry-btn">重试失败文件</button>
                <button @click="pauseUpload" class="pause-btn" v-if="!isPaused">
                  暂停上传
                </button>
                <button @click="resumeUpload" class="resume-btn" v-else>继续上传</button>
                <button @click="cancelUpload" class="cancel-btn">取消上传</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="closeModal"
            class="cancel-btn"
            :disabled="uploading && !isPaused"
          >
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
            {{ getUploadButtonText() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
const uploadType = ref('file'); // file, folder, mixed
const files = ref([]);
const uploading = ref(false);
const isPaused = ref(false);
const progress = ref(0);
const uploadError = ref('');
const fileInput = ref(null);
const folderInput = ref(null);
const keepFolderStructure = ref(true);
const concurrentLimit = ref(5);
const activeUploads = ref([]);
const uploadController = ref(null);
const uploadQueue = ref([]); // 上传队列
let currentUploadIndex = 0;
let uploadedCount = 0;

// 计算属性
const totalSize = computed(() => {
  return files.value.reduce((total, file) => total + (file.size || 0), 0);
});

const folderCount = computed(() => {
  return files.value.filter((file) => file.isFolder).length;
});

const fileCount = computed(() => {
  return files.value.filter((file) => !file.isFolder).length;
});

const successCount = computed(() => {
  return files.value.filter((file) => file.status === 'success').length;
});

const errorCount = computed(() => {
  return files.value.filter((file) => file.status === 'error').length;
});

const uploadingCount = computed(() => {
  return files.value.filter((file) => file.status === 'uploading').length;
});

const waitingCount = computed(() => {
  return files.value.filter((file) => file.status === 'waiting' || !file.status).length;
});

// 获取上传按钮文本
const getUploadButtonText = () => {
  if (uploading.value) {
    return isPaused.value ? '已暂停' : '上传中...';
  }
  if (files.value.length === 0) {
    return '开始上传';
  }
  return `开始上传 (${files.value.length}个项目)`;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    waiting: '等待中',
    uploading: '上传中',
    success: '成功',
    error: '失败',
  };
  return statusMap[status] || '等待中';
};

// 触发输入
const triggerInput = () => {
  if (uploadType.value === 'file') {
    fileInput.value.click();
  } else if (uploadType.value === 'folder') {
    folderInput.value.click();
  } else {
    // 混合模式，让用户选择
    if (confirm('请选择：\n确定 - 选择文件\n取消 - 选择文件夹')) {
      fileInput.value.click();
    } else {
      folderInput.value.click();
    }
  }
};

// 处理文件选择
const handleFileSelect = async (event) => {
  const selectedFiles = Array.from(event.target.files);
  await addFilesToQueue(selectedFiles, false);
  event.target.value = '';
};

// 处理文件夹选择
const handleFolderSelect = async (event) => {
  const selectedFiles = Array.from(event.target.files);
  if (selectedFiles.length > 0) {
    // 获取文件夹名称
    const folderName = selectedFiles[0].webkitRelativePath.split('/')[0];

    // 将文件夹作为一个整体添加到文件列表
    files.value.push({
      name: folderName,
      path: folderName,
      isFolder: true,
      files: selectedFiles,
      fileCount: selectedFiles.length,
      status: 'waiting',
      size: selectedFiles.reduce((sum, file) => sum + file.size, 0),
    });

    // 同时添加所有文件到上传队列
    await addFilesToQueue(selectedFiles, true, folderName);
  }
  event.target.value = '';
};

// 添加文件到上传队列
const addFilesToQueue = async (fileList, isFromFolder = false, folderPath = '') => {
  for (const file of fileList) {
    // 避免重复添加
    const existingIndex = uploadQueue.value.findIndex(
      (item) =>
        item.file.name === file.name &&
        item.file.size === file.size &&
        item.file.lastModified === file.lastModified,
    );

    if (existingIndex === -1) {
      uploadQueue.value.push({
        file,
        isFolderItem: isFromFolder,
        folderPath: isFromFolder ? folderPath : '',
        status: 'waiting',
        relativePath: file.webkitRelativePath || '',
      });
    }
  }

  // 如果不是从文件夹来的，单独添加文件
  if (!isFromFolder) {
    for (const file of fileList) {
      files.value.push({
        file,
        name: file.name,
        path: file.name,
        isFolder: false,
        size: file.size,
        status: 'waiting',
      });
    }
  }
};

// 修复后的 handleDrop 函数
const handleDrop = async (event) => {
  event.preventDefault();
  const items = Array.from(event.dataTransfer.items);
  dragOver.value = false;

  // 用于收集所有文件的数组
  const allFiles = [];
  const folderInfo = {};

  // 处理每个拖拽的项目
  for (const item of items) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        // 获取项目的结果
        const results = await traverseDirectory(entry);
        
        // 分离文件夹和文件
        const folders = results.filter(r => r.isFolder);
        const files = results.filter(r => !r.isFolder);
        
        // 处理文件夹
        folders.forEach(folder => {
          // 如果这个文件夹还没被记录
          if (folder.name && !folderInfo[folder.name]) {
            folderInfo[folder.name] = {
              name: folder.name,
              path: folder.path,
              isFolder: true,
              files: [], // 稍后填充
              fileCount: 0
            };
          }
        });
        
        // 处理文件
        files.forEach(file => {
          // 如果文件属于某个拖拽的文件夹
          if (file.path.includes('/')) {
            const folderName = file.path.split('/')[0];
            if (folderInfo[folderName]) {
              folderInfo[folderName].files.push(file.file);
              folderInfo[folderName].fileCount++;
            }
          } else {
            // 独立文件
            allFiles.push({
              file: file.file,
              path: file.path,
              isFolder: false,
              relativePath: file.relativePath
            });
          }
        });
      } else {
        // 普通文件（非目录）
        const file = item.getAsFile();
        allFiles.push({
          file,
          path: file.name,
          isFolder: false,
          relativePath: file.name
        });
      }
    }
  }

  // 1. 添加文件夹到显示列表
  Object.values(folderInfo).forEach(folder => {
    if (folder.files.length > 0) {
      const totalSize = folder.files.reduce((sum, file) => sum + file.size, 0);
      
      // 添加到显示的文件列表
      files.value.push({
        name: folder.name,
        path: folder.path,
        isFolder: true,
        files: folder.files,
        fileCount: folder.fileCount,
        status: 'waiting',
        size: totalSize
      });

      // 添加文件夹内的所有文件到上传队列
      folder.files.forEach(file => {
        uploadQueue.value.push({
          file,
          isFolderItem: true,
          folderPath: folder.name,
          status: 'waiting',
          relativePath: file.webkitRelativePath || file.name
        });
      });
    }
  });

  // 2. 添加独立的文件
  allFiles.forEach(fileItem => {
    if (!fileItem.isFolder) {
      // 添加到显示的文件列表
      files.value.push({
        file: fileItem.file,
        name: fileItem.file.name,
        path: fileItem.path,
        isFolder: false,
        size: fileItem.file.size,
        status: 'waiting'
      });

      // 添加到上传队列
      uploadQueue.value.push({
        file: fileItem.file,
        isFolderItem: false,
        folderPath: '',
        status: 'waiting',
        relativePath: fileItem.relativePath
      });
    }
  });
};

// 遍历目录
// 更简洁的遍历目录函数
const traverseDirectory = async (entry, basePath = '') => {
  return new Promise(async (resolve, reject) => {
    const files = [];
    
    // 递归遍历函数
    const readEntries = async (dirEntry, currentPath) => {
      return new Promise((resolveRead) => {
        const dirReader = dirEntry.createReader();
        
        const readBatch = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolveRead();
              return;
            }
            
            for (const entry of entries) {
              const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
              
              if (entry.isFile) {
                const file = await new Promise((resolveFile) => {
                  entry.file(resolveFile);
                });
                
                files.push({
                  file,
                  path: entryPath,
                  isFolder: false,
                  relativePath: entryPath
                });
              } else if (entry.isDirectory) {
                await readEntries(entry, entryPath);
              }
            }
            
            // 继续读取下一批
            readBatch();
          });
        };
        
        readBatch();
      });
    };
    
    if (entry.isFile) {
      const file = await new Promise((resolveFile) => {
        entry.file(resolveFile);
      });
      
      resolve([{
        file,
        path: basePath ? `${basePath}/${entry.name}` : entry.name,
        isFolder: false,
        relativePath: basePath ? `${basePath}/${entry.name}` : entry.name
      }]);
    } else if (entry.isDirectory) {
      await readEntries(entry, basePath ? `${basePath}/${entry.name}` : entry.name);
      
      // 返回文件夹信息和所有文件
      resolve([
        {
          name: entry.name,
          path: basePath ? `${basePath}/${entry.name}` : entry.name,
          isFolder: true,
          files: files.map(f => f.file),
          fileCount: files.length
        },
        ...files
      ]);
    } else {
      resolve([]);
    }
  });
};

// 添加更多文件
const addMoreFiles = () => {
  fileInput.value.click();
};

// 添加更多文件夹
const addMoreFolders = () => {
  folderInput.value.click();
};

// 移除文件夹
const removeFolder = (folderName) => {
  // 从文件列表中移除文件夹
  const folderIndex = files.value.findIndex((f) => f.isFolder && f.name === folderName);
  if (folderIndex > -1) {
    files.value.splice(folderIndex, 1);
  }

  // 从上传队列中移除该文件夹的文件
  uploadQueue.value = uploadQueue.value.filter((item) => item.folderPath !== folderName);
};

// 清空文件列表
const clearFiles = () => {
  files.value = [];
  uploadQueue.value = [];
  if (fileInput.value) fileInput.value.value = '';
  if (folderInput.value) folderInput.value.value = '';
};

// 开始并行上传
const startUpload = async () => {
  if (uploadQueue.value.length === 0) return;

  uploading.value = true;
  isPaused.value = false;
  uploadError.value = '';
  progress.value = 0;
  activeUploads.value = [];
  currentUploadIndex = 0;
  uploadedCount = 0;

  // 初始化所有文件状态
  files.value.forEach((file) => {
    file.status = 'waiting';
  });
  uploadQueue.value.forEach((item) => {
    item.status = 'waiting';
  });

  // 创建AbortController用于取消上传
  uploadController.value = new AbortController();

  // 开始上传处理
  await processUploadQueue();
};

// 处理上传队列
const processUploadQueue = async () => {
  const totalFiles = uploadQueue.value.length;
  const concurrent = Math.min(parseInt(concurrentLimit.value), totalFiles);

  while (currentUploadIndex < totalFiles && !isPaused.value) {
    // 获取当前批次的文件
    const batch = [];
    for (let i = 0; i < concurrent && currentUploadIndex < totalFiles; i++) {
      const uploadItem = uploadQueue.value[currentUploadIndex];
      if (uploadItem.status === 'waiting') {
        batch.push(uploadItem);
        uploadItem.status = 'uploading';

        // 找到对应的文件项并更新状态
        if (uploadItem.isFolderItem) {
          const folderItem = files.value.find(
            (f) => f.isFolder && f.name === uploadItem.folderPath,
          );
          if (folderItem) {
            folderItem.status = 'uploading';
          }
        } else {
          const fileItem = files.value.find(
            (f) => !f.isFolder && f.name === uploadItem.file.name,
          );
          if (fileItem) {
            fileItem.status = 'uploading';
          }
        }

        // 添加到活动上传列表
        const uploadId = `${Date.now()}-${currentUploadIndex}`;
        activeUploads.value.push({
          id: uploadId,
          fileName: uploadItem.relativePath || uploadItem.file.name,
          isFolder: uploadItem.isFolderItem,
          progress: 0,
          uploadItem: uploadItem,
        });
      }
      currentUploadIndex++;
    }

    if (batch.length > 0) {
      // 并行上传当前批次
      await Promise.allSettled(batch.map((item) => uploadFile(item)));
    }

    // 如果暂停，等待
    if (isPaused.value) {
      await new Promise((resolve) => {
        const checkResume = setInterval(() => {
          if (!isPaused.value) {
            clearInterval(checkResume);
            resolve();
          }
        }, 100);
      });
    }
  }

  // 检查是否所有文件都已完成
  if (uploadedCount >= totalFiles) {
    const failedItems = uploadQueue.value.filter((item) => item.status === 'error');
    if (failedItems.length > 0) {
      uploadError.value = `${failedItems.length} 个文件上传失败`;
    } else {
      // 所有文件上传成功
      alert(`上传完成！共上传了 ${totalFiles} 个文件`);
      resetUpload();
      showModal.value = false;
    }
  }
};

// 上传单个文件
const uploadFile = async (uploadItem) => {
  const activeUpload = activeUploads.value.find((au) => au.uploadItem === uploadItem);
  
  try {
    const formData = new FormData();
    formData.append('file', uploadItem.file);
    formData.append('upload_type', 'file');
    formData.append('overwrite', true);

    // 如果需要保持文件夹结构，添加路径信息
    if (keepFolderStructure.value) {
      if (uploadItem.isFolderItem && uploadItem.folderPath) {
        formData.append('folder', uploadItem.folderPath);
      }
      if (uploadItem.relativePath) {
        formData.append('relativePath', uploadItem.relativePath);
      }
    }

    // 构建API URL
    const apiUrl = props.apiBaseUrl
      ? `${props.apiBaseUrl}/rest/api4/api/datasets/${props.fileIds}/upload`
      : `/rest/api4/api/datasets/${props.fileIds}/upload`;

    // 上传文件
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      signal: uploadController.value?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传失败: ${response.status} - ${errorText}`);
    }

    // 上传成功
    uploadItem.status = 'success';
    uploadedCount++;

    // 更新文件状态
    if (uploadItem.isFolderItem) {
      const folderItem = files.value.find(
        (f) => f.isFolder && f.name === uploadItem.folderPath,
      );
      if (folderItem) {
        // 检查文件夹内所有文件是否都上传成功
        const folderFiles = uploadQueue.value.filter(
          (item) => item.isFolderItem && item.folderPath === uploadItem.folderPath,
        );
        if (folderFiles.every((f) => f.status === 'success')) {
          folderItem.status = 'success';
        }
      }
    } else {
      const fileItem = files.value.find(
        (f) => !f.isFolder && f.name === uploadItem.file.name,
      );
      if (fileItem) {
        fileItem.status = 'success';
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      uploadItem.status = 'waiting';
    } else {
      uploadItem.status = 'error';
      uploadItem.error = error.message;
    }
  } finally {
    // 从活动上传列表移除
    if (activeUpload) {
      const index = activeUploads.value.findIndex((au) => au.id === activeUpload.id);
      if (index > -1) {
        activeUploads.value.splice(index, 1);
      }
    }

    // 更新进度
    progress.value = Math.round((uploadedCount / uploadQueue.value.length) * 100);
  }
};

// 重试失败的文件
const retryFailed = () => {
  uploadError.value = '';

  // 重置失败文件的状态
  uploadQueue.value.forEach((item) => {
    if (item.status === 'error') {
      item.status = 'waiting';
    }
  });

  files.value.forEach((file) => {
    if (file.status === 'error') {
      file.status = 'waiting';
    }
  });

  // 重新开始上传
  startUpload();
};

// 暂停上传
const pauseUpload = () => {
  isPaused.value = true;
};

// 继续上传
const resumeUpload = () => {
  isPaused.value = false;
};

// 取消上传
const cancelUpload = () => {
  if (uploadController.value) {
    uploadController.value.abort();
  }
  uploading.value = false;
  isPaused.value = false;
  uploadError.value = '上传已取消';

  // 重置状态
  uploadQueue.value.forEach((item) => {
    if (item.status === 'uploading') {
      item.status = 'waiting';
    }
  });

  files.value.forEach((file) => {
    if (file.status === 'uploading') {
      file.status = 'waiting';
    }
  });

  activeUploads.value = [];
};

// 关闭弹框
const closeModal = () => {
  if (uploading.value && !isPaused.value) {
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
  uploadQueue.value = [];
  uploading.value = false;
  isPaused.value = false;
  progress.value = 0;
  uploadError.value = '';
  activeUploads.value = [];
  currentUploadIndex = 0;
  uploadedCount = 0;

  if (fileInput.value) fileInput.value.value = '';
  if (folderInput.value) folderInput.value.value = '';
  uploadController.value = null;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
/* 按钮样式 */
.upload-btn {
  padding: 8px 15px;
  background: #139a96;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  backdrop-filter: blur(4px);
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #139a96;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

/* 上传类型选择器 */
.upload-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-btn {
  flex: 1;
  padding: 10px 16px;
  background: white;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.type-btn:hover {
  background: #e8f4ff;
  color: #139a96;
}

.type-btn.active {
  background: #139a96;
  color: white;
  border-color: #139a96;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 上传设置 */
.upload-settings {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  user-select: none;
}

.setting-item input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #139a96;
}

.concurrent-select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  min-width: 80px;
  transition: border-color 0.3s;
}

.concurrent-select:focus {
  outline: none;
  border-color: #139a96;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 50px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  background: white;
  position: relative;
  overflow: hidden;
}
.upload-area:hover,
.drag-over {
  border-color: #139a96;
  background-color: #f8fbff;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.1);
}

.upload-area:hover::before,
.drag-over::before {
  opacity: 1;
}

.upload-placeholder {
  color: #666;
  transition: color 0.3s;
}

.upload-placeholder svg {
  color: #139a96;
  margin-bottom: 12px;
  stroke-width: 1.5;
}

.upload-area:hover .upload-placeholder svg {
  animation: bounce 0.5s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-btn:hover {
  background: #f8f9fa;
  border-color: #139a96;
  color: #139a96;
  transform: translateY(-1px);
}

/* 文件列表样式 */
.file-list {
  margin-top: 20px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.file-list-header h4 {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.list-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.files-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.files-container::-webkit-scrollbar {
  width: 6px;
}

.files-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.files-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.files-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
  position: relative;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-item.uploading {
  background-color: #f0f7ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    background-color: #f0f7ff;
  }
  50% {
    background-color: #e1efff;
  }
  100% {
    background-color: #f0f7ff;
  }
}

.file-item.success {
  background-color: #f0f9eb;
}

.file-item.error {
  background-color: #fef0f0;
}

.file-item.is-folder {
  border-left: 3px solid #139a96;
}

.file-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  flex: 1;
}

.remove-folder-btn {
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  font-size: 20px;
  padding: 0 8px;
  opacity: 0.7;
  transition: opacity 0.3s;
  flex-shrink: 0;
}

.remove-folder-btn:hover {
  opacity: 1;
}

.file-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.folder-info {
  color: #139a96;
  font-weight: 500;
}

.file-size {
  color: #999;
}

.file-status {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.status-waiting {
  background: #f5f5f5;
  color: #909399;
}

.status-uploading {
  background: #e8f4ff;
  color: #139a96;
}

.status-success {
  background: #e1f3d8;
  color: #67c23a;
}

.status-error {
  background: #fde2e2;
  color: #f56c6c;
}

/* 上传进度样式 */
.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  flex: 1;
}

.stat-box {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  min-width: 60px;
}

.stat-box.success {
  background: #e1f3d8;
  border: 1px solid #c2e7b0;
}

.stat-box.uploading {
  background: #e8f4ff;
  border: 1px solid #b3d8ff;
}

.stat-box.error {
  background: #fde2e2;
  border: 1px solid #fab6b6;
}

.stat-box.waiting {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.progress-percent {
  font-size: 24px;
  font-weight: 700;
  color: #139a96;
  min-width: 60px;
  text-align: right;
}

.progress-bar {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #139a96, #66b1ff);
  border-radius: 5px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 活动上传列表 */
.active-uploads {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.active-uploads h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.active-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.active-upload:hover {
  border-color: #139a96;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.active-file-icon {
  font-size: 18px;
  width: 24px;
  flex-shrink: 0;
}

.active-file-info {
  flex: 1;
  min-width: 0;
}

.active-file-name {
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-file-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-progress-bar {
  flex: 1;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  min-width: 30px;
  text-align: right;
}

/* 错误信息样式 */
.error-message {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fff2f0 0%, #ffe6e6 100%);
  border-radius: 8px;
  border: 1px solid #ffccc7;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #f5222d;
  font-weight: 500;
}

.error-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.retry-btn,
.pause-btn,
.resume-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.retry-btn {
  background: #f5222d;
  color: white;
}

.retry-btn:hover {
  background: #ff4d4f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.3);
}

.pause-btn {
  background: #faad14;
  color: white;
}

.pause-btn:hover {
  background: #ffc53d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(250, 173, 20, 0.3);
}

.resume-btn {
  background: #52c41a;
  color: white;
}

.resume-btn:hover {
  background: #73d13d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.cancel-btn {
  background: #8c8c8c;
  color: white;
}

.cancel-btn:hover {
  background: #a6a6a6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(140, 140, 140, 0.3);
}

/* 模态框底部样式 */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  background: #fafafa;
}

.cancel-btn,
.clear-all-btn,
.upload-confirm-btn {
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s;
  min-width: 100px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.cancel-btn:hover:not(:disabled) {
  background: #fff;
  color: #f5222d;
  border-color: #f5222d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.1);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.clear-all-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
  margin-right: auto;
}

.clear-all-btn:hover {
  background: #fff;
  color: #f5222d;
  border-color: #f5222d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.1);
}

.upload-confirm-btn {
  background: #139a96;
  color: white;
  position: relative;
  overflow: hidden;
}

.upload-confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.8;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.upload-confirm-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.upload-confirm-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.upload-confirm-btn span {
  position: relative;
  z-index: 1;
}
</style>
