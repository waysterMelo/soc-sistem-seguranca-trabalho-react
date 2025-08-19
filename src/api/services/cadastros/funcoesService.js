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

const getAllCbo = (cbo) => {
    return api.get('/cbo', cbo);
}

const getAllRiscosTrabalistas = (params) => {
    return api.get('/riscos-catalogo/todos', { params });
}

const getAllAgentesNocivos = (params) => {
    return api.get('/agente-nocivo', { params });
}

const buscarAgentesPorDescricao = (descricao, params = {}) => {
    return api.get(`/agente-nocivo/buscar/descricao`, {
        params: { descricao, ...params }
    });
};

const buscarAgentesPorCodigo = (codigo, params = {}) => {
    return api.get(`/agente-nocivo/buscar/codigo`, {
        params: { codigo, ...params }
    });
};

const buscarRiscosPorDescricao = (descricao, params = {}) => {
    return api.get(`/riscos-catalogo/pesquisa`, {
        params: {descricao, ...params}
    });
}

const getFuncoesBySetor = (setorId, params) => {
    return api.get(`/funcoes/setor/${setorId}`, { params });
};


const getAllExamesPCMSO = (params) => {
    return api.get('/exames', { params });
}

const buscarExamesPorNome = (nome, params = {}) => {
    return api.get(`/exames/buscar`, {
        params: { nome, ...params }
    });
};

const getAllPrestadores = (params) => {
    return api.get('/prestadores', { params });
}

const buscarPrestadoresPorNome = (nome, params = {}) => {
    return api.get(`/prestadores/pesquisa`, {
        params: { nome, ...params }
    });
};

const inativarFuncao = async (id) => {
    try {

        const response = await api.patch(`/funcoes/${id}/inativar`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao inativar função com id ${id}:`, error);
        throw error;
    }
}




export const funcaoService = {
    getAll: getAllFuncoes,
    getById: getFuncaoById,
    create: createFuncao,
    update: updateFuncao,
    delete: deleteFuncao,
    buscarComFiltros: buscarFuncoesComFiltros,
    retornarCbo: getAllCbo,
    retornarRiscos: getAllRiscosTrabalistas,
    retornarAgentesNocivos: getAllAgentesNocivos,
    buscarAgentesPorDescricao,
    buscarAgentesPorCodigo,
    buscarRiscosPorDescricao,
    buscarExamesPorNome,
    retornarExamesPCMSO: getAllExamesPCMSO,
    retornarPrestadores: getAllPrestadores,
    buscarPrestadoresPorNome,
    inativarFuncao,
    getFuncoesBySetor


};

export default funcaoService;