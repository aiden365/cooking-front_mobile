export interface CurrentUserInfo {
  userId: number
  userName: string
}

type StoredUserInfo = {
  id?: number
  userId?: number
  userName?: string
}

export function getCurrentUserInfo(): CurrentUserInfo {
  const rawUserInfo = localStorage.getItem('userInfo')

  if (!rawUserInfo) {
    return {
      userId: 0,
      userName: '',
    }
  }

  try {
    const parsed = JSON.parse(rawUserInfo) as StoredUserInfo

    return {
      userId: Number(parsed.userId || parsed.id || 0),
      userName: String(parsed.userName || '').trim(),
    }
  } catch {
    return {
      userId: 0,
      userName: '',
    }
  }
}
