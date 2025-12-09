<template>
  <div class="info-section">
    <div class="info-item">
      <div class="info-label">当前模型</div>
      <div class="info-content">{{ modelInfo.modelName }}</div>
    </div>
    <div class="info-item">
      <div class="info-label">关联数据集</div>
      <div class="info-content">{{ modelInfo.dataset }}</div>
    </div>
    <div class="info-item">
      <div class="info-label">应用场景</div>
      <div class="info-content">{{ modelInfo.scenario }}</div>
    </div>
    <div class="info-end">
      <div class="change-link" @click="handleChangeModel">更换模型/数据集</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '../types/indicator';

interface Props {
  modelInfo: ModelInfo;
}

interface Emits {
  (e: 'change-model'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleChangeModel = () => {
  emit('change-model');
};
</script>

<style scoped>
.info-section {
  display: flex;
  margin: 20px 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 15px;
}

.info-item {
  width: 200px;
  /* margin-right: 40px; */
}
.info-end {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}

.info-item:last-child {
  margin-right: 0;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.info-content {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.change-link {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}

.change-link:hover {
  text-decoration: underline;
}
</style>
