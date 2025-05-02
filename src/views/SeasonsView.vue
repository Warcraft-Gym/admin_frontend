<template>
  <div>
    <h1>Seasons Information</h1>
    <v-overlay v-model="isLoading" persistent absolute>
        <v-progress-circular
          indeterminate
          size="64" 
          width="8"
          color="primary"
        ></v-progress-circular>
    </v-overlay>

    <!-- Import Excel File Section -->
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon left>mdi-file-upload</v-icon>
          Import Excel File
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-form>
            <v-row dense>
              <!-- Season Name Input -->
              <v-col cols="3">
                <v-text-field
                  v-model="seasonName"
                  label="Season Name"
                  placeholder="Enter season name"
                ></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-divider>OR</v-divider>
              </v-col>
              <!-- Season ID Input -->
              <v-col cols="2">
                <v-text-field
                  v-model="seasonId"
                  label="Season ID"
                  type="number"
                  placeholder="Enter season ID"
                ></v-text-field>
              </v-col>

              <!-- File Selector -->
              <v-col cols="6">
                <v-file-input
                  v-model="file"
                  label="Upload Excel File"
                  accept=".xlsx"
                ></v-file-input>
              </v-col>
            </v-row>
            <v-btn
              :disabled="!isFileFormValid || isLoading.value"
              @click="uploadFile"
              color="primary"
              class="mt-3"
            >
              Upload File
            </v-btn>

            <v-alert v-if="uploadMessage" type="success" class="mt-2">
              {{ uploadMessage }}
            </v-alert>
          </v-form>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>



    <!-- Error Message -->
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <!-- Seasons Table -->
    <section id="seasons-table" v-else-if="seasons.length > 0">
      <v-data-table
        :headers="tableHeader"
        :items="seasons"
        fixed-header
        hover
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>
              <v-icon icon="mdi-account"></v-icon>
              Seasons List
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              @click.stop="addNewSeason"
              color="primary"
              prepend-icon="mdi-plus"
            >
              Add New Season
            </v-btn>
          </v-toolbar>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="$router.push(`/seasons/${item.id}`)">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.number_weeks }}</td>
            <td>{{ item.pick_ban }}</td>
            <td>{{ item.series_per_week }}</td>
            <td>
              <v-btn
                icon
                @click.stop="editSeason(item)"
                color="blue"
              >
                <v-icon>mdi-account-edit</v-icon>
              </v-btn>
              <v-btn
                icon
                @click.stop="removeSeason(item.id)"
                color="red"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </section>

    <!-- No Seasons Found -->
    <v-alert v-else type="info" class="mt-4">
      No seasons found.
    </v-alert>

    <!-- Add New Season Modal -->
    <v-dialog v-if="newSeason" v-model="addNewDialogOpen" max-width="65vw">
      <v-card>
        <v-card-title>Add New Season</v-card-title>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="newSeason.name"
                  label="Season Name"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newSeason.number_weeks"
                  label="Number of Weeks"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newSeason.pick_ban"
                  label="Pick Ban Order"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="createNewSeason" color="green" prepend-icon="mdi-check">
            Save
          </v-btn>
          <v-btn @click="cancelAddNewSeason" color="red" prepend-icon="mdi-close">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Season Modal -->
    <v-dialog v-model="editDialogOpen" max-width="65vw">
      <v-card>
        <v-card-title>Edit Season: {{ selectedSeason.name }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedSeason.name"
                  label="Season Name"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedSeason.number_weeks"
                  label="Number of Weeks"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedSeason.pick_ban"
                  label="Pick Ban Order"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="updateSeason" color="green" prepend-icon="mdi-check">
            Save
          </v-btn>
          <v-btn @click="cancelEdit" color="red" prepend-icon="mdi-close">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import '@/assets/base.css';
import { useSeasonStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';

// State for editing
const selectedSeason = ref(null);
const editDialogOpen = ref(false);
const isLoading  = ref(false); // State for selected season
const isFileFormValid = computed(() => file.value != null && (seasonName.value!=null && seasonName.value.trim() !== "" || seasonId.value !== null));
const errorMessage = ref(null);
const newSeason = ref(null);
const addNewDialogOpen = ref(false);
  
const file = ref(null)
const uploadMessage = ref(null)
const seasonId = ref(null)
const seasonName = ref(null)

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
          editDialogOpen.value = true;
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
          editDialogOpen.value = false;
        };

        const addNewSeason = async () =>{
          newSeason.value = {
            name: '',
            number_weeks: 0,
            pick_ban: '',
            series_per_week: 0,
          },
          addNewDialogOpen.value = true;
        }

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
          newSeason.value = null;
          addNewDialogOpen.value = false;
        };
        
        const uploadFile = async () => {
        if (!isFileFormValid.value) {
          uploadMessage.value = "Please select a file and provide a Season Name or ID before uploading!";
          return;
        }
        try {
          isLoading.value = true
          uploadMessage.value = null
          const success = await seasonStore.uploadSeasonFile(seasonId.value, seasonName.value, file.value)
          // Include season data in the request
          if (success) {
            uploadMessage.value = "File uploaded successfully!";
          } else {
            uploadMessage.value = `Upload failed!.`;
          }
          await fetchSeasons(); 
        } catch (error) {
          console.error("Error uploading file:", error);
          uploadMessage.value = "An error occurred during file upload.";
        } finally {
          isLoading.value = false;
          seasonId.value = null;
          seasonName.value = null;
          file.value = null;
        }
      }

        return {
            isLoading,
            seasons: computed(() => seasonStore.seasons),
            
            //table
            tableHeader,
            seasonName,
            seasonId,
            uploadMessage,
            uploadFile,
            isFileFormValid,


            selectedSeason,
            file,
            editSeason,
            updateSeason,
            editDialogOpen,
            cancelEdit,
            errorMessage,
            newSeason,
            addNewDialogOpen,
            addNewSeason,
            createNewSeason,
            cancelAddNewSeason,
            removeSeason,        
            fetchSeasons,
        }
    },
};
</script>