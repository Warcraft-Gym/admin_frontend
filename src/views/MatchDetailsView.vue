<template>
  <div>
    <h1>Match Details</h1>
    
    <!-- Teams Information -->
    <div v-if="team1">
      <h2>Teams</h2>
      <div>
        <h3>{{ team1.name }}</h3>
        <ul v-if="team1.player_by_season && match.season_id">
          <li v-for="player in team1.player_by_season[match.season_id]" :key="player.id">
            {{ player.name }}
          </li>
        </ul>
      </div>
      <div v-if="team2">
        <h3>{{ team2.name }}</h3>
        <ul v-if="team2.player_by_season && match.season_id">
          <li v-for="player in team2.player_by_season[match.season_id]" :key="player.id">
            {{ player.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Series List -->
    <div v-if="match">
      <h2>Series</h2>
      <v-data-table
        :headers="seriesHeaders"
        :items="series"
        :loading="isLoading"
        fixed-header
        hover
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.player1.name }} </td>
            <td>VS</td>
            <td>{{ item.player2.name }} </td>
            <td>
              <v-btn 
                class="table-action" 
                density="compact" 
                color="red" 
                icon="mdi-trash-can" 
                @click="removeSeries(item.id)"
              ></v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <!-- Create Series -->
    <div>
      <h2>Create New Series</h2>
      <form @submit.prevent="createSeries">
        <div v-if="team1 && team1.player_by_season">
          <label for="player1_id">Select Player from Team 1:</label>
          <select v-model="newSeries.player1_id" id="player1_id">
            <option 
              v-for="player in team1.player_by_season[match.season_id]" 
              :value="player.id" 
              :key="player.id"
            >
              {{ player.name }}
            </option>
          </select>
        </div>
        <div v-if="team2 && team2.player_by_season">
          <label for="player2_id">Select Player from Team 2:</label>
          <select v-model="newSeries.player2_id" id="player2_id">
            <option 
              v-for="player in team2.player_by_season[match.season_id]" 
              :value="player.id" 
              :key="player.id"
            >
              {{ player.name }}
            </option>
          </select>
        </div>
        <button type="submit">Create Series</button>
      </form>
    </div>
  </div>
</template>

<script>
  import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useMatchStore, useSeriesStore, useTeamStore } from '@/stores';

export default {
  name: 'MatchDetailsView',
  setup() {
    const router = useRouter();
    const matchId = router.currentRoute.value.params.id;
    const matchStore = useMatchStore();
    const seriesStore = useSeriesStore();
    const teamStore = useTeamStore();
    const isLoading = ref(false);
    const newSeries = ref({ match_id: matchId, player1_id: null, player2_id: null });
    const team1 = ref({});
    const team2 = ref({});

    const seriesHeaders = [
      { title: 'ID', value: 'id' },
      { title: 'Player 1', value: 'player1.name' },
      { title: '', value: '' },
      { title: 'Player 2', value: 'player2.name' },
      { title: 'Actions', align: 'center' }
    ];

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
        
        team1.value = await teamStore.getTeamDetails(matchStore.match.team1_id);
        team2.value = await teamStore.getTeamDetails(matchStore.match.team2_id);
      } catch (error) {
        console.error('Failed to fetch match details:', error);
      } finally {
        isLoading.value = false;
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
      try {
        await seriesStore.createSeries(newSeries.value);
        await fetchMatchSeries(); // Refresh match details after creation
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
      newSeries,
      seriesHeaders,
      fetchMatchDetails,
      createSeries,
      removeSeries
    };
  }
};
</script>

<style>
.table-action {
  margin-right: 15px;
}
</style>