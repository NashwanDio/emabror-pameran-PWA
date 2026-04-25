import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CustomerForm from '../views/CustomerForm.vue'
import PackagesView from '../views/PackagesView.vue'
import HotelsView from '../views/HotelsView.vue'
import AdminView from '../views/AdminView.vue'
import PackageDetailView from '../views/PackageDetailView.vue'
import AddOnsView from '../views/AddOnsView.vue'
import MediaGalleryView from '../views/MediaGalleryView.vue'
import TermsView from '../views/TermsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/guestbook', name: 'guestbook', component: CustomerForm },
    { path: '/packages', name: 'packages', component: PackagesView },
    { path: '/package/:id', name: 'package-detail', component: PackageDetailView },
    { path: '/hotels', name: 'hotels', component: HotelsView },
    { path: '/addons', name: 'addons', component: AddOnsView },
    { path: '/media', name: 'media', component: MediaGalleryView },
    { path: '/terms', name: 'terms', component: TermsView },
    { path: '/admin', name: 'admin', component: AdminView },
  ],
})

export default router