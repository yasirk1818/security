import axios from 'axios';

// Axios ka aek naya instance banayen
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Aapka base API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// Har request se pehle yeh chalega
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
// Jab bhi response aye, yeh chalega
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 401 Unauthorized (token invalid ya expire)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // User ko login page par bhej den
            // Direct navigate yahan kaam nahi karega, isliye window.location use kar rahe hain
            if (window.location.pathname !== '/login') {
                alert('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
