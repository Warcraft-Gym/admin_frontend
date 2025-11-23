<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col>
        <h1><v-icon class="mr-2">mdi-account-plus</v-icon> Player Signup</h1>
      </v-col>
    </v-row>

    <v-card elevation="2">
      <v-card-title class="bg-primary">
        <v-icon class="mr-2">mdi-clipboard-account</v-icon>
        {{ seasonName ? `Signup for Season: ${seasonName}` : 'Player Registration' }}
      </v-card-title>
      <v-card-text class="pt-4">
        <div v-if="loading">Loading token...</div>
        <div v-else-if="tokenInvalid">
          <v-alert type="error">Token is invalid: {{ tokenInvalidReason }}</v-alert>
        </div>
        <div v-else>
          <v-form ref="formRef" @submit.prevent="onSubmit">
            <v-row :dense="true">
              <v-col cols="12" md="6">
                <v-text-field 
                  disabled 
                  v-model="discordId" 
                  label="Discord ID" 
                  variant="outlined"
                  prepend-inner-icon="mdi-identifier"
                  readonly 
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  disabled 
                  v-model="discordTag" 
                  label="Discord Tag" 
                  variant="outlined"
                  prepend-inner-icon="mdi-discord"
                  readonly 
                />
              </v-col>
            </v-row>

            <v-row :dense="true">
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="name" 
                  label="Player name (EAShibby)" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  required 
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="battleTag" 
                  label="Player BattleTag (#EAShibby12342)" 
                  variant="outlined"
                  prepend-inner-icon="mdi-pound"
                  required 
                />
              </v-col>
            </v-row>

            <v-row :dense="true">
              <v-col cols="12" md="6">
                <CountrySelect v-model="country" />
              </v-col>
              <v-col cols="12" md="6">
                <RaceSelect v-model="race" />
              </v-col>
            </v-row>

            <v-row :dense="true">
              <v-col cols="12" md="6">
                <v-number-input 
                  v-model="mmr" 
                  control-variant="hidden" 
                  label="Signup Race MMR" 
                  variant="outlined"
                  prepend-inner-icon="mdi-chart-line"
                  :hideInput="false" 
                  :inset="false" 
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-btn 
                  color="primary" 
                  variant="elevated"
                  prepend-icon="mdi-check"
                  type="submit" 
                  :disabled="submitting || success"
                >
                  Complete signup
                </v-btn>
                <v-progress-circular v-if="submitting" indeterminate size="18" class="ml-2" />
              </v-col>
            </v-row>
          </v-form>
          <v-alert type="success" v-if="success" class="mt-4">Signup completed — thank you.</v-alert>
          <v-alert type="error" v-if="submitError" class="mt-4">Error: {{ submitError }}</v-alert>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// token validation/consumption is handled server-side via backend endpoints
import { useSeasonStore, useConfigStore } from '@/stores';
import { storeToRefs } from 'pinia';

const route = useRoute();
const token = ref(route.query.token || '');
const loading = ref(true);
const tokenInvalid = ref(false);
const tokenInvalidReason = ref('');
const tokenEntry = ref({ discordId: '', discordTag: '' });

// Form fields (match create player dialog except fantasy_tier)
const discordId = ref('');
const discordTag = ref('');
const name = ref('');
const battleTag = ref('');
const country = ref('');
const mmr = ref(0);
const race = ref('');
const selectedSignupSeasonId = ref(null);

const submitting = ref(false);
const success = ref(false);
const submitError = ref('');
const seasonName = ref('');

const seasonStore = useSeasonStore();
const configStore = useConfigStore();
const { seasons } = storeToRefs(seasonStore);

onMounted(async () => {
  loading.value = true;
  if (!token.value) {
    tokenInvalid.value = true;
    tokenInvalidReason.value = 'missing_token';
    loading.value = false;
    return;
  }

  try {
    const backend = import.meta.env.VITE_BACKEND_URL || '';
    
    // Check if signups are enabled
    try {
      const setting = await configStore.fetchSetting('signups_enabled');
      if (setting && setting.value && setting.value.toLowerCase() === 'false') {
        tokenInvalid.value = true;
        tokenInvalidReason.value = 'Signups are currently closed. Please check back later.';
        loading.value = false;
        return;
      }
    } catch (err) {
      console.log('Could not check signups_enabled setting, continuing...');
    }
    
    // Use the public token endpoint (updated API): /public-token/<token>
    const res = await fetch(`${backend}/public-token/${token.value}`);
    if (!res.ok) {
      tokenInvalid.value = true;
      tokenInvalidReason.value = (await res.text()) || 'not_found';
      loading.value = false;
      return;
    }
    const data = await res.json();
    // expected: { discord_id, discord_tag, season_id }
    tokenEntry.value = {
      discordId: data.discord_id || data.discordId || data.discordId || '',
      discordTag: data.discord_tag || data.discordTag || data.discordTag || '',
      season_id: data.season_id || data.seasonId || null
    };

    // prepopulate readonly fields
    discordId.value = tokenEntry.value.discordId || '';
    discordTag.value = tokenEntry.value.discordTag || '';

    // fetch seasons for signup selection
    try { await seasonStore.fetchSeasons(); } catch (e) { /* ignore */ }
    // if token contains a season_id prepopulate selection and seasonName
    if (tokenEntry.value && tokenEntry.value.season_id) {
      const sid = tokenEntry.value.season_id;
      const s = (seasonStore.seasons || []).find(x => String(x.id) === String(sid));
      if (s) {
        seasonName.value = s.name;
        selectedSignupSeasonId.value = s.id;
      } else {
        selectedSignupSeasonId.value = sid;
      }
    }
  } catch (err) {
    tokenInvalid.value = true;
    tokenInvalidReason.value = (err && err.message) || (err && err.error) || 'invalid';
  } finally {
    loading.value = false;
  }
});

async function onSubmit() {
  submitError.value = '';
  submitting.value = true;
  try {
    // Build payload and call the new public signup endpoint which creates the user
    const payload = {
      token: token.value,
      name: name.value,
      battleTag: battleTag.value,
      country: country.value,
      mmr: mmr.value,
      race: race.value,
      // include season id if token had one or it was provided
      season_id: selectedSignupSeasonId.value ? selectedSignupSeasonId.value : undefined
    };
    console.log('Submitting signup payload', payload);
    const backend = import.meta.env.VITE_BACKEND_URL || '';
    const res = await fetch(`${backend}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Signup failed: ${res.status}`);
    }

    // user created on backend — end-user flow is complete; they can close the page
    success.value = true;
  } catch (err) {
    console.log('Signup error:', err);
    submitError.value = (err && err.message) || (err && err.error) || String(err);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
</style>
