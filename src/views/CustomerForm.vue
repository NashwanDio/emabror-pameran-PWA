<script setup>
import { ref } from 'vue'
import { pb } from '../lib/pocketbase'

const name = ref('')
const phone = ref('')
const origin = ref('')
const interestedPackage = ref('')
const isSubmitting = ref(false)
const message = ref({ text: '', type: '' })

const submitForm = async () => {
  isSubmitting.value = true
  message.value = { text: '', type: '' }

  try {
    const data = {
      Name: name.value,
      Phone: phone.value,
      Origin: origin.value,
      InterestedPackage: interestedPackage.value,
    }

    await pb.collection('Customers').create(data)
    
    // Success State
    message.value = { text: 'success', type: 'success' }
    
    // Reset Form
    name.value = ''
    phone.value = ''
    origin.value = ''
    interestedPackage.value = ''
  } catch (error) {
    message.value = { text: 'error', type: 'error' }
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="py-16 px-4 flex items-center justify-center">
    <div class="w-full max-w-2xl bg-light-card rounded-3xl shadow-xl p-10 border border-light-border">
      
      <header class="mb-10 text-center">
        <h1 class="text-4xl font-black text-light-text mb-2">{{ $t('guestbook.title') }}</h1>
        <p class="text-lg text-muted-text">{{ $t('guestbook.subtitle') }}</p>
      </header>

      <form @submit.prevent="submitForm" class="space-y-8">
        <div>
          <label class="block text-sm font-bold text-light-text mb-3 uppercase tracking-wide">{{ $t('guestbook.fullname') }}</label>
          <input 
            v-model="name"
            type="text" 
            required
            class="w-full h-16 px-6 text-xl rounded-2xl border-2 border-light-border focus:border-primary-red focus:ring-4 focus:ring-primary-red/20 outline-none transition-all bg-light-bg text-light-text"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-light-text mb-3 uppercase tracking-wide">{{ $t('guestbook.phone') }}</label>
          <input 
            v-model="phone"
            type="tel" 
            required
            class="w-full h-16 px-6 text-xl rounded-2xl border-2 border-light-border focus:border-primary-red focus:ring-4 focus:ring-primary-red/20 outline-none transition-all bg-light-bg text-light-text"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-light-text mb-3 uppercase tracking-wide">{{ $t('guestbook.origin') }}</label>
          <input 
            v-model="origin"
            type="text" 
            required
            class="w-full h-16 px-6 text-xl rounded-2xl border-2 border-light-border focus:border-primary-red focus:ring-4 focus:ring-primary-red/20 outline-none transition-all bg-light-bg text-light-text"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-light-text mb-3 uppercase tracking-wide">{{ $t('guestbook.package') }}</label>
          <input 
            v-model="interestedPackage"
            type="text" 
            :placeholder="$t('guestbook.select_package')"
            class="w-full h-16 px-6 text-xl rounded-2xl border-2 border-light-border focus:border-primary-red focus:ring-4 focus:ring-primary-red/20 outline-none transition-all bg-light-bg text-light-text"
          />
        </div>

        <div v-if="message.text" :class="message.type === 'success' ? 'bg-green-100/20 text-green-600 border border-green-600/20' : 'bg-red-100/20 text-red-600 border border-red-600/20'" class="p-4 rounded-xl text-center font-bold">
          {{ message.type === 'success' ? $t('guestbook.success') : $t('guestbook.error') }}
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full h-20 bg-gradient-to-r from-primary-red to-primary-gold hover:from-primary-red/90 hover:to-primary-gold/90 active:from-primary-red active:to-primary-gold text-white text-2xl font-black rounded-2xl shadow-lg shadow-primary-red/30 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {{ isSubmitting ? $t('guestbook.submitting') : $t('guestbook.submit') }}
        </button>
      </form>

    </div>
  </div>
</template>
