<template>
  <div class="custom-indicators">
    <div class="panel-title">自定义指标体系</div>
    <div class="custom-header">
      <div class="editing-tag">正在编辑</div>
      <div class="indicator-type">所有指标类型</div>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索指标..."
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleAddIndicator">
        <el-icon><Plus /></el-icon>
        新增指标
      </el-button>
    </div>

    <h3>指标体系结构</h3>
    <div class="indicator-desc">当前体系包含6项指标，拖动可调整顺序</div>
    <div
      v-for="indicator in filteredIndicators"
      :key="indicator.id"
      class="custom-indicator-item"
    >
      <div class="indicator-row">
        <el-checkbox v-model="indicator.checked" class="indicator-checkbox" />
        <div class="indicator-details">
          <div class="indicator-title">{{ indicator.name }}</div>
          <div class="indicator-description">{{ indicator.description }}</div>
        </div>
        <div class="weight-input">
          <el-input-number
            v-model="indicator.weight"
            :min="0"
            :max="100"
            controls-position="right"
            class="weight-number"
          />
          <span class="weight-label">权重</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import type { CustomIndicator } from '../types/indicator';

interface Props {
  indicators: CustomIndicator[];
}

interface Emits {
  (e: 'update:indicators', indicators: CustomIndicator[]): void;
  (e: 'add-indicator'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchKeyword = ref('');

const filteredIndicators = computed(() => {
  if (!searchKeyword.value) return props.indicators;
  return props.indicators.filter(
    (indicator) =>
      indicator.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      indicator.description.toLowerCase().includes(searchKeyword.value.toLowerCase()),
  );
});

const handleAddIndicator = () => {
  emit('add-indicator');
  ElMessage.info('新增指标功能待实现');
};
</script>

<style scoped lang="less">
.custom-indicators {
  padding: 20px;

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #303133;
  }

  .custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .search-input {
      width: 200px;
    }

    // .editing-tag {
    //   display: inline-block;
    //   background-color: #f0f9ff;
    //   color: #409eff;
    //   font-size: 12px;
    //   padding: 4px 12px;
    //   border-radius: 3px;
    //   margin-bottom: 16px;
    // }
  }

  .indicator-desc {
    color: grey;
    font-size: 12px;
    padding: 4px 0px;
    border-radius: 3px;
    margin-bottom: 16px;
  }
}

.indicator-type {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.custom-indicator-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.indicator-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.indicator-checkbox {
  margin-top: 4px;
}

.indicator-details {
  flex: 1;
}

.indicator-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.indicator-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.weight-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weight-number {
  width: 100px;
}

.weight-label {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}
</style>
