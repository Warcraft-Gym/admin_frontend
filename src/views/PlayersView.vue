<template>
    <div>
      <h1>Player Information</h1>
        <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading">Loading Players...</div>
      <table v-else-if="players.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>BattleTag</th>
            <th>Country</th>
            <th>Discord Tag</th>
            <th>MMR</th>
            <th>Race</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.id">
            <td>{{ player.id }}</td>
            <td>{{ player.name }}</td>
            <td>{{ player.battleTag }}</td>
            <td>{{ player.country }}</td>
            <td>{{ player.discordTag }}</td>
            <td>{{ player.mmr }}</td>
            <td>{{ player.race }}</td>
            <td>
            <button @click="editPlayer(player)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- No Users Found Message -->
      <div v-else>No users found.</div>

        <!-- Popup Modal -->
        <div v-if="selectedPlayer" :class="['modal', selectedPlayer ? 'modal-active' : '']" class="modal">
          <div class="modal-content">
            <h2>Edit User: {{ selectedPlayer.name }}</h2>
            <form @submit.prevent="updatePlayer">
              <div>
                <label for="name">Name:</label>
                <input id="name" v-model="selectedPlayer.name" />
              </div>
              <div>
                <label for="battleTag">BattleTag:</label>
                <input id="battleTag" v-model="selectedPlayer.battleTag" />
              </div>
              <div>
                <label for="country">Country:</label>
                <input id="country" v-model="selectedPlayer.country" />
              </div>
              <div>
                <label for="discordTag">Discord Tag:</label>
                <input id="discordTag" v-model="selectedPlayer.discordTag" />
              </div>
              <div>
                <label for="mmr">MMR:</label>
                <input id="mmr" type="number" v-model="selectedPlayer.mmr" />
              </div>
              <div>
                <label for="race">Race:</label>
                <input id="race" v-model="selectedPlayer.race" />
              </div>
              <button type="submit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </form>
          </div>
        </div>
        <!-- Modal Overlay -->
        <div v-if="selectedPlayer" class="overlay" @click="cancelEdit"></div>
    </div>
</template>

<script>
import { usePlayerStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';
// State for editing
const selectedPlayer = ref(null);
const isLoading  = ref(false); // State for selected user
const errorMessage = ref(null);

export default {
    name: 'PlayersView',
    setup(){
        const playerStore = usePlayerStore();
        // Fetch data when the page is loaded

        // Fetch users when the component is mounted
        const fetchPlayers = async () => {
          isLoading.value = true;
          errorMessage.value = null; // Reset error message
          try {
            await playerStore.fetchPlayers(); // Fetch user data
            if (playerStore.players.length === 0) {
              errorMessage.value = 'No users found.';
            }
          } catch (error) {
            errorMessage.value = 'Failed to load users. Please try again later.';
          } finally {
            isLoading.value = false;
          }
        };


        onMounted(() => {
          fetchPlayers();
        });

        // Methods
        const editPlayer = (player) => {
          selectedPlayer.value = { ...player }; // Clone the user object to avoid modifying the original object directly
        };

        const updatePlayer = async () => {
          try {
            await playerStore.updatePlayer(selectedPlayer.value);
            // Update the local state after a successful PUT request
            await fetchPlayers(); // Re-fetch the users
            cancelEdit(); // Reset the form
          } catch (error) {
            console.error('Error updating user:', error);
          }
        };

        const cancelEdit = () => {
          selectedPlayer.value = null; // Clear the selected user
        };

        return {
            isLoading: computed(() => playerStore.isLoading),
            players: computed(() => playerStore.players),
            selectedPlayer,
            editPlayer,
            updatePlayer,
            cancelEdit,
        }
    },
};
</script>

<style>
/* Table styling */
table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  background-color: #f2f2f2;
  padding: 10px;
  border: 1px solid #ddd;
}

tbody td {
  padding: 10px;
  border: 1px solid #ddd;
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

/* Buttons */
button {
  margin-right: 10px;
}

.modal.modal-active {
  display: block; /* Visible state */
}

</style>
