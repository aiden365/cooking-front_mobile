import { request } from './request'

export interface LoginParams {
  userCode: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  emailCode: string
}

export interface ForgotPasswordParams {
  email: string
  password: string
  verifyCode: string
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
  return request<LoginResult>({
    url: '/user/register',
    method: 'post',
    data,
  })
}

export function sendEmailCode(data: { email: string }) {
  return request<null>({
    url: '/user/sendEmailCode',
    method: 'post',
    data,
  })
}

export function forgotPassword(data: ForgotPasswordParams) {
  return request<null>({
    url: '/user/forgot-password',
    method: 'post',
    data,
  })
}
