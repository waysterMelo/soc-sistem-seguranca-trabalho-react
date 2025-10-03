import apiService from '../../apiService';

const riscoService = {
    // Placeholder function - assumes an endpoint exists to get risks by function ID
    getRiscosByFuncaoId: async (funcaoId) => {
        try {
            // The actual endpoint might be different, e.g., '/riscos/funcao/{funcaoId}'
            const response = await apiService.get(`/riscos?funcaoId=${funcaoId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar riscos para a função com ID ${funcaoId}:`, error);
            throw error;
        }
    },
};

export default riscoService;
