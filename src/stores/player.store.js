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
                this.players = resp

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
        },
        async searchPlayer( name, race, minMMR, maxMMR ) {
            let queryString = ''
            let queryADD = false

            //Name
            if( name ) {
                queryString += 'name ilike ' + name
                queryADD = true
            }
            //Race
            if ( race ) {
                if( queryADD ) queryString += ' and '
                queryString += 'race == ' + race                
                queryADD = true
            }
            //MMR
            if ( minMMR && maxMMR ) {
                if( queryADD ) queryString += ' and '
                queryString += 'mmr >= ' + minMMR + ' and ' + 'mmr <= ' + maxMMR 
                queryADD = true
            }

            const resp = await fetchWrapper.post(`${backendUrl}/users/search?query=`+queryString);
            this.players = resp
        }
    }
});
