<template>
  <div class="data-container">
    <h2>评估任务管理</h2>
    <div class="bottom-content">
      <div class="bottom-box">
        <div class="form-top">
          <el-button type="primary" class="mr" @click="addTask"> 新建评测任务 </el-button>
        </div>
        <p>我的评估任务</p>
        <div class="table-content">
          <TableCustom
            :columns="columns"
            :tableData="tableData"
            :pageSizes="[10, 20, 50, 100]"
            :pageSize="paramsObj.per_page"
            :layouts="'total, sizes, prev, pager, next, jumper'"
            :currentPage="paramsObj.page"
            :total="total"
            :isRun="true"
            @runId="getRunTask"
            @changePage="changeCurrentPage"
            @changeSize="changeSizePage"
            :viewFunc="handleViews"
            :editFunc="handleEdit"
            :stopFunc="handelStop"
            :resultFunc="handleResult"
            :reportFunc="handleReport"
            :logsFunc="getLogs"
            :delFunc="handleDelete"
            :selectedActionScheme="true"
            :isShowDetail="isShowDetail"
            :isShowEdit="isShowEdit"
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
import { ref, markRaw, reactive, onMounted, onUnmounted } from 'vue';
import { FormOption } from '@/types/form-option';
import { useRouter } from 'vue-router';
import {
  getTaskDetail,
  getUpdateDatasetDetail,
  deleteTask,
  runTask,
  stopTask,
  getTaskStatus,
  getTaskslist,
} from '@/api';
import { useState } from '@/utils/state';
import { ElMessage } from 'element-plus';
import { VideoPlay, CopyDocument, Download, Document } from '@element-plus/icons-vue';
const tableData = ref([]);
const visible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const isVisable = ref(false);
const isShowEdit = ref(false);
const isShowDetail = ref(true);
const isUpdate = ref(false);
const tasklDetailVisible = ref(false);
const taskId = ref<number>();
const { setCurrentId, setCurrentTestTask, setCurrentActions } = useState();
const currentStatus = ref('');
let pollTimer: string | number | NodeJS.Timeout | null | undefined = null;
const POLL_INTERVAL = 5000; // 5秒轮询一次
const MAX_POLL_COUNT = 120; // 最多轮询5分钟 (300 * 5秒 = 10分钟=600秒)
const isPolling = ref(false);
const viewData = ref({
  row: {},
  list: [],
});
const router = useRouter();
const total = ref(0);
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
  ],
});
// 表格相关
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'task_name', label: '任务名称' },
  { prop: 'model_name', label: '模型名称' },
  { prop: 'dataset_name', label: '数据集名称' },
  { prop: 'metrics_names', label: '评估指标' },
  { prop: 'last_run_time', label: '最后运行时间' },
  { prop: 'task_status', label: '评测状态' },
  { prop: 'operator', label: '操作', width: 340 },
]);

const addTask = () => {
  router.push('/create-evaluation-task');
};

// 运行评测任务
async function getRunTask(id: number) {
  taskId.value = id;
  try {
    const res = await runTask(id);
    const test = res.data.message;
    ElMessage.success(`任务启动成功${test}开始监控状态`);

    // 2. 开始轮询状态
    startPollingStatus(id);
    getTaskslists();
  } catch (error) {
  }
}

function handleResult(row: any) {
  setCurrentId(row.id);
  router.push('/evaluation-report');
}

function handleReport(row: any) {
  setCurrentId(row.id);
  router.push('/evaluation-report');
}

function getLogs(row: any) {
  setCurrentId(row.id);
  router.push('/evaluation-logs');
}
// 获取状态
const fetchInitialStatus = async (taskId: number) => {
  if (!taskId) return;
  try {
    const response = await getTaskStatus(taskId);
    if (response.data) {
      currentStatus.value = response.data.task_status;
      if (currentStatus.value === 'failed' || currentStatus.value === 'success') {
        stopPolling();
      }
    }
  } catch (error) {
  }
};

// 启动轮询
const startPollingStatus = (taskId: number) => {
  let pollCount = 0;

  // 立即执行一次
  fetchInitialStatus(taskId);

  // 设置轮询定时器
  pollTimer = setInterval(() => {
    pollCount++;

    if (pollCount >= MAX_POLL_COUNT) {
      stopPolling();
      ElMessage.warning({
        message: '任务监控时间过长，已停止监控',
        duration: 5000,
      });
      return;
    }

    getTaskslists();
    fetchInitialStatus(taskId);
  }, POLL_INTERVAL);
};

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isPolling.value = false;
};
// 组件卸载时清理
onUnmounted(() => {
  stopPolling();
  getTaskslists();
});

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
      stopPolling();
    })
    .catch((err) => {});
}

const handleViews = (row) => {
  getTaskDetail(row.id).then((res) => {
    viewData.value.row = res.data;
    if (res.data) {
      tasklDetailVisible.value = true;
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
          label: '模型',
        },
        {
          prop: 'dataset',
          label: '数据集',
        },
        {
          prop: 'metrics_list',
          label: '指标列表',
        },
        {
          prop: 'last_run_time',
          label: '最近运行时间',
        },
        {
          prop: 'created_at',
          label: '创建时间',
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
          prop: 'report_path',
          label: '报告文件路径',
        },
      ];
    }
  });
};

const handleDelete = (row) => {
  deleteTask(row.id).then((res) => {
    if (res.data && res.data.message) {
      ElMessage.success(`删除评测任务${row.task_name}成功`);
      getTaskslists();
    }
  });
};

const updateData = () => {};
const paramsObj = reactive({
  page: 1,
  per_page: 20,
  type: 'all',
  status: 'all',
  is_preset: 'all',
  username: localStorage.getItem('vuems_name'),
});

// 创建/更新评测任务
function getChildDatas(val: any) {
  loading.value = true;
  val.user_name = localStorage.getItem('vuems_name');
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
      });
  }
}

function changeCurrentPage(val: number) {
  paramsObj.page = val;
  getTaskslists();
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
  getTaskslists();
}

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

onMounted(() => {
  getTaskslists();
  setCurrentTestTask(true);
  setCurrentActions([
    { command: 'stop', label: '停止', icon: markRaw(CopyDocument), disabled: false },
    { command: 'result', label: '结果', icon: markRaw(Download), disabled: false },
    { command: 'report', label: '报告', icon: markRaw(VideoPlay), disabled: false },
    { command: 'logs', label: '日志', icon: markRaw(Document), disabled: false },
  ]);
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
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 20px;
    font-weight: 600;
    color: #717b8c;
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
  margin-top: 15px;

  .form-top {
    width: 100%;
    display: flex;
    justify-content: flex-end;

    .mr {
      margin-right: 60px;
    }
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
