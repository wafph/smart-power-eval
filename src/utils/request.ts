import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElLoading, ElMessage } from 'element-plus';
const service: AxiosInstance = axios.create({
  timeout: 5000,
});
let loadingInstance;
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      // background: 'rgba(0, 0, 0, 0.5)',
      fullscreen: true,
    });
    return config;
  },
  (error: AxiosError) => {
    loadingInstance.close();
    console.log(error);
    return Promise.reject();
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    loadingInstance.close();
    if (response.status === 200) {
      return response;
    } else {
      Promise.reject();
    }
  },
  (error: AxiosError) => {
    ElMessage.error(error.response?.data?.error || error.response?.data?.message || error?.message  || '执行结果响应失败');
    loadingInstance.close();
    console.log(error);
    return Promise.reject();
  },
);

export default service;
