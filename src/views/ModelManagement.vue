<template>
  <div class="data-container">
    <h2>模型管理</h2>
    <p>管理所有AI模型，包括语义模型，视觉模型，科学计算模型，多模态模型和时序模型</p>
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="模型管理" name="model">
        <div class="form-top">
          <el-form :inline="true" :model="form" class="demo-form-inline">
            <el-form-item label="模型名称">
              <el-input v-model="form.name" placeholder="搜索模型名称" />
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
                <el-option label="就绪" value="就绪" />
              </el-select>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="addModels"> 创建模型 </el-button>
        </div>
        <div class="bottom-content">
          <div class="bottom-box">
            <div class="table-content">
              <el-tabs
                v-model="activeName"
                default-value="first"
                class="demo-tabs"
                @tab-click="handleClick"
              >
                <TableCustom
                  :columns="columns"
                  :tableData="activeName === 'first' ? pageData : tableDataTypeFilter"
                  :total="
                    activeName === 'first'
                      ? tableDataFilter.length
                      : tableDataTypeFilter.length
                  "
                  @changePage="changeCurrentPage"
                  @changeSize="changeSizePage"
                  :delFunc="handleDelete"
                  :editFunc="handleEdit"
                  :versionFn="getVersionList"
                  :isShowVersion="true"
                  :viewFunc="handleView"
                  :isShowTest="true"
                  @versionId="getVersionId"
                  @connectionId="getConnectionId"
                ></TableCustom>
                <el-tab-pane
                  v-for="tab in tabs"
                  :key="tab.name"
                  :label="tab.label"
                  :name="tab.name"
                >
                </el-tab-pane>
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
          <div style="padding: 10px">
            <TableCustom
              :columns="columnsVersion"
              :tableData="tableDataVersion"
              :setDefaultFn="handleDefaultVersion"
              :total="totalVersion"
              :delFunc="handleDeleteVersion"
              :viewFunc="handleViewVersion"
              :editFunc="handleEditVersion"
              :isShowDefault="true"
              :isShowTest="false"
              @connectionId="getConnectionVersionId"
            ></TableCustom>
            <el-button type="primary" @click="createVersions" style="margin-top: 50px">
              创建模型版本
            </el-button>
          </div>
          <el-dialog
            :title="isEditVersion ? '修改模型版本' : '创建模型版本'"
            v-model="visibleCreateVersion"
            width="800px"
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
            width="80%"
            destroy-on-close
          >
            <TableDetail :data="viewData"></TableDetail>
          </el-dialog>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="镜像管理" name="mirror">
        <div class="form-top">
          <el-form :inline="true" :model="form" class="demo-form-inline">
            <el-form-item label="模型名称">
              <el-input v-model="form.name" placeholder="搜索模型名称" />
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="addMirrors"> 创建模型镜像 </el-button>
        </div>
        <div class="bottom-content">
          <div class="bottom-box">
            <div class="table-content">
              <TableCustom
                :columns="columns"
                :tableData="MirrorData"
                :total="total"
                @changePage="changeCurrentPage"
                @changeSize="changeSizePage"
                :delFunc="handleDel"
                :editFunc="handleEdit"
                :versionFn="getVersionList"
                :isShowVersion="true"
                :viewFunc="handleView"
                @versionId="getVersionId"
                @connectionId="getConnectionId"
              ></TableCustom>
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
          :title="isEdit ? '编辑镜像' : '创建镜像'"
          v-model="visible"
          width="700px"
          destroy-on-close
          :close-on-click-modal="false"
          @close="closeDialog"
          draggable
        >
          <TableEdit
            :form-data="rowData"
            :options="dialogOptions2"
            :edit="isEdit"
            @saveEdit="getChildDatas"
            :update="updateData"
            :isSystem="true"
          />
        </el-dialog>

        <el-dialog
          title="镜像版本列表"
          v-model="visibleVersion"
          width="80%"
          destroy-on-close
          :close-on-click-modal="false"
          @close="closeDialog"
          draggable
        >
          <div style="padding: 10px">
            <TableCustom
              :columns="columnsMirrorVersion"
              :tableData="tableDataVersion"
              :total="totalVersion"
              :delFunc="handleDeleteVersion"
              :viewFunc="handleViewVersion"
              :editFunc="handleEditVersion"
              :isShowTest="false"
              @connectionId="getConnectionVersionId"
              :isShowDownload="true"
              :downLoadFn="getDownLoadMirror"
            ></TableCustom>
            <el-button type="primary" @click="createVersions" style="margin-top: 50px">
              创建镜像版本
            </el-button>
          </div>
          <el-dialog
            :title="isEditVersion ? '修改镜像版本' : '创建镜像版本'"
            v-model="visibleCreateVersion"
            width="800px"
            destroy-on-close
            :close-on-click-modal="false"
            @close="closeDialog"
            draggable
          >
            <TableEdit
              :form-data="rowData"
              :options="dialogMirrorOptions"
              :edit="isEditVersion"
              @saveEdit="getChildDatasVersion"
              :update="updateData"
              :isSystem="true"
            />
          </el-dialog>
          <el-dialog
            title="查看镜像版本详情"
            v-model="versionDetailVisible"
            width="80%"
            destroy-on-close
          >
            <TableDetail :data="viewData"></TableDetail>
          </el-dialog>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { FormOption } from '@/types/form-option';
import {
  getModelList,
  getModelMirrorList,
  createModelMirror,
  getModelDetail,
  getMirrorDetail,
  createModel,
  delModel,
  delModelMirror,
  updateModel,
  updateModelMirror,
  getModelVersionList,
  getMirrorlVersionList,
  createModelVersion,
  delModelVersion,
  getModelVersionDetail,
  updateModelVersion,
  testConnection,
  testVersionConnection,
  setDefaultVersion,
  getModelType,
  createMirrorVersion,
  delMirrorVersion,
  updateMirrorVersion,
  getMirrorVersionDetail,
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
const MirrorData = ref([]);
const tableDataVersion = ref([]);
const selectOptions = ref([]);
const loading = ref(false);
const modelId = ref<number>();
const modelType = ref('');
const modelVersion = ref([]);
const childOptions = ref([]);
import { ElMessage } from 'element-plus';
import { totalmem } from 'node:os';
const activeTab = ref('model');
const form = reactive({
  industryNature: '',
  name: '',
  type: '',
  status: '',
});

const tabs = ref([
  { label: '全部模型', name: 'first' },
  { label: '语义模型', name: '语义模型' },
  { label: '视觉模型', name: '视觉模型' },
  { label: '多模态模型', name: '多模态模型' },
  { label: '时序模型', name: '时序模型' },
  { label: '科学计算模型', name: '科学计算模型' },
]);

const viewData = ref({
  row: {},
  list: [{}],
});

// 查看模型获取指定模型的详细信息
const handleView = (row: any) => {
  if (activeTab.value === 'model') {
    getModelDetail(row.id).then((res) => {
      viewData.value.row = res.data;
      if (res.data) {
        modelDetailVisible.value = true;
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
          {
            prop: 'created_at',
            label: '创建时间',
          },
        ];
      }
    });
  } else {
    getMirrorDetail(row.id).then((res) => {
      viewData.value.row = res.data;
      if (res.data) {
        modelDetailVisible.value = true;
        viewData.value.list = [
          {
            prop: 'name',
            label: '镜像模型名称',
          },
          {
            prop: 'type',
            label: '镜像模型类型',
          },
          {
            prop: 'is_preset',
            label: '是否预制模型',
          },
          {
            prop: 'status',
            label: '镜像状态',
          },
          {
            prop: 'description',
            label: '镜像描述',
          },
          {
            prop: 'created_at',
            label: '创建时间',
          },
        ];
      }
    });
  }
};

// 查看模型版本
const handleViewVersion = (row: any) => {
  viewData.value.row = { ...row };
  if (activeTab.value === 'model') {
    // 此处1应该是模型id
    getModelVersionDetail(modelId.value, row.id).then((res) => {
      const detailObj = res.data?.version;
      if (detailObj) {
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
      }
      versionDetailVisible.value = true;
    });
  } else {
    getMirrorVersionDetail(modelId.value, row.id).then((res) => {
      const detailObj = res.data?.version;
      if (detailObj) {
        viewData.value.list = [
          {
            prop: 'image_model_name',
            label: '模型名称',
          },
          {
            prop: 'image_name',
            label: '镜像名称',
          },
          {
            prop: 'image_description',
            label: '镜像描述',
          },
          {
            prop: 'metadata',
            label: '元数据',
          },
          {
            prop: 'file_path',
            label: '文件路径',
          },
          {
            prop: 'file_name',
            label: '文件名称',
          },
          {
            prop: 'file_format',
            label: '文件格式',
          },
          {
            prop: 'file_size',
            label: '文件大小',
          },
          {
            prop: 'created_at',
            label: '创建时间',
          },
          {
            prop: 'status',
            label: '状态',
          },
        ];
      }
      versionDetailVisible.value = true;
    });
  }
};
// 表格相关
let columns = ref([
  { prop: 'name', label: '模型名称' },
  { prop: 'type', label: '模型类型' },
  { prop: 'status', label: '状态' },
  { prop: 'description', label: '描述' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 420 },
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

// 镜像版本表格
let columnsMirrorVersion = ref([
  { prop: 'image_model_name', label: '模型名称' },
  { prop: 'image_name', label: '镜像名称' },
  { prop: 'image_description', label: '镜像描述' },
  { prop: 'version', label: '镜像版本' },
  { prop: 'status', label: '状态' },
  { prop: 'metadata', label: '元数据' },
  { prop: 'file_path', label: '文件地址' },
  { prop: 'file_name', label: '文件名称' },
  { prop: 'file_format', label: '文件格式' },
  { prop: 'file_size', label: '文件d大小' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operator', label: '操作', width: 360 },
]);

// 创建/编辑弹窗相关
let dialogOptions = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '模型名称', prop: 'name', required: true },
    { type: 'input', label: '模型描述', prop: 'description', required: true },
    {
      type: 'select1',
      label: '模型类型',
      opts: selectOptions,
      prop: 'type',
      required: true,
      placeholder: '模型类型',
    },
  ],
});

//  创建/编辑镜像弹窗相关
let dialogOptions2 = ref<FormOption>({
  labelWidth: '130px',
  span: 12,
  list: [
    { type: 'input', label: '镜像模型名称', prop: 'name', required: true },
    { type: 'input', label: '镜像模型描述', prop: 'description', required: true },
  ],
});

// 创建/编辑版本弹窗相关
let dialogVersionOptions = ref<FormOption>({
  labelWidth: '120px',
  span: 12,
  list: [
    { type: 'input', label: '模型名称', prop: 'model_name', required: true },
    { type: 'input', label: '版本描述', prop: 'description', required: true },
    {
      type: 'select1',
      label: '子服务类型',
      opts: childOptions,
      prop: 'service_type',
      required: true,
      disabled: isEditVersion,
      placeholder: '服务类型',
    },
    { type: 'input', label: '服务地址', prop: 'service_url', required: true },
    { type: 'input', label: 'API密钥', prop: 'api_key', required: true },
  ],
});

// 创建/编辑镜像版本弹窗相关
let dialogMirrorOptions = ref<FormOption>({
  labelWidth: '120px',
  span: 12,
  list: [
    { type: 'input', label: '镜像版本名称', prop: 'image_name', required: true },
    { type: 'input', label: '镜像版本描述', prop: 'image_description', required: true },
    { type: 'tag', label: '元数据', prop: 'metadata', required: true },
    { type: 'upload', label: '上传镜像', prop: 'file', required: false },
  ],
});
const rowData = ref({});
const updateData = () => {};
const total = ref(0);
const totalVersion = ref(0);
const handleDelete = (row) => {
  delModel(row.id).then((res) => {
    ElMessage.success(`删除模型${row.name}成功`);
    getModelLists();
  });
};

const handleDel = (row) => {
  delModelMirror(row.id).then((res) => {
    ElMessage.success(`删除模型${row.name}成功`);
    getModelMirrorLists();
  });
};
function changeCurrentPage(val: number) {
  paramsObj.page = val;
  getModelLists();
}

function changeSizePage(val: number) {
  paramsObj.per_page = val;
  getModelLists();
}

function handleDefaultVersion(row: any) {
  setDefaultVersion(modelId.value, row.id).then((res: any) => {
    if (res.data && res.data.message) {
      ElMessage.success(`设置${row.version}版本为默认版本成功`);
    }
  });
}

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
};

function handleDeleteVersion(row: any) {
  if (activeTab.value === 'model') {
    delModelVersion(modelId.value, row.id).then((res) => {
      if (res && res.data) {
        getVersionId(modelId.value);
      }
      ElMessage.success(`删除模型版本${row.model_name}成功`);
    });
  } else {
    delMirrorVersion(modelId.value, row.id).then((res) => {
      if (res && res.data) {
        getVersionId(modelId.value);
      }
      ElMessage.success(`删除镜像版本成功`);
    });
  }
}

function handleSingleClearStatus() {
  form.status = '';
}

const paramsObj = reactive({
  page: 1,
  per_page: 10,
  username: localStorage.getItem('vuems_name') || 'testuser',
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

function addMirrors() {
  visible.value = true;
  isUpdate.value = false;
}
// 获取模型版本列表
async function getVersionList(row: any) {
  modelType.value = row.type;
}

async function getVersionId(id: any) {
  visibleVersion.value = true;
  tableDataVersion.value = [];
  modelId.value = id;
  if (activeTab.value === 'model') {
    const res = await getModelVersionList(id);
    tableDataVersion.value = res.data.versions;
    totalVersion.value = res.data.total;
  } else {
    const res = await getMirrorlVersionList(id);
    tableDataVersion.value = res.data.versions;
    res.data.versions.forEach((item: any) => {
      item.metadata = item.metadata.split(',')
    });
    totalVersion.value = res.data.total;
  }
}
// 测试模型服务连接
async function getConnectionId(id: any) {
  const res = await testConnection(id);
  const test = res.data.message;
  ElMessage.success(`模型服务${test}`);
}

// 测试指定版本连接
async function getConnectionVersionId(versionId: any) {
  const res = await testVersionConnection(1, versionId);
  const test = res.data.message;
  ElMessage.success(`测试指定版本模型服务${test}`);
}

// 模型确认
function getChildDatas(val: any) {
  loading.value = true;
  if (activeTab.value === 'model') {
    if (isUpdate.value) {
      // 更新模型
      updateModel(val.id, {
        name: val.name,
        description: val.description,
        type: val.type,
      }).then(() => {
        getModelLists();
        ElMessage.success('修改模型成功');
        visible.value = false;
        loading.value = false;
        isUpdate.value = false;
      });
    } else {
      // 添加模型
      const params = {
        name: val.name,
        username: localStorage.getItem('vuems_name') || 'testuser',
        type: val.type,
        description: val.description,
      };
      createModel(params)
        .then(() => {
          visible.value = false;
          loading.value = false;
          ElMessage.success(`添加模型${val.name}成功`);
          getModelLists();
        })
        .catch(() => {
          ElMessage.error(`添加模型失败`);
        });
    }
  } else {
    if (isUpdate.value) {
      // 更新镜像
      updateModelMirror(val.id, {
        name: val.name,
        description: val.description,
      }).then(() => {
        getModelMirrorLists();
        ElMessage.success('修改镜像成功');
        visible.value = false;
        loading.value = false;
        isUpdate.value = false;
      });
    } else {
      // 添加镜像
      const params = {
        name: val.name,
        username: localStorage.getItem('vuems_name') || 'testuser',
        type: val.type,
        description: val.description,
      };
      createModelMirror(params)
        .then(() => {
          visible.value = false;
          loading.value = false;
          ElMessage.success(`添加镜像${val.name}成功`);
          getModelMirrorLists();
        })
        .catch(() => {
          ElMessage.error(`添加镜像失败`);
        });
    }
  }
}

// 创建模型版本
function createVersions() {
  isEditVersion.value = false;
  if (activeTab.value === 'model') {
    getModelTypes();
    if (modelType.value === '语义') {
      modelType.value = 'text';
    } else if (modelType.value === '多模态') {
      modelType.value = 'multimodal';
    } else if (modelType.value === '视觉') {
      modelType.value = 'vision';
    } else if (modelType.value === '时序') {
      modelType.value = 'temporal';
    } else if (modelType.value === '可续计算') {
      modelType.value = 'safety';
    }
    setTimeout(() => {
      const a = modelVersion.value[modelType.value][0];
      const keysss = Object.entries(a);
      childOptions.value = keysss.map((item) => ({
        value: item[0],
        label: item[0] + '-' + item[1],
      }));
    }, 1000);
  }
  visibleCreateVersion.value = true;
}

// 模型版本确认
function getChildDatasVersion(val: any) {
  if (activeTab.value === 'model') {
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
      updateModelVersion(modelId.value, val.id, params)
        .then(() => {
          getVersionId(modelId.value);
          ElMessage.success(`修改模型版本成功`);
        })
        .catch(() => {
          ElMessage.error(`修改模型版本失败`);
        })
        .finally(() => {
          visibleCreateVersion.value = false;
        });
    } else {
      // 添加模型版本
      createVersion(val);
    }
  } else {
    if (isEditVersion.value) {
      const formData = new FormData();
      formData.append('file', val.file); // 'file' 是参数名，需与后端约定
      formData.append('image_name', val.image_name);
      formData.append('image_description', val.image_description);
      formData.append('metadata', val.metadata);
      formData.append('username', localStorage.getItem('vuems_name') || 'testuser');
      // 修改镜像版本
      updateMirrorVersion(modelId.value, val.id, formData)
        .then(() => {
          getVersionId(modelId.value);
          ElMessage.success(`修改镜像版本成功`);
        })
        .catch(() => {
          ElMessage.error(`修改镜像版本失败`);
        })
        .finally(() => {
          visibleCreateVersion.value = false;
        });
    } else {
      // 添加镜像版本
      createMirrors(val);
    }
  }
}

// 添加镜像
async function createMirrors(val: any) {
  isEditVersion.value = false;
  const formData = new FormData();
  formData.append('file', val.file); // 'file' 是参数名，需与后端约定
  formData.append('image_name', val.image_name);
  formData.append('image_description', val.image_description);
  formData.append('metadata', val.metadata);
  formData.append('username', localStorage.getItem('vuems_name') || 'testuser');
  const res = await createMirrorVersion(modelId.value, formData);
  getVersionId(modelId.value);
  if (res && res.data.message) {
    ElMessage.success('添加镜像成功');
  }
  visibleCreateVersion.value = false;
}

// 下载镜像文件
const getDownLoadMirror = (row: any) => {
  window.open(
    `/rest/api4/api/model-images/${modelId.value}/versions/${row.id}/download`,
    '_blank',
  );
};

// 添加模型版本
async function createVersion(val: any) {
  const params = {
    description: val.description,
    service_url: val.service_url,
    api_key: val.api_key,
    model_name: val.model_name,
    service_type: childOptions.value[0].value,
  };
  const res = await createModelVersion(modelId.value, params);
  getVersionId(modelId.value);
  if (res && res.data.message) {
    ElMessage.success('添加模型版本成功');
  }
  visibleCreateVersion.value = false;
  loading.value = false;
}
const handleEdit = (row: any) => {
  rowData.value = { ...row };
  isEdit.value = true;
  visible.value = true;
  isUpdate.value = true;
};

const handleEditVersion = (row: any) => {
  isEditVersion.value = true;
  visibleCreateVersion.value = true;
  rowData.value = { ...row };
};

onMounted(() => {
  getModelLists();
  getModelMirrorLists();
});

function getModelTypes() {
  getModelType().then((res: any) => {
    modelVersion.value = res.data;
    const keys = Object.keys(res.data);
    selectOptions.value = keys.map((item) => ({
      value:
        item === 'text'
          ? '语义'
          : item === 'multimodal'
            ? '多模态'
            : item === 'vision'
              ? '视觉'
              : item === 'temporal'
                ? '时序'
                : '科学计算',
      label:
        item === 'text'
          ? '语义'
          : item === 'multimodal'
            ? '多模态'
            : item === 'vision'
              ? '视觉'
              : item === 'temporal'
                ? '时序'
                : '科学计算',
    }));
  });
}

async function getModelLists() {
  const res = await getModelList({
    username: localStorage.getItem('vuems_name') || 'testuser',
  });
  if (res && res.data) {
    tableData.value = res.data.models;
  }
}

async function getModelMirrorLists() {
  const res = await getModelMirrorList({
    username: localStorage.getItem('vuems_name') || 'testuser',
  });
  if (res && res.data) {
    MirrorData.value = res.data.model_images;
    total.value = res.data.total;
  }
}

const tableDataFilter = computed(() => {
  const filters = tableData.value.filter((item) => {
    // 转换为小写进行不区分大小写的匹配
    const namefilter = item.name.toLowerCase().includes(form.name?.toLowerCase());
    const accountFilter = item.status.toLowerCase().includes(form.status?.toLowerCase());
    return namefilter && accountFilter;
  });
  return filters;
});

// 分页数据
const pageData = computed(() => {
  const start = (paramsObj.page - 1) * paramsObj.per_page;
  const end = start + paramsObj.per_page;
  return tableDataFilter.value.slice(start, end);
});

const tableDataTypeFilter = computed(() => {
  const a = tableData.value.filter((item) => {
    if (activeName.value === 'first') {
      return tableData.value;
    } else {
      return item?.type + '模型' === activeName.value;
    }
  });
  total.value = a?.length;
  return a;
});

const handleClick = (tab: TabsPaneContext) => {};
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
  display: flex;
  justify-content: space-between;
  .selecct-width {
    width: 500px;
  }
}

.bottom-content {
  background: #eef0fc;
  flex-direction: column;
  // flex: 1;
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
