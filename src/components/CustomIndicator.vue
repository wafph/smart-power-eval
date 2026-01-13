<template>
  <div class="custom-indicators">
    <div class="panel-title">自定义指标体系</div>
    <div
      v-for="indicator in filteredIndicators"
      :key="indicator.id"
      class="custom-indicator-item"
    >
      <div class="indicator-row">
        <el-checkbox v-model="indicator.available" class="indicator-checkbox" />
        <div class="indicator-details">
          <div class="indicator-title">
            <h3>指标名称：{{ indicator.name }}</h3>
          </div>
          <div class="indicator-title">
            <h3>指标中文名称：{{ indicator.chinese_name }}</h3>
          </div>
          <div class="indicator-description">
            <span>指标类型：</span>{{ indicator.type }}
          </div>
          <div class="indicator-description">
            <span>指标描述：</span>{{ indicator.description }}
          </div>
          <div class="indicator-description">
            <span>是否有效：</span>{{ indicator.available }}
          </div>
          <div class="indicator-description">
            <span>创建时间：</span>{{ indicator.created }}
          </div>
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
  width: 100%;
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
  }
}

.indicator-type {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.custom-indicator-item {
  border: 1px solid #139a96;
  border-radius: 12px;
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
  display: flex;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.indicator-description {
  font-size: 12px;
  display: flex;
  color: #606266;
  line-height: 1.4;
}
</style>
