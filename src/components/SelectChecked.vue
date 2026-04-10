<template>
  <div class="dataset-container">
    <!-- 搜索区域 -->
    <h3 class="dataset-title" v-if="currentStep === 1">请选择数据集</h3>
    <h3 class="dataset-title" v-else-if="currentStep === 2">请选择模型</h3>
    <h3 class="dataset-title" v-else-if="currentStep === 3">请选择评估指标</h3>
    <h3 class="dataset-title" v-else>请选择裁判模型</h3>
    <!-- 主内容区域 -->
    <div class="main-contents">
      <!-- 左侧分类菜单 -->
      <div
        class="category-menu"
        v-if="currentStep === 1 && selectedTaskType !== 'benchmark'"
      >
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: activeCategory === category.id }"
          @click="switchCategory(category.id)"
        >
          {{ category.name }}
          <div v-if="activeCategory === category.id" class="active-indicator"></div>
        </div>
      </div>
      <!-- 右侧数据集列表 -->
      <div class="dataset-list">
        <!-- {{ selectedTaskType }} -->
        <div
          v-if="
            filteredDatasets.length === 0 &&
            currentStep === 1 &&
            selectedTaskType !== 'benchmark'
          "
          class="no-data"
        >
          暂无数据
        </div>
        <div class="datasets-container">
          <el-checkbox-group v-model="selectedDatasets" class="dataset-checkbox-group">
            <template v-if="currentStep == 1 && selectedTaskType !== 'benchmark'">
              <div
                v-for="dataset in filteredDatasets"
                :key="dataset.id"
                class="dataset-checkbox-item"
              >
                {{ dataset }}
                <el-checkbox
                  :label="dataset.id"
                  class="dataset-checkbox"
                  @change="handleDatasetSelect(dataset.id)"
                >
                  <span class="dataset-name">{{ dataset.name }}</span>
                </el-checkbox>
              </div>
            </template>
            <template v-if="currentStep == 1 && selectedTaskType === 'benchmark'">
              {{ tableData }}
              <div
                v-for="dataset in tableData"
                :key="dataset.name"
                class="dataset-checkbox-item"
              >
                {{ dataset }}
                <el-checkbox
                  :label="dataset.name"
                  class="dataset-checkbox"
                  @change="handleDatasetSelect(dataset.name)"
                >
                  <span class="dataset-name">{{ dataset.name }}</span>
                </el-checkbox>
              </div>
            </template>
            <div v-else-if="currentStep == 2">
              <template
                v-for="dataset in filtereModal"
                :key="dataset.id"
                class="dataset-checkbox-item"
              >
                {{ dataset }}
                <el-checkbox
                  :label="dataset.id"
                  class="dataset-checkbox"
                  @change="handleDatasetSelect(dataset.id)"
                >
                  <span class="dataset-name">{{ dataset.name }}</span>
                </el-checkbox>
              </template>
            </div>
            <div v-else-if="currentStep == 3">
              <template
                v-for="dataset in filterCustomIndicators"
                :key="dataset.id"
                class="dataset-checkbox-item"
              >
                {{ dataset }}
                <el-checkbox
                  :label="dataset.id"
                  class="dataset-checkbox"
                  @change="handleDatasetSelect(dataset.id)"
                >
                  <span class="dataset-name">{{ dataset.name }}</span>
                </el-checkbox>
              </template>
            </div>
            <template v-if="currentStep == 4">
              <div>
                是否使用裁判模型
                <el-radio-group v-model="radio1" @change="handleChange">
                  <el-radio value="1" size="large" border>是</el-radio>
                  <el-radio value="2" size="large" border>否</el-radio>
                </el-radio-group>
              </div>
              <div v-if="radio1 === '1'">
                <div
                  v-for="dataset in judgeModelName"
                  :key="dataset.id"
                  class="dataset-checkbox-item"
                >
                  {{ dataset }}
                  <el-checkbox
                    :label="dataset.id"
                    class="dataset-checkbox"
                    @change="handleDatasetSelect(dataset.id)"
                  >
                    <span class="dataset-name">{{ dataset.name }}</span>
                  </el-checkbox>
                </div>
              </div>
            </template>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, onMounted, computed, reactive } from 'vue';
import {
  getDatasets,
  getModelList,
  getModelType,
  getindicators,
  getJudgeModels,
  getTages
} from '@/api';
const props = defineProps(['currentStep', 'selectedTaskType']);
const emit = defineEmits(['emitIds', 'radioValue']);
const { currentStep, selectedTaskType } = toRefs(props);
// 分类数据
const categories = ref([]);
const radio1 = ref('1');
const tableData = ref([]);
const judgeModelName = ref([]);
const customIndicators = ref([]);
const modalTableData = ref([]);
const filterCustomIndicators = ref([]);
const filtereModal = ref([]);
// 当前激活的分类
const filteredDatasets = ref([]);
const selectOptions = ref([]);
const activeCategory = ref('mcq');
const indicator = ref('mcq');
// 搜索关键词
const datasetParent = ref({});
// 选中的数据集ID列表
const selectedDatasets = ref([]); // 默认选中 CommonsenseQA
const paramsObj = reactive({
  page: 1,
  per_page: 100,
  type: 'all',
  status: 'all',
  username: localStorage.getItem('vuems_name'),
});
// 切换分类
const switchCategory = (categoryId) => {
  activeCategory.value = categoryId;
  localStorage.setItem('item', activeCategory.value);
  // 切换分类时可以清空搜索关键词
  const as = tableData.value.filter((item) => {
    return (
      item.type.includes(selectedTaskType.value) &&
      item.extension_fields?.tag === categoryId
    );
  });
  filteredDatasets.value = as.map((item) => {
    return { id: item.id, name: item.name };
  });
  getCustomIndicatorsList();
};

function handleChange(label) {
  radio1.value = String(label);
  emit('radioValue', radio1.value);
}
// 处理多选框数据集选择
const handleDatasetSelect = (datasetId) => {
  emit('emitIds', [...selectedDatasets.value]);
};
function getJudgeModelsList() {
  getJudgeModels().then((res) => {
    judgeModelName.value = res.data.judge_models.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  });
}

// 获取指标列表
function getCustomIndicatorsList() {
  getindicators().then((res) => {
    customIndicators.value = res.data.metrics;
    filterCustomIndicators.value = customIndicators?.value.map((item) => ({
      id: item.id,
      name: item.name + '-' + item.chinese_name,
    }));
    indicator.value = localStorage.getItem('item');
    // if (indicator.value === 'mcq') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy-准确率' },
    //     { id: 'f1-score', name: 'F1-Score' },
    //   ];
    // } else if (indicator.value === 'qa') {
    //   filterCustomIndicators.value = [
    //     { id: 'rouge', name: 'ROUGE' },
    //     { id: 'bleu', name: 'BLEU' },
    //   ];
    // } else if (indicator.value === 'object_recognition') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy准确率' },
    //     { id: 'precision', name: 'Precision精确率' },
    //     { id: 'recall', name: 'Recall召回率' },
    //     { id: 'f1-score', name: 'F1-Score' },
    //   ];
    // } else if (indicator.value === 'scene_understanding') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy准确率' },
    //     { id: 'clip_score', name: 'CLIPScore' },
    //   ];
    // } else if (indicator.value === 'behavior_inference') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy准确率' },
    //     { id: 'clip_score', name: 'CLIPScore' },
    //   ];
    // } else if (indicator.value === 'counting') {
    //   filterCustomIndicators.value = [{ id: 'accuracy', name: 'Accuracy准确率' }];
    // } else if (indicator.value === 'image_classification') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy准确率' },
    //     { id: 'precision', name: 'Precision精确率' },
    //     { id: 'recall', name: 'Recall召回率' },
    //     { id: 'f1-score', name: 'F1-Score' },
    //   ];
    // } else if (indicator.value === 'object_detection') {
    //   filterCustomIndicators.value = [
    //     { id: 'accuracy', name: 'Accuracy准确率' },
    //     { id: 'precision', name: 'Precision精确率' },
    //     { id: 'recall', name: 'Recall召回率' },
    //     { id: 'discoveryRate', name: 'Discovery_Rate发现率' },
    //     { id: 'error_rate', name: 'Error_rate误检比' },
    //   ];
    // } else if (indicator.value === 'image_segmentation') {
    //   filterCustomIndicators.value = [
    //     { id: 'precision', name: 'Precision精确率' },
    //     { id: 'recall', name: 'Recall召回率' },
    //     { id: 'f1-score', name: 'F1-Score' },
    //   ];
    // } else if (indicator.value === 'base_safety') {
    //   filterCustomIndicators.value = [
    //     { id: 'class-sore', name: '5大类31小类安全风险综合得分' },
    //   ];
    // } else if (indicator.value === 'confronting_safety') {
    //   filterCustomIndicators.value = [
    //     { id: 'confronting ', name: '对抗攻击综合得分对抗攻击综合得分' },
    //   ];
    // } else {
    //   filterCustomIndicators.value = [];
    // }
  });
}

// 模型列表
async function getModelLists() {
  const res = await getModelList(paramsObj);
  if (res && res.data) {
    modalTableData.value = res.data.models;
  }
  const ms = modalTableData.value.filter((item) => {
    return item.type.includes(selectedTaskType.value);
  });
  filtereModal.value = ms.map((item) => {
    return { id: item.id, name: item.name };
  });
}

function getDatasetTages() {
  getTages().then((res) => {
    datasetParent.value = res.data;
    categories.value = datasetParent.value?.map((item) => ({
      id: item,
      name: item,
    }));
  });
}

function getModelTypes() {
  getModelType().then((res) => {
    const keys = Object.keys(res.data);
    selectOptions.value = keys.map((item) => ({
      value:
        item === 'text'
          ? '文本'
          : item === 'multimodal'
            ? '多模态'
            : item === 'vision'
              ? '视觉'
              : item === 'temporal'
                ? '时序'
                : '安全',
      label:
        item === 'text'
          ? '文本'
          : item === 'multimodal'
            ? '多模态'
            : item === 'vision'
              ? '视觉'
              : item === 'temporal'
                ? '时序'
                : '安全',
    }));
  });
}

onMounted(() => {
  if (selectedTaskType.value === '语义') {
    activeCategory.value = '通用';
  } else if (selectedTaskType.value === '多模态') {
    activeCategory.value = '通用';
  } else if (selectedTaskType.value === '视觉') {
    activeCategory.value = '通用';
  } else if (selectedTaskType.value === '时序') {
    activeCategory.value = '通用';
  } else if (selectedTaskType.value === '科学计算') {
    activeCategory.value = '通用';
  } else {
    activeCategory.value = 'benchmark';
  }
  if (currentStep.value === 1) {
    localStorage.setItem('item', activeCategory.value);
  }
  // if (selectedTaskType.value !== 'benchmark') {
  //   getDatasetsList();
  // } else {
  //   tableData.value = [
  //     {
  //       id: 'gsm8k',
  //       name: 'gsm8k',
  //       type: 'benchmark',
  //     },
  //     {
  //       id: 'mmlu',
  //       name: 'mmlu',
  //       type: 'benchmark',
  //     },
  //     {
  //       id: 'ceval',
  //       name: 'ceval',
  //       type: 'benchmark',
  //     },
  //   ];
  //   if (tableData.value.length > 0) {
  //     tableData.value = tableData.value.map((item) => {
  //       return { id: item.id, name: item.name };
  //     });
  //   }
  //   console.log(tableData);
  // }
  getDatasetTages();
  getModelLists();
  getModelTypes();
  getCustomIndicatorsList();
  getJudgeModelsList();
});
</script>

<style lang="less" scoped>
.dataset-container {
  width: 100%;
}

.search-section {
  margin-bottom: 30px;

  .search-input {
    width: 200px;
  }
}

.main-contents {
  display: flex;
  gap: 20px;
}

// 左侧分类菜单
.category-menu {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.category-item {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: #606266;
  transition: all 0.3s;
  user-select: none;

  &:hover {
    background-color: #f5f7fa;
    color: #139a96;
  }

  &.active {
    background-color: #f0f9f0;
    color: #139a96;
    font-weight: 600;
  }
}

.active-indicator {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: #139a96;
  border-radius: 2px;
}

// 右侧数据集列表
.dataset-list {
  flex: 1;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.dataset-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 16px;
}

.datasets-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataset-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataset-checkbox-item {
  &:hover {
    .dataset-checkbox {
      :deep(.el-checkbox__label) {
        color: #139a96;
      }
    }
  }
}

.dataset-checkbox {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.3s;
  margin-left: 0;

  &:hover {
    border-color: #139a96;
    background-color: #f9f9f9;
  }

  :deep(.el-checkbox__label) {
    font-size: 16px;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;
    border-radius: 4px;

    &::after {
      width: 6px;
      height: 9px;
      left: 8px;
    }
  }

  &.is-checked {
    border-color: #139a96;
    background-color: rgba(19, 154, 150, 0.05);

    :deep(.el-checkbox__inner) {
      background-color: #139a96;
      border-color: #139a96;
    }

    .dataset-name {
      color: #139a96;
      font-weight: 600;
    }
  }
}

.dataset-name {
  font-weight: 500;
}

.dataset-code {
  font-size: 14px;
  color: #909399;
  font-family: 'Courier New', monospace;
}
</style>
