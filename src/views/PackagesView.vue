<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'

const packages = ref([])
const loading = ref(true)
const searchQuery = ref('')

const fetchPackages = async () => {
  try {
    packages.value = await pb.collection('packages').getFullList()
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
        <div class="h-56 bg-primary-gray/10 relative">
          <img :src="pkg.image" class="w-full h-full object-cover" />
          <div class="absolute top-4 right-4 bg-light-card/90 backdrop-blur px-4 py-1.5 rounded-full font-bold text-light-text shadow-sm">
            {{ pkg.duration }}
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
  </div>
</template>
