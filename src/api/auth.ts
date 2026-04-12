import { request } from './request'

export interface LoginParams {
  userCode: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
}

export interface LoginResult {
  id: string
  userName: string
  accessToken: string
  expires: string
}

export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/user/login',
    method: 'post',
    data,
  })
}

export function register(data: RegisterParams) {
  return request<{ userId: number }>({
    url: '/auth/register',
    method: 'post',
    data,
  })
}
