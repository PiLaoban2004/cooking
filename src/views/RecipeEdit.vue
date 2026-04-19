<template>
  <div class="edit">
    <header class="edit-top">
      <button class="edit-top__back" @click="router.back()">‹</button>
      <h1 class="edit-top__title">{{ isEditing ? '编辑菜谱' : '新建菜谱' }}</h1>
      <button class="edit-top__save" :disabled="saving" @click="onSubmit">
        {{ saving ? '保存中…' : '保存' }}
      </button>
    </header>

    <div class="edit-body">
      <!-- 基本信息 -->
      <section class="block">
        <div class="block__label">
          <span class="block__num">01</span>
          <span>基本信息</span>
        </div>

        <div class="field">
          <label class="field__label">菜名</label>
          <input v-model="form.title" class="field__input field__input--big"
                 placeholder="比如「妈妈的西红柿炒蛋」" maxlength="20" />
        </div>

        <div class="field">
          <label class="field__label">一句话描述</label>
          <input v-model="form.subtitle" class="field__input"
                 placeholder="用一句话形容这道菜的灵魂" maxlength="30" />
        </div>

        <div class="field">
          <label class="field__label">封面图（URL）</label>
          <input v-model="form.cover" class="field__input" placeholder="粘贴图片链接" />
          <div v-if="form.cover" class="field__preview">
            <img :src="form.cover" alt="preview" />
          </div>
        </div>

        <div class="field">
          <label class="field__label">分类</label>
          <div class="cat-pick">
            <button v-for="cat in selectableCats" :key="cat.id"
                    class="cat-pick__btn" :class="{ 'is-active': form.category === cat.id }"
                    @click="form.category = cat.id" type="button">
              <span>{{ cat.emoji }}</span><span>{{ cat.name }}</span>
            </button>
          </div>
        </div>

        <div class="field-row">
          <div class="field field--third">
            <label class="field__label">耗时(分钟)</label>
            <input v-model.number="form.time" class="field__input" type="number" min="1" />
          </div>
          <div class="field field--third">
            <label class="field__label">人份</label>
            <input v-model.number="form.servings" class="field__input" type="number" min="1" />
          </div>
          <div class="field field--third">
            <label class="field__label">难度</label>
            <select v-model="form.difficulty" class="field__input">
              <option>简单</option><option>中等</option><option>困难</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field__label">介绍</label>
          <textarea v-model="form.description" class="field__input field__input--area"
                    rows="3" placeholder="讲讲这道菜背后的故事……" maxlength="200"></textarea>
        </div>
      </section>

      <!-- 食材 -->
      <section class="block">
        <div class="block__label">
          <span class="block__num">02</span><span>食材清单</span>
        </div>
        <div v-for="(ing, i) in form.ingredients" :key="i" class="dyn-row">
          <input v-model="ing.name" class="dyn-row__input dyn-row__input--name" placeholder="食材名" />
          <input v-model="ing.amount" class="dyn-row__input dyn-row__input--amount" placeholder="用量" />
          <button class="dyn-row__del" @click="removeIngredient(i)" type="button"
                  :disabled="form.ingredients.length <= 1">−</button>
        </div>
        <button class="add-btn" @click="addIngredient" type="button">
          <span>+</span><span>添加食材</span>
        </button>
      </section>

      <!-- 步骤 -->
      <section class="block">
        <div class="block__label">
          <span class="block__num">03</span><span>烹饪步骤</span>
        </div>
        <div v-for="(step, i) in form.steps" :key="i" class="step-row">
          <span class="step-row__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <textarea v-model="step.text" class="step-row__input" rows="2"
                    :placeholder="`第 ${i + 1} 步...`"></textarea>
          <button class="step-row__del" @click="removeStep(i)" type="button"
                  :disabled="form.steps.length <= 1">−</button>
        </div>
        <button class="add-btn" @click="addStep" type="button">
          <span>+</span><span>添加步骤</span>
        </button>
      </section>

      <!-- 删除（编辑态） -->
      <div v-if="isEditing && recipe?.isCustom" class="danger-zone">
        <button class="danger-btn" @click="onDelete" type="button" :disabled="saving">
          删除这道菜
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

const isEditing = computed(() => !!route.params.id)
const recipe = computed(() => route.params.id ? recipeStore.getRecipeById(route.params.id) : null)
const selectableCats = computed(() => recipeStore.categories.filter(c => c.id !== 'all'))
const saving = ref(false)

const form = ref({
  title: '', subtitle: '',
  cover: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80',
  category: 'meat', time: 30, servings: 2, difficulty: '简单',
  description: '', tags: [],
  ingredients: [{ name: '', amount: '' }],
  steps: [{ text: '' }]
})

onMounted(() => {
  if (isEditing.value && recipe.value) {
    form.value = JSON.parse(JSON.stringify({
      title: recipe.value.title,
      subtitle: recipe.value.subtitle || '',
      cover: recipe.value.cover,
      category: recipe.value.category,
      time: recipe.value.time,
      servings: recipe.value.servings,
      difficulty: recipe.value.difficulty,
      description: recipe.value.description || '',
      tags: recipe.value.tags || [],
      ingredients: recipe.value.ingredients.length ? recipe.value.ingredients : [{ name: '', amount: '' }],
      steps: recipe.value.steps.length ? recipe.value.steps : [{ text: '' }]
    }))
  }
})

function addIngredient() { form.value.ingredients.push({ name: '', amount: '' }) }
function removeIngredient(i) { if (form.value.ingredients.length > 1) form.value.ingredients.splice(i, 1) }
function addStep() { form.value.steps.push({ text: '' }) }
function removeStep(i) { if (form.value.steps.length > 1) form.value.steps.splice(i, 1) }

function validate() {
  if (!form.value.title.trim()) return '请填写菜名'
  if (!form.value.subtitle.trim()) return '请填写一句话描述'
  const validIngs = form.value.ingredients.filter(i => i.name.trim() && i.amount.trim())
  if (!validIngs.length) return '至少需要一个食材'
  const validSteps = form.value.steps.filter(s => s.text.trim())
  if (!validSteps.length) return '至少需要一个步骤'
  return null
}

async function onSubmit() {
  const err = validate()
  if (err) { showToast(err); return }
  if (saving.value) return

  saving.value = true
  const payload = {
    ...form.value,
    author: userStore.user?.username || '我',
    ingredients: form.value.ingredients.filter(i => i.name.trim() && i.amount.trim()),
    steps: form.value.steps.filter(s => s.text.trim()),
    tags: form.value.tags.length ? form.value.tags : ['原创']
  }

  try {
    if (isEditing.value && recipe.value?.isCustom) {
      await recipeStore.updateRecipe(recipe.value.id, payload)
      showToast('已保存 ✓')
      router.replace({ name: 'RecipeDetail', params: { id: recipe.value.id } })
    } else {
      const created = await recipeStore.addRecipe(payload)
      showToast('菜谱已发布 ✓')
      router.replace({ name: 'RecipeDetail', params: { id: created.id } })
    }
  } catch (e) {
    showToast(e.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  try {
    await showConfirmDialog({
      title: '删除菜谱', message: '确定删除这道菜？此操作无法撤销。',
      confirmButtonText: '删除', cancelButtonText: '取消',
      confirmButtonColor: '#C64A2C'
    })
  } catch { return }

  saving.value = true
  try {
    await recipeStore.deleteRecipe(recipe.value.id)
    showToast('已删除')
    router.replace('/')
  } catch (e) {
    showToast(e.message || '删除失败')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.edit { min-height: 100vh; background: $color-bg; }

.edit-top {
  position: sticky; top: 0; z-index: $z-nav;
  display: flex; align-items: center; justify-content: space-between;
  padding: $sp-3 $sp-4;
  background: rgba(250, 246, 240, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border;

  &__back { width: 40px; height: 40px; font-size: 24px; color: $color-text; display: flex; align-items: center; justify-content: center; }
  &__title { font-family: $font-display; font-size: $fs-md; font-weight: $fw-semibold; }
  &__save {
    padding: 8px $sp-4; background: $color-primary; color: white;
    border-radius: $radius-full; font-size: $fs-sm; font-weight: $fw-medium;
    box-shadow: $shadow-primary; transition: opacity $duration-fast $ease-out;
    &:disabled { opacity: 0.5; }
  }
}

.edit-body { padding: $sp-4 0 $sp-12; }

.block {
  margin: 0 $sp-4 $sp-5; padding: $sp-5;
  background: $color-bg-elevated; border-radius: $radius-lg; box-shadow: $shadow-sm;
  &__label {
    display: flex; align-items: baseline; gap: $sp-2;
    font-family: $font-display; font-size: $fs-md; font-weight: $fw-bold; color: $color-text;
    margin-bottom: $sp-4; padding-bottom: $sp-3; border-bottom: 1px solid $color-border;
  }
  &__num { font-family: $font-display; font-size: $fs-lg; font-weight: $fw-bold; color: $color-primary; letter-spacing: -0.02em; }
}

.field {
  margin-bottom: $sp-4;
  &--third { flex: 1; }
  &__label { display: block; font-size: $fs-xs; font-weight: $fw-medium; color: $color-text-secondary; letter-spacing: 0.05em; margin-bottom: $sp-2; text-transform: uppercase; }
  &__input {
    width: 100%; padding: 10px $sp-3; background: $color-bg-warm; border: 1px solid transparent;
    border-radius: $radius-md; font-size: $fs-sm; color: $color-text; transition: all $duration-fast $ease-out;
    &:focus { background: white; border-color: $color-primary; box-shadow: 0 0 0 3px rgba(232,93,60,0.1); }
    &--big { font-family: $font-display; font-size: $fs-md; font-weight: $fw-semibold; }
    &--area { resize: vertical; line-height: $lh-loose; font-family: $font-body; }
  }
  &__preview { margin-top: $sp-2; border-radius: $radius-md; overflow: hidden; aspect-ratio: 16/9; background: $color-bg-warm; img { width: 100%; height: 100%; object-fit: cover; } }
}

.field-row { display: flex; gap: $sp-3; margin-bottom: $sp-4; .field { margin-bottom: 0; } }

.cat-pick {
  display: flex; gap: $sp-2; flex-wrap: wrap;
  &__btn {
    display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px;
    background: $color-bg-warm; border: 1px solid transparent; border-radius: $radius-full;
    font-size: $fs-sm; color: $color-text-secondary; transition: all $duration-fast $ease-out;
    &.is-active { background: $color-primary-soft; border-color: $color-primary; color: $color-primary-dark; font-weight: $fw-medium; }
  }
}

.dyn-row {
  display: flex; gap: $sp-2; margin-bottom: $sp-2; align-items: center;
  &__input { padding: 8px $sp-3; background: $color-bg-warm; border: 1px solid transparent; border-radius: $radius-md; font-size: $fs-sm; color: $color-text; &--name { flex: 2; } &--amount { flex: 1; } &:focus { background: white; border-color: $color-primary; } }
  &__del { flex-shrink: 0; width: 30px; height: 30px; border-radius: $radius-full; background: $color-bg-warm; color: $color-text-secondary; font-size: 18px; display: flex; align-items: center; justify-content: center; &:disabled { opacity: 0.3; } }
}

.step-row {
  display: flex; gap: $sp-3; margin-bottom: $sp-3; align-items: flex-start;
  &__num { flex-shrink: 0; width: 32px; height: 32px; border-radius: $radius-full; background: $color-text; color: $color-bg; font-family: $font-display; font-size: $fs-xs; font-weight: $fw-bold; display: flex; align-items: center; justify-content: center; margin-top: 6px; }
  &__input { flex: 1; padding: 10px $sp-3; background: $color-bg-warm; border: 1px solid transparent; border-radius: $radius-md; font-size: $fs-sm; color: $color-text; line-height: $lh-loose; font-family: $font-body; resize: vertical; &:focus { background: white; border-color: $color-primary; } }
  &__del { flex-shrink: 0; width: 30px; height: 30px; border-radius: $radius-full; background: $color-bg-warm; color: $color-text-secondary; font-size: 18px; display: flex; align-items: center; justify-content: center; margin-top: 8px; &:disabled { opacity: 0.3; } }
}

.add-btn {
  width: 100%; padding: 10px; background: transparent; border: 1px dashed $color-border-strong;
  border-radius: $radius-md; color: $color-primary; font-size: $fs-sm; font-weight: $fw-medium;
  display: flex; align-items: center; justify-content: center; gap: $sp-1; margin-top: $sp-2;
  &:hover { background: $color-primary-soft; border-color: $color-primary; }
}

.danger-zone { padding: $sp-5 $sp-4; }
.danger-btn {
  width: 100%; padding: 12px; background: transparent; border: 1px solid $color-danger;
  color: $color-danger; border-radius: $radius-md; font-size: $fs-sm; font-weight: $fw-medium;
  &:hover { background: $color-danger; color: white; } &:disabled { opacity: 0.5; }
}
</style>
