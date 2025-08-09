import api from '../../apiService.js';

const getAllFuncoes = (params) => {
    return api.get('/funcoes', { params });
};

const getFuncaoById = (id) => {
    return api.get(`/funcoes/${id}`);
};

const createFuncao = (funcaoData) => {
    return api.post('/funcoes', funcaoData);
};

const buscarFuncoesComFiltros = (params) => {
    return api.get('/funcoes', { params });
};

const updateFuncao = (id, funcaoData) => {
    return api.put(`/funcoes/${id}`, funcaoData);
};

const deleteFuncao = (id) => {
    return api.delete(`/funcoes/${id}`);
};

export const funcaoService = {
    getAll: getAllFuncoes,
    getById: getFuncaoById,
    create: createFuncao,
    update: updateFuncao,
    delete: deleteFuncao,
    buscarComFiltros: buscarFuncoesComFiltros
};

export default funcaoService;