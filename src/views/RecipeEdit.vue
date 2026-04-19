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

        <!-- ▼▼▼ 封面图：改为上传组件 ▼▼▼ -->
        <div class="field">
          <label class="field__label">封面图</label>

          <!-- 已有图片：展示预览 + 替换/移除按钮 -->
          <div v-if="form.cover" class="cover">
            <img :src="form.cover" alt="cover" class="cover__img" />
            <div class="cover__mask">
              <button type="button" class="cover__btn" @click="triggerPick" :disabled="uploading">
                {{ uploading ? '上传中…' : '更换图片' }}
              </button>
              <button type="button" class="cover__btn cover__btn--ghost" @click="form.cover = ''" :disabled="uploading">
                移除
              </button>
            </div>
            <div v-if="uploading" class="cover__progress">
              <div class="cover__progress-bar"></div>
            </div>
          </div>

          <!-- 空状态：上传占位符 -->
          <button v-else type="button" class="picker" @click="triggerPick" :disabled="uploading">
            <span class="picker__icon">📷</span>
            <span class="picker__text">{{ uploading ? '上传中…' : '点击上传封面' }}</span>
            <span class="picker__hint">支持 jpg / png / webp，不超过 5MB</span>
          </button>

          <!-- 隐藏的文件选择器 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style="display:none"
            @change="onFileChange"
          />
        </div>
        <!-- ▲▲▲ 封面图结束 ▲▲▲ -->

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
        <transition-group name="list-vertical" tag="div">
          <div v-for="(ing, i) in form.ingredients" :key="ing._id || i" class="dyn-row">
            <input v-model="ing.name" class="dyn-row__input dyn-row__input--name" placeholder="食材名" />
            <input v-model="ing.amount" class="dyn-row__input dyn-row__input--amount" placeholder="用量" />
            <button class="dyn-row__del" @click="removeIngredient(i)" type="button"
                    :disabled="form.ingredients.length <= 1">−</button>
          </div>
        </transition-group>
        <button class="add-btn" @click="addIngredient" type="button">
          <span>+</span><span>添加食材</span>
        </button>
      </section>

      <!-- 步骤 -->
      <section class="block">
        <div class="block__label">
          <span class="block__num">03</span><span>烹饪步骤</span>
        </div>
        <transition-group name="list-vertical" tag="div">
          <div v-for="(step, i) in form.steps" :key="step._id || i" class="step-card">
            <div class="step-card__header">
              <span class="step-card__num">{{ String(i + 1).padStart(2, '0') }}</span>
              <button class="step-card__del" @click="removeStep(i)" type="button"
                      :disabled="form.steps.length <= 1">−</button>
            </div>
            
            <textarea v-model="step.text" class="step-card__input" rows="2"
                      :placeholder="`第 ${i + 1} 步...`"></textarea>
            
            <!-- 步骤图片 -->
            <div class="step-card__image">
              <div v-if="step.image" class="step-img">
                <img :src="step.image" alt="步骤图" class="step-img__pic" />
                <div class="step-img__mask">
                  <button type="button" class="step-img__btn" @click="triggerStepPick(i)" 
                          :disabled="uploadingSteps[i]">
                    {{ uploadingSteps[i] ? '上传中…' : '更换' }}
                  </button>
                  <button type="button" class="step-img__btn step-img__btn--ghost" 
                          @click="step.image = ''" :disabled="uploadingSteps[i]">
                    移除
                  </button>
                </div>
                <div v-if="uploadingSteps[i]" class="step-img__progress">
                  <div class="step-img__progress-bar"></div>
                </div>
              </div>
              
              <button v-else type="button" class="step-picker" @click="triggerStepPick(i)" 
                      :disabled="uploadingSteps[i]">
                <span class="step-picker__icon">📷</span>
                <span class="step-picker__text">{{ uploadingSteps[i] ? '上传中…' : '添加步骤图片' }}</span>
              </button>
              
              <input
                :ref="el => stepFileInputs[i] = el"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style="display:none"
                @change="e => onStepFileChange(e, i)"
              />
            </div>
          </div>
        </transition-group>
        <button class="add-btn" @click="addStep" type="button">
          <span>+</span><span>添加步骤</span>
        </button>
      </section>

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
import { uploadApi } from '@/lib/api'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

const isEditing = computed(() => !!route.params.id)
const recipe = computed(() => route.params.id ? recipeStore.getRecipeById(route.params.id) : null)
const selectableCats = computed(() => recipeStore.categories.filter(c => c.id !== 'all'))
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const stepFileInputs = ref([])
const uploadingSteps = ref({})

const form = ref({
  title: '', subtitle: '',
  cover: '',
  category: 'meat', time: 30, servings: 2, difficulty: '简单',
  description: '', tags: [],
  ingredients: [{ name: '', amount: '' }],
  steps: [{ text: '', image: '' }]
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
      steps: recipe.value.steps.length ? recipe.value.steps.map(s => ({ text: s.text || s, image: s.image || '' })) : [{ text: '', image: '' }]
    }))
  }
})

// ---------- 图片上传 ----------
function triggerPick() {
  if (uploading.value) return
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''  // 重置，允许重复选同一文件
  if (!file) return

  // 前端预校验
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件'); return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片不能超过 5MB'); return
  }

  uploading.value = true
  try {
    const { url } = await uploadApi.image(file)
    form.value.cover = url
    showToast('上传成功 ✓')
  } catch (err) {
    showToast(err.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

function addIngredient() { form.value.ingredients.push({ _id: Date.now(), name: '', amount: '' }) }
function removeIngredient(i) { if (form.value.ingredients.length > 1) form.value.ingredients.splice(i, 1) }
function addStep() { form.value.steps.push({ _id: Date.now(), text: '', image: '' }) }
function removeStep(i) { if (form.value.steps.length > 1) form.value.steps.splice(i, 1) }

// ---------- 步骤图片上传 ----------
function triggerStepPick(index) {
  if (uploadingSteps.value[index]) return
  stepFileInputs.value[index]?.click()
}

async function onStepFileChange(e, index) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件'); return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片不能超过 5MB'); return
  }

  uploadingSteps.value[index] = true
  try {
    const { url } = await uploadApi.image(file)
    form.value.steps[index].image = url
    showToast('上传成功 ✓')
  } catch (err) {
    showToast(err.message || '上传失败')
  } finally {
    delete uploadingSteps.value[index]
  }
}

function validate() {
  if (!form.value.title.trim()) return '请填写菜名'
  if (!form.value.subtitle.trim()) return '请填写一句话描述'
  if (!form.value.cover) return '请上传封面图'
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

/* 垂直列表增加/删除动画 */
.list-vertical-enter-active, .list-vertical-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-vertical-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
.list-vertical-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

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
    box-shadow: $shadow-primary; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:disabled { opacity: 0.5; }
    &:active:not(:disabled) { transform: scale(0.9); }
    &:hover:not(:disabled) {
      box-shadow: 0 6px 16px rgba(232,93,60,0.3);
      transform: translateY(-1px);
    }
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
    border-radius: $radius-md; font-size: $fs-sm; color: $color-text; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:focus {
      background: white;
      border-color: $color-primary;
      box-shadow: 0 0 0 4px rgba(232,93,60,0.15);
      transform: translateY(-1px);
    }
    &--big { font-family: $font-display; font-size: $fs-md; font-weight: $fw-semibold; }
    &--area { resize: vertical; line-height: $lh-loose; font-family: $font-body; }
  }
}

.field-row { display: flex; gap: $sp-3; margin-bottom: $sp-4; .field { margin-bottom: 0; } }

// ---------- 封面上传 ----------
.picker {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px;
  background: $color-bg-warm;
  border: 2px dashed $color-border-strong;
  border-radius: $radius-md;
  color: $color-text-secondary;
  transition: all $duration-fast $ease-out;

  &:hover:not(:disabled) {
    background: $color-primary-soft;
    border-color: $color-primary;
    color: $color-primary;
  }
  &:disabled { opacity: 0.6; }

  &__icon { font-size: 32px; line-height: 1; }
  &__text { font-size: $fs-sm; font-weight: $fw-medium; }
  &__hint { font-size: $fs-xs; color: $color-text-tertiary; }
}

.cover {
  position: relative;
  border-radius: $radius-md;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: $color-bg-warm;

  &__img { width: 100%; height: 100%; object-fit: cover; display: block; }

  &__mask {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center; gap: $sp-2;
    background: rgba(58, 38, 24, 0.55);
    opacity: 0;
    transition: opacity $duration-fast $ease-out;
  }
  &:hover &__mask, &__mask:has(:disabled) { opacity: 1; }
  // 移动端 touch 时常显
  @media (hover: none) {
    &__mask { opacity: 1; background: linear-gradient(to top, rgba(58,38,24,0.7), transparent 55%); align-items: flex-end; padding: $sp-3; }
  }

  &__btn {
    padding: 7px 14px;
    background: white;
    color: $color-text;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    transition: transform $duration-fast $ease-out;
    &:active { transform: scale(0.95); }
    &:disabled { opacity: 0.6; }
    &--ghost {
      background: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,0.7);
    }
  }

  &__progress {
    position: absolute; left: 0; right: 0; bottom: 0;
    height: 3px; background: rgba(255,255,255,0.3);
    overflow: hidden;
  }
  &__progress-bar {
    height: 100%;
    width: 40%;
    background: $color-primary;
    animation: progress-slide 1.2s ease-in-out infinite;
  }
}

@keyframes progress-slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

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

.step-card {
  padding: $sp-4;
  background: $color-bg-warm;
  border-radius: $radius-md;
  margin-bottom: $sp-3;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $sp-3;
  }
  
  &__num {
    width: 32px; height: 32px;
    border-radius: $radius-full;
    background: $color-text;
    color: $color-bg;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: $fw-bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__del {
    width: 30px; height: 30px;
    border-radius: $radius-full;
    background: rgba(0,0,0,0.05);
    color: $color-text-secondary;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:disabled { opacity: 0.3; }
  }
  
  &__input {
    width: 100%;
    padding: 10px $sp-3;
    background: white;
    border: 1px solid transparent;
    border-radius: $radius-md;
    font-size: $fs-sm;
    color: $color-text;
    line-height: $lh-loose;
    font-family: $font-body;
    resize: vertical;
    margin-bottom: $sp-3;
    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba(232,93,60,0.1);
    }
  }
  
  &__image {
    margin-top: $sp-3;
  }
}

.step-picker {
  width: 100%;
  padding: $sp-4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: white;
  border: 1.5px dashed $color-border-strong;
  border-radius: $radius-md;
  color: $color-text-secondary;
  transition: all $duration-fast $ease-out;
  
  &:hover:not(:disabled) {
    background: $color-primary-soft;
    border-color: $color-primary;
    color: $color-primary;
  }
  &:disabled { opacity: 0.6; }
  
  &__icon { font-size: 24px; line-height: 1; }
  &__text { font-size: $fs-xs; font-weight: $fw-medium; }
}

.step-img {
  position: relative;
  border-radius: $radius-md;
  overflow: hidden;
  background: white;
  
  &__pic {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: cover;
    display: block;
  }
  
  &__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $sp-2;
    background: rgba(58, 38, 24, 0.55);
    opacity: 0;
    transition: opacity $duration-fast $ease-out;
  }
  &:hover &__mask, &__mask:has(:disabled) { opacity: 1; }
  
  @media (hover: none) {
    &__mask {
      opacity: 1;
      background: linear-gradient(to top, rgba(58,38,24,0.7), transparent 55%);
      align-items: flex-end;
      padding: $sp-3;
    }
  }
  
  &__btn {
    padding: 6px 12px;
    background: white;
    color: $color-text;
    border-radius: $radius-full;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    transition: transform $duration-fast $ease-out;
    &:active { transform: scale(0.95); }
    &:disabled { opacity: 0.6; }
    &--ghost {
      background: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,0.7);
    }
  }
  
  &__progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: rgba(255,255,255,0.3);
    overflow: hidden;
  }
  &__progress-bar {
    height: 100%;
    width: 40%;
    background: $color-primary;
    animation: progress-slide 1.2s ease-in-out infinite;
  }
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
