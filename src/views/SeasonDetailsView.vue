<template>
  <v-overlay v-model="isLoading" persistent absolute>
    <v-progress-circular
          indeterminate
          size="64" 
          width="8"
          color="primary"
    ></v-progress-circular>
  </v-overlay>
  <div id="seasonHeader">
    <v-parallax class="banner-image" :src="bannerImg" height="300"></v-parallax>
    <div class="banner-content h-100">
      <v-container>
        <v-row class="justify-center">
          <v-col cols="auto text-center">
            <h1>Season Details</h1>
            <p>Name: {{ season.name }}</p>
            <p>Number of Weeks: {{ season.number_weeks }}</p>
            <p>Pick Ban Order: {{ season.pick_ban }}</p>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
  <v-container>
    <v-row>          
      <v-col>
        <!-- Buttons for Weeks -->
        <div class="button-container">
          <v-btn
            v-for="week in season.number_weeks"
            :key="week"
            :color="selectedWeek === week ? 'primary' : 'default'"
            @click="fetchMatches(week)"
          >
            Week {{ week }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row>
    <!-- Add Match Button -->
      <v-col>
        <v-btn
          @click="openMatchCreationModal(plainTeams)"
          class="toolbar-btn"
          variant="tonal"
          prepend-icon="mdi-plus">
          Add Match for Week {{ selectedWeek }}
        </v-btn>
      </v-col>

        <!-- Team Selection Modal -->
        <v-dialog v-if="newMatch" v-model="isModalOpen" max-width="600px">
          <v-card>
                      <template v-slot:title>
                        <span class="modal-title">
                          <v-icon icon="mdi-account-edit"></v-icon>
                          Create Match
                        </span>
                      </template>
                      <template v-slot:text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model="newMatch.date_frame" 
                              label="Date Frame">
                            </v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-select
                              :items="maps"
                              item-title="name"
                              item-value="id"
                              label="Select Fixed Map"
                              v-model="newMatch.fixed_map_id"
                            >
                            </v-select>
                          </v-col>
                          <v-col cols="6">
                            <v-select
                              :items="teams"
                              item-title="name"
                              item-value="id"
                              label="Select Team 1"
                              v-model="newMatch.team1_id"
                            >
                            </v-select>
                          </v-col>
                          <v-col  cols="6">
                            <v-select
                              :items="teams"
                              item-title="name"
                              item-value="id"
                              label="Select Team 2"
                              v-model="newMatch.team2_id"
                            >
                          </v-select>
                          </v-col>
                        </v-row>      
                      </template>   
                      <v-card-actions>
                        <v-btn color="primary" @click="confirmSelection">Confirm</v-btn>
                        <v-btn color="secondary" @click="closeMatchCreationModal">Cancel</v-btn>
                      </v-card-actions>        
                    </v-card>
        </v-dialog>
    </v-row>
    <!-- Matches for Selected Week -->
    <v-row v-if="matches && matches.length > 0">
      <v-col
        v-for="(match, index) in matches"
        :key="index"
        cols="12"
        md="6"
      >
        <v-card @click="$router.push(`/match/${match.id}`)">
          <v-card-title></v-card-title>
          <v-card-text>
            <v-row class="align-center justify-center">
              <v-col 
                cols="5" 
                class="team-card" 
                :style="{ backgroundImage: `url(${teamImages[match.team1.id] || bannerImg})` }"
              >
                <h3 class="team-name">{{ match.team1.name }}</h3>
                <span class="score">{{ match.team1_score }}</span>
              </v-col>

              <!-- VS Icon -->
              <v-col cols="1" class="text-center">
                <v-icon large color="primary">mdi-sword-cross</v-icon>
              </v-col>

              <!-- Team 2 -->
              <v-col 
                cols="5" 
                class="team-card" 
                :style="{ backgroundImage: `url(${teamImages[match.team2.id] || bannerImg})` }"
              >
                <h3 class="team-name">{{ match.team2.name }}</h3>
                <span class="score">{{ match.team2_score }}</span>
              </v-col>
              <v-col cols="1">
                <v-row>
                  <v-btn class="table-action" icon density="compact" color="blue" @click.stop="editMatch(match)">
                    <v-icon>mdi-account-edit</v-icon>
                  </v-btn>
                  <!-- Edit Map Modal -->
                  <v-dialog
                    id="editMatchModal"
                    v-if="selectedMatch"
                    v-model="editMatchDialogOpen"
                    max-width="65vw">
                    <v-card>
                      <template v-slot:title>
                        <span class="modal-title">
                          <v-icon icon="mdi-account-edit"></v-icon>
                          Edit Match
                        </span>
                      </template>
                      <template v-slot:text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model="selectedMatch.date_frame" 
                              label="Date Frame">
                            </v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-select
                              :items="maps"
                              item-title="name"
                              item-value="id"
                              label="Select Fixed Map"
                              v-model="selectedMatch.fixed_map_id"
                            >
                            </v-select>
                          </v-col>
                          <v-col cols="6">
                            <v-select
                              :items="teams"
                              item-title="name"
                              item-value="id"
                              label="Select Team 1"
                              v-model="selectedMatch.team1_id"
                            >
                            </v-select>
                          </v-col>
                          <v-col  cols="6">
                            <v-select
                              :items="teams"
                              item-title="name"
                              item-value="id"
                              label="Select Team 2"
                              v-model="selectedMatch.team2_id"
                            >
                          </v-select>
                          </v-col>
                        </v-row>      
                      </template>       
                          
                      <v-card-actions>
                        <v-btn 
                          prepend-icon="mdi-pencil"
                          @click="updateMatch"
                          color="light-green"
                          variant="tonal">
                          Save
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
                </v-row>
                <v-row>
                  <v-btn class="table-action" icon density="compact" color="red" @click.stop="openDeleteDialog(match.id, removeMatch)">
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>


        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>No matches found for Week {{ selectedWeek }}.</v-col>
    </v-row>
  </v-container>
  <v-container>
    <!-- Teams Section -->
    <div>
    <v-row>
      <v-col>
      <h2>Teams</h2>
    </v-col>
    </v-row>
    <v-row>
    <!-- Add Match Button -->
      <v-col>
        <v-btn
          @click="openTeamSelectionModal"
          class="toolbar-btn"
          variant="tonal"
          prepend-icon="mdi-plus">
          Add Teams
        </v-btn>
        <v-btn
          @click="router.push(`/seasons/${season.id}/assign`)"
          class="toolbar-btn"
          variant="tonal"
          prepend-icon="mdi-account-multiple-plus">
          Assign Signups
        </v-btn>
      </v-col>

        <!-- Team Selection Modal -->
        <!-- Team Selection Dialog -->
    <v-dialog v-model="isTeamDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>Select a Team to Add</v-card-title>
        <v-card-text>
          <v-data-table v-if="availableTeams"
              :headers="addTeamsTableHeader"
              :items="availableTeams"
              select-strategy="all"
              density="compact"
              item-value="id"
              v-model="selectedTeams"
              multi-sort
              fixed-header
              hover
              show-select
            ></v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="addTeamsToSeason">Confirm</v-btn>
          <v-btn color="secondary" @click="closeTeamSelectionModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-row>
      <v-row v-if="teams && teams.length > 0">
        <v-col v-for="(team, index) in teams" :key="index" cols="12" md="6">
          <v-card @click="$router.push(`/team/${team.id}/season/${season.id}`)">
            <v-card-title>
                <!-- Icon can be replaced with icon stored in backend... -->
                <v-img :src="teamImages[team.id]"
                  class="team-image"
                  width="40"
                  height="40"
                  contain
                ></v-img>
                {{ team.name }}
            </v-card-title>
            <v-card-text>
              <p>Final Score: {{ team.seasons_info[0].final_score }}</p>
              <p>Points against: {{ team.seasons_info[0].points_against }}</p>
              <p>Points available: {{ team.seasons_info[0].points_available }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <p v-else>No teams found for this season.</p>
    </div>
  </v-container>
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
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue';
import { useSeasonStore, useMatchStore, useTeamStore, useMapStore } from '@/stores';
import { storeToRefs } from 'pinia';
import bannerImg from '@/assets/media/GNL_Banner.png';
import teamDefaultImg from '@/assets/media/GNL_Team_Default.png';

defineOptions({
  name: 'SeasonDetailsView'
})

// Store initialization
const router = useRouter();
const route = useRoute();
const seasonStore = useSeasonStore();
const matchStore = useMatchStore();
const teamStore = useTeamStore();
const mapStore = useMapStore();

// Store refs
const { current_season: season } = storeToRefs(seasonStore);
const { matches } = storeToRefs(matchStore);
const { teams } = storeToRefs(teamStore);
const { maps } = storeToRefs(mapStore);

// Route params
const seasonId = router.currentRoute.value.params.id;

// Table configuration
const addTeamsTableHeader = [
  { title: 'ID', value: 'id', sortable: true },
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Long Name', value: 'long_name', sortable: true },
];
    // Component state
const isLoading = ref(true);
const isInitLoading = ref(false);

// Week selection state
const selectedWeek = ref(null);

// Modal state
const isModalOpen = ref(false);
const isTeamDialogOpen = ref(false);
const editMatchDialogOpen = ref(false);

// Match state
const selectedMatch = ref(null);
const selectedMap = ref(null);
const newMatch = ref(null);

// Team state
const teamImages = ref({});
const allTeams = ref(null);
const selectedTeams = ref(null);
const selectedTeam1 = ref(null);
const selectedTeam2 = ref(null);

// Delete dialog state
const showDeleteDialog = ref(false);
const selectedDeleteItemId = ref(null);
const deleteAction = ref(null);

// Compute teams that are not part of the season
const availableTeams = computed(() => {
  if (!allTeams.value || allTeams.value.length == 0) {
    return [];
  }
  return allTeams.value.filter(team => !teamStore.teams.some(seasonTeam => seasonTeam.id === team.id));
});

// Team selection methods
const openTeamSelectionModal = async () => {
  // Load basic team info only when the modal is opened
  if (!allTeams.value) {
    allTeams.value = await teamStore.getTeamsBasic();
  }
  isTeamDialogOpen.value = true;
  selectedTeams.value = [];
};

const closeTeamSelectionModal = () => {
  isTeamDialogOpen.value = false;
  selectedTeams.value = null;
};

    const openMatchCreationModal = () => {
      newMatch.value = {
        date_frame:'',
        fixed_map_id:null,
        team1_id:null,
        team2_id:null,
        season_id:seasonId,
        playday: selectedWeek.value
      }
      isModalOpen.value = true;
    };

    const closeMatchCreationModal = () => {
      isModalOpen.value = false;
      selectedTeam1.value = null;
      selectedTeam2.value = null;
    };

    const addTeamsToSeason = async () => {
      isLoading.value = true;
      try{
        await seasonStore.addTeamsToSeason(seasonId, selectedTeams.value);
        await fetchTeams();
      } catch (error) {
        console.error("Failed to add teams to season:", error);
      } finally {
        isLoading.value = false;
        closeTeamSelectionModal();
      }
    };

    const editMatch = (match) => {
      selectedMatch.value = { ...match }; // Clone the user object to avoid modifying the original object directly
      editMatchDialogOpen.value = true;
    };

    const updateMatch = async () => {
      try {
        await matchStore.updateMatch(selectedMatch.value);
        // Update the local state after a successful PUT request
        await fetchMatches(selectedWeek.value);
        cancelEdit(); // Reset the form
      } catch (error) {
        console.error('Error updating match:', error);
      }
    };

    const removeMatch = async (matchId) => {
      try {
        await matchStore.deleteMatch(matchId);
        await fetchMatches(selectedWeek.value); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    };

    const cancelEdit = () => {
      editMatchDialogOpen.value = false;
      selectedMatch.value = null; // Clear the selected user
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

    const confirmSelection = async () => {
      isLoading.value = true;
      try {
        await matchStore.createMatch(newMatch.value); // Assuming a createMatch method exists
        console.log("Match added successfully!");
        await fetchMatches(selectedWeek.value); // Refresh matches for the week
        closeMatchCreationModal();
      } catch (error) {
        console.error("Failed to add match:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchMatches = async (week) => {
  selectedWeek.value = week;
  isLoading.value = true;
  router.push({ hash: `#week-${week}` });
  try {
    await matchStore.searchMatchesBySeasonAndPlayday(seasonId, week);
  } catch (error) {
    console.error(`Failed to fetch matches for week ${week}:`, error);
  } finally {
    if (!isInitLoading.value) {
      isLoading.value = false;
    }
  }
};

    const fetchMaps = async () => {
      try {
        await mapStore.fetchMaps();
      } catch (error) {
        console.error('Failed to fetch maps:', error);
      }
    };

    // Fetch teams for the season
    const fetchTeams = async () => {
  isLoading.value = true;
  try {
    await teamStore.fetchTeamsBySeasonBasic(seasonId);

    // Fetch team images concurrently
    const teamPromises = teamStore.teams.map(async (team) => {
      try {
        const imgResponse = await teamStore.getTeamImage(team.id);
        if (!imgResponse.ok) throw new Error("Image not found");
        const imgBlob = await imgResponse.blob();
        teamImages.value[team.id] = URL.createObjectURL(imgBlob);
      } catch (error) {
        teamImages.value[team.id] = teamDefaultImg; // Assign default image if fetch fails
      }
      return team;
    });

    // Wait for all images to be fetched before storing updated teams
    await Promise.all(teamPromises);
  } catch (error) {
    console.error('Failed to fetch teams for the season:', error);
  } finally {
    if (!isInitLoading.value) {
      isLoading.value = false;
    }
  }
};

    const fetchSeasonDetails = async () => {
  isLoading.value = true;
  try {
    await seasonStore.fetchSeason(seasonId);
  } catch (error) {
    console.error('Failed to fetch season details:', error);
  } finally {
    if (!isInitLoading.value) {
      isLoading.value = false;
    }
  }
};

    watch(() => route.hash, (newHash) => {
      if (newHash) {
        const weekFromHash = route.hash && route.hash.includes('#week-') 
            ? parseInt(route.hash.replace('#week-', ''), 10) 
            : 1;
          if(selectedWeek.value && weekFromHash!=selectedWeek.value){
            fetchMatches(weekFromHash);
          }
      }
    });

  
    // Lifecycle hooks
onMounted(async () => {
  isInitLoading.value = true;
  isLoading.value = true;
  try {
    const weekFromHash = route.hash && route.hash.includes('#week-') 
      ? parseInt(route.hash.replace('#week-', ''), 10) 
      : 1;

    await Promise.all([
      fetchSeasonDetails(),
      fetchTeams(),
      fetchMatches(weekFromHash),
      fetchMaps()
    ]);
  } finally {
    isLoading.value = false;
    isInitLoading.value = false;
  }
});

// Route watchers
watch(() => route.hash, (newHash) => {
  if (newHash) {
    const weekFromHash = route.hash && route.hash.includes('#week-') 
      ? parseInt(route.hash.replace('#week-', ''), 10) 
      : 1;
    if(selectedWeek.value && weekFromHash != selectedWeek.value) {
      fetchMatches(weekFromHash);
    }
  }
});
  </script>
  <style>  
  #seasonHeader {
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

  .match-card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.team-card {
  height:200px;
  padding: 20px;
  border-radius: 8px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  text-shadow: 1px 1px 5px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px; /* Adjust height based on design */
}

.team-name {
  font-size: 22px;
  font-weight: bold; /* Add a slight background for text readability */
  padding: 8px;
  border-radius: 4px;
}
/* Small spacing for inline table action buttons */
.table-action {
  margin-right: 8px;
  margin-bottom: 8px;
}
  </style>