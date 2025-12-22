<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button type="primary" size="small">
      更多
      <el-icon class="el-icon--right">
        <ArrowDown />
      </el-icon>
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="action in states.isTestTask ? states.actions : actions"
          :key="action.command"
          :command="action.command"
          :divided="action.divided"
          :icon="action.icon"
        >
          {{ action.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { defineEmits } from 'vue';
import { useState } from '@/utils/state';
const { states } = useState();
import { ArrowDown, DocumentChecked, VideoPlay, Download } from '@element-plus/icons-vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  isTestTask: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'check',
  'download',
  'run',
  'stop',
  'edit',
  'delete',
  'result',
  'report',
  'export',
  'logs',
]);

// 操作列表
const actions = [
  { command: 'check', label: '校验', icon: DocumentChecked },
  { command: 'download', label: '下载', icon: Download },
];

// 处理操作
const handleCommand = (command) => {
  switch (command) {
    case 'check':
      emit('check', props.task);
      break;
    case 'run':
      emit('run', props.task);
      break;
    case 'download':
      emit('download', props.task);
      break;
    case 'stop':
      emit('stop', props.task);
      break;
    case 'delete':
      emit('delete', props.task);
      break;
    case 'result':
      emit('result', props.task);
      break;
    case 'report':
      emit('report', props.task);
      break;
    case 'export':
      emit('export', props.task);
      break;
    case 'logs':
      emit('logs', props.task);
      break;
  }
};
</script>

<style scoped>
.el-dropdown {
  margin-left: 8px;
}
</style>
