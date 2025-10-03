import apiService from '../../apiService';

const asoService = {
     createAso: async (asoData, files = []) => {
        try {
            const formData = new FormData();

            // Mapeia os arquivos para incluir o nome original no payload JSON
            const examesComNomesDeArquivo = asoData.exames.map(exame => {
                const arquivoAssociado = files.find(f => f.exameId === exame.exameCatalogoId);
                return {
                    ...exame,
                    nomeArquivoOriginal: arquivoAssociado ? arquivoAssociado.file.name : null
                };
            });

            const payloadFinal = { ...asoData, exames: examesComNomesDeArquivo };

            formData.append('aso', new Blob([JSON.stringify(payloadFinal)], {
                type: 'application/json'
            }));

            // Adiciona os arquivos de exame
            files.forEach(item => {
                formData.append('files', item.file);
            });

            const response = await apiService.post('/aso', formData);
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

    getAsosByFuncionario: async (funcionarioId) => {
        try {
            const response = await apiService.get(`/aso/funcionario/${funcionarioId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar ASOs para o funcionário ${funcionarioId}:`, error);
            throw error;
        }
    },

    // Assuming an endpoint for file uploads related to exams
    uploadExameAnexo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiService.post('/aso/exames/upload', formData);
            return response.data; // Should return path or ID
        } catch (error) {
            console.error("Erro ao fazer upload do anexo do exame:", error);
            throw error;
        }
    },
};

export default asoService;
