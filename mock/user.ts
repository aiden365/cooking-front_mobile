import Mock from 'mockjs'

export function setupUserMock() {
  Mock.mock(/\/api\/user\/profile$/, 'get', () => ({
    code: 200,
    message: '获取用户信息成功',
    data: {
      id: 10001,
      nickname: '小厨同学',
      avatar: Mock.Random.image('120x120', '#F5F5F5', '#333333', 'Avatar'),
      healthGoal: '控制油盐摄入，保持营养均衡',
      allergies: ['花生'],
      favoriteCuisine: ['家常菜', '低脂餐'],
    },
  }))

  Mock.mock(/\/api\/user\/label\/\d+$/, 'get', () => ({
    code: 200,
    message: '获取用户标签成功',
    data: [1, 3, 7, 12],
  }))
}
