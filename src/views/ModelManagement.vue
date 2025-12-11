<template>
  <div class="data-container">
    <h2>模型管理</h2>
    <p>管理所有AI横型，包括语义模型，视觉模型，多模态模型和时序模型</p>
    <div class="form-top">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="模型名称">
          <el-input v-model="form.name" placeholder="搜索模型名称" />
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select
            clearable
            filterable
            @clear="handleSingleClear"
            allow-create
            v-model="form.type"
            placeholder="模型类型"
          >
            <el-option
              v-for="item in selectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模型状态">
          <el-select
            clearable
            filterable
            allow-create
            v-model="form.status"
            @clear="handleSingleClearStatus"
            placeholder="模型状态"
          >
            <el-option label="草稿" value="草稿" />
            <el-option label="已审核" value="已审核" />
            <el-option label="待审核" value="待审核" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button  type="primary" @click="addModels"> 创建模型 </el-button>
    </div>
    <el-row :gutter="20" type="flex">
      <el-col :lg="6" :xs="24" :sm="12">
        <el-card shadow="hover" :body-style="{ height: '166px' }">
          <div class="card-header">
            <div class="left">
              <p>全部模型</p>
              <h1>42</h1>
              <p>较上月增长8%</p>
            </div>
            <img src="../assets/img/1.png" alt="" />
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :xs="24" :sm="12">
        <el-card shadow="hover" :body-style="{ height: '166px' }">
          <div class="card-header">
            <div class="left">
              <p>语义模型</p>
              <h1>42</h1>
              <p>较上月增长6%</p>
            </div>
            <img src="../assets/img/2.png" alt="" />
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :xs="24" :sm="12">
        <el-card shadow="hover" :body-style="{ height: '166px' }">
          <div class="card-header">
            <div class="left">
              <p>视觉模型</p>
              <h1>42</h1>
              <p>较上月增长8%</p>
            </div>
            <img src="../assets/img/3.png" alt="" />
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :xs="24" :sm="12">
        <el-card shadow="hover" :body-style="{ height: '166px' }">
          <div class="card-header">
            <div class="left">
              <p>时序模型</p>
              <h1>42</h1>
              <p style="color: #d9543b">较上月下降8%</p>
            </div>
            <img src="../assets/img/4.png" alt="" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="bottom-content">
      <div class="bottom-box">
        <div class="table-content">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="全部模型" name="first">
              <TableCustom
                :columns="columns"
                :tableData="tableDataFilter"
                :total="total"
                :delFunc="handleDelete"
                :editFunc="handleEdit"
                :isShowVersion="true"
                :viewFunc="handleView"
                :isShowTest="true"
                @versionId="getVersionId"
                @connectionId="getConnectionId"
              ></TableCustom>
            </el-tab-pane>
            <el-tab-pane label="语义模型" name="second">语义测试集</el-tab-pane>
            <el-tab-pane label="视觉模型" name="third">多模态测试集</el-tab-pane>
            <el-tab-pane label="多模态模型" name="fourth">极端工况数据</el-tab-pane>
            <el-tab-pane label="时序模型" name="five">对抗样例数据</el-tab-pane>
          </el-tabs>
          <el-dialog
            title="查看详情"
            v-model="modelDetailVisible"
            width="700px"
            destroy-on-close
          >
            <TableDetail :data="viewData"></TableDetail>
          </el-dialog>
        </div>
      </div>
    </div>
    <el-dialog
      :title="isEdit ? '编辑模型' : '创建模型'"
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
      title="模型版本列表"
      v-model="visibleVersion"
      width="80%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
      draggable
    >
      <div style="padding: 20px">
        <TableCustom
          :columns="columnsVersion"
          :tableData="tableDataVersion"
          :total="totalVersion"
          :delFunc="handleDeleteVersion"
          :viewFunc="handleViewVersion"
          :editFunc="handleEditVersion"
          :isShowTest="true"
          @connectionId="getConnectionVersionId"
        ></TableCustom>
        <el-button type="primary" @click="createVersions" style="margin-top: 50px">
          创建模型版本
        </el-button>
      </div>
      <el-dialog
        :title="isEditVersion ? '修改模型版本' : '创建模型版本'"
        v-model="visibleCreateVersion"
        width="700px"
        destroy-on-close
        :close-on-click-modal="false"
        @close="closeDialog"
        draggable
      >
        <TableEdit
          :form-data="rowData"
          :options="dialogVersionOptions"
          :edit="isEditVersion"
          @saveEdit="getChildDatasVersion"
          :update="updateData"
          :isSystem="true"
        />
      </el-dialog>
      <el-dialog
        title="查看版本详情"
        v-model="versionDetailVisible"
        width="700px"
        destroy-on-close
      >
        <TableDetail :data="viewData"></TableDetail>
      </el-dialog>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { FormOption } from '@/types/form-option';
import {
  getModelList,
  getModelDetail,
  createModel,
  delModel,
  updateModel,
  getModelVersionList,
  createModelVersion,
  delModelVersion,
  getModelVersionDetail,
  updateModelVersion,
  testConnection,
  testVersionConnection,
  getModelType,
} from '@/api';
import type { TabsPaneContext } from 'element-plus';
const activeName = ref('first');
const visible = ref(false);
const visibleVersion = ref(false);
const modelDetailVisible = ref(false);
const visibleCreateVersion = ref(false);
const versionDetailVisible = ref(false);
const isEdit = ref(false);
const isEditVersion = ref(false);
const isUpdate = ref(false);
const tableData = ref([]);
const tableDataVersion = ref([]);
const selectOptions = ref([]);
const loading = ref(false);
const modelId = ref<number>();
import { ElMessage, valueEquals } from 'element-plus';
const form = reactive({
  industryNature: '',
  name: '',
  type: '',
  status: '',
});

const viewData = ref({
  row: {},
  list: [],
});

// 查看模型获取指定模型的详细信息
const handleView = (row: any) => {
  modelDetailVisible.value = true;
  viewData.value.row = { ...row };
  getModelDetail(row.id)
    .then((res) => {
      const detailObj = res.data;
      console.log(detailObj);
      ElMessage.success(`获取${row.name}信息成功`);
    })
    .catch((err) => {
      console.log(err);
      ElMessage.error(`获取${row.name}信息失败`);
    });
  viewData.value.list = [
    {
      prop: 'name',
      label: '模型名称',
    },
    {
      prop: 'type',
      label: '模型类型',
    },
    {
      prop: 'is_preset',
      label: '是否预制模型',
    },
    {
      prop: 'status',
      label: '模型状态',
    },
    {
      prop: 'description',
      label: '模型描述',
    },
    // {
    //   prop: 'service_url',
    //   label: '服务地址',
    // },
    {
      prop: 'created_at',
      label: '创建时间',
    },
  ];
};
// 查看模型版本
const handleViewVersion = (row: any) => {
  viewData.value.row = { ...row };
  // 此处1应该是模型id
  getModelVersionDetail(1, row.id).then((res) => {
    const detailObj = res.data?.version;
    console.log(detailObj);
  });
  viewData.value.list = [
    {
      prop: 'version',
      label: '模型版本',
    },
    {
      prop: 'description',
      label: '版本描述',
    },
    {
      prop: 'status',
      label: '版本状态',
    },
    {
      prop: 'service_type',
      label: '服务类型',
    },
    {
      prop: 'service_url',
      label: '服务地址',
    },
    {
      prop: 'model_name',
      label: '模型名称',
    },
    {
      prop: 'created_at',
      label: '创建时间',
    },
    {
      prop: 'api_key',
      label: 'api键',
    },
  ];
  versionDetailVisible.value = true;
};
// 表格相关
let columns = ref([
  { prop: 'name', label: '模型名称' },
  { prop: 'type', label: '模型类型' },
  // { prop: 'version', label: '版本' },
  // { prop: 'creation_method', label: '创建方式' },
  // { prop: 'data_size_humana', label: '准确率' },
  { prop: 'status', label: '状态' },
  { prop: 'description', label: '描述' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 500 },
]);

// 模型版本表格
let columnsVersion = ref([
  { prop: 'model_name', label: '模型名称' },
  { prop: 'version', label: '版本' },
  { prop: 'status', label: '状态' },
  { prop: 'service_type', label: '服务类型' },
  { prop: 'service_url', label: '服务地址' },
  { prop: 'api_key', label: 'api_key' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 400 },
]);

// 创建/编辑弹窗相关
let dialogOptions = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '模型名称', prop: 'name', required: true },
    { type: 'input', label: '模型描述', prop: 'description', required: true },
    {
      type: 'select',
      label: '模型类型',
      opts: selectOptions,
      prop: 'type',
      required: true,
      placeholder: '模型类型',
    },

    {
      type: 'select',
      label: '创建方法',
      opts: [
        {
          value: 'creation_method',
          label: 'creation_method',
        },
      ],
      prop: 'service_type',
      required: true,
      placeholder: '服务类型',
    },
    { type: 'input', label: '扩展方法', prop: 'extension_fields', required: false },
  ],
});

// 创建/编辑吗版本弹窗相关
let dialogVersionOptions = ref<FormOption>({
  labelWidth: '120px',
  span: 12,
  list: [
    { type: 'input', label: '模型名称', prop: 'model_name', required: false },
    { type: 'input', label: '版本描述', prop: 'description', required: true },
    { type: 'input', label: '服务地址', prop: 'service_url', required: true },
    { type: 'input', label: 'API密钥', prop: 'api_key', required: true },
  ],
});
const rowData = ref({});
const updateData = () => {};
const total = ref(0);
const totalVersion = ref(0);
const handleDelete = (row) => {
  console.log(row.id);
  delModel(row.id).then((res) => {
    ElMessage.success(`删除模型${row.name}成功`);
    getModelLists();
  });
};

function handleDeleteVersion(row) {
  console.log(row.id);
  // 此处1为模型id
  delModelVersion(1, row.id)
    .then((res) => {
      console.log(res);
      ElMessage.success(`删除模型版本${row.model_name}成功`);
    })
    .catch((err) => {
      ElMessage.error(`删除模型版本失败`);
    });
}

function handleSingleClear() {
  form.type = '';
}

function handleSingleClearStatus() {
  form.status = '';
}

const paramsObj = reactive({
  page: 1,
  per_page: 10,
  username: 'admin',
  search: '',
});

function closeDialog() {
  visible.value = false;
  isEdit.value = false;
}
function addModels() {
  getModelTypes();
  visible.value = true;
  isUpdate.value = false;
}

// 获取模型版本列表
async function getVersionId(id) {
  visibleVersion.value = true;
  modelId.value = id;
  id = 1;
  try {
    const res = await getModelVersionList(id);
    tableDataVersion.value = res.data.versions;
    res.data.versions.forEach((item) => {
      const endIndex = item.created_at.indexOf('T');
      item.created_at = item.created_at.substring(0, endIndex);
    });
    totalVersion.value = res.data.total;
  } catch (error) {}
}

// 测试模型服务连接
async function getConnectionId(id) {
  try {
    const res = await testConnection(id);
    console.log(res);
    const test = res.data.message;
    ElMessage.success(`模型服务${test}`);
  } catch (error) {
    console.log(error);
  }
}

// 测试指定版本连接
async function getConnectionVersionId(versionId) {
  console.log(versionId);
  try {
    const res = await testVersionConnection(1, versionId);
    console.log(res);
    const test = res.data.message;
    ElMessage.success(`测试指定版本模型服务${test}`);
  } catch (error) {
    console.log(error);
  }
}

// 模型确认
function getChildDatas(val) {
  loading.value = true;
  console.log(val.id);
  if (isUpdate.value) {
    // 更新模型
    updateModel(val.id, {
      name: val.name,
      description: val.description,
      type: val.type,
    })
      .then((res) => {
        getModelLists();
        ElMessage.success('修改模型成功');
        visible.value = false;
        loading.value = false;
        isUpdate.value = false;
      })
      .catch((err) => {
        ElMessage.error(`修改模型失败`);
      });
  } else {
    // 添加模型
    const params = {
      name: val.name,
      username: localStorage.getItem('vuems_name'),
      type: val.type,
      creation_method: val.creation_method,
      extension_fields: val.extension_fields,
    };

    createModel(params)
      .then((res) => {
        console.log(res);
        visible.value = false;
        loading.value = false;
        ElMessage.success(`添加模型${val.name}信息成功`);
        getModelLists();
      })
      .catch((err) => {
        ElMessage.error(`添加模型失败`);
      });
  }
}

function createVersions() {
  visibleCreateVersion.value = true;
}

// 模型版本确认
function getChildDatasVersion(val) {
  loading.value = true;
  const params = {
    model_name: val.name,
    version: val.version,
    description: val.description,
    status: val.status,
    service_type: val.service_type,
    service_url: val.service_url,
    api_key: val.api_key,
  };
  if (isEditVersion.value) {
    // 修改模型版本
    updateModelVersion(1, val.id, params)
      .then((res) => {
        getVersionId(1);
        ElMessage.success(`修改模型版本成功`);
      })
      .catch((err) => {
        ElMessage.error(`修改模型版本失败`);
      })
      .finally(() => {
        visibleCreateVersion.value = false;
        loading.value = false;
      });
  } else {
    // 添加模型
    createVersion(val);
  }
}

// 添加模型版本
async function createVersion(val) {
  const params = {
    description: val.description,
    service_url: val.service_url,
    api_key: val.api_key,
    model_name: val.model_name,
  };

  try {
    const res = await createModelVersion(1, params);
    console.log(res);
    getVersionId(1);
    ElMessage.success('添加模型版本成功');
    getVersionId(1);
    visibleCreateVersion.value = false;
    loading.value = false;
  } catch (error) {
    ElMessage.success('添加模型版本失败');
  }
}
const handleEdit = (row: any) => {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
  isUpdate.value = true;
    getModelTypes();
};

const handleEditVersion = (row: any) => {
  isEditVersion.value = true;
  visibleCreateVersion.value = true;
  rowData.value = { ...row };
  console.log(rowData.value);
};

onMounted(() => {
  getModelLists();
  getModelTypes();
});

function getModelTypes() {
  getModelType()
    .then((res) => {
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
    })
    .catch((err) => {});
}

async function getModelLists() {
  loading.value = true;
  try {
    const res = await getModelList(paramsObj);
    if (res && res.data) {
      tableData.value = res.data.models;
      total.value = res.data.total;
      console.log(form.name);
      res.data.models.forEach((item) => {
        const endIndex = item.created_at.indexOf('T');
        item.created_at = item.created_at.substring(0, endIndex);
      });
    } else {
      // 处理响应数据为空的情况
      console.warn('响应数据为空');
    }
  } catch (error) {
    console.error('获取模型列表失败:', error);
    // 错误处理逻辑
  } finally {
    loading.value = false;
  }
}

const tableDataFilter = computed(() => {
  const filters = tableData.value.filter((item) => {
    // 转换为小写进行不区分大小写的匹配
    const namefilter = item.name.toLowerCase().includes(form.name?.toLowerCase());
    const phoneFilter = item.type.toLowerCase().includes(form.type?.toLowerCase());
    const accountFilter = item.status.toLowerCase().includes(form.status?.toLowerCase());
    const three = namefilter && phoneFilter && accountFilter;
    return namefilter && phoneFilter && accountFilter;
  });
  total.value = filters?.length;
  return filters;
});

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};
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

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
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

.form-top {
  width: 100%;
  height: 48px;
  margin-bottom: 50px;
  display: flex;
  justify-content: space-between;
  m

  .selecct-width {
    width: 500px;
  }
}

.bottom-content {
  background: #eef0fc;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;

  .bottom-box {
    display: flex;
    flex-direction: column;

    .table-content {
      display: flex;
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 10px;
      padding: 10px 20px;
    }
  }
}
</style>
