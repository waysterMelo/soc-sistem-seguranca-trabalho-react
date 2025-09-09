import apiService from '../../apiService.js';

const agenteNocivoService = {
    // Busca agentes nocivos de forma paginada
    getAgentesNocivos: async (page = 0, size = 5, search = '') => {
        try {
            const params = {
                page,
                size,
                descricao: search,
                codigo: search
            };
            const response = await apiService.get('/agente-nocivo/buscar', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar agentes nocivos:", error);
            throw error;
        }
    },
};

export default agenteNocivoService;