import { request } from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userId: number
  nickname: string
}

export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

export function register(data: LoginParams) {
  return request<{ userId: number }>({
    url: '/auth/register',
    method: 'post',
    data,
  })
}
