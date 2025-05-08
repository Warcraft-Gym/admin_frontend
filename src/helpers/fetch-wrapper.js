import { useAuthStore } from '@/stores';

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE'),
    fileUpload: request('FILE_UPLOAD'),
    getFile: request('GET_FILE')
};

function request(method) {
    return async (url, body) => {  // Mark as async
        let requestMethod = method;
        let fileUpload = false;
        let receiveBinary = false;

        if (requestMethod === "FILE_UPLOAD") {
            requestMethod = "POST";
            fileUpload = true;
        }
        if (requestMethod === "GET_FILE") {
            requestMethod = "GET";
            receiveBinary = true;
        }

        // **Wait for headers to be resolved before passing them**
        const headers = await authHeader(requestMethod, url);
        const requestOptions = { method: requestMethod, headers };

        if (body) {
            if (fileUpload) {
                requestOptions.body = body;
            } else {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
        }

        // **Await the fetch response**
        const response = await fetch(url, requestOptions);
        return handleResponse(response, receiveBinary); // Awaiting inside handleResponse
    };
}

async function authHeader(method, url) {
    const authstore = useAuthStore();
    const user = authstore.user;
    const isRestricted = ['POST', 'PUT', 'DELETE'].includes(method);
    const isLoggedIn = !!user?.access_token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL);
    const isRefreshUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL + "/refresh");
    const isLoginUrl = url.startsWith(import.meta.env.VITE_BACKEND_URL + "/login");

    if (isLoginUrl) {
        return {};
    }
    if (isRefreshUrl) {
        return { Authorization: `Bearer ${user.refresh_token}` };
    } 
    if (isRestricted && isLoggedIn && isApiUrl) {
        if (authstore.isTokenExpired(user.access_token)) {
            await authstore.refresh(user.refresh_token); // Ensuring refresh completes before proceeding
        }
        return { Authorization: `Bearer ${authstore.user.access_token}` };
    } 
    return {};
}

async function handleResponse(response, receiveBinary) {
    if (!response.ok) {
        const { user, logout } = useAuthStore();

        if ([401, 403].includes(response.status) && user) {
            logout(); // Logout on unauthorized access
        }

        // **Properly await the response before rejecting**
        const text = await response.text();
        let error;

        try {
            error = text ? JSON.parse(text) : text;
        } catch (parseError) {
            error = text; // Fallback if parsing fails
        }
        
        return Promise.reject(error);
    }

    if (receiveBinary) {
        return response;
    }

    const text = await response.text();
    try {
        return text ? JSON.parse(text) : text;
    } catch (parseError) {
        return text;
    }
}
