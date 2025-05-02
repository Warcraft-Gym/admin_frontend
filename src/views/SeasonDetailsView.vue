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
            <p>Number of Series per Week: {{ season.series_per_week }}</p>
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
        <v-dialog v-model="isModalOpen" max-width="600px">
          <v-card>
            <v-card-title>Select Teams for the Match</v-card-title>
            <v-card-text>
              <!-- Team Selection -->
              <v-select
                :items="plainTeams"
                item-value="id"
                item-text="name"
                label="Select Team 1"
                v-model="selectedTeam1"
              >
            </v-select>
              <v-select
                :items="teams"
                item-text="name"
                item-value="id"
                label="Select Team 2"
                v-model="selectedTeam2"
              ></v-select>
            </v-card-text>
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
              <v-col cols="2" class="text-center">
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


  </template>
  
  <script>
  import { useRouter } from 'vue-router';
  import { ref, onMounted, computed } from 'vue';
  import { useSeasonStore, useMatchStore, useTeamStore } from '@/stores';
  import  bannerImg from '@/assets/media/GNL_Banner.png';
  import  teamDefaultImg from '@/assets/media/GNL_Team_Default.png';
  
  const addTeamsTableHeader = [
  { title: 'ID', value: 'id', sortable: true },
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Long Name', value: 'long_name', sortable: true },
]

  export default {
    name: 'SeasonDetailsView',
    setup() {
    const router = useRouter();
    const seasonId = router.currentRoute.value.params.id;
    const seasonStore = useSeasonStore();
    const matchStore = useMatchStore();
    const teamStore = useTeamStore();
    const isLoading = ref(true);
    const selectedWeek = ref(null);
    const isModalOpen = ref(false);
    const isTeamDialogOpen = ref(false);

    const teamImages = ref({});
    const allTeams = ref(null);
    const selectedTeams = ref(null);

    const selectedTeam1 = ref(null);
    const selectedTeam2 = ref(null);
    // Compute teams that are not part of the season
    const availableTeams = computed(() => {
      if (!allTeams.value || allTeams.value.length == 0) {
        console.log("no teams")
        return [];
      }
      return allTeams.value;
      //return allTeams.value.filter(team => !teamStore.teams.some(seasonTeam => seasonTeam.id === team.id));
    });

    const openTeamSelectionModal = async () => {
      isTeamDialogOpen.value = true;
      selectedTeams.value = [];
    };

    const closeTeamSelectionModal = () => {
      isTeamDialogOpen.value = false;
      selectedTeams.value = null;
    };

    let isInitLoading = false;

    const openMatchCreationModal = (teams) => {
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


    const confirmSelection = async () => {
      if (!selectedTeam1.value || !selectedTeam2.value) {
        alert("Please select two teams.");
        return;
      }
      isLoading.value = true;
      try {
        const newMatch = {
          playday: selectedWeek.value,
          season_id: seasonId,
          team1_id: selectedTeam1.value,
          team2_id: selectedTeam2.value,
        };
        await matchStore.createMatch(newMatch); // Assuming a createMatch method exists
        console.log("Match added successfully!");
        fetchMatches(selectedWeek.value); // Refresh matches for the week
      } catch (error) {
        console.error("Failed to add match:", error);
      } finally {
        isLoading.value = false;
        closeMatchCreationModal();
      }
    };


    const fetchMatches = async (week) => {
        selectedWeek.value = week;
        isLoading.value = true;
        try {
            await matchStore.searchMatchesBySeasonAndPlayday(seasonId, week);
        } catch (error) {
            console.error(`Failed to fetch matches for week ${week}:`, error);
        } finally {
          if(!isInitLoading){
            isLoading.value = false;
          }
        }
    };


    // Fetch teams for the season
    const fetchTeams = async () => {
      isLoading.value = true;
      try {
        await teamStore.fetchTeamsBySeason(seasonId);

        // Fetch team images concurrently
        const teamPromises = teamStore.teams.map(async (team) => {
          try {
            const imgResponse = await teamStore.getTeamImage(team.id);
            if (!imgResponse.ok) throw new Error("Image not found");
            const imgBlob = await imgResponse.blob();
            teamImages.value[team.id] = URL.createObjectURL(imgBlob); //
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
        if(!isInitLoading){
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
        if(!isInitLoading){
          isLoading.value = false;
        }
      }
    };
  
    onMounted(async () => {
        isInitLoading = true;
        isLoading.value = true;
        try {
          await Promise.all([
            fetchSeasonDetails(),
            fetchTeams(),
            allTeams.value = await teamStore.getTeams(),
            fetchMatches(1)
        ]);

        } finally {
          isLoading.value = false;
          isInitLoading = false;
        }
    });
    return { 
        season: computed(() => seasonStore.current_season),
        matches: computed(() => matchStore.matches),
        teams: computed(() => teamStore.teams),
        plainTeams: computed(() =>
          teamStore.teams.map(team => ({
            id: team.id,
            name: team.name,
          }))
        ),

        isLoading,
        bannerImg,

        teamImages,
        teamDefaultImg,

        fetchMatches,
        fetchTeams,
        selectedWeek,
        isModalOpen,
        selectedTeam1,
        selectedTeam2,
        openMatchCreationModal,
        closeMatchCreationModal,
        confirmSelection,
        selectedTeams,
        availableTeams,
        isTeamDialogOpen,
        addTeamsTableHeader,
        openTeamSelectionModal,
        closeTeamSelectionModal,
        addTeamsToSeason,

        };
    },
  };
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
  </style>