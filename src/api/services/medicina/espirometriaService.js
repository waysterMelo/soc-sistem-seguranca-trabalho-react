import apiService from '../../apiService';

const espirometriaService = {
    createEspirometria: async (payload) => {
        try {
            const response = await apiService.post('/espirometria', payload);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar avaliação de espirometria:", error);
            throw error;
        }
    },

    getEspirometriaById: async (id) => {
        try {
            const response = await apiService.get(`/espirometria/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar avaliação de espirometria com ID ${id}:`, error);
            throw error;
        }
    },

    updateEspirometria: async (id, payload) => {
        try {
            const response = await apiService.put(`/espirometria/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar avaliação de espirometria com ID ${id}:`, error);
            throw error;
        }
    },

    getEspirometrias: async (page = 0, size = 10, sort = 'id,desc', empresaId, unidadeId, setorId) => {
        try {
            const params = new URLSearchParams({
                page,
                size,
                sort,
            });
            if (empresaId) params.append('empresaId', empresaId);
            if (unidadeId) params.append('unidadeId', unidadeId);
            if (setorId) params.append('setorId', setorId);

            const response = await apiService.get(`/espirometria?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar avaliações de espirometria:", error);
            throw error;
        }
    },

    deleteEspirometria: async (id) => {
        try {
            const response = await apiService.delete(`/espirometria/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar avaliação de espirometria com ID ${id}:`, error);
            throw error;
        }
    },
};

export default espirometriaService;
