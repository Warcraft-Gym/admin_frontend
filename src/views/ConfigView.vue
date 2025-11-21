<template>
  <v-overlay v-model="isLoading" persistent absolute>
    <v-progress-circular
      indeterminate
      size="64" 
      width="8"
      color="primary"
    ></v-progress-circular>
  </v-overlay>
  
  <div>
    <h1>Configuration Management</h1>
    
    <!-- Error Message -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      border-color="red"
      class="mx-4 my-2"
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- Success Message -->
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      border="start"
      border-color="green"
      class="mx-4 my-2"
      closable
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>

    <!-- Application Settings Section -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            Application Settings
          </v-card-title>
          <v-card-subtitle>
            Manage application configuration settings stored in the database.
          </v-card-subtitle>
          
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <!-- W3Champions Settings -->
                <v-col cols="12">
                  <h3 class="text-h6 mb-2">Warcraft 3 Champions Integration</h3>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.current_wc3_season"
                    label="Current WC3 Season"
                    hint="Current Warcraft 3 Champions season number"
                    type="number"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.w3c_url"
                    label="W3Champions API URL"
                    hint="Base URL for W3Champions API"
                  ></v-text-field>
                </v-col>

                <!-- GNL Settings -->
                <v-col cols="12" class="mt-4">
                  <h3 class="text-h6 mb-2">GNL League Settings</h3>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="settingsMap.current_gnl_season"
                    :items="seasons"
                    item-title="name"
                    item-value="id"
                    label="Current GNL Season"
                    hint="Active league season"
                    clearable
                  ></v-select>
                </v-col>

                <!-- Public Access Settings -->
                <v-col cols="12" class="mt-4">
                  <h3 class="text-h6 mb-2">Public Access Settings</h3>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settingsMap.signups_enabled"
                    color="primary"
                    label="Player Signups Enabled"
                    hint="Allow new players to sign up"
                    hide-details="auto"
                    true-value="true"
                    false-value="false"
                  ></v-switch>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settingsMap.fantasy_team_creation_enabled"
                    color="primary"
                    label="Fantasy Team Creation Enabled"
                    hint="Allow captains to create fantasy teams"
                    hide-details="auto"
                    true-value="true"
                    false-value="false"
                  ></v-switch>
                </v-col>

                <!-- Fantasy Betting Settings -->
                <v-col cols="12" class="mt-4">
                  <h3 class="text-h6 mb-2">Fantasy Betting Settings</h3>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settingsMap.fantasy_fixed_bet_points"
                    color="primary"
                    label="Use Fixed Bet Points"
                    hint="If enabled, all bets use a fixed point value instead of user input"
                    hide-details="auto"
                    true-value="true"
                    false-value="false"
                  ></v-switch>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.fantasy_bet_points_value"
                    label="Fixed Bet Points Value"
                    hint="Point value for bets when using fixed bet points"
                    type="number"
                    :disabled="settingsMap.fantasy_fixed_bet_points !== 'true'"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.fantasy_min_bet_points"
                    label="Minimum Bet Points"
                    hint="Minimum point value allowed when using custom bet points"
                    type="number"
                    :disabled="settingsMap.fantasy_fixed_bet_points === 'true'"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.fantasy_max_bet_points"
                    label="Maximum Bet Points"
                    hint="Maximum point value allowed when using custom bet points"
                    type="number"
                    :disabled="settingsMap.fantasy_fixed_bet_points === 'true'"
                  ></v-text-field>
                </v-col>

                <!-- Discord Settings -->
                <v-col cols="12" class="mt-4">
                  <h3 class="text-h6 mb-2">Discord Bot Settings</h3>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.captain_coach_role"
                    label="Captain/Coach Role ID"
                    hint="Discord role ID for team captains and coaches"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settingsMap.admin_role"
                    label="Admin Role ID"
                    hint="Discord role ID for administrators"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="settingsMap.signup_channel_id"
                    label="Signup Channel ID"
                    hint="Discord channel for player signups"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="settingsMap.scheduling_channel_id"
                    label="Scheduling Channel ID"
                    hint="Discord channel for match scheduling"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="settingsMap.results_channel_id"
                    label="Results Channel ID"
                    hint="Discord channel for match results"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-content-save"
              @click="saveSettings"
              :loading="isSaving"
              :disabled="isSaving"
            >
              Save Settings
            </v-btn>

            <v-btn
              color="grey"
              variant="tonal"
              prepend-icon="mdi-reload"
              @click="resetSettings"
              :disabled="isSaving"
            >
              Reset
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Info Card -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card color="info" variant="tonal">
          <v-card-title>
            <v-icon icon="mdi-information"></v-icon>
            About Settings
          </v-card-title>
          <v-card-text>
            <ul>
              <li><strong>Database Storage:</strong> Settings are stored in the database and persist across backend restarts.</li>
              <li><strong>Public Access Toggles:</strong> Enable/disable player signups and fantasy team creation independently.</li>
              <li><strong>Discord IDs:</strong> Role and channel IDs can be found by enabling Developer Mode in Discord and right-clicking on roles/channels.</li>
              <li><strong>Current GNL Season:</strong> The current season is used for public player signups, fantasy team registration, and all league operations.</li>
              <li><strong>W3Champions:</strong> The W3C season and URL are used for fetching player statistics and MMR data.</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import '@/assets/base.css';
import { ref, onMounted, computed } from 'vue';
import { useConfigStore, useSeasonStore } from '@/stores';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'ConfigView'
});

const configStore = useConfigStore();
const seasonStore = useSeasonStore();
const { seasons } = storeToRefs(seasonStore);

const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

// Map of setting keys to values
const settingsMap = ref({
  current_wc3_season: '',
  w3c_url: '',
  current_gnl_season: '',
  signups_enabled: 'false',
  fantasy_team_creation_enabled: 'false',
  fantasy_fixed_bet_points: 'false',
  fantasy_bet_points_value: '',
  fantasy_min_bet_points: '',
  fantasy_max_bet_points: '',
  captain_coach_role: '',
  admin_role: '',
  signup_channel_id: '',
  scheduling_channel_id: '',
  results_channel_id: ''
});

// Fetch settings on mount
const fetchSettings = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const settings = await configStore.fetchSettings();
    // Convert settings array to map
    settings.forEach(setting => {
      if (settingsMap.value.hasOwnProperty(setting.key)) {
        // Convert season settings to number for proper v-select matching
        if (setting.key === 'current_gnl_season' && setting.value) {
          settingsMap.value[setting.key] = parseInt(setting.value, 10);
        } 
        // Keep boolean settings as strings "true"/"false" for v-switch
        else if (setting.key === 'signups_enabled' || 
                 setting.key === 'fantasy_team_creation_enabled' || 
                 setting.key === 'fantasy_fixed_bet_points') {
          settingsMap.value[setting.key] = setting.value || 'false';
        }
        else {
          settingsMap.value[setting.key] = setting.value || '';
        }
      }
    });
  } catch (error) {
    errorMessage.value = 'Failed to load settings: ' + error;
  } finally {
    isLoading.value = false;
  }
};

// Save settings
const saveSettings = async () => {
  isSaving.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    // Convert empty strings to null for cleaner database storage
    const settingsToSave = {};
    Object.keys(settingsMap.value).forEach(key => {
      const value = settingsMap.value[key];
      settingsToSave[key] = (value === '' || value === null) ? null : String(value);
    });

    await configStore.updateSettings(settingsToSave);
    successMessage.value = 'Settings saved successfully!';
  } catch (error) {
    errorMessage.value = 'Failed to save settings: ' + error;
  } finally {
    isSaving.value = false;
  }
};

// Reset settings
const resetSettings = async () => {
  await fetchSettings();
  successMessage.value = null;
  errorMessage.value = null;
};

onMounted(async () => {
  await Promise.all([
    fetchSettings(),
    seasonStore.fetchSeasons()
  ]);
});
</script>

<style scoped>
ul {
  padding-left: 20px;
}

ul li {
  margin-bottom: 8px;
}
</style>
