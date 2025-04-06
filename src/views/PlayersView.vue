<template>
    <div>
      <h1>Player Information</h1>
      <v-row>
        <v-col cols="12">
          <v-expansion-panels>
            <v-expansion-panel class="search-engine">
              <v-expansion-panel-title>
                  <v-row no-gutters>
                    <v-col class="d-flex justify-start" cols="4">
                      <p class="text-subtitle-2 pannel-title">Filters</p>
                    </v-col>
                  </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="6">
                    <input v-model="searchName" type="text" placeholder="Search a player name...">
                  </v-col>
                  <v-col cols="6">
                    <select v-model="searchRace">
                      <option value="" selected disabled hidden>races</option>
                      <option v-for="race in races">{{ race.name }}</option>
                    </select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <p>mmr range</p>
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
                <v-row>
                  <v-col cols="auto">
                    <v-btn @click="searchPlayer" append-icon="mdi-magnify">Search</v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn v-if="searchEnabled" @click="fetchPlayers" variant="tonal" append-icon="mdi-refresh">Reset</v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
              
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>      

      <v-row v-else-if="players.length > 0">
        <v-col cols="12">
          <!-- Loading State -->
          <div v-if="isLoading">Loading Players...</div>
          <v-table fixed-header height="60vh" >
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>BattleTag</th>
                <th>Country</th>
                <th>Discord Tag</th>
                <th>GNL MMR</th>
                <th>Main Race</th>
                <th>W3C Stats</th>
                <th>
                  <v-btn @click="showNewPlayerModal = true">Add New Player</v-btn>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in players" :key="player.id">
                <td>{{ player.id }}</td>
                <td>{{ player.name }}</td>
                <td>{{ player.battleTag }}</td>
                <td>{{ player.country }}</td>
                <td>{{ player.discordTag }}</td>
                <td>{{ player.mmr }}</td>
                <td>{{ player.race }}</td>     
                <!-- Have a button with click | opens a pannel | with each race's mmr / WR / Wins + losses AND Link to w3c -->           
                <td>stats</td>
                <td>
                  <v-row>
                    <v-col cols="auto">
                      <v-btn density="compact" icon="mdi-account-edit" @click="editPlayer(player)"></v-btn>
                    </v-col>
                    <v-col cols="auto">
                      <v-btn density="compact" color="red" icon="mdi-trash-can" @click="removePlayer(player.id)"></v-btn>
                    </v-col>
                    <v-col cols="auto">
                      <!-- SECURE SYNC BUTTON WITH TIMEOUT -->
                      <v-btn density="compact" color="green" icon="mdi-sync"></v-btn>
                    </v-col>
                  </v-row>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
      <!-- No Users Found Message -->
      <div v-else>No users found.</div>

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
