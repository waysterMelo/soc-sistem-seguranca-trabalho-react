import api from '../../apiService.js';

const getAllempresas = () => {
    return api.get('/empresas');
};

const getEmpresaById = (id) => {
    return api.get(`/empresas/${id}`);
};

const createEmpresa =(empresaData) => {
    return api.post('/empresas', empresaData);
};

const updateEmpresa = (id, empresaData) => {
    return api.put(`/empresas/${id}`, empresaData);
};

const deleteEmpresa = (id) => {
    return api.delete(`/empresas/${id}`);
};

const uploadLogo = (fileData) => {
    return api.post('/empresas/logo', fileData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export const empresaService = {
    getAll: getAllempresas,
    getById: getEmpresaById,
    create: createEmpresa,
    update: updateEmpresa,
    delete: deleteEmpresa,
    uploadLogo: uploadLogo,
};

export default empresaService;

