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

const systemNutritions = [
  { id: 1001, nutritionName: '蛋白质', defaultValue: '20g' },
  { id: 1002, nutritionName: '脂肪', defaultValue: '20g' },
  { id: 1003, nutritionName: '碳水化合物', defaultValue: '20g' },
  { id: 1004, nutritionName: '膳食纤维', defaultValue: '25g' },
  { id: 1005, nutritionName: '维生素C', defaultValue: '100mg' },
]

export function setupSystemMock() {
  Mock.mock(/\/api\/system\/label$/, 'get', () => ({
    code: 200,
    message: '获取系统标签成功',
    data: systemLabels,
  }))

  Mock.mock(/\/api\/system\/nutrition$/, 'get', () => ({
    code: 200,
    message: '获取系统营养元素成功',
    data: systemNutritions,
  }))
}
