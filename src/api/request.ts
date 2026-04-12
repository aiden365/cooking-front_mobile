import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  success?: boolean
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
    const serverMessage =
      typeof error.response?.data === 'object' && error.response?.data !== null
        ? String((error.response.data as { message?: string }).message || '')
        : ''
    const message = serverMessage || error.message || '网络异常，请稍后再试'

    let err = new Error(message);
    console.log("接口请求失败", err);
    return Promise.reject(new Error(message))
  },
)

export function request<T>(config: AxiosRequestConfig) {
  return service.request<ApiResponse<T>>(config).then((response) => {
    const { data } = response

    if (![0, 200].includes(data.code)) {
        debugger;
      let err = new Error(data.message || '请求失败');
      console.log("接口请求失败", err);
      return Promise.reject(err);
    }

    return data
  })
}

export default service
