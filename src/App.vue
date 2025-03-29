<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);
</script>

<template>
    <div class="app-container bg-light">
        <nav v-show="authStore.user" class="navbar navbar-expand navbar-dark bg-dark">
            <div class="navbar-nav">
                <RouterLink to="/" class="nav-item nav-link">Home</RouterLink>
                <RouterLink to="/players" class="nav-item nav-link">Players</RouterLink>
                <a @click="authStore.logout()" class="nav-item nav-link">Logout</a>
            </div>
        </nav>
        <div class="container pt-4 pb-4">
            <RouterView />
        </div>
    </div>
</template>

<style>
@import '@/assets/base.css';
</style>