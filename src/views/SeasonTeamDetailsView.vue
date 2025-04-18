<template>
  <div>
    <!-- Team Overview -->
    <h1>Team Details</h1>
    <v-card v-if="team">
      <v-card-title>
        <v-icon left icon="mdi-account-group"></v-icon> {{ team.name }}
      </v-card-title>
      <v-card-text v-if="team.seasons_info">
        <p><strong>Score:</strong> {{ team.seasons_info[0].final_score }}</p>
        <p><strong>Score:</strong> {{ team.seasons_info[0].points_against }}</p>
        <p><strong>Score:</strong> {{ team.seasons_info[0].points_available }}</p>
        <!-- Add more details as needed -->
      </v-card-text>
    </v-card>

    <!-- Players -->
    <div id="playerList">
          <v-btn density="compact" color="green" icon="mdi-sync" @click="syncW3CTeam"></v-btn>
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
        </v-card-title>
        <v-card-text>
          <!-- disabling does not work might want to prefilter the users-->
          <v-data-table
            :headers="playerTableHeaders"
            :items="allPlayers"
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

<script>
import '@/assets/base.css';
import { useRouter } from 'vue-router';
import { useTeamStore, usePlayerStore } from '@/stores';
import { computed, onMounted, ref, watch } from 'vue';

const isLoading  = ref(false); // State for selected user
const errorMessage = ref(null);

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
    name: 'SeasonTeamDetailsView',
    setup(){
        // Fetch data when the page is loaded
        const router = useRouter();
        const teamId = router.currentRoute.value.params.id;
        const seasonId = router.currentRoute.value.params.season_id;
        const teamStore = useTeamStore();
        const playerStore = usePlayerStore();
        const players = ref([]);
        // Modal state
        const showNewPlayerModal = ref(false);
        const selectedPlayers = ref([]);

        //research models
        const searchRace = ref(null)
        const searchName = ref(null)
        const searchEnabled = ref(false)
        const rangeValues = ref([500, 1500])

        // Headers for the modal's player table
        const playerTableHeaders = [
          { title: 'Name', value: 'name' },
          { title: 'BattleTag', value: 'battleTag' },
          { title: 'Country', value: 'country' },
          { title: 'MMR', value: 'mmr' },
        ];

        const fetchAllPlayers = async () => {
          try {
            await playerStore.fetchPlayers();
          } catch (error) {
            console.error('Failed to fetch players:', error);
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

        const saveSelectedPlayers = async () => {
          try {
            await teamStore.addPlayersToTeamForSeason(
              teamId, seasonId, selectedPlayers.value
            );
            selectedPlayers.value=[]
            fetchTeam(); // Refresh team data
            showNewPlayerModal.value = false; // Close modal
          } catch (error) {
            console.error('Failed to save selected players:', error);
          }
        };


        // Fetch users when the component is mounted
        const fetchTeam = async () => {
          
          isLoading.value = true;
          errorMessage.value = null; // Reset error message
          try {
            await teamStore.fetchTeamBySeason(teamId, seasonId)
            if (!teamStore.team) {
              errorMessage.value = 'No team information found.';
            }
            players.value = teamStore.team.player_by_season[seasonId]
          } catch (error) {
            console.error(error)
            errorMessage.value = 'Failed to load team. Please try again later.';
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
            await teamStore.removePlayersFromTeamForSeason(teamId, seasonId, [playerId])// Fetch user data
            fetchTeam(); 
          } catch (error) {
            console.error('Error deleting player:', error);
          }
        };

        const syncW3CTeam = async () => {
          try {
            await teamStore.syncPlayersW3C(teamId, seasonId)// Fetch user data
            fetchTeam(); 
          } catch (error) {
            console.error('Error deleting player:', error);
          }
        };

        // Function to disable rows where MMR is below 1000
        const isRowDisabled = (item) => {
          let playerAlreadyInTeam = false;
          for (const player in players.value){
            if (player == item.id){
              playerAlreadyInTeam = true
              break
            }
          }
          return playerAlreadyInTeam; // Example condition
        };


        // Methods
        const searchPlayer = async () => {
          
          isLoading.value = true;

          try {
            await playerStore.searchPlayer( searchName.value, searchRace.value, rangeValues.value[0], rangeValues.value[1] );
          } finally {
            isLoading.value = false;            
            searchEnabled.value = true;
          }
          
        }
        
        return {
            isLoading: computed(() => teamStore.isLoading),
            team: computed(() => teamStore.team),
            allPlayers: computed(() => playerStore.players),
            players,
            selectedPlayers,
            //table
            tableHeader,
            playerTableHeaders,

            //search variables
            searchPlayer,
            searchName,
            searchRace,
            rangeValues,
            searchEnabled,

            errorMessage,
            removePlayerFromTeam,
            races,            
            fetchTeam,
            syncW3CTeam,
            showNewPlayerModal,
            fetchAllPlayers,
            saveSelectedPlayers,
            isRowDisabled,

        }
    },
};
</script>
<style>
.disabled-row {
  color: grey;
  pointer-events: none;
}
</style>
