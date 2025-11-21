<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);
const route = useRoute();

// show navigation links only for authenticated users on non-public routes
const showNavLinks = () => {
    if (!authStore.user) return false;
    // hide on explicit public-only routes
    if (route.path === '/signup' || route.path === '/player-dashboard' || route.path === '/fantasy-registration') return false;
    return true;
}
</script>

<template>
    <v-app> 
    <v-app-bar>
            <v-app-bar-title>GNL APP</v-app-bar-title>
            <template v-slot:append>
                <v-list v-show="showNavLinks()" class="inline-nav" nav>
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
                    <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                            <v-list-item v-bind="props" class="fantasy-menu-activator">
                                <a class="nav-link">
                                    Fantasy
                                    <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
                                </a>
                            </v-list-item>
                        </template>
                        <v-list class="fantasy-dropdown">
                            <v-list-item>
                                <RouterLink to="/fantasy">Leaderboard</RouterLink>
                            </v-list-item>
                            <v-list-item>
                                <RouterLink to="/fantasy/bets">Manage Bets</RouterLink>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-list-item>
                        <RouterLink to="/config">Config</RouterLink>
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

.fantasy-menu-activator {
    cursor: pointer;
}

.fantasy-menu-activator .nav-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #1976d2;
}

.fantasy-dropdown {
    min-width: 180px;
}

.fantasy-dropdown .v-list-item {
    padding: 0;
}

.fantasy-dropdown a {
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-decoration: none;
    color: inherit;
}

.fantasy-dropdown a:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.fantasy-dropdown a.active {
    background-color: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}
</style>