import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('Erro na resposta:', error.response.data);
            console.error('Status:', error.response.status);
        } else if (error.request) {
            console.error('Erro na requisição:', error.request);
        } else {
            console.error('Erro:', error.message);
        }
        return Promise.reject(error);
    }
);


export default api;