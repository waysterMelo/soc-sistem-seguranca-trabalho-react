import apiService from '../../apiService';

const ltipService = {
  getLtipById: async (id) => {
    const response = await apiService.get(`/ltip/${id}`);
    return response.data;
  },

  createLtip: async (ltipData, imagemCapaFile) => {
    const formData = new FormData();

    // Adiciona os dados do formulário como um JSON Blob
    formData.append('ltip', new Blob([JSON.stringify(ltipData)], {
        type: 'application/json'
    }));

    // Adiciona a imagem se ela existir
    if (imagemCapaFile) {
        formData.append('imagemCapa', imagemCapaFile);
    }

    const response = await apiService.post('/ltip', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  },

  updateLtip: async (id, ltipData, imagemCapaFile) => {
    const formData = new FormData();

    formData.append('ltip', new Blob([JSON.stringify(ltipData)], {
      type: 'application/json'
    }));

    if (imagemCapaFile) {
      formData.append('imagemCapa', imagemCapaFile);
    }

    const response = await apiService.put(`/ltip/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  },

  inactivateLtip: async (id) => {
    const response = await apiService.patch(`/ltip/${id}/inactivate`);
    return response.data;
  },

  async getLtps(page = 0, size = 5) {
        try {
            const params = { page, size, sort: 'id,desc' };
            const response = await apiService.get('/ltip', { params });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar LTIPs:", error);
            throw error;
        }
  },

  async deleteLtip(id) {
        try {
            await apiService.delete(`/ltip/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar LTIP com ID ${id}:`, error);
            throw error;
        }
  }
};

export default ltipService;