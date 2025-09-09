import apiService from '../../apiService'; // Verifique se este é o caminho correto para sua configuração do axios

const ltcatService = {
    getLtcatById: async (id) => {
        try {
            const response = await apiService.get(`/ltcat/${id}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar LTCAT por ID:", error);
            throw error;
        }
    },

    createLtcat: async (ltcatData) => {
        try {
            const response = await apiService.post('/ltcat', ltcatData);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar LTCAT:", error);
            throw error;
        }
    },

    updateLtcat: async (id, ltcatData) => {
        try {
            const response = await apiService.put(`/ltcat/${id}`, ltcatData);
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar LTCAT:", error);
            throw error;
        }
    },
};

export default ltcatService;