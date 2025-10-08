import apiService from '../../apiService';

const afastamentoService = {
    create: async (payload) => {
        try {
            const response = await apiService.post('/afastamentos', payload);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar afastamento:", error);
            throw error;
        }
    },

    update: async (id, payload) => {
        try {
            const response = await apiService.put(`/afastamentos/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar afastamento ${id}:`, error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await apiService.get(`/afastamentos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar afastamento ${id}:`, error);
            throw error;
        }
    },
    
    getAfastamentosByFuncionario: async (funcionarioId) => {
        try {
            const response = await apiService.get(`/afastamentos/funcionario/${funcionarioId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar afastamentos para o funcionário ${funcionarioId}:`, error);
            throw error;
        }
    },

    getRecentes: async () => {
        try {
            const response = await apiService.get('/dashboard/afastamentos/recentes');
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar afastamentos recentes:", error);
            throw error;
        }
    },

    deleteAfastamento: async (id) => {
        try {
            const response = await apiService.delete(`/afastamentos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar afastamento ${id}:`, error);
            throw error;
        }
    },
};

export default afastamentoService;