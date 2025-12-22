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
            <el-form-item label="">
              <el-select
                clearable
                filterable
                @clear="handleChildTypeClear"
                allow-create
                v-model="form.dataset_format"
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
          <FileUpload @uploading="getLoading" :getFileIds="fileId" />
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
import { useState } from '@/utils/state';
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
const selectOptions = ref([]);
const childOptions = ref([]);
const total = ref(0);
const fileId = ref(2);
const datasetParent = ref({});
const form = reactive({
  name: '', // 数据集名称
  scenario: '', //应用场景
  type: '', //数据集类型
  dataset_format: '', //子任务类型
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
  { prop: 'operator', label: '操作', width: 400 },
]);

function handleStatusClear() {
  form.status = '';
}

function handleTypeClear() {
  form.type = '';
}
function handleChildTypeClear() {
  form.dataset_format = '';
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

onMounted(() => {
  setCurrentTestTask(false);
});
const getDownLoadDataSet = (row: any) => {
  window.open(`/rest/api4/api/datasets/${row.id}/download`, '_blank');
  // downLoadDataset(row.id).then((response: any) => {
  //   ElMessage.success('下载数据集成功');
  //   const blob = new Blob([response.data], { type: 'application/octet-stream' });
  //   const link = document.createElement('a');
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = '测试文件.json';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   window.URL.revokeObjectURL(link.href);
  // });
};

function getFileInfo(id) {
  fileId.value = id;
  fileUploadVisible.value = true;
}

function getLoading(isloading: boolean) {
  fileUploadVisible.value = isloading;
}

const handleDelete = (row: any) => {
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
  username: localStorage.getItem('vuems_name'),
});

// 获取数据集子类
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
      username: localStorage.getItem('vuems_name'),
      dataset_format: val.dataset_format,
    };

    addDataSets(params).then((res) => {
      visible.value = false;
      loading.value = false;
      ElMessage.success(`添加数据集${val.name}成功`);
      getDatasetsLIst();
    });
  }
}

function changeCurrentPage(val: number) {
  paramsObj.page = val;
  getDatasetsLIst();
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
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
  getDatasets(paramsObj).then((res: any) => {
    if (res && res.data) {
      tableData.value = res.data.datasets;
      res.data.datasets.forEach((item: any) => {
        item.is_preset = item.is_preset ? '是' : '否';
      });
      total.value = res.data.total;
    }
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
    const datasetFormatFilter = item.extension_fields.dataset_format
      .toLowerCase()
      .includes(form.dataset_format?.toLowerCase());
    const statusFilter = item.status.toLowerCase().includes(form.status?.toLowerCase());
    return (
      namefilter && datasetFormatFilter && scenariofilter && typeFilter && statusFilter
    );
  });
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
