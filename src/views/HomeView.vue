<script setup>
import '@/assets/base.css';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTeamStore, useSeasonStore, usePlayerStore } from '@/stores';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'HomeView'
})

// Router
const router = useRouter();

// Stores
const teamStore = useTeamStore();
const seasonStore = useSeasonStore();
const playerStore = usePlayerStore();

// Store refs
const { teams } = storeToRefs(teamStore);
const { seasons } = storeToRefs(seasonStore);
const { players } = storeToRefs(playerStore);

// Component state
const isLoading = ref(true);
const errorMessage = ref(null);

// Computed stats
const stats = computed(() => ({
  teams: {
    total: teams.value.length,
    label: 'Active Teams',
    description: 'Manage team rosters and standings',
    icon: 'mdi-account-group',
    route: '/teams'
  },
  seasons: {
    total: seasons.value.length,
    label: 'Total Seasons',
    description: 'View and manage league seasons',
    icon: 'mdi-trophy',
    route: '/seasons'
  },
  players: {
    total: players.value.length,
    label: 'Registered Players',
    description: 'Player profiles and statistics',
    icon: 'mdi-account',
    route: '/players'
  }
}));

// Data fetching
const fetchDashboardData = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  
  try {
    await Promise.all([
      teamStore.fetchTeams(),
      seasonStore.fetchSeasons(),
      playerStore.fetchPlayers()
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    errorMessage.value = 'Failed to load dashboard data. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchDashboardData();
});

// Navigation
const navigateTo = (route) => {
  router.push(route);
};
</script>

<template>
  <div>
    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" persistent absolute>
      <v-progress-circular
        indeterminate
        size="64"
        width="8"
        color="primary"
      ></v-progress-circular>
    </v-overlay>

    <div class="dashboard">
      <v-container>
        <!-- Title -->
        <v-row align="center" class="mb-4">
          <v-col>
            <h1 class="text-h3">GNL League Dashboard</h1>
          </v-col>
        </v-row>

        <!-- Error Message -->
        <v-row v-if="errorMessage" justify="center" class="error-message">
          <v-col cols="auto">
            <v-alert
              type="error"
              variant="tonal"
              border="start"
              border-color="red"
              class="mx-4 my-2"
              closable
            >
              {{ errorMessage }}
            </v-alert>
          </v-col>
        </v-row>

        <!-- Dashboard Cards -->
        <v-row class="mt-4">
          <v-col v-for="(stat, key) in stats" :key="key" cols="12" md="4">
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 8 : 2"
                @click="navigateTo(stat.route)"
                class="dashboard-card"
                height="200"
                :class="{ 'on-hover': isHovering }"
              >
                <v-card-title class="d-flex align-center">
                  <v-icon :icon="stat.icon" size="large" class="mr-2" />
                  {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                </v-card-title>
                
                <v-card-text>
                  <div class="d-flex flex-column justify-center align-center text-center">
                    <div class="text-h3 mb-2 primary--text">{{ stat.total }}</div>
                    <div class="text-h6 mb-2">{{ stat.label }}</div>
                    <div class="text-caption text-medium-emphasis">{{ stat.description }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.dashboard-card.on-hover {
  transform: translateY(-5px);
}

.error-message {
  margin-top: 1rem;
}

.text-medium-emphasis {
  opacity: 0.7;
}
</style>
