<template>
  <div class="data-container">
    <h2>评估报告管理</h2>
    <div class="bottom-content">
      <InfoSection :model-info="modelInfo" @change-model="handleChangeModel" />
      <div class="bottom-box">
        <div class="table-content">
          <TableCustom
            :columns="columns"
            :tableData="tableData"
            :pageSizes="[10, 20, 50, 100]"
            :pageSize="paramsObj.per_page"
            :layouts="'total, sizes, prev, pager, next, jumper'"
            :currentPage="paramsObj.page"
            :total="total"
            :isShowTest="true"
            @connectionId="getRunTask"
            @changePage="changeCurrentPage"
            @changeSize="changeSizePage"
            :viewFunc="handleView"
            :editFunc="handleEdit"
            :stopFunc="handelStop"
            :delFunc="handleDelete"
            :isShowDetail="isShowDetail"
            :isShowEdit="isShowEdit"
            :isShowStop="true"
          ></TableCustom>
        </div>
        <el-dialog
          :title="isEdit ? '编辑评测任务' : '创建评测任务'"
          v-model="visible"
          width="700px"
          destroy-on-close
          :close-on-click-modal="false"
          @close="closeDialog"
          draggable
        >
          <TableEdit
            :form-data="rowData"
            :options="dialogOptions"
            :edit="isEdit"
            @saveEdit="getChildDatas"
            :update="updateData"
            :viewFunc="handleView"
            :isSystem="true"
          />
        </el-dialog>
        <el-dialog
          title="查看详情"
          v-model="tasklDetailVisible"
          width="85%"
          destroy-on-close
        >
          <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { FormOption } from '@/types/form-option';
import {
  getDatasets,
  createTaskslist,
  getTaskDetail,
  getUpdateDatasetDetail,
  deleteDatasetDetail,
  runTask,
  stopTask,
  getTaskStatus,
  getTaskslist,
  getTasksLogs,
} from '@/api';
import type {
  ModelInfo,
} from './types/indicator';

import { ElMessage } from 'element-plus';
const tableData = ref([]);
const visible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const isShowEdit = ref(true);
const isShowDetail = ref(true);
const isUpdate = ref(false);
const tasklDetailVisible = ref(false);
// 模型信息
const modelInfo = reactive<ModelInfo>({
  modelName: '图形分类模型V2.1',
});
const viewData = ref({
  row: {},
  list: [],
});

const total = ref(0);
const form = reactive({
  name: '', // 评测任务名称
  scenario: '', //应用场景
  type: '', //评测任务类型
  childType: '', //子任务类型
  status: '', //评测任务状态
});

// 新增/编辑弹窗相关
let dialogOptions = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '数据集ID', prop: 'dataset_id', required: true },
    { type: 'input', label: '模型ID', prop: 'model_id', required: true },
    { type: 'input', label: '指标ID列表', prop: 'indicator_ids', required: true },
    { type: 'input', label: '任务名称', prop: 'name', required: true },
    { type: 'input', label: '裁判模型任务ID', prop: 'judge_model_id', required: false },
    // { type: 'input', label: '扩展字段', prop: 'extension_fields', required: false },
  ],
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

const addTask = () => {
  visible.value = true;
  isUpdate.value = false;
};

// 运行评测任务
async function getRunTask(id) {
  try {
    const res = await runTask(id);
  } catch (error) {
    console.log(error);
  }
}
const rowData = ref({});

function handleEdit(row: any) {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
  isUpdate.value = true;
}

//停止评测任务
function handelStop(row) {
  stopTask(row.id)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {});
}

const handleView = (row) => {
  tasklDetailVisible.value = true;
  getTaskDetail(row.id).then((res) =>
    viewData.value.row = res.data;
  });
  viewData.value.list = [
    {
      prop: 'task_name',
      label: '任务名称',
    },
    {
      prop: 'task_status',
      label: '任务状态',
    },
    {
      prop: 'model',
      label: '评测任务',
    },
    {
      prop: 'dataset',
      label: '评测任务',
    },
    {
      prop: 'last_run_time',
      label: '最近运行时间',
    },
    {
      prop: 'execution_time',
      label: '执行时间',
    },
    {
      prop: 'evaluation_results',
      label: '评测结果',
    },
    {
      prop: 'use_judge_model',
      label: '是否使用裁判评测任务',
    },
    {
      prop: 'log_path',
      label: '日志文件路径',
    },
    {
      prop: 'created_at',
      label: '创建时间',
    },
  ];
};

const handleDelete = (row) => {
  deleteDatasetDetail(row.id).then((res) => {
    ElMessage.success(`删除评测任务${row.name}成功`);
  });
};

const updateData = () => {};
const paramsObj = reactive({
  page: 1,
  per_page: 30,
  type: 'all',
  status: 'all',
  is_preset: 'all',
  username: localStorage.getItem('vuems_name'),
});

// 将字符串数字变为数字
function convertValuesToNumbers(obj, exceptions = []) {
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];

    // 如果是例外字段，保持原样
    if (exceptions.includes(key)) {
      result[key] = value;
      return result;
    }

    // 尝试转换为数字
    const num = Number(value);

    // 检查是否是有效数字（排除 NaN, Infinity）
    if (!isNaN(num) && isFinite(value) && value !== '') {
      result[key] = num;
    } else {
      result[key] = value;
    }

    return result;
  }, {});
}

// 创建/更新评测任务
function getChildDatas(val) {
  loading.value = true;
  val.user_name = 'admin';
  const strToNumber = convertValuesToNumbers(val, ['name', 'user_name']);
  if (isUpdate.value) {
    // 更新评测任务
    getUpdateDatasetDetail(val.id, {
      name: val.name,
      scenario: val.scenario,
      sample_count: val.sample_count,
      status: val.status,
      size: val.size,
      type: val.type,
      description: val.description,
    })
      .then((res) => {
        getTaskslists();
        ElMessage.success('修改任务列表信息成功');
        visible.value = false;
        loading.value = false;
        isUpdate.value = false;
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // 新建评测任务
    createTaskslist(strToNumber)
      .then((res) => {
        visible.value = false;
        loading.value = false;
        ElMessage.success(`新建评测任务${val.name}信息成功`);
        getTaskslists();
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function changeCurrentPage(val: number) {
  paramsObj.page = val;
  getTaskslists();
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
  // paramsObj.page = val;
  getTaskslists();
}

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

onMounted(() => {
  getTaskslists();
});

// 获取评测任务列表
function getTaskslists() {
  getTaskslist({ username: localStorage.getItem('vuems_name') }).then((res) => {
    if (res && res.data) {
      const start = (paramsObj.page - 1) * paramsObj.per_page;
      const end = start + paramsObj.per_page;
      tableData.value = res.data.tasks.slice(start, end);
      total.value = res.data.total;
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
