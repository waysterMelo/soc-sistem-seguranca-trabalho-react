import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ChevronsUpDown,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader
} from 'lucide-react';
import { Link } from "react-router-dom";
import { setorService } from "../../../api/services/cadastros/serviceSetores.js";
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../../components/modal/unidadesOperacionaisModal.jsx';
import EditarSetorModal from '../../../components/modal/editarSetorModal.jsx';
import {toast} from "react-toastify";
// --- Componentes Reutilizáveis ---

// Cabeçalho da tabela com ícone de ordenação
const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

// Selo de status colorido
const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        'ATIVO': 'bg-green-500 text-white',
        'INATIVO': 'bg-red-500 text-white',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-300 text-gray-800'}`}>
            {status}
        </span>
    );
};

// Input com botões de ação
const InputWithActions = ({ placeholder, value, actions, readOnly = true }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly={readOnly}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// --- Componente Principal ---
export default function ListarSetores() {
    // Estados principais
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [empresaFiltro, setEmpresaFiltro] = useState(null);
    const [unidadeFiltro, setUnidadeFiltro] = useState(null);
    const [statusFiltro, setStatusFiltro] = useState('todos');
    
    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Estados dos modais
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSetor, setSelectedSetor] = useState(null);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [setorToDelete, setSetorToDelete] = useState(null);


    const fetchSetores = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage - 1,
                size: entriesPerPage
            };

            if (searchTerm && searchTerm.trim() !== '') {
                params.nome = searchTerm.trim();
            }
            if (empresaFiltro && empresaFiltro.id) {
                params.empresaId = empresaFiltro.id;
            }
            if (unidadeFiltro && unidadeFiltro.id) {
                params.unidadeOperacionalId = unidadeFiltro.id;
            }
            if (statusFiltro !== 'todos') {
                params.status = statusFiltro === 'ativos' ? 'ATIVO' : 'INATIVO';
            }

            const response = await setorService.buscarComFiltros(params);

            if (response.data) {
                if (response.data.content) {
                    // Formato Spring Boot PageImpl
                    setSetores(response.data.content);
                    setTotalElements(response.data.totalElements);
                    setTotalPages(response.data.totalPages);
                } else if (Array.isArray(response.data)) {
                    // Formato array simples: filtrar e paginar manualmente
                    const allSetores = response.data;

                    // 1) Filtrar conforme os filtros atuais
                    const filtered = allSetores.filter(setor => {
                        if (searchTerm && !setor.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return false;
                        }
                        if (empresaFiltro && setor.empresa?.id !== empresaFiltro.id) {
                            return false;
                        }
                        if (unidadeFiltro && setor.unidadeOperacional?.id !== unidadeFiltro.id) {
                            return false;
                        }
                        if (statusFiltro !== 'todos') {
                            const st = statusFiltro === 'ativos' ? 'ATIVO' : 'INATIVO';
                            if (setor.status !== st) return false;
                        }
                        return true;
                    });

                    const total = filtered.length;
                    const pages = Math.ceil(total / entriesPerPage);
                    const start = (currentPage - 1) * entriesPerPage;
                    const end = start + entriesPerPage;
                    const paginated = filtered.slice(start, end);

                    setSetores(paginated);
                    setTotalElements(total);
                    setTotalPages(pages);


                } else {
                    // Caso não seja nenhum dos formatos esperados
                    console.error('Formato de resposta inesperado:', response.data);
                    setSetores([]);
                    setTotalElements(0);
                    setTotalPages(0);
                }
            } else {
                setSetores([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('Erro ao buscar setores:', err);
            setError('Erro ao carregar setores. Tente novamente.');
            setSetores([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetores();
    }, [currentPage, entriesPerPage, searchTerm, empresaFiltro, unidadeFiltro, statusFiltro]);

    // Handlers dos filtros
    const handleSelectEmpresa = (empresa) => {
        setEmpresaFiltro(empresa);
        setShowEmpresaModal(false);
        setCurrentPage(1); // Reset para primeira página
    };

    const handleSelectUnidade = (unidade) => {
        setUnidadeFiltro(unidade);
        setShowUnidadeModal(false);
        setCurrentPage(1); // Reset para primeira página
    };

    const handleClearEmpresa = () => {
        setEmpresaFiltro(null);
        setCurrentPage(1);
    };

    const handleClearUnidade = () => {
        setUnidadeFiltro(null);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset para primeira página ao pesquisar
    };

    const handleStatusChange = (e) => {
        setStatusFiltro(e.target.value);
        setCurrentPage(1);
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleEditClick = async (setor) => {
        try {
            // Buscar os dados completos do setor antes de abrir o modal
            const response = await setorService.getById(setor.id);
            if (response.data) {
                setSelectedSetor(response.data);
                setShowEditModal(true);
            } else {
                alert("Não foi possível carregar os dados completos do setor.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados do setor:", error);
            alert("Ocorreu um erro ao carregar os dados do setor.");
        }
    }

    const handleSaveEdit = (updatedSetor) => {
        fetchSetores(); // Atualiza a lista de setores após salvar a edição
    };

    // Função para formatar dados da tabela
    const formatarSetor = (setor) => ({
        nome: setor.nome || '-',
        empresa: setor.empresa?.razaoSocial || setor.empresa?.nome || '-',
        unidadeOperacional: setor.unidadeOperacional?.nome || 'N/A',
        totalFuncionarios: setor.totalFuncionarios || null,
        status: setor.status || null
    });

    const handleDeleteClick = (setor) => {
        setSetorToDelete(setor);
        setShowDeleteConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!setorToDelete) return;

        setLoading(true);
        try {
            await setorService.delete(setorToDelete.id);

            toast.success("Setor excluído com sucesso!"); // Usando toast para sucesso
            fetchSetores(); // Atualiza a lista
            setShowDeleteConfirmModal(false);
            setSetorToDelete(null);

        } catch (err) {
            // O interceptor já exibiu o toast de erro.
            // O catch aqui serve para evitar que a aplicação quebre e para logs.
            console.error("Erro ao excluir setor:", err);
        } finally {
            // Garante que o loading seja desativado, mesmo em caso de erro
            setLoading(false);
        }
    }



    const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, setor, loading }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Exclusão</h3>
                    <p className="text-gray-700 mb-6">
                        Tem certeza que deseja excluir o setor <span className="font-semibold">{setor?.nome}</span>?
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={16} className="animate-spin mr-2" />
                                    <span>Excluindo...</span>
                                </>
                            ) : (
                                <span>Sim, Excluir</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row
                justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Setores</h1>
                    <div className="flex space-x-2">
                        <Link
                            to="/cadastros/novo-setor"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Novo Setor</span>
                        </Link>
                    </div>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Filtros por Empresa e Unidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Empresa
                            </label>
                            <InputWithActions
                                placeholder="Selecione uma empresa para filtrar"
                                value={empresaFiltro ? empresaFiltro.razaoSocial || empresaFiltro.nome : ''}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowEmpresaModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button 
                                            type="button" 
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearEmpresa}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Unidade Operacional
                            </label>
                            <InputWithActions
                                placeholder="Nenhuma Unidade Operacional selecionada"
                                value={unidadeFiltro ? unidadeFiltro.nome : ''}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowUnidadeModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button 
                                            type="button" 
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearUnidade}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* Barra de Busca e Filtros da Tabela */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <input
                            type="text"
                            placeholder="Procure por algum registro..."
                            className="w-full sm:flex-grow pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select 
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={statusFiltro}
                                onChange={handleStatusChange}
                            >
                                <option value="todos">Todos</option>
                                <option value="ativos">Ativos</option>
                                <option value="inativos">Inativos</option>
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={handleEntriesPerPageChange}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Tabela de Setores */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <TableHeader>Setor</TableHeader>
                                    <TableHeader>Empresa</TableHeader>
                                    <TableHeader>Unidade Operacional</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader className="animate-spin mr-2" size={20} />
                                                <span className="text-gray-500">Carregando setores...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : setores.length > 0 ? (
                                    setores.map((setor, index) => {
                                        const setorFormatado = formatarSetor(setor);
                                        return (
                                            <tr key={setor.id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {setorFormatado.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {setorFormatado.empresa}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {setorFormatado.unidadeOperacional}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <StatusBadge status={setorFormatado.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            className="text-blue-600 hover:text-blue-800" 
                                                            title="Editar"
                                                            onClick={() => handleEditClick(setor)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Excluir"
                                                            onClick={() => handleDeleteClick(setor)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Nenhum registro encontrado!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {!loading && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{totalElements > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0}</span> até{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * entriesPerPage, totalElements)}
                                </span> de{' '}
                                <span className="font-medium">{totalElements}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1 || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                    {totalPages > 0 ? currentPage : 0}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Última página"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleSelectEmpresa}
            />
            
            <UnidadesOperacionaisModal
                isOpen={showUnidadeModal}
                onClose={() => setShowUnidadeModal(false)}
                onSelect={handleSelectUnidade}
            />

            <EditarSetorModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                setor={selectedSetor}
                onSave={handleSaveEdit}
            />
            <DeleteConfirmModal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                setor={setorToDelete}
                loading={loading}
            />
        </div>
    );
}