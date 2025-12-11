<template>
  <div class="dataset-container">
    <!-- 搜索区域 -->
    <h3 class="dataset-title" v-if="currentStep === 1">请选择数据集</h3>
    <h3 class="dataset-title" v-else-if="currentStep === 2">请选择模型</h3>
    <h3 class="dataset-title" v-else>请选择评估</h3>
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="请选择数据集"
        clearable
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 主内容区域 -->
    <div class="main-contents">
      <!-- 左侧分类菜单 -->
      <div class="category-menu">
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
        <div v-if="filteredDatasets.length === 0" class="no-data">暂无数据</div>

        <div v-else class="datasets-container">
          <el-checkbox-group v-model="selectedDatasets" class="dataset-checkbox-group">
            <div
              v-for="dataset in filteredDatasets"
              :key="dataset.id"
              class="dataset-checkbox-item"
            >
              <el-checkbox
                :label="dataset.id"
                class="dataset-checkbox"
                @change="handleDatasetSelect(dataset.id)"
              >
                <span class="dataset-name">{{ dataset.name }}</span>
                <span class="dataset-code">{{ dataset.code }}</span>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, computed, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue';
const props = defineProps(['currentStep']);
// 分类数据
const categories = ref([
  { id: 'qa', name: '问答类' },
  { id: 'choice', name: '选择类' },
]);

// 当前激活的分类
const activeCategory = ref('qa');

// 搜索关键词
const searchKeyword = ref('');

// 选中的数据集ID列表
const selectedDatasets = ref(['1da2d0']); // 默认选中 CommonsenseQA

// 所有数据集数据
const allDatasets = reactive({
  qa: [
    { id: '1d56df', name: 'BoolQ', code: '(1d56df)' },
    {
      id: '1da2d0',
      name: 'CommonsenseQA',
      code: '(1da2d0)',
    },
    { id: '1dg3g1', name: 'PIQA', code: '(1dg3g1)' },
    { id: '1dh4h2', name: 'SocialQA', code: '(1dh4h2)' },
    { id: '1di5i3', name: 'Winogrande', code: '(1di5i3)' },
    { id: '1dj6j4', name: 'HellaSwag', code: '(1dj6j4)' },
  ],
  choice: [
    {
      id: '2a12bc',
      name: 'MultiChoiceQA',
      code: '(2a12bc)',
    },
    { id: '2b23cd', name: 'ARC-Easy', code: '(2b23cd)' },
    {
      id: '2c34de',
      name: 'ARC-Challenge',
      code: '(2c34de)',
    },
    {
      id: '2d45ef',
      name: 'OpenBookQA',
      code: '(2d45ef)',
    },
    { id: '2e56f0', name: 'RACE', code: '(2e56f0)' },
    { id: '2f67g1', name: 'MCTest', code: '(2f67g1)' },
  ],
});

const allModelsets = reactive({
  h1: [
    { id: '1', name: 'model1', code: '1' },
    {
      id: '2',
      name: 'model2',
      code: '(1da2d0)',
    },
    { id: '3', name: 'model3', code: '3' },
    { id: '1dh4h2', name: 'model4', code: '(1dh4h2)' },
    { id: '1di5i3', name: 'model5', code: '(1di5i3)' },
    { id: '1dj6j4', name: 'model6', code: '(1dj6j4)' },
  ],
  h2: [
    {
      id: '2a12bc',
      name: 'hello1',
      code: '(2a12bc)',
    },
    { id: '2b23cd', name: 'hello2', code: '(2b23cd)' },
    {
      id: '2c34de',
      name: 'hello3',
      code: '(2c34de)',
    },
    {
      id: '2d45ef',
      name: 'hello4',
      code: '(2d45ef)',
    },
    { id: '2e56f0', name: 'hello5', code: '(2e56f0)' },
    { id: '2f67g1', name: 'hello6', code: '(2f67g1)' },
  ],
});
// 切换分类
const switchCategory = (categoryId) => {
  activeCategory.value = categoryId;
  // 切换分类时可以清空搜索关键词
  searchKeyword.value = '';
};

// 处理数据集选择
const handleDatasetSelect = (datasetId) => {
  console.log('选中的数据集ID:', datasetId);
  // 这里可以添加其他逻辑，如更新到store等
};

// 处理搜索
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value);
};

// 计算当前分类的数据集
const currentDatasets = computed(() => {
  //   const { currentStep } = toRefs(props);
  //   console.log(currentStep);
  console.log(props.currentStep);
  if (props.currentStep === 1) {
    return allDatasets[activeCategory.value] || [];
  } else if (props.currentStep === 2) {
    activeCategory.value = 'h2';
    categories.value = [
      { id: 'h1', name: '填空类' },
      { id: 'h2', name: '应用类' },
    ];
    return allModelsets[activeCategory.value] || [];
  }
});

// 计算过滤后的数据集
const filteredDatasets = computed(() => {
  if (!searchKeyword.value.trim()) {
    return currentDatasets.value;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return currentDatasets.value.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(keyword) ||
      dataset.code.toLowerCase().includes(keyword),
  );
});

// // 获取选中数据集的详细信息
// const selectedDatasetDetails = computed(() => {
//   return currentDatasets.value.filter((dataset) =>
//     selectedDatasets.value.includes(dataset.id),
//   );
// });
</script>

<style lang="less" scoped>
.dataset-container {
  width: 100%;
}

.search-section {
  margin-bottom: 30px;

  .search-input {
    width: 300px;
  }
}

.main-contents {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 500px;
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
