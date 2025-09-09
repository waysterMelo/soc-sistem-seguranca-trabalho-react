import apiService from '../../../apiService.js';

const setorService = {
    // Busca setores de uma empresa específica
    getSetoresByEmpresa: async (empresaId) => {
        try {
            // Ajuste o endpoint se for diferente
            const response = await apiService.get(`/setores/com-funcoes?empresaId=${empresaId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar setores para a empresa ${empresaId}:`, error);
            throw error;
        }
    },
};

export default setorService;