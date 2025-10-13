import apiService from '../../apiService';

const ltcatService = {

  getLtcatById: async (id) => {
    const response = await apiService.get(`/ltcat/${id}`);
    return response.data;
  },

  createLtcat: async (ltcatData, imagemCapaFile) => {
  
    const formData = new FormData();

  
    formData.append('ltcat', new Blob([JSON.stringify(ltcatData)], {
        type: 'application/json'
    }));

  
    if (imagemCapaFile) {
        formData.append('imagemCapa', imagemCapaFile);
    }


    const response = await apiService.post('/ltcat', formData);
    return response.data;
  },

  updateLtcat: async (id, ltcatData, imagemCapaFile) => {
    const formData = new FormData();

    formData.append('ltcat', new Blob([JSON.stringify(ltcatData)], {
      type: 'application/json'
    }));

    if (imagemCapaFile) {
      formData.append('imagemCapa', imagemCapaFile);
    }

    const response = await apiService.put(`/ltcat/${id}`, formData);
    return response.data;
  },

  inactivateLtcat: async (id) => {
    const response = await apiService.patch(`/ltcat/${id}/inactivate`);
    return response.data;
  },

  async getLtcats(page = 0, size = 5, filters = {}) {
        try {
            const params = {
                page,
                size,
                sort: 'id,desc',
                ...filters,
            };
            
            Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

            const response = await apiService.get('/ltcat', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar LTCATs:", error);
            throw error;
        }
  },

  async deleteLtcat(id) {
        try {
            await apiService.delete(`/ltcat/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar LTCAT com ID ${id}:`, error);
            throw error;
        }
  },

  gerarRelatorioHtml: async (ltcatId) => {
    try {
      const response = await apiService.get(`/ltcat/${ltcatId}/report`, {
        responseType: 'text',
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar relatório HTML para o LTCAT ${ltcatId}:`, error);
      throw error;
    }
  }
};

export default ltcatService;
