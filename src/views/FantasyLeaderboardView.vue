<template>
  <v-overlay v-model="isLoading" persistent absolute>
    <v-progress-circular indeterminate size="64" width="8" color="primary"></v-progress-circular>
  </v-overlay>

  <v-alert v-if="errorMessage" type="error" variant="tonal" border="start" border-color="red" class="mx-4 my-2" closable>
    {{ errorMessage }}
  </v-alert>

  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon left>mdi-trophy</v-icon>
              Fantasy Teams Leaderboard
            </div>
            <div class="d-flex gap-2 align-center">
              <v-select
                v-model="selectedSeasonId"
                :items="seasons"
                item-title="name"
                item-value="id"
                label="Season"
                variant="outlined"
                density="compact"
                style="min-width: 200px; margin-right: 16px;"
                @update:modelValue="onSeasonChange"
              ></v-select>
              <v-btn color="secondary" prepend-icon="mdi-casino" @click="router.push('/fantasy/bets')">
                Manage Bets
              </v-btn>
              <v-btn color="primary" prepend-icon="mdi-calculator" @click="calculateScores" :loading="isCalculating" :disabled="!selectedSeasonId">
                Calculate Scores
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="sortedTeams"
              :items-per-page="25"
              class="elevation-1"
              density="comfortable"
            >
              <template v-slot:[`item.rank`]="{ index }">
                <v-chip :color="getRankColor(index + 1)" size="small">
                  {{ index + 1 }}
                </v-chip>
              </template>

              <template v-slot:[`item.captain`]="{ item }">
                {{ item.captain?.name || 'N/A' }}
              </template>

              <template v-slot:[`item.drafted_team`]="{ item }">
                {{ item.drafted_team?.name || 'N/A' }}
              </template>

              <template v-slot:[`item.drafted_race`]="{ item }">
                <RaceIcon v-if="item.drafted_race" :raceIdentifier="item.drafted_race" />
                <span v-else>N/A</span>
              </template>

              <template v-slot:[`item.player_points`]="{ item }">
                {{ item.player_points || 0 }}
              </template>

              <template v-slot:[`item.bench_points`]="{ item }">
                {{ item.bench_points || 0 }}
              </template>

              <template v-slot:[`item.team_points`]="{ item }">
                {{ item.team_points || 0 }}
              </template>

              <template v-slot:[`item.race_points`]="{ item }">
                {{ item.race_points || 0 }}
              </template>

              <template v-slot:[`item.bet_points`]="{ item }">
                {{ item.bet_points || 0 }}
              </template>

              <template v-slot:[`item.total_points`]="{ item }">
                <strong>{{ item.total_points || 0 }}</strong>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon size="small" @click="viewTeamDetails(item.id)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Team Details Dialog -->
  <v-dialog v-model="teamDialog" max-width="800px">
    <v-card>
      <v-card-title class="text-h5 bg-purple">
        <v-icon class="mr-2">mdi-trophy-variant</v-icon>
        Team Details
      </v-card-title>
      <v-card-text v-if="selectedTeam" class="pt-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-list>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Captain</v-list-item-title>
                <v-list-item-subtitle>{{ selectedTeam.captain?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Season</v-list-item-title>
                <v-list-item-subtitle>{{ selectedTeam.season?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Drafted Team</v-list-item-title>
                <v-list-item-subtitle>{{ selectedTeam.drafted_team?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">Drafted Race</v-list-item-title>
                <v-list-item-subtitle>
                  <RaceIcon v-if="selectedTeam.drafted_race" :raceIdentifier="selectedTeam.drafted_race" />
                  <span v-else>N/A</span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <div class="text-h6 mb-3">Points Breakdown</div>
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>Player Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h6">{{ selectedTeam.player_points || 0 }}</span>
                  </template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Bench Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h6">{{ selectedTeam.bench_points || 0 }}</span>
                  </template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Team Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h6">{{ selectedTeam.team_points || 0 }}</span>
                  </template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Race Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h6">{{ selectedTeam.race_points || 0 }}</span>
                  </template>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Bet Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h6">{{ selectedTeam.bet_points || 0 }}</span>
                  </template>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Total Points</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-h5 primary--text">{{ selectedTeam.total_points || 0 }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="selectedTeam.drafted_players && selectedTeam.drafted_players.length > 0">
          <v-col cols="12">
            <v-divider class="my-4" />
            <div class="text-h6 mb-3">Drafted Players</div>
            <v-chip-group>
              <v-chip v-for="player in selectedTeam.drafted_players" :key="player.id" color="primary">
                {{ player.name }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="closeTeamDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import '@/assets/base.css';
import { ref, computed, onMounted } from 'vue';
import { useFantasyStore, useSeasonStore, useConfigStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import RaceIcon from '@/components/RaceIcon.vue';

defineOptions({ name: 'FantasyLeaderboardView' });

const router = useRouter();
const fantasyStore = useFantasyStore();
const seasonStore = useSeasonStore();
const configStore = useConfigStore();

const { teams } = storeToRefs(fantasyStore);

const isLoading = ref(false);
const isCalculating = ref(false);
const errorMessage = ref(null);
const seasons = ref([]);
const selectedSeasonId = ref(null);
const teamDialog = ref(false);
const selectedTeam = ref(null);

const headers = [
  { title: 'Rank', value: 'rank', sortable: false, width: '80px' },
  { title: 'Captain', value: 'captain', sortable: false },
  { title: 'Team', value: 'drafted_team', sortable: false },
  { title: 'Race', value: 'drafted_race', sortable: false, align: 'center' },
  { title: 'Player Pts', value: 'player_points', align: 'end' },
  { title: 'Bench Pts', value: 'bench_points', align: 'end' },
  { title: 'Team Pts', value: 'team_points', align: 'end' },
  { title: 'Race Pts', value: 'race_points', align: 'end' },
  { title: 'Bet Pts', value: 'bet_points', align: 'end' },
  { title: 'Total', value: 'total_points', align: 'end' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center' }
];

const sortedTeams = computed(() => {
  return [...teams.value].sort((a, b) => {
    const aTotal = a.total_points || 0;
    const bTotal = b.total_points || 0;
    return bTotal - aTotal;
  });
});

const getRankColor = (rank) => {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return '#CD7F32'; // bronze
  return 'grey';
};

const fetchData = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    // If no season selected, get current season
    if (!selectedSeasonId.value) {
      const currentSeasonSetting = await configStore.fetchSetting('current_gnl_season');
      selectedSeasonId.value = currentSeasonSetting?.value ? parseInt(currentSeasonSetting.value) : null;
    }
    
    if (!selectedSeasonId.value) {
      errorMessage.value = 'No season configured. Please contact an administrator.';
      isLoading.value = false;
      return;
    }
    
    // Fetch teams for selected season
    const teamsQuery = `season_id == ${selectedSeasonId.value}`;
    await fantasyStore.searchTeams(teamsQuery);
  } catch (error) {
    console.error('Failed to fetch fantasy teams:', error);
    errorMessage.value = 'Failed to load fantasy teams. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const onSeasonChange = async () => {
  await fetchData();
};

const loadSeasons = async () => {
  try {
    await seasonStore.fetchSeasons();
    seasons.value = seasonStore.seasons || [];
  } catch (error) {
    console.error('Failed to load seasons:', error);
    seasons.value = [];
  }
};

const calculateScores = async () => {
  if (!selectedSeasonId.value) {
    errorMessage.value = 'Please select a season first.';
    return;
  }
  
  isCalculating.value = true;
  errorMessage.value = null;
  try {
    await fantasyStore.calculateSeasonScores(selectedSeasonId.value);
    await fetchData(); // Refresh the data
  } catch (error) {
    console.error('Failed to calculate scores:', error);
    errorMessage.value = 'Failed to calculate scores. Please try again later.';
  } finally {
    isCalculating.value = false;
  }
};

const viewTeamDetails = (teamId) => {
  selectedTeam.value = teams.value.find(t => t.id === teamId);
  teamDialog.value = true;
};

const closeTeamDialog = () => {
  teamDialog.value = false;
  selectedTeam.value = null;
};

onMounted(() => {
  loadSeasons();
  fetchData();
});
</script>

<style scoped>
.v-chip.gold {
  background-color: #FFD700 !important;
  color: #000 !important;
}

.v-chip.silver {
  background-color: #C0C0C0 !important;
  color: #000 !important;
}
</style>
