<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);
const route = useRoute();

// hide the app bar for the public signup page even if user is present
const showAppBar = () => {
    if (!authStore.user) return false;
    // also hide on explicit public-only routes
    if (route.path === '/signup') return false;
    return true;
}
</script>

<template>
    <v-app> 
    <v-app-bar v-show="showAppBar()">
            <v-app-bar-title>GNL APP</v-app-bar-title>
            <template v-slot:append>
                <v-list class="inline-nav" nav>
                    <v-list-item>
                        <RouterLink to="/">Home</RouterLink>
                    </v-list-item>
                    <v-list-item>
                        <RouterLink to="/seasons">Seasons</RouterLink>
                    </v-list-item>
                    <v-list-item>
                        <RouterLink to="/players">Players</RouterLink>
                    </v-list-item>
                    <v-list-item>
                        <RouterLink to="/teams">Teams</RouterLink>
                    </v-list-item>
                    <v-list-item>
                        <RouterLink to="/maps">Maps</RouterLink>
                    </v-list-item>
                    <v-list-item>
                        <v-btn 
                            append-icon="mdi-logout"
                            @click="authStore.logout()"
                            color="black"
                            variant="tonal">
                            Logout
                        </v-btn> 
                    </v-list-item>
                </v-list>               
            </template>
        </v-app-bar>  

        <v-main>                  
            <v-container>              
                <RouterView />
            </v-container>  
        </v-main>   
    </v-app>
</template>

<style>
@import '@/assets/base.css';

.inline-nav {
    display: flex;
}

.inline-nav .v-list-item {
    margin: 0 !important;
}
</style>