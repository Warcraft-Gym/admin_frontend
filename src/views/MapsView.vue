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
      <h1>Map Information</h1>
      <!-- Maps -->
      <div id="mapList">
        <v-row>
          <v-btn 
                    @click="showNewMapModal = true"
                    class="toolbar-btn"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                  >Add New Map</v-btn>
         </v-row>
        <!-- Error Message -->
        <v-row justify="center" v-if="errorMessage" class="error-message">
          <v-col cols="auto">
            <p>{{ errorMessage }}</p>
          </v-col>
        </v-row>  
        <!-- Table -->
        <v-row v-else-if="maps.length > 0">
          <v-col cols="12">
            <v-data-table
              :headers="tableHeader"
              :items="maps"
              fixed-header
              hover>
              <template v-slot:[`item.actions`]="{ item }">
                  <td>
                    <v-btn class="table-action" density="compact" icon="mdi-account-edit" @click="editMap(item)"></v-btn>
                    <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click="removeMap(item.id)"></v-btn>
                  </td>
              </template>
            </v-data-table>
          </v-col>
        </v-row>          
        <!-- No Maps Found -->
        <v-row v-else justify="center">
          <v-col cols="auto">
            <p>No maps found.</p>
          </v-col>
        </v-row>
      </div>
      <!-- Add New Map Modal -->
      <v-dialog
        id="newMapModal"
        v-model="showNewMapModal"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-plus"></v-icon>
              Add Map
            </span>
          </template>
          <template v-slot:text>
            <v-row dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="newMap.name" 
                  label="Map name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newMap.shortname" 
                  label="Map shortname">
                </v-text-field>
              </v-col>
            </v-row>       
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-plus"
              @click="createNewMap"
              color="light-green"
              variant="tonal">
              Add
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelAddNewMap"
              color="orange"
              variant="tonal">
              Cancel
            </v-btn>
          </v-card-actions>        
        </v-card>
      </v-dialog>

      <!-- Edit Map Modal -->
      <v-dialog
        id="editMapModal"
        v-if="selectedMap"
        v-model="selectedMap"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ selectedMap.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row dense="true">
              <v-col cols="6">
                <v-text-field
                  v-model="selectedMap.name" 
                  label="Map name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedMap.shortname" 
                  label="Map shortname">
                </v-text-field>
              </v-col>
            </v-row>      
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-pencil"
              @click="updateMap"
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
import { useMapStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';

// State for editing
const selectedMap = ref(null);
const isLoading  = ref(false); // State for selected user
const errorMessage = ref(null);
const showNewMapModal = ref(false);
const newMap = ref({
  name: '',
  shortname: ''
});

const tableHeader = [
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },  
  { title: 'shortname', value: 'shortname', sortable: true }, 
  { title: 'Actions', value: 'actions' }, 
]


export default {

    name: 'MapsView',
    setup(){
        const mapStore = useMapStore();
        // Fetch data when the page is loaded


        // Fetch users when the component is mounted
        const fetchMaps = async () => {
          
          isLoading.value = true;
          errorMessage.value = null; // Reset error message
          try {
            await mapStore.fetchMaps(); // Fetch user data


            if (mapStore.maps.length === 0) {
              errorMessage.value = 'No maps found.';
            }
          } catch (error) {
            errorMessage.value = 'Failed to load maps. Please try again later.';
          } finally {
            isLoading.value = false;
          }
        };

        onMounted( () => {
          fetchMaps(); 
        });

        const editMap = (map) => {
          selectedMap.value = { ...map }; // Clone the user object to avoid modifying the original object directly
        };

        const updateMap = async () => {
          try {
            await mapStore.updateMap(selectedMap.value);
            // Update the local state after a successful PUT request
            await fetchMaps(); // Re-fetch the maps
            cancelEdit(); // Reset the form
          } catch (error) {
            console.error('Error updating map:', error);
          }
        };

        const cancelEdit = () => {
          selectedMap.value = null; // Clear the selected user
        };

        const createNewMap = async () => {
          try {
            await mapStore.createMap(newMap.value);
            await fetchMaps();
            cancelAddNewMap();
          } catch (error) {
            console.error('Error creating map:', error);
          }
        };

        const removeMap = async (mapId) => {
          try {
            await mapStore.deleteMap(mapId);
            await fetchMaps(); // Refresh the list after deletion
          } catch (error) {
            console.error('Error deleting map:', error);
          }
        };


        const cancelAddNewMap = () => {
          showNewMapModal.value = false;
          newMap.value = {
            name: '',
            shortname: ''
          };
        };
        
        return {
            isLoading,
            maps: computed(() => mapStore.maps),

            //table
            tableHeader,

            selectedMap,
            editMap,
            updateMap,
            cancelEdit,
            errorMessage,
            showNewMapModal,
            newMap,
            createNewMap,
            cancelAddNewMap,
            removeMap,       
            fetchMaps,
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

</style>
