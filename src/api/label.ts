import { request } from './request'

export interface SystemLabel {
  id: number
  name: string
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
