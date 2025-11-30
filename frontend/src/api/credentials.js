import axios from 'axios';
import { getUserId } from '../utils/userSession';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const credentialsApi = {
    async issueCredential(data) {
        const userId = getUserId();
        const response = await axios.post(`${API_BASE_URL}/credentials/issue`, {
            ...data,
            userId
        });
        return response.data;
    },

    async getAllCredentials() {
        const userId = getUserId();
        const response = await axios.get(`${API_BASE_URL}/credentials?userId=${userId}`);
        return response.data;
    },

    async getCredentialById(id) {
        const response = await axios.get(`${API_BASE_URL}/credentials/${id}`);
        return response.data;
    },

    async verifyCredential(token) {
        const response = await axios.post(`${API_BASE_URL}/credentials/verify`, { token });
        return response.data;
    },

    async deleteCredential(id) {
        await axios.delete(`${API_BASE_URL}/credentials/${id}`);
    }
}