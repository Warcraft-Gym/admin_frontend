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
              <template v-slot:top>
                <v-toolbar flat>
                  <v-spacer />
                  <v-btn
                    class="toolbar-btn"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                    @click="showNewMapModal = true"
                  >Add New Map</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                  <td>
              <v-btn class="table-action" density="compact" color="blue" icon="mdi-account-edit" @click.stop.prevent="editMap(item)"></v-btn>
              <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click.stop.prevent="openDeleteDialog(item.id, removeMap)"></v-btn>
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
            <v-row :dense="true">
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
      <v-dialog id="editMapModal" v-model="editDialogOpen" max-width="65vw">
        <v-card v-if="selectedMap">
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ selectedMap.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field v-model="selectedMap.name" label="Map name" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="selectedMap.shortname" label="Map shortname" />
              </v-col>
            </v-row>
          </template>

          <v-card-actions>
            <v-btn prepend-icon="mdi-pencil" @click="updateMap" color="light-green" variant="tonal">Save</v-btn>
            <v-btn prepend-icon="mdi-close" @click="cancelEdit" color="orange" variant="tonal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this item? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-btn @click="cancelDeleteDialog" color="grey">Cancel</v-btn>
          <v-btn @click="confirmDelete" color="red">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script setup>
import '@/assets/base.css';
import { useMapStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'MapsView'
})

// Store
const mapStore = useMapStore();
const { maps } = storeToRefs(mapStore);

// State
const selectedMap = ref(null);
const isLoading = ref(false);
const errorMessage = ref(null);
const showNewMapModal = ref(false);
const editDialogOpen = ref(false);

// Form state
const newMap = ref({
  name: '',
  shortname: ''
});

// Delete dialog state
const showDeleteDialog = ref(false);
const selectedDeleteItemId = ref(null);
const deleteAction = ref(null);

// Table configuration
const tableHeader = [
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },  
  { title: 'shortname', value: 'shortname', sortable: true }, 
  { title: 'Actions', value: 'actions' }
];

// Methods
const fetchMaps = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await mapStore.fetchMaps();
    if (maps.value.length === 0) {
      errorMessage.value = 'No maps found.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load maps. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

const editMap = (map) => {
  selectedMap.value = { ...map };
  editDialogOpen.value = true;
};

const updateMap = async () => {
  try {
    await mapStore.updateMap(selectedMap.value);
    await fetchMaps();
    cancelEdit();
  } catch (error) {
    console.error('Error updating map:', error);
  }
};

const cancelEdit = () => {
  selectedMap.value = null;
  editDialogOpen.value = false;
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
    await fetchMaps();
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

// Lifecycle hooks
onMounted(() => {
  fetchMaps();
});
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
