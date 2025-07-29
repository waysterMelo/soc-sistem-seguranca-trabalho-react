import api from '../../apiService.js';

// Função para listar todas as unidades operacionais
const listarTodasUnidades = (page = 0, size = 10) => {
    return api.get('/unidade-operacional', {
        params: {
            page,
            size
        },
        headers: {
            'Accept': 'application/json'
        }
    });
};

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
    const requestData = {
        nome: unidadeData.nome.trim(),
        empresaId: unidadeData.empresaId,
        descricao: unidadeData.descricao || null,
        unidadeOperacionalId: unidadeData.unidadeOperacionalId || null
    };
    // Faz a chamada para criar o setor
    return api.post('/setores', requestData);
};

// Modificando a função de busca para usar o endpoint principal com filtro
const buscarPorNome = (nome, page = 0, size = 10) => {
    return api.get(`/unidade-operacional`, {
        params: {
            nome, // O backend deve filtrar pelo nome como parâmetro de consulta
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
    getTotalSetores: getTotalSetores,
    listarTodasUnidades // Exportando a nova função
};