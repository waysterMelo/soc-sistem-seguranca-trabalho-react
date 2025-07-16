import api from '../apiService.js';


const getAllSetores = (params) => {
    return api.get('/setores', { params });
};


const getSetorById = (id) => {
    return api.get(`/setores/${id}`);
};


const createSetor = (setorData) => {
    return api.post('/setores', setorData);
};


const updateSetor = (id, setorData) => {
    return api.put(`/setores/${id}`, setorData);
};

const deleteSetor = (id) => {
    return api.delete(`/setores/${id}`);
};

export const setorService = {
    getAll: getAllSetores,
    getById: getSetorById,
    create: createSetor,
    update: updateSetor,
    delete: deleteSetor,
};
