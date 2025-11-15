<template>
  <div>
    <!-- Team Overview -->
    <h1>Team Details</h1>
    <v-card v-if="team">
      <v-card-title>
        <div class="d-flex align-center" style="width:100%">
          <div class="d-flex align-center">
            <v-icon left icon="mdi-account-group"></v-icon> {{ team.name }}
          </div>
          <v-spacer></v-spacer>
          <div>
            <v-btn small color="green" @click="syncW3CTeam" :loading="isLoading" :disabled="isLoading">
              <v-icon left>mdi-sync</v-icon>
              Sync wc3 info
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-if="team.seasons_info">
        <p><strong>Final Score:</strong> {{ team.seasons_info[0].final_score }}</p>
        <p><strong>Points Against:</strong> {{ team.seasons_info[0].points_against }}</p>
        <p><strong>Points Available:</strong> {{ team.seasons_info[0].points_available }}</p>
        <!-- Add more details as needed -->
      </v-card-text>
    </v-card>

    <!-- Players -->
    <div id="playerList">
      <v-row>
        <v-col>
            <v-btn 
                      @click="showNewPlayerModal = true"
                      class="toolbar-btn"
                      variant="tonal"
                      prepend-icon="mdi-plus"
                    >Add New Player</v-btn>
        </v-col>
      </v-row>
      <!-- Error Message -->
      <v-row justify="center" v-if="errorMessage" class="error-message">
        <v-col cols="auto">
          <p>{{ errorMessage }}</p>
        </v-col>
      </v-row>  
      <!-- Table -->
      <v-row v-else-if="players && players.length > 0">
        <v-col cols="12">
          <v-data-table
            :headers="tableHeader"
            :loading="isLoading"
            :items="players"
            fixed-header
            hover>
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
            </template>
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>
                  <v-icon icon="mdi-account"></v-icon>
                  Player list
                </v-toolbar-title>                    
              </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
              <tr class="text-no-wrap">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.battleTag }}</td>
                <td>{{ item.country }}</td>
                <td>{{ item.discordTag }}</td>
                <td>{{ item.mmr }}</td>
                <td>{{ item.race }}</td>     
                <!-- Have a button with click | opens a pannel | with each race's mmr / WR / Wins + losses AND Link to w3c -->           
                <td>stats</td>
                <td>fantasy</td>
                <td>
                  <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click="removePlayerFromTeam(item.id)"></v-btn>                   
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-row>          
      <!-- No User Found -->
      <v-row v-else justify="center">
        <v-cols cols="auto">
          <p>No users found.</p>
        </v-cols>
      </v-row>
    </div>
  </div>
  <!-- Add New Player Modal -->
  <v-dialog v-model="showNewPlayerModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon left icon="mdi-account-multiple-plus"></v-icon>
          Select Players to Add
          <!-- Filters -->
          <div id="playerFilters">
              <v-row>
                <v-col cols="12">
                  <v-expansion-panels>
                    <v-expansion-panel class="search-engine">
                      <v-expansion-panel-title>
                          <v-row no-gutters>
                            <v-col class="d-flex justify-start" cols="4">
                              <h2 class="text-subtitle-2 pannel-title">Filters</h2>
                            </v-col>
                          </v-row>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                            v-model="searchName" 
                            label="Search a player name...">
                            </v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-select 
                              v-model="searchRace"
                              clearable
                              label="Races"
                              :menu-props="{ scrollStrategy: 'close'}"
                              :items="races"
                              item-title="name">
                            </v-select>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <h3 class="text-subtitle-2 text-center">MMR range</h3>
                            <v-range-slider
                              v-model="rangeValues"
                              :min="0"
                              :max="3000"
                              strict
                              step="10"
                              class="align-center"
                              hide-details>
                              <template v-slot:prepend>
                                <v-text-field
                                  v-model="rangeValues[0]"
                                  density="compact"
                                  disabled
                                  type="number"
                                  hide-details
                                  single-line></v-text-field>
                              </template>
                              <template v-slot:append>
                                <v-text-field
                                  v-model="rangeValues[1]"
                                  density="compact"
                                  disabled
                                  type="number"
                                  hide-details
                                  single-line></v-text-field>
                              </template>
                            </v-range-slider>
                          </v-col>
                        </v-row>
                        <v-row justify="center">
                          <v-col cols="auto">
                            <v-btn v-if="searchEnabled" @click="fetchPlayers" variant="tonal" prepend-icon="mdi-refresh">Reset</v-btn>
                          </v-col>
                        </v-row>
                      </v-expansion-panel-text>              
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>   
            </div>
        </v-card-title>
        <v-card-text>
          <!-- disabling does not work might want to prefilter the users-->
                  <v-data-table
                    :headers="playerTableHeaders"
                    :items="filteredAllPlayers"
                    item-value="id"
                    v-model="selectedPlayers"
                    show-select
                    :item-disabled="isRowDisabled"
                  >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Available Players</v-toolbar-title>
              </v-toolbar>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" @click="saveSelectedPlayers">Save</v-btn>
          <v-btn color="red" @click="showNewPlayerModal = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script setup>
import '@/assets/base.css';
import { useRouter } from 'vue-router';
import { useTeamStore, usePlayerStore } from '@/stores';
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

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
  { title: 'W3C Stats', value: 'w3c_stats', sortable: false },  
  { title: 'Fantasy Tier', value: 'fantasy_tier', sortable: false },    
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
<style>
.disabled-row {
  color: grey;
  pointer-events: none;
}
</style>
