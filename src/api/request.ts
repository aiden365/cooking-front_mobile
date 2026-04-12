import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'


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

    return Promise.reject(new Error(message))
  },
)

export function request(config: AxiosRequestConfig) {
  return service.request(config).then((response) => {
    const { data } = response

    if (![0, 200].includes(data.code)) {
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return data
  })
}

export default service
