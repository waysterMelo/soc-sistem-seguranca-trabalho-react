// src/features/configuracoes/usuarios/FormUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usuarioService from '../../../api/services/usuario/usuarioService';
import { toast } from 'react-toastify';
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";
import { Search, Trash2, Save, X, User, Mail, Lock, Shield, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FormUsuario() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [usuario, setUsuario] = useState({
        nomeCompleto: '',
        email: '',
        senha: '',
        nivelAcesso: 'USUARIO_PADRAO',
        status: 'ATIVO',
        empresaId: null,
    });
    const [empresa, setEmpresa] = useState(null);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (isEditMode) {
            const fetchUsuario = async () => {
                try {
                    const response = await usuarioService.getById(id);
                    setUsuario(response.data);
                    if (response.data.empresa) {
                        setEmpresa(response.data.empresa);
                    }
                } catch (error) {
                    toast.error('Erro ao carregar dados do usuário.');
                }
            };
            fetchUsuario();
        }
    }, [id, isEditMode]);

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'nomeCompleto':
                if (!value.trim()) {
                    error = 'Nome completo é obrigatório';
                } else if (value.trim().length < 3) {
                    error = 'Nome deve ter pelo menos 3 caracteres';
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email é obrigatório';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Email inválido';
                }
                break;
            case 'senha':
                if (!isEditMode && !value) {
                    error = 'Senha é obrigatória';
                } else if (value && value.length < 6) {
                    error = 'Senha deve ter pelo menos 6 caracteres';
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({ ...prev, [name]: value }));
        
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSelectEmpresa = (selectedEmpresa) => {
        setEmpresa(selectedEmpresa);
        setUsuario(prev => ({ ...prev, empresaId: selectedEmpresa.id }));
        setShowEmpresaModal(false);
    };

    const limparEmpresa = () => {
        setEmpresa(null);
        setUsuario(prev => ({ ...prev, empresaId: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validar todos os campos
        const newErrors = {};
        Object.keys(usuario).forEach(key => {
            const error = validateField(key, usuario[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(Object.keys(usuario).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            toast.error('Por favor, corrija os erros no formulário.');
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                const dataToUpdate = { ...usuario };
                if (dataToUpdate.senha === '') {
                    delete dataToUpdate.senha;
                }
                await usuarioService.update(id, dataToUpdate);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                await usuarioService.create(usuario);
                toast.success('Usuário criado com sucesso!');
            }
            navigate('/configuracoes/admin/usuarios');
        } catch (error) {
            toast.error(error.message || 'Erro ao salvar usuário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                            <User className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {isEditMode ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nome Completo */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-blue-600" />
                                        Nome Completo
                                        <span className="text-red-500">*</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="nomeCompleto"
                                        value={usuario.nomeCompleto}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-3 px-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                                            errors.nomeCompleto && touched.nomeCompleto
                                                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                        }`}
                                        placeholder="Digite o nome completo"
                                    />
                                    {touched.nomeCompleto && !errors.nomeCompleto && usuario.nomeCompleto && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                                    )}
                                </div>
                                {errors.nomeCompleto && touched.nomeCompleto && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.nomeCompleto}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-blue-600" />
                                        Email
                                        <span className="text-red-500">*</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={usuario.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-3 px-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                                            errors.email && touched.email
                                                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                        }`}
                                        placeholder="exemplo@email.com"
                                    />
                                    {touched.email && !errors.email && usuario.email && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                                    )}
                                </div>
                                {errors.email && touched.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Senha */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Lock size={16} className="text-blue-600" />
                                        Senha
                                        {isEditMode ? (
                                            <span className="text-slate-500 text-xs font-normal">(Deixe em branco para não alterar)</span>
                                        ) : (
                                            <span className="text-red-500">*</span>
                                        )}
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="senha"
                                        value={usuario.senha}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-3 px-4 border-2 rounded-xl transition-all duration-200 outline-none ${
                                            errors.senha && touched.senha
                                                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                        }`}
                                        placeholder="Digite a senha"
                                    />
                                    {touched.senha && !errors.senha && usuario.senha && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                                    )}
                                </div>
                                {errors.senha && touched.senha && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.senha}
                                    </p>
                                )}
                            </div>

                            {/* Nível de Acesso */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-blue-600" />
                                        Nível de Acesso
                                    </div>
                                </label>
                                <select
                                    name="nivelAcesso"
                                    value={usuario.nivelAcesso}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white"
                                >
                                    <option value="USUARIO_PADRAO">Usuário Padrão</option>
                                    <option value="ADMINISTRADOR">Administrador</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${usuario.status === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                        Status
                                    </div>
                                </label>
                                <select
                                    name="status"
                                    value={usuario.status}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white"
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>

                            {/* Empresa Associada */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-blue-600" />
                                        Empresa Associada
                                    </div>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nenhuma empresa selecionada"
                                        value={empresa ? empresa.razaoSocial || empresa.nome : ''}
                                        readOnly
                                        className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmpresaModal(true)}
                                        className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40 hover:scale-105 flex items-center gap-2"
                                        title="Buscar empresa"
                                    >
                                        <Search size={18} />
                                        <span className="hidden sm:inline">Buscar</span>
                                    </button>
                                    {empresa && (
                                        <button
                                            type="button"
                                            onClick={limparEmpresa}
                                            className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40 hover:scale-105"
                                            title="Remover empresa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                {empresa && (
                                    <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800 font-medium">
                                            Empresa selecionada: {empresa.razaoSocial || empresa.nome}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer com Botões */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 sm:px-8 py-4 border-t-2 border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/configuracoes/admin/usuarios')}
                                className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                <X size={20} />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Salvar Usuário
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleSelectEmpresa}
            />
        </div>
    );
}
