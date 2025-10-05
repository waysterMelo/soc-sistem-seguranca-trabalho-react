import apiService from '../../../apiService.js';

const setorService = {
    // Busca setores de uma empresa específica
    getSetoresByEmpresa: async (empresaId, params = {}) => {
        try {
            const response = await apiService.get(`/setores/com-funcoes`, {
                params: { ...params, empresaId, sort: params.sort || 'nome,asc' }
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar setores para a empresa ${empresaId}:`, error);
            throw error;
        }
    },
};

export default setorService;