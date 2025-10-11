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

  logout: async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        await apiService.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo que o logout da API falhe, remove o token local para deslogar o usuário da interface.
    } finally {
      localStorage.removeItem('userToken');
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('userToken') !== null;
  },
};

export default authService;
