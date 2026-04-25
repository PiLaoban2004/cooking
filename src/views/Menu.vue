<template>
  <div class="menu-page">
    <header class="menu-top">
      <h1>一日三餐</h1>
      <p>
        {{ userStore.isCook ? '家人点的菜，按日期归档' : '你点过的菜单' }}
        · 共 {{ mealPlanStore.plans.length }} 份
      </p>
    </header>

    <div class="menu-role-card">
      <div class="menu-role-card__left">
        <span class="menu-role-card__icon">{{ userStore.isCook ? '👨‍🍳' : '🧑‍🤝‍🧑' }}</span>
        <div>
          <strong>{{ userStore.isCook ? '厨师视角' : '家人视角' }}</strong>
          <p>{{ userStore.isCook ? '查看家人点的菜，按份清点备料' : '查看你发给厨师的菜单' }}</p>
        </div>
      </div>
      <span class="menu-role-card__badge">{{ userStore.user?.username || '访客' }}</span>
    </div>

    <!-- 加载态 -->
    <div v-if="mealPlanStore.loading" class="menu-loading">
      <div v-for="n in 3" :key="n" class="menu-loading__skeleton" />
    </div>

    <div v-else-if="mealPlanStore.plans.length === 0" class="menu-empty">
      <span>📋</span>
      <p>还没有菜单</p>
      <small>{{ userStore.isCook ? '等家人来点菜吧' : '去「点菜」选菜并发送给厨师吧' }}</small>
    </div>

    <div v-else class="menu-list">
      <section
        v-for="[date, plans] in mealPlanStore.groupedByDate"
        :key="date"
        class="menu-day"
      >
        <div class="menu-day__head">
          <h2>{{ date }}</h2>
          <span>{{ plans.length }} 份</span>
        </div>

        <article
          v-for="p in plans"
          :key="p.id"
          class="menu-plan"
          @click="selectedPlan = p"
        >
          <div class="menu-plan__covers">
            <img
              v-for="(it, i) in p.items.slice(0, 3)"
              :key="i"
              :src="it.cover"
              :alt="it.title"
              :style="{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : '-10px' }"
            />
            <span v-if="p.items.length > 3" class="menu-plan__more">+{{ p.items.length - 3 }}</span>
          </div>
          <div class="menu-plan__body">
            <h3>
              {{ p.items.slice(0, 2).map(it => it.title).join('、') }}{{ p.items.length > 2 ? ` 等${p.items.length}道` : '' }}
            </h3>
            <p>
              <span class="menu-plan__who">{{ p.orderer_id }} 点的</span>
              <span class="dot"> · </span>
              <span>{{ p.items.reduce((s, i) => s + i.qty, 0) }} 份</span>
              <span v-if="p.meal" class="dot"> · </span>
              <span v-if="p.meal">{{ mealLabel(p.meal) }}</span>
            </p>
          </div>

          <!-- 状态徽章 -->
          <span class="menu-plan__status" :class="`menu-plan__status--${p.status}`">
            {{ statusLabel(p.status) }}
          </span>

          <!-- 厨师操作按钮（阻止冒泡，避免触发详情） -->
          <div v-if="userStore.isCook && p.status !== 'completed'" class="menu-plan__actions" @click.stop>
            <button
              v-if="p.status === 'pending'"
              class="menu-plan__btn menu-plan__btn--accept"
              @click="onAccept(p)"
            >接单</button>
            <button
              v-else-if="p.status === 'accepted'"
              class="menu-plan__btn menu-plan__btn--complete"
              @click="onComplete(p)"
            >完成</button>
          </div>
        </article>
      </section>
    </div>

    <MealPlanDetail :plan="selectedPlan" @close="selectedPlan = null" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useUserStore } from '@/stores/user'
import MealPlanDetail from '@/components/MealPlanDetail.vue'

const mealPlanStore = useMealPlanStore()
const userStore = useUserStore()
const selectedPlan = ref(null)

const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
const statusLabels = { pending: '待接单', accepted: '备菜中', completed: '已完成' }

function mealLabel(m) { return mealLabels[m] || m }
function statusLabel(s) { return statusLabels[s] || s }

async function onAccept(plan) {
  const result = await mealPlanStore.setStatus(plan.id, 'accepted')
  if (!result.success) showToast(result.message || '操作失败')
  else showToast('已接单 🥘')
}

async function onComplete(plan) {
  const result = await mealPlanStore.setStatus(plan.id, 'completed')
  if (!result.success) showToast(result.message || '操作失败')
  else showToast('已完成 ✅')
}

onMounted(() => {
  if (!userStore.isLoggedIn) return
  if (userStore.isCook) {
    mealPlanStore.fetchPlans({ cookName: userStore.user.username })
  } else {
    mealPlanStore.fetchPlans({ ordererId: userStore.user.id })
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.menu-page {
  min-height: 100vh;
  padding-bottom: 100px;
  background: $color-bg;
}

.menu-top {
  padding: 28px 20px 16px;

  h1 {
    font-family: $font-display;
    font-size: $fs-2xl;
    font-weight: 900;
    color: $color-text;
    margin: 0 0 4px;
  }

  p {
    font-size: $fs-sm;
    color: $color-text-secondary;
    margin: 0;
  }
}

.menu-role-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px 20px;
  padding: 14px 16px;
  background: linear-gradient(135deg, $color-primary-soft, rgba(255,255,255,0.9));
  border: 1px solid rgba(232, 93, 60, 0.2);
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon { font-size: 28px; }

  strong {
    display: block;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    color: $color-text;
    margin-bottom: 2px;
  }

  p {
    font-size: $fs-xs;
    color: $color-text-secondary;
    margin: 0;
  }

  &__badge {
    padding: 6px 14px;
    background: $color-primary;
    color: white;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    flex-shrink: 0;
  }
}

// 骨架屏加载
.menu-loading {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__skeleton {
    height: 76px;
    background: linear-gradient(90deg, $color-bg-warm 25%, white 50%, $color-bg-warm 75%);
    background-size: 200% 100%;
    border-radius: $radius-lg;
    animation: shimmer 1.4s infinite;
  }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 20px;
  gap: 8px;
  font-size: 48px;

  p { font-family: $font-display; font-size: $fs-md; color: $color-text; margin: 0; }
  small { font-size: $fs-sm; color: $color-text-secondary; }
}

.menu-list { padding: 0 20px; }

.menu-day {
  margin-bottom: 24px;

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;

    h2 {
      font-family: $font-display;
      font-size: $fs-md;
      font-weight: $fw-bold;
      color: $color-text;
      margin: 0;
    }

    span { font-size: $fs-xs; color: $color-text-tertiary; }
  }
}

.menu-plan {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: $radius-lg;
  padding: 14px;
  margin-bottom: 8px;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  cursor: pointer;
  transition: transform $duration-fast $ease-out, box-shadow $duration-fast;
  flex-wrap: wrap;

  &:active { transform: scale(0.98); box-shadow: $shadow-md; }

  &__covers {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    img {
      width: 40px; height: 40px;
      border-radius: $radius-sm;
      object-fit: cover;
      border: 2px solid white;
      background: $color-bg-warm;
      position: relative;
    }
  }

  &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    border-radius: $radius-sm;
    background: $color-bg-warm;
    border: 2px solid white;
    margin-left: -10px;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
  }

  &__body {
    flex: 1;
    min-width: 0;

    h3 {
      font-family: $font-display;
      font-size: $fs-sm;
      font-weight: $fw-semibold;
      color: $color-text;
      margin: 0 0 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      font-size: $fs-xs;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__who { font-weight: $fw-medium; color: $color-primary-dark; }

  &__status {
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;

    &--pending   { background: rgba(232,163,60,0.15); color: $color-warning; }
    &--accepted  { background: rgba(232,93,60,0.12);  color: $color-primary; }
    &--completed { background: rgba(107,142,78,0.15); color: $color-success; }
  }

  &__actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid $color-border;
    margin-top: 4px;
  }

  &__btn {
    padding: 6px 18px;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    transition: transform $duration-fast $ease-out;

    &:active { transform: scale(0.94); }

    &--accept {
      background: $color-primary;
      color: white;
      box-shadow: $shadow-primary;
    }

    &--complete {
      background: $color-success;
      color: white;
      box-shadow: 0 4px 12px rgba(107,142,78,0.3);
    }
  }
}

.dot { color: $color-text-tertiary; }
</style>
