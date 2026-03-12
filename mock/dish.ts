import Mock from 'mockjs'

const dishes = [
  {
    id: 1,
    name: '番茄鸡胸肉',
    description: '酸甜开胃，适合减脂期工作日晚餐。',
    calories: 286,
    tags: ['高蛋白', '低脂'],
  },
  {
    id: 2,
    name: '山药玉米排骨汤',
    description: '口味清淡，适合全家共享。',
    calories: 318,
    tags: ['营养均衡', '汤品'],
  },
  {
    id: 3,
    name: '西兰花虾仁',
    description: '10 分钟快手菜，富含优质蛋白。',
    calories: 198,
    tags: ['快手菜', '高蛋白'],
  },
]

export function setupDishMock() {
  Mock.mock(/\/api\/dishes\/recommend$/, 'get', () => ({
    code: 200,
    message: '获取推荐菜谱成功',
    data: dishes,
  }))

  Mock.mock(/\/api\/dishes$/, 'get', () => ({
    code: 200,
    message: '获取菜谱列表成功',
    data: {
      list: dishes,
      total: dishes.length,
    },
  }))
}
