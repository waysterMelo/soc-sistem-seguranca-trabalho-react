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

    // A lógica para update é idêntica, mas usando o método PUT.
    const response = await apiService.put(`/ltcat/${id}`, formData);
    return response.data;
  },
};

export default ltcatService;