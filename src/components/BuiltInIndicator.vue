<template>
  <div class="built-in-indicators">
    <div class="panel-title">内置指标体系</div>
    <div class="panel-subtitle">选择适合场景的预设指标体系</div>
    
    <div 
      v-for="system in systems" 
      :key="system.name"
      class="indicator-card"
      :class="{ selected: selectedSystem === system.name }"
      @click="handleSelectSystem(system.name)"
    >
      <div class="indicator-header">
        <div class="indicator-name">{{ system.name }}</div>
        <div class="use-btn" @click.stop="handleUseSystem(system)">选用</div>
      </div>
      <div class="indicator-desc">{{ system.description }}</div>
      <div class="indicator-tags">
        <span v-if="system.recommended" class="tag">推荐</span>
      </div>
      <div class="indicator-items">
        <span v-for="item in system.items" :key="item" class="item">{{ item }}</span>
      </div>
      <div v-if="system.applicable" class="indicator-desc">
        适用场景: {{ system.applicable }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IndicatorSystem } from '../types/indicator';

interface Props {
  systems: IndicatorSystem[];
  selectedSystem: string;
}

interface Emits {
  (e: 'select-system', name: string): void;
  (e: 'use-system', system: IndicatorSystem): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSelectSystem = (name: string) => {
  emit('select-system', name);
};

const handleUseSystem = (system: IndicatorSystem) => {
  emit('use-system', system);
};
</script>

<style scoped>
.built-in-indicators {
  padding: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.panel-subtitle {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.indicator-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
}

.indicator-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.indicator-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.use-btn {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 3px;
}

.use-btn:hover {
  background-color: #ecf5ff;
}

.indicator-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.indicator-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
/* 
.tag {
  background-color: #f0f9ff;
  color: #409eff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  margin-right: 8px;
  margin-bottom: 4px;
} */

.indicator-items {
  display: flex;
  flex-wrap: wrap;
}

.item {
  background-color: #f5f7fa;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 3px;
  margin-right: 8px;
  margin-bottom: 4px;
}
</style>