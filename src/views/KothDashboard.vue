<template>
  <div class="koth-dashboard-wrapper">
    <v-container fluid class="pa-6 koth-dashboard">
      <v-overlay v-model="isLoading" persistent class="loading-overlay">
        <v-progress-circular indeterminate size="64" width="8" color="primary" />
      </v-overlay>

      <!-- Event Header -->
      <div v-if="event" class="text-center mb-8">
        <h1 class="text-h2 font-weight-bold mb-2">
          <v-icon size="48" color="warning" class="mr-3">mdi-crown</v-icon>
          {{ event.name }}
        </h1>
        <p v-if="event.description" class="text-h6 text-grey-darken-1">{{ event.description }}</p>
      </div>

    <!-- Brackets Grid -->
    <v-row v-if="event" class="mb-8">
      <v-col v-for="bracket in [1, 2, 3]" :key="bracket" cols="12" md="4">
        <v-card elevation="8" class="bracket-card" :class="`bracket-${bracket}`">
          <v-card-title class="bracket-header text-center py-3">
            <div class="text-h6 font-weight-bold">{{ getBracketThresholdText(bracket) }}</div>
          </v-card-title>
          
          <v-card-text class="pa-3">
            <!-- Kings Section -->
            <div v-if="kings[bracket] && kings[bracket].length > 0" class="mb-3">
              <v-card 
                v-for="king in kings[bracket]" 
                :key="king.id" 
                variant="outlined" 
                class="king-card mb-2 pa-3"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h6 font-weight-bold">{{ king.twitch_username || king.battle_tag }}</div>
                    <div class="text-subtitle-2 text-grey">{{ king.race }} · {{ king.mmr }} MMR</div>
                  </div>
                  <v-icon color="warning" size="40">mdi-crown</v-icon>
                </div>
              </v-card>
            </div>
            <div v-else class="text-center py-3 text-grey">
              <v-icon size="40" color="grey-lighten-1">mdi-crown-outline</v-icon>
              <div class="mt-1 text-caption">No King Yet</div>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Signed Up Players -->
            <div class="players-section">
              <div v-if="getActivePlayers(bracket).length > 0" class="players-list">
                <div 
                  v-for="player in getActivePlayers(bracket)" 
                  :key="player.id"
                  class="player-item mb-1 pa-2"
                >
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ player.twitch_username || player.battle_tag }}</span>
                    <span class="text-caption text-grey">{{ player.mmr }} MMR</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-2 text-grey-lighten-1 text-caption">
                No players signed up
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Active Matches -->
    <div v-if="activeMatches.length > 0" class="matches-section">
      <h2 class="text-h4 font-weight-bold text-center mb-4">
        <v-icon size="28" class="mr-2">mdi-sword-cross</v-icon>
        Upcoming Matches
      </h2>
      
      <v-row dense>
        <v-col v-for="match in activeMatches" :key="match.id" cols="12" sm="6" md="4" lg="2">
          <v-card elevation="4" class="match-card-compact">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip :color="getBracketColor(match.bracket)" size="small" density="compact">
                  B{{ match.bracket }}
                </v-chip>
                <v-chip variant="outlined" size="small" density="compact">{{ match.game_mode }}</v-chip>
              </div>
              
              <div class="teams-compact">
                <div v-for="teamNum in match.num_teams" :key="teamNum" class="team-row mb-1">
                  <span class="team-label">T{{ teamNum }}:</span>
                  <span class="team-players-compact">
                    {{ getTeamPlayers(match, teamNum).map(p => p.signup?.twitch_username || p.signup?.battle_tag).join(', ') }}
                  </span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <div v-else-if="!isLoading" class="text-center py-8">
      <v-icon size="80" color="grey-darken-1">mdi-checkbox-blank-circle-outline</v-icon>
      <div class="text-h5 mt-4 text-grey-darken-1">No Active Matches</div>
    </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useKothStore } from '@/stores';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'KothDashboard' });

const kothStore = useKothStore();
const { events, signups, matches, kings, isLoading } = storeToRefs(kothStore);

const event = ref(null);
let refreshInterval = null;

const activeMatches = computed(() => {
  return matches.value
    .filter(m => !m.winner_team_number)
    .sort((a, b) => a.id - b.id)  // Sort by creation order (ID ascending)
    .slice(0, 6);  // Limit to 6 matches
});

onMounted(async () => {
  await loadDashboardData();
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(loadDashboardData, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

async function loadDashboardData() {
  try {
    // Fetch all events using store
    await kothStore.fetchAllEvents();
    
    // Find the newest event (highest ID or most recent date)
    if (events.value && events.value.length > 0) {
      // Sort by ID descending to get newest
      const sortedEvents = [...events.value].sort((a, b) => b.id - a.id);
      event.value = sortedEvents[0];
      
      // Load data for this event using store methods
      await Promise.all([
        kothStore.fetchSignups(event.value.id),
        kothStore.fetchMatches(event.value.id),
        kothStore.fetchBracketKings(event.value.id),
      ]);
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}



function getBracketColor(bracket) {
  const colors = { 1: 'success', 2: 'info', 3: 'warning' };
  return colors[bracket] || 'grey';
}

function getBracketThresholdText(bracket) {
  if (!event.value) return '';
  const thresholds = {
    1: `< ${event.value.bracket_1_threshold} MMR`,
    2: `${event.value.bracket_1_threshold} - ${event.value.bracket_2_threshold - 1} MMR`,
    3: `≥ ${event.value.bracket_2_threshold} MMR`
  };
  return thresholds[bracket] || '';
}

function getTeamPlayers(match, teamNumber) {
  if (!match.participants) return [];
  return match.participants.filter(p => p.team_number === teamNumber);
}

function getActivePlayers(bracket) {
  return signups.value.filter(s => s.bracket === bracket && s.is_active === 1 && s.is_king !== 1);
}
</script>

<style scoped>
.koth-dashboard-wrapper {
  background: #f5f5f5;
  min-height: 100vh;
}

.koth-dashboard {
  min-height: 100vh;
}

.loading-overlay {
  z-index: 999;
}

.bracket-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: transform 0.2s;
}

.bracket-card:hover {
  transform: translateY(-4px);
}

.bracket-1 .bracket-header {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
}

.bracket-2 .bracket-header {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
  color: white;
}

.bracket-3 .bracket-header {
  background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
  color: white;
}

.kings-section {
  background: rgba(255, 193, 7, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  color: #f57f17;
}

.king-card {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 2px solid #ffc107 !important;
  border-radius: 8px !important;
}

.players-section {
  max-height: 300px;
  overflow-y: auto;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-item {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  transition: background 0.2s;
}

.player-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.match-card-compact {
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 12px !important;
}

.teams-compact {
  font-size: 0.875rem;
}

.team-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.team-label {
  font-weight: bold;
  min-width: 30px;
  color: #37474f;
}

.team-players-compact {
  flex: 1;
  color: #546e7a;
}

.match-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.match-header {
  background: linear-gradient(135deg, #37474f 0%, #546e7a 100%);
  color: white;
}

.team-card {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 12px;
}

.team-header {
  color: #37474f;
  font-size: 0.95rem;
}

.player-item {
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.6);
}

.matches-section {
  margin-top: 48px;
}
</style>
