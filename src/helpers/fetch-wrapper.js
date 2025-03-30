import { useAuthStore } from '@/stores';

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')
};

function request(method) {
    return (url, body) => {
        console.log("Method: ", method);
        
        const requestOptions = {
            method,
            headers: authHeader(method, url)
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        console.log("Send request to url : ", url, requestOptions)
        return fetch(url, requestOptions).then(handleResponse);
    }
}

function authHeader(method, url) {
    console.log("use authHeader")
    // return auth header with jwt if user is logged in and request is to the api url
    const authstore = useAuthStore();
    const user = authstore.user;
    const isRestricted = ['POST','PUT','DELETE'].includes(method);
    const isLoggedIn = !!user?.access_token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL);
    const isRefreshUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL+"/refresh");
    if (isRefreshUrl){
        return { Authorization: `Bearer ${user.refresh_token}` };
    } else if (isRestricted && isLoggedIn && isApiUrl) {
        if(authstore.isTokenExpired(user.access_token)) {
            authstore.refresh()
        }
        return { Authorization: `Bearer ${user.access_token}` };
    } else {
        return {};
    }
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        console.log(response);
        if (!response.ok) {
            const { user, logout } = useAuthStore();
            if ([401, 403].includes(response.status) && user) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                logout();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}    
