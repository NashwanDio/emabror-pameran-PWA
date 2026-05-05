<script setup>
import { ref, onMounted } from 'vue'
import { pb } from '../lib/pocketbase'

const isLoggedIn = ref(pb.authStore.isValid)
const email = ref('')
const password = ref('')
const error = ref('')

// Tabs
const currentTab = ref('guestbook')

// Data
const customers = ref([])
const packages = ref([])
const hotels = ref([])
const addons = ref([])
const media = ref([])
const terms = ref([])

// Forms
const newPackage = ref({ name: '', duration: '', price: '', flight: '', image: '', images: '', description: '', terms: '', detailed_price: '' })
const newHotel = ref({ name: '', location: '', distance: '', rating: '3', description: '', image: '', images: '', mapUrl: '' })
const newAddon = ref({ title: '', category: '', description: '', images: '', icon: '', price: '', features: '' })
const newMedia = ref({ title: '', description: '', image_url: '', thumbnail_url: '', category: '', type: '', date: '' })
const newTerms = ref({ title: '', description: '', notes: '', image: '' })

// Edit states
const editingPackage = ref(null)
const editingHotel = ref(null)
const editingAddon = ref(null)
const editingMedia = ref(null)
const editingTerms = ref(null)

// 1. Auth Functions
const login = async () => {
  try {
    await pb.admins.authWithPassword(email.value, password.value)
    isLoggedIn.value = true
    error.value = ''
    fetchAll()
  } catch (err) {
    error.value = "Invalid credentials."
  }
}

const logout = () => {
  pb.authStore.clear()
  isLoggedIn.value = false
}

// 2. Fetch Data
const fetchAll = () => {
  fetchCustomers()
  fetchPackages()
  fetchHotels()
  fetchAddons()
  fetchMedia()
  fetchTerms()
}

const fetchCustomers = async () => {
  try { customers.value = (await pb.collection('Customers').getList(1, 200)).items } catch (e) { console.error(e) }
}
const fetchPackages = async () => {
  try { packages.value = await pb.collection('packages').getFullList() } catch (e) { console.error(e) }
}
const fetchHotels = async () => {
  try { hotels.value = await pb.collection('hotels').getFullList() } catch (e) { console.error(e) }
}
const fetchAddons = async () => {
  try { addons.value = await pb.collection('addons').getFullList() } catch (e) { console.error(e) }
}
const fetchMedia = async () => {
  try { media.value = await pb.collection('media').getFullList({ sort: '-date' }) } catch (e) { console.error(e) }
}

const fetchTerms = async () => {
  try { terms.value = await pb.collection('terms_conditions').getFullList() } catch (e) { console.error(e) }
}

// 5. Customer management
const deleteCustomer = async (id) => {
  if(confirm("Delete this customer entry?")) {
    try {
      await pb.collection('Customers').delete(id)
      fetchCustomers()
    } catch (e) { console.error(e) }
  }
}

const deleteAllCustomers = async () => {
  if(confirm("Are you sure you want to delete ALL customer entries? This cannot be undone!")) {
    try {
      for (const customer of customers.value) {
        await pb.collection('Customers').delete(customer.id)
      }
      fetchCustomers()
    } catch (e) { console.error(e) }
  }
}

// 6. Bulk operations
const deleteAllPackages = async () => {
  if(confirm("Are you sure you want to delete ALL packages? This cannot be undone!")) {
    try {
      for (const pkg of packages.value) {
        await pb.collection('packages').delete(pkg.id)
      }
      fetchPackages()
    } catch (e) { console.error(e) }
  }
}

const deleteAllHotels = async () => {
  if(confirm("Are you sure you want to delete ALL hotels? This cannot be undone!")) {
    try {
      for (const hotel of hotels.value) {
        await pb.collection('hotels').delete(hotel.id)
      }
      fetchHotels()
    } catch (e) { console.error(e) }
  }
}

// 5. Add/Edit/Delete Add-ons
const addAddon = async () => {
  try {
    await pb.collection('addons').create(newAddon.value)
    fetchAddons()
    newAddon.value = { title: '', category: '', description: '', images: '', icon: '', price: '', features: '' }
  } catch (e) { console.error(e) }
}

const editAddon = (addon) => {
  editingAddon.value = { ...addon }
}

const updateAddon = async () => {
  try {
    await pb.collection('addons').update(editingAddon.value.id, editingAddon.value)
    fetchAddons()
    editingAddon.value = null
  } catch (e) { console.error(e) }
}

const cancelEditAddon = () => {
  editingAddon.value = null
}

const deleteAddon = async (id) => {
  if(confirm("Delete this add-on?")) {
    try {
      await pb.collection('addons').delete(id)
      fetchAddons()
    } catch (e) { console.error(e) }
  }
}

const deleteAllAddons = async () => {
  if(confirm("Are you sure you want to delete ALL add-ons? This cannot be undone!")) {
    try {
      for (const addon of addons.value) {
        await pb.collection('addons').delete(addon.id)
      }
      fetchAddons()
    } catch (e) { console.error(e) }
  }
}

const exportAddonsToCSV = () => {
  if (addons.value.length === 0) {
    alert('No add-on data to export')
    return
  }
  
  const headers = ['Title', 'Category', 'Description', 'Images', 'Icon', 'Price', 'Features', 'ID']
  const csvData = addons.value.map(a => [
    a.title,
    a.category || '',
    a.description,
    a.images || '',
    a.icon || '',
    a.price || '',
    a.features || '',
    a.id
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `addons_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 6. Add/Edit/Delete Media
const addMedia = async () => {
  try {
    await pb.collection('media').create(newMedia.value)
    fetchMedia()
    newMedia.value = { title: '', description: '', image_url: '', thumbnail_url: '', category: '', type: '', date: '' }
  } catch (e) { console.error(e) }
}

const editMedia = (item) => {
  editingMedia.value = { ...item }
}

const updateMedia = async () => {
  try {
    await pb.collection('media').update(editingMedia.value.id, editingMedia.value)
    fetchMedia()
    editingMedia.value = null
  } catch (e) { console.error(e) }
}

const cancelEditMedia = () => {
  editingMedia.value = null
}

const deleteMedia = async (id) => {
  if(confirm("Delete this media item?")) {
    try {
      await pb.collection('media').delete(id)
      fetchMedia()
    } catch (e) { console.error(e) }
  }
}

// 7. Add/Edit/Delete Terms & Conditions
const addTerms = async () => {
  try {
    await pb.collection('terms_conditions').create({
      title: newTerms.value.title || '',
      description: newTerms.value.description || '',
      notes: newTerms.value.notes || '',
      image: newTerms.value.image || ''
    })
    fetchTerms()
    newTerms.value = { title: '', description: '', notes: '', image: '' }
  } catch (e) { console.error(e) }
}

const editTerms = (term) => {
  editingTerms.value = { ...term }
}

const updateTerms = async () => {
  try {
    await pb.collection('terms_conditions').update(editingTerms.value.id, {
      title: editingTerms.value.title || '',
      description: editingTerms.value.description || '',
      notes: editingTerms.value.notes || '',
      image: editingTerms.value.image || ''
    })
    fetchTerms()
    editingTerms.value = null
  } catch (e) { console.error(e) }
}

const cancelEditTerms = () => {
  editingTerms.value = null
}

const deleteTerms = async (id) => {
  if(confirm("Delete this terms & conditions document?")) {
    try {
      await pb.collection('terms_conditions').delete(id)
      fetchTerms()
    } catch (e) { console.error(e) }
  }
}



const deleteAllMedia = async () => {
  if(confirm("Are you sure you want to delete ALL media items? This cannot be undone!")) {
    try {
      for (const item of media.value) {
        await pb.collection('media').delete(item.id)
      }
      fetchMedia()
    } catch (e) { console.error(e) }
  }
}

const exportMediaToCSV = () => {
  if (media.value.length === 0) {
    alert('No media data to export')
    return
  }
  
  const headers = ['Title', 'Description', 'Image URL', 'Thumbnail URL', 'Category', 'Type', 'Date', 'ID']
  const csvData = media.value.map(m => [
    m.title,
    m.description || '',
    m.image_url,
    m.thumbnail_url || '',
    m.category || '',
    m.type || '',
    m.date || '',
    m.id
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `media_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportPackagesToCSV = () => {
  if (packages.value.length === 0) {
    alert('No package data to export')
    return
  }
  
  const headers = ['Name', 'Duration', 'Price', 'Flight', 'Image URL', 'ID']
  const csvData = packages.value.map(p => [
    p.name,
    p.duration,
    p.price,
    p.flight,
    p.image,
    p.id
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `packages_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportHotelsToCSV = () => {
  if (hotels.value.length === 0) {
    alert('No hotel data to export')
    return
  }
  
  const headers = ['Name', 'Location', 'Distance', 'Rating', 'Description', 'Main Image', 'Additional Images', 'Map URL', 'ID']
  const csvData = hotels.value.map(h => [
    h.name,
    h.location,
    h.distance,
    h.rating || '3',
    h.description,
    h.image || '',
    h.images ? (Array.isArray(h.images) ? h.images.join('; ') : h.images) : '',
    h.mapUrl,
    h.id
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `hotels_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportToCSV = () => {
  if (customers.value.length === 0) {
    alert('No customer data to export')
    return
  }
  
  const headers = ['Name', 'Phone', 'Origin', 'Package', 'ID', 'Collection Name']
  const csvData = customers.value.map(c => [
    c.Name,
    c.Phone,
    c.Origin,
    c.InterestedPackage || '',
    c.id,
    c.collectionName
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 3. Add/Edit/Delete Packages
const addPackage = async () => {
  try {
    await pb.collection('packages').create(newPackage.value)
    fetchPackages()
    newPackage.value = { name: '', duration: '', price: '', flight: '', image: '', images: '', description: '', terms: '', detailed_price: '' }
  } catch (e) { console.error(e) }
}

const editPackage = (pkg) => {
  editingPackage.value = { ...pkg }
}

const updatePackage = async () => {
  try {
    await pb.collection('packages').update(editingPackage.value.id, editingPackage.value)
    fetchPackages()
    editingPackage.value = null
  } catch (e) { console.error(e) }
}

const cancelEditPackage = () => {
  editingPackage.value = null
}

const deletePackage = async (id) => {
  if(confirm("Delete this package?")) {
    await pb.collection('packages').delete(id)
    fetchPackages()
  }
}

// 4. Add/Edit/Delete Hotels
const addHotel = async () => {
  try {
    // Store images as comma-separated string
    const hotelData = {
      ...newHotel.value,
      rating: newHotel.value.rating || '3',
      images: newHotel.value.images || ''
    }
    
    await pb.collection('hotels').create(hotelData)
    fetchHotels()
    newHotel.value = { 
      name: '', 
      location: '', 
      distance: '', 
      description: '', 
      image: '', 
      images: '',
      rating: '3',
      mapUrl: '' 
    }
  } catch (e) { console.error(e) }
}

const editHotel = (hotel) => {
  editingHotel.value = { ...hotel }
}

const updateHotel = async () => {
  try {
    const hotelData = {
      ...editingHotel.value,
      images: editingHotel.value.images || ''
    }
    await pb.collection('hotels').update(editingHotel.value.id, hotelData)
    fetchHotels()
    editingHotel.value = null
  } catch (e) { console.error(e) }
}

const cancelEditHotel = () => {
  editingHotel.value = null
}

const deleteHotel = async (id) => {
  if(confirm("Delete this hotel?")) {
    await pb.collection('hotels').delete(id)
    fetchHotels()
  }
}

onMounted(() => {
  if (isLoggedIn.value) fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-light-bg p-8 transition-colors duration-300">
    
    <div v-if="!isLoggedIn" class="max-w-md mx-auto bg-light-card p-8 rounded-2xl shadow-lg mt-20 border border-light-border">
      <h2 class="text-2xl font-bold mb-6 text-light-text text-center">Admin Login</h2>
      <form @submit.prevent="login" class="space-y-4">
        <input v-model="email" type="email" placeholder="Admin Email" class="w-full p-4 border border-light-border rounded-xl bg-light-bg text-light-text" required />
        <input v-model="password" type="password" placeholder="Password" class="w-full p-4 border border-light-border rounded-xl bg-light-bg text-light-text" required />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="w-full bg-primary-red hover:bg-primary-red/90 text-white p-4 rounded-xl font-bold transition-colors duration-200">Login</button>
            </form>
          </div>

          <!-- Edit Package Form -->
          <div v-if="editingPackage" class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <h2 class="text-xl font-bold text-light-text mb-4">Edit Package</h2>
            <form @submit.prevent="updatePackage" class="grid grid-cols-2 gap-4">
              <input v-model="editingPackage.name" type="text" placeholder="Package Name" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingPackage.duration" type="text" placeholder="Duration" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingPackage.price" type="text" placeholder="Starting Price" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingPackage.flight" type="text" placeholder="Flight Info" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingPackage.image" type="text" placeholder="Main Image URL" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingPackage.images" type="text" placeholder="Additional Image URLs" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="editingPackage.description" placeholder="Package Description" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <textarea v-model="editingPackage.terms" placeholder="Terms & Conditions" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <textarea v-model="editingPackage.detailed_price" placeholder="Detailed Pricing Information" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <div class="col-span-2 flex gap-2">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Update Package</button>
                <button @click="cancelEditPackage" type="button" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
              </div>
            </form>
          </div>

    <div v-else class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-black text-light-text">Shop CMS</h1>
        <button @click="logout" class="bg-primary-red hover:bg-primary-red/90 text-white px-6 py-2 rounded-lg font-bold transition-colors duration-200">Logout</button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex space-x-4 mb-8 bg-light-card p-2 rounded-xl shadow-sm border border-light-border overflow-x-auto">
        <button @click="currentTab = 'guestbook'" :class="currentTab === 'guestbook' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Guestbook</button>
        <button @click="currentTab = 'packages'" :class="currentTab === 'packages' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Manage Packages</button>
        <button @click="currentTab = 'hotels'" :class="currentTab === 'hotels' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Manage Hotels</button>
        <button @click="currentTab = 'addons'" :class="currentTab === 'addons' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Manage Add-ons</button>
        <button @click="currentTab = 'media'" :class="currentTab === 'media' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Manage Media</button>
        <button @click="currentTab = 'terms'" :class="currentTab === 'terms' ? 'bg-primary-red text-white' : 'text-muted-text hover:bg-light-bg'" class="flex-shrink-0 py-3 px-4 rounded-lg font-bold transition-colors duration-200 whitespace-nowrap">Manage Terms</button>
      </div>

<!-- Guestbook Tab -->
       <div v-if="currentTab === 'guestbook'" class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
         <div class="p-4 bg-light-bg border-b border-light-border flex justify-between items-center">
           <div class="text-lg font-bold text-light-text">Customer Entries ({{ customers.length }})</div>
           <div class="flex gap-2">
             <button @click="exportToCSV" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2">
               <span>📊</span> Export CSV
             </button>
             <button @click="deleteAllCustomers" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
               <span>🗑️</span> Delete All
             </button>
           </div>
         </div>
         <table class="w-full text-left border-collapse">
           <thead class="bg-light-bg border-b border-light-border">
             <tr>
               <th class="p-4 font-bold text-light-text">Name</th>
               <th class="p-4 font-bold text-light-text">Phone</th>
               <th class="p-4 font-bold text-light-text">Origin</th>
               <th class="p-4 font-bold text-light-text">Package</th>
               <th class="p-4 font-bold text-light-text">Actions</th>
             </tr>
           </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id" class="border-b border-light-border hover:bg-light-bg transition-colors">
              <td class="p-4 font-semibold text-light-text">{{ c.Name }}</td>
              <td class="p-4 text-muted-text">{{ c.Phone }}</td>
              <td class="p-4 text-muted-text">{{ c.Origin }}</td>
<td class="p-4">
                 <span v-if="c.InterestedPackage" class="inline-block bg-primary-red/20 text-primary-red px-3 py-1 rounded-full text-sm font-semibold">
                   {{ c.InterestedPackage }}
                 </span>
                 <span v-else class="text-muted-text italic text-sm">None</span>
               </td>
               <td class="p-4">
                 <button @click="deleteCustomer(c.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200 mr-2">Delete</button>
               </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="customers.length === 0" class="p-20 text-center text-muted-text">
          No customers have visited yet.
        </div>
      </div>

<!-- Packages Tab -->
       <div v-else-if="currentTab === 'packages'" class="space-y-8">
         <div class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
           <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold text-light-text">Add New Package</h2>
             <div class="flex gap-2">
               <button @click="exportPackagesToCSV" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2">
                 <span>📊</span> Export CSV
               </button>
               <button @click="deleteAllPackages" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
                 <span>🗑️</span> Delete All
               </button>
             </div>
           </div>
           <form @submit.prevent="addPackage" class="grid grid-cols-2 gap-4">
             <input v-model="newPackage.name" type="text" placeholder="Package Name (e.g. Umrah 2026)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
             <input v-model="newPackage.duration" type="text" placeholder="Duration (e.g. 12 Days)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
             <input v-model="newPackage.price" type="text" placeholder="Starting Price (e.g. Rp 30.000.000)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
             <input v-model="newPackage.flight" type="text" placeholder="Flight Info (e.g. Saudia)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
             <input v-model="newPackage.image" type="text" placeholder="Main Image URL" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <input v-model="newPackage.images" type="text" placeholder="Additional Image URLs (pisahkan dengan koma)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <textarea v-model="newPackage.description" placeholder="Package Description (markdown format)" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
             <textarea v-model="newPackage.terms" placeholder="Terms & Conditions (markdown format)" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
             <textarea v-model="newPackage.detailed_price" placeholder="Detailed Pricing Information (markdown format)" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
             <button type="submit" class="col-span-2 bg-primary-red hover:bg-primary-red/90 text-white py-3 rounded-lg font-bold mt-2 transition-colors duration-200">Save Package</button>
           </form>
         </div>
        
        <div class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
          <table class="w-full text-left border-collapse">
            <thead class="bg-light-bg border-b border-light-border">
              <tr>
                <th class="p-4 font-bold text-light-text">Name</th>
                <th class="p-4 font-bold text-light-text">Duration</th>
                <th class="p-4 font-bold text-light-text">Price</th>
                <th class="p-4 font-bold text-light-text">Actions</th>
              </tr>
            </thead>
<tbody>
               <tr v-for="pkg in packages" :key="pkg.id" class="border-b border-light-border hover:bg-light-bg">
                 <td class="p-4 font-semibold text-light-text">{{ pkg.name }}</td>
                 <td class="p-4 text-muted-text">{{ pkg.duration }}</td>
                 <td class="p-4 text-muted-text">{{ pkg.price }}</td>
                 <td class="p-4 space-x-2">
                   <button @click="editPackage(pkg)" class="bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200 transition-colors duration-200">Edit</button>
                   <button @click="deletePackage(pkg.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200">Delete</button>
                 </td>
               </tr>
             </tbody>
          </table>
          <div v-if="packages.length === 0" class="p-8 text-center text-muted-text">No packages added yet.</div>
        </div>
      </div>

<!-- Hotels Tab -->
       <div v-else-if="currentTab === 'hotels'" class="space-y-8">
         <!-- Add Hotel Form -->
         <div class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
           <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold text-light-text">Add New Hotel</h2>
             <div class="flex gap-2">
               <button @click="exportHotelsToCSV" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2">
                 <span>📊</span> Export CSV
               </button>
               <button @click="deleteAllHotels" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
                 <span>🗑️</span> Delete All
               </button>
             </div>
           </div>
<form @submit.prevent="addHotel" class="grid grid-cols-2 gap-4">
              <input v-model="newHotel.name" type="text" placeholder="Hotel Name" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="newHotel.location" type="text" placeholder="Location City" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="newHotel.distance" type="text" placeholder="Distance (e.g. 100m to Haram)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <select v-model="newHotel.rating" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required>
                <option value="1">⭐ Hotel Bintang 1</option>
                <option value="2">⭐⭐ Hotel Bintang 2</option>
                <option value="3" selected>⭐⭐⭐ Hotel Bintang 3</option>
                <option value="4">⭐⭐⭐⭐ Hotel Bintang 4</option>
                <option value="5">⭐⭐⭐⭐⭐ Hotel Bintang 5</option>
              </select>
              <textarea v-model="newHotel.description" placeholder="Description" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required></textarea>
              <input v-model="newHotel.image" type="text" placeholder="Main Image URL (utama)" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="newHotel.images" type="text" placeholder="Multiple Image URLs (pisahkan dengan koma, untuk interior/exterior)" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="newHotel.mapUrl" type="text" placeholder="Google Maps Embed URL (src attribute)" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <button type="submit" class="col-span-2 bg-primary-red hover:bg-primary-red/90 text-white py-3 rounded-lg font-bold mt-2 transition-colors duration-200">Save Hotel</button>
</form>
          </div>

          <!-- Edit Hotel Form -->
          <div v-if="editingHotel" class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <h2 class="text-xl font-bold text-light-text mb-4">Edit Hotel</h2>
            <form @submit.prevent="updateHotel" class="grid grid-cols-2 gap-4">
              <input v-model="editingHotel.name" type="text" placeholder="Hotel Name" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingHotel.location" type="text" placeholder="Location City" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingHotel.distance" type="text" placeholder="Distance" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <select v-model="editingHotel.rating" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required>
                <option value="1">⭐ Hotel Bintang 1</option>
                <option value="2">⭐⭐ Hotel Bintang 2</option>
                <option value="3">⭐⭐⭐ Hotel Bintang 3</option>
                <option value="4">⭐⭐⭐⭐ Hotel Bintang 4</option>
                <option value="5">⭐⭐⭐⭐⭐ Hotel Bintang 5</option>
              </select>
              <textarea v-model="editingHotel.description" placeholder="Description" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required></textarea>
              <input v-model="editingHotel.image" type="text" placeholder="Main Image URL" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingHotel.images" type="text" placeholder="Multiple Image URLs" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingHotel.mapUrl" type="text" placeholder="Google Maps Embed URL" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <div class="col-span-2 flex gap-2">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Update Hotel</button>
                <button @click="cancelEditHotel" type="button" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
              </div>
            </form>
          </div>
        
        <!-- Hotel List -->
        <div class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
          <table class="w-full text-left border-collapse">
<thead class="bg-light-bg border-b border-light-border">
               <tr>
                 <th class="p-4 font-bold text-light-text">Name</th>
                 <th class="p-4 font-bold text-light-text">Location</th>
                 <th class="p-4 font-bold text-light-text">Distance</th>
                 <th class="p-4 font-bold text-light-text">Rating</th>
                 <th class="p-4 font-bold text-light-text">Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="hot in hotels" :key="hot.id" class="border-b border-light-border hover:bg-light-bg">
                 <td class="p-4 font-semibold text-light-text">{{ hot.name }}</td>
                 <td class="p-4 text-muted-text">{{ hot.location }}</td>
                 <td class="p-4 text-muted-text">{{ hot.distance }}</td>
                 <td class="p-4">
                   <span class="inline-flex items-center">
                     <span v-for="star in parseInt(hot.rating || 3)" :key="star" class="text-yellow-500 text-sm">⭐</span>
                     <span class="ml-1 text-sm">Bintang {{ hot.rating || 3 }}</span>
                   </span>
                 </td>
<td class="p-4 space-x-2">
                    <button @click="editHotel(hot)" class="bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200 transition-colors duration-200">Edit</button>
                    <button @click="deleteHotel(hot.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200">Delete</button>
                  </td>
               </tr>
             </tbody>
          </table>
          <div v-if="hotels.length === 0" class="p-8 text-center text-muted-text">No hotels added yet.</div>
        </div>
      </div>

<!-- Add-ons Tab -->
       <div v-else-if="currentTab === 'addons'" class="space-y-8">
         <!-- Add Addon Form -->
         <div class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
           <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold text-light-text">Add New Add-on</h2>
             <div class="flex gap-2">
               <button @click="exportAddonsToCSV" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2">
                 <span>📊</span> Export CSV
               </button>
               <button @click="deleteAllAddons" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
                 <span>🗑️</span> Delete All
               </button>
             </div>
           </div>
           <form @submit.prevent="addAddon" class="grid grid-cols-2 gap-4">
             <input v-model="newAddon.title" type="text" placeholder="Title" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
             <input v-model="newAddon.category" type="text" placeholder="Category (optional)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <textarea v-model="newAddon.description" placeholder="Description" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required></textarea>
             <input v-model="newAddon.images" type="text" placeholder="Image URLs (pisahkan dengan koma)" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <input v-model="newAddon.icon" type="text" placeholder="Icon URL (optional)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <input v-model="newAddon.price" type="text" placeholder="Price (optional)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <input v-model="newAddon.features" type="text" placeholder="Features (pisahkan dengan koma)" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
             <button type="submit" class="col-span-2 bg-primary-red hover:bg-primary-red/90 text-white py-3 rounded-lg font-bold mt-2 transition-colors duration-200">Save Add-on</button>
           </form>
         </div>
        
        <!-- Addon List -->
        <div class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
          <table class="w-full text-left border-collapse">
            <thead class="bg-light-bg border-b border-light-border">
              <tr>
                <th class="p-4 font-bold text-light-text">Title</th>
                <th class="p-4 font-bold text-light-text">Category</th>
                <th class="p-4 font-bold text-light-text">Price</th>
                <th class="p-4 font-bold text-light-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="addon in addons" :key="addon.id" class="border-b border-light-border hover:bg-light-bg">
                <td class="p-4 font-semibold text-light-text">{{ addon.title }}</td>
                <td class="p-4 text-muted-text">{{ addon.category || '-' }}</td>
                <td class="p-4 text-muted-text">{{ addon.price || '-' }}</td>
<td class="p-4 space-x-2">
                   <button @click="editAddon(addon)" class="bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200 transition-colors duration-200">Edit</button>
                   <button @click="deleteAddon(addon.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200">Delete</button>
                 </td>
              </tr>
            </tbody>
          </table>
<div v-if="addons.length === 0" class="p-8 text-center text-muted-text">No add-ons added yet.</div>
         </div>

          <!-- Edit Add-on Form -->
          <div v-if="editingAddon" class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <h2 class="text-xl font-bold text-light-text mb-4">Edit Add-on</h2>
            <form @submit.prevent="updateAddon" class="grid grid-cols-2 gap-4">
              <input v-model="editingAddon.title" type="text" placeholder="Title" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingAddon.category" type="text" placeholder="Category" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="editingAddon.description" placeholder="Description" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required></textarea>
              <input v-model="editingAddon.images" type="text" placeholder="Image URLs" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingAddon.icon" type="text" placeholder="Icon URL" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingAddon.price" type="text" placeholder="Price" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <input v-model="editingAddon.features" type="text" placeholder="Features" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <div class="col-span-2 flex gap-2">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Update Add-on</button>
                <button @click="cancelEditAddon" type="button" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>

<!-- Media Tab -->
       <div v-else-if="currentTab === 'media'" class="space-y-8">
         <!-- Add Media Form -->
         <div class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
           <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold text-light-text">Add New Media</h2>
             <div class="flex gap-2">
               <button @click="exportMediaToCSV" class="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2">
                 <span>📊</span> Export CSV
               </button>
               <button @click="deleteAllMedia" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
                 <span>🗑️</span> Delete All
               </button>
             </div>
           </div>
            <form @submit.prevent="addMedia" class="grid grid-cols-2 gap-4">
              <input v-model="newMedia.title" type="text" placeholder="Title" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="newMedia.category" type="text" placeholder="Category (optional)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="newMedia.description" placeholder="Description" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <input v-model="newMedia.image_url" type="text" placeholder="Image URL" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
               <input v-model="newMedia.thumbnail_url" type="text" placeholder="Thumbnail URL (optional)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <select v-model="newMedia.type" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required>
                <option value="">Select Type</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input v-model="newMedia.date" type="date" placeholder="Date" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <button type="submit" class="col-span-2 bg-primary-red hover:bg-primary-red/90 text-white py-3 rounded-lg font-bold mt-2 transition-colors duration-200">Save Media</button>
            </form>
         </div>
        
        <!-- Media List -->
        <div class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
          <table class="w-full text-left border-collapse">
            <thead class="bg-light-bg border-b border-light-border">
              <tr>
                <th class="p-4 font-bold text-light-text">Title</th>
                <th class="p-4 font-bold text-light-text">Category</th>
                <th class="p-4 font-bold text-light-text">Date</th>
                <th class="p-4 font-bold text-light-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in media" :key="item.id" class="border-b border-light-border hover:bg-light-bg">
                <td class="p-4 font-semibold text-light-text">{{ item.title }}</td>
                <td class="p-4 text-muted-text">{{ item.category || '-' }}</td>
                <td class="p-4 text-muted-text">{{ item.date ? new Date(item.date).toLocaleDateString() : '-' }}</td>
<td class="p-4 space-x-2">
                   <button @click="editMedia(item)" class="bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200 transition-colors duration-200">Edit</button>
                   <button @click="deleteMedia(item.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200">Delete</button>
                 </td>
              </tr>
            </tbody>
          </table>
<div v-if="media.length === 0" class="p-8 text-center text-muted-text">No media items added yet.</div>
         </div>

          <!-- Edit Media Form -->
          <div v-if="editingMedia" class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <h2 class="text-xl font-bold text-light-text mb-4">Edit Media</h2>
            <form @submit.prevent="updateMedia" class="grid grid-cols-2 gap-4">
              <input v-model="editingMedia.title" type="text" placeholder="Title" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              <input v-model="editingMedia.category" type="text" placeholder="Category" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="editingMedia.description" placeholder="Description" rows="2" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <input v-model="editingMedia.image_url" type="text" placeholder="Image URL" class="col-span-2 p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
               <input v-model="editingMedia.thumbnail_url" type="text" placeholder="Thumbnail URL" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <select v-model="editingMedia.type" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required>
                <option value="">Select Type</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input v-model="editingMedia.date" type="date" placeholder="Date" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <div class="col-span-2 flex gap-2">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Update Media</button>
                <button @click="cancelEditMedia" type="button" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>

<!-- Terms Tab -->
        <div v-else-if="currentTab === 'terms'" class="space-y-8">
          <!-- Add Terms Form -->
          <div class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-light-text">Upload Terms & Conditions</h2>
            </div>
            <form @submit.prevent="addTerms" class="grid grid-cols-1 gap-4">
              <input v-model="newTerms.title" type="text" placeholder="Document Title (e.g., Terms & Conditions 2024)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="newTerms.description" placeholder="Brief Description (optional)" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <textarea v-model="newTerms.notes" placeholder="Internal Notes (optional)" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              
              <input v-model="newTerms.image" type="text" placeholder="Document URL (link to PDF or image file)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              
              <button type="submit" class="bg-primary-red hover:bg-primary-red/90 text-white py-3 rounded-lg font-bold transition-colors duration-200">Save Terms Document</button>
            </form>
          </div>
         
         <!-- Terms List -->
         <div class="bg-light-card rounded-2xl shadow-sm overflow-hidden border border-light-border">
           <table class="w-full text-left border-collapse">
             <thead class="bg-light-bg border-b border-light-border">
               <tr>
                 <th class="p-4 font-bold text-light-text">Title</th>
                 <th class="p-4 font-bold text-light-text">Type</th>
                 <th class="p-4 font-bold text-light-text">File Type</th>
                 <th class="p-4 font-bold text-light-text">Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="term in terms" :key="term.id" class="border-b border-light-border hover:bg-light-bg">
                 <td class="p-4 font-semibold text-light-text">{{ term.title || 'Untitled Document' }}</td>
                 <td class="p-4 text-muted-text">Document</td>
                  <td class="p-4 text-muted-text">{{ term.image ? term.image.split('.').pop().toUpperCase() : '-' }}</td>
                 <td class="p-4 space-x-2">
                   <button @click="editTerms(term)" class="bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-200 transition-colors duration-200">Edit</button>
                   <button @click="deleteTerms(term.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded font-bold hover:bg-red-200 transition-colors duration-200">Delete</button>
                 </td>
               </tr>
             </tbody>
           </table>
           <div v-if="terms.length === 0" class="p-8 text-center text-muted-text">No terms documents uploaded yet.</div>
         </div>

          <!-- Edit Terms Form -->
          <div v-if="editingTerms" class="bg-light-card p-6 rounded-2xl shadow-sm border border-light-border">
            <h2 class="text-xl font-bold text-light-text mb-4">Edit Terms Document</h2>
            <form @submit.prevent="updateTerms" class="grid grid-cols-1 gap-4">
              <input v-model="editingTerms.title" type="text" placeholder="Document Title" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" />
              <textarea v-model="editingTerms.description" placeholder="Brief Description" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              <textarea v-model="editingTerms.notes" placeholder="Internal Notes" rows="2" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text"></textarea>
              
              <input v-model="editingTerms.image" type="text" placeholder="Document URL (link to PDF or image file)" class="p-3 border border-light-border rounded-lg bg-light-bg text-light-text" required />
              
              <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Update Document</button>
                <button @click="cancelEditTerms" type="button" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors duration-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for horizontal tabs */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: var(--light-bg);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: var(--light-border);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: var(--primary-gray);
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>