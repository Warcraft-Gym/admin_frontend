import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores';
import { HomeView, LoginView, PlayersView, SeasonsView, SeasonDetailsView, MatchDetailsView, SeasonTeamDetailsView, MapsView, TeamsView } from '@/views';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [
        { path: '/', component: HomeView },
        { path: '/login', component: LoginView },
        { path: '/seasons', component: SeasonsView },
        { path: '/players', component: PlayersView },
        { path: '/seasons/:id', component: SeasonDetailsView },
        { path: '/match/:id', component: MatchDetailsView},
        { path: '/team/:id/season/:season_id', component: SeasonTeamDetailsView},
        { path: '/maps', component: MapsView},
        { path: '/teams', component: TeamsView},
        
    ]
});

router.beforeEach(async (to) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();

    if (authRequired && !auth.user) {
        auth.returnUrl = to.fullPath;
        return '/login';
    }
    if(authRequired && auth.isTokenExpired(auth.user.access_token)) {
        if (auth.isTokenExpired(auth.user.refresh_token)) {
            auth.returnUrl = to.fullPath;
            return '/login';
        } else {
            auth.refresh(auth.user.refresh_token);
        }
    }
});
