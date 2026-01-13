<template>
  <div>
    <div class="table-toolbar" v-if="hasToolbar">
      <div class="table-toolbar-left">
        <slot name="toolbarBtn"></slot>
      </div>
      <div class="table-toolbar-right flex-center">
        <template v-if="multipleSelection.length > 0">
          <el-tooltip effect="dark" content="删除选中" placement="top">
            <el-icon
              class="columns-setting-icon"
              @click="delSelection(multipleSelection)"
            >
              <Delete />
            </el-icon>
          </el-tooltip>
          <el-divider direction="vertical" />
        </template>
      </div>
    </div>
    <el-table
      class="mgb20"
      :style="{ width: '100%' }"
      border
      :data="tableData"
      :row-key="rowKey"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      table-layout="auto"
    >
      <template v-for="item in columns" :key="item.prop">
        <el-table-column
          v-if="item.visible"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :type="item.type"
          :align="item.align || 'center'"
        >
          <template #default="{ row, column, $index }" v-if="!item.type">
            <slot :name="item.prop" :rows="row" :index="$index">
              <template v-if="item.prop == 'operator'">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Upload"
                  @click="uploadFile(row)"
                  v-if="isShowUpload"
                >
                  上传
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :icon="Box"
                  @click="seeRun(row)"
                  v-if="isRun"
                >
                  运行
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  plain
                  :icon="Notebook"
                  @click="seeVersion(row)"
                  v-if="isShowVersion"
                >
                  版本
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="setDefaultFn(row)"
                  v-if="isShowDefault"
                >
                  设置为默认版本
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :icon="Link"
                  @click="seeTestConnection(row)"
                  v-if="isShowTest"
                >
                  连接测试
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  :icon="View"
                  @click="viewFunc(row)"
                  v-if="isShowDetail"
                >
                  查看
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="DocumentChecked"
                  plain
                  @click="checkFunc(row)"
                  v-if="isShowCheck"
                >
                  校验
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  plain
                  :icon="Edit"
                  @click="editFunc(row)"
                  v-if="isShowEdit"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDelete(row)"
                  v-if="isShowDel"
                >
                  删除
                </el-button>
                <el-button
                  type="warning"
                  plain
                  size="small"
                  :icon="Download"
                  @click="downLoadFn(row)"
                  v-if="isShowDownload"
                >
                  下载
                </el-button>
                <ActionDropdown
                  v-if="selectedActionScheme"
                  :task="row"
                  @check="handleCheck(row)"
                  @download="downLoadFn(row)"
                  @stop="handleStopTask(row)"
                  @result="handleResultTask(row)"
                  @report="handleReportTask(row)"
                  @logs="handleViewLogs(row)"
                />
              </template>

              <template v-if="item.prop == 'task_type'">
                {{ row.evaluation_results.task_type }}
              </template>

              <template v-if="item.prop == 'accuracy'">
                {{ Object.keys(row.evaluation_results.metrics).join('') }}
              </template>
              <template v-if="item.prop == 'evaluation_results'">
                {{ row.evaluation_results?.metrics.accuracy }}
                <el-button type="primary" size="small" @click="downloadResult(row)">
                  下载
                </el-button>
              </template>
              <template v-else-if="item.prop == 'task_status'">
                <el-tag
                  :type="
                    row.task_status === 'success'
                      ? 'success'
                      : row.task_status === 'pending'
                      ? 'primary'
                      : row.task_status === 'running'
                      ? 'warning'
                      : 'danger'
                  "
                  >{{ row.task_status }}</el-tag
                >
              </template>
              <span v-else-if="item.formatter">
                {{ item.formatter(row[item.prop]) }}
              </span>
              <span v-else>
                {{ row[item.prop] }}
              </span>
            </slot>
          </template>
          <!-- {{ setDisabled }} -->
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      v-if="hasPagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :background="true"
      :layout="layouts"
      :size="'default'"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
      style="--el-color-primary: #139a96"
    />
  </div>
</template>

<script setup lang="ts">
import { toRefs, PropType, computed, ref } from 'vue';
import { useState } from '@/utils/state';
const { states } = useState();
import {
  Delete,
  Edit,
  View,
  Upload,
  Download,
  Link,
  Notebook,
  Box,
  DocumentChecked,
} from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
const emits = defineEmits([
  'setLoading',
  'sendsSelection',
  'sendsSelec',
  'changePage',
  'changeSize',
  'versionId',
  'connectionId',
  'uploadFile',
  'runId',
]);
const loading = ref(false);
const props = defineProps({
  // 表格相关
  tableData: {
    type: Array,
    default: [],
  },
  columns: {
    type: Array as PropType<any[]>,
    default: [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  hasToolbar: {
    type: Boolean,
    default: true,
  },
  //  分页相关
  hasPagination: {
    type: Boolean,
    default: true,
  },
  isShowDetail: {
    type: Boolean,
    default: true,
  },
  isShowEdit: {
    type: Boolean,
    default: true,
  },
  isShowDel: {
    type: Boolean,
    default: true,
  },
  isShowDownload: {
    type: Boolean,
    default: false,
  },
  selectedActionScheme: {
    type: Boolean,
    default: false,
  },
  isShowUpload: {
    type: Boolean,
    default: false,
  },
  isShowVersion: {
    type: Boolean,
    default: false,
  },
  isShowDefault: {
    type: Boolean,
    default: false,
  },
  isRun: {
    type: Boolean,
    default: false,
  },
  isShowCheck: {
    type: Boolean,
    default: false,
  },
  isShowTest: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  layouts: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
  delFunc: {
    type: Function,
    default: () => {},
  },
  viewFunc: {
    type: Function,
    default: () => {},
  },
  downLoadFn: {
    type: Function,
    default: () => {},
  },
  stopFunc: {
    type: Function,
    default: () => {},
  },
  versionFn: {
    type: Function,
    default: () => {},
  },
  setDefaultFn: {
    type: Function,
    default: () => {},
  },
  resultFunc: {
    type: Function,
    default: () => {},
  },
  reportFunc: {
    type: Function,
    default: () => {},
  },
  logsFunc: {
    type: Function,
    default: () => {},
  },
  checkFunc: {
    type: Function,
    default: () => {},
  },
  editFunc: {
    type: Function,
    default: () => {},
  },
  delSelection: {
    type: Function,
    default: () => {},
  },
  refresh: {
    type: Function,
    default: () => {},
  },
  changePage: {
    type: Function,
    default: () => {},
  },
});
let {
  tableData,
  columns,
  rowKey,
  hasToolbar,
  hasPagination,
  total,
  currentPage,
  pageSize,
  pageSizes,
  layouts,
} = toRefs(props);
columns.value.forEach((item) => {
  if (item.visible === undefined) {
    item.visible = true;
  }
});

// 当选择项发生变化时会触发该事件
const multipleSelection = ref([]);
const handleSelectionChange = (selection: any[]) => {
  multipleSelection.value = selection;
  emits('sendsSelection', multipleSelection.value);
};

// const setDisabled = () => {
//   const stopDisabled = states.actions.find((item) => {
//     return item.command === 'stop';
//   }).disabled;
// };

const setDisabled = computed(() => {
  const stopDisabled = states.actions.find((item) => {
    return item.command === 'stop';
  }).disabled;
  return stopDisabled;
});

const handleSelectChange = (selection: any) => {
  emits('sendsSelec', selection);
};

const handleCheck = (row: any) => {
  ElMessageBox.confirm(`确定要校验数据集 "${row.name}" 吗？`, '审核数据集', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    props.checkFunc(row);
  });
};

const handleStopTask = (task: any) => {
  ElMessageBox.confirm(`确定要停止任务吗？`, '停止任务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    props.stopFunc(task);
  });
};

const handleResultTask = (task) => {
  props.resultFunc(task);
};

const handleReportTask = (task) => {
  props.reportFunc(task);
};

const downloadResult = (row) => {
  props.reportFunc(row);
};

const handleViewLogs = (task) => {
  props.logsFunc(task);
};

const handleSizeChange = (val: number) => {
  emits('changeSize', val);
};
// 当前页码变化的事件
const handleCurrentChange = (val: number) => {
  emits('changePage', val);
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',
  })
    .then(async () => {
      props.delFunc(row);
      loading.value = true;
      emits('setLoading', loading.value);
      setTimeout(() => {
        loading.value = false;
        emits('setLoading', loading.value);
      }, 1000);
    })
    .catch(() => {});
};

function uploadFile(row: { id: any }) {
  emits('uploadFile', row.id);
}

function seeVersion(row: any) {
  props.versionFn(row);
  emits('versionId', row.id);
}

function seeTestConnection(row: { id: any }) {
  emits('connectionId', row.id);
}

function seeRun(row: { id: any }) {
  emits('runId', row.id);
}
</script>

<style scoped lang="less">
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;

  .table-toolbar-left {
    width: 80%;
    display: flex;
    justify-content: space-between;
  }
}

.columns-setting-icon {
  display: block;
  font-size: 18px;
  cursor: pointer;
  color: #676767;
}
</style>
<style>
.table-header .cell {
  color: #333;
}
</style>
