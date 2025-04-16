<template>

  <!-- Match Header -->
  <div id="matchHeader">
    <v-parallax class="banner-image" :src="bannerImg"></v-parallax>
    <div class="banner-overlay"></div>
    <div class="banner-content h-100">
      <v-container>
        <v-row class="justify-center">
          <v-col cols="auto text-center">
            <h1>Match #?</h1>
            <p>Week #?</p>
            <p><v-icon icon="mdi-calendar-week"></v-icon>{{ match.date_frame }}</p>
          </v-col>
        </v-row>
        <v-row class="align-center justify-center">
          <v-col cols="2 text-center">
            <span class="text-h2">{{ team1.name }}</span>
          </v-col>        
          <v-col cols="4 text-center">
            <span class="text-h1">
              <v-icon icon="mdi-sword-cross"></v-icon>
            </span>
          </v-col>        
          <v-col cols="2 text-center">
            <span class="text-h2">{{ team2.name }}</span>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>

  <!-- Match Series-->
  <div id="matchSeries">
    <v-item-group>
      <v-container>
        <v-row class="justify-center">
          <v-col cols="auto text-center">
            <h2>Series</h2>
          </v-col>
        </v-row>
        
        <!-- Add New Series Modal -->
        <v-row>          
          <v-col cols="auto">
            <v-btn
              @click="showNewSeriesModal = true"
              class="toolbar-btn"
              variant="tonal"
              prepend-icon="mdi-plus">
              Add a New Series
            </v-btn>
            <v-dialog
              id="newSeriesModal"
              v-if="showNewSeriesModal"
              v-model="showNewSeriesModal"
              max-width="95vw"
              max-height="95vh">
              <v-card
              prepend-icon="mdi-account-plus"
              title="Add New Series"
              :subtitle="team1.name + ' | VS | ' + team2.name">
                <template v-slot:text>                  
                    <!-- Player tables -->
                    <v-row>
                      <!-- Left Table -->
                      <v-col cols="6">
                        <v-card
                        border
                        flat>
                          <v-card-title class="bg-surface-light">
                              {{ team1.name }}                              
                          </v-card-title>
                          <v-card-subtitle class="bg-surface-light pt-1 pb-1">
                            {{ (isObjectEmpty( newSeries_Player_1 ) ) ? 'Please select a player' : 'Selected player: ' + newSeries_Player_1[0].name }}
                          </v-card-subtitle>
                          <v-card-text>                          
                            <v-data-table-virtual
                              height="250px"
                              v-model="newSeries_Player_1"                            
                              v-model:expanded="rowsExpanded_1"
                              :headers="tableHeader"
                              :items="team1.player_by_season[match.season_id]"
                              select-strategy="single"
                              density="compact"
                              show-select
                              fixed-header
                              show-expand
                              multi-sort
                              return-object
                              @click:row="(item, slot) => toggleRows( rowsExpanded_1, slot )">
                              <template v-slot:item.data-table-expand="{ internalItem, isExpanded }">
                                <v-btn
                                  :icon="isExpanded(internalItem) ? 'mdi-minus' : 'mdi-plus'"
                                  class="text-none"
                                  size="x-small"
                                  variant="plain"
                                ></v-btn>
                              </template>
                              <!-- Expanded pannel -->
                              <template v-slot:expanded-row="{ columns, item }">
                                <tr v-if="!isArrayEmpty( item.gnl_stats )">
                                  <td :colspan="columns.length" class="py-2">
                                    <!-- GNL Stats -->
                                    <v-sheet>
                                      <v-table border density="compact" class="pb-2">
                                        <tbody>
                                          <tr class="bg-surface-light">
                                            <th class="text-left"><RaceIcon :raceIdentifier="item.race" /></th>
                                            <th class="text-right">Wins</th>
                                            <th class="text-right">Losses</th>
                                            <th class="text-right">Total</th>
                                            <th class="text-right">Winrate</th>
                                          </tr>
                                        </tbody>
                                        <tbody>
                                          <tr>
                                            <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                            <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                            <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                            <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                            <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                          </tr>
                                          <tr v-if="!isObjectEmpty( item.w3c_stats.find( ({ race }) => race === item.race ) )">
                                            <td class="text-left text-overline">W3C</td>
                                            <td class="text-right text-green">{{ item.w3c_stats.find( ({ race }) => race === item.race ).wins }}</td>
                                            <td class="text-right text-red">{{ item.w3c_stats.find( ({ race }) => race === item.race ).losses }}</td>
                                            <td class="text-right">{{ item.w3c_stats.find( ({ race }) => race === item.race ).games }}</td>
                                            <td class="text-right">{{ Math.round( item.w3c_stats.find( ({ race }) => race === item.race ).winrate * 100 )  + '%' }}</td>
                                          </tr>
                                        </tbody>
                                      </v-table>
                                    </v-sheet>
                                  </td>
                                </tr>    
                                <tr v-else>
                                  <td :colspan="columns.length" class="py-2">
                                    <td>No stats found.</td>
                                  </td>                                
                                </tr>                       
                              </template>
                              <!-- Table content -->
                              <template 
                                v-slot:item.name="{ item }">
                                {{ item.name }}
                                <FlagIcon :countryIdentifier="item.country" />
                              </template>
                            </v-data-table-virtual>
                          </v-card-text>
                        </v-card>                    
                      </v-col>
                      <!-- Right Table -->
                      <v-col cols="6">
                        <v-card
                        border 
                        flat>                          
                          <v-card-title class="bg-surface-light">
                              {{ team2.name }}                              
                          </v-card-title>
                          <v-card-subtitle class="bg-surface-light pt-1 pb-1">
                            {{ ( isObjectEmpty( newSeries_Player_2 ) ) ? 'Please select a player' : 'Selected player: ' + newSeries_Player_2[0].name }}
                          </v-card-subtitle>
                          <v-card-text>
                            <v-data-table-virtual
                              height="250px"
                              v-model="newSeries_Player_2"                            
                              v-model:expanded="rowsExpanded_2"
                              :headers="tableHeader"
                              :items="team2.player_by_season[match.season_id]"
                              select-strategy="single"
                              density="compact"
                              show-select
                              fixed-header
                              show-expand
                              multi-sort
                              return-object
                              @click:row="(item, slot) => toggleRows( rowsExpanded_2, slot )">
                              <template v-slot:item.data-table-expand="{ internalItem, isExpanded }">
                                <v-btn
                                  :icon="isExpanded(internalItem) ? 'mdi-minus' : 'mdi-plus'"
                                  class="text-none"
                                  size="x-small"
                                  variant="plain"
                                ></v-btn>
                              </template>
                              <!-- Expanded pannel -->
                              <template v-slot:expanded-row="{ columns, item }">
                                <tr v-if="!isArrayEmpty( item.gnl_stats )">
                                  <td :colspan="columns.length" class="py-2">
                                    <!-- GNL Stats -->
                                    <v-sheet>
                                      <v-table border density="compact" class="pb-2">
                                        <tbody>
                                          <tr class="bg-surface-light">
                                            <th class="text-left"><RaceIcon :raceIdentifier="item.race" /></th>
                                            <th class="text-right">Wins</th>
                                            <th class="text-right">Losses</th>
                                            <th class="text-right">Total</th>
                                            <th class="text-right">Winrate</th>
                                          </tr>
                                        </tbody>
                                        <tbody>
                                          <tr>
                                            <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                            <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                            <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                            <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                            <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                          </tr>
                                          <tr v-if="!isObjectEmpty( item.w3c_stats.find( ({ race }) => race === item.race ) )">
                                            <td class="text-left text-overline">W3C</td>
                                            <td class="text-right text-green">{{ item.w3c_stats.find( ({ race }) => race === item.race ).wins }}</td>
                                            <td class="text-right text-red">{{ item.w3c_stats.find( ({ race }) => race === item.race ).losses }}</td>
                                            <td class="text-right">{{ item.w3c_stats.find( ({ race }) => race === item.race ).games }}</td>
                                            <td class="text-right">{{ Math.round( item.w3c_stats.find( ({ race }) => race === item.race ).winrate * 100 )  + '%' }}</td>
                                          </tr>
                                        </tbody>
                                      </v-table>
                                    </v-sheet>
                                  </td>
                                </tr>    
                                <tr v-else>
                                  <td :colspan="columns.length" class="py-2">
                                    <td>No stats found.</td>
                                  </td>                                
                                </tr>                       
                              </template>
                              <!-- Table content -->
                              <template 
                                v-slot:item.name="{ item }">
                                {{ item.name }}
                                <FlagIcon :countryIdentifier="item.country" />
                              </template>
                            </v-data-table-virtual>
                          </v-card-text>
                        </v-card> 
                      </v-col>
                    </v-row> 
                </template>       
                    
                <v-card-actions>                  
                  <v-btn color="green" prepend-icon="mdi-sync" @click="syncW3CTeams">
                    W3C
                  </v-btn>
                  <v-btn 
                    prepend-icon="mdi-plus"
                    @click="createSeries"
                    color="light-green"
                    variant="tonal">
                    Add
                  </v-btn>
                  <v-btn 
                    prepend-icon="mdi-close" 
                    @click="cancelCreateSeries"
                    color="orange"
                    variant="tonal">
                    Cancel
                  </v-btn>
                </v-card-actions>        
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>

        <!-- Series List -->
        <v-row>
          <v-col 
            v-for="item in series"
            cols="6"
          >
            <v-item>
              <v-hover v-slot="{ isHovering, props }">
                <v-card v-bind="props">                
                  <v-container>
                    <v-row class="justify-space-between">
                      <v-col cols="auto"> 
                        <v-icon icon="mdi-calendar-today"></v-icon>                  
                        <span>{{ formateDate( item.date_time ).fulldate }}</span>
                      </v-col>
                      <v-col v-if="item.caster !== 'string' && item.caster !== null" cols="auto">
                        <v-icon icon="mdi-twitch"></v-icon>
                        <span>{{ item.caster }}</span>
                      </v-col>
                    </v-row>
                    <v-row class="align-center justify-center">
                      <v-col cols="5 text-center">
                        <h3 class="text-h6">{{ item.player1.name + ' ' }}<RaceIcon :raceIdentifier="item.player1.race" /></h3>
                        <p>{{ item.player1.mmr }}</p>
                        <p class="text-h3">{{ item.player1_score }}</p>
                      </v-col>        
                      <v-col cols="2 text-center">
                        <span class="text-h5">
                          <v-icon v-if="item.player1_score > item.player2_score" icon="mdi-arrow-left-bold"></v-icon>
                          <v-icon v-else-if="item.player1_score < item.player2_score" icon="mdi-arrow-right-bold"></v-icon>
                          <v-icon v-else icon="mdi-sword-cross"></v-icon>
                        </span>
                      </v-col>        
                      <v-col cols="5 text-center">
                        <h3 class="text-h6">{{ item.player2.name + ' ' }}<RaceIcon :raceIdentifier="item.player2.race" /></h3>
                        <p>{{ item.player2.mmr }}</p>
                        <p class="text-h3">{{ item.player2_score }}</p>
                      </v-col>
                    </v-row>
                  </v-container>                  
                  <v-overlay
                    :model-value="!!isHovering"
                    class="align-center justify-center"
                    contained
                    location="bottom center" 
                    origin="bottom center"
                  >  
                    <v-btn 
                      class="table-action" 
                      density="compact"
                      icon="mdi-file-edit"                         
                    ></v-btn>                  
                    <v-btn 
                      class="table-action" 
                      density="compact" 
                      color="red" 
                      icon="mdi-trash-can" 
                      @click="removeSeries(item.id)"
                    ></v-btn>
                  </v-overlay>
                </v-card>
              </v-hover>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>
  </div>

  <!-- Team Details-->
  <div id="teamDetails">
    <v-row class="justify-center">
      <v-col cols="auto text-center">
        <h2>Team Details</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <h3>{{ team1.name }}</h3>
        <ul v-if="team1.player_by_season && match.season_id">
          <li v-for="player in team1.player_by_season[match.season_id]" :key="player.id">
            {{ player.name }}
          </li>
        </ul>
      </v-col>
      <v-col cols="6">
        <h3>{{ team2.name }}</h3>
        <ul v-if="team2.player_by_season && match.season_id">
          <li v-for="player in team2.player_by_season[match.season_id]" :key="player.id">
            {{ player.name }}
          </li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import bannerImg from '@/assets/media/match-banner.jpg'
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useMatchStore, useSeriesStore, useTeamStore } from '@/stores';
import { useDate } from 'vuetify';
import FlagIcon from '../components/FlagIcon.vue';

const tableHeader = [
  { title: 'Name', value: 'name', sortable: true },     
  { title: 'Games', key: 'gnl_stats[0].games', sortable: true, align: 'end' },
  { title: 'MMR', value: 'mmr', sortable: true, align: 'end' }, 
]

const rowsExpanded_1 = ref([])
const rowsExpanded_2 = ref([])

const showNewSeriesModal = ref(false)
const search = ref('')

export default {
  name: 'MatchDetailsView',
  setup() {
    const router = useRouter();
    const matchId = router.currentRoute.value.params.id;
    const matchStore = useMatchStore();
    const seriesStore = useSeriesStore();
    const teamStore = useTeamStore();
    const isLoading = ref(false);
    const team1 = ref({});
    const team2 = ref({});    
    const date = useDate();
    const newSeries_Player_1 = ref(null)
    const newSeries_Player_2 = ref(null)    
    const newSeries_caster = ref(null)
    const newSeries_date = ref(null)

    const toggleRows = ( rowsTable, item ) => {
      if( rowsTable.findIndex( v => v.name === item.item.name ) === -1 ){
        rowsTable.shift();
        item.toggleExpand( item.internalItem )
      } else {
        rowsTable.shift();
      }      
    }

    const formateDate = ( dateToFormat ) => {
      const formatedDate = {
        fulldate: date.format( dateToFormat, 'normalDateWithWeekday' ),
        hour: date.format( dateToFormat, 'fullTime' )
      }
      return formatedDate
    }

    const seriesHeaders = [
      { title: 'ID', value: 'id' },
      { title: 'Player 1', value: 'player1.name' },
      { title: '', value: '' },
      { title: 'Player 2', value: 'player2.name' },
      { title: 'Actions', align: 'center' }
    ];

    const cancelCreateSeries = () => {
      showNewSeriesModal.value = false;
    };

    const fetchMatchDetails = async () => {
      isLoading.value = true;
      try {
        await matchStore.fetchMatchDetails(matchId);
        if (matchStore.match.team1_id && matchStore.match.team2_id) {
          await fetchTeamDetails(); // Fetch team details only after match details are loaded
        }
        await fetchMatchSeries();
      } catch (error) {
        console.error('Failed to fetch match details:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchTeamDetails = async () => {
      isLoading.value = true;
      try {
        console.log("Match " + matchStore.match)
        console.log("Team_id " + matchStore.match.team1_id)
        
        team1.value = await teamStore.getTeamDetailsSeason(matchStore.match.team1_id, matchStore.match.season_id);
        team2.value = await teamStore.getTeamDetailsSeason(matchStore.match.team2_id, matchStore.match.season_id);
      } catch (error) {
        console.error('Failed to fetch match details:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const syncW3CTeams = async () => {
      try {
        console.log("Sync Team 1")
        team1.value = await teamStore.syncPlayersW3C(matchStore.match.team1_id, matchStore.match.season_id)
        
        console.log("Sync Team 2")
        team2.value = await teamStore.syncPlayersW3C(matchStore.match.team2_id, matchStore.match.season_id)
      } catch (error) {
        console.error('Failed to sync teams with w3c details:', error);
      }
    };

    const fetchMatchSeries = async () => {
      isLoading.value = true;
      try {
        await seriesStore.getSeriesByMatchId(matchId);
      } catch (error) {
        console.error('Failed to fetch match details:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const createSeries = async () => {
      const newSeries = {}
    
      newSeries.match_id = matchStore.match.id
      newSeries.season_id = matchStore.match.season_id
      newSeries.host_player_id = newSeries_Player_1.value[0].id
      newSeries.player1_score = 0
      newSeries.player2_score = 0
      newSeries.player1_id = newSeries_Player_1.value[0].id
      newSeries.player2_id = newSeries_Player_2.value[0].id
      newSeries.date_time = newSeries_date

      try {
        await seriesStore.createSeries(newSeries);
        await fetchMatchSeries(); // Refresh match details after creation
        cancelCreateSeries();
      } catch (error) {
        console.error('Failed to create series:', error);
      }
    };

    const removeSeries = async (seriesId) => {
      try {
        await seriesStore.deleteSeries(seriesId);
        await fetchMatchDetails(); // Refresh match details after removal
      } catch (error) {
        console.error('Failed to remove series:', error);
      }
    };

    onMounted(() => {
      fetchMatchDetails();
    });

    return {
      match: computed(() => matchStore.match),
      series: computed(() => seriesStore.series),
      team1,
      team2,
      isLoading,
      seriesHeaders,
      fetchMatchDetails,
      createSeries,
      removeSeries,
      syncW3CTeams,

      newSeries_Player_1,
      newSeries_Player_2,
      newSeries_caster,
      newSeries_date,

      bannerImg,
      date,
      formateDate,
      showNewSeriesModal,
      cancelCreateSeries,
      search,
      tableHeader,

      rowsExpanded_1,
      rowsExpanded_2,
      toggleRows,
    };
  }
};
</script>

<style>
.table-action {
  margin-right: 15px;
}

#matchHeader {
  position: relative;
  color: white;  
  padding: 25px 0px;
}

.banner-image {
  position: absolute;
  top: 0;
  height: 100%; 
  width: 100%;
}

.banner-overlay {
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: .75;
  background-color: black;
}

.banner-content {
  position: relative;
  z-index: 1;
}

.vs {
  font-family: "Bungee Shade", sans-serif;
  font-weight: 400;
  font-style: normal;
}
</style>