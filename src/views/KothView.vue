<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h3 font-weight-bold">
          <v-icon class="mr-2" size="large">mdi-crown</v-icon>
          King of the Hill Management
        </h1>
      </v-col>
    </v-row>

    <v-overlay v-model="isLoading" persistent class="loading-overlay">
      <v-progress-circular indeterminate size="64" width="8" color="primary" />
    </v-overlay>

    <!-- Error Message -->
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = null">
      {{ errorMessage }}
    </v-alert>

    <!-- Event Selection and Info -->
    <v-expansion-panels class="mb-4">
      <v-expansion-panel elevation="2">
        <v-expansion-panel-title class="bg-primary">
          <v-icon class="mr-2">mdi-trophy</v-icon>
          Event Management
        </v-expansion-panel-title>
        
        <v-expansion-panel-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedEventId"
                :items="events"
                item-title="name"
                item-value="id"
                label="Select Event"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                @update:model-value="loadEventData"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon v-if="item.raw.is_active" color="success">mdi-check-circle</v-icon>
                      <v-icon v-else color="grey">mdi-circle-outline</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="6" class="d-flex gap-2">
              <v-btn variant="elevated" color="primary" prepend-icon="mdi-plus" @click="openCreateEventDialog">
                New Event
              </v-btn>
              <v-btn v-if="selectedEvent" variant="outlined" color="secondary" prepend-icon="mdi-pencil" @click="openEditEventDialog">
                Edit Event
              </v-btn>
              <v-btn v-if="selectedEvent && !selectedEvent.is_active" variant="outlined" color="success" prepend-icon="mdi-check" @click="activateEvent">
                Activate
              </v-btn>
            </v-col>
          </v-row>

          <v-divider v-if="selectedEvent" class="my-4"></v-divider>

          <v-row v-if="selectedEvent">
            <v-col cols="12" md="3">
              <div class="text-subtitle-2 text-grey">Event Date</div>
              <div class="mt-2">{{ formatEventDate(selectedEvent.event_date) }}</div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-subtitle-2 text-grey">Bracket Thresholds</div>
              <div class="mt-2">
                <div><strong>Bracket 1:</strong> &lt; {{ selectedEvent.bracket_1_threshold }} MMR</div>
                <div><strong>Bracket 2:</strong> {{ selectedEvent.bracket_1_threshold }} - {{ selectedEvent.bracket_2_threshold - 1 }} MMR</div>
                <div><strong>Bracket 3:</strong> ≥ {{ selectedEvent.bracket_2_threshold }} MMR</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-subtitle-2 text-grey">Signups</div>
              <div class="text-h4 mt-2">{{ activeSignups.length }}</div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-subtitle-2 text-grey">Matches</div>
              <div class="text-h4 mt-2">{{ matches.length }}</div>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <template v-if="selectedEvent">
      <!-- Tabs for different views -->
      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="signups">
          <v-icon class="mr-2">mdi-account-multiple</v-icon>
          Signups
        </v-tab>
        <v-tab value="matches">
          <v-icon class="mr-2">mdi-sword-cross</v-icon>
          Matches
        </v-tab>
        <v-tab value="brackets">
          <v-icon class="mr-2">mdi-trophy-variant</v-icon>
          Bracket Overview
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Signups Tab -->
        <v-window-item value="signups">
          <v-card elevation="2">
            <v-card-title class="bg-primary d-flex align-center justify-space-between">
              <div>
                <v-icon class="mr-2">mdi-account-multiple</v-icon>
                Player Signups
              </div>
              <v-btn variant="elevated" color="white" size="small" prepend-icon="mdi-plus" @click="openAddSignupDialog">
                Add Signup
              </v-btn>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <v-data-table
                :headers="signupHeaders"
                :items="activeSignups"
                :loading="isLoading"
                fixed-header
                hover
                density="comfortable"
                :items-per-page="25"
              >
                <template #[`item.is_king`]="{ item }">
                  <v-chip v-if="item.is_king" color="warning" size="small">
                    <v-icon start>mdi-crown</v-icon>
                    King
                  </v-chip>
                </template>

                <template #[`item.bracket`]="{ item }">
                  <v-chip :color="getBracketColor(item.bracket)" size="small">
                    Bracket {{ item.bracket }}
                  </v-chip>
                </template>

                <template #[`item.actions`]="{ item }">
                  <v-menu location="bottom end">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="openBracketChangeDialog(item)" prepend-icon="mdi-swap-horizontal">
                        <v-list-item-title>Change Bracket</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item v-if="!item.is_king" @click="setAsKing(item.id)" prepend-icon="mdi-crown">
                        <v-list-item-title>Set as King</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">Replaces existing king</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="!item.is_king" @click="addAsKing(item.id)" prepend-icon="mdi-crown-outline">
                        <v-list-item-title>Add as King</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">Keeps existing kings</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-else @click="removeKing(item.id)" prepend-icon="mdi-crown-off">
                        <v-list-item-title>Remove King</v-list-item-title>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item @click="deleteSignup(item.id)" prepend-icon="mdi-delete" class="text-error">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template #no-data>
                  <div class="text-center pa-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
                    <div class="text-h6 mt-4 text-grey">No signups yet</div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Matches Tab -->
        <v-window-item value="matches">
          <v-card elevation="2">
            <v-card-title class="bg-primary d-flex align-center justify-space-between">
              <div>
                <v-icon class="mr-2">mdi-sword-cross</v-icon>
                Matches
              </div>
              <v-btn variant="elevated" color="white" size="small" prepend-icon="mdi-plus" @click="openCreateMatchDialog">
                Create Match
              </v-btn>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <v-data-table
                :headers="matchHeaders"
                :items="matches"
                :loading="isLoading"
                fixed-header
                hover
                density="comfortable"
                :items-per-page="25"
              >
                <template #[`item.bracket`]="{ item }">
                  <v-chip :color="getBracketColor(item.bracket)" size="small">
                    Bracket {{ item.bracket }}
                  </v-chip>
                </template>

                <template #[`item.game_mode`]="{ item }">
                  <v-chip size="small" variant="outlined">
                    {{ item.game_mode }}
                  </v-chip>
                </template>

                <template #[`item.teams`]="{ item }">
                  <div v-if="item.participants && item.participants.length > 0" class="py-2">
                    <div v-for="teamNum in item.num_teams" :key="teamNum" class="mb-1">
                      <strong>Team {{ teamNum }}:</strong>
                      <span class="ml-2">
                        {{ getTeamPlayers(item, teamNum).map(p => p.signup?.twitch_username || p.signup?.battle_tag || 'Unknown').join(', ') }}
                      </span>
                    </div>
                  </div>
                  <span v-else class="text-grey">No participants</span>
                </template>

                <template #[`item.winner`]="{ item }">
                  <v-chip v-if="item.winner_team_number" color="success" size="small">
                    Team {{ item.winner_team_number }}
                  </v-chip>
                  <span v-else class="text-grey">TBD</span>
                </template>

                <template #[`item.actions`]="{ item }">
                  <v-menu location="bottom end">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="openSetWinnerDialog(item)" prepend-icon="mdi-trophy">
                        <v-list-item-title>Set Winner</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deleteMatch(item.id)" prepend-icon="mdi-delete" class="text-error">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template #no-data>
                  <div class="text-center pa-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-sword-cross</v-icon>
                    <div class="text-h6 mt-4 text-grey">No matches yet</div>
                    <v-btn color="primary" variant="tonal" class="mt-4" prepend-icon="mdi-plus" @click="openCreateMatchDialog">
                      Create First Match
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Brackets Tab -->
        <v-window-item value="brackets">
          <v-row>
            <v-col v-for="bracket in [1, 2, 3]" :key="bracket" cols="12" md="4">
              <v-card elevation="2">
                <v-card-title :class="`bg-${getBracketColor(bracket)}`">
                  <v-icon class="mr-2">mdi-trophy</v-icon>
                  Bracket {{ bracket }}
                </v-card-title>
                
                <v-card-text>
                  <div class="text-subtitle-2 text-grey mb-2">
                    {{ getBracketThresholdText(bracket) }}
                  </div>
                  
                  <v-divider class="my-3"></v-divider>
                  
                  <div v-if="kings[bracket] && kings[bracket].length > 0" class="mb-4 pa-3" style="background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107;">
                    <div class="text-subtitle-2 mb-2">
                      <v-icon color="warning" size="small" class="mr-1">mdi-crown</v-icon>
                      King{{ kings[bracket].length > 1 ? 's' : '' }}
                    </div>
                    <div v-for="king in kings[bracket]" :key="king.id" class="d-flex align-center mb-2">
                      <div class="ml-6">
                        <div class="font-weight-bold">{{ king.twitch_username || king.battle_tag }}</div>
                        <div class="text-caption text-grey">{{ king.mmr }} MMR</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-subtitle-2 mb-2">Players ({{ getBracketSignups(bracket).filter(s => !s.is_king).length }})</div>
                  <v-list density="compact">
                    <v-list-item
                      v-for="signup in getBracketSignups(bracket).filter(s => !s.is_king)"
                      :key="signup.id"
                    >
                      <v-list-item-title>
                        {{ signup.twitch_username || signup.battle_tag }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ signup.mmr }} MMR · {{ signup.race }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </template>

    <!-- Create/Edit Event Dialog -->
    <v-dialog v-model="showEventDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">{{ editingEvent ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
          {{ editingEvent ? 'Edit Event' : 'Create Event' }}
        </v-card-title>
        
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="eventForm.name"
                label="Event Name"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-trophy"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="eventForm.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="3"
                prepend-inner-icon="mdi-text"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventForm.event_date"
                label="Event Date"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                hint="Date of the event"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="eventForm.bracket_1_threshold"
                label="Bracket 1 Threshold"
                type="number"
                variant="outlined"
                density="comfortable"
                hint="MMR below this value"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="eventForm.bracket_2_threshold"
                label="Bracket 2 Threshold"
                type="number"
                variant="outlined"
                density="comfortable"
                hint="MMR below this value (Bracket 3 is above)"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeEventDialog">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-check" @click="saveEvent">
            {{ editingEvent ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Bracket Dialog -->
    <v-dialog v-model="showBracketDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
          Change Player Bracket
        </v-card-title>
        
        <v-card-text class="pt-4">
          <div v-if="selectedSignup" class="mb-4">
            <div class="text-subtitle-1 font-weight-bold">{{ selectedSignup.discord_tag }}</div>
            <div class="text-caption text-grey">Current: Bracket {{ selectedSignup.bracket }}</div>
          </div>
          
          <v-select
            v-model="newBracket"
            :items="[1, 2, 3]"
            label="New Bracket"
            variant="outlined"
            density="comfortable"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="getBracketThresholdText(item.value)"></v-list-item>
            </template>
          </v-select>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeBracketDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveBracketChange">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Match Dialog -->
    <v-dialog v-model="showMatchDialog" max-width="800px" persistent scrollable>
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-plus-circle</v-icon>
          Create Match
        </v-card-title>
        
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="matchForm.bracket"
                :items="[1, 2, 3]"
                label="Bracket"
                variant="outlined"
                density="comfortable"
                @update:model-value="onBracketChange"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="matchForm.game_mode"
                label="Game Mode"
                variant="outlined"
                density="comfortable"
                hint="e.g., 1v1, 2v1, 2v2, 3v1, FFA"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="matchForm.num_teams"
                label="Number of Teams"
                type="number"
                variant="outlined"
                density="comfortable"
                min="2"
                @update:model-value="onNumTeamsChange"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- Team participant selection -->
          <div v-for="teamNum in matchForm.num_teams" :key="teamNum" class="mb-4">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1 py-2">
                <v-icon class="mr-2" size="small">mdi-account-group</v-icon>
                Team {{ teamNum }}
              </v-card-title>
              <v-card-text>
                <v-select
                  v-model="matchForm.teams[teamNum - 1]"
                  :items="getAvailablePlayers(matchForm.bracket)"
                  :item-title="getPlayerDisplayName"
                  item-value="id"
                  label="Select Players"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  closable-chips
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #subtitle>
                        {{ item.raw.mmr }} MMR · {{ item.raw.race }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-card-text>
            </v-card>
          </div>

          <v-alert v-if="matchFormError" type="error" variant="tonal" class="mt-4" closable @click:close="matchFormError = null">
            {{ matchFormError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeMatchDialog">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-check" @click="createMatch" :disabled="!isMatchFormValid">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Set Winner Dialog -->
    <v-dialog v-model="showWinnerDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-trophy</v-icon>
          Set Match Winner
        </v-card-title>
        
        <v-card-text class="pt-4">
          <div v-if="selectedMatch">
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey mb-2">Match Details</div>
              <div><strong>Game Mode:</strong> {{ selectedMatch.game_mode }}</div>
              <div><strong>Bracket:</strong> {{ selectedMatch.bracket }}</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="mb-4">
              <div class="text-subtitle-2 text-grey mb-2">Teams</div>
              <div v-for="teamNum in selectedMatch.num_teams" :key="teamNum" class="mb-2">
                <strong>Team {{ teamNum }}:</strong>
                {{ getTeamPlayers(selectedMatch, teamNum).map(p => p.signup?.twitch_username || p.signup?.battle_tag || 'Unknown').join(', ') }}
              </div>
            </div>
            
            <v-select
              v-model="winnerForm.winner_team_number"
              :items="Array.from({ length: selectedMatch.num_teams }, (_, i) => i + 1)"
              label="Select Winner"
              variant="outlined"
              density="comfortable"
              hint="Select which team won the match"
              persistent-hint
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #subtitle>
                    {{ getTeamPlayers(selectedMatch, item.value).map(p => p.signup?.twitch_username || p.signup?.battle_tag || 'Unknown').join(', ') }}
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeWinnerDialog">Cancel</v-btn>
          <v-btn color="primary" @click="setWinner" :disabled="!winnerForm.winner_team_number">Set Winner</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Signup Dialog -->
    <v-dialog v-model="showAddSignupDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Add Player Signup
        </v-card-title>
        
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="signupForm.battle_tag"
                label="BattleTag"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shield-account"
                hint="Required. Format: Name#1234"
                persistent-hint
                :rules="[v => !!v || 'BattleTag is required']"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="signupForm.twitch_username"
                label="Twitch Username"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-twitch"
                hint="Optional. Player's Twitch username"
                persistent-hint
              />
            </v-col>
          </v-row>
          
          <v-alert v-if="signupError" type="error" variant="tonal" class="mt-4" closable @click:close="signupError = null">
            {{ signupError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAddSignupDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-check" 
            @click="saveSignup"
            :disabled="!signupForm.battle_tag"
          >
            Add Signup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import '@/assets/base.css';
import { ref, computed, onMounted } from 'vue';
import { useKothStore } from '@/stores';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'KothView' });

const kothStore = useKothStore();
const { events, signups, matches, kings, isLoading } = storeToRefs(kothStore);

const errorMessage = ref(null);
const selectedEventId = ref(null);
const activeTab = ref('signups');

// Event dialog
const showEventDialog = ref(false);
const editingEvent = ref(false);
const eventForm = ref({
  name: '',
  description: '',
  event_date: '',
  bracket_1_threshold: 1450,
  bracket_2_threshold: 1600,
});

// Bracket change dialog
const showBracketDialog = ref(false);
const selectedSignup = ref(null);
const newBracket = ref(1);

// Match dialog
const showMatchDialog = ref(false);
const matchForm = ref({
  bracket: 1,
  game_mode: '1v1',
  num_teams: 2,
  teams: [[], []], // Array of arrays, each containing signup IDs
});
const matchFormError = ref(null);

// Winner dialog
const showWinnerDialog = ref(false);
const selectedMatch = ref(null);
const winnerForm = ref({
  winner_team_number: null,
});

// Add signup dialog
const showAddSignupDialog = ref(false);
const signupForm = ref({
  battle_tag: '',
  twitch_username: '',
});
const signupError = ref(null);

const signupHeaders = [
  { title: 'Status', key: 'is_king', sortable: false },
  { title: 'Twitch Username', key: 'twitch_username' },
  { title: 'BattleTag', key: 'battle_tag' },
  { title: 'MMR', key: 'mmr' },
  { title: 'Race', key: 'race' },
  { title: 'Bracket', key: 'bracket' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const matchHeaders = [
  { title: 'Bracket', key: 'bracket' },
  { title: 'Game Mode', key: 'game_mode' },
  { title: 'Teams', key: 'teams', sortable: false },
  { title: 'Winner', key: 'winner', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
];

const selectedEvent = computed(() => {
  return events.value.find(e => e.id === selectedEventId.value);
});

const activeSignups = computed(() => {
  return signups.value.filter(s => s.is_active === 1);
});

const isMatchFormValid = computed(() => {
  if (!matchForm.value.game_mode || !matchForm.value.num_teams) return false;
  // Check that each team has at least one player
  for (let i = 0; i < matchForm.value.num_teams; i++) {
    if (!matchForm.value.teams[i] || matchForm.value.teams[i].length === 0) {
      return false;
    }
  }
  return true;
});

onMounted(async () => {
  await loadEvents();
});

async function loadEvents() {
  try {
    errorMessage.value = null;
    await kothStore.fetchAllEvents();
    
    // Auto-select active event if exists
    const activeEvent = events.value.find(e => e.is_active);
    if (activeEvent) {
      selectedEventId.value = activeEvent.id;
      await loadEventData();
    }
  } catch (error) {
    errorMessage.value = `Failed to load events: ${error.message}`;
  }
}

async function loadEventData() {
  if (!selectedEventId.value) return;
  
  try {
    errorMessage.value = null;
    await Promise.all([
      kothStore.fetchSignups(selectedEventId.value),
      kothStore.fetchMatches(selectedEventId.value),
      kothStore.fetchBracketKings(selectedEventId.value),
    ]);
  } catch (error) {
    errorMessage.value = `Failed to load event data: ${error.message}`;
  }
}

function openCreateEventDialog() {
  editingEvent.value = false;
  // Set default event_date to today in date format
  const today = new Date().toISOString().slice(0, 10);
  
  eventForm.value = {
    name: '',
    description: '',
    event_date: today,
    bracket_1_threshold: 1450,
    bracket_2_threshold: 1600,
  };
  showEventDialog.value = true;
}

function openEditEventDialog() {
  if (!selectedEvent.value) return;
  
  editingEvent.value = true;
  // Extract date portion directly from the datetime string to avoid timezone issues
  let eventDateLocal = '';
  if (selectedEvent.value.event_date) {
    // If it's a datetime string like "2025-12-25 00:00:00" or "2025-12-25T00:00:00", extract YYYY-MM-DD
    eventDateLocal = selectedEvent.value.event_date.split('T')[0].split(' ')[0];
  }
  
  eventForm.value = {
    name: selectedEvent.value.name,
    description: selectedEvent.value.description,
    event_date: eventDateLocal,
    is_active: selectedEvent.value.is_active,
    bracket_1_threshold: selectedEvent.value.bracket_1_threshold,
    bracket_2_threshold: selectedEvent.value.bracket_2_threshold,
  };
  showEventDialog.value = true;
}

function closeEventDialog() {
  showEventDialog.value = false;
  eventForm.value = {
    name: '',
    description: '',
    event_date: '',
    bracket_1_threshold: 1450,
    bracket_2_threshold: 1600,
  };
}

async function saveEvent() {
  try {
    // Convert date to MySQL-compatible datetime format (YYYY-MM-DD HH:MM:SS)
    const eventData = {
      ...eventForm.value,
      event_date: eventForm.value.event_date ? eventForm.value.event_date + ' 00:00:00' : null
    };
    
    // For new events, set is_active to false by default
    if (!editingEvent.value && eventData.is_active === undefined) {
      eventData.is_active = false;
    }
    
    if (editingEvent.value) {
      await kothStore.updateEvent(selectedEventId.value, eventData);
    } else {
      const newEvent = await kothStore.createEvent(eventData);
      selectedEventId.value = newEvent.id;
    }
    closeEventDialog();
    await loadEvents();
  } catch (error) {
    errorMessage.value = `Failed to save event: ${error.message}`;
  }
}

async function activateEvent() {
  try {
    await kothStore.activateEvent(selectedEventId.value);
    await loadEvents();
  } catch (error) {
    errorMessage.value = `Failed to activate event: ${error.message}`;
  }
}

function openBracketChangeDialog(signup) {
  selectedSignup.value = signup;
  newBracket.value = signup.bracket;
  showBracketDialog.value = true;
}

function closeBracketDialog() {
  showBracketDialog.value = false;
  selectedSignup.value = null;
  newBracket.value = 1;
}

async function saveBracketChange() {
  try {
    await kothStore.updateSignupBracket(selectedSignup.value.id, newBracket.value);
    closeBracketDialog();
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to change bracket: ${error.message}`;
  }
}

async function setAsKing(signupId) {
  try {
    await kothStore.setKing(signupId);
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to set king: ${error.message}`;
  }
}

async function addAsKing(signupId) {
  try {
    await kothStore.addKing(signupId);
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to add king: ${error.message}`;
  }
}

async function removeKing(signupId) {
  try {
    await kothStore.unsetKing(signupId);
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to remove king: ${error.message}`;
  }
}

async function deleteSignup(signupId) {
  if (!confirm('Are you sure you want to delete this signup?')) return;
  
  try {
    await kothStore.deleteSignup(signupId);
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to delete signup: ${error.message}`;
  }
}

function openCreateMatchDialog() {
  matchForm.value = {
    bracket: 1,
    game_mode: '1v1',
    num_teams: 2,
    teams: [[], []],
  };
  matchFormError.value = null;
  showMatchDialog.value = true;
}

function closeMatchDialog() {
  showMatchDialog.value = false;
  matchForm.value = {
    bracket: 1,
    game_mode: '1v1',
    num_teams: 2,
    teams: [[], []],
  };
  matchFormError.value = null;
}

function onBracketChange() {
  // Clear all teams when bracket changes
  matchForm.value.teams = Array.from({ length: matchForm.value.num_teams }, () => []);
}

function onNumTeamsChange() {
  const numTeams = matchForm.value.num_teams || 2;
  // Resize teams array
  const currentTeams = matchForm.value.teams;
  matchForm.value.teams = Array.from({ length: numTeams }, (_, i) => currentTeams[i] || []);
}

function getPlayerDisplayName(signup) {
  return signup.twitch_username || signup.battle_tag;
}

function getAvailablePlayers(bracket) {
  return signups.value.filter(s => s.bracket === bracket && s.is_active === 1);
}

async function createMatch() {
  matchFormError.value = null;
  
  // Validate that all teams have at least one player
  for (let i = 0; i < matchForm.value.num_teams; i++) {
    if (!matchForm.value.teams[i] || matchForm.value.teams[i].length === 0) {
      matchFormError.value = `Team ${i + 1} must have at least one player`;
      return;
    }
  }
  
  try {
    // Build participants array from teams
    const participants = [];
    matchForm.value.teams.forEach((team, index) => {
      team.forEach(signupId => {
        participants.push({
          signup_id: signupId,
          team_number: index + 1
        });
      });
    });
    
    await kothStore.createMatch({
      event_id: selectedEventId.value,
      bracket: matchForm.value.bracket,
      game_mode: matchForm.value.game_mode,
      num_teams: matchForm.value.num_teams,
      participants: participants,
    });
    closeMatchDialog();
    await loadEventData();
  } catch (error) {
    matchFormError.value = error.message || 'Failed to create match';
  }
}

async function deleteMatch(matchId) {
  if (!confirm('Are you sure you want to delete this match?')) return;
  
  try {
    await kothStore.deleteMatch(matchId);
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to delete match: ${error.message}`;
  }
}

function getTeamPlayers(match, teamNumber) {
  if (!match.participants) return [];
  return match.participants.filter(p => p.team_number === teamNumber);
}

function openSetWinnerDialog(match) {
  selectedMatch.value = match;
  winnerForm.value = {
    winner_team_number: match.winner_team_number || null,
  };
  showWinnerDialog.value = true;
}

function closeWinnerDialog() {
  showWinnerDialog.value = false;
  selectedMatch.value = null;
  winnerForm.value = {
    winner_team_number: null,
  };
}

async function setWinner() {
  try {
    await kothStore.updateMatchResult(
      selectedMatch.value.id,
      winnerForm.value.winner_team_number
    );
    closeWinnerDialog();
    await loadEventData();
  } catch (error) {
    errorMessage.value = `Failed to set winner: ${error.message}`;
  }
}

function openAddSignupDialog() {
  if (!selectedEventId.value) {
    errorMessage.value = 'Please select an event first';
    return;
  }
  
  signupForm.value = {
    battle_tag: '',
    twitch_username: '',
  };
  signupError.value = null;
  showAddSignupDialog.value = true;
}

function closeAddSignupDialog() {
  showAddSignupDialog.value = false;
  signupForm.value = {
    battle_tag: '',
    twitch_username: '',
  };
  signupError.value = null;
}

async function saveSignup() {
  if (!signupForm.value.battle_tag) {
    signupError.value = 'BattleTag is required';
    return;
  }
  
  try {
    signupError.value = null;
    await kothStore.createSignup({
      event_id: selectedEventId.value,
      battle_tag: signupForm.value.battle_tag,
      twitch_username: signupForm.value.twitch_username || null,
    });
    closeAddSignupDialog();
    await loadEventData();
  } catch (error) {
    signupError.value = error.message || 'Failed to add signup';
  }
}

function getBracketColor(bracket) {
  const colors = { 1: 'success', 2: 'info', 3: 'warning' };
  return colors[bracket] || 'grey';
}

function getBracketThresholdText(bracket) {
  if (!selectedEvent.value) return '';
  const thresholds = kothStore.getBracketThresholdText(selectedEvent.value);
  return thresholds[bracket] || '';
}

function getBracketSignups(bracket) {
  return kothStore.getSignupsByBracket(bracket);
}

function formatEventDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.loading-overlay {
  z-index: 999;
}
</style>
