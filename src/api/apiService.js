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
        // Nem todo erro vem “redondinho”, proteja-se
        const status = error?.response?.status;
        const data   = error?.response?.data;

        let mensagem =
            data?.mensagem ||          // campo padrão que você já recebe
            data?.titulo   ||          // fallback
            error.message   || 'Erro inesperado.';

        // Exibe toast para qualquer status >= 400
        if (status >= 400) {
            toast.error(mensagem, { autoClose: 5000 });
        }

        // Continua rejeitando para permitir tratamento pontual
        return Promise.reject(error);
    }
);



export default api;