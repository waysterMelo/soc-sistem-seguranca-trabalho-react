import apiService from '../../apiService';

const nr16Service = {
  getAnexos: async () => {
    try {
      const response = await apiService.get('/nr16'); 
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar anexos da NR-16:", error);
      throw error;
    }
  },
};

export default nr16Service;