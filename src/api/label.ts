import { request } from './request'
import {UserShareItem} from "./user";

export interface SystemLabel {
  id: number
  labelName: string
}

export interface SystemLabelPage {
  code: number;
  data: {
    records: SystemLabel[];
    total: number;
    current: number;
    size: number;
  };
  message: string;
}

export function getSystemLabels(data:any) {
  return request<SystemLabelPage>({
    url: 'label/page',
    method: 'post',
    data
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
