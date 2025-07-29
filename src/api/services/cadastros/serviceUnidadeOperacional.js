import api from '../../apiService.js';


const getAllUnidades = (params) => {
    const empresaId = params?.empresaId;

    if (!empresaId) {
        throw new Error('empresaId é obrigatório');
    }

    return api.get(`/unidade-operacional/${empresaId}/unidades-empresa`, {
        headers: {
            'Accept': 'application/json'
        }
    });
};

const getUnidadeById = (id) => {
    return api.get(`/unidade-operacional/${id}`);
};

const getTotalSetores = (unidadeId) => {
    return api.get(`/unidade-operacional/${unidadeId}/total-setores`);
};

const createUnidade = (unidadeData) => {
    const empresaId = unidadeData.empresaId;
    return api.post(`/unidade-operacional/${empresaId}`, unidadeData);
};

const buscarPorNome = (nome, page = 0, size = 10) => {
    return api.get(`/unidade-operacional/buscar`, {
        params: {
            nome,
            page,
            size
        }
    });
};


const updateUnidade = (id, unidadeData) => {
    return api.put(`/unidade-operacional/${id}`, unidadeData);
};

const deleteUnidade = (id) => {
    return api.delete(`/unidade-operacional/${id}`);
};

export const unidadeService = {
    getAll: getAllUnidades,
    getById: getUnidadeById,
    create: createUnidade,
    update: updateUnidade,
    delete: deleteUnidade,
    buscarPorNome,
    getTotalSetores: getTotalSetores

};