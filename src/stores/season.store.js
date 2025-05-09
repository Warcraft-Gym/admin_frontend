import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useSeasonStore = defineStore({
    id: 'seasonStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        seasons: [], // Store user data
        current_season: {}
    }),
    actions: {
        async fetchSeasons() {
            const resp = await fetchWrapper.get(`${backendUrl}/seasons`);
            this.seasons =  resp
        },
        async fetchSeason(season_id){
            this.current_season = await fetchWrapper.get(`${backendUrl}/seasons/${season_id}`);
        },
        async updateSeason(season) {
            const seasonId = season.id;
            const updatedSeason = await fetchWrapper.put(`${backendUrl}/seasons/${seasonId}`, season);
        },
        async createSeason(season) {
            const updatedSeason = await fetchWrapper.post(`${backendUrl}/seasons`, season);
        },
        async deleteSeason(season_id) {
            await fetchWrapper.delete(`${backendUrl}/seasons/${season_id}`);
        },
        async addTeamsToSeason(season_id, team_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/seasons/addTeams/${season_id}`, {'team_ids': team_ids});
        },
        async removeTeamsFromSeason(season_id, team_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/seasons/removeTeams/${season_id}`, {'team_ids': team_ids});
        },
        async addMapsToSeason(season_id, map_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/seasons/addMaps/${season_id}`, {'map_ids': map_ids});
        },
        async removeMapsFromSeason(season_id, map_ids) {
            const updatedTeam = await fetchWrapper.post(`${backendUrl}/seasons/removeMaps/${season_id}`, {'map_ids': map_ids});
        },
        async uploadSeasonFile(season_id, season_name, file){
            let url = null
            if (season_id != null){
                url = `${backendUrl}/import?season_id=${season_id}`
            } else if (season_name != null && season_name != ''){
                url = `${backendUrl}/import?season_name=${season_name}`
            } else {
                return false;
            }
            const formData = new FormData();
            formData.append("file", file);
            await fetchWrapper.fileUpload(url, formData)
            return true;
        }
    }
});
