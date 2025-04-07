<template>
    <div>
      <h1>Season Details</h1>
      <p>ID: {{ season.id }}</p>
      <p>Name: {{ season.name }}</p>
      <p>Number of Weeks: {{ season.number_weeks }}</p>
      <p>Pick Ban Order: {{ season.pick_ban }}</p>
      <p>Number of Series per Week: {{ season.series_per_week }}</p>
    </div>
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
    <!-- Matches for Selected Week -->
    <v-row v-if="matches && matches.length > 0">
      <v-col
        v-for="(match, index) in matches"
        :key="index"
        cols="12"
        md="6"
      >
        <v-card @click="$router.push(`/match/${match.id}`)">
          <v-card-title>{{ match.team1.name}}  VS  {{ match.team2.name}}</v-card-title>
          <v-card-text></v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <p v-else>No matches found for Week {{ selectedWeek }}.</p>

    <!-- Teams Section -->
    <div>
      <h2>Teams</h2>
      <v-row v-if="teams && teams.length > 0">
        <v-col v-for="(team, index) in teams" :key="index" cols="12" md="6">
          <v-card @click="$router.push(`/team/${team.id}/season/${season.id}`)">
            <v-card-title>
                <!-- Icon can be replaced with icon stored in backend... -->
                <v-icon left icon="mdi-account-group"></v-icon>
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



  </template>
  
  <script>
  import { useRouter } from 'vue-router';
  import { ref, onMounted, computed } from 'vue';
  import { useSeasonStore, useMatchStore, useTeamStore } from '@/stores';
  
  export default {
    name: 'SeasonDetailsView',
    setup() {
    const router = useRouter();
    const seasonId = router.currentRoute.value.params.id;
    const seasonStore = useSeasonStore();
    const matchStore = useMatchStore();
    const teamStore = useTeamStore();
    const selectedWeek = ref(null);

    const fetchMatches = async (week) => {
        self.selectedWeek = week
        try {
            await matchStore.searchMatchesBySeasonAndPlayday(seasonId, week);
        } catch (error) {
            console.error(`Failed to fetch matches for week ${week}:`, error);
        }
    };

    // Fetch teams for the season
    const fetchTeams = async () => {
      try {
        await teamStore.fetchTeamsBySeason(seasonId);
      } catch (error) {
        console.error('Failed to fetch teams for the season:', error);
      }
    };

    const fetchSeasonDetails = async () => {
        try {
            await seasonStore.fetchSeason(seasonId);
        } catch (error) {
            console.error('Failed to fetch season details:', error);
        }
    };
  
    onMounted(() => {
        fetchSeasonDetails();
        fetchMatches(1);
        fetchTeams();
    });
  
    return { 
        season: computed(() => seasonStore.current_season),
        matches: computed(() => matchStore.matches),
        teams: computed(() => teamStore.teams),
        fetchMatches,
        fetchTeams,
        selectedWeek,
        };
    },
  };
  </script>
  