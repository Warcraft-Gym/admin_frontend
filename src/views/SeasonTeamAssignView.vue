<template>
  <div>

    <!-- Top: Filters + Draft players for season -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <div class="d-flex align-center" style="width:100%">
              <div class="d-flex align-center">
                <v-icon left icon="mdi-account-multiple"></v-icon>
                Draft players for Season: {{ seasonName }}
              </div>
              <v-spacer></v-spacer>
              <div>
                <v-btn
                  small
                  color="green"
                  @click="syncAllDraftPlayers"
                  :loading="syncAllLoading"
                >
                  <v-icon left>mdi-sync</v-icon>
                  Sync wc3 info
                </v-btn>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <v-text-field v-model="searchName" label="Search name" density="compact"></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-select
                  v-model="searchRace"
                  :items="races"
                  item-title="name"
                  item-value="name"
                  clearable
                  label="Race"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="3">
                <v-range-slider
                  v-model="rangeValues"
                  :min="0"
                  :max="3000"
                  step="10"
                  hide-details
                  density="compact"
                >
                  <template v-slot:prepend>
                    <v-text-field v-model="rangeValues[0]" density="compact" disabled single-line type="number"></v-text-field>
                  </template>
                  <template v-slot:append>
                    <v-text-field v-model="rangeValues[1]" density="compact" disabled single-line type="number"></v-text-field>
                  </template>
                </v-range-slider>
              </v-col>
              <v-col cols="3" class="d-flex align-center">
                <v-btn color="primary" @click="clearFilters">Clear filters</v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="playerTableHeaders"
              :items="availablePlayers"
              return-object
              v-model="selectedPlayers"
              @update:selected="onSelectedUpdate"
              show-select
              dense
            >
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
                        <v-icon v-bind="props" small color="red" style="cursor:pointer" @click.stop.prevent="syncSinglePlayer(item)">mdi-alert-circle</v-icon>
                      </template>
                      <span>{{ perPlayerSyncStatus[item.id].message || 'Sync failed — click to retry' }}</span>
                    </v-tooltip>
                  </template>
                </div>
              </template>
              <template #no-data>
                <div>No available signed-up players for this season.</div>
              </template>
            </v-data-table>

            <v-row class="mt-2">
              <v-col cols="12">
                <v-btn color="primary" @click="clearFilters">Clear filters</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Player details dialog (open when clicking a player's name) -->
    <v-dialog v-model="showPlayerDetails" max-width="65vw">
      <v-card>
        <v-card-title>Player Details</v-card-title>
        <v-card-text>
          <div v-if="playerDetails">
            <v-table border density="compact" class="pb-2">
              <tbody>
                <tr>
                  <td><strong>Name</strong></td>
                  <td>{{ playerDetails.name }}</td>
                </tr>
                <tr v-if="playerDetails.battleTag">
                  <td><strong>BattleTag</strong></td>
                  <td>{{ playerDetails.battleTag }}</td>
                </tr>
                <tr v-if="playerDetails.country">
                  <td><strong>Country</strong></td>
                  <td>{{ playerDetails.country }}</td>
                </tr>
              </tbody>
            </v-table>

            <h3>W3C Stats</h3>
            <v-data-table :items="playerDetails.w3c_stats || []" dense hide-default-footer>
              <template #item.race="{ item }">
                <RaceIcon :raceIdentifier="item.race" />
              </template>
              <template #item.mmr="{ item }">
                <div>{{ item.mmr }}</div>
              </template>
              <template #no-data>
                <div>No W3C stats available.</div>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showPlayerDetails = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Teams grid below -->
    <v-row>
      <v-col cols="12">
        <div class="teams-grid" :style="{ gridTemplateColumns: `repeat(${colsCount}, 1fr)` }">
          <div v-for="team in teams" :key="team.id" class="team-card-grid">
            <v-card>
              <v-card-title>
                <div class="d-flex justify-space-between align-center" style="width:100%">
                  <div>
                    <v-icon left icon="mdi-account-group"></v-icon>
                    {{ team.name }}
                  </div>
                  <div>
                    <v-btn
                      icon
                      small
                      color="green"
                      @click="addSelectedToTeam(team.id)"
                      :disabled="selectedCount === 0 || isAddLoading(team.id)"
                      :loading="isAddLoading(team.id)"
                    >
                      <template v-if="!isAddLoading(team.id)">
                        <v-icon small>mdi-plus</v-icon>
                      </template>
                    </v-btn>
                  </div>
                </div>
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
                                <v-icon v-bind="props" small color="red" style="cursor:pointer" @click.stop.prevent="syncSinglePlayer(p)">mdi-alert-circle</v-icon>
                              </template>
                              <span>{{ perPlayerSyncStatus[p.id].message || 'Sync failed — click to retry' }}</span>
                            </v-tooltip>
                          </template>
                        </div>
                        <div class="text--secondary">{{ p.mmr }} — <RaceIcon :raceIdentifier="p.race" /></div>
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
  </div>
</template>

<script setup>
import '@/assets/base.css';
import { computed, onMounted, ref } from 'vue';
import { usePlayerStore, useTeamStore, useSeasonStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

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

const searchName = ref('');
const searchRace = ref(null);
const races = ref([
  { name: 'HU' },
  { name: 'OC' },
  { name: 'UD' },
  { name: 'NE' }
]);
const rangeValues = ref([0, 3000]);
// selectedPlayers holds selected player objects from the table (Vuetify may return an Array or a Set)
const selectedPlayers = ref([]);

// per-player sync status: { state: 'idle'|'loading'|'success'|'error', message?: string }
const perPlayerSyncStatus = ref({});

// normalize selected count (works for Array, Set, or object)
const selectedCount = computed(() => {
  const s = selectedPlayers.value;
  if (!s) return 0;
  if (Array.isArray(s)) return s.length;
  if (s instanceof Set) return s.size;
  if (typeof s === 'object') return Object.keys(s).length;
  return 0;
});

const playerTableHeaders = [
  { title: 'ID', value: 'id' },
  { title: 'Name', value: 'name' },
  { title: 'MMR', value: 'mmr' },
  { title: 'Race', value: 'race' },
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

// columns for teams grid: if exactly 8 teams -> show 4 columns (will wrap to two rows);
// otherwise show all teams side-by-side (one column per team)
const colsCount = computed(() => {
  const n = (teams.value || []).length;
  if (n === 8) return 4; // two rows of 4
  return Math.max(1, n); // side-by-side for fewer than 8 teams
});

// fetch data
const fetchData = async () => {
  await Promise.all([
    playerStore.fetchPlayers(),
    teamStore.fetchTeams ? teamStore.fetchTeams() : Promise.resolve(),
    seasonStore.fetchSeasons ? seasonStore.fetchSeasons() : Promise.resolve()
  ]);
};

onMounted(() => {
  fetchData();
});

// players signed up for this season
const signedUpPlayers = computed(() => {
  const sid = String(seasonId.value);
  return (players.value || []).filter(p => (p.signup_seasons || []).some(s => String(s.id) === sid));
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

// capture selection emitted by v-data-table (varies by Vuetify version)
const onSelectedUpdate = (val) => {
  console.debug('v-data-table update:selected payload:', val);
  selectedPlayers.value = val;
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

const isAddLoading = (teamId) => {
  return !!addLoading.value[teamId];
};
const isRemoveLoading = (teamId, playerId) => {
  return !!removeLoading.value[`${teamId}_${playerId}`];
};

const addSelectedToTeam = async (teamId) => {
    console.log("addSelectedToTeam: ", selectedPlayers.value);
  const sel = selectedPlayers.value;
  if (!sel) return;
  // support Array, Set or array-of-ids
  let ids = [];
  if (Array.isArray(sel)) {
    // sel might be array of objects or ids
    if (sel.length > 0 && typeof sel[0] === 'object') ids = sel.map(p => p.id);
    else ids = sel.map(p => p);
  } else if (sel instanceof Set) {
    const arr = Array.from(sel);
    if (arr.length > 0 && typeof arr[0] === 'object') ids = arr.map(p => p.id);
    else ids = arr.map(p => p);
  } else if (typeof sel === 'object') {
    // object-like map
    ids = Object.values(sel).map(v => (typeof v === 'object' ? v.id : v));
  }
  if (!ids || ids.length === 0) return;
  console.debug('Adding players to team', teamId, 'season', seasonId.value, 'ids', ids);
  addLoading.value = { ...addLoading.value, [teamId]: true };
  try {
    if (teamStore.addPlayersToTeamForSeason) {
      await teamStore.addPlayersToTeamForSeason(teamId, seasonId.value, ids);
    }
    await fetchData();
    // clear selection using same shape
    if (Array.isArray(sel)) selectedPlayers.value = [];
    else if (sel instanceof Set) selectedPlayers.value = new Set();
    else selectedPlayers.value = [];
  } catch (err) {
    console.error('Failed to add players to team:', err);
  } finally {
    addLoading.value = { ...addLoading.value, [teamId]: false };
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

// sync a single player (retryable); sets perPlayerSyncStatus[player.id]
const syncSinglePlayer = async (player) => {
  if (!player || !player.id) return;
  perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [player.id]: { state: 'loading' } };
  try {
    if (playerStore && playerStore.syncW3CPlayer) {
      await playerStore.syncW3CPlayer(player.id);
    }
    perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [player.id]: { state: 'success' } };
    // refresh player data
    await playerStore.fetchPlayers();
  } catch (err) {
    console.error('Failed to sync player', player.id, err);
    const message = err && (err.message || err.msg || err.error) ? (err.message || err.msg || err.error) : (typeof err === 'string' ? err : JSON.stringify(err));
    perPlayerSyncStatus.value = { ...perPlayerSyncStatus.value, [player.id]: { state: 'error', message } };
  }
};

// sync only players signed up for the current season
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
    // refresh players/teams after all
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
