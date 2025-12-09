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
                  @click="stopFunc(row)"
                  v-if="isShowStop"
                >
                  停止
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
                  @click="handleDownload(row)"
                  v-if="isShowDownload"
                >
                  下载
                </el-button>
              </template>
              <span v-else-if="item.formatter">
                {{ item.formatter(row[item.prop]) }}
              </span>
              <span v-else>
                {{ row[item.prop] }}
              </span>
            </slot>
          </template>
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
import { toRefs, PropType, ref } from 'vue';
import {
  Delete,
  Edit,
  View,
  Upload,
  Download,
  Link,
  Notebook,
} from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
const emits = defineEmits([
  'setLoading',
  'sendsSelection',
  'sendsSelec',
  'changePage',
  'changeSize',
  'downloadId',
  'versionId',
  'connectionId',
  'uploadFile',
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
  isShowStop: {
    type: Boolean,
    default: false,
  },
  isShowDownload: {
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
  stopFunc: {
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

const handleSelectChange = (selection: any) => {
  console.log(selection);
  emits('sendsSelec', selection);
};

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
  emits('changeSize', val);
};
// 当前页码变化的事件
const handleCurrentChange = (val: number) => {
  emits('changePage', val);
};

const handleDelete = (row) => {
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

// 下载数据集
const handleDownload = (row) => {
  emits('downloadId', row.id);
};

function uploadFile(row) {
  emits('uploadFile', row.id);
}

function seeVersion(row) {
  emits('versionId', row.id);
}

function seeTestConnection(row) {
  emits('connectionId', row.id);
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
