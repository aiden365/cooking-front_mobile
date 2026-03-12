import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data
      ? '服务器响应异常'
      : error.message || '网络异常，请稍后再试'

    return Promise.reject(new Error(message))
  },
)

export function request<T>(config: AxiosRequestConfig) {
  return service.request<ApiResponse<T>>(config).then((response) => {
    const { data } = response

    if (data.code !== 200) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return data
  })
}

export default service
