import request from '../utils/request';
// 获取数据集管理
export const getDatasets = (query: any) => {
  return request({
    url: 'rest/api4/api/datasets',
    method: 'get',
    params: query,
  });
};

// 创建数据集管理
export const addDataSets = (query: any) => {
  return request({
    url: 'rest/api4/api/datasets',
    method: 'post',
    data: query,
  });
};

// 获取数据集详情/编辑查找数据集
export const getdatasetDetail = (id: string) => {
  return request({
    url: 'rest/api4/api/datasets/' + id,
    method: 'get',
  });
};

// 更新数据集
export const getUpdateDatasetDetail = (id: string, query: any) => {
  return request({
    url: 'rest/api4/api/datasets/' + id,
    method: 'put',
    data: query,
  });
};

// 删除数据集
export const deleteDatasetDetail = (id: any) => {
  return request({
    url: `rest/api4/api/datasets/${id}`,
    method: 'delete',
  });
};

// 上传数据集文件
export const uploadDataset = () => {
  return request({
    url: 'rest/api4/api/datasets/{id}/upload',
    method: 'post',
  });
};

// 下载数据集文件
export const downLoadDataset = (id: any) => {
  return request({
    url: `rest/api4/api/datasets/${id}/download`,
    method: 'get',
    responseType: 'blob',
  });
};

// 审核数据集文件
export const auditDataset = (id: any, params: any) => {
  return request({
    url: `rest/api4/api/datasets/${id}/review`,
    method: 'post',
    data: params,
  });
};

// 文件上传
export const uploadfileDataset = (query: any) => {
  return request({
    url: `rest/api4/api/datasets/{id}/upload`,
    method: 'post',
    data: query,
  });
};

// 获取数据集文件列表
export const getDataSetlist = (dataset_id: any) => {
  return request({
    url: `rest/api4/api/datasets/${dataset_id}/files`,
    method: 'get',
  });
};

// 获取模型列表
export const getModelList = (query: any) => {
  return request({
    url: 'rest/api4/api/models',
    method: 'get',
    params: query,
  });
};

// 获取指定模型的详细信息
export const getModelDetail = (id: any) => {
  return request({
    url: `rest/api4/api/models/${id}`,
    method: 'get',
  });
};

// 创建模型
export const createModel = (query: any) => {
  return request({
    url: 'rest/api4/api/models',
    method: 'post',
    data: query,
  });
};

// 更新模型
export const updateModel = (id: string, query: any) => {
  return request({
    url: 'rest/api4/api/models/' + id,
    method: 'put',
    data: query,
  });
};

// 删除模型
export const delModel = (id: string) => {
  return request({
    url: 'rest/api4/api/models/' + id,
    method: 'delete',
  });
};

// 获取模型版本列表
export const getModelVersionList = (id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions`,
    method: 'get',
  });
};

// 设置当前版本为默认版本
export const setDefaultVersion = (id: any, version_id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions/${version_id}/set-current`,
    method: 'post',
  });
};

// 创建模型版本
export const createModelVersion = (id: any, params: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions`,
    method: 'post',
    data: params,
  });
};

// 获取模型版本详情
export const getModelVersionDetail = (id: any, version_id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions/${version_id}`,
    method: 'get',
  });
};

// 删除模型版本
export const delModelVersion = (id: any, version_id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions/${version_id}`,
    method: 'delete',
  });
};

// 修改模型版本
export const updateModelVersion = (id: any, version_id: any, params: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions/${version_id}`,
    method: 'put',
    data: params,
  });
};

// 测试模型服务链接
export const testConnection = (id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/test-connection`,
    method: 'post',
  });
};

// 测试指定版本连接
export const testVersionConnection = (id: any, version_id: any) => {
  return request({
    url: `rest/api4/api/models/${id}/versions/${version_id}/test-connection`,
    method: 'post',
  });
};

// 获取数据集类型
export const getDatasetType = () => {
  return request({
    url: 'rest/api4/api/datasets/categories',
    method: 'get',
  });
};

// 获取模型服务类型
export const getModelType = () => {
  return request({
    url: 'rest/api4/api/models/service-types',
    method: 'get',
  });
};

// 获取模型服务类型
export const getindicators = () => {
  return request({
    url: 'rest/api4/api/indicators',
    method: 'get',
  });
};

// 获取评测任务列表
export const getTaskslist = (query: any) => {
  return request({
    url: 'rest/api4/api/tasks',
    method: 'get',
    params: query,
  });
};

//创建评测任务
export const createTaskslist = (params: any) => {
  return request({
    url: 'rest/api4/api/tasks/eval-system',
    method: 'post',
    data: params,
  });
};

export const deleteTask = (id: number) => {
  return request({
    url: `rest/api4/api/tasks/${id}`,
    method: 'delete',
  });
};

//创建评测任务
export const getTaskDetail = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}`,
    method: 'get',
  });
};

// 运行评测任务
export const runTask = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/run`,
    method: 'post',
  });
};

// 停止评测任务
export const stopTask = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/stop`,
    method: 'post',
  });
};

// 获取任务状态 已有
export const getTaskStatus = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/status`,
    method: 'get',
  });
};

// 获取任务结果
export const getTasksResults = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/results`,
    method: 'get',
  });
};

// 获取任务日志
export const getTasksLogs = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/logs`,
    method: 'get',
  });
};

// 实时日志流
export const getTasksLogStream = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/logs/stream`,
    method: 'get',
  });
};

// 获取任务报告
export const getTasksReport = (id: any) => {
  return request({
    url: `rest/api4/api/tasks/${id}/report`,
    method: 'get',
    responseType: 'blob',
    // responseType: 'arraybuffer',
    // headers: { 'Content-Type': 'application/pdf' },
  });
};

// 获取模型列表
export const getJudgeModels = () => {
  return request({
    url: 'rest/api4/api/judge-models',
    method: 'get',
  });
};
