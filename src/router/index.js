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
    meta: { title: '寻味', keepAlive: true }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue'),
    meta: { title: '菜谱详情' }
  },
  {
    path: '/edit/:id?',
    name: 'RecipeEdit',
    component: () => import('@/views/RecipeEdit.vue'),
    meta: { title: '编辑菜谱', requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
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

// 登录守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · 寻味`
  }

  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
