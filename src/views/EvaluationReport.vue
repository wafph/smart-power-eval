<template>
  <div class="data-container">
    <h2>评估报告管理</h2>
    <div class="bottom-content">
      <InfoSection :model-info="modelInfo" />
      <div class="bottom-box">
        <div class="table-content">
          <TableCustom
            :columns="columns"
            :hasPagination="false"
            :tableData="tableData"
          ></TableCustom>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { getTasksResults, getTasksReport } from '@/api';
import type { ModelInfo } from './types/indicator';
import { ElMessage } from 'element-plus';
const tableData = ref([]);
import { useState } from '@/utils/state';
const { states } = useState();
// 模型信息
const modelInfo = reactive<ModelInfo>({
  modelName: '图形分类模型V2.1',
});

// 表格相关
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'task_name', label: '数据集' },
  { prop: 'model_name', label: '任务类型' },
  { prop: 'dataset_name', label: '模型' },
  { prop: 'metrics_names', label: '指标' },
  { prop: 'task_status', label: '结果' },
]);

onMounted(() => {
  getTasksResultsList();
  getTasksReports();
});

// 获取评测任务结果
function getTasksResultsList() {
  getTasksResults(states.id).then((res) => {
    console.log(res);
    if (res.data) {
      ElMessage.success('获取评测结果成功');
    }
  });
}

function getTasksReports() {
  getTasksReport(states.id).then((res) => {
    if (res.data) {
      ElMessage.success('获取任务报告成功');
    }
  });
}
</script>

<style lang="less" scoped>
.data-container {
  background: #f3f4f6;

  p {
    margin-top: 15px;
    margin-bottom: 25px;
    color: #717b8c;
    font-size: 20;
    font-weight: 600;
  }
}

* {
  outline: 1px solid red; /* 显示所有元素边界 */
}

:deep(.el-card) {
  border-radius: 10px;
}

:deep(.el-form-item__content) {
  width: 220px;
}

.card-header {
  display: flex;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;

  .left {
    p:first-child {
      color: #717b8c;
      font-size: 15px;
      font-weight: 400;
      width: ;
    }
    p:last-child {
      color: #46d68b;
      font-size: 15px;
      font-weight: 400;
    }
  }

  img {
    width: 48px;
    height: 48px;
    margin-left: 35%;
  }

  p {
    margin-left: 30px;
    margin-right: 40px;
    color: #7f7f7f;
    font-size: 24px;
  }

  > span {
    font-weight: 650;
    font-style: normal;
    color: #f60d0d;

    font-size: 32px;
  }
}

.bottom-content {
  display: flex;
  flex-direction: column;
  margin-top: 20px;

  .form-top {
    width: 100%;
    height: 48px;
  }

  .table-content {
    padding: 10px 20px;
    width: 100%;
    background: #fff;
  }

  .selecct-width {
    width: 320px;
  }
}
</style>
