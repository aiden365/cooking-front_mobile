import { request } from './request'

export interface SystemLabel {
  id: number
  labelName: string
}

export interface SystemLabelPage {
  records: SystemLabel[]
  total: number
  current: number
  size: number
}

export function getSystemLabels(data: { pageNum: number; pageSize: number; search?: string; type?:number }) {
  return request<SystemLabelPage>({
    url: 'label/page',
    method: 'post',
    data,
  })
}

export function getUserLabels() {
  return request<number[]>({
    url: `/user/labels`,
    method: 'post',
  })
}

export function updateUserLabels(data: number[]) {
  return request<null>({
    url: '/user/saveLabels',
    method: 'post',
    data,
  })
}
