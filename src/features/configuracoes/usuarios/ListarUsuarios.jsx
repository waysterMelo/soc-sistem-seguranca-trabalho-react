import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, AlertCircle, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import usuarioService from '../../../api/services/usuario/usuarioService';
import { toast } from 'react-toastify';
import { useDebounce } from '../../../hooks/useDebounce';

// --- Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 0) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-700">
                Página {currentPage + 1} de {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

// --- Main Component ---
export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    size: 10, // Itens por página
                    search: debouncedSearchTerm,
                };
                const response = await usuarioService.getAll(params);

                if (response.data && Array.isArray(response.data.content)) {
                    setUsuarios(response.data.content);
                    setTotalPages(response.data.totalPages);
                    setTotalElements(response.data.totalElements);
                } else {
                    console.warn("API response for users is not in the expected paginated format.", response.data);
                    setUsuarios([]);
                    setTotalPages(0);
                    setTotalElements(0);
                }

            } catch (error) {
                toast.error('Erro ao carregar usuários.');
                setUsuarios([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuarios();
    }, [currentPage, debouncedSearchTerm]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
            try {
                await usuarioService.delete(id);
                // Refetch a lista para refletir a deleção
                const response = await usuarioService.getAll({ page: currentPage, size: 10, search: debouncedSearchTerm });
                if (response.data && Array.isArray(response.data.content)) {
                    setUsuarios(response.data.content);
                    setTotalPages(response.data.totalPages);
                    setTotalElements(response.data.totalElements);
                }
                toast.success('Usuário deletado com sucesso!');
            } catch (error) {
                toast.error('Erro ao deletar usuário.');
            }
        }
    };

    if (loading && usuarios.length === 0) { // Mostra o loading inicial
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 font-medium">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                                Gerenciamento de Usuários
                            </h1>
                            <p className="text-slate-600 flex items-center gap-2">
                                <UserCircle size={18} className="text-blue-600" />
                                <span>Total de {totalElements} usuário(s) cadastrado(s)</span>
                            </p>
                        </div>
                        <Link
                            to="/configuracoes/admin/usuarios/novo"
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105"
                        >
                            <PlusCircle size={20} />
                            Novo Usuário
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou nível de acesso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
                    {loading ? (
                        <div className="text-center p-16">Carregando...</div>
                    ) : usuarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <AlertCircle size={64} className="text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum usuário encontrado</h3>
                            <p className="text-slate-500 text-center">
                                {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando um novo usuário'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Nível de Acesso</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usuarios.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                                                        {user.nomeCompleto?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{user.nomeCompleto}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                    {user.nivelAcesso}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm ${
                                                    user.status === 'ATIVO' 
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                        user.status === 'ATIVO' ? 'bg-white' : 'bg-white'
                                                    } animate-pulse`}></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link 
                                                        to={`/configuracoes/admin/usuarios/editar/${user.id}`}
                                                        className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-md border border-blue-200"
                                                        title="Editar usuário"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200"
                                                        title="Deletar usuário"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}