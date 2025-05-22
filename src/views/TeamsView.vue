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
      <h1>Teams Information</h1>
      <!-- Teams -->
      <div id="teamList">
        <v-row>
          <v-btn 
                    @click="createTeam()"
                    class="toolbar-btn"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                  >Add New Team</v-btn>
         </v-row>
        <!-- Error Message -->
        <v-row justify="center" v-if="errorMessage" class="error-message">
          <v-col cols="auto">
            <p>{{ errorMessage }}</p>
          </v-col>
        </v-row>  
        <!-- Table -->
        <v-row v-else-if="teams.length > 0">
          <v-col cols="12">
            <v-data-table
              :headers="tableHeader"
              :items="teams"
              fixed-header
              hover>
              <template v-slot:[`item.actions`]="{ item }">
                  <td>
                    <v-btn class="table-action" density="compact" icon="mdi-account-edit" @click="editTeam(item)"></v-btn>
                    <v-btn class="table-action" density="compact" color="red" icon="mdi-trash-can" @click="openDeleteDialog(item.id, removeTeam)"></v-btn>
                  </td>
              </template>
              <template v-slot:[`item.icon`]="{ item }">
                <td>
                  <v-img :src="item.image_url"
                  class="team-image"
                  width="40"
                  height="40"
                  contain
                ></v-img>
                </td>
              </template>
            </v-data-table>
          </v-col>
        </v-row>          
        <!-- No Teams Found -->
        <v-row v-else justify="center">
          <v-col cols="auto">
            <p>No Teams found.</p>
          </v-col>
        </v-row>
      </div>
      <!-- Add New Team Modal -->
      <v-dialog
        id="newTeamModal"
        v-model="showNewTeamModal"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-plus"></v-icon>
              Add Team
            </span>
          </template>
          <template v-slot:text>
            <v-row >
              <v-col cols="6">
                <v-text-field
                  v-model="newTeam.name" 
                  label="Team name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newTeam.long_name" 
                  label="Team Longname">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newTeam.discord_role" 
                  label="Team Discord Role">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-file-input
                  v-model="file"
                  label="Team Icon"
                  accept=".png,.jpg"
                ></v-file-input>
              </v-col>
            </v-row>       
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-plus"
              @click="createNewTeam"
              color="light-green"
              variant="tonal">
              Add
            </v-btn>
            <v-btn 
              prepend-icon="mdi-close" 
              @click="cancelAddNewTeam"
              color="orange"
              variant="tonal">
              Cancel
            </v-btn>
          </v-card-actions>        
        </v-card>
      </v-dialog>

      <!-- Edit Team Modal -->
      <v-dialog
        id="editTeamModal"
        v-model="showEditTeamModal"
        max-width="65vw">
        <v-card>
          <template v-slot:title>
            <span class="modal-title">
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ selectedTeam.name }}
            </span>
          </template>
          <template v-slot:text>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedTeam.name" 
                  label="Team name">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedTeam.long_name" 
                  label="Team Longname">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="selectedTeam.discord_role" 
                  label="Team Discord Role">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-file-input
                  v-model="file"
                  label="Team Icon"
                  accept=".png,.jpg"
                ></v-file-input>
              </v-col>
            </v-row>      
          </template>       
              
          <v-card-actions>
            <v-btn 
              prepend-icon="mdi-pencil"
              @click="updateTeam"
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
<script>
import '@/assets/base.css';
import { useTeamStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';
import  teamDefaultImg from '@/assets/media/GNL_Team_Default.png';

// State for editing
const selectedTeam = ref(null);
const isLoading  = ref(false); // State for selected user
const errorMessage = ref(null);
const showNewTeamModal = ref(false);
const showEditTeamModal = ref(false);

const file = ref(null);
const newTeam = ref(null);

const tableHeader = [
  { title:'', value: 'icon'},
  { title: 'ID', value: 'id', align: 'start', sortable: true },
  { title: 'Name', value: 'name', sortable: true },  
  { title: 'Long Name', value: 'long_name', sortable: true }, 
  { title: 'Discord Role', value: 'discord_role', sortable: true }, 
  { title: 'Actions', value: 'actions' }, 
]


export default {

    name: 'TeamsView',
    setup(){
        const teamStore = useTeamStore();
        // Fetch data when the page is loaded
        const showDeleteDialog = ref(false);
        const selectedDeleteItemId = ref(null);
        const deleteAction = ref(null);

        // Fetch users when the component is mounted
        const fetchTeams = async () => {
          
          isLoading.value = true;
          errorMessage.value = null; // Reset error message
          try {
            await teamStore.fetchTeams(); // Fetch user data


            if (teamStore.teams.length === 0) {
              errorMessage.value = 'No Teams found.';
            }
            const teamPromises = teamStore.teams.map(async (team) => {
              try {
                const imgResponse = await teamStore.getTeamImage(team.id);
                if (!imgResponse.ok) throw new Error("Image not found");
                const imgBlob = await imgResponse.blob();
                team.image_url = URL.createObjectURL(imgBlob); //
              } catch (error) {
                team.image_url = teamDefaultImg; // Assign default image if fetch fails
              }
              return team;
            });
            // Wait for all images to be fetched before storing updated teams
            await Promise.all(teamPromises);
          } catch (error) {
            errorMessage.value = 'Failed to load Teams. Please try again later.';
          } finally {
            isLoading.value = false;
          }
        };

        onMounted( () => {
          fetchTeams(); 
        });

        const createTeam = () => {
          showNewTeamModal.value = true;
          newTeam.value = {
            name: '',
            long_name: '',
            discord_role:''
          }
        };

        const editTeam = (team) => {
          showEditTeamModal.value = true;
          selectedTeam.value = { 
            id: team.id,
            name: team.name,
            long_name: team.long_name,
            discord_role: team.discord_role
           };
        };

        const updateTeam = async () => {
          try {
            await teamStore.updateTeam(selectedTeam.value);
            if(file.value){
              await teamStore.uploadTeamImage(selectedTeam.value.id, file.value);
            }
            // Update the local state after a successful PUT request
            await fetchTeams(); // Re-fetch the Teams
            cancelEdit(); // Reset the form
          } catch (error) {
            console.error('Error updating Team:', error);
          }
        };

        const cancelEdit = () => {
          showEditTeamModal.value = false;
          file.value = null;
          selectedTeam.value = { 
            id: null,
            name: '',
            long_name: '',
            discord_role: ''
           };// Clear the selected user
        };

        const createNewTeam = async () => {
          try {
            await teamStore.createTeam(newTeam.value);
            if(file.value){
              await teamStore.uploadTeamImage(selectedTeam.value.id, file.value);
            }
            await fetchTeams();
            cancelAddNewTeam();
          } catch (error) {
            console.error('Error creating Team:', error);
          }
        };

        const removeTeam = async (teamId) => {
          try {
            await teamStore.deleteTeam(teamId);
            await fetchTeams(); // Refresh the list after deletion
          } catch (error) {
            console.error('Error deleting Team:', error);
          }
        };


        const cancelAddNewTeam = () => {
          showNewTeamModal.value = false;
          file.value = null;
          newTeam.value = {
            name: '',
            long_name: '',
            discord_role: ''
          };
        };

        const openDeleteDialog = (id, action) => {
          selectedDeleteItemId.value = id;
          deleteAction.value = action; // Store the function dynamically
          showDeleteDialog.value = true;
        };

        const confirmDelete = () => {
          if (selectedDeleteItemId.value && deleteAction.value) {
            deleteAction.value(selectedDeleteItemId.value); // Call the dynamically stored function
            showDeleteDialog.value = false;
          } else if (deleteAction.value) {
            deleteAction.value(); // Call the dynamically stored function
            showDeleteDialog.value = false;
          }
        };

        const cancelDeleteDialog = () => {
          showDeleteDialog.value = false;
          selectedDeleteItemId.value = null;
          deleteAction.value = null; // Store the function dynamically
        };
        
        return {
            isLoading,
            teams: computed(() => teamStore.teams),
            teamDefaultImg,
            //table
            tableHeader,

            showEditTeamModal,
            selectedTeam,
            editTeam,
            updateTeam,
            cancelEdit,
            errorMessage,
            showNewTeamModal,
            createTeam,
            newTeam,
            createNewTeam,
            cancelAddNewTeam,
            removeTeam,       
            fetchTeams,
            file,

            showDeleteDialog,
            selectedDeleteItemId,
            deleteAction,
            confirmDelete,
            cancelDeleteDialog,
            openDeleteDialog,
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
