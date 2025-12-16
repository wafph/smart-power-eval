const HTTP_ERRORS = {
  // HTTP 状态码错误
  400: '请求参数错误',
  401: '未授权，请先登录',
  403: '拒绝访问，权限不足',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '资源冲突',
  413: '请求实体过大',
  414: '请求URI过长',
  415: '不支持的媒体类型',
  422: '参数验证失败',
  429: '请求过于频繁',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

const businessErrorMap = {
  1001: '用户已存在',
  1002: '验证码错误',
  // ... 其他业务错误码
}
const errorMessageMap = {
  'Network Error': '网络错误，请检查网络连接',
  'Request failed with status code 401': '未授权，请重新登录',
  'Request failed with status code 403': '拒绝访问',
  'Request failed with status code 404': '请求的资源不存在',
  'Request failed with status code 500': '服务器内部错误',
  'Only running or pending tasks can be stopped': '只有运行中的任务才可以停止',
  'Task not completed': '任务没有完成',
  'Report file not found': '报告文件没找到'
  // 可以继续添加更多映射
};

export { HTTP_ERRORS, businessErrorMap, errorMessageMap };
