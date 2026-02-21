import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Flask backend port
});

export const getTransactions = () => api.get('/transactions');
export const addTransaction = (transaction) => api.post('/transactions', transaction);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export default api;
