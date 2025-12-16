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
              <el-select
                clearable
                filterable
                @clear="handleScenarioClear"
                allow-create
                v-model="form.scenario"
                placeholder="应用场景"
              >
                <el-option label="场景1" value="场景1" />
                <el-option label="场景2" value="场景2" />
                <el-option label="场景3" value="场景3" />
              </el-select>
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
            <el-form-item label="">
              <el-select
                clearable
                filterable
                @clear="handleTypeClear"
                allow-create
                v-model="form.childType"
                placeholder="子任务类型"
              >
                <el-option
                  v-for="item in childOptions"
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
                <el-option label="pending" value="pending" />
                <el-option label="approved" value="approved" />
                <el-option label="rejected" value="rejected" />
                <el-option label="待审核" value="待审核" />
              </el-select>
            </el-form-item>
            <el-button type="primary" @click="addDataSet"> 新增数据集 </el-button>
          </el-form>
        </div>
        <div class="table-content">
          <TableCustom
            :columns="columns"
            :tableData="tableDataFilter"
            :pageSizes="[10, 20, 50, 100]"
            :pageSize="paramsObj.per_page"
            :layouts="'total, sizes, prev, pager, next, jumper'"
            :currentPage="paramsObj.page"
            :total="total"
            @changePage="changeCurrentPage"
            @changeSize="changeSizePage"
            :viewFunc="handleView"
            :editFunc="handleEdit"
            :delFunc="handleDelete"
            :checkFunc="handleCheck"
            :isShowCheck="true"
            :isShowEdit="isShowEdit"
            :isShowDownload="isShowDownload"
            @downloadId="downloadDataSet"
            :isShowUpload="isShowUpload"
            @uploadFile="getFileInfo"
          ></TableCustom>
        </div>
        <el-dialog
          :title="isEdit ? '编辑数据集' : '新增数据集'"
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
            @changeEmit="handleDatasetChange"
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
          <FileUpload @uploading="getLoading" />
        </el-dialog>
        <DirectoryPreview
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
import {
  getDatasets,
  addDataSets,
  getdatasetDetail,
  getUpdateDatasetDetail,
  deleteDatasetDetail,
  downLoadDataset,
  auditDataset,
  getDataSetlist,
  getDatasetType,
} from '@/api';
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
const isShowDownload = ref(true);
const isShowUpload = ref(true);
const directoryData = ref([]);
const selectOptions = ref([]);
const childOptions = ref([]);
const total = ref(0);
const datasetParent = ref({});
const errMsg = ref('');
const form = reactive({
  name: '', // 数据集名称
  scenario: '', //应用场景
  type: '', //数据集类型
  childType: '', //子任务类型
  status: '', //数据集状态
});

// 新增/编辑弹窗相关
let dialogOptions = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '数据集名称', prop: 'name', required: true },
    { type: 'input', label: '数据集场景', prop: 'scenario', required: true },
    {
      type: 'select',
      label: '数据集类型',
      opts: selectOptions,
      prop: 'type',
      required: true,
      placeholder: '数据集类型',
    },
    {
      type: 'select',
      label: '子任务类型',
      opts: childOptions,
      prop: 'dataset_format',
      required: true,
      placeholder: '子任务类型',
    },
    { type: 'input', label: '样本数量', prop: 'sample_count', required: true },
    { type: 'input', label: '上传类型', prop: 'upload_type', required: false },
    { type: 'input', label: '数据集格式', prop: 'dataset_format', required: true },
  ],
});
// 表格相关
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'name', label: '数据集名称' },
  { prop: 'type', label: '类型' },
  { prop: 'scenario', label: '应用场景' },
  { prop: 'is_preset', label: '是否预制数据集' },
  { prop: 'status', label: '状态' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 480 },
]);

function handleScenarioClear() {
  form.scenario = '';
}

function handleStatusClear() {
  form.status = '';
}

function handleTypeClear() {
  form.type = '';
}

const addDataSet = () => {
  visible.value = true;
  isUpdate.value = false;
};

const rowData = ref({});
const handleEdit = (row: any) => {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
  isUpdate.value = true;
  getDatasetType();

  // 回显数据集
  getdatasetDetail(rowData.value.id).then((res) => {});
};

const handleCheck = (row: {}) => {
  const params = { review_status: 'approved', review_comment: '审核通过' };
  auditDataset(row.id, params).then((res) => {
     ElMessage.success(`审核数据集${row.name}成功`);
  });
};

const closeEvent = (event) => {
  isVisable.value = event;
};

const handleView = (row: {}) => {
  getDataSetlist(row.id).then((res) => {
    directoryData.value = [
      {
        id: '21',
        label: res.data.data.files[0].name,
        type: 'file',
        ext: 'md',
      },
    ];
  });
  isVisable.value = true;
};

const downloadDataSet = (id) => {
  window.open(`/rest/api4/api/datasets/${id}/download`, '_blank');
};

function getFileInfo(info) {
  fileUploadVisible.value = true;
}

function getLoading(isloading) {
  fileUploadVisible.value = isloading;
}

const handleDelete = (row) => {
  deleteDatasetDetail(row.id).then((res) => {
    ElMessage.success(`删除数据集${row.name}成功`);
  });
};

const updateData = () => {};
const paramsObj = reactive({
  page: 1,
  per_page: 10,
  type: 'all',
  status: 'all',
  is_preset: 'all',
  username: localStorage.getItem('vuems_name'),
});

// 获取数据集列表
function getDatasetTypes() {
  getDatasetType().then((res) => {
    datasetParent.value = res.data;
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

// 创建/更新数据集
function getChildDatas(val) {
  // addParams.value = val;
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
      description: val.description,
    })
      .then((res) => {
        getDatasetsLIst();
        ElMessage.success('修改数据集成功');
        visible.value = false;
        loading.value = false;
        isUpdate.value = false;
      })
      .catch((err) => {
        ElMessage.error(`修改数据集失败`);
      });
  } else {
    // 添加数据集
    const params = {
      name: val.name,
      scenario: val.scenario,
      sample_count: val.sample_count,
      type: val.type,
      username: 'admin',
      dataset_format: 'mcq',
    };

    addDataSets(params)
      .then((res) => {
        visible.value = false;
        loading.value = false;
        ElMessage.success(`添加数据集${val.name}成功`);
        getDatasetsLIst();
      })
      .catch((err) => {
        ElMessage.error(`添加数据集失败`);
      });
  }
}

function changeCurrentPage(val: number) {
  paramsObj.page = val;
  getDatasetsLIst();
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
  // paramsObj.page = val;
  getDatasetsLIst();
}

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

onMounted(() => {
  getDatasetsLIst();
  getDatasetTypes();
});

// 获取数据集列表
function getDatasetsLIst() {
  getDatasets(paramsObj)
    .then((res) => {
      if (res && res.data) {
        tableData.value = res.data.datasets;
        res.data.datasets.forEach((item) => {
          const endIndex = item.created_at.indexOf('T');
          item.created_at = item.created_at.substring(0, endIndex);
          item.is_preset = item.is_preset ? '是' : '否';
        });
        total.value = res.data.total;
      }
    })
    .catch((err) => {
      ElMessage.error(`修改数据集失败`);
    });
}

const tableDataFilter = computed(() => {
  const filters = tableData.value.filter((item) => {
    // 转换为小写进行不区分大小写的匹配
    const namefilter = item.name.toLowerCase().includes(form.name?.toLowerCase());
    const scenariofilter = item.scenario
      .toLowerCase()
      .includes(form.scenario?.toLowerCase());
    const typeFilter = item.type.toLowerCase().includes(form.type?.toLowerCase());
    const statusFilter = item.status.toLowerCase().includes(form.status?.toLowerCase());
    // const three = namefilter && typeFilter && accountFilter;
    return namefilter && scenariofilter && typeFilter && statusFilter;
  });
  total.value = filters?.length;
  return filters;
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
    margin-top: 50px;
    padding: 10px 20px;
    width: 100%;
    background: #fff;
  }

  .selecct-width {
    width: 320px;
  }
}
</style>
