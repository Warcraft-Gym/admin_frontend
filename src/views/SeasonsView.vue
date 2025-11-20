<template>
  <div>
    <h1>Seasons</h1>

    <v-overlay v-model="isLoading" persistent absolute>
      <v-progress-circular indeterminate size="64" width="8" color="primary" />
    </v-overlay>

    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon left>mdi-file-upload</v-icon>
          Import Excel File
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-form>
            <v-row dense>
              <v-col cols="3">
                <v-text-field v-model="seasonName" label="Season Name" placeholder="Enter season name" />
              </v-col>
              <v-col cols="1">
                <v-divider>OR</v-divider>
              </v-col>
              <v-col cols="2">
                <v-text-field v-model="seasonId" label="Season ID" type="number" placeholder="Enter season ID" />
              </v-col>
              <v-col cols="6">
                <v-file-input v-model="file" label="Upload Excel File" accept=".xlsx" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="auto">
                <v-btn
                  :disabled="!isFileFormValid || isLoading"
                  @click="uploadFile"
                  class="toolbar-btn"
                  variant="tonal"
                  prepend-icon="mdi-upload"
                >
                  Upload File
                </v-btn>
              </v-col>
            </v-row>

            <v-alert v-if="uploadMessage" type="success" class="mt-2">{{ uploadMessage }}</v-alert>
          </v-form>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-row justify="center" v-if="errorMessage" class="error-message">
      <v-col cols="auto">
        <p>{{ errorMessage }}</p>
      </v-col>
    </v-row>

    <section v-else>
      <v-data-table :headers="tableHeader" :items="seasons" :loading="isLoading" fixed-header hover>
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <template #top>
          <v-toolbar flat>
            <v-spacer />
            <v-btn @click.stop="addNewSeason" class="toolbar-btn" variant="tonal" prepend-icon="mdi-plus">Add New Season</v-btn>
          </v-toolbar>
        </template>

        <template #item="{ item }">
          <tr @click="$router.push(`/seasons/${item.id}`)" class="text-no-wrap">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.number_weeks }}</td>
            <td>{{ item.pick_ban }}</td>
            <td>{{ item.series_per_week }}</td>
            <td>
              <v-btn class="table-action" density="compact" color="blue" icon="mdi-account-edit" @click.stop.prevent="editSeason(item)" />
              <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click.stop.prevent="openDeleteDialog(item.id, removeSeason)" />
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Add / Edit Dialogs -->
      <v-dialog v-model="addNewDialogOpen" max-width="65vw">
        <v-card v-if="newSeason">
          <v-alert v-if="creationError" type="error" class="mx-4 my-2" dense border="start" border-color="red">{{ creationError }}</v-alert>
          <v-card-title>Add New Season</v-card-title>
          <v-card-text>
            <v-form>
              <v-row dense>
                <v-col cols="6"><v-text-field v-model="newSeason.name" label="Season Name" /></v-col>
                <v-col cols="6"><v-text-field v-model="newSeason.number_weeks" label="Number of Weeks" type="number" /></v-col>
                <v-col cols="6"><v-text-field v-model="newSeason.pick_ban" label="Pick Ban Order" /></v-col>
                <v-col cols="6"><v-text-field v-model="newSeason.series_per_week" label="Series per Week" type="number" /></v-col>
                <v-col cols="6"><v-text-field v-model="newSeason.discordRole" label="Discord Role ID" /></v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="newSeasonMapIds"
                    :items="maps"
                    item-title="name"
                    item-value="id"
                    label="Map Pool"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="createNewSeason" color="light-green" variant="tonal" prepend-icon="mdi-check">Save</v-btn>
            <v-btn @click="cancelAddNewSeason" color="orange" variant="tonal" prepend-icon="mdi-close">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="editDialogOpen" max-width="65vw">
        <v-card v-if="selectedSeason">
          <v-alert v-if="updateError" type="error" class="mx-4 my-2" dense border="start" border-color="red">{{ updateError }}</v-alert>
          <v-card-title>Edit Season: {{ selectedSeason.name }}</v-card-title>
          <v-card-text>
            <v-form>
              <v-row dense>
                <v-col cols="6"><v-text-field v-model="selectedSeason.name" label="Season Name" /></v-col>
                <v-col cols="6"><v-text-field v-model="selectedSeason.number_weeks" label="Number of Weeks" type="number" /></v-col>
                <v-col cols="6"><v-text-field v-model="selectedSeason.pick_ban" label="Pick Ban Order" /></v-col>
                <v-col cols="6"><v-text-field v-model="selectedSeason.series_per_week" label="Series per Week" type="number" /></v-col>
                <v-col cols="6"><v-text-field v-model="selectedSeason.discordRole" label="Discord Role ID" /></v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="selectedSeasonMapIds"
                    :items="maps"
                    item-title="name"
                    item-value="id"
                    label="Map Pool"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="updateSeason" color="light-green" variant="tonal" prepend-icon="mdi-check">Save</v-btn>
            <v-btn @click="cancelEdit" color="orange" variant="tonal" prepend-icon="mdi-close">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card>
          <v-card-title>Confirm Deletion</v-card-title>
          <v-card-text>Are you sure you want to delete this item? This action cannot be undone.</v-card-text>
          <v-card-actions>
            <v-btn @click="cancelDeleteDialog" color="grey">Cancel</v-btn>
            <v-btn @click="confirmDelete" color="red">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSeasonStore, useMapStore } from '@/stores';

defineOptions({ name: 'SeasonsView' });

const seasonStore = useSeasonStore();
const mapStore = useMapStore();

const seasons = ref([]);
const maps = ref([]);
const isLoading = ref(false);
const errorMessage = ref(null);
const uploadMessage = ref(null);
const seasonName = ref(null);
const seasonId = ref(null);
const file = ref(null);

const newSeason = ref(null);
const newSeasonMapIds = ref([]);
const addNewDialogOpen = ref(false);
const editDialogOpen = ref(false);
const selectedSeason = ref(null);
const selectedSeasonMapIds = ref([]);
const creationError = ref(null);
const updateError = ref(null);

const showDeleteDialog = ref(false);
const selectedDeleteItemId = ref(null);
const deleteAction = ref(null);

const tableHeader = [
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Weeks', value: 'number_weeks', sortable: true },
  { title: 'Pick Ban', value: 'pick_ban', sortable: true },
  { title: 'Series/Week', value: 'series_per_week', sortable: true },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

const isFileFormValid = ref(() => !!file.value && (seasonId.value || (seasonName.value && seasonName.value.length > 0)));

const fetchSeasons = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await seasonStore.fetchSeasons();
    seasons.value = seasonStore.seasons || [];
    if (!seasons.value || seasons.value.length === 0) {
      errorMessage.value = 'No seasons found.';
    }
  } catch (err) {
    console.error('Failed to fetch seasons', err);
    errorMessage.value = 'Failed to load seasons. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const fetchMaps = async () => {
  try {
    await mapStore.fetchMaps();
    maps.value = mapStore.maps || [];
  } catch (err) {
    console.error('Failed to fetch maps', err);
  }
};

onMounted(async () => {
  await Promise.all([fetchSeasons(), fetchMaps()]);
});

const addNewSeason = () => {
  newSeason.value = { name: '', number_weeks: 0, pick_ban: '', series_per_week: 0, discordRole: '' };
  newSeasonMapIds.value = [];
  creationError.value = '';
  addNewDialogOpen.value = true;
};

const createNewSeason = async () => {
  creationError.value = '';
  try {
    const createdSeason = await seasonStore.createSeason(newSeason.value);
    
    // Add maps to the season if any were selected
    if (newSeasonMapIds.value && newSeasonMapIds.value.length > 0) {
      await seasonStore.addMapsToSeason(createdSeason.id, newSeasonMapIds.value);
    }
    
    await fetchSeasons();
    cancelAddNewSeason();
  } catch (err) {
    console.error('Error creating season:', err);
    creationError.value = 'Error creating season: ' + (err?.message || err);
  }
};

const cancelAddNewSeason = () => {
  addNewDialogOpen.value = false;
  newSeason.value = null;
  newSeasonMapIds.value = [];
};

const editSeason = (season) => {
  selectedSeason.value = { ...season };
  selectedSeasonMapIds.value = season.maps ? season.maps.map(m => m.id) : [];
  updateError.value = '';
  editDialogOpen.value = true;
};

const updateSeason = async () => {
  updateError.value = '';
  try {
    await seasonStore.updateSeason(selectedSeason.value);
    
    // Update map pool - first get current maps, then determine what to add/remove
    const currentMapIds = selectedSeason.value.maps ? selectedSeason.value.maps.map(m => m.id) : [];
    const mapsToAdd = selectedSeasonMapIds.value.filter(id => !currentMapIds.includes(id));
    const mapsToRemove = currentMapIds.filter(id => !selectedSeasonMapIds.value.includes(id));
    
    if (mapsToAdd.length > 0) {
      await seasonStore.addMapsToSeason(selectedSeason.value.id, mapsToAdd);
    }
    if (mapsToRemove.length > 0) {
      await seasonStore.removeMapsFromSeason(selectedSeason.value.id, mapsToRemove);
    }
    
    await fetchSeasons();
    cancelEdit();
  } catch (err) {
    console.error('Error updating season:', err);
    updateError.value = 'Error updating season: ' + (err?.message || err);
  }
};

const cancelEdit = () => {
  editDialogOpen.value = false;
  selectedSeason.value = null;
  selectedSeasonMapIds.value = [];
};

const removeSeason = async (seasonIdVal) => {
  errorMessage.value = '';
  try {
    await seasonStore.deleteSeason(seasonIdVal);
    await fetchSeasons();
  } catch (err) {
    console.error('Error deleting season:', err);
    errorMessage.value = 'Error deleting season: ' + (err?.message || err);
  }
};

const openDeleteDialog = (id, action) => {
  selectedDeleteItemId.value = id;
  deleteAction.value = action;
  showDeleteDialog.value = true;
};

const confirmDelete = () => {
  if (selectedDeleteItemId.value && deleteAction.value) {
    deleteAction.value(selectedDeleteItemId.value);
  } else if (deleteAction.value) {
    deleteAction.value();
  }
  showDeleteDialog.value = false;
};

const cancelDeleteDialog = () => {
  showDeleteDialog.value = false;
  selectedDeleteItemId.value = null;
  deleteAction.value = null;
};

const uploadFile = async () => {
  if (!file.value || (!seasonId.value && (!seasonName.value || seasonName.value.length === 0))) {
    uploadMessage.value = 'Please select a file and provide a Season Name or ID before uploading!';
    return;
  }
  try {
    isLoading.value = true;
    uploadMessage.value = null;
    const success = await seasonStore.uploadSeasonFile(seasonId.value, seasonName.value, file.value);
    uploadMessage.value = success ? 'File uploaded successfully!' : 'Upload failed!';
    await fetchSeasons();
  } catch (err) {
    console.error('Error uploading file:', err);
    uploadMessage.value = 'An error occurred during file upload.';
  } finally {
    isLoading.value = false;
    seasonId.value = null;
    seasonName.value = null;
    file.value = null;
  }
};
</script>

<style>
.table-action { margin-right: 12px; }
.toolbar-btn { margin-right: 12px !important; }
.text-no-wrap { white-space: nowrap; }
</style>