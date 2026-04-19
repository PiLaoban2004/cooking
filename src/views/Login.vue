<template>
  <div class="login">
    <!-- 未登录：登录表单 -->
    <template v-if="!userStore.isLoggedIn">
      <div class="cover">
        <div class="cover__art">
          <!-- 装饰性图案：手绘食材插图 -->
          <svg viewBox="0 0 200 160" class="cover__svg floating" aria-hidden="true">
            <!-- 碗 -->
            <path class="draw-path" d="M 40 80 Q 40 130 100 130 Q 160 130 160 80 Z"
                  fill="none" stroke="#3A2618" stroke-width="2" stroke-linecap="round"/>
            <ellipse class="draw-path" cx="100" cy="80" rx="60" ry="12"
                     fill="none" stroke="#3A2618" stroke-width="2"/>
            <!-- 蒸汽 -->
            <path class="steam" d="M 75 65 Q 72 55 78 45 Q 82 35 75 25"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <path class="steam" style="animation-delay: 0.2s" d="M 100 60 Q 96 50 102 40 Q 108 28 100 18"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <path class="steam" style="animation-delay: 0.4s" d="M 125 65 Q 122 55 128 45 Q 132 35 125 25"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <!-- 碗里的内容 -->
            <circle class="draw-dot" cx="85" cy="85" r="4" fill="#E85D3C"/>
            <circle class="draw-dot" cx="105" cy="88" r="3" fill="#E85D3C" opacity="0.6"/>
            <circle class="draw-dot" cx="120" cy="85" r="4" fill="#E85D3C"/>
            <!-- 筷子 -->
            <line class="draw-path" x1="150" y1="30" x2="175" y2="100" stroke="#3A2618" stroke-width="2.5" stroke-linecap="round"/>
            <line class="draw-path" x1="158" y1="28" x2="183" y2="98" stroke="#3A2618" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="cover__title">
          <span>寻</span><span class="cover__accent">味</span>
        </h1>
        <p class="cover__subtitle">COOKBOOK · 一人一锅 人间烟火</p>
        <div class="cover__line"></div>
        <p class="cover__welcome">欢迎回来，准备好今天的菜了吗？</p>
      </div>

      <form class="form" @submit.prevent="onLogin">
        <div class="form__field">
          <label class="form__label">用户名</label>
          <input
            v-model="loginForm.username"
            class="form__input"
            type="text"
            placeholder="请输入你的名字"
            autocomplete="username"
          />
        </div>
        <div class="form__field">
          <label class="form__label">密码</label>
          <input
            v-model="loginForm.password"
            class="form__input"
            type="password"
            placeholder="至少 4 位"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="form__btn">
          <span>登 录</span>
          <span class="form__btn-arrow">→</span>
        </button>

        <p class="form__hint">
          <span class="form__hint-dot">✦</span>
          演示模式 · 输入任意用户名和 4 位以上密码即可
        </p>
      </form>
    </template>

    <!-- 已登录：个人中心 -->
    <template v-else>
      <div class="profile">
        <div class="profile__header">
          <div class="profile__avatar-wrap">
            <img :src="userStore.user.avatar" :alt="userStore.user.username" class="profile__avatar" />
            <span class="profile__avatar-ring"></span>
          </div>
          <h2 class="profile__name">{{ userStore.user.username }}</h2>
          <p class="profile__bio">{{ userStore.user.bio }}</p>
        </div>

        <div class="stats">
          <div class="stats__item">
            <span class="stats__num">{{ userStore.favoriteCount }}</span>
            <span class="stats__label">收藏</span>
          </div>
          <div class="stats__divider"></div>
          <div class="stats__item">
            <span class="stats__num">{{ recipeStore.customRecipes.length }}</span>
            <span class="stats__label">创作</span>
          </div>
          <div class="stats__divider"></div>
          <div class="stats__item">
            <span class="stats__num">{{ daysSinceJoin }}</span>
            <span class="stats__label">天</span>
          </div>
        </div>

        <div class="menu">
          <router-link to="/favorites" class="menu__item">
            <span class="menu__icon">❤️</span>
            <span class="menu__label">我的收藏</span>
            <span class="menu__arrow">›</span>
          </router-link>
          <router-link to="/edit" class="menu__item">
            <span class="menu__icon">✏️</span>
            <span class="menu__label">创建新菜谱</span>
            <span class="menu__arrow">›</span>
          </router-link>
          <router-link to="/" class="menu__item">
            <span class="menu__icon">🍽️</span>
            <span class="menu__label">浏览菜谱</span>
            <span class="menu__arrow">›</span>
          </router-link>
        </div>

        <button class="logout" @click="onLogout">退出登录</button>

        <p class="signature">—— 在厨房里，找到属于你的节奏 ——</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recipeStore = useRecipeStore()

const loginForm = ref({
  username: '',
  password: ''
})

const daysSinceJoin = computed(() => {
  if (!userStore.user?.loginTime) return 1
  const join = new Date(userStore.user.loginTime)
  const now = new Date()
  const diff = Math.floor((now - join) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
})

function onLogin() {
  const result = userStore.login(
    loginForm.value.username.trim(),
    loginForm.value.password
  )
  if (!result.success) {
    showToast(result.message)
    return
  }
  showToast('欢迎回来 🍳')
  // 跳回来源页
  const redirect = route.query.redirect || '/'
  setTimeout(() => router.replace(redirect), 300)
}

function onLogout() {
  showConfirmDialog({
    title: '退出登录',
    message: '确定要退出吗？',
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    confirmButtonColor: '#E85D3C'
  }).then(() => {
    userStore.logout()
    showToast('已退出')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* SVG 画线动画 */
.draw-path {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: draw 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.draw-dot {
  opacity: 0;
  animation: fadeIn 0.5s ease 1s forwards;
}
.steam {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: draw 1s ease forwards, floatSteam 2s infinite alternate;
  opacity: 0.7;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@keyframes fadeIn {
  to { opacity: 1; }
}
@keyframes floatSteam {
  0% { transform: translateY(0) scaleX(1); opacity: 0.5; }
  100% { transform: translateY(-5px) scaleX(1.1); opacity: 0.8; }
}
.floating {
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login {
  min-height: 100vh;
  background: $color-bg;
  position: relative;
  overflow: hidden;

  // 背景纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 85% 15%, rgba(232, 93, 60, 0.08), transparent 50%),
      radial-gradient(circle at 15% 85%, rgba(232, 163, 60, 0.06), transparent 50%);
    pointer-events: none;
  }
}

// ===================== 未登录 =====================
.cover {
  padding: $sp-10 $sp-5 $sp-6;
  text-align: center;
  position: relative;
  z-index: 1;

  &__art {
    width: 160px;
    height: 128px;
    margin: 0 auto $sp-5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__svg {
    width: 100%;
    height: 100%;
  }

  &__title {
    font-family: $font-display;
    font-size: 64px;
    font-weight: 900;
    letter-spacing: 0.1em;
    line-height: 1;
    margin-bottom: $sp-3;
    color: $color-text;
  }

  &__accent {
    color: $color-primary;
    font-style: italic;
  }

  &__subtitle {
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: $color-text-secondary;
    letter-spacing: 0.3em;
    margin-bottom: $sp-5;
  }

  &__line {
    width: 40px;
    height: 2px;
    background: $color-primary;
    margin: 0 auto $sp-4;
  }

  &__welcome {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-base;
    color: $color-text;
  }
}

.form {
  padding: $sp-5 $sp-6 $sp-8;
  position: relative;
  z-index: 1;

  &__field {
    margin-bottom: $sp-4;
  }

  &__label {
    display: block;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    color: $color-text;
    letter-spacing: 0.1em;
    margin-bottom: $sp-2;
    text-transform: uppercase;
  }

  &__input {
    width: 100%;
    padding: 14px $sp-4;
    background: $color-bg-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $fs-base;
    color: $color-text;
    transition: all $duration-fast $ease-out;

    &::placeholder {
      color: $color-text-tertiary;
    }

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba(232, 93, 60, 0.12);
    }
  }

  &__btn {
    width: 100%;
    padding: 16px;
    background: $color-primary;
    color: white;
    border-radius: $radius-md;
    font-family: $font-display;
    font-size: $fs-md;
    font-weight: $fw-semibold;
    letter-spacing: 0.3em;
    margin-top: $sp-4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-3;
    box-shadow: $shadow-primary;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: translateX(-100%) rotate(45deg);
      transition: transform 0.6s ease;
    }

    &:hover {
      box-shadow: 0 8px 20px rgba(232, 93, 60, 0.3);
      transform: translateY(-2px);
    }

    &:hover::after {
      transform: translateX(100%) rotate(45deg);
    }

    &:active {
      transform: translateY(0) scale(0.96);
    }
  }

  &__btn-arrow {
    font-weight: $fw-regular;
  }

  &__hint {
    font-size: $fs-xs;
    color: $color-text-tertiary;
    text-align: center;
    margin-top: $sp-5;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-1;
    letter-spacing: 0.02em;
  }

  &__hint-dot {
    color: $color-primary;
  }
}

// ===================== 已登录 =====================
.profile {
  padding: $sp-8 $sp-5 $sp-6;
  position: relative;
  z-index: 1;

  &__header {
    text-align: center;
    margin-bottom: $sp-6;
  }

  &__avatar-wrap {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto $sp-4;
  }

  &__avatar {
    width: 100%;
    height: 100%;
    border-radius: $radius-full;
    background: $color-primary-soft;
    border: 4px solid white;
    box-shadow: $shadow-md;
  }

  &__avatar-ring {
    position: absolute;
    inset: -8px;
    border-radius: $radius-full;
    border: 1px dashed $color-primary;
    opacity: 0.5;
    animation: rotate 20s linear infinite;
  }

  &__name {
    font-family: $font-display;
    font-size: $fs-2xl;
    font-weight: $fw-bold;
    color: $color-text;
    margin-bottom: $sp-1;
  }

  &__bio {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-sm;
    color: $color-text-secondary;
  }
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $sp-5;
  background: $color-bg-elevated;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $sp-5;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__num {
    font-family: $font-display;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $color-primary;
    line-height: 1;
  }

  &__label {
    font-size: $fs-xs;
    color: $color-text-secondary;
    letter-spacing: 0.1em;
  }

  &__divider {
    width: 1px;
    height: 28px;
    background: $color-border;
  }
}

.menu {
  background: $color-bg-elevated;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  margin-bottom: $sp-5;

  &__item {
    display: flex;
    align-items: center;
    gap: $sp-3;
    padding: $sp-4 $sp-5;
    border-bottom: 1px solid $color-border;
    color: $color-text;
    transition: all 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(0,0,0,0.02);
      transform: translateX(6px);
    }

    &:active {
      transform: translateX(2px) scale(0.98);
    }
  }

  &__icon {
    font-size: $fs-md;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary-soft;
    border-radius: $radius-md;
  }

  &__label {
    flex: 1;
    font-size: $fs-base;
    font-weight: $fw-medium;
  }

  &__arrow {
    font-size: $fs-lg;
    color: $color-text-tertiary;
  }
}

.logout {
  width: 100%;
  padding: 14px;
  background: transparent;
  border: 1px solid $color-border-strong;
  color: $color-text-secondary;
  border-radius: $radius-md;
  font-size: $fs-sm;
  font-weight: $fw-medium;
  transition: all $duration-fast $ease-out;

  &:hover {
    border-color: $color-danger;
    color: $color-danger;
  }
}

.signature {
  text-align: center;
  margin-top: $sp-8;
  font-family: $font-display;
  font-style: italic;
  font-size: $fs-xs;
  color: $color-text-tertiary;
  letter-spacing: 0.1em;
}
</style>
