<script setup>
import { ref, onMounted, computed } from 'vue'
import { pb } from '../lib/pocketbase'

const hotels = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedLocation = ref('all') // 'all', 'makkah', 'madinah'
const selectedHotel = ref(null) // Current hotel in lightbox
const selectedHotelImages = ref([]) // All images for current hotel (main + additional)
const activeHotelIndex = ref(0) // Current image index in selectedHotelImages

const fetchHotels = async () => {
  try {
    const hotelList = await pb.collection('hotels').getFullList()
    // Parse images string to array for each hotel
    hotels.value = hotelList.map(hotel => ({
      ...hotel,
      imagesArray: hotel.images ? hotel.images.split(',').map(img => img.trim()).filter(img => img) : []
    }))
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const filteredHotels = computed(() => {
  let filtered = hotels.value
  
  // Filter by location
  if (selectedLocation.value !== 'all') {
    filtered = filtered.filter(hotel => 
      hotel.location.toLowerCase().includes(selectedLocation.value.toLowerCase())
    )
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(hotel => 
      hotel.name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query) ||
      hotel.description.toLowerCase().includes(query) ||
      hotel.distance.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const openHotelLightbox = (hotel, sourceIndex = 0) => {
  // sourceIndex: -1 for main image, >=0 for additional images index
  const allImages = []
  // Add main image first
  if (hotel.image) {
    allImages.push(hotel.image)
  }
  // Add additional images
  if (hotel.imagesArray && hotel.imagesArray.length > 0) {
    allImages.push(...hotel.imagesArray)
  }
  
  selectedHotel.value = hotel
  selectedHotelImages.value = allImages
  // If sourceIndex is -1 (main), set index to 0, else offset by 1 because index 0 is main image
  activeHotelIndex.value = sourceIndex === -1 ? 0 : sourceIndex + 1
}

const closeHotelLightbox = () => {
  selectedHotel.value = null
  selectedHotelImages.value = []
  activeHotelIndex.value = 0
}

const prevHotelImage = () => {
  if (!selectedHotelImages.value || selectedHotelImages.value.length === 0) return
  activeHotelIndex.value = (activeHotelIndex.value - 1 + selectedHotelImages.value.length) % selectedHotelImages.value.length
}

const nextHotelImage = () => {
  if (!selectedHotelImages.value || selectedHotelImages.value.length === 0) return
  activeHotelIndex.value = (activeHotelIndex.value + 1) % selectedHotelImages.value.length
}

onMounted(() => fetchHotels())
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-black text-light-text mb-4">{{ $t('hotels.title') }}</h1>
      <p class="text-lg text-muted-text">{{ $t('hotels.subtitle') }}</p>
    </div>

    <!-- Search and Filter Bar -->
    <div class="mb-12">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Location Filter Tabs -->
        <div class="flex bg-light-card border border-light-border rounded-2xl p-1">
          <button
            @click="selectedLocation = 'all'"
            :class="selectedLocation === 'all' ? 'bg-primary-red text-white' : 'text-light-text hover:bg-light-border'"
            class="px-6 py-3 rounded-xl font-bold transition-colors duration -200"
          >
            {{ $t('hotels.all_locations') }}
          </button>
          <button
            @click="selectedLocation = 'makkah'"
            :class="selectedLocation === 'makkah' ? 'bg-primary-red text-white' : 'text-light-text hover:bg-light-border'"
            class="px-6 py-3 rounded-xl font-bold transition-colors duration-200"
          >
            {{ $t('hotels.makkah') }}
          </button>
          <button
            @click="selectedLocation = 'madinah'"
            :class="selectedLocation === 'madinah' ? 'bg-primary-red text-white' : 'text-light-text hover:bg-light-border'"
            class="px-6 py-3 rounded-xl font-bold transition-colors duration-200"
          >
            {{ $t('hotels.madinah') }}
          </button>
        </div>
        
        <!-- Search Bar -->
        <div class="flex-grow relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('hotels.search_placeholder')"
            class="w-full h-full px-6 py-3 pl-12 bg-light-card border border-light-border rounded-2xl text-light-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all duration-300"
          />
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div v-if="searchQuery || selectedLocation !== 'all'" class="mt-3 text-sm text-muted-text">
        {{ $t('hotels.filter_results', { count: filteredHotels.length, total: hotels.length }) }}
        <span v-if="selectedLocation !== 'all'" class="ml-2 px-2 py-1 bg-primary-red/10 text-primary-red rounded-full text-xs">
          {{ selectedLocation === 'makkah' ? $t('hotels.makkah') : $t('hotels.madinah') }}
        </span>
      </div>
    </div>

    <div v-if="filteredHotels.length === 0 && !loading" class="text-center py-12">
      <div class="text-6xl mb-4">🏨</div>
      <h3 class="text-2xl font-bold text-light-text mb-2">{{ $t('hotels.no_results') }}</h3>
      <p class="text-muted-text">{{ $t('hotels.no_results_hint') }}</p>
    </div>

    <div class="flex flex-col gap-12">
      <div v-for="hotel in filteredHotels" :key="hotel.id" class="bg-light-card rounded-3xl shadow-lg border border-light-border overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300">
        <!-- Details & Images -->
        <div class="md:w-1/2 flex flex-col">
           <!-- Main Image -->
           <div class="h-64 md:h-72 w-full relative cursor-pointer" @click="openHotelLightbox(hotel, -1)">
             <img :src="hotel.image || (hotel.imagesArray && hotel.imagesArray.length > 0 ? hotel.imagesArray[0] : '')" class="w-full h-full object-cover" />
             <!-- Hotel Star Classification Badge -->
             <div class="absolute top-4 right-4 bg-light-card/90 backdrop-blur px-4 py-2 rounded-full font-bold text-light-text shadow-sm flex items-center gap-1">
               <span v-for="star in parseInt(hotel.rating || 3)" :key="star" class="text-yellow-500">⭐</span>
               <span class="ml-1">Hotel Bintang {{ hotel.rating || 3 }}</span>
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
           <div v-if="hotel.imagesArray && hotel.imagesArray.length > 0" class="px-4 pt-4">
             <div class="flex gap-2 overflow-x-auto pb-2">
               <div 
                 v-for="(imgUrl, index) in hotel.imagesArray" 
                 :key="index" 
                 class="flex-shrink-0 cursor-pointer"
                 @click="openHotelLightbox(hotel, index)"
               >
                 <div :class="index === 0 ? 'ring-2 ring-primary-red' : ''" class="rounded-lg overflow-hidden border border-light-border">
                   <img :src="imgUrl" class="h-16 w-24 object-cover" />
                 </div>
               </div>
             </div>
           </div>
          <div class="p-8 flex-grow">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-3xl font-black text-light-text">{{ hotel.name }}</h2>
                <div class="text-muted-text mt-2 flex items-center font-medium text-lg">
                  📍 {{ hotel.location }}
                </div>
              </div>
              <span class="bg-gradient-to-r from-primary-red/20 to-primary-gold/20 text-primary-red px-4 py-2 text-sm font-bold rounded-full">{{ hotel.distance }}</span>
            </div>
            <p class="text-light-text leading-relaxed text-lg">{{ hotel.description }}</p>
            <div class="mt-8 pt-6 border-t border-light-border">
<div class="flex items-center gap-6">
                 <div class="flex items-center gap-2">
                   <div class="h-10 w-10 rounded-full bg-primary-red/10 flex items-center justify-center">
                     <span class="text-primary-red text-lg">⭐</span>
                   </div>
                   <div>
                     <div class="font-bold text-light-text">{{ hotel.rating || 3 }} Bintang</div>
                     <div class="text-sm text-muted-text">Hotel Classification</div>
                   </div>
                 </div>
                 <div class="flex items-center gap-2">
                   <div class="h-10 w-10 rounded-full bg-primary-gold/10 flex items-center justify-center">
                     <span class="text-primary-gold text-lg">📍</span>
                   </div>
                   <div>
                     <div class="font-bold text-light-text">{{ hotel.distance }}</div>
                     <div class="text-sm text-muted-text">Distance to Haram</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
        
        <!-- Interactive Map Embed -->
        <div class="md:w-1/2 p-4">
          <div class="w-full h-64 md:h-full bg-primary-gray/10 rounded-2xl overflow-hidden shadow-inner relative">
             <iframe
              :src="hotel.mapUrl"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="absolute inset-0"
            ></iframe>
          </div>
          <div class="mt-4 text-center">
            <a :href="hotel.mapUrl" target="_blank" class="inline-flex items-center gap-2 bg-light-card border border-light-border hover:border-primary-red text-light-text px-6 py-3 rounded-full font-bold transition-colors duration-200">
              <span>🗺️</span>
              {{ $t('hotels.view_map') }}
            </a>
          </div>
         </div>
       </div>
     </div>

    <!-- Hotel Image Lightbox Modal -->
    <div 
      v-if="selectedHotelImages.length > 0"
      @click.self="closeHotelLightbox"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-5xl max-h-[90vh] w-full">
        <!-- Close Button -->
        <button
          @click="closeHotelLightbox"
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
              :src="selectedHotelImages[activeHotelIndex]"
              :alt="`Hotel Image ${activeHotelIndex + 1}`"
              class="w-full max-h-[70vh] object-contain bg-primary-gray/10"
            />
            
            <!-- Navigation Buttons -->
            <button
              v-if="selectedHotelImages.length > 1"
              @click.stop="prevHotelImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              v-if="selectedHotelImages.length > 1"
              @click.stop="nextHotelImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-light-card/80 hover:bg-light-card text-light-text rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Image Info -->
          <div class="p-6">
            <h2 class="text-2xl font-black text-light-text mb-2">
              {{ selectedHotel?.name || 'Hotel' }}
            </h2>
            <p class="text-muted-text mb-4">
              Image {{ activeHotelIndex + 1 }} of {{ selectedHotelImages.length }}
            </p>

            <!-- Thumbnail Strip -->
            <div v-if="selectedHotelImages.length > 1" class="flex gap-2 overflow-x-auto pt-2">
              <div 
                v-for="(imgUrl, index) in selectedHotelImages" 
                :key="index"
                @click="activeHotelIndex = index"
                :class="activeHotelIndex === index ? 'ring-2 ring-primary-red' : 'opacity-60 hover:opacity-100'"
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
