import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ElLoading, ElMessage } from 'element-plus';
import { HTTP_ERRORS, responseMessageMap, errorMessageMap } from '@/utils/errorMapping';
const service: AxiosInstance = axios.create({
  timeout: 5000,
});

let loadingInstance: any;
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      fullscreen: true,
    });
    return config;
  },
  (error: AxiosError) => {
    loadingInstance.close();
    console.error(error);
    return Promise.reject();
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    loadingInstance.close();
    if (response.status === 200 || response.status === 201) {
      return response;
    } else {
      Promise.reject();
    }
  },
  (error: AxiosError) => {
    console.error(error);
    if (error.response) {
      const status = error.response.status;
      let errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error?.message ||
        HTTP_ERRORS[status] ||
        '请求失败';
      if (errorMessageMap[errorMessage]) {
        errorMessage = errorMessageMap[errorMessage];
      }
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      ElMessage.error(errorMessage);
    } else if (error.request) {
      ElMessage.error('网络异常，请检查网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }
    loadingInstance.close();
    return Promise.reject(error);
  },
);

export default service;
