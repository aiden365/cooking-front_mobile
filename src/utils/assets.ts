const DEFAULT_BACKEND_BASE_URL = 'http://127.0.0.1:8082'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function getBackendBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL

  if (typeof envBaseUrl === 'string' && envBaseUrl.trim()) {
    return trimTrailingSlash(envBaseUrl.trim())
  }

  return DEFAULT_BACKEND_BASE_URL
}

export function resolveAssetUrl(path?: string | null) {
  if (!path) {
    return ''
  }

  const normalizedPath = path.trim()

  if (!normalizedPath) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:') || normalizedPath.startsWith('blob:')) {
    return normalizedPath
  }

  const backendBaseUrl = getBackendBaseUrl()
  const resourcePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`

  return `${backendBaseUrl}${resourcePath}`
}

export function getBackendBaseUrlForDisplay() {
  return getBackendBaseUrl()
}
