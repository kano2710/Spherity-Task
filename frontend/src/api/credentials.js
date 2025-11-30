import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const credentialsApi = {
    async issueCredential(data) {
        const response = await axios.post(`${API_BASE_URL}/credentials/issue`, {
            ...data
        });
        return response.data;
    },

    async getAllCredentials() {
        const response = await axios.get(`${API_BASE_URL}/credentials`);
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