import Mock from 'mockjs'

const systemLabels = [
  { id: 1, name: '感冒' },
  { id: 2, name: '发烧' },
  { id: 3, name: '不吃辣' },
  { id: 4, name: '高蛋白' },
  { id: 5, name: '低糖' },
  { id: 6, name: '宿舍党' },
  { id: 7, name: '空气炸锅' },
  { id: 8, name: '汤羹' },
  { id: 9, name: '早餐' },
  { id: 10, name: '下饭菜' },
  { id: 11, name: '不吃香菜' },
  { id: 12, name: '一人食' },
]

export function setupSystemMock() {
  Mock.mock(/\/api\/system\/label$/, 'get', () => ({
    code: 200,
    message: '获取系统标签成功',
    data: systemLabels,
  }))
}
