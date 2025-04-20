<template>

  <!-- Match Header -->
  <div id="matchHeader">
    <v-parallax class="banner-image" :src="bannerImg"></v-parallax>
    <div class="banner-overlay"></div>
    <div class="banner-content h-100">
      <v-container>
        <v-row class="justify-center">
          <v-col cols="auto text-center">
            <h1>Match</h1>
            <p>Week {{ match.playday }}</p>
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
              <v-card>
                <template v-slot:title>
                  <span class="modal-title">
                    <v-icon icon="mdi-account-plus"></v-icon>
                    Add New Series
                  </span>
                </template>
                <template v-slot:text>
                  <v-container>
                    <!-- Header modal -->
                    <v-row class="align-center justify-center">
                      <v-col cols="5 text-center">
                        <p class="text-h5">{{ team1.name }}</p>
                      </v-col>        
                      <v-col cols="2 text-center">
                        <span class="text-h4">
                          <v-icon icon="mdi-sword-cross"></v-icon>
                        </span>
                        <v-btn density="compact" color="green" icon="mdi-sync" @click="syncW3CTeams"></v-btn>
                      </v-col>        
                      <v-col cols="5 text-center">
                        <p class="text-h5">{{ team2.name }}</p>
                        </v-col>
                    </v-row>
                    <v-row class="justify-space-between" dense>
                      <v-col cols="5">
                        <v-card flat>
                          <v-data-table-virtual
                            height="250px"
                            v-model="newSeries_Player_1"                            
                            v-model:expanded="rowsExpanded"
                            :headers="tableHeader"
                            :items="team1.player_by_season[match.season_id]"
                            select-strategy="single"
                            density="compact"
                            show-select
                            fixed-header
                            show-expand
                            multi-sort
                            return-object
                            @click:row="(item, slot) => { rowsExpanded.shift(); slot.toggleExpand( slot.internalItem ); }">
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
                              <tr v-if="isArray( item.gnl_stats )">
                                <td :colspan="columns.length" class="py-2">
                                  <!-- GNL Stats -->
                                  <v-sheet>
                                    <v-table border density="compact" class="pb-2">
                                      <tbody>
                                        <tr>
                                          <th class="text-left"></th>
                                          <th class="text-right">MMR</th>
                                          <th class="text-right">Wins</th>
                                          <th class="text-right">Losses</th>
                                          <th class="text-right">Total</th>
                                          <th class="text-right">Winrate</th>
                                        </tr>
                                      </tbody>
                                      <tbody>
                                        <tr>
                                          <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                          <td class="text-left text-overline">{{ item.mmr }}</td>
                                          <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                          <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                          <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                          <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                        </tr>
                                        <tr v-for="stat in item.w3c_stats" v-if="!isObjectEmpty( item.w3c_stats )">
                                          <td class="text-left text-overline"><RaceIcon :raceIdentifier="stat.race" /></td>
                                          <td class="text-left text-overline">{{ stat.mmr  }}</td>
                                          <td class="text-right text-green">{{ stat.wins }}</td>
                                          <td class="text-right text-red">{{ stat.losses }}</td>
                                          <td class="text-right">{{ stat.games }}</td>
                                          <td class="text-right">{{ stat.winrate!=null ? Math.round( stat.winrate * 100 ): 0  + '%' }}</td>
                                        </tr>
                                      </tbody>
                                    </v-table>
                                  </v-sheet>
                                </td>
                              </tr>    
                              <tr v-else>
                                <td :colspan="columns.length" class="py-2">
                                  No stats found.
                                </td>                                
                              </tr>                       
                            </template>
                            <!-- Table content -->
                            <template 
                              v-slot:item.name="{ item }">
                              <RaceIcon :raceIdentifier="item.race" />
                              {{ item.name }}
                              <FlagIcon :countryIdentifier="item.country" />
                            </template>
                          </v-data-table-virtual>
                        </v-card>                    
                      </v-col>
                      <v-spacer cols="1"></v-spacer>
                      <v-col cols="5">
                        <v-card flat>
                          <v-data-table-virtual
                            height="250px"
                            v-model="newSeries_Player_2"                            
                            v-model:expanded="rowsExpanded"
                            :headers="tableHeader"
                            :items="team2.player_by_season[match.season_id]"
                            select-strategy="single"
                            density="compact"
                            show-select
                            fixed-header
                            show-expand
                            multi-sort
                            return-object
                            @click:row="(item, slot) => { rowsExpanded.shift(); slot.toggleExpand( slot.internalItem ); }">
                            <template v-slot:item.data-table-expand="{ internalItem, isExpanded }">
                              <v-btn
                                :icon="isExpanded(internalItem) ? 'mdi-minus' : 'mdi-plus'"
                                class="text-none"
                                size="x-small"
                                variant="plain"
                              ></v-btn>
                            </template>
                            <template v-slot:expanded-row="{ columns, item }">
                              <tr v-if="isArray( item.gnl_stats )">
                                <td :colspan="columns.length" class="py-2">
                                  <!-- GNL Stats -->
                                  <v-sheet>
                                    <v-table border density="compact" class="pb-2">
                                      <tbody>
                                        <tr>
                                          <th class="text-left"></th>
                                          <th class="text-right">MMR</th>
                                          <th class="text-right">Wins</th>
                                          <th class="text-right">Losses</th>
                                          <th class="text-right">Total</th>
                                          <th class="text-right">Winrate</th>
                                        </tr>
                                      </tbody>
                                      <tbody>
                                        <tr>
                                          <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                          <td class="text-left text-overline">{{ item.mmr }}</td>
                                          <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                          <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                          <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                          <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                        </tr>
                                        <tr v-for="stat in item.w3c_stats" v-if="!isObjectEmpty( item.w3c_stats )">
                                          <td class="text-left text-overline"><RaceIcon :raceIdentifier="stat.race" /></td>
                                          <td class="text-left text-overline">{{ stat.mmr  }}</td>
                                          <td class="text-right text-green">{{ stat.wins }}</td>
                                          <td class="text-right text-red">{{ stat.losses }}</td>
                                          <td class="text-right">{{ stat.games }}</td>
                                          <td class="text-right">{{ stat.winrate!=null ? Math.round( stat.winrate * 100 ): 0   + '%' }}</td>
                                        </tr>
                                      </tbody>
                                    </v-table>
                                  </v-sheet>
                                </td>
                              </tr>    
                              <tr v-else>
                                <td :colspan="columns.length" class="py-2">
                                  No stats found.
                                </td>                                
                              </tr>                     
                            </template>
                            <template 
                              v-slot:item.name="{ item }">
                              <RaceIcon :raceIdentifier="item.race" />
                              {{ item.name }}
                              <FlagIcon :countryIdentifier="item.country" />
                            </template>
                          </v-data-table-virtual>
                        </v-card> 
                      </v-col>
                    </v-row> 
                  </v-container>    
                </template>       
                    
                <v-card-actions>
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
          <!-- Add Propose Series Modal -->
          <v-col cols="auto">
            <v-btn
              @click="showProposeSeriesModal = true"
              class="toolbar-btn"
              variant="tonal"
              prepend-icon="mdi-plus">
              Propose series
            </v-btn>
            <v-dialog
              id="newSeriesModal"
              v-if="showProposeSeriesModal"
              v-model="showProposeSeriesModal"
              max-width="95vw"
              max-height="95vh">
              <v-card>
                <template v-slot:title>
                  <span class="modal-title">
                    <v-icon icon="mdi-account-plus"></v-icon>
                    Add New Series
                  </span>
                </template>
                <template v-slot:text>
                  <v-container>
                    <!-- Header modal -->
                    <v-row class="align-center justify-center">
                      <v-col cols="5 text-center">
                        <p class="text-h5">{{ team1.name }}</p>
                      </v-col>        
                      <v-col cols="2 text-center">
                        <span class="text-h4">
                          <v-icon icon="mdi-sword-cross"></v-icon>
                        </span>
                        <v-btn density="compact" color="green" icon="mdi-sync" @click="syncW3CTeams"></v-btn>
                      </v-col>        
                      <v-col cols="5 text-center">
                        <p class="text-h5">{{ team2.name }}</p>
                        </v-col>
                    </v-row>
                    <v-row class="align-center justify-center">
                      <v-col cols="5 text-center">
                        <v-text-field
                          v-model="proposeSeriesMMRDiff"
                          label="MMR Differance"
                          placeholder="Enter season name"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="justify-space-between" dense>
                      <v-col cols="6">
                        <v-card flat>
                          <v-data-table-virtual
                            height="250px"
                            v-model="proposePlayersTeam_1"
                            v-model:expanded="rowsExpanded"
                            :headers="tableHeader"
                            :items="team1.player_by_season[match.season_id]"
                            density="compact"
                            show-select
                            fixed-header
                            show-expand
                            multi-sort
                            return-object
                            @click:row="(item, slot) => { rowsExpanded.shift(); slot.toggleExpand( slot.internalItem ); }">
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
                              <tr v-if="isArray( item.gnl_stats )">
                                <td :colspan="columns.length" class="py-2">
                                  <!-- GNL Stats -->
                                  <v-sheet>
                                    <v-table border density="compact" class="pb-2">
                                      <tbody>
                                        <tr>
                                          <th class="text-left"></th>
                                          <th class="text-right">MMR</th>
                                          <th class="text-right">Wins</th>
                                          <th class="text-right">Losses</th>
                                          <th class="text-right">Total</th>
                                          <th class="text-right">Winrate</th>
                                        </tr>
                                      </tbody>
                                      <tbody>
                                        <tr>
                                          <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                          <td class="text-left text-overline">{{ item.mmr }}</td>
                                          <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                          <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                          <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                          <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                        </tr>
                                        <tr v-for="stat in item.w3c_stats" v-if="!isObjectEmpty( item.w3c_stats )">
                                          <td class="text-left text-overline"><RaceIcon :raceIdentifier="stat.race" /></td>
                                          <td class="text-left text-overline">{{ stat.mmr  }}</td>
                                          <td class="text-right text-green">{{ stat.wins }}</td>
                                          <td class="text-right text-red">{{ stat.losses }}</td>
                                          <td class="text-right">{{ stat.games }}</td>
                                          <td class="text-right">{{ stat.winrate!=null ? Math.round( stat.winrate * 100 ): 0  + '%' }}</td>
                                        </tr>
                                      </tbody>
                                    </v-table>
                                  </v-sheet>
                                </td>
                              </tr>    
                              <tr v-else>
                                <td :colspan="columns.length" class="py-2">
                                  No stats found.
                                </td>                                
                              </tr>                       
                            </template>
                            <!-- Table content -->
                            <template 
                              v-slot:item.name="{ item }">
                              <RaceIcon :raceIdentifier="item.race" />
                              {{ item.name }}({{ item.discordTag }})
                              <FlagIcon :countryIdentifier="item.country" />
                            </template>
                          </v-data-table-virtual>
                        </v-card>                    
                      </v-col>
                      <v-spacer cols="1"></v-spacer>
                      <v-col cols="6">
                        <v-card flat>
                          <v-data-table-virtual
                            height="250px"
                            v-model="proposePlayersTeam_2"
                            v-model:expanded="rowsExpanded"
                            :headers="tableHeader"
                            :items="team2.player_by_season[match.season_id]"
                            density="compact"
                            show-select
                            fixed-header
                            show-expand
                            multi-sort
                            return-object
                            @click:row="(item, slot) => { rowsExpanded.shift(); slot.toggleExpand( slot.internalItem ); }">
                            <template v-slot:item.data-table-expand="{ internalItem, isExpanded }">
                              <v-btn
                                :icon="isExpanded(internalItem) ? 'mdi-minus' : 'mdi-plus'"
                                class="text-none"
                                size="x-small"
                                variant="plain"
                              ></v-btn>
                            </template>
                            <template v-slot:expanded-row="{ columns, item }">
                              <tr v-if="isArray( item.gnl_stats )">
                                <td :colspan="columns.length" class="py-2">
                                  <!-- GNL Stats -->
                                  <v-sheet>
                                    <v-table border density="compact" class="pb-2">
                                      <tbody>
                                        <tr>
                                          <th class="text-left"></th>
                                          <th class="text-right">MMR</th>
                                          <th class="text-right">Wins</th>
                                          <th class="text-right">Losses</th>
                                          <th class="text-right">Total</th>
                                          <th class="text-right">Winrate</th>
                                        </tr>
                                      </tbody>
                                      <tbody>
                                        <tr>
                                          <td class="text-left text-overline">{{ item.gnl_stats[0].season.name }}</td>
                                          <td class="text-left text-overline">{{ item.mmr }}</td>
                                          <td class="text-right text-green">{{ item.gnl_stats[0].wins }}</td>
                                          <td class="text-right text-red">{{ item.gnl_stats[0].losses }}</td>
                                          <td class="text-right">{{ item.gnl_stats[0].games }}</td>
                                          <td class="text-right">{{ Math.round( item.gnl_stats[0].wins / item.gnl_stats[0].games * 100 ) + '%' }}</td>
                                        </tr>
                                        <tr v-for="stat in item.w3c_stats" v-if="!isObjectEmpty( item.w3c_stats )">
                                          <td class="text-left text-overline"><RaceIcon :raceIdentifier="stat.race" /></td>
                                          <td class="text-left text-overline">{{ stat.mmr  }}</td>
                                          <td class="text-right text-green">{{ stat.wins }}</td>
                                          <td class="text-right text-red">{{ stat.losses }}</td>
                                          <td class="text-right">{{ stat.games }}</td>
                                          <td class="text-right">{{ stat.winrate!=null ? Math.round( stat.winrate * 100 ): 0   + '%' }}</td>
                                        </tr>
                                      </tbody>
                                    </v-table>
                                  </v-sheet>
                                </td>
                              </tr>    
                              <tr v-else>
                                <td :colspan="columns.length" class="py-2">
                                  No stats found.
                                </td>                                
                              </tr>                     
                            </template>
                            <template 
                              v-slot:item.name="{ item }">
                              <RaceIcon :raceIdentifier="item.race" />
                              {{ item.name }}({{ item.discordTag }})
                              <FlagIcon :countryIdentifier="item.country" />
                            </template>
                          </v-data-table-virtual>
                        </v-card> 
                      </v-col>
                    </v-row> 
                  </v-container>    
                </template>       
                    
                <v-card-actions>
                  <v-btn 
                    prepend-icon="mdi-plus"
                    @click="proposeSeries"
                    color="light-green"
                    variant="tonal">
                    Propose Series
                  </v-btn>
                  <v-btn 
                    prepend-icon="mdi-close" 
                    @click="cancelProposeSeries"
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
          
          <v-col >
          <section id="series-table" v-if="series.length > 0">
            <v-data-table
              :headers="seriesTableHeader"
              :items="series"
              fixed-header
              hover
            >
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>
                    <v-icon icon="mdi-account"></v-icon>
                    Series List
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
              </template>
              <template v-slot:item="{ item }">
                <tr>
                  <td>{{ item.id }}</td>
                  <td>{{ item.caster }}</td>
                  <td>
                    <span v-if="item.date_time">
                      {{ formateDate(item.date_time) }}
                    </span>
                  </td>
                  <td @click="showStats(item.player1)">{{ item.player1.name }}</td>
                  <td>{{ item.player1.mmr }}</td>
                  <td>{{ item.player1_score }}</td>
                  <td>{{ item.player2_score }}</td>
                  <td @click="showStats(item.player2)">{{ item.player2.name }}</td>
                  <td>{{ item.player2.mmr }}</td>
                  <td>
                    <span v-if="item.host_player_id === item.player1.id">
                      {{ item.player1.name }}
                    </span>
                    <span v-else-if="item.host_player_id === item.player2.id">
                      {{ item.player2.name }}
                    </span>
                    <span v-else>
                    </span>
                  </td>
                  <td>
                    <v-btn
                      icon
                      @click.stop="editSeries(item)"
                      color="blue"
                    >
                      <v-icon>mdi-account-edit</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      @click.stop="removeSeries(item.id)"
                      color="red"
                    >
                      <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
        </section>  
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>
  </div>

  <v-dialog v-model="showPlayerDetails" max-width="65vw">
      <v-card>
        <v-card-title>Player Details</v-card-title>
        <v-card-text>
          <v-table border density="compact" class="pb-2">
            <tbody>
              <tr>
                <th class="text-left"></th>
                <th class="text-right">MMR</th>
                <th class="text-right">Wins</th>
                <th class="text-right">Losses</th>
                <th class="text-right">Total</th>
                <th class="text-right">Winrate</th>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td class="text-left text-overline">{{ playerDetails.gnl_stats[0].season.name }}</td>
                <td class="text-left text-overline">{{ playerDetails.mmr }}</td>
                <td class="text-right text-green">{{ playerDetails.gnl_stats[0].wins }}</td>
                <td class="text-right text-red">{{ playerDetails.gnl_stats[0].losses }}</td>
                <td class="text-right">{{ playerDetails.gnl_stats[0].games }}</td>
                <td class="text-right">{{ Math.round( playerDetails.gnl_stats[0].wins / playerDetails.gnl_stats[0].games * 100 ) + '%' }}</td>
              </tr>
              <tr v-for="stat in playerDetails.w3c_stats" v-if="!isObjectEmpty( playerDetails.w3c_stats )">
                <td class="text-left text-overline"><RaceIcon :raceIdentifier="stat.race" /></td>
                <td class="text-left text-overline">{{ stat.mmr  }}</td>
                <td class="text-right text-green">{{ stat.wins }}</td>
                <td class="text-right text-red">{{ stat.losses }}</td>
                <td class="text-right">{{ stat.games }}</td>
                <td class="text-right">{{ stat.winrate!=null ? Math.round( stat.winrate * 100 ): 0   + '%' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Series Modal -->
    <v-dialog v-model="editSeriesDialogOpen" max-width="65vw" persistend>
      <v-card>
        <v-card-title>Edit Series</v-card-title>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="6">
                    <v-date-picker
                      v-model="selectedDate"
                      label="Scheduled Date:"
                    ></v-date-picker>
              </v-col>
              <v-col cols="6">
                <v-time-picker
                  v-model="selectedTime"
                  label="Scheduled Time HH:mm"
                  format="24hr"
                >
                </v-time-picker>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedSeries.caster"
                  label="Caster:"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-number-input
                  v-model="selectedSeries.player1_score"
                  :label="`${selectedSeries.player1.name} Score`"
                ></v-number-input>
              </v-col>
              <v-col cols="6">
                <v-number-input
                  v-model="selectedSeries.player2_score"
                  :label="`${selectedSeries.player2.name} Score`"
                ></v-number-input>
              </v-col>
              <v-col cols="6">
                <v-select
                  :items="hostPlayers"
                  label="Choose a Host"
                  v-model="selectedSeries.host_player_id"
                  item-title="battleTag"
                  item-value="id"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="selectedSeries.is_fantasy_match"
                  label="Is Fantasy Match"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="updateSeries" color="green" prepend-icon="mdi-check">
            Save
          </v-btn>
          <v-btn @click="cancelEditSeries" color="red" prepend-icon="mdi-close">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { DateTime } from "luxon";
import { useMatchStore, useSeriesStore, useTeamStore } from '@/stores';
import { useDate } from 'vuetify';
import FlagIcon from '../components/FlagIcon.vue';

const seriesTableHeader = [
  
  { title: 'ID', value: 'id', sortable: true },  
  { title: 'Caster'},  
  { title: 'Date/Time'}, 
  { title: 'Player 1', value: 'player1.name', sortable: true },
  { title: 'MMR', value: 'player1.mmr', sortable: true },
  { title: 'P1 Score' },
  { title: 'P2 Score' },
  { title: 'Player 2', value: 'player2.name', sortable: true },
  { title: 'MMR', value: 'player2.mmr', sortable: true },
  { title: 'Host' },
  { title: 'Fantasy Match'},    
]

const tableHeader = [
  { title: 'Name', value: 'name', sortable: true },     
  { title: 'Games', key: 'gnl_stats[0].games', sortable: true, align: 'end' },
  { title: 'MMR', value: 'mmr', sortable: true, align: 'end' }, 
]

const rowsExpanded = ref([])

const showNewSeriesModal = ref(false)
const showProposeSeriesModal = ref(false)
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
    const proposePlayersTeam_1 = ref(null)
    const proposePlayersTeam_2 = ref(null)
    const proposeSeriesMMRDiff = ref(null)
    const showPlayerDetails = ref(false)
    const playerDetails = ref(null)
    const editSeriesDialogOpen = ref(false)
    const selectedSeries = ref(null)
    const hostPlayers = ref(null)
    const selectedDate = ref(null);
    const selectedTime = ref(null);


    const formateDate = ( dateToFormat ) => {
      if (!dateToFormat) {
        return dateToFormat;
      }
      const formatedDate = DateTime.fromISO(
        dateToFormat,{
          zone: "America/New_York"
        }
      ).setZone("local").toLocaleString(DateTime.DATETIME_MED);
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
        team1.value = await teamStore.syncPlayersW3C(matchStore.match.team1_id, matchStore.match.season_id)
        
        team2.value = await teamStore.syncPlayersW3C(matchStore.match.team2_id, matchStore.match.season_id)
      } catch (error) {
        console.error('Failed to sync teams with w3c details:', error);
      }
    };

    const showStats = async(player) => {
      showPlayerDetails.value = true;
      playerDetails.value = player;
    }

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

    const editSeries = async (series) => {
      const copy_series =  { ...series };
      selectedSeries.value = copy_series;
      if (copy_series.date_time) {
        const initialDateTime = DateTime.fromISO(
          copy_series.date_time,{
            zone: "America/New_York"
          }
        ).setZone("local");
        selectedDate.value = initialDateTime.toJSDate(); // Date only
        selectedTime.value = initialDateTime.toFormat("HH:mm"); // Time only
      }

      hostPlayers.value = [copy_series.player1, copy_series.player2];
      editSeriesDialogOpen.value = true;
    };
    const cancelEditSeries = async () => {
      editSeriesDialogOpen.value = false;
    }

    const updateSeries = async () => {
      isLoading.value = true;
      try{
        // Combine selected date and time into a single ISO datetime string
        const localDate = DateTime.fromJSDate(selectedDate.value).setZone("local");
        const combinedDateTime = DateTime.fromISO(`${localDate.toISODate()}T${selectedTime.value}`,
        { zone: "local" });
        // Convert local time to Eastern Time (ET)
        const etDateTime = combinedDateTime.setZone("America/New_York");
        // Update series.date_time with the formatted ISO datetime in ET
        selectedSeries.value.date_time = etDateTime.toISO();
        await seriesStore.updateSeries(selectedSeries.value);
        await fetchMatchSeries(); // Refresh match details after creation
        cancelEditSeries();
      } finally {
        isLoading.value = false;
      }
    }

    const proposeSeries = async () => {
      isLoading.value = true;
      try {
        let t1_player = proposePlayersTeam_1.value;
        let t2_player = proposePlayersTeam_2.value;

        for(let i = 0; i< t1_player.length; i++) {
          let p1 = t1_player[i];
          let p1_mmr = 0;
          for(let j = 0; j < p1.w3c_stats.length; j++){
            let w3cStats = p1.w3c_stats[j];
            if(w3cStats.race == p1.race){
              p1_mmr = w3cStats.mmr;
              break;
            }
          }
          for(let k=0;k< t2_player.length; k++) {
            let p2_mmr = 0;
            let p2 = t2_player[k];
            if(seriesStore.series!=null) {
              for (let n = 0; n < seriesStore.series.length; n++){
                let s = seriesStore.series[n];
                if(p1.id == s.player1_id && p2.id == s.player2_id){
                  console.log("Skip Series already exists!");
                  continue;
                }
              }
            }

            for(let z = 0; z < p2.w3c_stats.length; z++){
              let w3cStats = p2.w3c_stats[z];
              if(w3cStats.race == p2.race){
                p2_mmr = w3cStats.mmr
                break;
              }
            }
            let mmr_diff = p1_mmr - p2_mmr;
            if (mmr_diff<0){
              mmr_diff*=-1
            }
            if(mmr_diff <= proposeSeriesMMRDiff.value){
              const newSeries = {}
      
              newSeries.match_id = matchStore.match.id
              newSeries.season_id = matchStore.match.season_id
              newSeries.host_player_id = p1.id
              newSeries.player1_score = 0
              newSeries.player2_score = 0
              newSeries.player1_id = p1.id
              newSeries.player2_id = p2.id
              await seriesStore.createSeries(newSeries)
            }
          }
        }
        await fetchMatchSeries();
      } catch (error) {
        console.error('Failed to fetch match details:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const cancelProposeSeries = () => {
      showProposeSeriesModal.value = false;
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
      seriesTableHeader,
      showPlayerDetails,
      playerDetails,
      showStats,

      newSeries_Player_1,
      newSeries_Player_2,

      editSeriesDialogOpen,
      editSeries,
      updateSeries,
      cancelEditSeries,
      selectedSeries,
      hostPlayers,
      selectedDate,
      selectedTime,
      


      proposePlayersTeam_1,
      proposePlayersTeam_2,
      proposeSeries,
      proposeSeriesMMRDiff,
      showProposeSeriesModal,
      cancelProposeSeries,

      bannerImg,
      date,
      formateDate,
      showNewSeriesModal,
      cancelCreateSeries,
      search,
      tableHeader,

      rowsExpanded,
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