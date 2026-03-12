import Mock from 'mockjs'

const bannerImages = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
]

const tags = [
  { id: 1, name: '家常菜', color: '#ea580c', background: '#fff1eb' },
  { id: 2, name: '快手菜', color: '#7c3aed', background: '#f4ecff' },
  { id: 3, name: '下饭菜', color: '#b45309', background: '#fff3d6' },
  { id: 4, name: '减脂餐', color: '#15803d', background: '#eaf9ef' },
  { id: 5, name: '烘焙', color: '#ca8a04', background: '#fff7d9' },
  { id: 6, name: '宿舍党', color: '#0f766e', background: '#e9fbf7' },
  { id: 7, name: '无糖', color: '#be185d', background: '#ffeaf3' },
  { id: 8, name: '空气炸锅', color: '#2563eb', background: '#ebf3ff' },
]

const recipes = [
  {
    id: 101,
    title: '荷塘小炒',
    cover: 'https://images.unsplash.com/photo-1512058564366-c9e3e0466c1f?auto=format&fit=crop&w=900&q=80',
    badge: '荷塘小炒',
    video: false,
    author: '麦小厨',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=maidong',
    favoriteCount: '1.2w',
  },
  {
    id: 102,
    title: '皮蛋豆腐',
    cover: 'https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=900&q=80',
    badge: '皮蛋豆腐',
    video: true,
    author: '豆豆爱做饭',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=doudou',
    favoriteCount: '8546',
  },
  {
    id: 103,
    title: '糖醋小排',
    cover: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80',
    badge: '',
    video: true,
    author: '锅气研究所',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=guoqi',
    favoriteCount: '6.8k',
  },
  {
    id: 104,
    title: '抹茶慕斯',
    cover: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    badge: '',
    video: false,
    author: '甜品练习生',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=tianpin',
    favoriteCount: '3208',
  },
  {
    id: 105,
    title: '香煎三文鱼',
    cover: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    badge: '低脂餐',
    video: false,
    author: '海盐厨房',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=haiyan',
    favoriteCount: '5.1k',
  },
  {
    id: 106,
    title: '番茄肥牛卷',
    cover: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    badge: '超下饭',
    video: true,
    author: '阿卷今天吃啥',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ajuan',
    favoriteCount: '9.3k',
  },
  {
    id: 107,
    title: '牛油果酸奶碗',
    cover: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    badge: '',
    video: false,
    author: '轻食实验室',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=qingshi',
    favoriteCount: '4.4k',
  },
  {
    id: 108,
    title: '空气炸锅鸡翅',
    cover: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80',
    badge: '空气炸锅',
    video: true,
    author: '宿舍也能开火',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sushe',
    favoriteCount: '1.6w',
  },
  {
    id: 109,
    title: '蒜蓉西兰花',
    cover: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    badge: '',
    video: false,
    author: '菜园子日记',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=caiyuan',
    favoriteCount: '2760',
  },
  {
    id: 110,
    title: '豆乳盒子',
    cover: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
    badge: '零失败',
    video: false,
    author: '甜口星人',
    authorAvatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=tiankou',
    favoriteCount: '7.7k',
  },
]

export function setupHomeMock() {
  Mock.mock(/\/api\/home\/config$/, 'get', () => ({
    code: 200,
    message: '获取首页配置成功',
    data: {
      banners: bannerImages,
      plans: [
        { id: 'breakfast', label: '早餐', value: '三明治' },
        { id: 'lunch', label: '午餐', value: '韭菜炒虾仁' },
        { id: 'dinner', label: '晚餐', value: '土豆泥拌面' },
      ],
      tags,
    },
  }))

  Mock.mock(/\/api\/home\/recipes(\?.*)?$/, 'get', ({ url }) => {
    const currentUrl = new URL(url, 'https://mock.local')
    const page = Number(currentUrl.searchParams.get('page') || 1)
    const pageSize = Number(currentUrl.searchParams.get('pageSize') || 4)
    const start = (page - 1) * pageSize
    const list = recipes.slice(start, start + pageSize)

    return {
      code: 200,
      message: '获取首页菜谱成功',
      data: {
        list,
        page,
        pageSize,
        hasMore: start + pageSize < recipes.length,
      },
    }
  })
}
