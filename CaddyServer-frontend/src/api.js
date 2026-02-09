import axios from 'axios';

// Axios Instance
const api = axios.create({
    baseURL: '/api'
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('caddy-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('caddy-token');
            localStorage.removeItem('caddy-user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
