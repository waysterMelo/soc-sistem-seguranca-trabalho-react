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
    if (!unidadeData.empresaId) {
        throw new Error('empresaId é obrigatório para cadastrar uma unidade');
    }

    const requestData = {
        nome: unidadeData.nome.trim(),
        empresaId: unidadeData.empresaId,
        descricao: unidadeData.descricao || null,
        cep: unidadeData.cep,
        cidade: unidadeData.cidade,
        estado: unidadeData.estado,
        logradouro: unidadeData.logradouro,
        numero: unidadeData.numero,
        bairro: unidadeData.bairro,
        complemento: unidadeData.complemento || null,
        regiao: unidadeData.regiao || null,
        dddTelefone1: unidadeData.dddTelefone1 || null,
        numeroTelefone1: unidadeData.numeroTelefone1 || null,
        dddTelefone2: unidadeData.dddTelefone2 || null,
        numeroTelefone2: unidadeData.numeroTelefone2 || null,
        emailContato: unidadeData.emailContato || null,
        grauRisco: unidadeData.grauRisco || null,
        cnaePrincipalId: unidadeData.cnaePrincipalId || null,
        setoresIds: unidadeData.setoresIds || [],
        situacao: unidadeData.situacao || 'ATIVO'
    };

    // Faz a chamada para criar a unidade operacional usando o ID da empresa selecionada
    return api.post(`/unidade-operacional/${unidadeData.empresaId}`, requestData);
};

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