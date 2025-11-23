<template>
  <v-container fluid class="pa-4">
    <!-- Page Header -->
    <v-row class="mb-4">
      <v-col>
        <h1>
          <v-icon class="mr-2">mdi-account-multiple-check</v-icon>
          Draft Players for Season
        </h1>
      </v-col>
    </v-row>

    <!-- Top: Filters + Draft players for season -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="bg-primary d-flex align-center">
        <v-icon class="mr-2">mdi-account-multiple</v-icon>
        <span>{{ seasonName }}</span>
        <v-spacer />
        <v-btn
          variant="elevated"
          color="primary"
          @click="syncAllDraftPlayers"
          :loading="syncAllLoading"
          prepend-icon="mdi-sync"
        >
          Sync W3C Info
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="searchName" 
              label="Search Name" 
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="searchRace"
              :items="races"
              item-title="name"
              item-value="name"
              clearable
              label="Race"
              variant="outlined"
              prepend-inner-icon="mdi-sword"
              density="comfortable"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-subtitle-2 mb-2">MMR Range</div>
            <v-range-slider
              v-model="rangeValues"
              :min="0"
              :max="3000"
              step="10"
              hide-details
              color="primary"
            >
              <template v-slot:prepend>
                <v-text-field 
                  v-model="rangeValues[0]" 
                  density="compact" 
                  single-line 
                  type="number" 
                  hide-spin-buttons 
                  variant="outlined"
                  style="width: 80px;"
                ></v-text-field>
              </template>
              <template v-slot:append>
                <v-text-field 
                  v-model="rangeValues[1]" 
                  density="compact" 
                  single-line 
                  type="number" 
                  hide-spin-buttons 
                  variant="outlined"
                  style="width: 80px;"
                ></v-text-field>
              </template>
            </v-range-slider>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn color="primary" variant="outlined" @click="clearFilters" block>Clear Filters</v-btn>
          </v-col>
        </v-row>

            <v-data-table
              :headers="playerTableHeaders"
              :items="availablePlayers"
              return-object
              dense
            >
              <template #item.team="{ item }">
                <v-select
                  v-model="playerTeamSelection[item.id]"
                  :items="teams"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  clearable
                  hide-details
                  style="min-width: 150px;"
                ></v-select>
              </template>
              <template #item.name="{ item }">
                <div class="d-flex align-center" style="gap:8px;">
                  <span style="cursor: pointer; color: var(--v-theme-primary);" @click="showStats(item)"><strong>{{ item.name }}</strong></span>
                  <template v-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'loading'">
                    <v-icon small class="text--secondary">mdi-sync</v-icon>
                  </template>
                  <template v-else-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'success'">
                    <v-icon small color="green">mdi-check-circle</v-icon>
                  </template>
                  <template v-else-if="perPlayerSyncStatus[item.id] && perPlayerSyncStatus[item.id].state === 'error'">
                    <v-tooltip>
                      <template #activator="{ props }">
                        <v-icon v-bind="props" small color="red">mdi-alert-circle</v-icon>
                      </template>
                      <span>{{ perPlayerSyncStatus[item.id].message || 'Sync failed' }}</span>
                    </v-tooltip>
                  </template>
                </div>
              </template>
              <template #item.mmr="{ item }">
                <div>
                  <div>{{ item.mmr }}</div>
                  <div class="text--secondary" style="font-size: 0.85em;">
                    W3C: {{ getW3CMMR(item) ?? 'N/A' }}
                  </div>
                </div>
              </template>
              <template #item.race="{ item }">
                <RaceIcon :raceIdentifier="item.race" />
              </template>
              <template #no-data>
                <div>No available signed-up players for this season.</div>
              </template>
            </v-data-table>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-account-multiple-plus"
          @click="assignAllPlayers"
          :loading="assignAllLoading"
          :disabled="assignAllLoading || playersWithTeamSelected === 0"
        >
          Assign {{ playersWithTeamSelected }} Player{{ playersWithTeamSelected !== 1 ? 's' : '' }} to Teams
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Player details dialog (open when clicking a player's name) -->
    <PlayerDetailsDialog
      v-model="showPlayerDetails"
      :player="playerDetails"
      :seasonId="seasonId"
    />

    <!-- Teams grid below -->
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">
          <v-icon class="mr-2">mdi-shield-account</v-icon>
          Team Assignments
        </h2>
        <div class="teams-grid" :style="{ gridTemplateColumns: `repeat(${colsCount}, 1fr)` }">
          <div v-for="team in teams" :key="team.id" class="team-card-grid">
            <v-card elevation="2">
              <v-card-title class="bg-primary">
                <v-icon class="mr-2">mdi-shield-account</v-icon>
                {{ team.name }}
              </v-card-title>
              <v-card-text>
                <div>
                  <div v-if="getTeamPlayersForSeason(team).length > 0">
                    <div v-for="p in getTeamPlayersForSeason(team)" :key="p.id" class="team-player" style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;">
                      <div>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="cursor: pointer; color: var(--v-theme-primary);" @click="showStats(p)"><strong>{{ p.name }}</strong></span>
                          <template v-if="perPlayerSyncStatus[p.id] && perPlayerSyncStatus[p.id].state === 'loading'">
                            <v-icon small class="text--secondary">mdi-sync</v-icon>
                          </template>
                          <template v-else-if="perPlayerSyncStatus[p.id] && perPlayerSyncStatus[p.id].state === 'success'">
                            <v-icon small color="green">mdi-check-circle</v-icon>
                          </template>
                          <template v-else-if="perPlayerSyncStatus[p.id] && perPlayerSyncStatus[p.id].state === 'error'">
                            <v-tooltip>
                              <template #activator="{ props }">
                                <v-icon v-bind="props" small color="red">mdi-alert-circle</v-icon>
                              </template>
                              <span>{{ perPlayerSyncStatus[p.id].message || 'Sync failed' }}</span>
                            </v-tooltip>
                          </template>
                        </div>
                        <div class="text--secondary">{{ p.mmr }} — <RaceIcon :raceIdentifier="p.race" /></div>
                        <div class="text--secondary" style="font-size: 0.85em;">W3C: {{ getW3CMMR(p) ?? 'N/A' }}</div>
                      </div>
                      <div style="display:flex;align-items:center;gap:6px;">
                          <v-btn
                            class="table-action ma-0 pa-0"
                            icon
                            density="compact"
                            color="red"
                            @click.stop.prevent="removePlayerFromTeam(team.id, p.id)"
                            :disabled="isRemoveLoading(team.id, p.id)"
                            :loading="isRemoveLoading(team.id, p.id)"
                          >
                            <template v-if="!isRemoveLoading(team.id, p.id)">
                              <v-icon small>mdi-delete</v-icon>
                            </template>
                          </v-btn>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <em>No players assigned for this season</em>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import '@/assets/base.css';
import { computed, onMounted, ref } from 'vue';
import { usePlayerStore, useTeamStore, useSeasonStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import RaceIcon from '@/components/RaceIcon.vue';
import PlayerDetailsDialog from '@/components/PlayerDetailsDialog.vue';

defineOptions({ name: 'SeasonTeamAssignView' });

const router = useRouter();
const seasonId = computed(() => {
  const params = router.currentRoute.value.params || {};
  return params.season_id || params.id || router.currentRoute.value.query.season_id;
});

const playerStore = usePlayerStore();
const teamStore = useTeamStore();
const seasonStore = useSeasonStore();

const { players } = storeToRefs(playerStore);
const { teams } = storeToRefs(teamStore);
const { seasons } = storeToRefs(seasonStore);

// Local state for signed up players
const signedUpPlayersData = ref([]);

const searchName = ref('');
const searchRace = ref(null);
const races = ref([
  { name: 'HU' },
  { name: 'OC' },
  { name: 'UD' },
  { name: 'NE' }
]);
const rangeValues = ref([0, 3000]);

// Track team selection per player
const playerTeamSelection = ref({});

// per-player sync status: { state: 'idle'|'loading'|'success'|'error', message?: string }
const perPlayerSyncStatus = ref({});

const playerTableHeaders = [
  { title: 'ID', value: 'id' },
  { title: 'Name', value: 'name' },
  { title: 'MMR', value: 'mmr' },
  { title: 'Race', value: 'race' },
  { title: 'Team', value: 'team', sortable: false },
];

// compute assigned player ids across all teams for this season
const assignedPlayerIds = computed(() => {
  const sid = String(seasonId.value);
  const set = new Set();
  (teams.value || []).forEach(team => {
    const v = team.player_by_season?.[sid] || team.player_by_season?.[Number(sid)];
    if (!v) return;
    if (Array.isArray(v)) v.forEach(p => p && p.id && set.add(p.id));
    else if (typeof v === 'object') Object.values(v).forEach(p => p && p.id && set.add(p.id));
  });
  return set;
});

// available players = signed up players minus assigned players
const availablePlayers = computed(() => {
  return (filteredPlayers.value || []).filter(p => !assignedPlayerIds.value.has(p.id));
});

// Count players with team selected
const playersWithTeamSelected = computed(() => {
  return Object.values(playerTeamSelection.value).filter(teamId => teamId != null).length;
});

// columns for teams grid: if exactly 8 teams -> show 4 columns (will wrap to two rows);
// otherwise show all teams side-by-side (one column per team)
const colsCount = computed(() => {
  const n = (teams.value || []).length;
  if (n === 8) return 4; // two rows of 4
  return Math.max(1, n); // side-by-side for fewer than 8 teams
});

// fetch data — prefer fetching teams for the specific season when seasonId is available
const fetchData = async () => {
  await Promise.all([
    (seasonId.value && teamStore.fetchTeamsBySeason)
      ? teamStore.fetchTeamsBySeason(seasonId.value)
      : (teamStore.fetchTeams ? teamStore.fetchTeams() : Promise.resolve()),
    seasonStore.fetchSeasons ? seasonStore.fetchSeasons() : Promise.resolve()
  ]);
  
  // Fetch signed up users separately
  if (seasonId.value && seasonStore.fetchSeasonSignups) {
    try {
      signedUpPlayersData.value = await seasonStore.fetchSeasonSignups(seasonId.value);
    } catch (err) {
      console.error('Failed to fetch season signups:', err);
      signedUpPlayersData.value = [];
    }
  }
};

onMounted(() => {
  fetchData();
});

const seasonName = computed(() => {
  const sid = String(seasonId.value);
  const season = (seasons.value || []).find(s => String(s.id) === sid);
  return season ? season.name : '';
});

// players signed up for this season - from local data fetched separately
const signedUpPlayers = computed(() => {
  return signedUpPlayersData.value || [];
});

const filteredPlayers = computed(() => {
  let list = signedUpPlayers.value || [];
  if (searchName.value && searchName.value.trim().length > 0) {
    const q = searchName.value.trim().toLowerCase();
    list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.battleTag || '').toLowerCase().includes(q));
  }
  if (searchRace.value) list = list.filter(p => p.race === searchRace.value);
  if (Array.isArray(rangeValues.value) && rangeValues.value.length === 2) {
    const min = Number(rangeValues.value[0] ?? 0);
    const max = Number(rangeValues.value[1] ?? 3000);
    list = list.filter(p => {
      const mmr = Number(p.mmr ?? 0);
      return mmr >= min && mmr <= max;
    });
  }
  return list;
});

const clearFilters = () => {
  searchName.value = '';
  searchRace.value = null;
  rangeValues.value = [0, 3000];
};

// player details dialog state (open by clicking a player's name)
const showPlayerDetails = ref(false);
const playerDetails = ref(null);

const showStats = async (player) => {
  playerDetails.value = player;
  showPlayerDetails.value = true;
};

// Get W3C MMR for player's signed up race
const getW3CMMR = (player) => {
  if (!player || !player.race || !player.w3c_stats) return null;
  const w3cStat = player.w3c_stats.find(s => s.race === player.race);
  return w3cStat?.mmr ?? null;
};

function getTeamPlayersForSeason(team) {
  const sid = String(seasonId.value);
  if (!team || !team.player_by_season) return [];
  const v = team.player_by_season[sid] || team.player_by_season[Number(sid)];
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'object') return Object.values(v);
  return [];
}

// per-team loading state to avoid double-clicks
const addLoading = ref({});
const removeLoading = ref({});
const syncAllLoading = ref(false);
const assignAllLoading = ref(false);

const isAddLoading = (teamId) => {
  return !!addLoading.value[teamId];
};
const isRemoveLoading = (teamId, playerId) => {
  return !!removeLoading.value[`${teamId}_${playerId}`];
};

const assignAllPlayers = async () => {
  assignAllLoading.value = true;
  try {
    // Group players by team
    const playersByTeam = {};
    for (const [playerId, teamId] of Object.entries(playerTeamSelection.value)) {
      if (teamId != null) {
        if (!playersByTeam[teamId]) {
          playersByTeam[teamId] = [];
        }
        playersByTeam[teamId].push(parseInt(playerId));
      }
    }

    // Add players to each team
    for (const [teamId, playerIds] of Object.entries(playersByTeam)) {
      if (playerIds.length > 0) {
        await teamStore.addPlayersToTeamForSeason(parseInt(teamId), seasonId.value, playerIds);
      }
    }

    // Clear selections and refresh
    playerTeamSelection.value = {};
    await fetchData();
  } catch (err) {
    console.error('Failed to assign players to teams:', err);
  } finally {
    assignAllLoading.value = false;
  }
};

const removePlayerFromTeam = async (teamId, playerId) => {
  removeLoading.value = { ...removeLoading.value, [`${teamId}_${playerId}`]: true };
  try {
    if (teamStore.removePlayersFromTeamForSeason) {
      await teamStore.removePlayersFromTeamForSeason(teamId, seasonId.value, [playerId]);
    }
    await fetchData();
  } catch (err) {
    console.error('Failed to remove player from team:', err);
  } finally {
    removeLoading.value = { ...removeLoading.value, [`${teamId}_${playerId}`]: false };
  }
};

// sync all players in teams for the current season
const syncAllDraftPlayers = async () => {
  syncAllLoading.value = true;
  try {
    const list = signedUpPlayers.value || [];
    for (const p of list) {
      // mark loading for each player and call player store sync
      perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [p.id]: { state: 'loading' } };
      try {
        if (playerStore && playerStore.syncW3CPlayer) {
          await playerStore.syncW3CPlayer(p.id);
        }
        perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [p.id]: { state: 'success' } };
      } catch (err) {
        console.error('Failed to sync player', p.id, err);
        const message = err && (err.message || err.msg || err.error) ? (err.message || err.msg || err.error) : (typeof err === 'string' ? err : JSON.stringify(err));
        perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [p.id]: { state: 'error', message } };
      }
    }
    // refresh teams after all syncs
    await fetchData();
  } finally {
    syncAllLoading.value = false;
  }
};
</script>

<style scoped>
/* small spacing tweaks */
.v-card { margin-bottom: 12px }
 .teams-grid {
   display: grid;
   gap: 12px;
 }
 .team-card-grid {
   display: block;
 }
 .team-player .v-icon {
   font-size: 14px;
 }
</style>
