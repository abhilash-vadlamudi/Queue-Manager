import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ Create Axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4315',
});

// ✅ Handle API Errors Globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const { status, data } = error.response;
            const errorMessage = data.message || "An error occurred.";
            
            if (status === 404) {
                toast.error(`${errorMessage}`);
            } else if (status === 500) {
                toast.error(`${errorMessage}`);
            } else if (status === 401) {
                toast.warning(`${errorMessage}`);
            } else {
                toast.error(`❌ Error ${status}: ${errorMessage}`);
            }
        } else if (error.request) {
            toast.error("❌ No response from server. Please check your connection.");
        } else {
            toast.error("❌ Request failed. Please try again.");
        }
        return Promise.reject(error);
    }
);

export default api;
