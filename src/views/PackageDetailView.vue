<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pb } from '../lib/pocketbase'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const packageData = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedImageIndex = ref(0)
const showLightbox = ref(false)
const lightboxImageIndex = ref(0)

// Parse images string to array
const imagesArray = computed(() => {
  if (!packageData.value?.images) return []
  return packageData.value.images.split(',').map(img => img.trim()).filter(img => img)
})

// If no images in images field, fall back to single image field
const displayImages = computed(() => {
  if (imagesArray.value.length > 0) return imagesArray.value
  if (packageData.value?.image) return [packageData.value.image]
  return []
})

const fetchPackage = async () => {
  try {
    const pkg = await pb.collection('packages').getOne(route.params.id)
    packageData.value = pkg
  } catch(e) {
    console.error(e)
    error.value = 'Package not found'
  } finally {
    loading.value = false
  }
}

const nextImage = () => {
  if (displayImages.value.length > 0) {
    selectedImageIndex.value = (selectedImageIndex.value + 1) % displayImages.value.length
  }
}

const prevImage = () => {
  if (displayImages.value.length > 0) {
    selectedImageIndex.value = (selectedImageIndex.value - 1 + displayImages.value.length) % displayImages.value.length
  }
}

const openLightbox = (index) => {
  lightboxImageIndex.value = index
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
  lightboxImageIndex.value = 0
}

const lightboxPrev = () => {
  if (displayImages.value.length > 0) {
    lightboxImageIndex.value = (lightboxImageIndex.value - 1 + displayImages.value.length) % displayImages.value.length
  }
}

const lightboxNext = () => {
  if (displayImages.value.length > 0) {
    lightboxImageIndex.value = (lightboxImageIndex.value + 1) % displayImages.value.length
  }
}

// Convert markdown to HTML
const renderMarkdown = (text) => {
  if (!text) return ''
  // Configure marked to preserve newlines as <br> tags and support tables
  marked.setOptions({
    breaks: true,
    gfm: true,
    tables: true
  })
  return marked(text)
}

onMounted(() => fetchPackage())
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-red mx-auto mb-4"></div>
      <p class="text-light-text">{{ $t('package_detail.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😞</div>
      <h2 class="text-2xl font-bold text-light-text mb-2">{{ error }}</h2>
      <button @click="router.back()" class="mt-4 px-6 py-3 bg-primary-red text-white font-bold rounded-xl hover:bg-primary-red/90 transition-colors duration-200">
        {{ $t('package_detail.back_to_packages') }}
      </button>
    </div>

    <!-- Package Detail Content -->
    <div v-else-if="packageData" class="space-y-12">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-light-text hover:text-primary-red transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          {{ $t('package_detail.back') }}
        </button>
        <div class="text-sm text-muted-text">
          {{ $t('package_detail.package_id') }}: {{ packageData.id }}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Left Column: Image Gallery -->
        <div class="space-y-6">
          <!-- Main Image Viewer -->
          <div class="bg-light-card border border-light-border rounded-3xl overflow-hidden shadow-lg">
            <div class="relative h-96 md:h-[500px] cursor-pointer" @click="openLightbox(selectedImageIndex)">
              <img
                :src="displayImages[selectedImageIndex] || '/placeholder-image.jpg'"
                :alt="packageData.name"
                class="w-full h-full object-contain bg-primary-gray/10"
              />
              <!-- Overlay indicator -->
              <div class="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div class="bg-white/90 backdrop-blur rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
              
              <!-- Navigation Buttons -->
              <div v-if="displayImages.length > 1" class="absolute inset-0 flex items-center justify-between px-4">
                <button @click="prevImage" class="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-200 flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button @click="nextImage" class="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-200 flex items-center justify-center backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Image Counter -->
              <div v-if="displayImages.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {{ selectedImageIndex + 1 }} / {{ displayImages.length }}
              </div>
            </div>
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="displayImages.length > 1" class="grid grid-cols-4 md:grid-cols-6 gap-3">
            <div
              v-for="(img, index) in displayImages"
              :key="index"
              @click="openLightbox(index)"
              :class="selectedImageIndex === index ? 'ring-2 ring-primary-red' : 'opacity-70 hover:opacity-100'"
              class="h-20 bg-light-card border border-light-border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Right Column: Package Information -->
        <div class="space-y-8">
          <!-- Package Header -->
          <div>
            <h1 class="text-4xl md:text-5xl font-black text-light-text mb-3">{{ packageData.name }}</h1>
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <span class="px-4 py-2 bg-primary-red/10 text-primary-red font-bold rounded-full">
                {{ packageData.duration }}
              </span>
              <div class="flex items-center text-muted-text">
                ✈️ <span class="ml-2 font-medium">{{ packageData.flight }}</span>
              </div>
            </div>
          </div>

          <!-- Price Section -->
          <div class="bg-gradient-to-r from-primary-red/5 to-primary-gold/5 border border-light-border rounded-2xl p-8">
            <p class="text-sm text-muted-text font-bold uppercase mb-1">{{ $t('package_detail.starting_from') }}</p>
            <p class="text-4xl font-black text-primary-red mb-4">{{ packageData.price }}</p>
            
            <div v-if="packageData.detailed_price" class="mt-4 pt-4 border-t border-light-border">
              <h3 class="text-lg font-bold text-light-text mb-3">{{ $t('package_detail.detailed_pricing') }}</h3>
              <div class="prose prose-sm max-w-none" v-html="renderMarkdown(packageData.detailed_price)"></div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="packageData.description" class="bg-light-card border border-light-border rounded-2xl p-8">
            <h2 class="text-2xl font-black text-light-text mb-4">{{ $t('package_detail.description') }}</h2>
            <div class="prose prose-lg max-w-none text-light-text" v-html="renderMarkdown(packageData.description)"></div>
          </div>

          <!-- Terms and Conditions -->
          <div v-if="packageData.terms" class="bg-light-card border border-light-border rounded-2xl p-8">
            <h2 class="text-2xl font-black text-light-text mb-4">{{ $t('package_detail.terms_conditions') }}</h2>
            <div class="prose prose-sm max-w-none text-light-text" v-html="renderMarkdown(packageData.terms)"></div>
          </div>

          
         </div>
       </div>
     </div>

    <!-- Lightbox Modal -->
    <div 
      v-if="showLightbox"
      @click.self="closeLightbox"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-5xl max-h-[90vh] w-full">
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute -top-12 right-0 text-white hover:text-primary-red transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image Container -->
        <div class="bg-light-card rounded-2xl overflow-hidden">
          <!-- Main Image -->
          <div class="relative">
            <img 
              :src="displayImages[lightboxImageIndex] || '/placeholder-image.jpg'"
              :alt="`${packageData?.name || 'Package'} - Image ${lightboxImageIndex + 1}`"
              class="w-full max-h-[70vh] object-contain bg-primary-gray/10"
            />
            
            <!-- Navigation Buttons -->
            <button
              v-if="displayImages.length > 1"
              @click.stop="lightboxPrev"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              v-if="displayImages.length > 1"
              @click.stop="lightboxNext"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Image Info -->
          <div class="p-6">
            <h2 class="text-2xl font-black text-light-text mb-2">{{ packageData?.name || 'Package' }}</h2>
            <p class="text-muted-text mb-4">
              Image {{ lightboxImageIndex + 1 }} of {{ displayImages.length }}
            </p>

            <!-- Thumbnail Strip -->
            <div v-if="displayImages.length > 1" class="flex gap-2 overflow-x-auto pt-2">
              <div 
                v-for="(imgUrl, index) in displayImages" 
                :key="index"
                @click="lightboxImageIndex = index"
                :class="lightboxImageIndex === index ? 'ring-2 ring-primary-red' : 'opacity-60 hover:opacity-100'"
                class="flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 transition-all duration-200"
              >
                <img :src="imgUrl" class="h-16 w-24 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: var(--light-text);
}
.prose :deep(a) {
  color: var(--primary-red);
  text-decoration: underline;
}
.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
}
.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
}
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  color: var(--light-text);
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.prose :deep(p) {
  margin-bottom: 1em;
  white-space: pre-wrap;
}
.prose :deep(pre),
.prose :deep(code) {
  font-family: monospace;
}
.prose :deep(table) {
  border-collapse: collapse !important;
  margin: 1.5em 0 !important;
  width: 100% !important;
  border: 2px solid var(--light-border) !important;
  white-space: normal !important;
}
.prose :deep(th), 
.prose :deep(td) {
  border: 1px solid var(--light-border) !important;
  padding: 0.75em 1em !important;
  text-align: left !important;
  vertical-align: top !important;
  white-space: normal !important;
}
.prose :deep(th) {
  background-color: var(--light-bg) !important;
  font-weight: bold !important;
  color: var(--light-text) !important;
}
.prose :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}
[data-theme="dark"] .prose :deep(tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
.prose :deep(tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
[data-theme="dark"] .prose :deep(tr:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}
</style>