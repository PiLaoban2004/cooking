<template>
  <transition name="cart-pop">
    <button
      v-if="cartStore.totalQty > 0"
      class="cart-ball"
      :class="{ 'cart-ball--pulse': pulse }"
      @click="$emit('open')"
    >
      <span class="cart-ball__emoji">🧺</span>
      <span class="cart-ball__badge">{{ cartStore.totalQty }}</span>
      <span class="cart-ball__ring" />
      <span class="cart-ball__ring cart-ball__ring--2" />
    </button>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'

defineEmits(['open'])

const cartStore = useCartStore()
const pulse = ref(false)
let prevQty = cartStore.totalQty

watch(() => cartStore.totalQty, (newVal) => {
  if (newVal > prevQty) {
    pulse.value = true
    setTimeout(() => { pulse.value = false }, 500)
  }
  prevQty = newVal
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

@keyframes pulseRing {
  0%   { transform: scale(0.9); opacity: 0.55; }
  100% { transform: scale(1.9); opacity: 0; }
}
@keyframes ballIn {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes bumpEmoji {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.cart-ball {
  position: fixed;
  bottom: calc(#{$tabbar-height} + 20px);
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: $radius-full;
  background: linear-gradient(135deg, $color-primary, $color-primary-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(232, 93, 60, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.25);
  z-index: $z-fab;
  animation: ballIn 0.4s $ease-out;

  &__emoji {
    font-size: 24px;
    line-height: 1;
    transition: transform $duration-fast $ease-out;
  }

  &__badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    background: $color-text;
    color: $color-text-inverse;
    font-size: $fs-xs;
    font-weight: $fw-bold;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid $color-bg;
  }

  &__ring {
    position: absolute;
    inset: -6px;
    border-radius: $radius-full;
    border: 2px solid rgba(232, 93, 60, 0.3);
    animation: pulseRing 2.5s $ease-out infinite;
    pointer-events: none;

    &--2 { animation-delay: 1.2s; }
  }

  &--pulse .cart-ball__emoji {
    animation: bumpEmoji 0.5s $ease-out;
  }
}

.cart-pop-enter-active { animation: ballIn 0.4s $ease-out; }
.cart-pop-leave-active { transition: transform 0.3s $ease-out, opacity 0.3s; }
.cart-pop-leave-to    { transform: scale(0); opacity: 0; }
</style>
