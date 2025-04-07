import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useMatchStore = defineStore({
    id: 'matchStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        matches: [], // Store user data
        isLoading: false, // Track loading state
    }),
    actions: {
        async updateMatch(match) {
            const matchId = match.id;
            const updatedMatch = await fetchWrapper.put(`${backendUrl}/matches/${matchId}`, match);
        },
        async createMatch(match) {
            const updatedMatch = await fetchWrapper.post(`${backendUrl}/matches`, match);
        },
        async deleteMatch(match_id) {
            await fetchWrapper.delete(`${backendUrl}/matches/${match_id}`);
        },
        async searchMatches(search) {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.post(`${backendUrl}/matches/search?query=${search}`);
                this.matches =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async searchMatchesBySeason(season_id) {
            try{
                this.isLoading = true; // Set loading to true
                search = `season_id == ${season_id}`
                const resp = await fetchWrapper.post(`${backendUrl}/matches/search?query=${search}`);
                this.matches =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async searchMatchesBySeasonAndPlayday(season_id, playday) {
            try{
                this.isLoading = true; // Set loading to true
                const search = `season_id == ${season_id} and playday == ${playday}`
                const resp = await fetchWrapper.post(`${backendUrl}/matches/search?query=${search}`);
                this.matches =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        }
    }
});
