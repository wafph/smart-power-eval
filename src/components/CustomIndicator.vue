<template>
  <div class="indicators-management-container">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧树状目录 -->
      <div style="height: 80vh; overflow-y: auto">
        <div class="left-sidebar">
          <div class="directory-header">
            <span class="directory-title">内置指标体系</span>
          </div>
          <div class="tree-container">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :highlight-current="true"
              class="directory-tree"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span class="node-label">{{ node.label }}</span>
                  <span v-if="data.count" class="node-count">({{ data.count }})</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </div>

      <!-- 右侧自定义指标体系 -->
      <div class="right-content">
        <div class="custom-indicators-header">
          <div class="header-left">
            <span class="section-title">自定义指标体系</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleNewIndicator">
              <el-icon class="el-icon--left"><Plus /></el-icon>
              新建指标体系
            </el-button>
            <el-dialog
              :title="isEdit ? '编辑指标体系' : '新增指标体系'"
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
                :isSystem="true"
                @changeEmit="handleDatasetChange"
                @emitForm="getFormValue"
                @saveEdit="getChildDatas"
              />
            </el-dialog>
          </div>
        </div>
        <TableCustom
          :columns="columns"
          :tableData="pagedData"
          :pageSizes="[10, 20, 50, 100]"
          :pageSize="paramsObj.per_page"
          :layouts="'total, sizes, prev, pager, next, jumper'"
          :currentPage="paramsObj.page"
          :total="tableDataFilter.length"
          :editFunc="handleEdit"
          :delFunc="handleDelete"
          :viewFunc="handleView"
          @changePage="changeCurrentPage"
          @changeSize="changeSizePage"
        ></TableCustom>
        <el-dialog title="指标详情" v-model="isVisable" width="700px" destroy-on-close>
          <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  getMetricsList,
  delMetric,
  createMetrics,
  updateMetrics,
  getDatasetType,
} from '@/api';
const tableData = ref([]);
const rowData = ref({});
const isEdit = ref(false);
const visible = ref(false);
const isVisable = ref(false);
const datasetParent = ref({});
const selectOptions = ref([]);
const childOptions = ref([]);
import { ElMessage } from 'element-plus';
// 树形结构数据
const treeData = ref([
  {
    id: '1',
    label: '文本',
    children: [
      {
        id: '1-1',
        label: '语义理解（问答）',
        children: [
          { id: '1-1-1', label: 'BLEU' },
          { id: '1-1-2', label: 'ROUGE' },
        ],
      },
      {
        id: '1-2',
        label: '语义理解（选择）',
        children: [
          { id: '1-2-1', label: 'Accuracy准确率' },
          { id: '1-2-2', label: 'F1-Score' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: '多模态',
    children: [
      {
        id: '2-1',
        label: '物体识别',
        children: [
          { id: '2-1-1', label: 'Accuracy准确率' },
          { id: '2-1-2', label: 'Precision精确率' },
          { id: '2-1-3', label: 'Recall召回率' },
          { id: '2-1-4', label: 'F1-Score' },
        ],
      },
      {
        id: '2-2',
        label: '场景理解',
        children: [
          { id: '2-2-1', label: 'Accuracy准确率' },
          { id: '2-2-2', label: 'CLIPScore' },
        ],
      },
      {
        id: '2-3',
        label: '行为推断',
        children: [
          { id: '2-3-1', label: 'Accuracy准确率' },
          { id: '2-3-2', label: 'CLIPScore' },
        ],
      },
      {
        id: '2-4',
        label: '计数',
        children: [{ id: '2-4-1', label: 'Accuracy准确率' }],
      },
    ],
  },
  {
    id: '3',
    label: '视觉',
    children: [
      {
        id: '3-1',
        label: '图像分类',
        children: [
          { id: '3-1-1', label: 'Accuracy准确率' },
          { id: '3-1-2', label: 'Precision精确率' },
          { id: '3-1-3', label: 'Recall召回率' },
          { id: '3-1-4', label: 'F1-Score' },
        ],
      },
      {
        id: '3-2',
        label: '目标检测',
        children: [
          { id: '3-2-1', label: 'Accuracy准确率' },
          { id: '3-2-2', label: 'Precision精确率' },
          { id: '3-2-3', label: 'Recall召回率' },
          { id: '3-2-4', label: 'Discovery_Rate发现率' },
          { id: '3-2-4', label: 'error_rate误检比' },
        ],
      },
      {
        id: '3-3',
        label: '图像分割',
        children: [
          { id: '3-3-1', label: 'Precision精确率' },
          { id: '3-3-2', label: 'Recall召回率' },
          { id: '3-3-3', label: 'F1-Score' },
        ],
      },
    ],
  },
  {
    id: '4',
    label: '时序',
    children: [],
  },
  {
    id: '5',
    label: '安全',
    children: [
      {
        id: '5-1',
        label: '基础安全',
        children: [{ id: '5-1-1', label: '5大类31小类安全风险综合得分' }],
      },
      {
        id: '5-2',
        label: '对抗安全',
        children: [{ id: '5-2-1', label: '对抗攻击综合得分对抗攻击综合得分' }],
      },
    ],
  },
]);

// 表格相关
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'name', label: '指标体系名称' },
  { prop: 'evaluation_type', label: '评估类型' },
  { prop: 'subtask_type', label: '子任务类型' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 300 },
]);

const viewData = ref({
  row: {},
  list: [{}],
});

let dialogOptions = ref({
  labelWidth: '130px',
  span: 24,
  list: [
    { type: 'input', label: '指标体系名称', prop: 'name', required: true },
    {
      type: 'select1',
      label: '评估类型',
      opts: selectOptions,
      prop: 'evaluation_type',
      required: true,
      placeholder: '数据集类型',
    },
    {
      type: 'select2',
      label: '子任务类型',
      opts: childOptions,
      prop: 'subtask_type',
      required: true,
      placeholder: '子任务类型',
    },
  ],
});

const pagedData = computed(() => {
  const start = (paramsObj.page - 1) * paramsObj.per_page;
  const end = start + paramsObj.per_page;
  return tableDataFilter.value.slice(start, end);
});

const handleEdit = (row: any) => {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
};

function getFormValue(val: any) {
  val.subtask_type = '';
}

const handleView = (row: {}) => {
  viewData.value.row = { ...row };
  viewData.value.list = [
    {
      prop: 'name',
      label: '指标名称',
    },
    {
      prop: 'evaluation_type',
      label: '评估类型',
    },
    {
      prop: 'subtask_type',
      label: '子任务类型',
    },
    {
      prop: 'created_at',
      label: '创建视觉',
    },
  ];
  isVisable.value = true;
};

function changeCurrentPage(val: number) {
  paramsObj.page = val;
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
}

// 获取数据集子类
function getDatasetTypes() {
  getDatasetType().then((res: any) => {
    datasetParent.value = res.data;
    datasetParent.value.temporal = [{ a: '负荷预测' }, { b: '价格预测' }];
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

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

// 获取指标列表
function getMetricsLists() {
  getMetricsList({ username: localStorage.getItem('vuems_name') || 'testuser' }).then(
    (res: any) => {
      if (res && res.data) {
        res.data.metrics.forEach((item: any) => {
          item.subtask_type = getFormatName(item.subtask_type);
        });
        tableData.value = res.data.metrics;
      }
    },
  );
}

// 映射函数
function getFormatName(formatKey: any) {
  const formatMap = {
    qa: '语义理解（问答）',
    mcq: '语义理解（选择题）',
    image_generation: '图像生成',
    image_captioning: '图像描述',
    object_recognition: '物体识别',
    scene_understanding: '场景理解',
    behavior_inference: '行为推断',
    counting: '计数',
    custom: '自定义',
    image_classification: '图像分类',
    object_detection: '目标检测',
    image_segmentation: '图像分割',
  };
  return formatMap[formatKey] || '未知格式';
}

const tableDataFilter = computed(() => {
  let data = [...tableData.value];
  return data;
});

function handleDatasetChange(e) {
  getDatasetTypes();
  const a =
    e === '文本'
      ? 'text'
      : e === '多模态'
        ? 'multimodal'
        : e === '视觉'
          ? 'vision'
          : e === '时序'
            ? 'temporal'
            : 'safety';
  childOptions.value = datasetParent.value[a].map((item: any) => ({
    value: Object.keys(item).join(''),
    label: Object.values(item).join(''),
  }));
}
// 树形结构配置
const defaultProps = {
  children: 'children',
  label: 'label',
};

// 分页相关数据
const paramsObj = reactive({
  page: 1,
  per_page: 10,
  type: 'all',
  status: 'all',
  username: localStorage.getItem('vuems_name') || 'testuser',
});

// 树节点点击事件
const handleNodeClick = () => {
};

const handleDelete = (row) => {
  delMetric(row.id).then((res: any) => {
    ElMessage.success(`删除${row.name}成功`);
    getMetricsLists();
  });
};

// 创建/更新数据集
function getChildDatas(val: any) {
  if (isEdit.value) {
    // 更新数据集
    updateMetrics(val.id, {
      name: val.name,
      evaluation_type: val.evaluation_type,
      subtask_type: val.subtask_type,
    }).then(() => {
      getMetricsLists();
      ElMessage.success('修改自定义指标成功');
      visible.value = false;
      isEdit.value = false;
    });
  } else {
    // 添加数据集
    const params = {
      name: val.name,
      evaluation_type: val.evaluation_type,
      subtask_type: val.subtask_type,
      username: localStorage.getItem('vuems_name') || 'testuser',
    };

    createMetrics(params).then((res: any) => {
      visible.value = false;
      ElMessage.success(`创建自定义指标成功`);
      getMetricsLists();
    });
  }
}

// 新建指标体系
const handleNewIndicator = () => {
  visible.value = true;
};

// 组件挂载时
onMounted(() => {
  getMetricsLists();
  getDatasetTypes();
});
</script>

<style lang="less" scoped>
.indicators-management-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .page-header {
    padding: 16px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 16px;
    border-radius: 4px;
    background-color: #fafafa;
    gap: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .left-sidebar {
      width: 280px;
      border-right: 1px solid #e4e7ed;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      margin-bottom: 30px;

      .directory-header {
        width: 280px;
        padding: 16px;
        position: fixed;
        border-bottom: 1px solid #e4e7ed;
        background-color: #f5f7fa;
        z-index: 88;

        .directory-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .tree-container {
        margin-top: 50px;
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;

        .directory-tree {
          background-color: transparent;

          :deep(.el-tree-node) {
            .el-tree-node__content {
              height: 36px;
              padding-left: 20px;

              &:hover {
                background-color: #f0f9ff;
              }
            }

            &.is-current {
              & > .el-tree-node__content {
                background-color: #ecf5ff;
                color: #409eff;

                .custom-tree-node {
                  .node-label {
                    font-weight: 600;
                  }
                }
              }
            }
          }

          .custom-tree-node {
            display: flex;
            align-items: center;
            width: 100%;

            .node-label {
              flex: 1;
              font-size: 14px;
            }

            .node-count {
              font-size: 12px;
              color: #909399;
              margin-left: 8px;
            }
          }
        }
      }
    }

    .right-content {
      flex: 1;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .custom-indicators-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e4e7ed;
        background-color: #fff;

        .header-left {
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }

        .header-right {
          .new-indicator-btn {
            background-color: #67c23a;
            border-color: #67c23a;

            &:hover {
              background-color: #5daf34;
              border-color: #5daf34;
            }
          }
        }
      }

      .table-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;

        :deep(.el-table) {
          .el-table__header {
            th {
              background-color: #f5f7fa;
              color: #333;
              font-weight: bold;
            }
          }

          .el-table__body {
            tr {
              &:nth-child(even) {
                td {
                  background-color: #fafafa;
                }
              }

              &:hover {
                td {
                  background-color: #f5f7fa;
                }
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;

          .el-button {
            padding: 6px;
          }
        }
      }

      .pagination-container {
        padding: 16px 20px;
        border-top: 1px solid #e4e7ed;
        display: flex;
        justify-content: flex-end;
        background-color: #fff;
      }
    }
  }
}
</style>
