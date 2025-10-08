// src/api/services/usuario/usuarioService.js
import api from '../../apiService.js';

const getAllUsuarios = (params) => {
    return api.get('/usuarios', { params });
};

const getUsuarioById = (id) => {
    return api.get(`/usuarios/${id}`);
};

const createUsuario = (usuarioData) => {
    return api.post('/usuarios', usuarioData)
        .catch(err => {
            const backendMsg = err?.response?.data?.message || 'Erro ao cadastrar o usuário. Verifique os dados e tente novamente.';
            throw new Error(backendMsg);
        });
};

const updateUsuario = (id, usuarioData) => {
    return api.put(`/usuarios/${id}`, usuarioData);
};

const deleteUsuario = (id) => {
    return api.delete(`/usuarios/${id}`);
};

const usuarioService = {
    getAll: getAllUsuarios,
    getById: getUsuarioById,
    create: createUsuario,
    update: updateUsuario,
    delete: deleteUsuario,
};

export default usuarioService;
