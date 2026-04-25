<script setup>
import { ref, onMounted } from 'vue'
import { pb } from '../lib/pocketbase'

const loading = ref(true)
const error = ref(null)
const termsImage = ref(null)

const fetchTerms = async () => {
  try {
    loading.value = true
    // Get the latest terms image
    const records = await pb.collection('terms_conditions').getList(1, 1, {
      sort: '-created',
      expand: 'image'
    })
    
    if (records.items.length > 0) {
      termsImage.value = records.items[0]
    } else {
      termsImage.value = null
    }
  } catch(e) {
    console.error('Error fetching terms:', e)
    error.value = 'Failed to load terms and conditions'
  } finally {
    loading.value = false
  }
}

const getImageUrl = (record) => {
  if (!record || !record.image) return null
  // Get the full URL for the image
  return pb.files.getUrl(record, record.image)
}

onMounted(() => fetchTerms())
</script>

<template>
  <div class="max-w-7xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-black text-light-text mb-4">Terms & Conditions</h1>
      <p class="text-muted-text max-w-2xl mx-auto">
        Please review our terms and conditions document. This document outlines the policies and guidelines for using our services.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-red mx-auto mb-4"></div>
      <p class="text-light-text">Loading terms and conditions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😞</div>
      <h2 class="text-2xl font-bold text-light-text mb-2">{{ error }}</h2>
      <p class="text-muted-text mb-6">Please try again later or contact support.</p>
    </div>

    <!-- No Terms State -->
    <div v-else-if="!termsImage" class="text-center py-20">
      <div class="text-6xl mb-4">📄</div>
      <h2 class="text-2xl font-bold text-light-text mb-2">No Terms Available</h2>
      <p class="text-muted-text">Terms and conditions document has not been uploaded yet.</p>
    </div>

    <!-- Terms Image Display -->
    <div v-else class="bg-light-card border border-light-border rounded-3xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-light-border bg-light-bg">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="text-xl font-bold text-light-text">{{ termsImage.title || 'Terms & Conditions' }}</h2>
            <p v-if="termsImage.description" class="text-muted-text mt-1">{{ termsImage.description }}</p>
            <p class="text-sm text-muted-text mt-2">
              Last updated: {{ new Date(termsImage.created).toLocaleDateString() }}
            </p>
          </div>
          <a 
            :href="getImageUrl(termsImage)" 
            target="_blank" 
            class="bg-primary-red hover:bg-primary-red/90 text-white px-6 py-3 rounded-lg font-bold transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Download PDF/Image
          </a>
        </div>
      </div>
      
      <!-- Image Display Area -->
      <div class="p-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-light-bg border border-light-border rounded-2xl p-8 flex items-center justify-center min-h-[800px]">
            <img 
              :src="getImageUrl(termsImage)" 
              :alt="termsImage.title || 'Terms and Conditions'"
              class="max-w-full max-h-[700px] object-contain shadow-lg rounded-lg"
              loading="lazy"
            />
          </div>
          
          <!-- Image Info -->
          <div class="mt-8 p-6 bg-light-bg border border-light-border rounded-2xl">
            <h3 class="text-lg font-bold text-light-text mb-4">Document Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted-text mb-1">Document Title</p>
                <p class="font-medium text-light-text">{{ termsImage.title || 'Not specified' }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-text mb-1">Upload Date</p>
                <p class="font-medium text-light-text">{{ new Date(termsImage.created).toLocaleDateString() }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-text mb-1">Document Type</p>
                <p class="font-medium text-light-text">Terms & Conditions</p>
              </div>
              <div>
                <p class="text-sm text-muted-text mb-1">File Format</p>
                <p class="font-medium text-light-text">{{ termsImage.image.split('.').pop().toUpperCase() }}</p>
              </div>
            </div>
            
            <div class="mt-6" v-if="termsImage.notes">
              <p class="text-sm text-muted-text mb-2">Additional Notes</p>
              <p class="text-light-text bg-light-card p-4 rounded-lg">{{ termsImage.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-12 bg-gradient-to-r from-primary-red/5 to-primary-gold/5 border border-light-border rounded-2xl p-8">
      <h3 class="text-2xl font-bold text-light-text mb-4">How to View</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-light-card p-6 rounded-xl border border-light-border">
          <div class="text-3xl mb-4">🔍</div>
          <h4 class="font-bold text-light-text mb-2">Zoom In/Out</h4>
          <p class="text-muted-text">Use your browser's zoom feature (Ctrl + +/-) to adjust the size for better readability.</p>
        </div>
        <div class="bg-light-card p-6 rounded-xl border border-light-border">
          <div class="text-3xl mb-4">📥</div>
          <h4 class="font-bold text-light-text mb-2">Download</h4>
          <p class="text-muted-text">Click the "Download PDF/Image" button to save a copy to your device.</p>
        </div>
        <div class="bg-light-card p-6 rounded-xl border border-light-border">
          <div class="text-3xl mb-4">🖨️</div>
          <h4 class="font-bold text-light-text mb-2">Print</h4>
          <p class="text-muted-text">Right-click on the image and select "Print" or use Ctrl+P to print the document.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for the image container */
.bg-light-bg::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.bg-light-bg::-webkit-scrollbar-track {
  background: var(--light-bg);
  border-radius: 4px;
}

.bg-light-bg::-webkit-scrollbar-thumb {
  background: var(--light-border);
  border-radius: 4px;
}

.bg-light-bg::-webkit-scrollbar-thumb:hover {
  background: var(--primary-gray);
}

/* Ensure image maintains aspect ratio */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>