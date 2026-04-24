<template>
  <div class="data-container">
    <h2>业务场景与数据集</h2>
    <p>选择应用场景，管理评估所需的各类数据集</p>
    <div class="bottom-content">
      <div class="bottom-box">
        <div class="form-top">
          <el-form :inline="true" :model="form">
            <el-form-item label="数据集名称">
              <el-input v-model="form.name" placeholder="搜索数据集名称" />
            </el-form-item>
            <el-form-item label="应用场景">
              <el-input v-model="form.scenario" placeholder="搜索应用场景" />
            </el-form-item>
            <el-form-item label="数据集类型">
              <el-select
                clearable
                filterable
                @clear="handleTypeClear"
                allow-create
                v-model="form.type"
                placeholder="数据集类型"
                @change="handleDatasetChange(form.type)"
              >
                <el-option
                  v-for="item in selectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="数据集状态">
              <el-select
                clearable
                filterable
                allow-create
                v-model="form.status"
                @clear="handleStatusClear"
                placeholder="数据集状态"
              >
                <el-option label="待审核" value="待审核" />
                <el-option label="已通过" value="已通过" />
                <el-option label="已拒绝" value="已拒绝" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addDataSet"> 新增数据集 </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-content">
          <TableCustom
            :columns="columns"
            :tableData="pagedData"
            :pageSizes="[10, 20, 50, 100]"
            :pageSize="paramsObj.per_page"
            :layouts="'total, sizes, prev, pager, next, jumper'"
            :currentPage="paramsObj.page"
            :total="tableDataFilter.length"
            :selectedActionScheme="true"
            @changePage="changeCurrentPage"
            @changeSize="changeSizePage"
            :viewFunc="handleView"
            :editFunc="handleEdit"
            :delFunc="handleDelete"
            :checkFunc="handleCheck"
            :isShowEdit="isShowEdit"
            :downLoadFn="getDownLoadDataSet"
            :isShowUpload="isShowUpload"
            @uploadFile="getFileInfo"
          ></TableCustom>
        </div>
        <el-dialog
          :title="isEdit ? '编辑数据集' : '新增数据集'"
          v-model="visible"
          width="850px"
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
            @changeEmit="handleDatasetChange"
            @changeEmits="handleDatasetChanges"
            @emitForm="getformValue"
          />
        </el-dialog>
        <el-dialog
          title="上传数据集"
          v-model="fileUploadVisible"
          width="700px"
          destroy-on-close
          :close-on-click-modal="false"
          @close="closeDialog"
          draggable
        >
          <FolderUploadModal :file-ids="fileId" />
        </el-dialog>
        <DirectoryPreview
          v-if="directoryData.length > 0"
          :dialogVisible="isVisable"
          :directoryData="directoryData"
          @closeDialogVisible="closeEvent"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { FormOption } from '@/types/form-option';
import { useState } from '@/utils/state';
import {
  getDatasets,
  addDataSets,
  getdatasetDetail,
  getUpdateDatasetDetail,
  deleteDatasetDetail,
  auditDataset,
  getDataSetlist,
  getAllTages,
} from '@/api';
const { setCurrentTestTask } = useState();
import { ElMessage } from 'element-plus';
import DirectoryPreview from '@/components/DirectoryViewer/DirectoryViewer.vue';
const tableData = ref([]);
const visible = ref(false);
const isEdit = ref(false);
const loading = ref(false);
const isVisable = ref(false);
const fileUploadVisible = ref(false);
const isShowEdit = ref(true);
const isUpdate = ref(false);
const isShowUpload = ref(true);
const directoryData = ref([]);
const selectOptions = ref<string[]>([]);
const total = ref(0);
const dataset_type = ref('');
const datasetsOptions = ref([]);
const tagMetricsOptions = ref([]);
const handelchangeTag = ref(false);
const fileId = ref(2);
const datasetParent = ref({});
const datasetsSonOptions = ref<string[]>([]);
const form = reactive({
  name: '', // 数据集名称
  scenario: '', //应用场景
  type: '', //数据集类型
  status: '', //数据集状态
});
// 新增/编辑弹窗相关
let dialogOptions = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '数据集名称', prop: 'name', required: true },
    {
      type: 'select1',
      label: '数据集类型',
      opts: selectOptions,
      prop: 'type',
      required: true,
      placeholder: '数据集类型',
    },
    {
      type: 'select2',
      label: '场景任务',
      opts: datasetsSonOptions,
      isMultiple: false,
      prop: 'scenario',
      required: true,
      placeholder: '场景任务',
    },
    {
      type: 'select2',
      label: '数据集标签',
      opts: datasetsOptions,
      isMultiple: false,
      prop: 'tag',
      required: true,
      placeholder: '数据集标签',
    },
    {
      type: 'select2',
      label: '指标标签',
      opts: tagMetricsOptions,
      isMultiple: true,
      prop: 'metrics',
      required: true,
      placeholder: '指标标签',
    },
    { type: 'input', label: '样本数量', prop: 'sample_count', required: true },
  ],
});
// 表格相关
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'name', label: '数据集名称' },
  { prop: 'type', label: '类型' },
  // { prop: 'scenario', label: '应用场景' },
  { prop: 'is_preset', label: '是否预制数据集' },
  { prop: 'tag', label: '数据集标签' },
  { prop: 'metrics', label: '指标标签' },
  { prop: 'status', label: '状态' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 400 },
]);

function handleStatusClear() {
  form.status = '';
}

function handleTypeClear() {
  form.type = '';
}

const addDataSet = () => {
  visible.value = true;
  isUpdate.value = false;
  getAllTagesList();
};

const rowData = ref({});
const handleEdit = (row: any) => {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
  isUpdate.value = true;
  getAllTagesList();
  // 回显数据集
  getdatasetDetail(rowData.value.id).then((res: any) => {});
};

// 使用函数
const handleCheck = (row: {}) => {
  const params = { review_status: 'approved', review_comment: '审核通过' };
  auditDataset(row.id, params).then((res: any) => {
    if (res && res.data?.message) {
      ElMessage.success(`审核数据集${row.name}成功`);
      getDatasetsList();
    }
  });
};

// 获取所有标签
const getAllTagesList = () => {
  getAllTages().then((res) => {
    datasetParent.value = res.data.data;
    let keys = Object.keys(datasetParent.value);
    selectOptions.value = keys.map((item) => ({
      value: getFormatName(item),
      label: getFormatName(item),
    }));
    // 数据集标签
    datasetsOptions.value = res.data.dataset_tags?.map((item) => ({
      label: getFormatName(item),
      value: getFormatName(item),
    }));
  });
};

function getFormatName(formatKey: Object) {
  const formatMap = {
    multimodal: '多模态',
    science: '科学计算',
    semantic: '语义',
    temporal: '时序',
    benchmark: 'Benchmark',
    vision: '视觉',
    general: '通用',
    specialized: '专用',
    safety: '安全',
    trustworthy: '可信',
  };
  return formatMap[formatKey] || '未知格式';
}

// 定义类型
type FormatKey = '多模态' | '科学计算' | '语义' | '时序' | 'benchmark' | '视觉' | string; // 允许其他字符串

type FormatValue =
  | 'multimodal'
  | 'science'
  | 'semantic'
  | 'temporal'
  | 'benchmark'
  | 'vision'
  | '未知格式';

function getFormatNames(formatKey: FormatKey): FormatValue {
  const formatMap: Record<string, FormatValue> = {
    多模态: 'multimodal',
    科学计算: 'science',
    语义: 'semantic',
    时序: 'temporal',
    Benchmark: 'benchmark',
    视觉: 'vision',
  };

  return formatMap[formatKey] || '未知格式';
}

function getFormatSonName(formatKey: Object) {
  const formatMap = {
    benchmark: 'benchmark',
    semantic_choice: '语义理解（选择）',
    semantic_qa: '语义理解（问答)',
    image_captioning: '图像描述',
    object_recognition: '物体识别',
    scene_understanding: '场景理解',
    behavior_inference: '行为推断',
    pending: '待定',
    counting: '计数',
    image_classification: '图像分类',
    object_detection: '目标检测',
    image_segmentation: '图像分割',
    base_safety: '基础安全',
    confronting_safety: '对抗安全',
  };
  return formatMap[formatKey] || '未知格式';
}
const closeEvent = (event: any) => {
  isVisable.value = event;
};

const handleView = (row: {}) => {
  getDataSetlist(row.id, { path: row.file_path }).then((res: any) => {
    if (res && res.data.files) {
      directoryData.value = [
        {
          id: '1',
          label: res.data?.files[0].path,
          type: 'folder',
          children: [
            {
              id: '2',
              label: res.data?.files[1].name,
              type: 'file',
            },
          ],
        },
      ] as any;
    }
  });
  isVisable.value = true;
};

onMounted(() => {
  setCurrentTestTask(false);
});

const getDownLoadDataSet = (row: any) => {
  window.open(`/rest/api4/api/datasets/${row.id}/download`, '_blank');
};

function getFileInfo(id: any) {
  fileId.value = id;
  fileUploadVisible.value = true;
}

const handleDelete = (row: any) => {
  deleteDatasetDetail(row.id).then((res: any) => {
    if (res && res.data?.message) {
      ElMessage.success(`删除数据集${row.name}成功`);
      getDatasetsList();
    }
  });
};

const updateData = () => {};
const paramsObj = reactive({
  page: 1,
  per_page: 10,
  type: 'all',
  status: 'all',
  username: localStorage.getItem('vuems_name') || 'testuser',
});

// 创建/更新数据集
function getChildDatas(val: any) {
  loading.value = true;
  if (isUpdate.value) {
    // 更新数据集
    getUpdateDatasetDetail(val.id, {
      name: val.name,
      scenario: val.scenario,
      sample_count: val.sample_count,
      status: val.status,
      size: val.size,
      type: val.type,
      tag: val.tag,
      metrics: val.metrics,
      description: val.description,
    }).then(() => {
      getDatasetsList();
      ElMessage.success('修改数据集成功');
      visible.value = false;
      loading.value = false;
      isUpdate.value = false;
    });
  } else {
    // 添加数据集
    const params = {
      name: val.name,
      scenario: val.scenario,
      sample_count: val.sample_count,
      type: val.type,
      username: localStorage.getItem('vuems_name') || 'testuser',
      tag: val.tag,
      metrics: val.metrics,
    };

    addDataSets(params).then((res: any) => {
      visible.value = false;
      loading.value = false;
      ElMessage.success(`添加数据集${val.name}成功`);
      getDatasetsList();
    });
  }
}

function changeCurrentPage(val: number) {
  paramsObj.page = val;
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
}

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

onMounted(() => {
  getDatasetsList();
});

// 获取数据集列表
function getDatasetsList() {
  getDatasets({ username: localStorage.getItem('vuems_name') || 'testuser' }).then(
    (res: any) => {
      if (res && res.data) {
        tableData.value = res.data.datasets;
        tableData.value.forEach((item: any) => {
          item.is_preset = item.is_preset ? '是' : '否';
        });
      }
    },
  );
}

const tableDataFilter = computed(() => {
  let data = [...tableData.value];
  data = data.filter((item: any) => {
    const namefilter = item.name?.toLowerCase().includes(form.name?.toLowerCase());
    const scenariofilter = item.scenario
      ?.toLowerCase()
      .includes(form.scenario?.toLowerCase());
    const typeFilter = item.type?.toLowerCase().includes(form.type?.toLowerCase());
    const statusFilter = item.status?.toLowerCase().includes(form.status?.toLowerCase());
    return namefilter && scenariofilter && typeFilter && statusFilter;
  });

  return data;
});

// 分页数据
const pagedData = computed(() => {
  const start = (paramsObj.page - 1) * paramsObj.per_page;
  const end = start + paramsObj.per_page;
  return tableDataFilter.value.slice(start, end);
});

function handleDatasetChange(e: string) {
  dataset_type.value = e;
  const englishType = getFormatNames(e);

  // 1. 获取场景任务选项
  const scenarios = datasetParent.value[englishType] || {};
  datasetsSonOptions.value = Object.keys(scenarios).map((item: any) => ({
    label: getFormatSonName(item),
    value: item, // 这里用英文值，方便后续查找
  }));
}

function handleDatasetChanges(e: any) {}

function getformValue(value: any) {
  if (!value) {
    return;
  }

  // 确保 value 是对象
  if (typeof value !== 'object') {
    return;
  }

  const keys = getFormatNames(value.type);
  if (datasetParent?.value && value.scenario && getFormatNames(value.type)) {
    tagMetricsOptions.value = Object.values(
      datasetParent?.value[keys][value.scenario],
    ).map((item) => ({
      label: item,
      value: item,
    }));
  }
}
</script>

<style lang="less" scoped>
.data-container {
  background: #f3f4f6;

  p {
    margin-top: 15px;
    margin-bottom: 25px;
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
  // flex-direction: column;
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
  margin-top: 20px;

  .form-top {
    width: 100%;
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
