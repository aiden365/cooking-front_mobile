<script setup lang="ts">
import { Left, StarN } from '@nutui/icons-vue'
import { showToast } from '@nutui/nutui'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDishDetail, type DishDetailData } from '../../api/dish'
import { addShare } from '../../api/share'
import { uploadFile } from '../../api/system'
import noImage from '../../assets/img/no_image.svg'
import { resolveAssetUrl } from '../../utils/assets'

defineOptions({
  name: 'ShareCreate',
})

type ShareDishCard = {
  id: number
  title: string
  cover: string
  badges: string[]
  summary: string
  collectCount: number
}

type UploadResult =
  | string
  | {
      path?: string
      url?: string
      imgPath?: string
      filePath?: string
    }

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const uploading = ref(false)
const submitting = ref(false)
const dishCard = ref<ShareDishCard | null>(null)
const description = ref('')
const uploadedImageUrl = ref('')
const uploadedImagePath = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
let uploadedPreviewObjectUrl = ''

function getDishId() {
  return Number(route.query.dishId || route.params.id || 0)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/share-list')
}

function resolveMediaPath(path?: string) {
  return resolveAssetUrl(path)
}

function resolveUploadPath(result: UploadResult | null | undefined) {
  if (typeof result === 'string') {
    return result
  }

  if (!result) {
    return ''
  }

  return String(result.path || result.url || result.imgPath || result.filePath || '')
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('图片读取失败'))
    }

    image.src = objectUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('图片压缩失败'))
    }, type, quality)
  })
}

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) {
    return file
  }

  const image = await loadImageFromFile(file)
  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
  const targetWidth = Math.max(1, Math.round(image.width * scale))
  const targetHeight = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return file
  }

  canvas.width = targetWidth
  canvas.height = targetHeight
  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg'
  const blob = await canvasToBlob(canvas, outputType, 0.82)

  if (blob.size >= file.size) {
    return file
  }

  const extension = outputType === 'image/jpeg' ? 'jpg' : file.name.split('.').pop() || 'jpg'

  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  })
}

function mapDishCard(detail: DishDetailData): ShareDishCard {
  const dishCover = typeof detail.imgPath === 'string' ? detail.imgPath.trim() : ''
  const cover = dishCover ? resolveMediaPath(dishCover) : noImage

  return {
    id: detail.id,
    title: detail.name,
    cover,
    badges: [`预计${detail.takeTimes}`, `分享${detail.shareCount}`],
    summary: `${detail.collectCount}人收藏`,
    collectCount: detail.collectCount,
  }
}

async function loadDishInfo() {
  const dishId = getDishId()

  if (!dishId) {
    showToast.fail('缺少菜谱信息')
    router.push('/dish/list')
    return
  }

  loading.value = true

  try {
    const detailResponse = await getDishDetail(dishId)
    dishCard.value = mapDishCard(detailResponse.data)
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '菜谱信息加载失败')
  } finally {
    loading.value = false
  }
}

function openFilePicker() {
  if (uploading.value) {
    return
  }

  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  uploading.value = true

  try {
    const uploadTarget = await compressImage(file)
    const response = await uploadFile(uploadTarget, "user_share_path")
    const uploadPath = resolveUploadPath(response.data as UploadResult)

    if (!uploadPath) {
      throw new Error('上传成功但未返回图片路径')
    }

    if (uploadedPreviewObjectUrl) {
      URL.revokeObjectURL(uploadedPreviewObjectUrl)
    }

    uploadedPreviewObjectUrl = URL.createObjectURL(file)
    uploadedImagePath.value = uploadPath
    uploadedImageUrl.value = uploadedPreviewObjectUrl
    showToast.success('图片上传成功')
  } catch (error) {
    uploadedImagePath.value = ''
    uploadedImageUrl.value = ''
    showToast.fail(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    uploading.value = false
    target.value = ''
  }
}

function removeUploadedImage() {
  if (uploadedPreviewObjectUrl) {
    URL.revokeObjectURL(uploadedPreviewObjectUrl)
    uploadedPreviewObjectUrl = ''
  }

  uploadedImagePath.value = ''
  uploadedImageUrl.value = ''
}

async function submitShare() {
  const dishId = getDishId()
  const content = description.value.trim()

  if (!dishId) {
    return
  }

  if (uploading.value) {
    showToast.text('图片上传中，请稍后再试')
    return
  }

  if (!uploadedImagePath.value) {
    showToast.text('请先上传成品图片')
    return
  }

  if (!content) {
    showToast.text('请填写分享心得')
    return
  }

  submitting.value = true

  try {
    await addShare({
      dishId,
      description: content,
      imgPath: uploadedImagePath.value,
    })
    showToast.success('分享成功')
    router.push('/share-list')
  } catch (error) {
    showToast.fail(error instanceof Error ? error.message : '分享提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadDishInfo()
})

onBeforeUnmount(() => {
  if (uploadedPreviewObjectUrl) {
    URL.revokeObjectURL(uploadedPreviewObjectUrl)
    uploadedPreviewObjectUrl = ''
  }
})
</script>

<template>
  <section class="share-page">
    <header class="share-header">
      <button class="header-back" type="button" @click="goBack">
        <Left size="18" color="#7f8792" />
      </button>
      <h1 class="share-title">分享</h1>
      <div class="header-space" />
    </header>

    <section class="share-body">
      <div v-if="loading" class="share-state">正在加载菜谱信息...</div>

      <template v-else-if="dishCard">
        <section class="dish-card">
          <img v-if="dishCard.cover" :src="dishCard.cover" :alt="dishCard.title" class="dish-cover" />
          <div v-else class="dish-cover dish-cover-empty">暂无图片</div>

          <div class="dish-info">
            <h2 class="dish-name">{{ dishCard.title }}</h2>
            <div class="dish-badges">
              <span v-for="badge in dishCard.badges" :key="badge" class="dish-badge">{{ badge }}</span>
            </div>
            <p class="dish-summary">{{ dishCard.summary }}</p>
          </div>

          <div class="dish-like">
            <StarN size="16" color="#b3a694" />
            <span>{{ dishCard.collectCount }}</span>
          </div>
        </section>

        <section class="upload-card">
          <input
            ref="fileInputRef"
            class="file-input"
            type="file"
            accept="image/*"
            @change="handleFileChange"
          />

          <button
            v-if="!uploadedImageUrl"
            type="button"
            class="upload-trigger"
            :disabled="uploading"
            @click="openFilePicker"
          >
            <span class="upload-plus">{{ uploading ? '...' : '+' }}</span>
            <span class="upload-text">{{ uploading ? '图片上传中...' : '上传你的成品图片' }}</span>
          </button>

          <div v-else class="upload-preview-wrap">
            <img :src="uploadedImageUrl" alt="成品预览" class="upload-preview" />
            <div class="upload-actions">
              <button type="button" class="upload-action-button" @click="openFilePicker">重新上传</button>
              <button type="button" class="upload-action-button upload-action-danger" @click="removeUploadedImage">
                删除
              </button>
            </div>
          </div>
        </section>

        <section class="textarea-card">
          <textarea
            v-model="description"
            class="share-textarea"
            maxlength="300"
            placeholder="写写你的创作心得或感想"
          />
        </section>
      </template>
    </section>

    <footer class="share-footer">
      <button type="button" class="submit-button" :disabled="submitting" @click="submitShare">
        {{ submitting ? '提交中...' : '提交' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.share-page {
  height: 100vh;
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
  overflow-y: auto;
  background: #f7f7f7;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.share-page::-webkit-scrollbar {
  display: none;
}

.share-header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 14px) 12px 14px;
  background: #ffffff;
}

.header-back,
.header-space {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.header-back {
  padding: 0;
  background: transparent;
  border: none;
}

.share-title {
  margin: 0;
  color: #2b2b2b;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.share-body {
  padding: 12px 10px 0;
}

.share-state {
  padding: 48px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.dish-card {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #ffb573;
}

.dish-cover {
  width: 104px;
  height: 104px;
  object-fit: cover;
  border-radius: 4px;
}

.dish-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8a29e;
  font-size: 12px;
  background: #f2f2f2;
}

.dish-info {
  min-width: 0;
}

.dish-name {
  margin: 0;
  color: #7a4a20;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.dish-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.dish-badge {
  padding: 4px 10px;
  color: #7b6a58;
  font-size: 13px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 4px;
}

.dish-summary {
  margin: 14px 0 0;
  color: #b09a88;
  font-size: 15px;
}

.dish-like {
  align-self: end;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #b09a88;
  font-size: 13px;
}

.upload-card,
.textarea-card {
  margin-top: 14px;
  background: #ffffff;
  border: 1px dashed #ffb8ad;
  border-radius: 8px;
}

.upload-card {
  min-height: 288px;
}

.file-input {
  display: none;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  min-height: 288px;
  color: #b9b9b9;
  background: transparent;
  border: none;
}

.upload-plus {
  font-size: 64px;
  line-height: 1;
}

.upload-text {
  font-size: 18px;
}

.upload-preview-wrap {
  padding: 12px;
}

.upload-preview {
  display: block;
  width: 100%;
  max-height: 288px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.upload-action-button {
  min-width: 86px;
  height: 36px;
  padding: 0 14px;
  color: #ff6f61;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255, 111, 97, 0.1);
  border: none;
  border-radius: 999px;
}

.upload-action-danger {
  color: #8f96a3;
  background: #f3f4f6;
}

.share-textarea {
  width: 100%;
  min-height: 132px;
  padding: 18px 16px;
  color: #444444;
  font-size: 16px;
  line-height: 1.7;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
}

.share-textarea::placeholder {
  color: #b2b2b2;
}

.share-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #ffffff;
}

.submit-button {
  width: 100%;
  height: 50px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  background: #ff6f61;
  border: none;
  border-radius: 8px;
}

.submit-button:disabled {
  opacity: 0.55;
}
</style>
