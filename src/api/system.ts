import { request } from './request'

export function uploadFile(file: File, pathType: string | "user_share_path") {
  const formData = new FormData()
  formData.append('pathType', pathType)
  formData.append('file', file)

  return request<string>({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
