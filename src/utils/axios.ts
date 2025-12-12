import axios from 'axios'
import { ElMessage } from 'element-plus'
import { httpErrorMap, businessErrorMap } from './errorMapping'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 根据环境变量设置基础URL
  timeout: 10000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做一些处理，例如添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做处理，例如根据后端返回的code判断业务错误
    const res = response.data

    // 假设后端返回的数据格式为 { code: 200, data: {}, message: 'success' }
    // 如果业务成功，则返回data
    if (res.code === 200) {
      return res.data
    } else {
      // 业务错误，根据业务错误码映射
      const errorMessage = businessErrorMap[res.code] || res.message || '请求失败'
      // 显示错误消息
      ElMessage.error(errorMessage)
      // 返回一个拒绝的Promise，阻止后续then执行
      return Promise.reject(new Error(errorMessage))
    }
  },
  error => {
    // 对HTTP错误进行处理
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      const status = error.response.status
      const errorMessage = httpErrorMap[status] || error.response.data.message || '请求失败'

      // 特殊处理401，清除token并跳转到登录页
      if (status === 401) {
        // 清除token
        localStorage.removeItem('token')
        // 跳转到登录页
        window.location.href = '/login'
      }

      ElMessage.error(errorMessage)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      // 可能是网络问题或请求被阻止
      ElMessage.error('网络异常，请检查网络连接')
    } else {
      // 在设置请求时发生了某些事情，触发了一个错误
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default service