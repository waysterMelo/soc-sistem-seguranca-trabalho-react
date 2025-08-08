import api from '../../apiService.js';

const getAllFuncionarios = () => {
    return api.get('/funcionarios');
};

const getFuncionarioById = (id) => {
    return api.get(`/funcionarios/${id}`);
};

const createFuncionario = (funcionarioData) => {
    // Adicione o .catch para tratar o erro da API
    return api.post('/funcionarios', funcionarioData)
        .catch(err => {
            // Extrai a mensagem do backend ou usa uma mensagem padrão
            const backendMsg = err?.response?.data?.message || 'Erro ao cadastrar o funcionário. Verifique os dados e tente novamente.';
            // Lança um novo erro com a mensagem para o componente capturar
            throw new Error(backendMsg);
        });
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

const buscarFuncionariosPeloSetor = (setorId) => {
    return api.get(`/funcionarios/setor/${setorId}`);
};


export const funcionariosService = {
    getAll: getAllFuncionarios,
    getById: getFuncionarioById,
    create: createFuncionario,
    update: updateFuncionario,
    delete: deleteFuncionario,
    buscarFuncionarios: buscarFuncionarios,
    buscarComFiltros: buscarFuncionariosComFiltros,
    buscarPorSetor: buscarFuncionariosPeloSetor

};

export default funcionariosService;