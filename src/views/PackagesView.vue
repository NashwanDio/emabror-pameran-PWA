<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'

const packages = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedPackage = ref(null) // Current package in lightbox
const selectedPackageImages = ref([]) // All images for current package (main + additional)
const activeImageIndex = ref(0) // Current image index in selectedPackageImages

const fetchPackages = async () => {
  try {
    const pkgList = await pb.collection('packages').getFullList()
    // Parse images string to array for each package
    packages.value = pkgList.map(pkg => ({
      ...pkg,
      imagesArray: pkg.images ? pkg.images.split(',').map(img => img.trim()).filter(img => img) : []
    }))
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value
  const query = searchQuery.value.toLowerCase()
  return packages.value.filter(pkg => 
    pkg.name.toLowerCase().includes(query) ||
    pkg.duration.toLowerCase().includes(query) ||
    pkg.flight.toLowerCase().includes(query) ||
    pkg.price.toLowerCase().includes(query)
  )
})

const openPackageLightbox = (pkg, sourceIndex = 0) => {
  // sourceIndex: -1 for main image, >=0 for additional images index
  const allImages = []
  // Add main image first
  if (pkg.image) {
    allImages.push(pkg.image)
  }
  // Add additional images
  if (pkg.imagesArray && pkg.imagesArray.length > 0) {
    allImages.push(...pkg.imagesArray)
  }
  
  selectedPackage.value = pkg
  selectedPackageImages.value = allImages
  // If sourceIndex is -1 (main), set index to 0, else offset by 1 because index 0 is main image
  activeImageIndex.value = sourceIndex === -1 ? 0 : sourceIndex + 1
}

const closePackageLightbox = () => {
  selectedPackage.value = null
  selectedPackageImages.value = []
  activeImageIndex.value = 0
}

const prevPackageImage = () => {
  if (!selectedPackageImages.value || selectedPackageImages.value.length === 0) return
  activeImageIndex.value = (activeImageIndex.value - 1 + selectedPackageImages.value.length) % selectedPackageImages.value.length
}

const nextPackageImage = () => {
  if (!selectedPackageImages.value || selectedPackageImages.value.length === 0) return
  activeImageIndex.value = (activeImageIndex.value + 1) % selectedPackageImages.value.length
}

onMounted(() => fetchPackages())
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-black text-light-text mb-4">{{ $t('packages.title') }}</h1>
      <p class="text-lg text-muted-text">{{ $t('packages.subtitle') }}</p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('packages.search_placeholder')"
          class="w-full px-6 py-4 pl-14 bg-light-card border border-light-border rounded-2xl text-light-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all duration-300"
        />
        <div class="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-text">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div v-if="searchQuery" class="mt-2 text-sm text-muted-text">
        {{ $t('packages.search_results', { count: filteredPackages.length, total: packages.length }) }}
      </div>
    </div>

    <div v-if="filteredPackages.length === 0 && !loading" class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-2xl font-bold text-light-text mb-2">{{ $t('packages.no_results') }}</h3>
      <p class="text-muted-text">{{ $t('packages.no_results_hint') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="pkg in filteredPackages" :key="pkg.id" class="bg-light-card rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-light-border">
        <!-- Main Image -->
        <div class="h-56 bg-primary-gray/10 relative cursor-pointer" @click="openPackageLightbox(pkg, -1)">
          <img :src="pkg.image" class="w-full h-full object-cover" />
          <div class="absolute top-4 right-4 bg-light-card/90 backdrop-blur px-4 py-1.5 rounded-full font-bold text-light-text shadow-sm">
            {{ pkg.duration }}
          </div>
          <!-- Overlay indicator -->
          <div class="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div class="bg-white/90 backdrop-blur rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
        <!-- Additional Images Gallery -->
        <div v-if="pkg.imagesArray && pkg.imagesArray.length > 0" class="px-4 pt-3 pb-1">
          <div class="flex gap-2 overflow-x-auto pb-2">
            <div 
              v-for="(imgUrl, index) in pkg.imagesArray" 
              :key="index" 
              class="flex-shrink-0 cursor-pointer"
              @click="openPackageLightbox(pkg, index)"
            >
              <div :class="index === 0 ? 'ring-2 ring-primary-red' : ''" class="rounded-lg overflow-hidden border border-light-border">
                <img :src="imgUrl" class="h-12 w-16 object-cover" />
              </div>
            </div>
          </div>
        </div>
        <div class="p-8 flex-grow flex flex-col">
          <h2 class="text-2xl font-black text-light-text mb-2 leading-tight">{{ pkg.name }}</h2>
          <div class="flex items-center text-muted-text mb-6 font-medium">
            ✈️ <span class="ml-2">{{ pkg.flight }}</span>
          </div>
          <div class="mt-auto">
            <p class="text-sm text-muted-text font-bold uppercase mb-1">{{ $t('packages.starting_from') }}</p>
            <p class="text-3xl font-black text-primary-red mb-6">{{ pkg.price }}</p>
            <router-link :to="'/package/' + pkg.id" class="block w-full bg-gradient-to-r from-primary-red to-primary-gold hover:from-primary-red/90 hover:to-primary-gold/90 text-white text-center font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-lg">
              {{ $t('packages.view_details') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Package Image Lightbox Modal -->
    <div 
      v-if="selectedPackageImages.length > 0"
      @click.self="closePackageLightbox"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-5xl max-h-[90vh] w-full">
        <!-- Close Button -->
        <button
          @click="closePackageLightbox"
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
              :src="selectedPackageImages[activeImageIndex]"
              :alt="`${selectedPackage?.name || 'Package'} - Image ${activeImageIndex + 1}`"
              class="w-full max-h-[70vh] object-contain bg-primary-gray/10"
            />
            
            <!-- Navigation Buttons -->
            <button
              v-if="selectedPackageImages.length > 1"
              @click.stop="prevPackageImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              v-if="selectedPackageImages.length > 1"
              @click.stop="nextPackageImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Image Info -->
          <div class="p-6">
            <h2 class="text-2xl font-black text-light-text mb-2">{{ selectedPackage?.name || 'Package' }}</h2>
            <p class="text-muted-text mb-4">
              Image {{ activeImageIndex + 1 }} of {{ selectedPackageImages.length }}
            </p>

            <!-- Thumbnail Strip -->
            <div v-if="selectedPackageImages.length > 1" class="flex gap-2 overflow-x-auto pt-2">
              <div 
                v-for="(imgUrl, index) in selectedPackageImages" 
                :key="index"
                @click="activeImageIndex = index"
                :class="activeImageIndex === index ? 'ring-2 ring-primary-red' : 'opacity-60 hover:opacity-100'"
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
</style>
