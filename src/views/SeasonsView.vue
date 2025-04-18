<template>
    <div>
      <h1>Seasons Information</h1>   
      <!-- Seasons -->
      <div id="seasonList">
        <div>
          <h1>Import Excel File</h1>
          <label for="seasonName">Season Name:</label>
          <input
            type="text"
            v-model="seasonName"
            placeholder="Enter season name"
          />

          <label for="seasonId">Season ID:</label>
          <input
            type="number"
            v-model="seasonId"
            placeholder="Enter season ID"
          />

          <input type="file" @change="handleFileUpload" />
          <button @click="uploadFile">Upload File</button>
          <p v-if="uploadMessage">{{ uploadMessage }}</p>
        </div>

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
                      @click.stop="addNewSeason()"
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
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-col>
          </v-row>          
          <!-- No Seasons Found -->
          <v-row v-else justify="center">
            <v-col cols="auto">
              <p>No seasons found.</p>
            </v-col>
          </v-row>
        </div>

    <!-- Add New Season Modal -->
      <v-dialog id="NewPlayerModal"
        v-if="newSeason"
        v-model="addNewDialogOpen"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              Add New Season
            </span>
          </template>
          <template v-slot:text>
            <v-row dense:true>
              <v-col cols="3">
                <v-text-field
                  v-model="newSeason.name" 
                  label="Season name">
                </v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="newSeason.number_weeks" 
                  label="Number of Weeks">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row dense:true>
              <v-col cols="3">
                <v-text-field
                  v-model="newSeason.pick_ban" 
                  label="Pick Ban Order:">
                </v-text-field>
              </v-col>
            </v-row>
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-pencil"
              @click="createNewSeason"
              color="light-green"
              variant="tonal">
              Save
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelAddNewSeason"
              color="orange"
              variant="tonal">
              Cancel
            </v-btn>
          </v-card-actions>        
        </v-card>
      </v-dialog>

      
      <v-dialog id="EditSeasonModal"
        v-if="selectedSeason"
        v-model="editDialogOpen"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              Edit Season: {{ selectedSeason.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row dense:true>
              <v-col cols="3">
                <v-text-field
                  v-model="selectedSeason.name" 
                  label="Season name">
                </v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="selectedSeason.number_weeks" 
                  label="Number of Weeks">
                </v-text-field>
              </v-col>
            </v-row>
            <v-row dense:true>
              <v-col cols="3">
                <v-text-field
                  v-model="selectedSeason.pick_ban" 
                  label="Pick Ban Order:">
                </v-text-field>
              </v-col>
            </v-row>
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-pencil"
              @click="updateSeason"
              color="light-green"
              variant="tonal">
              Save
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelEdit"
              color="orange"
              variant="tonal">
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
const errorMessage = ref(null);
const newSeason = ref(null);
const addNewDialogOpen = ref(false);
  
let file = null
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
        
      const handleFileUpload = (event)=> {
        file = event.target.files[0];
      };

      const uploadFile = async () => {
        console.log("Uploading file")
        if (!file) {
          uploadMessage.value = "Please select a file before uploading!";
          return;
        }
        try {
          const success = seasonStore.uploadSeasonFile(seasonId.value, seasonName.value, file)
          // Include season data in the request
          if (success) {
            uploadMessage.value = "File uploaded successfully!";
          } else {
            uploadMessage.value = `Upload failed!.`;
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          uploadMessage.value = "An error occurred during file upload.";
        }
      }

        return {
            isLoading: computed(() => seasonStore.isLoading),
            seasons: computed(() => seasonStore.seasons),
            
            //table
            tableHeader,
            seasonName,
            seasonId,
            uploadMessage: "",
            uploadFile,
            handleFileUpload,



            selectedSeason,
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
