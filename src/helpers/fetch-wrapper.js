import { useAuthStore } from '@/stores';

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE'),
    fileUpload: request('FILE_UPLOAD')
};

function request(method) {
    return (url, body) => {
        let requestMethod = method
        let fileUpload = false;
        if (requestMethod == "FILE_UPLOAD") {
            requestMethod = "POST"
            fileUpload = true
        }
        const requestOptions = {
            method: requestMethod,
            headers: authHeader(requestMethod, url)
        };
        if (body) {
            if (fileUpload) {
                requestOptions.body = body;
            } else {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
        }
        return fetch(url, requestOptions).then(handleResponse);
    }
}

function authHeader(method, url) {
    // return auth header with jwt if user is logged in and request is to the api url
    const authstore = useAuthStore();
    const user = authstore.user;
    const isRestricted = ['POST','PUT','DELETE'].includes(method);
    const isLoggedIn = !!user?.access_token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL);
    const isRefreshUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL+"/refresh");
    const isLoginUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL+"/login");
    if (isLoginUrl){
        return {};
    }if (isRefreshUrl){
        return { Authorization: `Bearer ${user.refresh_token}` };
    } else if (isRestricted && isLoggedIn && isApiUrl) {
        if(authstore.isTokenExpired(user.access_token)) {
            authstore.refresh(user.refresh_token)
        }
        return { Authorization: `Bearer ${user.access_token}` };
    } else {
        return {};
    }
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
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
