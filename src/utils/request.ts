import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ElLoading, ElMessage, LoadingParentElement } from 'element-plus';
import { HTTP_ERRORS, errorMessageMap } from '@/utils/errorMapping';
import {
  VNode,
  ComponentPublicInstance,
  ComponentOptionsBase,
  ComponentProvideOptions,
  Ref,
  RendererNode,
  RendererElement,
} from 'vue';
const service: AxiosInstance = axios.create({
  timeout: 5000,
});

let loadingInstance: {
  close: any;
  setText?: (text: string | VNode | VNode[]) => void;
  removeElLoadingChild?: () => void;
  handleAfterLeave?: () => void;
  vm?: ComponentPublicInstance<
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    false,
    ComponentOptionsBase<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      {},
      {},
      string,
      {},
      {},
      {},
      string,
      ComponentProvideOptions
    >,
    {},
    {},
    '',
    {},
    any
  >;
  $el?: HTMLElement;
  originalPosition?: Ref<string, string>;
  originalOverflow?: Ref<string, string>;
  visible?: Ref<boolean, boolean>;
  parent?: Ref<LoadingParentElement, LoadingParentElement>;
  background?: Ref<string, string>;
  svg?: Ref<string, string>;
  svgViewBox?: Ref<string, string>;
  spinner?: Ref<string | boolean, string | boolean>;
  text?: Ref<
    | string
    | VNode<RendererNode, RendererElement, { [key: string]: any }>
    | VNode<RendererNode, RendererElement, { [key: string]: any }>[],
    | string
    | VNode<RendererNode, RendererElement, { [key: string]: any }>
    | VNode<RendererNode, RendererElement, { [key: string]: any }>[]
  >;
  fullscreen?: Ref<boolean, boolean>;
  lock?: Ref<boolean, boolean>;
  customClass?: Ref<string, string>;
  target?: Ref<HTMLElement, HTMLElement>;
  beforeClose?: Ref<(() => boolean) | undefined, (() => boolean) | undefined> | undefined;
  closed?: Ref<(() => void) | undefined, (() => void) | undefined> | undefined;
};
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
    // 对响应数据做处理，例如根据后端返回的code判断业务错误
    // const res = response.data;
    // 假设后端返回的数据格式为 { code: 200, data: {}, message: 'success' }
    // 如果业务成功，则返回data
    if (response.status === 200) {
      return response;
    } else {
       // 业务错误，根据业务错误码映射
      // const errorMessage = businessErrorMap[res.code] || res.message || '请求失败'
      // 显示错误消息
      // ElMessage.error(errorMessage)
      // 返回一个拒绝的Promise，阻止后续then执行
      // return Promise.reject(new Error(errorMessage))
      Promise.reject();
    }
  },
  (error: AxiosError) => {
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      const status = error.response.status;
      const errorMessage =
        HTTP_ERRORS[status] ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error?.message ||
        '请求失败';

      // 特殊处理401，清除token并跳转到登录页
      if (status === 401) {
        // 清除token
        localStorage.removeItem('token');
        // 跳转到登录页
        window.location.href = '/login';
      }

      ElMessage.error(errorMessage);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      // 可能是网络问题或请求被阻止
      ElMessage.error('网络异常，请检查网络连接');
    } else {
      // 在设置请求时发生了某些事情，触发了一个错误
      ElMessage.error('请求配置错误');
    }
    loadingInstance.close();
    return Promise.reject(error);
  },
);

export default service;
