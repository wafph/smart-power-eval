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
    const a = [
      {
        available: true,
        chinese_name: '召回率',
        created: '2025-11-25',
        description: '表示模型分类结果与真实标签的吻合程度',
        id: 'Recal',
        name: 'Recal',
        parameters: {},
        type: '分类任务评估体系',
      },
      {
        available: true,
        chinese_name: 'F1-Score',
        created: '2025-11-25',
        description: '表示模型分类结果与真实标签的吻合程度',
        id: 'f1-Score',
        name: 'F1-Score',
        parameters: {},
        type: '分类任务评估体系',
      },
      {
        available: true,
        chinese_name: '首词元返回平均时延',
        created: '2025-11-25',
        description: '衡量由发起请求到模型返回首个词元的时延平均值',
        id: 'reAverage_TFTcal',
        name: 'ReAverage TTFTcal',
        parameters: {},
        type: '语义大模型',
      },
    ];
    customIndicators.value = res.data.metrics.concat(a);

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
