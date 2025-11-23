<template>
  <raceIcon />
  <v-container fluid class="pa-4">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <h1>
          <v-icon class="mr-2">mdi-account-group</v-icon>
          Players
        </h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-expansion-panels class="mb-4">
      <v-expansion-panel>
        <v-expansion-panel-title class="bg-primary">
          <v-icon class="mr-2">mdi-filter</v-icon>
          <span>Filters</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pt-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchName"
                label="Search Player Name"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                density="comfortable"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <RaceSelect v-model="searchRace" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedSeasonFilter"
                :items="seasons"
                item-title="name"
                item-value="id"
                clearable
                label="Filter by Season"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
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
              <v-btn @click="fetchPlayers" variant="elevated" prepend-icon="mdi-refresh" color="primary">Reset Filters</v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <!-- Main Card -->
    <v-card elevation="2">
      <v-card-title class="bg-primary d-flex align-center">
        <v-icon class="mr-2">mdi-account-group</v-icon>
        <span>Players Overview</span>
        <v-spacer />
        <v-btn variant="elevated" prepend-icon="mdi-plus" @click="openCreateNew">
          Add New Player
        </v-btn>
      </v-card-title>

      <v-card-text v-if="!errorMessage" class="pa-0">
        <v-data-table
          :headers="tableHeader"
          :loading="isLoading"
          :items="filteredPlayers"
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
                  <td>{{ item.name }}</td>
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
                  <!-- Have a button with click | opens a pannel | with each race's mmr / WR / Wins + losses AND Link to w3c -->           
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
                        <v-list-item @click="editPlayer(item)" prepend-icon="mdi-pencil">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item 
                          @click="syncW3CPlayer(item.id)"
                          prepend-icon="mdi-sync"
                          :disabled="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'loading'"
                        >
                          <v-list-item-title>
                            <span v-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'success'">
                              <v-icon small color="green" class="mr-1">mdi-check-circle</v-icon> Synced
                            </span>
                            <span v-else-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'error'">
                              <v-icon small color="red" class="mr-1">mdi-alert-circle</v-icon> Retry Sync
                            </span>
                            <span v-else>Sync W3C</span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openDeleteDialog(item.id, removePlayer)" prepend-icon="mdi-delete">
                          <v-list-item-title>Delete</v-list-item-title>
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
        <p class="text-grey-darken-1 mb-4">Get started by adding your first player</p>
        <v-btn variant="elevated" color="primary" prepend-icon="mdi-plus" @click="openCreateNew">
          Add First Player
        </v-btn>
      </v-card-text>
    </v-card>
    <!-- Add New Player Dialog -->
    <v-dialog v-model="showNewPlayerModal" max-width="800">
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Add New Player
        </v-card-title>

        <v-alert
          v-if="creationError"
          type="error"
          variant="tonal"
          border="start"
          border-color="red"
          class="mx-4 my-2"
          closable
          @click:close="creationError = null"
        >
          {{ creationError }}
        </v-alert>

        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newPlayer.name"
                label="Player Name"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newPlayer.battleTag"
                label="BattleTag"
                variant="outlined"
                prepend-inner-icon="mdi-shield-account"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <CountrySelect v-model="newPlayer.country" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newPlayer.discordTag"
                label="Discord Tag"
                variant="outlined"
                prepend-inner-icon="mdi-discord"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newPlayer.discordId"
                label="Discord ID"
                hint="Numeric Discord user ID (required)"
                variant="outlined"
                prepend-inner-icon="mdi-identifier"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-number-input
                v-model="newPlayer.mmr"
                control-variant="hidden"
                label="Player MMR"
                :hideInput="false"
                :inset="false"
              ></v-number-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <RaceSelect v-model="newPlayer.race" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newPlayer.fantasy_tier"
                label="Fantasy Tier"
                variant="outlined"
                prepend-inner-icon="mdi-trophy"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedSignupSeasonIdsNew"
                :items="seasons"
                item-title="name"
                item-value="id"
                multiple
                chips
                label="Signed-up Seasons"
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-calendar-check"
                density="comfortable"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelAddNewPlayer">Cancel</v-btn>
          <v-btn
            @click="createNewPlayer"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            :loading="isCreating"
            :disabled="isCreating"
          >
            Add Player
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Player Dialog -->
    <v-dialog v-model="showEditPlayerModal" max-width="800">
      <v-card v-if="selectedPlayer">
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Edit Player: {{ selectedPlayer.name }}
        </v-card-title>

        <v-alert
          v-if="updateError"
          type="error"
          variant="tonal"
          border="start"
          border-color="red"
          class="mx-4 my-2"
          closable
          @click:close="updateError = null"
        >
          {{ updateError }}
        </v-alert>

        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedPlayer.name"
                label="Player Name"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedPlayer.battleTag"
                label="BattleTag"
                variant="outlined"
                prepend-inner-icon="mdi-shield-account"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <CountrySelect v-model="selectedPlayer.country" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedPlayer.discordTag"
                label="Discord Tag"
                variant="outlined"
                prepend-inner-icon="mdi-discord"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedPlayer.discordId"
                label="Discord ID"
                hint="Numeric Discord user ID (required)"
                variant="outlined"
                prepend-inner-icon="mdi-identifier"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-number-input
                v-model="selectedPlayer.mmr"
                control-variant="hidden"
                label="Player MMR"
                :hideInput="false"
                :inset="false"
              ></v-number-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <RaceSelect v-model="selectedPlayer.race" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="selectedPlayer.fantasy_tier"
                label="Fantasy Tier"
                variant="outlined"
                prepend-inner-icon="mdi-trophy"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedSignupSeasonIds"
                :items="seasons"
                item-title="name"
                item-value="id"
                multiple
                chips
                label="Signed-up Seasons"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-check"
                density="comfortable"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelEdit">Cancel</v-btn>
          <v-btn @click="updatePlayer" color="primary" variant="elevated" prepend-icon="mdi-content-save">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Confirm Deletion
        </v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to delete this player? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDeleteDialog" variant="text">Cancel</v-btn>
          <v-btn @click="confirmDelete" color="error" variant="elevated" prepend-icon="mdi-delete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { usePlayerStore, useSeasonStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';

defineOptions({
  name: 'PlayersView'
})

// State for editing
const selectedPlayer = ref(null);
const isLoading  = ref(false); // State for selected user
const isCreating = ref(false); // State for creating new player
const errorMessage = ref(null);
const creationError = ref(null);
const updateError = ref(null);
const showNewPlayerModal = ref(false);
const showEditPlayerModal = ref(false);
const newPlayer = ref({
  name: '',
  battleTag: '',
  country: '',
  discordTag: '',
  discordId: '',
  mmr: 0,
  race: '',
  fantasy_tier: null,
});
// seasons selected when creating a new player
const selectedSignupSeasonIdsNew = ref([]);
const playerStore = usePlayerStore();
const seasonStore = useSeasonStore();
const { players } = storeToRefs(playerStore);
const { seasons } = storeToRefs(seasonStore);
// filter for season in the grid
const selectedSeasonFilter = ref(null);

const filteredPlayers = computed(() => {
  let list = players.value || [];

  // filter by name / battletag
  if (searchName.value && searchName.value.trim().length > 0) {
    const q = searchName.value.trim().toLowerCase();
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase();
      const bt = (p.battleTag || '').toLowerCase();
      return name.includes(q) || bt.includes(q);
    });
  }

  // filter by race
  if (searchRace.value) {
    list = list.filter(p => p.race === searchRace.value);
  }

  // filter by season signup
  if (selectedSeasonFilter.value) {
    list = list.filter(p => (p.signup_seasons || []).some(s => s.id === selectedSeasonFilter.value));
  }

  // filter by mmr range
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
// seasons for signup selection
const selectedSignupSeasonIds = ref([]);
let originalSignupSeasonIds = [];
// Fetch data when the page is loaded
const showDeleteDialog = ref(false);
const selectedDeleteItemId = ref(null);
const deleteAction = ref(null);
//research models
const searchRace = ref(null);
const searchName = ref(null);
const searchEnabled = ref(false);
const rangeValues = ref([0, 3000]);

//table header
/*
ID
Name
BattleTag
Country
Discord Tag
GNL MMR
Main Race
W3C Stats
Fantasy Tier
Actions
*/
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

// Fetch users when the component is mounted
const fetchPlayers = async () => {
  
  isLoading.value = true;
  errorMessage.value = null; // Reset error message
  try {
    await playerStore.fetchPlayers(); // Fetch user data


    if (playerStore.players.length === 0) {
      errorMessage.value = 'No users found.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load users. Please try again later.';
  } finally {
    isLoading.value = false;

    //reset placeholders
    searchEnabled.value = false;
    searchName.value = ''
    searchRace.value = ''
    rangeValues.value[0] = '0'
    rangeValues.value[1] = '3000'
  }
};

onMounted( () => {
  fetchPlayers();
  seasonStore.fetchSeasons();
});

// per-player sync status map: { [playerId]: { state: 'loading'|'success'|'error', message?: string } }
const perPlayerSyncStatus = ref({});

const openDeleteDialog = (id, action) => {
  selectedDeleteItemId.value = id;
  deleteAction.value = action; // Store the function dynamically
  showDeleteDialog.value = true;
};

const openCreateNew = () => {
  newPlayer.value = {
    name: '',
    battleTag: '',
    country: '',
    discordTag: '',
    discordId: '',
    mmr: 0,
    race: '',
    fantasy_tier: null,
  };
  creationError.value = '';
  showNewPlayerModal.value = true;
};

const confirmDelete = () => {
  if (selectedDeleteItemId.value && deleteAction.value) {
    deleteAction.value(selectedDeleteItemId.value); // Call the dynamically stored function
    showDeleteDialog.value = false;
  } else if (deleteAction.value) {
    deleteAction.value(); // Call the dynamically stored function
    showDeleteDialog.value = false;
  }
};

const cancelDeleteDialog = () => {
  showDeleteDialog.value = false;
  selectedDeleteItemId.value = null;
  deleteAction.value = null; // Store the function dynamically
};

// Methods
const getRowClass = () => ({
  class: 'player-row'
});

const searchPlayer = async () => {
  // Apply client-side filters only. Backend is not queried here.
  searchEnabled.value = true;
};

const editPlayer = (player) => {
  selectedPlayer.value = { ...player }; // Clone the user object to avoid modifying the original object directly
  updateError.value = '';
  // prepare signup seasons selection
  const signup = selectedPlayer.value.signup_seasons || [];
  originalSignupSeasonIds = signup.map(s => s.id);
  selectedSignupSeasonIds.value = [...originalSignupSeasonIds];
  showEditPlayerModal.value = true;
};

const updatePlayer = async () => {
  updateError.value = '';
  try {
    // send selectedPlayer directly — fields match backend schema
    await playerStore.updatePlayer(selectedPlayer.value);
    // Update the local state after a successful PUT request
    const playerId = selectedPlayer.value.id;
    const newSignupIds = selectedSignupSeasonIds.value || [];
    const toAdd = newSignupIds.filter(id => !originalSignupSeasonIds.includes(id));
    const toRemove = originalSignupSeasonIds.filter(id => !newSignupIds.includes(id));

    // perform API calls per season via season store actions
    try {
      // additions
      await Promise.all(toAdd.map(sid => seasonStore.addUserSignup(sid, [playerId])));
      // removals
      await Promise.all(toRemove.map(sid => seasonStore.removeUserSignup(sid, [playerId])));
    } catch (err) {
      console.error('Failed to sync signup seasons:', err);
    }

    await fetchPlayers(); // Re-fetch the users
    cancelEdit(); // Reset the form
  } catch (error) {
    console.error('Error updating user:', error);
    updateError.value = 'Error updating user: ' + error;
  }
};

const cancelEdit = () => {
  showEditPlayerModal.value = false;
  selectedPlayer.value = {}; // Clear the selected user
  
};

const createNewPlayer = async () => {
  creationError.value = '';
  isCreating.value = true;
  try {
    // send newPlayer directly — fields use backend schema names
    const created = await playerStore.createPlayer(newPlayer.value);
    console.log('Player created:', created);

    // determine created player id: prefer API return, otherwise refetch and find by unique battletag
    let createdId = created && created.id ? created.id : null;
    if (!createdId) {
      await fetchPlayers();
      // try to find by battletag and name as fallback
      const found = (players.value || []).find(p => p.battleTag === newPlayer.value.battleTag && p.name === newPlayer.value.name);
      createdId = found ? found.id : null;
    }

    console.log('Created player ID:', createdId);
    console.log('Selected signup seasons:', selectedSignupSeasonIdsNew.value);

    // If seasons were selected, register the user for those seasons
    if (createdId && Array.isArray(selectedSignupSeasonIdsNew.value) && selectedSignupSeasonIdsNew.value.length > 0) {
      try {
        console.log('Adding user to seasons...');
        await Promise.all(selectedSignupSeasonIdsNew.value.map(async sid => {
          console.log(`Adding user ${createdId} to season ${sid}`);
          const result = await seasonStore.addUserSignup(sid, [createdId]);
          console.log(`Result for season ${sid}:`, result);
          return result;
        }));
        console.log('All season signups completed');
      } catch (err) {
        console.error('Failed to add user signup for new player:', err);
        creationError.value = 'Player created but failed to add to seasons: ' + err;
      }
    }

    // refresh players list and close modal
    await fetchPlayers();
    cancelAddNewPlayer();
  } catch (error) {
    console.error('Error creating user:', error);
    creationError.value = 'Error creating user: ' + error;
  } finally {
    isCreating.value = false;
  }
};

const removePlayer = async (playerId) => {
  try {
    await playerStore.deletePlayer(playerId);
    await fetchPlayers(); // Refresh the list after deletion
  } catch (error) {
    console.error('Error deleting player:', error);
  }
};

const syncW3CPlayer = async (playerId) => {
  if (!playerId) return;
  perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [playerId]: { state: 'loading' } };
  try {
    await playerStore.syncW3CPlayer(playerId);
    perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [playerId]: { state: 'success' } };
    await fetchPlayers(); // refresh list to reflect updated stats
  } catch (error) {
    console.error('Error syncing player:', playerId, error);
    const message = error && (error.message || error.msg || error.error) ? (error.message || error.msg || error.error) : (typeof error === 'string' ? error : JSON.stringify(error));
    perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [playerId]: { state: 'error', message } };
  }
};

const cancelAddNewPlayer = () => {
  showNewPlayerModal.value = false;
  newPlayer.value = {
    name: '',
    battleTag: '',
    country: '',
    discordTag: '',
    discordId: '',
    mmr: 0,
    race: '',
    fantasy_tier: null,
  };
  selectedSignupSeasonIdsNew.value = [];
};
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
