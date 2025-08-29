import api from '../../apiService.js';

const getAllPrestadores = (params) => {
    return api.get('/prestadores', { params });
};

const buscarPrestadoresPorNome = (nome, params = {}) => {
    return api.get('/prestadores/pesquisa', {
        params: { nome, ...params }
    });
};

const getPrestadorById = (id) => {
    return api.get(`/prestadores/${id}`);
};

const createPrestador = (data) => {
    return api.post('/prestadores', data);
};

const updatePrestador = (id, data) => {
    return api.put(`/prestadores/${id}`, data);
};

const deletePrestador = (id) => {
    return api.delete(`/prestadores/${id}`);
};

export const prestadorServicoService = {
    getAll:         getAllPrestadores,
    buscarPorNome:  buscarPrestadoresPorNome,
    getById:        getPrestadorById,
    create:         createPrestador,
    update:         updatePrestador,
    delete:         deletePrestador,
};

export default prestadorServicoService;