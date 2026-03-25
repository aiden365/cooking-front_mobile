import { request } from './request'

export interface UserProfileForm {
  name: string
  email: string
  gender: '男' | '女' | '保密'
  height: string
  weight: string
}

export function getUserProfile() {
  return request<UserProfileForm>({
    url: '/user/profile',
    method: 'get',
  })
}

export function updateUserProfile(data: UserProfileForm) {
  return request<null>({
    url: '/user/profile',
    method: 'post',
    data,
  })
}
