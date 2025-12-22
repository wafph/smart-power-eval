<template>
  <div class="evaluation-container">
    <h2>评估指标选择</h2>
    <p>配置评估指标，构建指标体系，支持特定场景的评估需求</p>
    <div class="metrics-content">
      <CustomIndicator :indicators="customIndicators" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getindicators } from '@/api';
// 自定义指标数据
const customIndicators = ref([]);

onMounted(() => {
  getindicators().then((res: any) => {
    customIndicators.value = res.data.metrics;
  });
});
</script>

<style>
.evaluation-container {
  margin: 0 auto;
  background-color: #f3f4f6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;

  p {
    margin: 20px 0;
  }
}

.title-header {
  padding: 20px 24px;
}

.title-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.title-header p {
  font-size: 14px;
  color: #606266;
}

.metrics-content {
  width: 100%;
  display: flex;
  min-height: 600px;
  background: #fff;
  border-radius: 15px;
}
</style>
