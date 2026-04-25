import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalQty = computed(() => items.value.reduce((s, i) => s + i.qty, 0))

  function addItem(recipeId, qty = 1) {
    const existing = items.value.find(i => i.recipeId === recipeId)
    if (existing) {
      existing.qty += qty
    } else {
      items.value.push({ recipeId, qty, note: '' })
    }
  }

  function updateQty(recipeId, delta) {
    const idx = items.value.findIndex(i => i.recipeId === recipeId)
    if (idx < 0) return
    items.value[idx].qty += delta
    if (items.value[idx].qty <= 0) items.value.splice(idx, 1)
  }

  function setNote(recipeId, note) {
    const item = items.value.find(i => i.recipeId === recipeId)
    if (item) item.note = note
  }

  function clear() {
    items.value = []
  }

  return { items, totalQty, addItem, updateQty, setNote, clear }
})
