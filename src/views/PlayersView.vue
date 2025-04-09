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
                        :item-props="itemProps"
                        :items="races">
                        <template v-slot:selection="{ item }">            
                          <span>
                            <v-avatar :image="item.raw.icon" rounded="0" size="20"></v-avatar>
                            {{ item.raw.name }}
                          </span>     
                        </template>
                        <template v-slot:item="{ props: itemProps, item }">
                          <v-list-item
                            v-bind="itemProps"
                            :title="item.raw.name">  
                            <template v-slot:prepend>
                              <v-avatar :image="item.raw.icon" rounded="0" size="28"></v-avatar>
                            </template>                         
                          </v-list-item>
                        </template>
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
                    <h2>Player list</h2>
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
                  <td>
                    <div v-if="item.country !== null && item.country !== ''">
                      <v-tooltip 
                        location="top"
                        :text="CountryCodes.findCountry({'a2': item.country}).name">
                        <template v-slot:activator="{ props }">                          
                          <span v-bind="props" :class="'fp '+ item.country.toLowerCase()"></span>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                  <td>{{ item.discordTag }}</td>
                  <td>{{ item.mmr }}</td>
                  <td>
                    <div v-if="item.race !== null && item.race !== ''">
                      <v-tooltip 
                        location="top"
                        :text="retrieveRaceInfo( item.race ).name">
                        <template v-slot:activator="{ props }"> 
                          <v-avatar 
                            v-bind="props" 
                            :image="retrieveRaceInfo( item.race ).icon" 
                            rounded="0" 
                            size="28">
                          </v-avatar>                                                   
                        </template>
                      </v-tooltip>                      
                    </div>
                  </td>     
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
      <v-dialog
        id="newPlayerModal"
        v-if="showNewPlayerModal"
        v-model="showNewPlayerModal"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-plus"></v-icon>
              Add New Player
            </span>
          </template>
          <template v-slot:text>
            <v-row dense="true">
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
            <v-row dense="true">
              <v-col cols="6">
                <v-autocomplete 
                  v-model="newPlayer.country"
                  :menu-props="{ scrollStrategy: 'close'}"
                  :items="countries"
                  item-title="name"
                  item-value="a2"
                  label="Player Country"
                  >
                  <template v-slot:selection="{ item }">
                      <span style="margin-right: 5px" v-if="item.raw.a2" :class="'fp '+ item.raw.a2.toLowerCase()"></span>
                      {{ item.raw.name }}                      
                  </template>
                  <template v-slot:item="{ props: props, item }">
                    <v-list-item
                      v-bind="props"
                      :title="item.raw.name">  
                      <template v-slot:prepend>                         
                        <span style="margin-right: 5px" :class="'fp '+ item.raw.a2.toLowerCase()"></span>
                      </template>                         
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.discordTag" 
                  label="Player Discord Tag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row dense="true">
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
                <v-select 
                  v-model="newPlayer.race"
                  label="Races"
                  :menu-props="{ scrollStrategy: 'close'}"
                  :item-props="itemProps"
                  :items="races">
                  <template v-slot:selection="{ item }">            
                    <span>
                      <v-avatar :image="item.raw.icon" rounded="0" size="20"></v-avatar>
                      {{ item.raw.name }}
                    </span>     
                  </template>
                  <template v-slot:item="{ props: itemProps, item }">
                    <v-list-item
                      v-bind="itemProps"
                      :title="item.raw.name">  
                      <template v-slot:prepend>
                        <v-avatar :image="item.raw.icon" rounded="0" size="28"></v-avatar>
                      </template>                         
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row> 
            <v-row dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="newPlayer.fantasyTier" 
                  label="Player Fantasy Tier">
                </v-text-field>
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
        v-if="selectedPlayer"
        v-model="selectedPlayer"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ selectedPlayer.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row dense="true">
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
            <v-row dense="true">
              <v-col cols="6">
                <v-autocomplete 
                  v-model="selectedPlayer.country"
                  :menu-props="{ scrollStrategy: 'close'}"
                  :items="countries"
                  item-title="name"
                  item-value="a2"
                  label="Player Country"
                  >
                  <template v-slot:selection="{ item }">
                      <span style="margin-right: 5px" v-if="item.raw.a2" :class="'fp '+ item.raw.a2.toLowerCase()"></span>
                      {{ item.raw.name }}                      
                  </template>
                  <template v-slot:item="{ props: props, item }">
                    <v-list-item
                      v-bind="props"
                      :title="item.raw.name">  
                      <template v-slot:prepend>                         
                        <span style="margin-right: 5px" :class="'fp '+ item.raw.a2.toLowerCase()"></span>
                      </template>                         
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.discordTag" 
                  label="Player Discord Tag">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row dense="true">
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
                <v-select 
                  v-model="selectedPlayer.race"
                  label="Races"
                  :menu-props="{ scrollStrategy: 'close'}"
                  :item-props="itemProps"
                  :items="races">
                  <template v-slot:selection="{ item }">            
                    <span>
                      <v-avatar :image="item.raw.icon" rounded="0" size="20"></v-avatar>
                      {{ item.raw.name }}
                    </span>     
                  </template>
                  <template v-slot:item="{ props: itemProps, item }">
                    <v-list-item
                      v-bind="itemProps"
                      :title="item.raw.name">  
                      <template v-slot:prepend>
                        <v-avatar :image="item.raw.icon" rounded="0" size="28"></v-avatar>
                      </template>                         
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row> 
            <v-row dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="selectedPlayer.fantasyTier" 
                  label="Player Fantasy Tier">
                </v-text-field>
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
  fantasyTier: '',
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

//Countries
import CountryCodes from 'country-code-info'
import countries from 'country-code-info/data/countries.json'

//RACES
import HUicon from '@/assets/raceIcons/HUMAN.png'
import OCicon from '@/assets/raceIcons/ORC.png'
import UDicon from '@/assets/raceIcons/UNDEAD.png'
import NEicon from '@/assets/raceIcons/NIGHT_ELF.png'
import RAicon from '@/assets/raceIcons/RANDOM.png'

const races = [
  {
    value: 'HU',
    name: 'Human',
    icon: HUicon
  },
  {
    value: 'OC',
    name: 'Orc',
    icon: OCicon
  },
  {
    value :'UD',
    name: 'Undead',
    icon: UDicon
  },
  {
    value :'NE',
    name: 'Nightelf',
    icon: NEicon
  },
  {
    value :'RANDOM',
    name: 'Random',
    icon: RAicon
  },
]

const retrieveRaceInfo = ( raceName ) => {
  const currentRace = races.find( ({ value }) => value === raceName );
  return currentRace
}

export default {

    name: 'PlayersView',
    setup(){
        console.log(countries)
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
            console.log( searchRace )
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
            retrieveRaceInfo,       
            fetchPlayers,

            CountryCodes,
            countries,
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

</style>
