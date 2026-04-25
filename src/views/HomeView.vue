<script setup>
</script>

<template>
  <div class="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
    <!-- Background image with overlay -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-red/10 via-primary-gold/5 to-primary-gray/5"></div>
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb')] bg-cover bg-center opacity-20"></div>
    </div>
    
    <div class="relative z-10 w-full max-w-6xl mx-auto">
      <div class="mb-12 text-center">
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-light-text mb-6 leading-tight">{{ $t('home.welcome') }}</h1>
        <p class="text-xl md:text-2xl lg:text-3xl text-muted-text max-w-3xl mx-auto mb-8">{{ $t('home.subtitle') }}</p>
        <div class="inline-flex items-center justify-center gap-3 bg-light-card/80 backdrop-blur-sm px-6 py-3 rounded-full border border-light-border">
          <div class="h-3 w-3 rounded-full bg-primary-red animate-pulse"></div>
          <span class="text-lg font-semibold text-primary-gold">{{ $t('home.slogan') }}</span>
        </div>
      </div>
      
      <div class="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto justify-center items-stretch">
        <!-- Main CTA Card -->
        <router-link to="/guestbook" class="group flex-1 bg-gradient-to-br from-primary-red to-primary-gold text-white p-8 rounded-3xl text-2xl font-bold shadow-2xl shadow-primary-red/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl hover:shadow-primary-red/50">
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="mb-6 text-4xl">📝</div>
            <div class="text-3xl md:text-4xl font-black mb-4">{{ $t('home.guestbook_btn') }}</div>
            <p class="text-lg opacity-90">{{ $t('home.guestbook_desc') }}</p>
          </div>
        </router-link>
        
        <!-- Secondary Cards -->
        <div class="flex-1 flex flex-col gap-8">
          <router-link to="/packages" class="group bg-light-card border-2 border-light-border text-light-text p-8 rounded-3xl text-xl font-bold shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-red/50">
            <div class="flex items-center gap-6">
              <div class="text-3xl">🎒</div>
              <div class="text-left flex-1">
                <div class="text-2xl md:text-3xl font-black mb-2">{{ $t('home.packages_btn') }}</div>
                <p class="text-muted-text text-lg">{{ $t('home.packages_desc') }}</p>
              </div>
            </div>
          </router-link>
          
          <router-link to="/hotels" class="group bg-light-card border-2 border-light-border text-light-text p-8 rounded-3xl text-xl font-bold shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-gold/50">
            <div class="flex items-center gap-6">
              <div class="text-3xl">🏨</div>
              <div class="text-left flex-1">
                <div class="text-2xl md:text-3xl font-black mb-2">{{ $t('home.hotels_btn') }}</div>
                <p class="text-muted-text text-lg">{{ $t('home.hotels_desc') }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- Stats Section -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        <div class="bg-light-card/80 backdrop-blur-sm p-6 rounded-2xl border border-light-border text-center">
          <div class="text-3xl font-black text-primary-red">500+</div>
          <div class="text-muted-text mt-2">{{ $t('home.stats_customers') }}</div>
        </div>
        <div class="bg-light-card/80 backdrop-blur-sm p-6 rounded-2xl border border-light-border text-center">
          <div class="text-3xl font-black text-primary-gold">50+</div>
          <div class="text-muted-text mt-2">{{ $t('home.stats_packages') }}</div>
        </div>
        <div class="bg-light-card/80 backdrop-blur-sm p-6 rounded-2xl border border-light-border text-center">
          <div class="text-3xl font-black text-primary-red">100+</div>
          <div class="text-muted-text mt-2">{{ $t('home.stats_hotels') }}</div>
        </div>
        <div class="bg-light-card/80 backdrop-blur-sm p-6 rounded-2xl border border-light-border text-center">
          <div class="text-3xl font-black text-primary-gold">99%</div>
          <div class="text-muted-text mt-2">{{ $t('home.stats_satisfaction') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-shadow {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
}
</style>
