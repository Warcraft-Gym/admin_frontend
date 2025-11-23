<template>
  <v-overlay v-model="isLoading" contained class="align-center justify-center">
    <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
  </v-overlay>

  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col>
        <h1><v-icon class="mr-2">mdi-view-dashboard</v-icon> Player Dashboard</h1>
      </v-col>
    </v-row>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      border-color="red"
      class="mb-4"
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      border="start"
      border-color="green"
      class="mb-4"
      closable
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>
    <v-card v-if="!isLoading && playerData" elevation="2" class="mb-6">
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-account-circle</v-icon>
        Player Information
      </v-card-title>
      <v-card-text class="pt-4">
        <v-chip color="secondary" class="mb-2">
          {{ playerData.discord_tag }}
        </v-chip>
        <h2 class="text-h5 mb-2">{{ playerData.player.name }}</h2>
        <p><strong>Battle Tag:</strong> {{ playerData.player.battleTag }}</p>
        <p><strong>Race:</strong> {{ playerData.player.race }}</p>
        <p><strong>MMR:</strong> {{ playerData.player.mmr }}</p>
        <p v-if="playerData.player.country"><strong>Country:</strong> {{ playerData.player.country }}</p>
      </v-card-text>
    </v-card>

    <v-card v-if="!isLoading && playerData" elevation="2">
      <v-card-title class="bg-primary d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-tournament</v-icon>
          <span>My Series</span>
        </div>
        <v-chip color="white" variant="outlined">
          {{ series.length }} series
        </v-chip>
      </v-card-title>
      
      <v-card-text class="pa-0">
      <v-data-table
        :headers="headers"
        :items="series"
        :loading="isLoading"
        class="elevation-1"
        item-key="id"
      >
        <template #item.opponent="{ item }">
          <span v-if="item.player1_id === playerData.player.id">
            {{ item.player2?.name || `Player ${item.player2_id}` }}
          </span>
          <span v-else>
            {{ item.player1?.name || `Player ${item.player1_id}` }}
          </span>
        </template>

        <template #item.score="{ item }">
          <v-chip
            :color="getScoreColor(item)"
            variant="outlined"
            size="small"
          >
            {{ item.player1_score || 0 }} - {{ item.player2_score || 0 }}
          </v-chip>
        </template>

        <template #item.date_time="{ item }">
          {{ formatDateTime(item.date_time) }}
        </template>

        <template #item.week="{ item }">
          {{ item.match?.playday || 'TBD' }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            prepend-icon="mdi-calendar-edit"
            @click="editSchedule(item)"
            :loading="scheduleSavingId === item.id"
            :disabled="scheduleSavingId === item.id || scoreSavingId === item.id"
          >
            Edit Schedule
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            size="small"
            prepend-icon="mdi-trophy"
            class="ml-2"
            @click="reportResult(item)"
            :loading="scoreSavingId === item.id"
            :disabled="scoreSavingId === item.id || scheduleSavingId === item.id"
          >
            Report Result
          </v-btn>
        </template>
      </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- Schedule Dialog -->
  <v-dialog v-model="scheduleDialog" max-width="500px">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-calendar-edit</v-icon>
        Edit Schedule
      </v-card-title>
      <v-card-text class="pt-4">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Enter time in your local timezone ({{ userTimezone }}).
        </v-alert>
        <v-form ref="scheduleForm" v-model="scheduleFormValid">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <SimpleDatePicker v-model="scheduleSeries.date" label="Date" />
              </v-col>
              <v-col cols="12" md="6">
                <SimpleTimePicker v-model="scheduleSeries.time" :label="`Time (${userTimezone})`" />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeSchedule" :disabled="scheduleSavingId === scheduleSeries.id">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-content-save" :disabled="!isScheduleValid || scheduleSavingId === scheduleSeries.id" :loading="scheduleSavingId === scheduleSeries.id" @click="saveSchedule">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Report Result Dialog -->
  <v-dialog v-model="scoreDialog" max-width="600px">
    <v-card>
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-trophy</v-icon>
        Report Result
      </v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="scoreForm" v-model="scoreFormValid">
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field 
                  v-model="scoreSeries.player1_score" 
                  label="Your Score" 
                  variant="outlined"
                  prepend-inner-icon="mdi-numeric"
                  type="number" 
                  min="0" 
                />
              </v-col>
              <v-col cols="6">
                <v-text-field 
                  v-model="scoreSeries.player2_score" 
                  label="Opponent Score" 
                  variant="outlined"
                  prepend-inner-icon="mdi-numeric"
                  type="number" 
                  min="0" 
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-file-input 
                  v-model="scoreSeries.game1File" 
                  label="Game 1 Replay" 
                  variant="outlined"
                  accept=".w3g" 
                  prepend-icon="mdi-file-upload" 
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-file-input 
                  v-model="scoreSeries.game2File" 
                  label="Game 2 Replay" 
                  variant="outlined"
                  accept=".w3g" 
                  prepend-icon="mdi-file-upload" 
                />
              </v-col>
            </v-row>
            <v-row v-if="needsGame3">
              <v-col cols="12">
                <v-file-input 
                  v-model="scoreSeries.game3File" 
                  label="Game 3 Replay" 
                  variant="outlined"
                  accept=".w3g" 
                  prepend-icon="mdi-file-upload" 
                  :rules="[rules.required]" 
                  required 
                  :hint="'Required for 2:1 or 1:2 results'" 
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeScore" :disabled="scoreSavingId === scoreSeries.id">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-content-save" :disabled="!isScoreValid || scoreSavingId === scoreSeries.id" :loading="scoreSavingId === scoreSeries.id" @click="saveResult">Save Result</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import '@/assets/base.css';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchWrapper } from '@/helpers';
import SimpleTimePicker from '@/components/SimpleTimePicker.vue';
import SimpleDatePicker from '@/components/SimpleDatePicker.vue';
import { DateTime } from 'luxon';

defineOptions({ name: 'PlayerDashboardView' })

const route = useRoute();
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// State
const isLoading = ref(true);
const errorMessage = ref(null);
const successMessage = ref(null);
const playerData = ref(null);
const series = ref([]);
const token = ref(null);

// Schedule / Result dialog state
const scheduleDialog = ref(false);
const scoreDialog = ref(false);
const scheduleFormValid = ref(true);
const scoreFormValid = ref(true);
const scheduleForm = ref(null);
const scoreForm = ref(null);
const scheduleSeries = ref({});
const scoreSeries = ref({});
// Per-series saving state (store id of series currently being saved)
const scheduleSavingId = ref(null);
const scoreSavingId = ref(null);

// User's timezone for display
const userTimezone = computed(() => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
});

// Validation rules
const rules = {
  required: (value) => !!value || 'This field is required'
};

const headers = [
  { title: 'Opponent', key: 'opponent', sortable: false },
  { title: 'Date & Time', key: 'date_time', sortable: true },
  { title: 'Score', key: 'score', sortable: false },
  { title: 'Week', key: 'week', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Load player dashboard data
const fetchPlayerData = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  
  try {
    token.value = route.query.token;
    
    if (!token.value) {
      errorMessage.value = 'No access token provided';
      return;
    }

    // Validate token first
    const tokenResponse = await fetchWrapper.get(`${backendUrl}/public-token/${token.value}`);
    if (tokenResponse.access_type !== 'dashboard') {
      errorMessage.value = 'Invalid access token type';
      return;
    }

    // Get player series data
    const response = await fetchWrapper.get(`${backendUrl}/player-series?token=${token.value}`);
    playerData.value = response;
    series.value = response.series || [];

  } catch (error) {
    console.error('Error fetching player data:', error);
    if (error?.message?.includes('token_not_found_or_expired')) {
      errorMessage.value = 'Access link has expired. Please request a new one from Discord.';
    } else if (error?.message?.includes('player_not_found')) {
      errorMessage.value = 'Player not found. Please make sure you have signed up first.';
    } else {
      errorMessage.value = 'Error loading player dashboard. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchFantasyData = async () => {
  if (!playerData.value?.player?.id) return;

  try {
    // Check if player is a fantasy team captain
    const teams = await fantasyStore.fetchTeams();
    fantasyTeam.value = teams.find(t => t.captain_id === playerData.value.player.id);

    if (!fantasyTeam.value) return; // Not a captain

    // Fetch fantasy series (where is_fantasy_match = true and no score)
    const seasonId = playerData.value.season_id;
    if (seasonId) {
      const allSeriesResponse = await fetchWrapper.get(`${backendUrl}/series/season/${seasonId}`);
      fantasySeries.value = allSeriesResponse.filter(s => 
        s.is_fantasy_match === true
      );
    }

    // Fetch user's fantasy bets
    const betsQuery = `user_id == ${playerData.value.player.id}`;
    fantasyBets.value = await fantasyStore.searchBets(betsQuery);

  } catch (error) {
    console.error('Error fetching fantasy data:', error);
    // Don't show error to user, fantasy is optional
  }
};

// Fantasy betting handlers
const placeBet = (series) => {
  betSeries.value = series;
  selectedBetWinnerId.value = series.myBet?.winner_id || null;
  betDialog.value = true;
};

const closeBet = () => {
  betDialog.value = false;
  betSeries.value = {};
  selectedBetWinnerId.value = null;
};

const saveBet = async () => {
  isBetSaving.value = true;
  try {
    const betData = {
      series_id: betSeries.value.id,
      season_id: playerData.value.season_id,
      user_id: playerData.value.player.id,
      winner_id: selectedBetWinnerId.value,
      bet_points: 0, // Will be calculated by backend
      bet_result: null // Will be determined when series is complete
    };

    if (betSeries.value.myBet) {
      // Update existing bet
      await fantasyStore.updateBet(betSeries.value.myBet.id, betData);
      successMessage.value = 'Bet updated successfully!';
    } else {
      // Create new bet
      await fantasyStore.createBet(betData);
      successMessage.value = 'Bet placed successfully!';
    }

    closeBet();
    await fetchFantasyData(); // Refresh fantasy data
  } catch (error) {
    console.error('Error saving bet:', error);
    errorMessage.value = error.message || 'Error saving bet. Please try again.';
  } finally {
    isBetSaving.value = false;
  }
};

// Format date/time for display
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'Not set';
  try {
    // Backend stores datetime in ET as naive datetime (e.g., "2025-01-15 18:00:00")
    // Parse it as ET and display in user's local timezone
    const dt = DateTime.fromISO(dateTimeStr, { zone: 'America/New_York' });
    
    if (!dt.isValid) return dateTimeStr;
    
    // Convert to user's local timezone and format
    return dt.toLocal().toLocaleString({
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return dateTimeStr;
  }
};

// Get score color based on win/loss
const getScoreColor = (item) => {
  const isPlayer1 = item.player1_id === playerData.value?.player?.id;
  const myScore = isPlayer1 ? (item.player1_score || 0) : (item.player2_score || 0);
  const oppScore = isPlayer1 ? (item.player2_score || 0) : (item.player1_score || 0);
  
  if (myScore > oppScore) return 'success';
  if (myScore < oppScore) return 'error';
  return 'warning';
};

// Edit schedule handlers
const editSchedule = (item) => {
  let date = '';
  let time = '';

  if (item.date_time) {
    // Backend stores datetime in ET as naive datetime (no timezone info)
    // Parse as ET and convert to user's local timezone
    const etDateTime = DateTime.fromISO(item.date_time, { zone: 'America/New_York' });
    
    if (etDateTime.isValid) {
      // Convert to local timezone
      const localDateTime = etDateTime.toLocal();
      
      // Format for pickers
      date = localDateTime.toFormat('MM/dd/yyyy');
      time = localDateTime.toFormat('HH:mm');
    }
  }

  scheduleSeries.value = {
    id: item.id,
    date: date,
    time: time
  };

  scheduleDialog.value = true;
};

const closeSchedule = () => {
  scheduleDialog.value = false;
  scheduleSeries.value = {};
};

const saveSchedule = async () => {
  scheduleSavingId.value = scheduleSeries.value.id;
  try {
    let etDateTime = null;
    if (scheduleSeries.value.date && scheduleSeries.value.time) {
      let year, month, day, hour, minute;
      
      // Handle date: could be a Date object or string (MM/DD/YYYY)
      if (scheduleSeries.value.date instanceof Date) {
        year = scheduleSeries.value.date.getFullYear();
        month = scheduleSeries.value.date.getMonth() + 1;
        day = scheduleSeries.value.date.getDate();
      } else if (typeof scheduleSeries.value.date === 'string' && scheduleSeries.value.date.includes('/')) {
        [month, day, year] = scheduleSeries.value.date.split('/');
        month = parseInt(month);
        day = parseInt(day);
        year = parseInt(year);
      }
      
      // Handle time: could be a Date object or string (HH:mm)
      if (scheduleSeries.value.time instanceof Date) {
        hour = scheduleSeries.value.time.getHours();
        minute = scheduleSeries.value.time.getMinutes();
      } else if (typeof scheduleSeries.value.time === 'string' && scheduleSeries.value.time.includes(':')) {
        [hour, minute] = scheduleSeries.value.time.split(':');
        hour = parseInt(hour);
        minute = parseInt(minute);
      }
      
      if (year && month && day !== undefined && hour !== undefined && minute !== undefined) {
        // Create datetime in user's local timezone
        const localDateTime = DateTime.local(year, month, day, hour, minute);
        
        // Convert to ET timezone
        const etDateTimeObj = localDateTime.setZone('America/New_York');
        
        // Format as required by backend: "YYYY-MM-DD HH:mm:ss"
        etDateTime = etDateTimeObj.toFormat('yyyy-MM-dd HH:mm:ss');
      }
    }

    const formData = new FormData();
    formData.append('token', token.value);
    if (etDateTime) formData.append('date_time', etDateTime);
    formData.append('action', 'scheduled');

    const response = await fetch(`${backendUrl}/player-series/${scheduleSeries.value.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }

    successMessage.value = 'Schedule updated successfully!';
    closeSchedule();
    await fetchPlayerData();
  } catch (error) {
    console.error('Error saving schedule:', error);
    errorMessage.value = error.message || 'Error saving schedule.';
  } finally {
    scheduleSavingId.value = null;
  }
};

// Report result handlers
const reportResult = (item) => {
  scoreSeries.value = {
    id: item.id,
    player1_score: item.player1_score || 0,
    player2_score: item.player2_score || 0,
    game1File: null,
    game2File: null,
    game3File: null
  };

  scoreDialog.value = true;
};

const closeScore = () => {
  scoreDialog.value = false;
  scoreSeries.value = {};
};

const saveResult = async () => {
  scoreSavingId.value = scoreSeries.value.id;
  try {
    const p1 = parseInt(scoreSeries.value.player1_score) || 0;
    const p2 = parseInt(scoreSeries.value.player2_score) || 0;

    const hasGame1File = scoreSeries.value.game1File && scoreSeries.value.game1File instanceof File;
    const hasGame2File = scoreSeries.value.game2File && scoreSeries.value.game2File instanceof File;
    const hasGame3File = scoreSeries.value.game3File && scoreSeries.value.game3File instanceof File;

    if (!hasGame1File || !hasGame2File) {
      errorMessage.value = 'Game 1 and Game 2 replay files are required when reporting a result.';
      return;
    }

    const needG3 = (p1 === 2 && p2 === 1) || (p1 === 1 && p2 === 2);
    if (needG3 && !hasGame3File) {
      errorMessage.value = 'Game 3 replay file is required for 2:1 or 1:2 results.';
      return;
    }

    const formData = new FormData();
    formData.append('token', token.value);
    formData.append('player1_score', p1);
    formData.append('player2_score', p2);
    formData.append('action', 'score_updated');

    if (hasGame1File) formData.append('game1', scoreSeries.value.game1File);
    if (hasGame2File) formData.append('game2', scoreSeries.value.game2File);
    if (hasGame3File) formData.append('game3', scoreSeries.value.game3File);

    const response = await fetch(`${backendUrl}/player-series/${scoreSeries.value.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }

    successMessage.value = 'Result reported successfully!';
    closeScore();
    await fetchPlayerData();
  } catch (error) {
    console.error('Error saving result:', error);
    errorMessage.value = error.message || 'Error reporting result.';
  } finally {
    scoreSavingId.value = null;
  }
};

// Show Game 3 input only when needed (2:1 or 1:2) for the score dialog
const needsGame3 = computed(() => {
  const p1 = Number(scoreSeries.value.player1_score);
  const p2 = Number(scoreSeries.value.player2_score);
  if (Number.isNaN(p1) || Number.isNaN(p2)) return false;
  return (p1 === 2 && p2 === 1) || (p1 === 1 && p2 === 2);
});

// Validate schedule: date and time must be present
const isScheduleValid = computed(() => {
  return !!(scheduleSeries.value && scheduleSeries.value.date && scheduleSeries.value.time);
});

// Validate score: allowed score combinations and required files present
const isScoreValid = computed(() => {
  if (!scoreSeries.value) return false;
  const p1 = parseInt(scoreSeries.value.player1_score);
  const p2 = parseInt(scoreSeries.value.player2_score);
  if (Number.isNaN(p1) || Number.isNaN(p2)) return false;

  const allowed = (
    (p1 === 2 && p2 === 0) ||
    (p1 === 0 && p2 === 2) ||
    (p1 === 2 && p2 === 1) ||
    (p1 === 1 && p2 === 2)
  );
  if (!allowed) return false;

  const hasGame1 = scoreSeries.value.game1File && scoreSeries.value.game1File instanceof File;
  const hasGame2 = scoreSeries.value.game2File && scoreSeries.value.game2File instanceof File;
  if (!hasGame1 || !hasGame2) return false;

  // If it's a 2:1 or 1:2 result, require game3
  if ((p1 === 2 && p2 === 1) || (p1 === 1 && p2 === 2)) {
    const hasGame3 = scoreSeries.value.game3File && scoreSeries.value.game3File instanceof File;
    return !!hasGame3;
  }

  return true;
});

onMounted(() => {
  fetchPlayerData();
});
</script>

<style scoped>
.v-chip {
  margin: 2px;
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>