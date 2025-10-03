import apiService from '../../apiService';

const asoService = {
    createAso: async (payload) => {
        try {
            const response = await apiService.post('/aso', payload);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar ASO:", error);
            throw error;
        }
    },

    getAsoById: async (id) => {
        try {
            const response = await apiService.get(`/aso/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar ASO com ID ${id}:`, error);
            throw error;
        }
    },

    updateAso: async (id, payload) => {
        try {
            const response = await apiService.put(`/aso/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar ASO com ID ${id}:`, error);
            throw error;
        }
    },

    getAsos: async (params) => {
        try {
            const response = await apiService.get('/aso', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar ASOs:", error);
            throw error;
        }
    },

    deleteAso: async (id) => {
        try {
            const response = await apiService.delete(`/aso/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar ASO com ID ${id}:`, error);
            throw error;
        }
    },

    // Assuming an endpoint for file uploads related to exams
    uploadExameAnexo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiService.post('/aso/exames/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data; // Should return path or ID
        } catch (error) {
            console.error("Erro ao fazer upload do anexo do exame:", error);
            throw error;
        }
    },
};

export default asoService;
