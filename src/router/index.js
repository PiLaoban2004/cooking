// ===========================
// 路由配置
// ===========================
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '寻味', keepAlive: true, requiresAuth: true }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue'),
    meta: { title: '菜谱详情', requiresAuth: true }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue'),
    meta: { title: '点菜', requiresAuth: true }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/Menu.vue'),
    meta: { title: '一日三餐', requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/edit/:id?',
    name: 'RecipeEdit',
    component: () => import('@/views/RecipeEdit.vue'),
    meta: { title: '编辑菜谱', requiresAuth: true }
  },
  {
    path: '/family',
    name: 'Family',
    component: () => import('@/views/Family.vue'),
    meta: { title: '家庭成员', requiresAuth: true }
  },
  {
    // 登录页：唯一的公开路由
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// 全局登录守卫：非公开路由一律需要登录
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · 寻味`
  }

  // public: true 的路由（目前只有 /login）直接放行
  if (to.meta.public) {
    next()
    return
  }

  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    // 保存来源，登录成功后跳回
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
