import axios from 'axios';
import {toast} from "react-toastify";


const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

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