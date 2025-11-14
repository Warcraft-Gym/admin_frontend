<template>
    <div>
      <raceIcon />
      <h1>Player Information</h1>
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
                    <v-col cols="4">
                      <v-text-field
                        v-model="searchName"
                        label="Search a player name...">
                      </v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <RaceSelect v-model="searchRace" />
                    </v-col>
                    <v-col cols="4">
                      <v-select
                        v-model="selectedSeasonFilter"
                        :items="seasons"
                        item-title="name"
                        item-value="id"
                        clearable
                        label="Filter by Season"
                      ></v-select>
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
      <!-- Players -->
      <div id="playerList">
        <!-- Error Message -->
        <v-row justify="center" v-if="errorMessage" class="error-message">
          <v-col cols="auto">
            <p>{{ errorMessage }}</p>
          </v-col>
        </v-row>  
        <!-- Table -->
        <v-row v-else-if="players.length > 0">
          <v-col cols="12">
            <v-data-table
              :headers="tableHeader"
              :loading="isLoading"
              :items="filteredPlayers"
              fixed-header
              hover>
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>
                    <v-icon icon="mdi-account"></v-icon>
                  </v-toolbar-title>                    
                  <v-btn 
                    @click="openCreateNew"
                    class="toolbar-btn"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                  >Add New Player</v-btn>
                </v-toolbar>
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
                    <v-btn class="table-action" density="compact" color="blue" icon="mdi-account-edit" @click="editPlayer(item)"></v-btn>
                    <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click="openDeleteDialog(item.id, removePlayer)"></v-btn>
                    <!-- per-player sync status: icon-only button inside table -->
                    <v-btn
                      class="table-action"
                      density="compact"
                      color="green"
                      icon
                      @click.stop.prevent="syncW3CPlayer(item.id)"
                      :loading="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'loading'"
                      :disabled="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'loading'"
                    >
                      <template v-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'success'">
                        <v-icon small color="green">mdi-check-circle</v-icon>
                      </template>
                      <template v-else-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'error'">
                        <v-tooltip>
                          <template #activator="{ props }">
                            <v-icon v-bind="props" small color="red" @click.stop.prevent="syncW3CPlayer(item.id)">mdi-alert-circle</v-icon>
                          </template>
                          <span>{{ perPlayerSyncStatus[item.id].message || 'Sync failed — click to retry' }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-icon small class="text--secondary">mdi-sync</v-icon>
                      </template>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-col>
        </v-row>          
        <!-- No User Found -->
        <v-row v-else justify="center">
          <v-col cols="auto">
            <p>No users found.</p>
          </v-col>
        </v-row>
      </div>
      <!-- Add New Player Modal -->
      <v-dialog
        id="newPlayerModal"
        v-if="showNewPlayerModal"
        v-model="showNewPlayerModal"
        max-width="65vw">
        <v-card>
          <v-alert
            v-if="creationError"
            type="error"
            class="mx-4 my-2"
            dense
            border="start"
            border-color="red"
          >
          {{ creationError }}
        </v-alert>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-plus"></v-icon>
              Add New Player
            </span>
          </template>
          <template v-slot:text>
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.name" 
                  label="Player name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.battleTag" 
                  label="Player BattleTag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <CountrySelect v-model="newPlayer.country" />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.discordTag" 
                  label="Player Discord Tag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.discordId"
                  label="Player Discord ID"
                  hint="Numeric Discord user id (required)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <v-number-input
                  v-model="newPlayer.mmr" 
                  control-variant="hidden"
                  label="Player MMR"
                  :hideInput="false"
                  :inset="false"
                ></v-number-input>
              </v-col>
              <v-col cols="6">
                <RaceSelect v-model="newPlayer.race" />
              </v-col>
            </v-row> 
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.fantasy_tier" 
                  label="Player Fantasy Tier">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="selectedSignupSeasonIdsNew"
                  :items="seasons"
                  item-title="name"
                  item-value="id"
                  multiple
                  chips
                  label="Signed-up Seasons"
                  clearable
                ></v-select>
              </v-col>
            </v-row>           
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-plus"
              @click="createNewPlayer"
              color="light-green"
              variant="tonal">
              Add
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelAddNewPlayer"
              color="orange"
              variant="tonal">
              Cancel
            </v-btn>
          </v-card-actions>        
        </v-card>
      </v-dialog>

      <!-- Edit Player Modal -->
      <v-dialog
        id="EditPlayerModal"
        v-model="showEditPlayerModal"
        max-width="65vw">
        <v-card>
          <v-alert
            v-if="updateError"
            type="error"
            class="mx-4 my-2"
            dense
            border="start"
            border-color="red"
          >
            {{ updateError }}
          </v-alert>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ selectedPlayer.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.name" 
                  label="Player name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.battleTag" 
                  label="Player BattleTag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">                
                <CountrySelect v-model="selectedPlayer.country" />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.discordTag" 
                  label="Player Discord Tag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.discordId"
                  label="Player Discord ID"
                  hint="Numeric Discord user id (required)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <v-number-input
                  v-model="selectedPlayer.mmr" 
                  control-variant="hidden"
                  label="Player MMR"
                  :hideInput="false"
                  :inset="false"
                ></v-number-input>
              </v-col>
              <v-col cols="6">
                <RaceSelect v-model="selectedPlayer.race" />
              </v-col>
            </v-row> 
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.fantasy_tier" 
                  label="Player Fantasy Tier">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="selectedSignupSeasonIds"
                  :items="seasons"
                  item-title="name"
                  item-value="id"
                  multiple
                  chips
                  label="Signed-up Seasons"
                ></v-select>
              </v-col>
            </v-row>           
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-pencil"
              @click="updatePlayer"
              color="light-green"
              variant="tonal">
              Edit
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelEdit"
              color="orange"
              variant="tonal">
              Cancel
            </v-btn>
          </v-card-actions>        
        </v-card>
      </v-dialog>
    </div>
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this item? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-btn @click="cancelDeleteDialog" color="grey">Cancel</v-btn>
          <v-btn @click="confirmDelete" color="red">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  selectedPlayer.value = null; // Clear the selected user
  showEditPlayerModal.value = false;
};

const createNewPlayer = async () => {
  creationError.value = '';
  try {
    // send newPlayer directly — fields use backend schema names
    const created = await playerStore.createPlayer(newPlayer.value);

    // determine created player id: prefer API return, otherwise refetch and find by unique battletag
    let createdId = created && created.id ? created.id : null;
    if (!createdId) {
      await fetchPlayers();
      // try to find by battletag and name as fallback
      const found = (players.value || []).find(p => p.battleTag === newPlayer.value.battleTag && p.name === newPlayer.value.name);
      createdId = found ? found.id : null;
    }

    // If seasons were selected, register the user for those seasons
    if (createdId && Array.isArray(selectedSignupSeasonIdsNew.value) && selectedSignupSeasonIdsNew.value.length > 0) {
      try {
        await Promise.all(selectedSignupSeasonIdsNew.value.map(sid => seasonStore.addUserSignup(sid, [createdId])));
      } catch (err) {
        console.error('Failed to add user signup for new player:', err);
      }
    }

    // refresh players list and close modal
    await fetchPlayers();
    cancelAddNewPlayer();
  } catch (error) {
    console.error('Error creating user:', error);
    creationError.value = 'Error creating user: ' + error;
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

<style>

/* Table */
.table-action {
  margin-right: 15px;
}

/* Toolbar */
.toolbar-btn {
  margin-right : 15px !important;
}

/* pannel */
.pannel-title {
  margin: 0;
}

</style>
