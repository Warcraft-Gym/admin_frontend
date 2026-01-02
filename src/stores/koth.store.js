import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`;

export const useKothStore = defineStore({
    id: 'kothStore',
    state: () => ({
        events: [],
        activeEvent: null,
        signups: [],
        matches: [],
        kings: {},
        isLoading: false,
    }),
    actions: {
        // ============ Event Actions ============
        async fetchAllEvents() {
            try {
                this.isLoading = true;
                this.events = await fetchWrapper.get(`${backendUrl}/koth/events`);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchActiveEvent() {
            try {
                this.isLoading = true;
                this.activeEvent = await fetchWrapper.get(`${backendUrl}/koth/events/active`);
                return this.activeEvent;
            } catch (error) {
                this.activeEvent = null;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchEvent(eventId) {
            try {
                this.isLoading = true;
                const event = await fetchWrapper.get(`${backendUrl}/koth/events/${eventId}`);
                this.activeEvent = event;
                return event;
            } finally {
                this.isLoading = false;
            }
        },

        async createEvent(eventData) {
            const newEvent = await fetchWrapper.post(`${backendUrl}/koth/events`, eventData);
            this.events.push(newEvent);
            return newEvent;
        },

        async updateEvent(eventId, eventData) {
            const updatedEvent = await fetchWrapper.put(`${backendUrl}/koth/events/${eventId}`, eventData);
            const index = this.events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                this.events[index] = updatedEvent;
            }
            if (this.activeEvent && this.activeEvent.id === eventId) {
                this.activeEvent = updatedEvent;
            }
            return updatedEvent;
        },

        async activateEvent(eventId) {
            const activatedEvent = await fetchWrapper.post(`${backendUrl}/koth/events/${eventId}/activate`);
            // Update all events to reflect new active status
            await this.fetchAllEvents();
            this.activeEvent = activatedEvent;
            return activatedEvent;
        },

        async deleteEvent(eventId) {
            await fetchWrapper.delete(`${backendUrl}/koth/events/${eventId}`);
            this.events = this.events.filter(e => e.id !== eventId);
            if (this.activeEvent && this.activeEvent.id === eventId) {
                this.activeEvent = null;
            }
        },

        // ============ Signup Actions ============
        async fetchSignups(eventId) {
            try {
                this.isLoading = true;
                this.signups = await fetchWrapper.get(`${backendUrl}/koth/events/${eventId}/signups`);
                return this.signups;
            } finally {
                this.isLoading = false;
            }
        },

        async createSignup(signupData) {
            // Admin endpoint - requires JWT authentication
            const newSignup = await fetchWrapper.post(`${backendUrl}/koth/signups/admin`, signupData);
            this.signups.push(newSignup);
            return newSignup;
        },

        async createPublicSignup(signupData) {
            // Public endpoint - uses GET with query parameters and KOTH_NIGHTBOT_TOKEN
            const params = new URLSearchParams({
                token: signupData.token,
                battletag: signupData.battle_tag,
            });
            
            if (signupData.twitch_username) {
                params.append('twitch', signupData.twitch_username);
            }
            if (signupData.race) {
                params.append('race', signupData.race);
            }
            
            const response = await fetchWrapper.get(`${backendUrl}/koth/signup?${params.toString()}`);
            return response;
        },

        async deleteSignup(signupId) {
            await fetchWrapper.delete(`${backendUrl}/koth/signups/${signupId}`);
            this.signups = this.signups.filter(s => s.id !== signupId);
        },

        async updateSignupBracket(signupId, bracket) {
            const updatedSignup = await fetchWrapper.put(
                `${backendUrl}/koth/signups/${signupId}/bracket`,
                { bracket }
            );
            const index = this.signups.findIndex(s => s.id === signupId);
            if (index !== -1) {
                this.signups[index] = updatedSignup;
            }
            return updatedSignup;
        },

        async setKing(signupId) {
            const updatedSignup = await fetchWrapper.post(`${backendUrl}/koth/signups/${signupId}/king`);
            // Update signups to reflect new king status
            const bracket = updatedSignup.bracket;
            this.signups = this.signups.map(s => {
                if (s.bracket === bracket && s.id !== signupId) {
                    return { ...s, is_king: 0 };
                } else if (s.id === signupId) {
                    return updatedSignup;
                }
                return s;
            });
            return updatedSignup;
        },

        async addKing(signupId) {
            const updatedSignup = await fetchWrapper.post(`${backendUrl}/koth/signups/${signupId}/add-king`);
            const index = this.signups.findIndex(s => s.id === signupId);
            if (index !== -1) {
                this.signups[index] = updatedSignup;
            }
            return updatedSignup;
        },

        async unsetKing(signupId) {
            const updatedSignup = await fetchWrapper.delete(`${backendUrl}/koth/signups/${signupId}/king`);
            const index = this.signups.findIndex(s => s.id === signupId);
            if (index !== -1) {
                this.signups[index] = updatedSignup;
            }
            return updatedSignup;
        },

        // ============ Match Actions ============
        async fetchMatches(eventId) {
            try {
                this.isLoading = true;
                this.matches = await fetchWrapper.get(`${backendUrl}/koth/events/${eventId}/matches`);
                return this.matches;
            } finally {
                this.isLoading = false;
            }
        },

        async createMatch(matchData) {
            const newMatch = await fetchWrapper.post(`${backendUrl}/koth/matches`, matchData);
            this.matches.push(newMatch);
            return newMatch;
        },

        async updateMatch(matchId, matchData) {
            const updatedMatch = await fetchWrapper.put(`${backendUrl}/koth/matches/${matchId}`, matchData);
            const index = this.matches.findIndex(m => m.id === matchId);
            if (index !== -1) {
                this.matches[index] = updatedMatch;
            }
            return updatedMatch;
        },

        async updateMatchResult(matchId, winnerTeamNumber) {
            const updatedMatch = await fetchWrapper.put(
                `${backendUrl}/koth/matches/${matchId}/result`,
                { winner_team_number: winnerTeamNumber }
            );
            const index = this.matches.findIndex(m => m.id === matchId);
            if (index !== -1) {
                this.matches[index] = updatedMatch;
            }
            // Refresh signups to get updated king status
            if (this.activeEvent) {
                await this.fetchSignups(this.activeEvent.id);
            }
            return updatedMatch;
        },

        async deleteMatch(matchId) {
            await fetchWrapper.delete(`${backendUrl}/koth/matches/${matchId}`);
            this.matches = this.matches.filter(m => m.id !== matchId);
        },

        // ============ Utility Actions ============
        async fetchBracketKings(eventId) {
            try {
                this.kings = await fetchWrapper.get(`${backendUrl}/koth/events/${eventId}/kings`);
                return this.kings;
            } catch (error) {
                this.kings = {};
                throw error;
            }
        },

        // ============ Helper Methods ============
        getSignupsByBracket(bracket) {
            return this.signups
                .filter(s => s.bracket === bracket && s.is_active === 1)
                .sort((a, b) => b.mmr - a.mmr);
        },

        getMatchesByBracket(bracket) {
            return this.matches
                .filter(m => m.bracket === bracket)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        },

        getBracketThresholdText(event) {
            if (!event) return {};
            return {
                1: `< ${event.bracket_1_threshold} MMR`,
                2: `${event.bracket_1_threshold} - ${event.bracket_2_threshold - 1} MMR`,
                3: `≥ ${event.bracket_2_threshold} MMR`
            };
        }
    }
});
