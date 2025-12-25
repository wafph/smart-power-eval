<template>
  <div class="task-type-select-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="text" :icon="ArrowLeft" @click="handleBack()" class="back-btn">
        返回
      </el-button>
    </div>
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 步骤进度条 -->
      <div class="steps-section">
        <el-steps :active="currentStep" align-center class="custom-steps">
          <el-step
            v-for="(step, index) in steps"
            :key="index"
            :title="step.title"
            class="custom-step"
          />
        </el-steps>
      </div>

      <!-- 任务类型选择区域 -->
      <div class="task-type-section">
        <div v-if="currentStep === 0">
          <div class="search-section">
            <!-- 任务名称：
            <el-input
              v-model="taskName"
              :placeholder="placeholders"
              clearable
              class="search-input"
              @blur="handleBlur"
            >
            </el-input> -->
            <el-form
              ref="ruleFormRef"
              
              :model="ruleForm"
              status-icon
              :rules="rules"
              label-width="auto"
            >
              <el-form-item label="任务名称："prop="taskName">
                <el-input class="search-input" v-model="ruleForm.taskName" type="text" autocomplete="off" />
              </el-form-item>
            </el-form>
          </div>
          <h2 class="section-title">选择评估任务类型</h2>
          <!-- 任务类型选项 -->
          <el-radio-group
            v-model="selectedTaskType"
            class="task-type-options"
            @change="handleGroupChange"
          >
            <div v-for="type in taskTypes" :key="type.value">
              <el-radio :value="type.value" class="custom-radio">
                <div class="task-type-content">
                  <div class="task-type-icon">
                    <component :is="type.icon" :class="type.iconClass" />
                  </div>
                  <div class="task-type-info">
                    <h3 class="task-type-name">{{ type.label }}</h3>
                  </div>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>
        <div v-if="currentStep == 1">
          <SelectChecked
            :currentStep="currentStep"
            :selectedTaskType="selectedTaskType"
            @emitIds="getOneSelectId"
          />
        </div>
        <div v-if="currentStep == 2">
          <SelectChecked
            :currentStep="currentStep"
            :selectedTaskType="selectedTaskType"
            @emitIds="getModelSelectId"
          />
        </div>
        <div v-if="currentStep == 3">
          <SelectChecked
            :currentStep="currentStep"
            :selectedTaskType="selectedTaskType"
            @emitIds="getMetricsSelectId"
          />
        </div>
        <div v-if="currentStep == 4">
          <SelectChecked
            :currentStep="currentStep"
            :selectedTaskType="selectedTaskType"
            @emitIds="getjudgeModelSelectId"
            @radioValue="getRadioValue"
          />
        </div>
      </div>
      <!-- 底部操作按钮 -->
      <div class="action-buttons">
        <el-button
          :disabled="!selectedTaskType"
          plain
          type="primary"
          @click="handlPrevius"
        >
          上一步
        </el-button>
        <template v-if="currentStep !== 4">
          <el-button
            :disabled="
              currentStep === 0
                ? !selectedTaskType || ruleForm.taskName === ''
                : currentStep === 1
                ? dataSetIds.length === 0
                : currentStep === 2
                ? modelIds.length === 0
                : metricsIds.length === 0
            "
            type="primary"
            @click="handleNext"
          >
            下一步
          </el-button>
        </template>
        <template v-if="currentStep == 4">
          <el-button
            type="primary"
            :disabled="radioValue == '1' && judgeModelsId.length === 0"
            @click="handlCreate"
          >
            开始创建
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, shallowRef, onMounted } from 'vue';
import { ArrowLeft, Document, Camera, View, Clock, Box } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { createTaskslist } from '@/api';
const dataSetIds = ref([]);
const modelIds = ref([]);
const metricsIds = ref([]);
const judgeModelsId = ref([]);
const radioValue = ref('1');
const ruleForm = reactive({
  taskName: '',
});
const rules = reactive<FormRules>({
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
});
const router = useRouter();
// 步骤数据
const steps = ref([
  { id: 1, title: '任务类型选择' },
  { id: 2, title: '数据集选择' },
  { id: 3, title: '模型配置' },
  { id: 4, title: '评估指标选择' },
  { id: 5, title: '裁判模型确认' },
]);

// 任务类型数据
const taskTypes = shallowRef([
  {
    value: '文本',
    label: '文本评估',
    icon: Document,
    type: 'NLP',
    tagType: 'primary',
  },
  {
    value: '多模态',
    label: '多模态评估',
    icon: Box,
    type: '多模态',
    tagType: 'success',
  },
  {
    value: '视觉',
    label: '视觉评估',
    icon: View,
    type: 'CV',
    tagType: 'warning',
  },
  {
    value: '安全',
    label: '安全评估',
    icon: Camera,
    type: '安全',
    tagType: 'danger',
  },
  {
    value: '时序',
    label: '时序评估',
    icon: Clock,
    type: '时序',
    tagType: 'info',
  },
]);

// 响应式数据
const currentStep = ref(0);
const selectedTaskType = ref('文本');

// 计算属性
const selectedTask = computed(() => {
  return (
    taskTypes.value.find((type) => type.value === selectedTaskType.value) ||
    taskTypes.value[0]
  );
});

// 方法
function handleBack() {
  router.back();
}

function getOneSelectId(id) {
  dataSetIds.value = id;
  localStorage.setItem('dataset_id', dataSetIds.value);
}

// function getTaskName(taskName) {
//   taskNames.value = taskName;
//   localStorage.setItem('name', taskNames.value);
// }

function getModelSelectId(id) {
  modelIds.value = id;
  localStorage.setItem('model_id', modelIds.value);
}

function getRadioValue(value) {
  console.log(value);
  radioValue.value = value;
}

function getMetricsSelectId(id) {
  metricsIds.value = id;
  localStorage.setItem('indicator_ids', JSON.stringify(metricsIds.value));
}

function getjudgeModelSelectId(id) {
  judgeModelsId.value = id;
  localStorage.setItem('judge_model_id', judgeModelsId.value);
}

const handleGroupChange = (value) => {
  selectedTaskType.value = value;
};

function handleNext() {
  currentStep.value += 1;
}

function handlCreate() {
  const datasetId = localStorage.getItem('dataset_id');
  const modelIds = localStorage.getItem('model_id');
  const metricsId = JSON.parse(localStorage.getItem('indicator_ids'));
  const judgeModelsId = localStorage.getItem('judge_model_id');
  const paramData = {
    dataset_id: datasetId,
    model_id: modelIds,
    indicator_ids: metricsId,
    name: ruleForm.taskName,
    user_name: localStorage.getItem('vuems_name'),
    judge_model_id: judgeModelsId,
  };
  if (radioValue.value === '2') {
    delete paramData.judge_model_id;
  }
  console.log(paramData);
  createTaskslist(paramData).then((res) => {
    if (res && res.data?.message) {
      ElMessage.success('创建评测任务成功');
    }
    router.push('/evaluation-task')
  });
}
function handlPrevius() {
  currentStep.value -= 1;
}

// 模拟加载
onMounted(() => {});
</script>

<style lang="less" scoped>
.task-type-select-container {
  height: 100%;
  padding: 20px;
  position: relative;

  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;

    .back-btn {
      color: #139a96;
      font-weight: 500;
      font-size: 16px;
      padding: 8px 16px;
    }

    .back-btn:hover {
      background-color: rgba(64, 158, 255, 0.1);
      border-radius: 4px;
    }
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 45px;

    .steps-section {
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .custom-steps {
        :deep(.el-step__head) {
          &.is-process {
            .el-step__icon {
              background-color: #139a96;
              border-color: #139a96;
              color: white;
            }
          }
        }

        :deep(.el-step__title) {
          &.is-process {
            color: #139a96;
            font-weight: 600;
          }
        }
      }
    }

    .search-section {
      margin-bottom: 30px;

      .search-input {
        width: 220px;
      }
    }

    .task-type-section {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 30px;

      .section-title {
        font-size: 28px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 8px;
        text-align: center;
        margin-bottom: 40px;
      }

      .task-type-options {
        display: flex;
        gap: 20px;

        .custom-radio {
          width: 100%;
          margin: 0;
          height: auto;

          :deep(.el-radio__input) {
            display: none;
          }

          :deep(.el-radio__label) {
            padding-left: 0;
            width: 100%;
          }

          &.is-checked {
            .task-type-content {
              border-color: #139a96;
              background-color: rgba(64, 158, 255, 0.05);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
            }
          }

          .task-type-content {
            display: flex;
            align-items: center;
            width: 300px;
            gap: 20px;
            padding: 24px;
            border: 2px solid #e4e7ed;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            background: white;

            &:hover {
              border-color: #139a96;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .task-type-icon {
              width: 60px;
              height: 60px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #f5f7fa;
              transition: background-color 0.3s ease;

              svg {
                width: 32px;
                height: 32px;
              }
            }

            .task-type-info {
              flex: 1;

              .task-type-name {
                font-size: 20px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 8px;
              }
            }
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      padding: 20px 0;
    }
  }
}
</style>
