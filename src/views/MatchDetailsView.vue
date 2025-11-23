<template>
  <v-overlay v-model="isLoading" persistent class="loading-overlay">
    <v-progress-circular
      indeterminate
      size="64" 
      width="8"
      color="primary"
    ></v-progress-circular>
  </v-overlay>

  <!-- Enhanced Match Header -->
  <div id="matchHeader">
    <v-parallax class="banner-image" :src="bannerImg" height="250">
      <div class="banner-overlay"></div>
      <v-container class="fill-height banner-content">
        <v-row align="center" class="fill-height">
          <!-- Back Button Column -->
          <v-col cols="12" md="3" class="d-flex align-start">
            <v-btn
              variant="elevated"
              color="white"
              prepend-icon="mdi-arrow-left"
              @click="$router.push(`/seasons/${match.season_id}#week-${match.playday}`)"
            >
              Back to Season
            </v-btn>
          </v-col>

          <!-- Spacer -->
          <v-col cols="0" md="1" class="d-none d-md-block"></v-col>

          <!-- Match Info Column -->
          <v-col cols="12" md="6">
            <div class="text-center mb-2">
              <v-chip color="primary" size="large" class="mb-2">
                <v-icon start>mdi-calendar-week</v-icon>
                Week {{ match.playday }}
              </v-chip>
              <div v-if="match.date_frame" class="text-subtitle-2 mt-1 text-white">
                <v-icon size="small" color="white">mdi-clock-outline</v-icon>
                {{ match.date_frame }}
              </div>
            </div>

            <!-- Teams Matchup -->
            <v-row align="center" justify="center" class="teams-matchup">
              <v-col cols="12" md="5" class="text-center">
                <div class="team-section-header">
                  <h2 class="text-h4 font-weight-bold team-name-header text-white">{{ team1.name }}</h2>
                  <v-chip color="success" size="large" class="mt-2 score-chip-large">
                    {{ match.team1_score || 0 }}
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" md="2" class="text-center">
                <v-icon size="48" color="white">mdi-sword-cross</v-icon>
              </v-col>
              
              <v-col cols="12" md="5" class="text-center">
                <div class="team-section-header">
                  <h2 class="text-h4 font-weight-bold team-name-header text-white">{{ team2.name }}</h2>
                  <v-chip color="error" size="large" class="mt-2 score-chip-large">
                    {{ match.team2_score || 0 }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- Right Spacer -->
          <v-col cols="0" md="2" class="d-none d-md-block"></v-col>
        </v-row>
      </v-container>
    </v-parallax>
  </div>

  <v-container fluid class="pa-4">
    <!-- Series Management Card -->
    <v-card class="mb-4" elevation="2">
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <div>
          <v-icon class="mr-2">mdi-trophy-variant</v-icon>
          Series Management
        </div>
        <div>
          <v-btn
            color="white"
            variant="elevated"
            prepend-icon="mdi-plus"
            @click="openCreateNewSeries"
            class="mr-2"
          >
            Add Series
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            prepend-icon="mdi-sync"
            @click="syncW3CTeams"
            :loading="isLoading"
          >
            Sync W3C Info
          </v-btn>
        </div>
      </v-card-title>
  <!-- Create Series Dialog -->
  <v-dialog v-if="newMatch" v-model="isModalOpen" max-width="600px">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-calendar-plus</v-icon>
        Create Match - Week {{ selectedWeek }}
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="newMatch.date_frame" 
              label="Date/Time Frame"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar-clock"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              :items="maps"
              item-title="name"
              item-value="id"
              label="Fixed Map (Optional)"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-map"
              clearable
              v-model="newMatch.fixed_map_id"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              :items="teams"
              item-title="name"
              item-value="id"
              label="Team 1"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shield"
              v-model="newMatch.team1_id"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              :items="teams"
              item-title="name"
              item-value="id"
              label="Team 2"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shield"
              v-model="newMatch.team2_id"
            ></v-select>
          </v-col>
        </v-row>      
      </v-card-text>   
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeMatchCreationModal">Cancel</v-btn>
        <v-btn color="primary" @click="confirmSelection">Create Match</v-btn>
      </v-card-actions>        
    </v-card>
  </v-dialog>

  <!-- Create New Series Dialog -->
  <v-dialog v-model="createNewSeriesDialogOpen" max-width="95vw" max-height="95vh" persistent>
    <v-card class="d-flex flex-column" style="height: 90vh;">
      <v-card-title class="bg-primary flex-shrink-0">
        <v-icon class="mr-2">mdi-plus-circle</v-icon>
        Add New Series
      </v-card-title>
      
      <v-alert
        v-if="creationSeriesError"
        type="error"
        variant="tonal"
        class="mx-4 mt-4 mb-2 flex-shrink-0"
        border="start"
        border-color="red"
        closable
        @click:close="creationSeriesError = null"
      >
        {{ creationSeriesError }}
      </v-alert>

      <v-card-text class="pa-4 flex-grow-1" style="overflow-y: auto;">
        <v-row class="justify-space-between h-100" dense>
          <v-col cols="12" md="5" class="d-flex flex-column">
            <v-card elevation="2" class="d-flex flex-column flex-grow-1">
              <v-toolbar color="primary" density="compact" class="flex-shrink-0">
                <v-icon class="ml-3">mdi-shield</v-icon>
                <v-toolbar-title>{{ team1.name }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="searchQueryT1"
                  placeholder="Search by name"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  single-line
                  clearable
                  class="mr-2"
                  style="max-width: 300px;"
                ></v-text-field>
              </v-toolbar>
              <v-data-table
                :headers="tablePlayerHeader"
                :custom-filter="customFilter"
                :search="searchQueryT1"
                v-model="newSeries_Player_1"
                :items="team1.player_by_season[match.season_id]"
                select-strategy="single"
                density="compact"
                multi-sort
                fixed-header
                hover
                return-object
                show-select
                class="flex-grow-1"
              >
                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                </template>
                <template v-slot:[`item.name`]="{ item }">
                  <FlagIcon :countryIdentifier="item.country" />
                  <span @click.stop="showStats(item)" class="player-name-link">
                    <strong>{{ item.name }}</strong> ({{ item.discordTag }})
                  </span>
                </template>
              </v-data-table>
            </v-card>                    
          </v-col>

          <v-col cols="12" md="2" class="d-flex flex-column align-center justify-center">
            <v-icon size="80" color="primary" class="mb-4">mdi-sword-cross</v-icon>
            <v-btn 
              color="success" 
              variant="elevated"
              prepend-icon="mdi-sync"
              @click="syncW3CTeams" 
              :loading="isLoading" 
              :disabled="isLoading"
            >
              Sync W3C Info
            </v-btn>
          </v-col> 

          <v-col cols="12" md="5" class="d-flex flex-column">
            <v-card elevation="2" class="d-flex flex-column flex-grow-1">
              <v-toolbar color="primary" density="compact" class="flex-shrink-0">
                <v-icon class="ml-3">mdi-shield</v-icon>
                <v-toolbar-title>{{ team2.name }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="searchQueryT2"
                  placeholder="Search by name"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  single-line
                  clearable
                  class="mr-2"
                  style="max-width: 300px;"
                ></v-text-field>
              </v-toolbar>
              <v-data-table
                :headers="tablePlayerHeader"
                :custom-filter="customFilter"
                :search="searchQueryT2"
                v-model="newSeries_Player_2"
                :items="team2.player_by_season[match.season_id]"
                select-strategy="single"
                density="compact"
                multi-sort
                fixed-header
                hover
                return-object
                show-select
                class="flex-grow-1"
              >
                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                </template>
                <template v-slot:[`item.name`]="{ item }">
                  <FlagIcon :countryIdentifier="item.country" />
                  <span @click.stop="showStats(item)" class="player-name-link">
                    <strong>{{ item.name }}</strong> ({{ item.discordTag }})
                  </span>
                </template>
              </v-data-table>
            </v-card> 
          </v-col>
        </v-row>     
      </v-card-text>
                    
      <v-card-actions class="px-4 py-3 flex-shrink-0" style="border-top: 1px solid rgba(0,0,0,0.12);">
        <v-spacer></v-spacer>
        <v-btn 
          variant="text"
          @click="cancelCreateSeries"
        >
          Cancel
        </v-btn>
        <v-btn 
          color="primary"
          prepend-icon="mdi-plus"
          @click="createSeries"
          :disabled="!newSeries_Player_1 || !newSeries_Player_2"
        >
          Create Series
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

      <v-card-text v-if="series && series.length > 0" class="pa-0">
        <v-data-table
          :headers="seriesTableHeader"
          :items="series"
          fixed-header
          hover
          density="comfortable"
        >
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>
          <template v-slot:item="{ item }">
            <tr class="series-row">
              <td>{{ item.id }}</td>
              <td>{{ item.caster || '—' }}</td>
              <td>
                <span v-if="item.date_time">
                  {{ formateDate(item.date_time) }}
                </span>
                <span v-else class="text-grey">Not scheduled</span>
              </td>
              <td @click.stop="showStats(item.player1)" class="player-cell">
                <strong>{{ item.player1.name }}</strong>
              </td>
              <td class="text-end">
                <v-chip size="small" color="info">
                  {{ item.player1.w3c_stats.find(player => player.race === item.player1.race)?.mmr || 'N/A' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip :color="item.player1_score > item.player2_score ? 'success' : 'default'" size="small">
                  {{ item.player1_score }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip :color="item.player2_score > item.player1_score ? 'success' : 'default'" size="small">
                  {{ item.player2_score }}
                </v-chip>
              </td>
              <td @click.stop="showStats(item.player2)" class="player-cell">
                <strong>{{ item.player2.name }}</strong>
              </td>
              <td class="text-end">
                <v-chip size="small" color="info">
                  {{ item.player2.w3c_stats.find(player => player.race === item.player2.race)?.mmr || 'N/A' }}
                </v-chip>
              </td>
              <td>
                <span v-if="item.host_player_id === item.player1.id">
                  {{ item.player1.name }}
                </span>
                <span v-else-if="item.host_player_id === item.player2.id">
                  {{ item.player2.name }}
                </span>
                <span v-else class="text-grey">—</span>
              </td>
              <td class="text-center">
                <v-icon v-if="item.is_fantasy_match" icon="mdi-star" color="purple" title="Fantasy match"></v-icon>
                <span v-else class="text-grey">—</span>
              </td>
              <td class="text-center">
                <v-menu location="bottom end">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="editSeries(item)" prepend-icon="mdi-pencil">
                      <v-list-item-title>Edit Series</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeleteDialog(item.id, removeSeries)" prepend-icon="mdi-delete" class="text-error">
                      <v-list-item-title>Delete Series</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Empty State -->
      <v-card-text v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-trophy-broken</v-icon>
        <div class="text-h6 mt-4 text-grey">No series scheduled yet</div>
        <v-btn 
          color="primary" 
          variant="tonal" 
          class="mt-4"
          prepend-icon="mdi-plus"
          @click="openCreateNewSeries"
        >
          Create First Series
        </v-btn>
      </v-card-text>

      <v-card-actions v-if="series && series.length > 0">
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          color="error" 
          prepend-icon="mdi-delete-sweep"
          @click="openDeleteDialog(null, removeAllSeries)"
        >
          Delete All Series
        </v-btn>
      </v-card-actions>
    </v-card>

  <PlayerDetailsDialog 
    v-model="showPlayerDetails" 
    :player="playerDetails" 
    :seasonId="match?.season_id" 
  />

        <!-- Edit Series Modal -->
        <v-dialog v-model="editSeriesDialogOpen" max-width="65vw" persistent>
      <v-card style="display: flex; flex-direction: column; height: 95vh;">
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
        <v-card-title>Edit Series</v-card-title>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="6">
                <SimpleDatePicker
                  v-model="selectedDate"
                  label="Scheduled Date"
                />
              </v-col>
              <v-col cols="6">
                <SimpleTimePicker
                  v-model="selectedTime"
                  label="Scheduled Time"
                />
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
        <v-card-actions style="position: sticky; bottom: 0; background: white; z-index: 10;">
          <v-btn @click="updateSeries" color="green" prepend-icon="mdi-check">
            Save
          </v-btn>
          <v-btn @click="cancelEditSeries" color="red" prepend-icon="mdi-close">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Team Rosters Expansion Panel -->
    <v-expansion-panels class="mt-4" v-model="teamRostersPanel">
      <v-expansion-panel>
        <v-expansion-panel-title class="text-h6">
          <v-icon class="mr-2">mdi-account-group</v-icon>
          Team Rosters & Series Proposal
          <template v-slot:actions="{ expanded }">
            <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- Propose Series Controls -->
          <v-card class="mb-4" variant="tonal" color="primary">
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="proposeSeriesMMRDiff"
                    label="Max MMR Difference"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-target"
                    hint="Maximum MMR difference for matchmaking"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="8" class="text-right">
                  <v-btn
                    @click="openProposeSeries"
                    :disabled="!isProposeValid"
                    color="primary"
                    variant="elevated"
                    prepend-icon="mdi-lightbulb-on"
                    size="large"
                  >
                    Propose Series
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Team Rosters -->
          <v-row>
            <v-col cols="12" md="6">
              <v-card elevation="2">
                <v-card-title class="bg-success">
                  <v-icon class="mr-2">mdi-shield</v-icon>
                  {{ team1.name }}
                  <v-chip size="small" class="ml-2" color="white">
                    {{ proposePlayersTeam_1.length }} selected
                  </v-chip>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-data-table
                    :headers="tablePlayerHeader"
                    :items="team1.player_by_season?.[match.season_id] || []"
                    :custom-filter="customFilter"
                    :search="searchQueryT1"
                    v-model="proposePlayersTeam_1"
                    select-strategy="all"
                    density="comfortable"
                    multi-sort
                    fixed-header
                    hover
                    return-object
                    show-select
                  >
                    <template v-slot:loading>
                      <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                    </template>
                    <template v-slot:top>
                      <v-toolbar flat density="compact">
                        <v-text-field
                          v-model="searchQueryT1"
                          placeholder="Search players..."
                          prepend-inner-icon="mdi-magnify"
                          variant="outlined"
                          density="compact"
                          hide-details
                          single-line
                          clearable
                        ></v-text-field>
                      </v-toolbar>
                    </template>
                    <template v-slot:[`item.name`]="{ item }">
                      <div class="d-flex align-center">
                        <FlagIcon :countryIdentifier="item.country" class="mr-2" />
                        <span @click.stop="showStats(item)" class="player-name-link">
                          <strong>{{ item.name }}</strong>
                          <span class="text-caption text-grey ml-1">({{ item.discordTag }})</span>
                        </span>
                      </div>
                    </template>
                    <template v-slot:[`item.w3c_mmr`]="{ item }">
                      <v-chip size="small" color="info">
                        {{ item.w3c_stats.find(player => player.race === item.race)?.mmr || 'N/A' }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card elevation="2">
                <v-card-title class="bg-error">
                  <v-icon class="mr-2">mdi-shield</v-icon>
                  {{ team2.name }}
                  <v-chip size="small" class="ml-2" color="white">
                    {{ proposePlayersTeam_2.length }} selected
                  </v-chip>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-data-table
                    :headers="tablePlayerHeader"
                    :items="team2.player_by_season?.[match.season_id] || []"
                    :custom-filter="customFilter"
                    :search="searchQueryT2"
                    v-model="proposePlayersTeam_2"
                    select-strategy="all"
                    density="comfortable"
                    multi-sort
                    fixed-header
                    hover
                    return-object
                    show-select
                  >
                    <template v-slot:loading>
                      <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                    </template>
                    <template v-slot:top>
                      <v-toolbar flat density="compact">
                        <v-text-field
                          v-model="searchQueryT2"
                          placeholder="Search players..."
                          prepend-inner-icon="mdi-magnify"
                          variant="outlined"
                          density="compact"
                          hide-details
                          single-line
                          clearable
                        ></v-text-field>
                      </v-toolbar>
                    </template>
                    <template v-slot:[`item.name`]="{ item }">
                      <div class="d-flex align-center">
                        <FlagIcon :countryIdentifier="item.country" class="mr-2" />
                        <span @click.stop="showStats(item)" class="player-name-link">
                          <strong>{{ item.name }}</strong>
                          <span class="text-caption text-grey ml-1">({{ item.discordTag }})</span>
                        </span>
                      </div>
                    </template>
                    <template v-slot:[`item.w3c_mmr`]="{ item }">
                      <v-chip size="small" color="info">
                        {{ item.w3c_stats.find(player => player.race === item.race)?.mmr || 'N/A' }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>

  <!-- Propose Series Dialog -->
  <v-dialog
    id="proposeSeriesModal"
    v-if="showProposeSeriesModal"
    v-model="showProposeSeriesModal"
    max-width="1400px">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-lightbulb-on</v-icon>
        Proposed Series
      </v-card-title>
      <v-card-subtitle class="pa-3">
        <v-row align="center" justify="center">
          <v-col cols="5" class="text-center">
            <v-chip color="success" size="large">
              <v-icon start>mdi-shield</v-icon>
              {{ team1.name }}
            </v-chip>
          </v-col>        
          <v-col cols="2" class="text-center">
            <v-icon size="large">mdi-sword-cross</v-icon>
          </v-col>        
          <v-col cols="5" class="text-center">
            <v-chip color="error" size="large">
              <v-icon start>mdi-shield</v-icon>
              {{ team2.name }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card-text class="pa-0">
        <v-data-table
          v-if="proposedSeries.length > 0"
          :headers="proposedSeriesTableHeader"
          :items="proposedSeries"
          :custom-filter="customFilterSeries"
          :search="searchQuerySeries"
          select-strategy="all"
          density="comfortable"
          v-model="selectedProposedSeries"
          multi-sort
          fixed-header
          hover
          return-object
          show-select
          :row-props="getRowClass"
        >
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>
                <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
                Matched Players
              </v-toolbar-title>
              <v-chip size="small" class="ml-2">{{ selectedProposedSeries.length }} selected</v-chip>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchQuerySeries"
                placeholder="Search by player name..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                single-line
                clearable
              ></v-text-field>
            </v-toolbar>
          </template>
              <template v-slot:[`item.player1.name`]="{ item }">
                  <FlagIcon :countryIdentifier="item.player1.country" />
                  <span @click.stop="showStats(item.player1)">{{ item.player1.name }}</span>
              </template>
              <template v-slot:[`item.player2.name`]="{ item }">
                <FlagIcon :countryIdentifier="item.country" />
                  <FlagIcon :countryIdentifier="item.player2.country" />
                  <span @click.stop="showStats(item.player2)">{{ item.player2.name }}</span>
              </template>
              <template v-slot:[`item.p1_w3c_mmr`]="{ item }">
                  <td>{{ item.player1.w3c_stats.find(player => player.race === item.player1.race)?.mmr || 'N/A' }}</td>
              </template>
              <template v-slot:[`item.p1_w3c_high_mmr`]="{ item }">
                  <td>{{ item.player1.w3c_stats.reduce((max, player) => player.mmr > max ? player.mmr : max, 0) }}</td>
              </template>
              <template v-slot:[`item.p2_w3c_mmr`]="{ item }">
                  <td>{{ item.player2.w3c_stats.find(player => player.race === item.player2.race)?.mmr || 'N/A' }}</td>
              </template>
              <template v-slot:[`item.p2_w3c_high_mmr`]="{ item }">
                  <td>{{ item.player2.w3c_stats.reduce((max, player) => player.mmr > max ? player.mmr : max, 0) }}</td>
              </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn 
              icon="mdi-delete" 
              variant="text"
              size="small"
              color="error"
              @click.stop="openDeleteDialog(item.proposedId, removeProposedSeries)"
            ></v-btn>
          </template>
        </v-data-table>
        <v-alert v-else type="info" variant="tonal" class="ma-4">
          No matchups found with current MMR criteria. Try adjusting the MMR difference.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="cancelProposeSeries">Cancel</v-btn>
        <v-btn 
          color="primary"
          @click="createSelectedProposedSeries"
          :disabled="!selectedProposedSeries || selectedProposedSeries.length === 0"
        >
          Create {{ selectedProposedSeries?.length || 0 }} Series
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Player Details Dialog -->
  <PlayerDetailsDialog 
    v-model="showPlayerDetails" 
    :player="playerDetails" 
    :seasonId="match?.season_id" 
  />

  <!-- Sync Results Dialog -->
  <v-dialog v-model="syncDialog" persistent max-width="500">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-sync</v-icon>
        Sync Results
      </v-card-title>
      <v-card-text class="pt-4">
        <div class="mb-2">
          <strong>{{ team1.name }}: </strong>
          <span :class="syncError1 ? 'text-error' : 'text-success'">{{ syncMessage1 }}</span>
        </div>
        <div>
          <strong>{{ team2.name }}: </strong>
          <span :class="syncError2 ? 'text-error' : 'text-success'">{{ syncMessage2 }}</span>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="syncDialog = false" :disabled="isLoading">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="bg-error">
        <v-icon class="mr-2">mdi-alert</v-icon>
        Confirm Deletion
      </v-card-title>
      <v-card-text class="pt-4">
        Are you sure you want to delete this item? This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="cancelDeleteDialog">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>


<script setup>
import bannerImg from '@/assets/media/match-banner.jpg'
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { DateTime } from "luxon";
import { useMatchStore, useSeriesStore, useTeamStore } from '@/stores';
import { useDate } from 'vuetify';
import { storeToRefs } from 'pinia';
import FlagIcon from '../components/FlagIcon.vue';
import SimpleTimePicker from '../components/SimpleTimePicker.vue';
import SimpleDatePicker from '../components/SimpleDatePicker.vue';
import PlayerDetailsDialog from '../components/PlayerDetailsDialog.vue';

defineOptions({
  name: 'MatchDetailsView'
})

// Stores initialization
const router = useRouter();
const matchStore = useMatchStore();
const seriesStore = useSeriesStore();
const teamStore = useTeamStore();
const { match } = storeToRefs(matchStore);
const { series } = storeToRefs(seriesStore);

const seriesTableHeader = [
  
  { title: 'ID', value: 'id', sortable: true },  
  { title: 'Caster'},  
  { title: 'Date/Time'}, 
  { title: 'Player 1', value: 'player1.name', sortable: true },
  { title: 'MMR', value: 'p1_w3c_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player1.w3c_stats?.find(player => player.race === a?.player1.race)?.mmr || 0;
    let bValue = b?.player1.w3c_stats?.find(player => player.race === b?.player1.race)?.mmr || 0;
    return aValue - bValue;
  } },
  { title: 'P1 Score' },
  { title: 'P2 Score' },
  { title: 'Player 2', value: 'player2.name', sortable: true },
  { title: 'MMR', value: 'p2_w3c_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player2.w3c_stats?.find(player => player.race === a?.player2.race)?.mmr || 0;
    let bValue = b?.player2.w3c_stats?.find(player => player.race === b?.player2.race)?.mmr || 0;
    return aValue - bValue;
  }},
  { title: 'Host' },
  { title: 'Fantasy Match'},    
  { title: '', value: 'actions', sortable: true }
];

const proposedSeriesTableHeader = [
  { title: 'Player 1', value: 'player1.name', width:'300px', sortable: true },
  { title: 'GNL Games', value: 'player1.gnl_stats[0].games', sortable: true, align: 'end' },
  { title: 'Signup MMR', value: 'player1.mmr', sortable: true },
  { title: 'Current MMR', key: 'p1_w3c_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player1.w3c_stats?.find(player => player.race === a?.player1.race)?.mmr || 0;
    let bValue = b?.player1.w3c_stats?.find(player => player.race === b?.player1.race)?.mmr || 0;
    return aValue - bValue;
  }},
  { title: 'Highest Race MMR', key: 'p1_w3c_high_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player1.w3c_stats?.reduce((max, player) => player.mmr > max ? player.mmr : max, 0)||0;
    let bValue = b?.player1.w3c_stats?.reduce((max, player) => player.mmr > max ? player.mmr : max, 0)||0;
    return aValue - bValue;
  }},
  { title: 'Player 2', value: 'player2.name', width:'300px', sortable: true },
  { title: 'GNL Games', value: 'player2.gnl_stats[0].games', sortable: true, align: 'end' },
  { title: 'Signup MMR', value: 'player2.mmr', sortable: true }, 
  { title: 'Current MMR', key: 'p2_w3c_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player2.w3c_stats?.find(player => player.race === a?.player2.race)?.mmr || 0;
    let bValue = b?.player2.w3c_stats?.find(player => player.race === b?.player2.race)?.mmr || 0;
    return aValue - bValue;
  }},
  { title: 'Highest Race MMR', key: 'p2_w3c_high_mmr', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.player2.w3c_stats?.reduce((max, player) => player.mmr > max ? player.mmr : max, 0)||0;
    let bValue = b?.player2.w3c_stats?.reduce((max, player) => player.mmr > max ? player.mmr : max, 0)||0;
    return aValue - bValue;
  }
  },
  { title: '', value: 'actions', sortable: true }, 
];

const tablePlayerHeader = [
  { title: 'Name', value: 'name', sortable: true },
  { title: 'GNL Games', key: 'gnl_stats[0].games', sortable: true },
  { title: 'MMR', key: 'w3c_mmr', value:'item', sortable: true, sortRaw: (a, b) => {
    let aValue = a?.w3c_stats?.find(player => player.race === a?.race)?.mmr || 0;
    let bValue = b?.w3c_stats?.find(player => player.race === b?.race)?.mmr || 0;
    return aValue - bValue;
  }

}, 
];

// Route params
const matchId = router.currentRoute.value.params.id;

// Component state
const isLoading = ref(false);
const search = ref('');
const date = useDate();

// Team state
const team1 = ref({});
const team2 = ref({});

// Series state
const showNewSeriesModal = ref(false);
const createNewSeriesDialogOpen = ref(false);
const newSeries_Player_1 = ref(null);
const newSeries_Player_2 = ref(null);
const editSeriesDialogOpen = ref(false);
const selectedSeries = ref(null);
const hostPlayers = ref(null);
const selectedDate = ref(null);
const selectedTime = ref(null);
const creationSeriesError = ref(null);
const updateSeriesError = ref(false);

// UI state
const teamRostersPanel = ref(null);

// Propose series state
const showProposeSeriesModal = ref(false);
const proposePlayersTeam_1 = ref([]);
const proposePlayersTeam_2 = ref([]);
const proposeSeriesMMRDiff = ref(null);
const proposedSeries = ref([]);
const selectedProposedSeries = ref([]);

// Search state
const searchQueryT1 = ref('');
const searchQueryT2 = ref('');
const searchQuerySeries = ref('');

// Player details state
const showPlayerDetails = ref(false);
const playerDetails = ref(null);

// Sync state
const syncDialog = ref(false);
const syncMessage1 = ref("");
const syncMessage2 = ref("");
const syncError1 = ref(false);
const syncError2 = ref(false);

// Delete dialog state
const showDeleteDialog = ref(false);
const selectedDeleteItemId = ref(null);
const deleteAction = ref(null);

// Computed properties
const isProposeValid = computed(() => 
  proposePlayersTeam_1.value != null && 
  proposePlayersTeam_2.value != null && 
  proposeSeriesMMRDiff.value != null
);

const formateDate = ( dateToFormat ) => {
  if (!dateToFormat) {
    return dateToFormat;
  }
  // Display ET time as stored in database (no conversion)
  const formatedDate = DateTime.fromISO(dateToFormat, {
    zone: "America/New_York"
  }).toLocaleString(DateTime.DATETIME_MED);
  return formatedDate
}

const customFilter = (value, search, item) => {
  if (!search) return true;
  search = search.toLowerCase();
  // Check if the search query matches the name or Discord fields
  return (
    item.raw.name.toLowerCase().includes(search) ||
    item.raw.discordTag.toLowerCase().includes(search)
  );
}

const getRowClass = item => {
  // Highlight if this exact matchup is selected
  const isMatchSelected = selectedProposedSeries.value.some(
    sel => sel.player1.id === item.item.player1.id && sel.player2.id === item.item.player2.id
  );
  if(isMatchSelected){
    return {class: 'highlight-selected-row'}; 
  }
  
  // Highlight if either player already has a series created
  const playerHasSeries = series.value && series.value.some(
    sel => sel.player1.id === item.item.player1.id || sel.player2.id === item.item.player2.id
  );
  if(playerHasSeries){
    return {class: 'highlight-row'}; 
  }
  
  // Highlight if either player is in the selected proposed series
  const isPlayerSelected = selectedProposedSeries.value.some(
    sel => sel.player1.id === item.item.player1.id || sel.player2.id === item.item.player2.id
  );
  return {class: isPlayerSelected ? 'highlight-row' : ''};
};


const customSort = (items, sortBy, sortDesc) => {
  console.log(item, sortby, sortDesc);
  if (sortBy === 'w3c_mmr') {
    return [...items].sort((a, b) => {
      let aValue = a.w3c_stats.find(player => player.race === a.race)?.mmr || 0;
      let bValue = b.w3c_stats.find(player => player.race === b.race)?.mmr || 0;
      return sortDesc ? bValue - aValue : aValue - bValue;
    });
  }
  return items; // Uses default sorting for other columns
};

const customFilterSeries = (value, search, item) => {
  if (!search) return true;
  search = search.toLowerCase();
  // Check if the search query matches the name or Discord fields
  return (
    item.raw.player1.name.toLowerCase().includes(search) ||
    item.raw.player2.name.toLowerCase().includes(search)
  );
}



const seriesHeaders = [
  { title: 'ID', value: 'id' },
  { title: 'Player 1', value: 'player1.name' },
  { title: '', value: '' },
  { title: 'Player 2', value: 'player2.name' },
  { title: 'Actions', align: 'center' }
];

const openCreateNewSeries = () => {
  createNewSeriesDialogOpen.value = true;
  newSeries_Player_1.value = null;
  newSeries_Player_2.value = null;
  creationSeriesError.value = null;
};

const cancelCreateSeries = () => {
  createNewSeriesDialogOpen.value = false;
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
  isLoading.value = true;
  syncError1.value = false;
  syncError2.value = false;
  syncDialog.value = true;
  syncMessage1.value = "Sync Onging!";
  syncMessage2.value = "Not started!";

  try {
    team1.value = await teamStore.syncPlayersW3C(matchStore.match.team1_id, matchStore.match.season_id);
    syncMessage1.value = "Team 1 synced successfully!";
  } catch (error) {
    console.error('Failed to sync Team 1:', error);
    syncError1.value = true;
    syncMessage1.value = error || "An unknown error occurred.";
  }
  try {
    syncMessage2.value = "Sync Onging!";
    team2.value = await teamStore.syncPlayersW3C(matchStore.match.team2_id, matchStore.match.season_id);
    syncMessage2.value = "Team 2 synced successfully!";
  } catch (error) {
    console.error('Failed to sync Team 2:', error);
    syncError2.value = true;
    syncMessage2.value = error || "An unknown error occurred.";
  }

  isLoading.value = false; // Show results
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
  updateSeriesError.value = '';
  selectedSeries.value = copy_series;
  if (copy_series.date_time) {
    // Keep in ET timezone (no conversion to local)
    const initialDateTime = DateTime.fromISO(
      copy_series.date_time,{
        zone: "America/New_York"
      }
    );
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
  updateSeriesError.value = '';
  try{
    // Combine selected date and time directly in ET timezone
    const etDate = DateTime.fromJSDate(selectedDate.value).setZone("America/New_York");
    const combinedDateTime = DateTime.fromISO(`${etDate.toISODate()}T${selectedTime.value}`, {
      zone: "America/New_York"
    });
    // Update series.date_time with the formatted ISO datetime in ET
    selectedSeries.value.date_time = combinedDateTime.toISO();
    await seriesStore.updateSeries(selectedSeries.value);
    await fetchMatchSeries(); // Refresh match details after creation
    cancelEditSeries();
  } catch (error) {
    console.error('Error updating series:', error);
    updateSeriesError.value = 'Error updating series: ' + error;
  } finally {
    isLoading.value = false;
  }
}

const removeProposedSeries = (proposedId) => {
  proposedSeries.value = proposedSeries.value.filter(series => series.proposedId !== proposedId);

}

const proposeSeries = async () => {
  isLoading.value = true;
  try {
    proposedSeries.value = []
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
          let seriesExists = false;
          for (let n = 0; n < seriesStore.series.length; n++){
            let s = seriesStore.series[n];
            if(p1.id == s.player1_id && p2.id == s.player2_id){
              seriesExists = true;
              break;
            }
          }
          if(seriesExists){
            continue;
          }
        }

        if(selectedProposedSeries.value) {
          let selectedPropSeriesExists = false;
          for (let m = 0; m < selectedProposedSeries.value.length; m++){
            let sPropS = selectedProposedSeries.value[m];
            if(p1.id == sPropS.player1_id && p2.id == sPropS.player2_id){
              proposedSeries.value.push(sPropS);
              selectedPropSeriesExists = true;
              break;
            }
          }
          if(selectedPropSeriesExists){
            continue;
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
          newSeries.proposedId = proposedSeries.value.length+1
          newSeries.match_id = matchStore.match.id
          newSeries.season_id = matchStore.match.season_id
          newSeries.host_player_id = p1.id
          newSeries.player1_score = 0
          newSeries.player2_score = 0
          newSeries.player1_id = p1.id
          newSeries.player1 = p1
          newSeries.player2_id = p2.id
          newSeries.player2 = p2
          proposedSeries.value.push(newSeries)
        }
      }
    }
    if (selectedProposedSeries.value) {
      selectedProposedSeries.value = selectedProposedSeries.value.filter(sps =>
        proposedSeries.value.some(ps => sps.player1_id === ps.player1_id && sps.player2_id === ps.player2_id)
      );
    }
  } catch (error) {
    console.error('Failed to fetch match details:', error);
  } finally {
    isLoading.value = false;
  }
};

const openProposeSeries = () => {
  proposeSeries();
  showProposeSeriesModal.value = true;
};
const cancelProposeSeries = () => {
  showProposeSeriesModal.value = false;
};

const createSelectedProposedSeries = async () => {
  
  isLoading.value = true;
  try {
    for (const series of selectedProposedSeries.value) {
      await seriesStore.createSeries(series);
    }

    await fetchMatchSeries(); // Refresh match details after creation
    cancelProposeSeries();
  } catch (error) {
    console.error('Failed to create series:', error);
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
  
  isLoading.value = true;
  try {
    await seriesStore.createSeries(newSeries);
    await fetchMatchSeries(); // Refresh match details after creation
    cancelCreateSeries();
  } catch (error) {
    console.error('Failed to create series:', error);
  } finally {
    isLoading.value = false;
  }
};

const removeSeries = async (seriesId) => {
  isLoading.value = true;
  try {
    await seriesStore.deleteSeries(seriesId);
    await fetchMatchDetails(); // Refresh match details after removal
  } catch (error) {
    console.error('Failed to remove series:', error);
  } finally {
    isLoading.value = false;
  }
};

const openDeleteDialog = (id, action) => {
  selectedDeleteItemId.value = id;
  deleteAction.value = action; // Store the function dynamically
  showDeleteDialog.value = true;
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

const removeAllSeries = async () => {
  isLoading.value = true;
  try {
    await seriesStore.deleteAllSeries()
    await fetchMatchDetails(); // Refresh match details after removal
  } catch (error) {
    console.error('Failed to remove series:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMatchDetails();
});
</script>

<style scoped>

.toolbar-btn { margin-right: 12px !important; }

/* Keep action buttons on a single line and prevent wrapping in table cells */
.actions-cell {
  white-space: nowrap;
}

#matchHeader {
  position: relative;
  color: white;
  min-height: 300px;
  height: 300px;
}

.banner-image {
  position: absolute;
  top: 0;
  height: 100%; 
  width: 100%;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.teams-matchup {
  margin-top: 2rem;
}

.team-name-header {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  letter-spacing: 1px;
}

.score-chip-large {
  font-size: 2rem !important;
  font-weight: bold;
  min-width: 80px;
}

.vs {
  font-family: "Bungee Shade", sans-serif;
  font-weight: 400;
  font-style: normal;
}

.player-cell {
  cursor: pointer;
  transition: color 0.2s;
}

.player-cell:hover {
  color: rgb(var(--v-theme-primary));
}

.player-name-link {
  cursor: pointer;
  transition: color 0.2s;
}

.player-name-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.series-row {
  transition: all 0.2s ease;
}

.series-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

@media (max-width: 960px) {
  .team-name-header {
    font-size: 1.5rem !important;
  }
  
  .score-chip-large {
    font-size: 1.5rem !important;
    min-width: 60px;
  }
}

</style>

<style>
/* Global styles for table row highlighting (cannot be scoped) */
.highlight-row {
  background-color: #ffc87a !important;
}

.highlight-selected-row {
  background-color: #99ff7a !important;
}
</style>