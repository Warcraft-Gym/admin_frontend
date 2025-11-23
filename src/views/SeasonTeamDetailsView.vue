<template>
  <v-overlay v-model="isLoading" persistent contained class="align-center justify-center">
    <v-progress-circular indeterminate size="64" width="8" color="primary"></v-progress-circular>
  </v-overlay>

  <v-container fluid class="pa-4">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <h1>
          <v-icon class="mr-2">mdi-shield-account</v-icon>
          Team Details
        </h1>
      </v-col>
    </v-row>

    <!-- Team Overview -->
    <v-card v-if="team" elevation="2" class="mb-4">
      <v-card-title class="bg-primary d-flex align-center">
        <v-icon class="mr-2">mdi-shield-account</v-icon>
        <span>{{ team.name }}</span>
        <v-spacer />
        <v-btn variant="elevated" color="primary" @click="syncW3CTeam" :loading="isLoading" :disabled="isLoading" prepend-icon="mdi-sync">
          Sync W3C Info
        </v-btn>
      </v-card-title>
      <v-card-text v-if="team.seasons_info">
        <p><strong>Final Score:</strong> {{ team.seasons_info[0].final_score }}</p>
        <p><strong>Points Against:</strong> {{ team.seasons_info[0].points_against }}</p>
        <p><strong>Points Available:</strong> {{ team.seasons_info[0].points_available }}</p>
        <!-- Add more details as needed -->
      </v-card-text>
    </v-card>

    <!-- Players -->
    <v-card elevation="2">
      <v-card-title class="bg-primary d-flex align-center">
        <v-icon class="mr-2">mdi-account-multiple</v-icon>
        <span>Team Players</span>
        <v-spacer />
        <v-btn variant="elevated" prepend-icon="mdi-plus" @click="showNewPlayerModal = true">
          Add Player
        </v-btn>
      </v-card-title>

      <v-card-text v-if="!errorMessage" class="pa-0">
        <v-data-table
          :headers="tableHeader"
          :loading="isLoading"
          :items="players"
          :row-props="getRowClass"
          fixed-header
          hover
        >
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>
            <template v-slot:item="{ item }">
              <tr class="text-no-wrap">
                <td>{{ item.id }}</td>
                <td>
                  <span @click.stop="showStats(item)" style="cursor: pointer; text-decoration: underline;">
                    {{ item.name }}
                  </span>
                </td>
                <td>{{ item.battleTag }}</td>
                <td>
                  <div v-if="item.country">
                    <FlagIcon :countryIdentifier="item.country" />
                  </div>
                </td>
                <td>{{ item.discordTag }}</td>
                <td>{{ item.mmr }}</td>
                <td>
                  <div v-if="item.race">
                    <RaceIcon :raceIdentifier="item.race" />                                          
                  </div>
                </td>     
                <td>
                  <div v-if="item.signup_seasons && item.signup_seasons.length > 0">
                    <template v-for="s in item.signup_seasons.slice().sort((a,b) => b.id - a.id).slice(0,2)" :key="s.id">
                      <v-chip small class="ma-1">{{ s.name }}</v-chip>
                    </template>
                    <v-menu v-if="item.signup_seasons.length > 2" offset-y>
                      <template #activator="{ props }">
                        <v-chip v-bind="props" class="ma-1" small>+{{ item.signup_seasons.length - 2 }}</v-chip>
                      </template>
                      <v-list>
                        <v-list-item v-for="s in item.signup_seasons.slice().sort((a,b) => b.id - a.id)" :key="s.id">
                          <v-list-item-title>{{ s.name }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div v-else>—</div>
                </td>
                <td>
                  <v-menu location="bottom end">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" size="small"></v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="showStats(item)" prepend-icon="mdi-chart-box">
                        <v-list-item-title>View Stats</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="removePlayerFromTeam(item.id)" prepend-icon="mdi-delete">
                        <v-list-item-title>Remove from Team</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </template>
        </v-data-table>
      </v-card-text>

      <!-- Enhanced Empty State -->
      <v-card-text v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
        <div class="text-h6 text-grey mt-4 mb-2">No players found</div>
        <p class="text-grey-darken-1 mb-4">Add players to this team to get started</p>
        <v-btn variant="elevated" color="primary" prepend-icon="mdi-plus" @click="showNewPlayerModal = true">
          Add First Player
        </v-btn>
      </v-card-text>
    </v-card>

  <!-- Add New Player Modal -->
  <v-dialog v-model="showNewPlayerModal" persistent max-width="900">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
        Select Players to Add
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Filters -->
        <v-expansion-panels class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title class="bg-secondary">
              <v-icon class="mr-2">mdi-filter</v-icon>
              <span>Filters</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pt-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchName"
                    label="Search Player Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    density="comfortable"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="searchRace"
                    clearable
                    label="Race"
                    :items="races"
                    item-title="name"
                    item-value="name"
                    variant="outlined"
                    prepend-inner-icon="mdi-sword"
                    density="comfortable"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-medium mb-2">
                    <v-icon class="mr-1" size="small">mdi-numeric</v-icon>
                    MMR Range
                  </div>
                  <v-range-slider
                    v-model="rangeValues"
                    :min="0"
                    :max="3000"
                    strict
                    step="10"
                    color="primary"
                    class="align-center"
                    hide-details
                  >
                    <template v-slot:prepend>
                      <v-text-field
                        v-model="rangeValues[0]"
                        density="compact"
                        disabled
                        type="number"
                        hide-details
                        single-line
                        variant="outlined"
                        style="width: 80px"
                      ></v-text-field>
                    </template>
                    <template v-slot:append>
                      <v-text-field
                        v-model="rangeValues[1]"
                        density="compact"
                        disabled
                        type="number"
                        hide-details
                        single-line
                        variant="outlined"
                        style="width: 80px"
                      ></v-text-field>
                    </template>
                  </v-range-slider>
                </v-col>
              </v-row>
              <v-row v-if="searchEnabled" justify="center" class="mt-2">
                <v-col cols="auto">
                  <v-btn @click="fetchAllPlayers" variant="elevated" prepend-icon="mdi-refresh" color="primary">Reset Filters</v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-data-table
          :headers="playerTableHeaders"
          :items="filteredAllPlayers"
          item-value="id"
          v-model="selectedPlayers"
          show-select
          :item-disabled="isRowDisabled"
          density="comfortable"
        >
          <template v-slot:[`item.name`]="{ item }">
            <span @click.stop="showStats(item)" style="cursor: pointer; text-decoration: underline; color: var(--v-theme-primary);">
              {{ item.name }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showNewPlayerModal = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-content-save" @click="saveSelectedPlayers">
          Add Selected Players
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Player Details Modal -->
  <PlayerDetailsDialog 
    v-model="showPlayerDetails" 
    :player="playerDetails" 
    :seasonId="seasonId" 
  />
  </v-container>
</template>

<script setup>
import '@/assets/base.css';
import { useRouter } from 'vue-router';
import { useTeamStore, usePlayerStore } from '@/stores';
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import FlagIcon from '@/components/FlagIcon.vue';
import RaceIcon from '@/components/RaceIcon.vue';
import PlayerDetailsDialog from '@/components/PlayerDetailsDialog.vue';

defineOptions({ name: 'SeasonTeamDetailsView' });

// Router and store setup
const router = useRouter();
const teamStore = useTeamStore();
const playerStore = usePlayerStore();

// Route params
const teamId = computed(() => router.currentRoute.value.params.id);
const seasonId = computed(() => router.currentRoute.value.params.season_id);

// Store refs
const { team } = storeToRefs(teamStore);
const { players: allPlayers } = storeToRefs(playerStore);

// State management
const isLoading = ref(false);
const errorMessage = ref(null);
const players = ref([]);
const showNewPlayerModal = ref(false);
const selectedPlayers = ref([]);

// Player details state
const showPlayerDetails = ref(false);
const playerDetails = ref(null);

// Search state
const searchRace = ref(null);
const searchName = ref(null);
const searchEnabled = ref(false);
const rangeValues = ref([0, 3000]);

// Table configuration
const tableHeader = [
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },  
  { title: 'Battletag', value: 'battleTag', sortable: true },    
  { title: 'Country', value: 'country', sortable: true },
  { title: 'Discord Name', value: 'discordTag', sortable: true }, 
  { title: 'GNL MMR', value: 'mmr', sortable: true }, 
  { title: 'Main Race', value: 'race', sortable: true },  
  { title: 'Signups', value: 'signups', sortable: false },    
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }, 
];

const playerTableHeaders = [
  { title: 'Name', value: 'name' },
  { title: 'BattleTag', value: 'battleTag' },
  { title: 'Country', value: 'country' },
  { title: 'MMR', value: 'mmr' },
];

const races = ref([
  { name: "HU" },
  { name: "OC" },
  { name: "UD" },
  { name: "NE" },
]);

// Methods
const getRowClass = () => ({
  class: 'player-row'
});

const fetchAllPlayers = async () => {
  try {
    await playerStore.fetchPlayers();
  } catch (error) {
    console.error('Failed to fetch players:', error);
  } finally {
    isLoading.value = false;
    searchEnabled.value = false;
    searchName.value = '';
    searchRace.value = '';
    rangeValues.value = [0, 3000];
  }
};

const fetchTeam = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await teamStore.fetchTeamBySeason(teamId.value, seasonId.value);
    if (!team.value) {
      errorMessage.value = 'No team information found.';
    }
    players.value = team.value.player_by_season[seasonId.value];
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Failed to load team. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const saveSelectedPlayers = async () => {
  try {
    await teamStore.addPlayersToTeamForSeason(
      teamId.value,
      seasonId.value,
      selectedPlayers.value
    );
    selectedPlayers.value = [];
    fetchTeam();
    showNewPlayerModal.value = false;
  } catch (error) {
    console.error('Failed to save selected players:', error);
  }
};

watch(showNewPlayerModal, (newValue) => {
  if (newValue === true) {
    fetchAllPlayers();
  }
});

onMounted( () => {
  fetchTeam(); 
});

const removePlayerFromTeam = async (playerId) => {
  try {
    await teamStore.removePlayersFromTeamForSeason(
      teamId.value,
      seasonId.value,
      [playerId]
    );
    fetchTeam();
  } catch (error) {
    console.error('Error removing player:', error);
  }
};

const syncW3CTeam = async () => {
  isLoading.value = true;
  try {
    await teamStore.syncPlayersW3C(teamId.value, seasonId.value);
    await fetchTeam();
  } catch (error) {
    console.error('Error syncing W3C data:', error);
  } finally {
    isLoading.value = false;
  }
};

const isRowDisabled = (item) => {
  let playerAlreadyInTeam = false;
  for (const player in players.value) {
    if (player == item.id) {
      playerAlreadyInTeam = true;
      break;
    }
  }
  return playerAlreadyInTeam;
};

const showStats = async (player) => {
  showPlayerDetails.value = true;
  playerDetails.value = player;
};

const searchPlayer = async () => {
  // Use client-side filtering for the Add Player modal (allPlayers already fetched).
  searchEnabled.value = true;
};



const filteredAllPlayers = computed(() => {
  let list = allPlayers.value || [];

  // Only include players who signed up for the current season
  if (seasonId.value) {
    const sid = String(seasonId.value);
    list = list.filter(p => {
      if (!p.signup_seasons) return false;
      return p.signup_seasons.some(s => String(s.id) === sid);
    });
  }

  if (searchName.value && searchName.value.trim().length > 0) {
    const q = searchName.value.trim().toLowerCase();
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase();
      const bt = (p.battleTag || '').toLowerCase();
      return name.includes(q) || bt.includes(q);
    });
  }

  if (searchRace.value) {
    list = list.filter(p => p.race === searchRace.value);
  }

  if (Array.isArray(rangeValues.value) && rangeValues.value.length === 2) {
    const min = Number(rangeValues.value[0] ?? 0);
    const max = Number(rangeValues.value[1] ?? 3000);
    list = list.filter(p => {
      const mmr = Number(p.mmr ?? 0);
      return mmr >= min && mmr <= max;
    });
  }

  return list;
});

</script>

<style scoped>
.player-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
