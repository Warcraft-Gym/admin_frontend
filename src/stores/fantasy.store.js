import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`;

export const useFantasyStore = defineStore({
    id: 'fantasy',
    state: () => ({
        teams: [],
        bets: [],
        currentTeam: null,
        isLoading: false
    }),
    actions: {
        async fetchTeams() {
            this.isLoading = true;
            try {
                const result = await fetchWrapper.get(`${backendUrl}/fantasy/teams`);
                this.teams = result || [];
                return this.teams;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchTeam(teamId) {
            this.isLoading = true;
            try {
                this.currentTeam = await fetchWrapper.get(`${backendUrl}/fantasy/teams/${teamId}`);
                return this.currentTeam;
            } finally {
                this.isLoading = false;
            }
        },

        async createTeam(team) {
            return await fetchWrapper.post(`${backendUrl}/fantasy/teams`, team);
        },

        async updateTeam(teamId, team) {
            return await fetchWrapper.put(`${backendUrl}/fantasy/teams/${teamId}`, team);
        },

        async deleteTeam(teamId) {
            await fetchWrapper.delete(`${backendUrl}/fantasy/teams/${teamId}`);
            this.teams = this.teams.filter(t => t.id !== teamId);
        },

        async addPlayers(teamId, playerIds) {
            return await fetchWrapper.post(`${backendUrl}/fantasy/teams/addPlayers/${teamId}`, { player_ids: playerIds });
        },

        async removePlayers(teamId, playerIds) {
            return await fetchWrapper.post(`${backendUrl}/fantasy/teams/removePlayers/${teamId}`, { player_ids: playerIds });
        },

        async searchTeams(query) {
            this.isLoading = true;
            try {
                const result = await fetchWrapper.post(`${backendUrl}/fantasy/teams/search?query=${encodeURIComponent(query)}`);
                this.teams = result || [];
                return this.teams;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchBets() {
            this.isLoading = true;
            try {
                const result = await fetchWrapper.get(`${backendUrl}/fantasy/bets`);
                this.bets = result || [];
                return this.bets;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchBet(betId) {
            return await fetchWrapper.get(`${backendUrl}/fantasy/bets/${betId}`);
        },

        async createBet(bet) {
            return await fetchWrapper.post(`${backendUrl}/fantasy/bets`, bet);
        },

        async updateBet(betId, bet) {
            return await fetchWrapper.put(`${backendUrl}/fantasy/bets/${betId}`, bet);
        },

        async deleteBet(betId) {
            await fetchWrapper.delete(`${backendUrl}/fantasy/bets/${betId}`);
            this.bets = this.bets.filter(b => b.id !== betId);
        },

        async searchBets(query) {
            this.isLoading = true;
            try {
                const result = await fetchWrapper.post(`${backendUrl}/fantasy/bets/search?query=${encodeURIComponent(query)}`);
                this.bets = result || [];
                return this.bets;
            } finally {
                this.isLoading = false;
            }
        },

        async calculateSeasonScores(seasonId) {
            return await fetchWrapper.post(`${backendUrl}/fantasy/season/${seasonId}/calculate/`);
        },

        // Public endpoints (token-based, no JWT required)
        async public_getUserInfo(token) {
            const response = await fetch(`${backendUrl}/user-info?token=${token}`);
            if (!response.ok) {
                throw new Error('Invalid or expired token');
            }
            return await response.json();
        },

        async public_createFantasyTeam(payload) {
            const response = await fetch(`${backendUrl}/fantasy-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            
            return await response.json();
        }
    }
});
