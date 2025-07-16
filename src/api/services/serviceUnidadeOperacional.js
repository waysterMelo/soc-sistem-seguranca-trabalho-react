import api from '../apiService.js';


const getAllUnidades = (params) => {
    return api.get('/unidades-operacionais', { params });
};


const getUnidadeById = (id) => {
    return api.get(`/unidades-operacionais/${id}`);
};


const createUnidade = (unidadeData) => {
    return api.post('/unidades-operacionais', unidadeData);
};


const updateUnidade = (id, unidadeData) => {
    return api.put(`/unidades-operacionais/${id}`, unidadeData);
};


const deleteUnidade = (id) => {
    return api.delete(`/unidades-operacionais/${id}`);
};

export const unidadeService = {
    getAll: getAllUnidades,
    getById: getUnidadeById,
    create: createUnidade,
    update: updateUnidade,
    delete: deleteUnidade,
};