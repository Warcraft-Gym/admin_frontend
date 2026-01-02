import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`;

export const usePlayerCareerStatsStore = defineStore({
    id: 'playerCareerStats',
    state: () => ({
        stats: [],
        isLoading: false
    }),
    actions: {
        async fetchAll() {
            this.isLoading = true;
            try {
                const data = await fetchWrapper.get(`${backendUrl}/stats/career`);
                this.stats = data;
                return data;
            } finally {
                this.isLoading = false;
            }
        },
        async getById(id) {
            return await fetchWrapper.get(`${backendUrl}/stats/career/${id}`);
        },
        async update(id, data) {
            return await fetchWrapper.put(`${backendUrl}/stats/career/${id}`, data);
        },
        async delete(id) {
            return await fetchWrapper.delete(`${backendUrl}/stats/career/${id}`);
        },
        async recalculateAll() {
            return await fetchWrapper.post(`${backendUrl}/stats/career/recalculate`);
        },
        async importCsv(file) {
            const formData = new FormData();
            formData.append('file', file);
            return await fetchWrapper.postFile(`${backendUrl}/stats/career/import-csv`, formData);
        }
    }
});
