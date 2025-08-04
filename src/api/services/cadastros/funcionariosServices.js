import api from '../../apiService.js';

const getAllFuncionarios = () => {
    return api.get('/funcionarios');
};

const getFuncionarioById = (id) => {
    return api.get(`/funcionarios/${id}`);
};

const createFuncionario = (funcionarioData) => {
    return api.post('/funcionarios', funcionarioData);
};

const updateFuncionario = (id, funcionarioData) => {
    return api.put(`/funcionarios/${id}`, funcionarioData);
};

const deleteFuncionario = (id) => {
    return api.delete(`/funcionarios/${id}`);
};

const buscarFuncionarios = (termo) => {
    return api.get(`/funcionarios/buscar?termo=${encodeURIComponent(termo)}`);
};

const buscarFuncionariosComFiltros = (params) => {
    return api.get('/funcionarios', { params });
};


export const funcionariosService = {
    getAll: getAllFuncionarios,
    getById: getFuncionarioById,
    create: createFuncionario,
    update: updateFuncionario,
    delete: deleteFuncionario,
    buscarFuncionarios: buscarFuncionarios,
    buscarComFiltros: buscarFuncionariosComFiltros
};

export default funcionariosService;