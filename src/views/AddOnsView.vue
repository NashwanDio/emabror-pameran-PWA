<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'

const addons = ref([])
const loading = ref(true)
const searchQuery = ref('')

const fetchAddons = async () => {
  try {
    addons.value = await pb.collection('addons').getFullList()
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Parse images string to array
const parseImages = (imagesString) => {
  if (!imagesString) return []
  return imagesString.split(',').map(img => img.trim()).filter(img => img)
}

// Parse features string to array
const parseFeatures = (featuresString) => {
  if (!featuresString) return []
  return featuresString.split(',').map(feature => feature.trim()).filter(feature => feature)
}

const filteredAddons = computed(() => {
  // Filter by search query only
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    return addons.value.filter(addon => 
      addon.title.toLowerCase().includes(query) ||
      addon.description.toLowerCase().includes(query)
    )
  }
  
  return addons.value
})

onMounted(() => fetchAddons())
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-black text-light-text mb-4">{{ $t('addons.title') }}</h1>
      <p class="text-lg text-muted-text">{{ $t('addons.subtitle') }}</p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('addons.search_placeholder')"
          class="w-full px-6 py-4 pl-14 bg-light-card border border-light-border rounded-2xl text-light-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all duration-300"
        />
        <div class="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-text">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div v-if="searchQuery" class="mt-2 text-sm text-muted-text">
        {{ $t('addons.filter_results', { count: filteredAddons.length, total: addons.length }) }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-red mx-auto mb-4"></div>
      <p class="text-light-text">{{ $t('addons.loading') }}</p>
    </div>

    <!-- No Results -->
    <div v-else-if="filteredAddons.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">📦</div>
      <h3 class="text-2xl font-bold text-light-text mb-2">{{ $t('addons.no_results') }}</h3>
      <p class="text-muted-text">{{ $t('addons.no_results_hint') }}</p>
    </div>

    <!-- Addons Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="addon in filteredAddons" :key="addon.id" class="bg-light-card rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-light-border">
        <!-- Addon Image -->
        <div class="h-48 bg-primary-gray/10 relative">
          <img 
            :src="parseImages(addon.images)[0] || addon.icon || '/placeholder-addon.jpg'" 
            :alt="addon.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-4 left-4 bg-light-card/90 backdrop-blur px-4 py-1.5 rounded-full font-bold text-light-text shadow-sm">
            {{ addon.category }}
          </div>
        </div>
        
        <!-- Addon Content -->
        <div class="p-8 flex-grow flex flex-col">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-2xl font-black text-light-text leading-tight">{{ addon.title }}</h2>
            <div v-if="addon.price" class="text-primary-red font-black text-xl ml-4 whitespace-nowrap">
              {{ addon.price }}
            </div>
          </div>
          
          <p class="text-light-text mb-6 flex-grow">{{ addon.description }}</p>
          
          <!-- Features List -->
          <div v-if="parseFeatures(addon.features).length > 0" class="mb-6">
            <h3 class="text-sm font-bold text-muted-text uppercase mb-2">{{ $t('addons.features') }}</h3>
            <ul class="space-y-2">
              <li v-for="feature in parseFeatures(addon.features).slice(0, 3)" :key="feature" class="flex items-center text-sm text-light-text">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-red mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ feature }}
              </li>
              <li v-if="parseFeatures(addon.features).length > 3" class="text-sm text-muted-text">
                +{{ parseFeatures(addon.features).length - 3 }} more features
              </li>
            </ul>
          </div>
          
          <!-- Image Gallery Preview -->
          <div v-if="parseImages(addon.images).length > 1" class="mb-6">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <div v-for="(img, index) in parseImages(addon.images).slice(0, 4)" :key="index" class="flex-shrink-0">
                <img :src="img" class="h-16 w-24 object-cover rounded-lg border border-light-border" />
              </div>
              <div v-if="parseImages(addon.images).length > 4" class="flex-shrink-0 h-16 w-24 bg-primary-gray/10 rounded-lg border border-light-border flex items-center justify-center text-muted-text text-sm">
                +{{ parseImages(addon.images).length - 4 }}
              </div>
            </div>
          </div>
          
          <!-- CTA Button -->
          <router-link to="/guestbook" class="mt-auto w-full bg-gradient-to-r from-primary-red to-primary-gold hover:from-primary-red/90 hover:to-primary-gold/90 text-white text-center font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-lg">
            {{ $t('addons.inquire_now') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>