<template>
  <div class="login">
    <!-- 未登录：登录/注册表单 -->
    <template v-if="!userStore.isLoggedIn">
      <div class="cover">
        <div class="cover__art">
          <svg viewBox="0 0 200 160" class="cover__svg floating" aria-hidden="true">
            <path class="draw-path" d="M 40 80 Q 40 130 100 130 Q 160 130 160 80 Z"
                  fill="none" stroke="#3A2618" stroke-width="2" stroke-linecap="round"/>
            <ellipse class="draw-path" cx="100" cy="80" rx="60" ry="12"
                     fill="none" stroke="#3A2618" stroke-width="2"/>
            <path class="steam" d="M 75 65 Q 72 55 78 45 Q 82 35 75 25"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <path class="steam" style="animation-delay: 0.2s" d="M 100 60 Q 96 50 102 40 Q 108 28 100 18"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <path class="steam" style="animation-delay: 0.4s" d="M 125 65 Q 122 55 128 45 Q 132 35 125 25"
                  fill="none" stroke="#E85D3C" stroke-width="2" stroke-linecap="round"/>
            <circle class="draw-dot" cx="85" cy="85" r="4" fill="#E85D3C"/>
            <circle class="draw-dot" cx="105" cy="88" r="3" fill="#E85D3C" opacity="0.6"/>
            <circle class="draw-dot" cx="120" cy="85" r="4" fill="#E85D3C"/>
            <line class="draw-path" x1="150" y1="30" x2="175" y2="100" stroke="#3A2618" stroke-width="2.5" stroke-linecap="round"/>
            <line class="draw-path" x1="158" y1="28" x2="183" y2="98" stroke="#3A2618" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="cover__title">
          <span>寻</span><span class="cover__accent">味</span>
        </h1>
        <p class="cover__subtitle">COOKBOOK · 一人一锅 人间烟火</p>
        <div class="cover__line"></div>
      </div>

      <!-- 模式切换 Tab -->
      <div class="mode-tabs">
        <button
          class="mode-tabs__item"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >登 录</button>
        <button
          class="mode-tabs__item"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >注 册</button>
      </div>

      <!-- 登录表单 -->
      <form v-if="mode === 'login'" class="form" @submit.prevent="onLogin">
        <div class="form__field">
          <label class="form__label">用户名</label>
          <input
            v-model="loginForm.username"
            class="form__input"
            type="text"
            placeholder="请输入用户名"
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
        <button type="submit" class="form__btn" :disabled="submitting">
          <span>{{ submitting ? '登录中…' : '登 录' }}</span>
          <span v-if="!submitting" class="form__btn-arrow">→</span>
        </button>
        <p class="form__hint">
          <span class="form__hint-dot">✦</span>
          没有账号？点上方"注册"创建
        </p>
      </form>

      <!-- 注册表单 -->
      <form v-else class="form" @submit.prevent="onRegister">
        <div class="form__field">
          <label class="form__label">用户名</label>
          <input
            v-model="registerForm.username"
            class="form__input"
            type="text"
            placeholder="1-20 个字符"
            autocomplete="username"
          />
        </div>
        <div class="form__field">
          <label class="form__label">密码</label>
          <input
            v-model="registerForm.password"
            class="form__input"
            type="password"
            placeholder="至少 4 位"
            autocomplete="new-password"
          />
        </div>

        <!-- 身份选择 -->
        <div class="form__field">
          <label class="form__label">我 是</label>
          <div class="role-cards">
            <div
              class="role-card"
              :class="{ active: registerForm.role === 'cook' }"
              @click="registerForm.role = 'cook'"
            >
              <span class="role-card__icon">👨‍🍳</span>
              <strong>厨师</strong>
              <p>做饭的人<br>给家人接单</p>
              <span v-if="registerForm.role === 'cook'" class="role-card__check">✓</span>
            </div>
            <div
              class="role-card"
              :class="{ active: registerForm.role === 'family' }"
              @click="registerForm.role = 'family'"
            >
              <span class="role-card__icon">🧑‍🤝‍🧑</span>
              <strong>家人</strong>
              <p>点菜的人<br>给厨师下单</p>
              <span v-if="registerForm.role === 'family'" class="role-card__check">✓</span>
            </div>
          </div>
        </div>

        <button type="submit" class="form__btn" :disabled="submitting || !registerForm.role">
          <span>{{ submitting ? '注册中…' : '注 册' }}</span>
          <span v-if="!submitting" class="form__btn-arrow">→</span>
        </button>
        <p class="form__hint">
          <span class="form__hint-dot">✦</span>
          身份注册后不可修改，要换身份请重新注册账号
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
          <div class="profile__role-badge" :class="`profile__role-badge--${userStore.user.role}`">
            <span>{{ userStore.isCook ? '👨‍🍳' : '🧑‍🤝‍🧑' }}</span>
            <span>{{ userStore.isCook ? '厨师' : '家人' }}</span>
          </div>
          <p class="profile__bio">{{ userStore.user.bio }}</p>
        </div>

        <div class="stats">
          <div class="stats__item">
            <span class="stats__num">{{ userStore.favoriteCount }}</span>
            <span class="stats__label">收藏</span>
          </div>
          <div class="stats__divider"></div>
          <div class="stats__item">
            <span class="stats__num">{{ recipeStore.recipes.length }}</span>
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
          <router-link to="/family" class="menu__item">
            <span class="menu__icon">🧑‍🤝‍🧑</span>
            <span class="menu__label">家庭成员</span>
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
import { useFamilyStore } from '@/stores/family'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recipeStore = useRecipeStore()
const familyStore = useFamilyStore()

const mode = ref('login')
const submitting = ref(false)

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', role: '' })

const daysSinceJoin = computed(() => {
  if (!userStore.user?.loginTime) return 1
  const join = new Date(userStore.user.loginTime)
  const now = new Date()
  const diff = Math.floor((now - join) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
})

async function onLogin() {
  const { username, password } = loginForm.value
  if (!username.trim() || !password) {
    showToast('请输入用户名和密码')
    return
  }
  submitting.value = true
  const result = await userStore.login(username.trim(), password)
  submitting.value = false

  if (!result.success) {
    showToast(result.message)
    // NOT_REGISTERED：自动切到注册 tab，保留用户名
    if (result.code === 'NOT_REGISTERED') {
      registerForm.value.username = username.trim()
      mode.value = 'register'
    }
    return
  }

  // 登录成功后预热家庭成员
  familyStore.fetchMembers(result.user.id)
  showToast(`欢迎回来 ${result.user.role === 'cook' ? '👨‍🍳' : '🧑‍🤝‍🧑'}`)
  const redirect = route.query.redirect || '/'
  setTimeout(() => router.replace(redirect), 300)
}

async function onRegister() {
  const { username, password, role } = registerForm.value
  if (!username.trim()) { showToast('请输入用户名'); return }
  if (!password || password.length < 4) { showToast('密码至少 4 位'); return }
  if (!role) { showToast('请选择身份'); return }

  submitting.value = true
  const result = await userStore.register(username.trim(), password, role)
  submitting.value = false

  if (!result.success) {
    showToast(result.message)
    return
  }

  // 注册成功（内部已调 login），预热家庭成员
  familyStore.fetchMembers(result.user.id)
  showToast(`注册成功，欢迎 ${role === 'cook' ? '👨‍🍳' : '🧑‍🤝‍🧑'}`)
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
    familyStore.reset()
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
@keyframes draw       { to { stroke-dashoffset: 0; } }
@keyframes fadeIn     { to { opacity: 1; } }
@keyframes floatSteam {
  0%   { transform: translateY(0) scaleX(1); opacity: 0.5; }
  100% { transform: translateY(-5px) scaleX(1.1); opacity: 0.8; }
}
.floating { animation: float 4s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

.login {
  min-height: 100vh;
  background: $color-bg;
  position: relative;
  overflow: hidden;

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

// ===================== 封面 =====================
.cover {
  padding: $sp-8 $sp-5 $sp-4;
  text-align: center;
  position: relative;
  z-index: 1;

  &__art {
    width: 120px;
    height: 96px;
    margin: 0 auto $sp-4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__svg { width: 100%; height: 100%; }

  &__title {
    font-family: $font-display;
    font-size: 56px;
    font-weight: 900;
    letter-spacing: 0.1em;
    line-height: 1;
    margin-bottom: $sp-2;
    color: $color-text;
  }

  &__accent { color: $color-primary; font-style: italic; }

  &__subtitle {
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: $color-text-secondary;
    letter-spacing: 0.3em;
    margin-bottom: $sp-4;
  }

  &__line {
    width: 40px;
    height: 2px;
    background: $color-primary;
    margin: 0 auto;
  }
}

// ===================== 模式 Tab =====================
.mode-tabs {
  display: flex;
  margin: $sp-5 $sp-6 0;
  background: $color-bg-warm;
  border-radius: $radius-md;
  padding: 4px;
  gap: 4px;
  position: relative;
  z-index: 1;

  &__item {
    flex: 1;
    padding: 10px;
    border-radius: $radius-md - 2px;
    font-family: $font-display;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
    letter-spacing: 0.1em;
    transition: all $duration-base $ease-out;

    &.active {
      background: white;
      color: $color-text;
      box-shadow: $shadow-sm;
    }
  }
}

// ===================== 表单 =====================
.form {
  padding: $sp-5 $sp-6 $sp-8;
  position: relative;
  z-index: 1;

  &__field { margin-bottom: $sp-4; }

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

    &::placeholder { color: $color-text-tertiary; }
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

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    &:not(:disabled):active { transform: scale(0.97); }
  }

  &__btn-arrow { font-weight: $fw-regular; }

  &__hint {
    font-size: $fs-xs;
    color: $color-text-tertiary;
    text-align: center;
    margin-top: $sp-4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-1;
    letter-spacing: 0.02em;
  }

  &__hint-dot { color: $color-primary; }
}

// ===================== 身份卡片 =====================
.role-cards {
  display: flex;
  gap: $sp-3;
}

.role-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $sp-1;
  padding: $sp-4 $sp-3;
  background: $color-bg-elevated;
  border: 2px solid $color-border;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $duration-base $ease-out;
  position: relative;
  text-align: center;

  &__icon { font-size: 32px; line-height: 1; }

  strong {
    font-size: $fs-base;
    font-weight: $fw-semibold;
    color: $color-text;
    margin-top: $sp-1;
  }

  p {
    font-size: $fs-xs;
    color: $color-text-secondary;
    margin: 0;
    line-height: 1.4;
  }

  &__check {
    position: absolute;
    top: 8px; right: 10px;
    font-size: $fs-sm;
    font-weight: $fw-bold;
    color: $color-primary;
  }

  &.active {
    border-color: $color-primary;
    background: $color-primary-soft;
    box-shadow: 0 0 0 3px rgba(232, 93, 60, 0.12);

    strong { color: $color-primary-dark; }
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
    margin-bottom: $sp-2;
  }

  &__role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 14px;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    margin-bottom: $sp-2;

    &--cook   { background: rgba(232, 93, 60, 0.12); color: $color-primary-dark; }
    &--family { background: rgba(107, 142, 78, 0.12); color: $color-success; }
  }

  &__bio {
    font-family: $font-display;
    font-style: italic;
    font-size: $fs-sm;
    color: $color-text-secondary;
  }
}

@keyframes rotate { to { transform: rotate(360deg); } }

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

    &:last-child { border-bottom: none; }
    &:active { transform: translateX(2px) scale(0.98); }
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

  &:active { border-color: $color-danger; color: $color-danger; }
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
