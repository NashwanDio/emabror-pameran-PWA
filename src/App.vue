<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
const { locale } = useI18n()

const toggleLocale = () => {
  locale.value = locale.value === 'en' ? 'id' : 'en'
}

// Dark mode functionality
const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}

// Check saved theme preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-light-bg transition-colors duration-300">
    <header class="bg-light-card shadow-sm sticky top-0 z-50 transition-colors duration-300 border-b border-light-border">
      <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center">
          <img src="/logos/logo.png" alt="Em Abror Logo" class="h-20 w-auto object-contain" />
        </router-link>
        <nav class="hidden md:flex gap-8 font-semibold text-light-text items-center overflow-x-auto">
          <router-link to="/" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.home') }}</router-link>
          <router-link to="/packages" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.packages') }}</router-link>
          <router-link to="/hotels" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.hotels') }}</router-link>
          <router-link to="/addons" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.addons') }}</router-link>
          <router-link to="/media" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.media') }}</router-link>
          <router-link to="/guestbook" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">{{ $t('nav.guestbook') }}</router-link>
          <router-link to="/terms" class="hover:text-primary-red transition-colors duration-200 whitespace-nowrap">Terms & Conditions</router-link>
        </nav>
        <div class="flex items-center gap-4 text-lg">
          <button @click="toggleDarkMode" class="flex items-center bg-light-border hover:bg-primary-gray text-light-text px-4 py-2 rounded-full font-bold transition-colors duration-200">
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            {{ isDarkMode ? $t('nav.light') : $t('nav.dark') }}
          </button>
          <button @click="toggleLocale" class="flex items-center bg-light-border hover:bg-primary-gray text-light-text px-4 py-2 rounded-full font-bold transition-colors duration-200">
            <span :class="{'text-primary-red': locale === 'id'}">ID</span>
            <span class="mx-3 text-primary-gray">|</span>
            <span :class="{'text-primary-red': locale === 'en'}">EN</span>
          </button>
        </div>
      </div>
    </header>
    <main class="flex-grow">
      <router-view />
    </main>
    
    <!-- Footer with Contact Information -->
    <footer class="bg-light-card border-t border-light-border mt-16">
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Contact Information -->
          <div>
            <h3 class="text-xl font-black text-light-text mb-6">Our Contacts</h3>
            <div class="space-y-4">
              <!-- Office Phone -->
              <div class="flex items-start">
                <div class="h-10 w-10 rounded-full bg-primary-red/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-primary-red text-lg">🏢</span>
                </div>
                <div>
                  <div class="font-bold text-light-text">Office</div>
                  <a href="tel:0315312700" class="text-muted-text hover:text-primary-red transition-colors duration-200">
                    031 531 2700
                  </a>
                  <div class="text-sm text-muted-text mt-1">Not WhatsApp, direct phone call</div>
                </div>
              </div>
              
              <!-- Rio WhatsApp -->
              <div class="flex items-start">
                <div class="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-green-500 text-lg">👨‍💼</span>
                </div>
                <div>
                  <div class="font-bold text-light-text">Rio (WhatsApp)</div>
                  <a href="https://wa.me/6281333006546" target="_blank" class="text-muted-text hover:text-green-500 transition-colors duration-200">
                    0813 3300 6546
                  </a>
                  <div class="text-sm text-muted-text mt-1">Click to chat on WhatsApp</div>
                </div>
              </div>
              
              <!-- Deny WhatsApp -->
              <div class="flex items-start">
                <div class="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-green-500 text-lg">👨‍💼</span>
                </div>
                <div>
                  <div class="font-bold text-light-text">Deny (WhatsApp)</div>
                  <a href="https://wa.me/6281216338675" target="_blank" class="text-muted-text hover:text-green-500 transition-colors duration-200">
                    0812 1633 8675
                  </a>
                  <div class="text-sm text-muted-text mt-1">Click to chat on WhatsApp</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Address & Hours -->
          <div>
            <h3 class="text-xl font-black text-light-text mb-6">Location & Hours</h3>
            <div class="space-y-6">
              <!-- Address -->
              <div class="flex items-start">
                <div class="h-10 w-10 rounded-full bg-primary-gold/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-primary-gold text-lg">📍</span>
                </div>
                <div>
                  <div class="font-bold text-light-text mb-1">Address</div>
                  <div class="text-muted-text">
                    Jl. Urip Sumoharjo No. 41, Surabaya
                  </div>
                </div>
              </div>
              
              <!-- Operating Hours -->
              <div class="flex items-start">
                <div class="h-10 w-10 rounded-full bg-primary-red/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <span class="text-primary-red text-lg">🕒</span>
                </div>
                <div>
                  <div class="font-bold text-light-text mb-1">Operating Hours</div>
                  <div class="text-muted-text space-y-1">
                    <div>Monday - Friday: 09:00 – 16:00</div>
                    <div>Saturday: 09:00 – 15:00</div>
                    <div>Sunday: Closed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Social Media & Quick Links -->
          <div>
            <h3 class="text-xl font-black text-light-text mb-6">Follow Us</h3>
            <div class="space-y-6">
              <!-- Social Media Icons -->
              <div class="flex flex-wrap gap-4">
                <a href="https://instagram.com/emabror.travel" target="_blank" class="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                  </svg>
                </a>
                
                <a href="https://facebook.com/emabror.travel" target="_blank" class="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                  </svg>
                </a>
                
                <a href="https://tiktok.com/@emabror.travel" target="_blank" class="h-12 w-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
              
              <!-- Quick Links -->
              <div>
                <div class="text-light-text font-bold mb-3">Quick Links</div>
                <div class="flex flex-wrap gap-3">
                  <router-link to="/packages" class="px-4 py-2 bg-light-border hover:bg-primary-red hover:text-white text-light-text rounded-full font-medium transition-colors duration-200">
                    Packages
                  </router-link>
                  <router-link to="/hotels" class="px-4 py-2 bg-light-border hover:bg-primary-red hover:text-white text-light-text rounded-full font-medium transition-colors duration-200">
                    Hotels
                  </router-link>
                  <router-link to="/guestbook" class="px-4 py-2 bg-light-border hover:bg-primary-red hover:text-white text-light-text rounded-full font-medium transition-colors duration-200">
                    Guestbook
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Copyright -->
        <div class="mt-12 pt-8 border-t border-light-border text-center text-muted-text text-sm">
          <p>© 2024 Em Abror Travel. All rights reserved.</p>
          <p class="mt-1">Laporan Kerja Praktik - Departemen Teknik Informatika FTEIC ITS</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.router-link-exact-active {
  color: var(--primary-red);
  font-weight: 700;
}

/* Custom scrollbar for horizontal navigation */
nav.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

nav.overflow-x-auto::-webkit-scrollbar-track {
  background: var(--light-bg);
  border-radius: 3px;
}

nav.overflow-x-auto::-webkit-scrollbar-thumb {
  background: var(--light-border);
  border-radius: 3px;
}

nav.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: var(--primary-gray);
}
</style>