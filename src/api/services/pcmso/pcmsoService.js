import apiService from '../../apiService';

const pcmsoService = {

  getPcmsoById: async (id) => {
    const response = await apiService.get(`/pcmso/${id}`);
    return response.data;
  },

  createPcmso: async (pcmsoData, imagemCapaFile) => {

    const formData = new FormData();


    formData.append('pcmso', new Blob([JSON.stringify(pcmsoData)], {
        type: 'application/json'
    }));


    if (imagemCapaFile) {
        formData.append('imagemCapa', imagemCapaFile);
    }


    const response = await apiService.post('/pcmso', formData);
    return response.data;
  },

  updatePcmso: async (id, pcmsoData, imagemCapaFile) => {
    const formData = new FormData();

    formData.append('pcmso', new Blob([JSON.stringify(pcmsoData)], {
      type: 'application/json'
    }));

    if (imagemCapaFile) {
      formData.append('imagemCapa', imagemCapaFile);
    }

    const response = await apiService.put(`/pcmso/${id}`, formData);
    return response.data;
  },

  inactivatePcmso: async (id) => {
    const response = await apiService.patch(`/pcmso/${id}/inactivate`);
    return response.data;
  },

  async getPcmsos(page = 0, size = 5, sort = 'id,desc', empresaId, unidadeId, status) {
        try {
            const params = {
                page,
                size,
                sort,
            };
            if (empresaId) params.empresaId = empresaId;
            if (unidadeId) params.unidadeId = unidadeId;
            if (status) params.status = status;

            const response = await apiService.get('/pcmso', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar PCMSOs:", error);
            throw error;
        }
  },

  async deletePcmso(id) {
        try {
            await apiService.delete(`/pcmso/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar PCMSO com ID ${id}:`, error);
            throw error;
        }
  }
};

export default pcmsoService;