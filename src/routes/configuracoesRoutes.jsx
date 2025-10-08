import React from 'react';
import { Route } from 'react-router-dom';
import ListarUsuarios from '../features/configuracoes/usuarios/ListarUsuarios.jsx';
import FormUsuario from '../features/configuracoes/usuarios/FormUsuario.jsx';

const configuracoesRoutes = (
    <>
        <Route path="/configuracoes/admin/usuarios" element={<ListarUsuarios />} />
        <Route path="/configuracoes/admin/usuarios/novo" element={<FormUsuario />} />
        <Route path="/configuracoes/admin/usuarios/editar/:id" element={<FormUsuario />} />
    </>
);

export default configuracoesRoutes;
