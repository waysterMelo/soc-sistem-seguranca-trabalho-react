import apiService from '../../apiService';

const authService = {
  login: async (email, senha) => {
    try {
      const response = await apiService.post('/api/auth/login', { email, senha });
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('userToken');
  },

  isAuthenticated: () => {
    return localStorage.getItem('userToken') !== null;
  },
};

export default authService;
