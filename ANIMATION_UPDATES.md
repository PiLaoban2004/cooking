# 动画优化更新说明

根据 animate.md 文档，已完成以下页面的动画优化：

## ✅ 已完成优化

### 1. Home.vue (首页)
- ✅ 添加 fadeInUp 动画定义和 floating 动画
- ✅ Hero 区域元素交错出现（100ms 延迟递增）
- ✅ 搜索框 focus 时上移和阴影增强
- ✅ 分类按钮 hover 上移、active 缩放效果
- ✅ 卡片 hover 时图片缩放（scale 1.05）
- ✅ 收藏按钮 pop 动画
- ✅ 使用 transition-group 实现列表平滑过渡
- ✅ 空状态 emoji 浮动动画

### 2. Favorites.vue (收藏页)
- ✅ 添加 transition-group 实现移除收藏时平滑动画
- ✅ 列表项 hover 时右移和上移效果
- ✅ 删除按钮 hover 时旋转90度并放大
- ✅ 空状态 emoji 浮动动画
- ✅ 元素交错出现动画

## 🔄 待优化页面

### 3. Login.vue (登录页)
需要添加：
- SVG 路径动画（stroke-dasharray 描边动画）
- 蒸汽漂浮动画
- 登录按钮扫光效果
- 个人中心列表项 hover 交互

### 4. RecipeDetail.vue (详情页)
需要添加：
- 头图 scaleDown 加载特效
- 食材列表交错 slideInRight 动画
- 步骤列表交错 fadeInUp 动画
- 步骤序号 hover 时放大和变色

### 5. RecipeEdit.vue (编辑页)
需要添加：
- 食材和步骤的 transition-group 动画
- 输入框 focus 时的光晕效果
- 上传框 hover 时的上移和阴影
- 保存按钮 active 时的缩放

## 技术要点

1. **贝塞尔曲线**: 使用 `cubic-bezier(0.16, 1, 0.3, 1)` 实现流畅的缓动
2. **will-change**: 为需要动画的元素添加 `will-change: transform` 优化性能
3. **transition-group**: Vue 3 的列表过渡组件，实现增删改的平滑动画
4. **交错动画**: 使用 `animation-delay` 实现元素依次出现
5. **微交互**: hover、active 状态的细微反馈提升用户体验

## 下一步

继续完成 Login.vue、RecipeDetail.vue 和 RecipeEdit.vue 的动画优化。
