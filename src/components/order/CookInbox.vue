<template>
  <div class="inbox">
    <!-- 分段筛选 -->
    <div class="inbox-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.id"
        class="inbox-tabs__item"
        :class="{ active: activeStatus === tab.id }"
        @click="activeStatus = tab.id"
      >
        <span>{{ tab.label }}</span>
        <span v-if="countOf(tab.id) > 0" class="inbox-tabs__badge">{{ countOf(tab.id) }}</span>
      </button>
    </div>

    <!-- 加载态 -->
    <div v-if="mealPlanStore.loading" class="inbox-loading">
      <div class="inbox-loading__dot" v-for="n in 3" :key="n" />
    </div>

    <!-- 空态 -->
    <div v-else-if="visiblePlans.length === 0" class="inbox-empty">
      <span class="inbox-empty__icon">{{ emptyIcon }}</span>
      <p>{{ emptyText }}</p>
    </div>

    <!-- 订单列表 -->
    <div v-else class="inbox-list">
      <div
        v-for="plan in visiblePlans"
        :key="plan.id"
        class="inbox-card"
        :class="`inbox-card--${plan.status}`"
      >
        <!-- 卡片头 -->
        <div class="inbox-card__head">
          <div class="inbox-card__meta">
            <span class="inbox-card__meal">{{ mealLabel(plan.meal) }}</span>
            <span class="inbox-card__dot">·</span>
            <span class="inbox-card__date">{{ fmtDisplay(plan.date) }}</span>
            <span class="inbox-card__dot">·</span>
            <span class="inbox-card__who">{{ plan.orderer_id }} 点的</span>
          </div>
          <span class="inbox-card__status-badge" :class="`badge--${plan.status}`">
            {{ statusLabel(plan.status) }}
          </span>
        </div>

        <!-- 菜品图墙 -->
        <div class="inbox-card__gallery">
          <div
            v-for="(item, i) in plan.items.slice(0, 6)"
            :key="i"
            class="inbox-card__thumb"
          >
            <img :src="item.cover" :alt="item.title" />
            <span v-if="item.qty > 1" class="inbox-card__qty">×{{ item.qty }}</span>
          </div>
          <div v-if="plan.items.length > 6" class="inbox-card__thumb inbox-card__thumb--more">
            +{{ plan.items.length - 6 }}
          </div>
        </div>

        <!-- 菜名列表 -->
        <div class="inbox-card__dishes">
          <span v-for="(item, i) in plan.items" :key="i" class="inbox-card__dish">
            {{ item.title }}
            <span v-if="item.note" class="inbox-card__note">（{{ item.note }}）</span>
            <span v-if="i < plan.items.length - 1"> · </span>
          </span>
        </div>

        <!-- 操作按钮 -->
        <button
          v-if="plan.status === 'pending'"
          class="inbox-card__action inbox-card__action--accept"
          @click="onAccept(plan)"
        >
          接 单
        </button>
        <button
          v-else-if="plan.status === 'accepted'"
          class="inbox-card__action inbox-card__action--complete"
          @click="onComplete(plan)"
        >
          标记完成
        </button>
        <div v-else class="inbox-card__done">
          <span>✓</span> 已完成
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useMealPlanStore } from '@/stores/mealPlan'
import { useUserStore } from '@/stores/user'

const mealPlanStore = useMealPlanStore()
const userStore = useUserStore()

const activeStatus = ref('pending')

const statusTabs = [
  { id: 'pending',   label: '待接单' },
  { id: 'accepted',  label: '备菜中' },
  { id: 'completed', label: '已完成' },
]

const mealLabels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
const statusLabels = { pending: '待接单', accepted: '备菜中', completed: '已完成' }

function mealLabel(m) { return mealLabels[m] || m }
function statusLabel(s) { return statusLabels[s] || s }

function fmtDisplay(d) {
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 只看发给当前厨师的订单
const myPlans = computed(() =>
  mealPlanStore.plans.filter(p => p.cook_name === userStore.user?.username)
)

const visiblePlans = computed(() =>
  myPlans.value.filter(p => p.status === activeStatus.value)
)

function countOf(status) {
  return myPlans.value.filter(p => p.status === status).length
}

const emptyIcon = computed(() => ({
  pending:   '🍳',
  accepted:  '🥘',
  completed: '✅',
}[activeStatus.value]))

const emptyText = computed(() => ({
  pending:   '暂无新订单，等家人来点菜～',
  accepted:  '没有备菜中的订单',
  completed: '还没有完成的订单',
}[activeStatus.value]))

async function onAccept(plan) {
  const result = await mealPlanStore.setStatus(plan.id, 'accepted')
  if (!result.success) showToast(result.message || '操作失败')
  else showToast('已接单，备菜中 🥘')
}

async function onComplete(plan) {
  const result = await mealPlanStore.setStatus(plan.id, 'completed')
  if (!result.success) showToast(result.message || '操作失败')
  else showToast('已完成 ✅')
}

onMounted(() => {
  if (userStore.user) {
    mealPlanStore.fetchPlans({ cookName: userStore.user.username })
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.inbox {
  padding: 0 20px 20px;
}

.inbox-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 9px 6px;
    border-radius: $radius-md;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $color-text-secondary;
    background: white;
    border: 1px solid $color-border;
    transition: all $duration-base $ease-out;

    &.active {
      background: $color-text;
      color: white;
      border-color: $color-text;
      box-shadow: 0 4px 12px rgba(58, 38, 24, 0.2);
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: $radius-full;
    background: $color-primary;
    color: white;
    font-size: 10px;
    font-weight: $fw-bold;
    line-height: 1;
  }
}

.inbox-loading {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 60px 0;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: $radius-full;
    background: $color-primary;
    animation: bounce 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50%       { transform: translateY(-10px); opacity: 1; }
}

.inbox-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 10px;

  &__icon { font-size: 48px; }

  p {
    font-family: $font-display;
    font-size: $fs-base;
    color: $color-text-secondary;
    margin: 0;
  }
}

.inbox-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inbox-card {
  background: white;
  border-radius: $radius-xl;
  padding: 16px;
  box-shadow: $shadow-md;
  border: 1px solid $color-border;

  &--accepted { border-color: rgba(232, 93, 60, 0.3); }
  &--completed { opacity: 0.7; }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: $fs-xs;
    color: $color-text-secondary;
    flex-wrap: wrap;
  }

  &__meal {
    font-weight: $fw-semibold;
    color: $color-text;
  }

  &__dot { color: $color-text-tertiary; }
  &__who { font-weight: $fw-medium; color: $color-primary-dark; }

  &__status-badge {
    padding: 3px 10px;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-semibold;
    flex-shrink: 0;

    &.badge--pending   { background: rgba(232,163,60,0.15); color: $color-warning; }
    &.badge--accepted  { background: rgba(232,93,60,0.12);  color: $color-primary; }
    &.badge--completed { background: rgba(107,142,78,0.15); color: $color-success; }
  }

  &__gallery {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__thumb {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: $radius-md;
    overflow: hidden;
    background: $color-bg-warm;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--more {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $fs-xs;
      font-weight: $fw-semibold;
      color: $color-text-secondary;
    }
  }

  &__qty {
    position: absolute;
    bottom: 2px; right: 3px;
    font-size: 10px;
    font-weight: $fw-bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  &__dishes {
    font-size: $fs-sm;
    color: $color-text-secondary;
    line-height: 1.6;
    margin-bottom: 14px;
  }

  &__dish { color: $color-text; font-weight: $fw-medium; }
  &__note { color: $color-text-tertiary; font-weight: $fw-regular; }

  &__action {
    width: 100%;
    padding: 13px;
    border-radius: $radius-full;
    font-size: $fs-base;
    font-weight: $fw-semibold;
    letter-spacing: 0.1em;
    transition: transform $duration-fast $ease-out;

    &:active { transform: scale(0.97); }

    &--accept {
      background: linear-gradient(135deg, $color-primary, $color-primary-dark);
      color: white;
      box-shadow: $shadow-primary;
    }

    &--complete {
      background: $color-success;
      color: white;
      box-shadow: 0 6px 16px rgba(107, 142, 78, 0.3);
    }
  }

  &__done {
    width: 100%;
    padding: 12px;
    border-radius: $radius-full;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $color-success;
    background: rgba(107, 142, 78, 0.08);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}
</style>
