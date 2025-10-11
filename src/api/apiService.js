import axios from 'axios';
import {toast} from "react-toastify";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        for (const key of Object.keys(params)) {
            const value = params[key];
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    searchParams.append(key, value.join(','));
                }
            } else if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        }
        return searchParams.toString();
    },
});

// Adiciona um interceptador de requisição
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response, // sucesso passa direto
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;

        if (status === 401 || status === 403) {
            toast.error("Sua sessão expirou. Por favor, faça login novamente.", { autoClose: 3000 });
            localStorage.removeItem('userToken');
            // Atraso para o usuário ver o toast
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
            return Promise.reject(new Error("Sessão expirada")); // Para a execução
        }

        let mensagem =
            data?.mensagem ||
            data?.titulo   ||
            error.message   || 'Erro inesperado.';

        if (status >= 400) {
            toast.error(mensagem, { autoClose: 5000 });
        }

        return Promise.reject(error);
    }
);



export default api;