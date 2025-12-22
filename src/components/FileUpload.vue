<template>
  <div class="simple-upload">
    <el-upload
      ref="uploadRef"
      class="upload-demo"
      :action="uploadUrl"
      :auto-upload="false"
      :multiple="true"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :http-request="customUpload"
    >
      <template #trigger>
        <el-button type="primary">选择文件</el-button>
      </template>
      <el-button
        type="success"
        plain
        @click="submitUpload"
        :loading="uploading"
        :disabled="fileList.length === 0"
        style="margin-left: 10px; margin-top: -2px"
      >
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
const props = defineProps(['getFileIds']);
const { getFileIds } = toRefs(props);
// 响应式数据
const uploadRef = ref(null);
const fileList = ref([]);
const uploading = ref(false);
const emits = defineEmits(['uploading']);
// 上传接口地址
const uploadUrl = ref(`rest/api4/api/datasets/${getFileIds.value}/upload`); // 替换为您的实际上传接口

// 文件选择变化处理
const handleChange = (file, files) => {
  fileList.value = files;
};

// 文件移除处理
const handleRemove = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

// 自定义上传实现
const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options;
  try {
    // 实际项目中的上传代码
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'file');
    formData.append('overwrite', true);

    // 模拟上传进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
      }
      onProgress({ percent: progress });
    }, 200);

    const response = await fetch(uploadUrl.value, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      onSuccess(result);
      setTimeout(() => {
        ElMessage.success(`${file.name} 上传成功`);
        uploading.value = false;
        emits('uploading', uploading.value);
      }, 1000);
    } else {
      throw new Error(`上传失败: ${response.statusText}`);
    }
  } catch (error) {
    onError(error);
    ElMessage.error(`${file.name} 上传失败`);
  }
};

// 提交上传
const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  uploading.value = true;
  uploadRef.value.submit();

  // 监听上传完成
  const checkUploadComplete = setInterval(() => {
    const allDone = fileList.value.every(
      (file) => file.status === 'success' || file.status === 'fail',
    );

    if (allDone) {
      uploading.value = false;
      clearInterval(checkUploadComplete);
    }
  }, 500);
};
</script>

<style scoped>
.simple-upload {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #409eff;
  margin-bottom: 20px;
  text-align: center;
}

.file-list {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.file-list h3 {
  margin-bottom: 10px;
  color: #606266;
}

:deep(.el-upload__tip) {
  margin-top: 10px;
  color: #909399;
  font-size: 0.9em;
}
</style>
