import { defineStore } from 'pinia';

import { fetchWrapper, router } from '@/helpers';

const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')),
        returnUrl: null
    }),
    actions: {
        async login(token) {
            console.log(`Send Login request to: ${backendUrl}/login`)
            const user = await fetchWrapper.post(`${backendUrl}/login`, { token: token });
            console.log("User response: " + JSON.stringify(user))
            // update pinia state
            this.user = user;

            // store user details and jwt in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            // redirect to previous url or default to home page
            router.push(this.returnUrl || '/');
        },
        async refresh() {
            console.log(`Send Login request to: ${backendUrl}/refresh`)
            const user = await fetchWrapper.post(`${backendUrl}/refresh`);
            console.log("User response: " + JSON.stringify(user))
            // update pinia state
            this.user = user;

            // store user details and jwt in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            // redirect to previous url or default to home page
            router.push(this.returnUrl || '/');
        },
        logout() {
            this.user = null;
            localStorage.removeItem('user');
            router.push('/login');
        }
    }
});
