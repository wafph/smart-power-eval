<template>
  <div class="evaluation-container">
    <!-- 头部 -->

    <h2>评估指标选择</h2>
    <p>配置评估指标，构建指标体系，支持特定场景的评估需求</p>
    <!-- 信息区域 -->
    <InfoSection :model-info="modelInfo" @change-model="handleChangeModel" />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内置指标体系 -->
      <div class="left-panel">
        <BuiltInIndicator
          :systems="builtInSystems"
          :selected-system="selectedSystem"
          @select-system="handleSelectSystem"
          @use-system="handleUseSystem"
        />
      </div>

      <!-- 右侧自定义指标体系 -->
      <div class="right-panel">
        <CustomIndicator
          :indicators="customIndicators"
          @update:indicators="handleUpdateIndicators"
          @add-indicator="handleAddIndicator"
        />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="footer">
      <el-button class="save-btn" @click="saveDraft">√保存为草稿</el-button>
      <el-button type="primary" class="confirm-btn" @click="confirmSystem">
        √确认指标体系
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import InfoSection from '@/components/InfoSection.vue';
import BuiltInIndicator from '@/components/BuiltInIndicator.vue';
import CustomIndicator from '@/components/CustomIndicator.vue';
import { getindicators } from '@/api';
import type {
  IndicatorSystem,
  CustomIndicator as ICustomIndicator,
  ModelInfo,
} from './types/indicator';

// 模型信息
const modelInfo = reactive<ModelInfo>({
  modelName: '变压器温度预测模型v3.2.1',
  dataset: '变压器运行状态时序数据集',
  scenario: '变压器状态评估',
});

// 内置指标体系数据
const builtInSystems = ref<IndicatorSystem[]>([
  {
    name: '时序预测评估体系',
    recommended: true,
    description: '适用于变压器温度预测等时序模型',
    tags: ['推荐'],
    items: ['MAE', 'MSE', 'RMSE', 'MAPE'],
    applicable: '时序模型',
    mainIndicators: '3项指标',
    weight: '60%',
  },
  {
    name: '分类任务评估体系',
    recommended: false,
    description: '适用于故障分类、缺陷识别等分类模型',
    tags: [],
    items: ['准确率', '精确率', '召回率', 'F1值'],
    applicable: '分类模型',
    mainIndicators: '3项指标',
    weight: '60%',
  },
  {
    name: '目标检测评估体系',
    recommended: false,
    description: '',
    tags: [],
    items: [],
    applicable: '',
    mainIndicators: '',
    weight: '',
  },
]);

// 自定义指标数据
const customIndicators = ref<ICustomIndicator[]>([
  {
    id: 1,
    name: '均方误差(MSE)',
    description: '衡量预测值与真实值之间的平均平方差',
    weight: 30,
    checked: true,
  },
  {
    id: 2,
    name: '平均绝对误差(MAE)',
    description: '衡量预测值与真实值之间的平均绝对差',
    weight: 20,
    checked: true,
  },
  {
    id: 3,
    name: '均方根误差(RMSE)',
    description: '衡量预测值与真实值之间的平方根误差',
    weight: 10,
    checked: true,
  },
]);

// 当前选中的指标体系
const selectedSystem = ref('时序预测评估体系');

// 处理方法
const handleChangeModel = async () => {
  try {
    await ElMessageBox.confirm('确定要更换模型/数据集吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    ElMessage.info('更换模型功能待实现');
  } catch {
    // 用户取消操作
  }
};

const handleSelectSystem = (name: string) => {
  selectedSystem.value = name;
};

const handleUseSystem = (system: IndicatorSystem) => {
  selectedSystem.value = system.name;
  ElMessage.success(`已选用${system.name}`);
};

const handleUpdateIndicators = (indicators: ICustomIndicator[]) => {
  customIndicators.value = indicators;
};

const handleAddIndicator = () => {
  const newIndicator: ICustomIndicator = {
    id: Date.now(),
    name: '新指标',
    description: '指标描述',
    weight: 0,
    checked: true,
  };
  customIndicators.value.push(newIndicator);
  ElMessage.info('新增指标功能已触发');
};
onMounted(() => {
  getindicators().then((res) => {});
});

const saveDraft = () => {
  ElMessage.success('已保存为草稿');
};

const confirmSystem = () => {
  ElMessage.success('指标体系确认成功');
};
</script>

<style>
.evaluation-container {
  margin: 0 auto;
  background-color: #f3f4f6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.main-content {
  display: flex;
  min-height: 600px;
}

.left-panel {
  width: 30%;
  background: #fff;
  /* border-right: 1px solid #e4e7ed; */
  margin-right: 30px;
  border-radius: 15px;
}

.right-panel {
  width: 68%;
  background: #fff;
  border-radius: 15px;
}

.footer {
  padding: 20px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-btn {
  color: #409eff;
  border-color: #409eff;
}

.save-btn:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.confirm-btn {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
