<template>
    <div>
      <h1>Seasons Information</h1>   
      <!-- Seasons -->
      <div id="seasonList">
          <!-- Error Message -->
          <v-row justify="center" v-if="errorMessage" class="error-message">
            <v-col cols="auto">
              <p>{{ errorMessage }}</p>
            </v-col>
          </v-row>  
          <!-- Table -->
          <v-row v-else-if="seasons.length > 0">
            <v-col cols="12">
              <v-data-table
                :headers="tableHeader"
                :loading="isLoading"
                :items="seasons"
                fixed-header
                hover>
                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                </template>
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>
                      <v-icon icon="mdi-account"></v-icon>
                      Seasons list
                    </v-toolbar-title>                    
                    <v-btn 
                      @click="showNewSeasonModal = true"
                      class="toolbar-btn"
                      variant="tonal"
                      prepend-icon="mdi-plus"
                    >Add New Season</v-btn>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr class="text-no-wrap" @click="$router.push(`/seasons/${item.id}`)">
                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.number_weeks }}</td>
                    <td>{{ item.pick_ban }}</td>
                    <td>{{ item.series_per_week }}</td> 
                    <td>
                      <v-btn class="table-action" density="compact" icon="mdi-account-edit" @click.stop="editSeason(item)"></v-btn>
                      <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click.stop="removeSeason(item.id)"></v-btn>
                      <!-- SECURE SYNC BUTTON WITH TIMEOUT -->
                      <v-btn density="compact" color="green" icon="mdi-sync"></v-btn>                      
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-col>
          </v-row>          
          <!-- No Seasons Found -->
          <v-row v-else justify="center">
            <v-cols cols="auto">
              <p>No seasons found.</p>
            </v-cols>
          </v-row>
        </div>

    <!-- Add New Season Modal -->
        <div v-if="showNewSeasonModal" :class="['modal', showNewSeasonModal ? 'modal-active' : '']">
          <div class="modal-content">
            <h2>Add New Season</h2>
            <form @submit.prevent="createNewSeason">
              <div>
                <label for="name">Name:</label>
                <input id="name" v-model="newSeason.name" />
              </div>
              <div>
                <label for="number_weeks">Number of weeks:</label>
                <input id="number_weeks" v-model="newSeason.number_weeks" />
              </div>
              <div>
                <label for="pick_ban">Pick Ban Order:</label>
                <input id="pick_ban" v-model="newSeason.pick_ban" />
              </div>
              <div>
                <label for="series_per_week">Number of Series per Week:</label>
                <input id="series_per_week" v-model="newSeason.series_per_week" />
              </div>
              <button type="submit">Save</button>
              <button @click="cancelAddNewSeason">Cancel</button>
            </form>
          </div>
        </div>
        <div v-if="showNewSeasonModal" class="overlay" @click="cancelAddNewSeason"></div>


        <!-- Popup Modal -->
        <div v-if="selectedSeason" :class="['modal', selectedSeason ? 'modal-active' : '']" class="modal">
          <div class="modal-content">
            <h2>Edit Season: {{ selectedSeason.name }}</h2>
            <form @submit.prevent="updateSeason">
              <div>
                <label for="name">Name:</label>
                <input id="name" v-model="selectedSeason.name" />
              </div>
              <div>
                <label for="number_weeks">Number of weeks:</label>
                <input id="number_weeks" v-model="selectedSeason.number_weeks" />
              </div>
              <div>
                <label for="pick_ban">Pick Ban Order:</label>
                <input id="pick_ban" v-model="selectedSeason.pick_ban" />
              </div>
              <div>
                <label for="series_per_week">Number of Series per Week:</label>
                <input id="series_per_week" v-model="selectedSeason.series_per_week" />
              </div>
              <button type="submit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </form>
          </div>
        </div>
        <!-- Modal Overlay -->
        <div v-if="selectedSeason" class="overlay" @click="cancelEdit"></div>
    </div>
</template>
<script>
import '@/assets/base.css';
import { useSeasonStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';

// State for editing
const selectedSeason = ref(null);
const isLoading  = ref(false); // State for selected season
const errorMessage = ref(null);
const showNewSeasonModal = ref(false);
const newSeason = ref({
      name: '',
      number_weeks: 0,
      pick_ban: '',
      series_per_week: 0,
    });

const tableHeader = [
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },  
  { title: 'Number of weeks', value: 'number_weeks', sortable: true },    
  { title: 'Pick Ban Order', value: 'pick_ban', sortable: true },
  { title: 'Number of Series per Week', value: 'series_per_week', sortable: true },
]

export default {

    name: 'SeasonsView',
    setup(){

        const seasonStore = useSeasonStore();
        // Fetch data when the page is loaded


        // Fetch seasons when the component is mounted
        const fetchSeasons = async () => {
          
          isLoading.value = true;
          errorMessage.value = null; // Reset error message
          try {
            await seasonStore.fetchSeasons(); // Fetch season data


            if (seasonStore.seasons.length === 0) {
              errorMessage.value = 'No seasons found.';
            }
          } catch (error) {
            errorMessage.value = 'Failed to load seasons. Please try again later.';
          } finally {
            isLoading.value = false;
          }
        };

        onMounted( () => {
          fetchSeasons(); 
        });

        const editSeason = (season) => {
          selectedSeason.value = { ...season }; // Clone the season object to avoid modifying the original object directly
        };

        const updateSeason = async () => {
          try {
            await seasonStore.updateSeason(selectedSeason.value);
            // Update the local state after a successful PUT request
            await fetchSeasons(); // Re-fetch the season
            cancelEdit(); // Reset the form
          } catch (error) {
            console.error('Error updating season:', error);
          }
        };

        const cancelEdit = () => {
          selectedSeason.value = null; // Clear the selected season
        };

        const createNewSeason = async () => {
          try {
            await seasonStore.createSeason(newSeason.value);
            await fetchSeasons();
            cancelAddNewSeason();
          } catch (error) {
            console.error('Error creating season:', error);
          }
        };

        const removeSeason = async (seasonId) => {
          try {
            await seasonStore.deleteSeason(seasonId);
            await fetchSeasons(); // Refresh the list after deletion
          } catch (error) {
            console.error('Error deleting season:', error);
          }
        };

        const cancelAddNewSeason = () => {
          showNewSeasonModal.value = false;
          newSeason.value = {
            name: '',
            battleTag: '',
            country: '',
            discordTag: '',
            mmr: 0,
            race: '',
          };
        };
        
        return {
            isLoading: computed(() => seasonStore.isLoading),
            seasons: computed(() => seasonStore.seasons),

            //table
            tableHeader,

            selectedSeason,
            editSeason,
            updateSeason,
            cancelEdit,
            errorMessage,
            showNewSeasonModal,
            newSeason,
            createNewSeason,
            cancelAddNewSeason,
            removeSeason,        
            fetchSeasons,
        }
    },
};
</script>

<style>

/* Table */
.table-action {
  margin-right: 15px;
}

/* Toolbar */
.toolbar-btn {
  margin-right : 15px !important;
}

/* pannel */
.pannel-title {
  margin: 0;
}

/* Modal styling */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.modal-content div {
  margin-bottom: 10px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal.modal-active {
  display: block; /* Visible state */
}

</style>
