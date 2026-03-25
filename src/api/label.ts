import { request } from './request'

export interface SystemLabel {
  id: number
  name: string
}

export interface UserLabelPayload {
  userId: number
  labelIds: number[]
}

export function getSystemLabels() {
  return request<SystemLabel[]>({
    url: '/system/label',
    method: 'get',
  })
}

export function getUserLabels(userId: number | string) {
  return request<number[]>({
    url: `/user/label/${userId}`,
    method: 'get',
  })
}

export function updateUserLabels(data: UserLabelPayload) {
  return request<null>({
    url: '/user/label',
    method: 'post',
    data,
  })
}
