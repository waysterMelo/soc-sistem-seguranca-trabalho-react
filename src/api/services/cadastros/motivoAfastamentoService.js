import apiService from '../../apiService';

const motivoAfastamentoService = {
    getMotivos: async (params = {}) => {
        try {
            const response = await apiService.get('/motivos-afastamento', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar motivos de afastamento:", error);
            throw error;
        }
    },
};

export default motivoAfastamentoService;