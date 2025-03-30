import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const usePlayerStore = defineStore({
    id: 'playerStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        players: [], // Store user data
        isLoading: false, // Track loading state
    }),
    actions: {
        async fetchPlayers() {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.get(`${backendUrl}/users`);
                this.players =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async updatePlayer(player) {
            const playerId = player.id;
            const updatedPlayer = await fetchWrapper.put(`${backendUrl}/users/${playerId}`, player);
        },
        async createPlayer(player) {
            const updatedPlayer = await fetchWrapper.post(`${backendUrl}/users`, player);
        },
        async deletePlayer(player_id) {
            await fetchWrapper.delete(`${backendUrl}/users/${player_id}`);
        }
    }
});
