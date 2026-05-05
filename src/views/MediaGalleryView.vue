<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'

const mediaItems = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTab = ref('images') // 'images', 'videos'
const selectedMedia = ref(null)

const fetchMedia = async () => {
  try {
    mediaItems.value = await pb.collection('media').getFullList({
      sort: '-date'
    })
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const images = computed(() => {
  return mediaItems.value.filter(item => 
    item.type?.toLowerCase() === 'image' || 
    (!item.type && item.image_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  )
})

const videos = computed(() => {
  return mediaItems.value.filter(item => 
    item.type?.toLowerCase() === 'video' || 
    item.video_url || 
    item.image_url?.match(/\.(mp4|webm|ogg)$/i)
  )
})

const filteredMedia = computed(() => {
  const items = selectedTab.value === 'images' ? images.value : videos.value
  
  // Filter by search query only
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }
  
  return items
})

function thumbnailUrl(item) {
  const url = item.thumbnail_url || item.image_url
  if (!url) return ''
  const match = url.match(/\/file\/d\/([^/]+)\//)
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=s600`
  }
  return url
}

const openLightbox = (item) => {
  selectedMedia.value = item
}

const closeLightbox = () => {
  selectedMedia.value = null
}

onMounted(() => fetchMedia())
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-black text-light-text mb-4">{{ $t('media.title') }}</h1>
      <p class="text-lg text-muted-text">{{ $t('media.subtitle') }}</p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('media.search_placeholder')"
          class="w-full px-6 py-4 pl-14 bg-light-card border border-light-border rounded-2xl text-light-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all duration-300"
        />
        <div class="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-text">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div v-if="searchQuery" class="mt-2 text-sm text-muted-text">
        {{ $t('media.filter_results', { count: filteredMedia.length, total: selectedTab.value === 'images' ? images.length : videos.length }) }}
      </div>
    </div>

    <!-- Tab Selector -->
    <div class="flex justify-center mb-8">
      <div class="inline-flex bg-light-card border border-light-border rounded-2xl p-1">
        <button
          @click="selectedTab = 'images'"
          :class="selectedTab === 'images' ? 'bg-primary-red text-white' : 'text-light-text hover:bg-light-border'"
          class="px-8 py-3 rounded-xl font-bold transition-colors duration-200"
        >
          Images ({{ images.length }})
        </button>
        <button
          @click="selectedTab = 'videos'"
          :class="selectedTab === 'videos' ? 'bg-primary-red text-white' : 'text-light-text hover:bg-light-border'"
          class="px-8 py-3 rounded-xl font-bold transition-colors duration-200"
        >
          Videos ({{ videos.length }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-red mx-auto mb-4"></div>
      <p class="text-light-text">{{ $t('media.loading') }}</p>
    </div>

    <!-- No Results -->
    <div v-else-if="filteredMedia.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">📷</div>
      <h3 class="text-2xl font-bold text-light-text mb-2">{{ $t('media.no_results') }}</h3>
      <p class="text-muted-text">{{ $t('media.no_results_hint') }}</p>
    </div>

    <!-- Media Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="item in filteredMedia" 
        :key="item.id"
        @click="openLightbox(item)"
        class="group cursor-pointer"
      >
        <div class="bg-light-card rounded-2xl overflow-hidden shadow-lg border border-light-border hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
          <!-- Thumbnail -->
          <div class="h-56 bg-primary-gray/10 relative overflow-hidden">
            <img 
              :src="thumbnailUrl(item)" 
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <!-- Video Indicator -->
            <div v-if="item.type === 'video'" class="absolute inset-0 flex items-center justify-center bg-black/30">
              <div class="bg-primary-red/90 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div v-if="item.category" class="absolute top-3 left-3 bg-light-card/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-light-text shadow-sm">
              {{ item.category }}
            </div>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <div class="bg-white/90 backdrop-blur rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Media Info -->
          <div class="p-4">
            <h3 class="font-bold text-light-text mb-1 line-clamp-1">{{ item.title }}</h3>
            <p v-if="item.description" class="text-sm text-muted-text line-clamp-2 mb-2">{{ item.description }}</p>
            <div v-if="item.date" class="text-xs text-muted-text flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ new Date(item.date).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div 
      v-if="selectedMedia"
      @click.self="closeLightbox"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-4xl max-h-[90vh] w-full">
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute -top-12 right-0 text-white hover:text-primary-red transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="bg-light-card rounded-2xl overflow-hidden">
          <!-- Media Content -->
          <div class="relative">
            <!-- Image -->
            <img 
              v-if="selectedMedia.image_url && selectedMedia.type !== 'video'"
              :src="selectedMedia.image_url" 
              :alt="selectedMedia.title"
              class="w-full max-h-[70vh] object-contain bg-primary-gray/10"
            />
            <!-- Video -->
            <iframe
              v-else-if="selectedMedia.type === 'video' && selectedMedia.image_url"
              :src="selectedMedia.image_url"
              allow="autoplay; fullscreen"
              allowfullscreen
              class="w-full h-[70vh] bg-primary-gray/10"
              style="border: none;"
            ></iframe>
          </div>

          <!-- Media Info -->
          <div class="p-6">
            <h2 class="text-2xl font-black text-light-text mb-2">{{ selectedMedia.title }}</h2>
            <div v-if="selectedMedia.category" class="inline-block px-3 py-1 bg-primary-red/10 text-primary-red font-bold rounded-full text-sm mb-3">
              {{ selectedMedia.category }}
            </div>
            <p v-if="selectedMedia.description" class="text-light-text mb-4">{{ selectedMedia.description }}</p>
            <div v-if="selectedMedia.date" class="text-sm text-muted-text">
              {{ new Date(selectedMedia.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>