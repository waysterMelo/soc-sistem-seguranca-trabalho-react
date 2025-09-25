import api from '../../apiService.js';

const getAllCids = () => {
    return api.get('/cid');
};

const getCidById = (id) => {
    return api.get(`/cid/${id}`);
};

const createCid = (cidData) => {
    return api.post('/cid', cidData)
        .catch(err => {
            const backendMsg = err?.response?.data?.message || 'Erro ao cadastrar o CID. Verifique os dados e tente novamente.';
            throw new Error(backendMsg);
        });
};

const updateCid = (id, cidData) => {
    return api.put(`/cid/${id}`, cidData)
        .catch(err => {
            const backendMsg = err?.response?.data?.message || 'Erro ao atualizar o CID. Verifique os dados e tente novamente.';
            throw new Error(backendMsg);
        });
};

const deleteCid = (id) => {
    return api.delete(`/cid/${id}`)
        .catch(err => {
            const backendMsg = err?.response?.data?.message || 'Erro ao excluir o CID. Tente novamente.';
            throw new Error(backendMsg);
        });
};

const buscarCids = (params) => {
    return api.get('/cid', { params });
};

const buscarCidsPorTermo = (termo) => {
    return api.get(`/cid/buscar?termo=${encodeURIComponent(termo)}`);
};

const buscarCidsPorCodigo = (codigo) => {
    return api.get(`/cid/codigo/${encodeURIComponent(codigo)}`);
};

const buscarCidsComFiltros = (params) => {
    return api.get('/cid', { params });
};

export const cidService = {
    getAll: getAllCids,
    getById: getCidById,
    create: createCid,
    update: updateCid,
    delete: deleteCid,
    buscar: buscarCids,
    buscarPorTermo: buscarCidsPorTermo,
    buscarPorCodigo: buscarCidsPorCodigo,
    buscarComFiltros: buscarCidsComFiltros
};

export default cidService;