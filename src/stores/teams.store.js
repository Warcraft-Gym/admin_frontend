import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useTeamStore = defineStore({
    id: 'seasonStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        teams: [], // Store teams data
        isLoading: false, // Track loading state
    }),
    actions: {
        async fetchTeams() {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.get(`${backendUrl}/teams`);
                this.teams =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async fetchTeamsBySeason(season_id) {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.get(`${backendUrl}/teams/season/${season_id}`);
                this.teams =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async updateTeam(team) {
            const teamId = team.id;
            const updatedTeam = await fetchWrapper.put(`${backendUrl}/teams/${teamId}`, team);
        },
        async createTeam(team) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/teams`, team);
        },
        async deleteTeam(team_id) {
            await fetchWrapper.delete(`${backendUrl}/teams/${team_id}`);
        },
        async searchTeams(search) {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.post(`${backendUrl}/teams/search?query=${search}`);
                this.teams =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async addPlayersToTeamForSeason(team_id, season_id, player_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/teams/addPlayers/${team_id}/season/${season_id}`, {'player_ids': player_ids});
        },
        async removePlayersFromTeamForSeason(team_id, season_id, player_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/teams/removePlayers/${team_id}/season/${season_id}`, {'player_ids': player_ids});
        }
    }
});
