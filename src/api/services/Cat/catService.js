import apiService from '../../apiService';

const catService = {

  /**
   * Busca uma CAT pelo ID
   * @param {number} id - ID da CAT
   * @returns {Promise<Object>} Dados da CAT
   */
  getCatById: async (id) => {
    try {
      const response = await apiService.get(`/cat/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria uma nova CAT
   * @param {Object} catData - Dados da CAT
   * @param {File} atestadoMedicoFile - Arquivo do atestado médico (opcional)
   * @param {File[]} anexosFiles - Arquivos de anexos (opcional)
   * @returns {Promise<Object>} CAT criada
   */
  createCat: async (catData, atestadoMedicoFile = null, anexosFiles = []) => {
    try {
      // Se não há arquivos, enviar como JSON
      if (!atestadoMedicoFile && (!anexosFiles || anexosFiles.length === 0)) {
        const response = await apiService.post('/cat', catData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      }

      // Se há arquivos, usar FormData
      const formData = new FormData();

      // Adiciona os dados da CAT como JSON
      formData.append('cat', new Blob([JSON.stringify(catData)], {
        type: 'application/json'
      }));

      // Adiciona atestado médico se fornecido
      if (atestadoMedicoFile) {
        formData.append('atestadoMedico', atestadoMedicoFile);
      }

      // Adiciona anexos se fornecidos
      if (anexosFiles && anexosFiles.length > 0) {
        anexosFiles.forEach((file, index) => {
          formData.append(`anexos`, file);
        });
      }

      const response = await apiService.post('/cat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar CAT:', error);
      throw error;
    }
  },

  /**
   * Atualiza uma CAT existente
   * @param {number} id - ID da CAT
   * @param {Object} catData - Dados atualizados da CAT
   * @param {File} atestadoMedicoFile - Novo arquivo do atestado médico (opcional)
   * @param {File[]} anexosFiles - Novos arquivos de anexos (opcional)
   * @returns {Promise<Object>} CAT atualizada
   */
  updateCat: async (id, catData, atestadoMedicoFile = null, anexosFiles = []) => {
    try {
      // Se não há arquivos, enviar como JSON
      if (!atestadoMedicoFile && (!anexosFiles || anexosFiles.length === 0)) {
        const response = await apiService.put(`/cat/${id}`, catData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      }

      // Se há arquivos, usar FormData
      const formData = new FormData();

      formData.append('cat', new Blob([JSON.stringify(catData)], {
        type: 'application/json'
      }));

      if (atestadoMedicoFile) {
        formData.append('atestadoMedico', atestadoMedicoFile);
      }

      if (anexosFiles && anexosFiles.length > 0) {
        anexosFiles.forEach((file, index) => {
          formData.append(`anexos`, file);
        });
      }

      const response = await apiService.put(`/cat/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca CATs com paginação e filtros
   * @param {number} page - Número da página (default: 0)
   * @param {number} size - Tamanho da página (default: 10)
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Object>} Lista paginada de CATs
   */
  getCats: async (page = 0, size = 10, filters = {}) => {
    try {
      const params = {
        page,
        size,
        sort: 'id,desc',
        ...filters
      };

      const response = await apiService.get('/cat', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar CATs:', error);
      throw error;
    }
  },

  /**
   * Busca CATs por funcionário
   * @param {number} funcionarioId - ID do funcionário
   * @param {number} page - Número da página (default: 0)
   * @param {number} size - Tamanho da página (default: 10)
   * @returns {Promise<Object>} CATs do funcionário
   */
  getCatsByFuncionario: async (funcionarioId, page = 0, size = 10) => {
    try {
      const params = { page, size, sort: 'dataAcidente,desc' };
      const response = await apiService.get(`/cat/funcionario/${funcionarioId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar CATs do funcionário ${funcionarioId}:`, error);
      throw error;
    }
  },

  /**
   * Inativa uma CAT
   * @param {number} id - ID da CAT
   * @returns {Promise<Object>} Resultado da operação
   */
  inactivateCat: async (id) => {
    try {
      const response = await apiService.patch(`/cat/${id}/inactivate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao inativar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta uma CAT
   * @param {number} id - ID da CAT
   * @returns {Promise<void>}
   */
  deleteCat: async (id) => {
    try {
      await apiService.delete(`/cat/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Aprova uma CAT
   * @param {number} id - ID da CAT
   * @param {Object} aprovacaoData - Dados da aprovação (observações, etc.)
   * @returns {Promise<Object>} CAT aprovada
   */
  aprovarCat: async (id, aprovacaoData = {}) => {
    try {
      const response = await apiService.patch(`/cat/${id}/aprovar`, aprovacaoData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao aprovar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Rejeita uma CAT
   * @param {number} id - ID da CAT
   * @param {Object} rejeitarData - Dados da rejeição (motivo, observações, etc.)
   * @returns {Promise<Object>} CAT rejeitada
   */
  rejeitarCat: async (id, rejeitarData) => {
    try {
      const response = await apiService.patch(`/cat/${id}/rejeitar`, rejeitarData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao rejeitar CAT com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Gera relatório da CAT em PDF
   * @param {number} id - ID da CAT
   * @returns {Promise<Blob>} Arquivo PDF
   */
  gerarRelatorioPdf: async (id) => {
    try {
      const response = await apiService.get(`/cat/${id}/relatorio`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar relatório PDF da CAT ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca estatísticas de CATs
   * @param {Object} filtros - Filtros para as estatísticas (período, setor, etc.)
   * @returns {Promise<Object>} Estatísticas das CATs
   */
  getEstatisticas: async (filtros = {}) => {
    try {
      const response = await apiService.get('/cat/estatisticas', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de CATs:', error);
      throw error;
    }
  },

  /**
   * Busca dados auxiliares para o formulário de CAT
   * @returns {Promise<Object>} Dados auxiliares (agentes causadores, naturezas de lesão, etc.)
   */
  getDadosAuxiliares: async () => {
    try {
      const response = await apiService.get('/cat/dados-auxiliares');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados auxiliares:', error);
      throw error;
    }
  },

  /**
   * Busca partes do corpo atingida com paginação e filtros
   * @param {number} page - Número da página (default: 0)
   * @param {number} size - Tamanho da página (default: 10)
   * @param {string} search - Termo de busca (opcional)
   * @returns {Promise<Object>} Lista paginada de partes do corpo
   */
  getPartesCorpoAtingida: async (page = 0, size = 10, search = '') => {
    try {
      const params = {
        page,
        size,
        sort: 'nome,asc'
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiService.get('/parte-corpo-atingida', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar partes do corpo atingida:', error);
      throw error;
    }
  },

  /**
   * Busca agentes causadores com paginação e filtros
   * @param {number} page - Número da página (default: 0)
   * @param {number} size - Tamanho da página (default: 10)
   * @param {string} search - Termo de busca (opcional)
   * @returns {Promise<Object>} Lista paginada de agentes causadores
   */
  getAgentesCausadores: async (page = 0, size = 10, search = '') => {
    try {
      const params = {
        page,
        size,
        sort: 'nome,asc'
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiService.get('/agente-causador', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agentes causadores:', error);
      throw error;
    }
  },

  /**
   * Busca natureza da lesão (situação geradora) com paginação e filtros
   * @param {number} page - Número da página (default: 0)
   * @param {number} size - Tamanho da página (default: 10)
   * @param {string} search - Termo de busca (opcional)
   * @returns {Promise<Object>} Lista paginada de naturezas de lesão
   */
  getNaturezasLesao: async (page = 0, size = 10, search = '') => {
    try {
      const params = {
        page,
        size,
        sort: 'nome,asc'
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await apiService.get('/natureza-lesao', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar natureza da lesão:', error);
      throw error;
    }
  }
};

export default catService;