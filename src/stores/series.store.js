import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useSeriesStore = defineStore({
    id: 'seriesStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        series: [], // Store user data
        isLoading: false, // Track loading state
    }),
    actions: {
        async updateSeries(series) {
            const seriesId = series.id;
            const updatedSeries = await fetchWrapper.put(`${backendUrl}/series/${seriesId}`, series);
        },
        async createSeries(series) {
            const updatedSeries = await fetchWrapper.post(`${backendUrl}/series`, series);
        },
        async deleteSeries(series_id) {
            await fetchWrapper.delete(`${backendUrl}/series/${series_id}`);
        },
        async searchSeries(search) {
            try{
                this.isLoading = true; // Set loading to true
                const resp = await fetchWrapper.post(`${backendUrl}/series/search?query=${search}`);
                this.series =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async getSeriesByMatchId(match_id) {
            try{
                this.isLoading = true; // Set loading to true
                search = `match_id == ${match_id}`
                const resp = await fetchWrapper.post(`${backendUrl}/series/search?query=${search}`);
                this.series =  resp
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async searchSeriesBySeason(season_id, search) {
            try{
                this.isLoading = true; // Set loading to true
                if (search){
                    this.series = await fetchWrapper.post(`${backendUrl}/series/season/${season_id}/search?query=${search}`);
                } else {
                    this.series = await fetchWrapper.post(`${backendUrl}/series/season/${season_id}/search`);
                }
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        },
        async searchSeriesBySeasonAndPlayday(season_id, playday, search) {
            try{
                this.isLoading = true; // Set loading to true
                if (search){
                    this.series = await fetchWrapper.post(`${backendUrl}/series/season/${season_id}/playday/${playday}/search?query=${search}`);
                } else {
                    this.series = await fetchWrapper.post(`${backendUrl}/series/season/${season_id}/playday/${playday}/search`);
                }
            } finally {
                this.isLoading = false; // Set loading to false once complete
            }
        }
    }
});
