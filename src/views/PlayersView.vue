<template>
    <div>
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
                        :max="2000"
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
                      <v-btn @click="searchPlayer" prepend-icon="mdi-magnify" color="blue">Search</v-btn>
                    </v-col>
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
                    <v-btn 
                      @click="showNewPlayerModal = true"
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
                    <td>{{ item.country }}</td>
                    <td>{{ item.discordTag }}</td>
                    <td>{{ item.mmr }}</td>
                    <td>{{ item.race }}</td>     
                    <!-- Have a button with click | opens a pannel | with each race's mmr / WR / Wins + losses AND Link to w3c -->           
                    <td>stats</td>
                    <td>fantasy</td>
                    <td>
                      <v-btn class="table-action" density="compact" icon="mdi-account-edit" @click="editPlayer(item)"></v-btn>
                      <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click="removePlayer(item.id)"></v-btn>
                      <!-- SECURE SYNC BUTTON WITH TIMEOUT -->
                      <v-btn density="compact" color="green" icon="mdi-sync"></v-btn>                      
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

    <!-- Add New Player Modal -->
        <div v-if="showNewPlayerModal" :class="['modal', showNewPlayerModal ? 'modal-active' : '']">
          <div class="modal-content">
            <h2>Add New Player</h2>
            <form @submit.prevent="createNewPlayer">
              <div>
                <label for="name">Name:</label>
                <input id="name" v-model="newPlayer.name" />
              </div>
              <div>
                <label for="battleTag">BattleTag:</label>
                <input id="battleTag" v-model="newPlayer.battleTag" />
              </div>
              <div>
                <label for="country">Country:</label>
                <input id="country" v-model="newPlayer.country" />
              </div>
              <div>
                <label for="discordTag">Discord Tag:</label>
                <input id="discordTag" v-model="newPlayer.discordTag" />
              </div>
              <div>
                <label for="mmr">MMR:</label>
                <input id="mmr" type="number" v-model="newPlayer.mmr" />
              </div>
              <div>
                <label for="race">Race:</label>
                <input id="race" v-model="newPlayer.race" />
              </div>
              <button type="submit">Save</button>
              <button @click="cancelAddNewPlayer">Cancel</button>
            </form>
          </div>
        </div>
        <div v-if="showNewPlayerModal" class="overlay" @click="cancelAddNewPlayer"></div>


        <!-- Popup Modal -->
        <div v-if="selectedPlayer" :class="['modal', selectedPlayer ? 'modal-active' : '']" class="modal">
          <div class="modal-content">
            <h2>Edit User: {{ selectedPlayer.name }}</h2>
            <form @submit.prevent="updatePlayer">
              <div>
                <label for="name">Name:</label>
                <input id="name" v-model="selectedPlayer.name" />
              </div>
              <div>
                <label for="battleTag">BattleTag:</label>
                <input id="battleTag" v-model="selectedPlayer.battleTag" />
              </div>
              <div>
                <label for="country">Country:</label>
                <input id="country" v-model="selectedPlayer.country" />
              </div>
              <div>
                <label for="discordTag">Discord Tag:</label>
                <input id="discordTag" v-model="selectedPlayer.discordTag" />
              </div>
              <div>
                <label for="mmr">MMR:</label>
                <input id="mmr" type="number" v-model="selectedPlayer.mmr" />
              </div>
              <div>
                <label for="race">Race:</label>
                <input id="race" v-model="selectedPlayer.race" />
              </div>
              <button type="submit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </form>
          </div>
        </div>
        <!-- Modal Overlay -->
        <div v-if="selectedPlayer" class="overlay" @click="cancelEdit"></div>
    </div>
</template>
<script>
import '@/assets/base.css';
import { usePlayerStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';

// State for editing
const selectedPlayer = ref(null);
const isLoading  = ref(false); // State for selected user
const errorMessage = ref(null);
const showNewPlayerModal = ref(false);
const newPlayer = ref({
      name: '',
      battleTag: '',
      country: '',
      discordTag: '',
      mmr: 0,
      race: '',
    });

//research models
const searchRace = ref(null)
const searchName = ref(null)
const searchEnabled = ref(false)
const rangeValues = ref([500, 1500])

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
  { title: 'W3C Stats', value: 'w3c_stats', sortable: false },  
  { title: 'Fantasy Tier', value: 'fantasy_tier', sortable: false },    
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }, 
]

const races = ref([
  {
    name :"HU"
  },
  {
    name :"OC"
  },
  {
    name :"UD"
  },
  {
    name :"NE"
  },
])

export default {

    name: 'PlayersView',
    setup(){

        const playerStore = usePlayerStore();
        // Fetch data when the page is loaded


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
            rangeValues.value[0] = '500'
            rangeValues.value[1] = '1500'
          }
        };

        onMounted( () => {
          fetchPlayers(); 
        });

        // Methods
        const searchPlayer = async () => {
          
          isLoading.value = true;

          try {
            console.log( rangeValues.value[0] )
            await playerStore.searchPlayer( searchName.value, searchRace.value, rangeValues.value[0], rangeValues.value[1] );
          } finally {
            isLoading.value = false;            
            searchEnabled.value = true;
          }
          
        }

        const editPlayer = (player) => {
          selectedPlayer.value = { ...player }; // Clone the user object to avoid modifying the original object directly
        };

        const updatePlayer = async () => {
          try {
            await playerStore.updatePlayer(selectedPlayer.value);
            // Update the local state after a successful PUT request
            await fetchPlayers(); // Re-fetch the users
            cancelEdit(); // Reset the form
          } catch (error) {
            console.error('Error updating user:', error);
          }
        };

        const cancelEdit = () => {
          selectedPlayer.value = null; // Clear the selected user
        };

        const createNewPlayer = async () => {
          try {
            await playerStore.createPlayer(newPlayer.value);
            await fetchPlayers();
            cancelAddNewPlayer();
          } catch (error) {
            console.error('Error creating user:', error);
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

        const cancelAddNewPlayer = () => {
          showNewPlayerModal.value = false;
          newPlayer.value = {
            name: '',
            battleTag: '',
            country: '',
            discordTag: '',
            mmr: 0,
            race: '',
          };
        };
        
        return {
            isLoading: computed(() => playerStore.isLoading),
            players: computed(() => playerStore.players),

            //table
            tableHeader,

            //search variables
            searchPlayer,
            searchName,
            searchRace,
            rangeValues,
            searchEnabled,

            selectedPlayer,
            editPlayer,
            updatePlayer,
            cancelEdit,
            errorMessage,
            showNewPlayerModal,
            newPlayer,
            createNewPlayer,
            cancelAddNewPlayer,
            removePlayer,
            races,            
            fetchPlayers,
        }
    },
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

/* Modal styling */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.modal-content div {
  margin-bottom: 10px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal.modal-active {
  display: block; /* Visible state */
}

</style>
