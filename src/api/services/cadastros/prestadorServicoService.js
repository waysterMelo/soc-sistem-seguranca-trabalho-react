import api from '../../apiService.js';

const API_URL = '/prestadores';

// Busca paginada com filtro opcional por nome ou CPF
const getAllPrestadores = (page = 0, size = 5, searchTerm = '') => {
    return api.get(API_URL, {
        params: {
            page,
            size,
            sort: 'nome',
            q: searchTerm
        }
    });
};

const getPrestadorById = (id) => {
    return api.get(`${API_URL}/${id}`);
};

const createPrestador = (data) => {
    return api.post(API_URL, data);
};

const updatePrestador = (id, data) => {
    return api.put(`${API_URL}/${id}`, data);
};

const deletePrestador = (id) => {
    return api.delete(`${API_URL}/${id}`);
};

export const prestadorServicoService = {
    getAll: getAllPrestadores,
    getById: getPrestadorById,
    create: createPrestador,
    update: updatePrestador,
    delete: deletePrestador,
};

export default prestadorServicoService;
