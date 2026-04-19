// ===========================
// Mock 菜谱数据
// 8 道经典中式家常菜
// ===========================

export const categories = [
  { id: 'all', name: '全部', emoji: '🍽️' },
  { id: 'meat', name: '肉菜', emoji: '🥩' },
  { id: 'veggie', name: '素菜', emoji: '🥬' },
  { id: 'soup', name: '汤羹', emoji: '🍲' },
  { id: 'staple', name: '主食', emoji: '🍚' },
  { id: 'dessert', name: '甜品', emoji: '🍮' }
]

export const recipes = [
  {
    id: 'r001',
    title: '红烧肉',
    subtitle: '肥而不腻 入口即化',
    category: 'meat',
    author: '外婆的味道',
    cover: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    time: 90,
    difficulty: '中等',
    servings: 4,
    tags: ['经典', '下饭菜', '家宴'],
    likes: 2847,
    description: '一道传承三代的红烧肉做法，关键在于冰糖炒色和文火慢炖。肥瘦相间的五花肉在酱香中收汁，色泽红亮，咬一口，油脂与胶原蛋白化在舌尖。',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '1勺' },
      { name: '料酒', amount: '3勺' },
      { name: '八角', amount: '2颗' },
      { name: '桂皮', amount: '1小块' },
      { name: '姜片', amount: '4片' }
    ],
    steps: [
      { text: '五花肉切2厘米见方的块，冷水下锅焯水，加料酒和姜片，煮5分钟捞出沥干。' },
      { text: '锅中放少许油，小火下冰糖慢慢炒化，待糖色变成琥珀红色，立即下肉块翻炒上色。' },
      { text: '加入生抽、老抽、料酒、八角、桂皮，加开水没过肉块。' },
      { text: '大火烧开后转最小火，盖盖炖1小时，期间翻动两次。' },
      { text: '最后开大火收汁，汤汁浓稠裹住肉块即可出锅。' }
    ]
  },
  {
    id: 'r002',
    title: '番茄炒蛋',
    subtitle: '国民家常 永远的慰藉',
    category: 'veggie',
    author: '厨房新手',
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    time: 15,
    difficulty: '简单',
    servings: 2,
    tags: ['快手', '下饭', '新手'],
    likes: 5621,
    description: '最朴素的搭配，却是最治愈的味道。酸甜的番茄裹着松软的炒蛋，配一碗白米饭，就是家。',
    ingredients: [
      { name: '番茄', amount: '3个' },
      { name: '鸡蛋', amount: '4个' },
      { name: '白糖', amount: '1勺' },
      { name: '盐', amount: '适量' },
      { name: '葱花', amount: '少许' }
    ],
    steps: [
      { text: '番茄顶部划十字刀，开水烫30秒去皮，切成小块。' },
      { text: '鸡蛋打散，加少许盐搅匀。锅中放油，大火快速炒成松软蛋块盛出。' },
      { text: '锅中再放少许油，下番茄块炒出汁水，加白糖和盐调味。' },
      { text: '倒入炒好的鸡蛋翻炒均匀，撒葱花出锅。' }
    ]
  },
  {
    id: 'r003',
    title: '宫保鸡丁',
    subtitle: '糊辣荔枝味 川菜代表',
    category: 'meat',
    author: '川菜小馆',
    cover: 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=800&q=80',
    time: 25,
    difficulty: '中等',
    servings: 3,
    tags: ['川菜', '下饭', '酸甜'],
    likes: 3289,
    description: '正宗川菜，讲究一个"荔枝味"——酸中带甜、甜中带咸。花生的脆、鸡肉的嫩、干辣椒的香，三重口感叠加。',
    ingredients: [
      { name: '鸡胸肉', amount: '300g' },
      { name: '花生米', amount: '80g' },
      { name: '干辣椒', amount: '10个' },
      { name: '花椒', amount: '1勺' },
      { name: '葱白', amount: '2段' },
      { name: '生抽', amount: '2勺' },
      { name: '醋', amount: '2勺' },
      { name: '糖', amount: '1勺' }
    ],
    steps: [
      { text: '鸡胸肉切1厘米方丁，加料酒、生抽、淀粉腌制10分钟。' },
      { text: '花生米冷油下锅，小火慢炸至金黄酥脆，捞出备用。' },
      { text: '调味汁：生抽、醋、糖、淀粉、水混合备用。' },
      { text: '锅中留底油，下干辣椒、花椒爆香，立刻下鸡丁快速翻炒至变色。' },
      { text: '倒入调味汁，大火收汁，下葱白和花生米颠勺出锅。' }
    ]
  },
  {
    id: 'r004',
    title: '西红柿鸡蛋面',
    subtitle: '一碗面 一世界',
    category: 'staple',
    author: '面食大师',
    cover: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&q=80',
    time: 20,
    difficulty: '简单',
    servings: 1,
    tags: ['快手', '早餐', '一人食'],
    likes: 1982,
    description: '深夜归家，煮一碗西红柿鸡蛋面。热汤下肚，一天的疲惫都烟消云散。',
    ingredients: [
      { name: '手擀面', amount: '150g' },
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '2个' },
      { name: '小葱', amount: '2根' },
      { name: '盐', amount: '适量' },
      { name: '香油', amount: '几滴' }
    ],
    steps: [
      { text: '番茄去皮切块，鸡蛋打散备用。' },
      { text: '锅中热油，鸡蛋炒成大块盛出。' },
      { text: '继续用锅中余油炒番茄至出沙，加热水煮开。' },
      { text: '下面条煮至8分熟，加入炒蛋，盐调味。' },
      { text: '出锅前淋香油，撒葱花。' }
    ]
  },
  {
    id: 'r005',
    title: '冬瓜排骨汤',
    subtitle: '清甜回甘 夏日滋补',
    category: 'soup',
    author: '煲汤阿姨',
    cover: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    time: 75,
    difficulty: '简单',
    servings: 4,
    tags: ['养生', '清淡', '汤品'],
    likes: 1456,
    description: '炎夏里，最解暑的一锅汤。冬瓜吸饱了排骨的鲜甜，入口即化。',
    ingredients: [
      { name: '猪肋排', amount: '500g' },
      { name: '冬瓜', amount: '400g' },
      { name: '姜片', amount: '3片' },
      { name: '枸杞', amount: '一小把' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      { text: '排骨冷水下锅焯水，捞出冲洗干净。' },
      { text: '砂锅加足量清水，下排骨和姜片，大火烧开转小火煲40分钟。' },
      { text: '冬瓜去皮切厚片，加入汤中继续煮20分钟。' },
      { text: '出锅前加枸杞、盐调味。' }
    ]
  },
  {
    id: 'r006',
    title: '麻婆豆腐',
    subtitle: '麻辣鲜香 川味一绝',
    category: 'veggie',
    author: '川菜小馆',
    cover: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=800&q=80',
    time: 20,
    difficulty: '中等',
    servings: 2,
    tags: ['川菜', '下饭', '麻辣'],
    likes: 2156,
    description: '麻、辣、烫、香、酥、嫩、鲜、活，八字真言。一勺浇在白米饭上，立刻多吃两碗。',
    ingredients: [
      { name: '嫩豆腐', amount: '1盒' },
      { name: '牛肉末', amount: '100g' },
      { name: '郫县豆瓣酱', amount: '2勺' },
      { name: '花椒粉', amount: '1勺' },
      { name: '蒜末', amount: '3瓣' },
      { name: '葱花', amount: '适量' }
    ],
    steps: [
      { text: '豆腐切2厘米方块，加盐水焯1分钟去豆腥，捞出备用。' },
      { text: '锅中热油，下牛肉末炒散至出油焦香。' },
      { text: '下豆瓣酱、蒜末炒出红油，加半碗高汤烧开。' },
      { text: '下豆腐轻推煮3分钟，用水淀粉勾薄芡。' },
      { text: '出锅撒花椒粉和葱花。' }
    ]
  },
  {
    id: 'r007',
    title: '桂花酒酿圆子',
    subtitle: '江南风物 甜润清香',
    category: 'dessert',
    author: '江南记',
    cover: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80',
    time: 15,
    difficulty: '简单',
    servings: 2,
    tags: ['甜品', '江南', '传统'],
    likes: 876,
    description: '一碗热气腾腾的酒酿圆子，飘着桂花的幽香，是江南人记忆里的秋天。',
    ingredients: [
      { name: '糯米小圆子', amount: '150g' },
      { name: '醪糟', amount: '200g' },
      { name: '鸡蛋', amount: '1个' },
      { name: '干桂花', amount: '1小勺' },
      { name: '冰糖', amount: '20g' }
    ],
    steps: [
      { text: '锅中烧开水，下小圆子煮至浮起。' },
      { text: '加入醪糟和冰糖，轻轻搅拌。' },
      { text: '鸡蛋打散，转小火淋入锅中形成蛋花。' },
      { text: '关火撒上干桂花即可。' }
    ]
  },
  {
    id: 'r008',
    title: '蒜蓉西兰花',
    subtitle: '清脆爽口 快手素菜',
    category: 'veggie',
    author: '轻食主义',
    cover: 'https://images.unsplash.com/photo-1583500178690-f7eb42678fe4?w=800&q=80',
    time: 10,
    difficulty: '简单',
    servings: 2,
    tags: ['快手', '清淡', '健康'],
    likes: 654,
    description: '三分钟上桌的快手菜，蒜香四溢，西兰花翠绿爽脆，减脂期的好朋友。',
    ingredients: [
      { name: '西兰花', amount: '1颗' },
      { name: '大蒜', amount: '5瓣' },
      { name: '生抽', amount: '1勺' },
      { name: '盐', amount: '适量' },
      { name: '橄榄油', amount: '1勺' }
    ],
    steps: [
      { text: '西兰花掰成小朵，用盐水浸泡10分钟后冲洗。' },
      { text: '沸水中加一点盐和油，下西兰花焯水1分钟捞出。' },
      { text: '锅中热油，下蒜末爆香。' },
      { text: '下西兰花翻炒，加生抽和盐调味，快速出锅。' }
    ]
  }
]

// 根据 id 查找菜谱
export function findRecipeById(id) {
  return recipes.find(r => r.id === id)
}

// 根据分类筛选
export function filterByCategory(categoryId) {
  if (categoryId === 'all') return recipes
  return recipes.filter(r => r.category === categoryId)
}
