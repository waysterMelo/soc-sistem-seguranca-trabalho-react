import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    AlertCircle,
    ChevronsUpDown,
    X,
    RefreshCw
} from 'lucide-react';
import espirometriaService from '../../api/services/medicina/espirometriaService';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';
import SetorSearchModal from '../../components/modal/SetorSearchModal';

// --- Componentes Reutilizáveis ---

const TableHeader = ({ children, onClick, sortable = true }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className={`flex items-center space-x-1 ${sortable ? 'cursor-pointer hover:text-gray-700' : ''}`} onClick={onClick}>
            <span>{children}</span>
            {sortable && <ChevronsUpDown size={14} className="text-gray-400" />}
        </div>
    </th>
);

const InputWithActions = ({ placeholder, value, actions, disabled = false }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            disabled={disabled}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando avaliações...</span>
    </div>
);

const EmptyState = ({ message = "Nenhuma avaliação encontrada", showIcon = true }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {showIcon && <AlertCircle size={48} className="text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center">
            {!showIcon ? "Selecione empresa, unidade e setor para visualizar as avaliações." : "Nenhum registro encontrado com os filtros aplicados."}
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar avaliações</h3>
        <p className="text-red-600 text-center mb-4">{message}</p>
        <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
            <RefreshCw size={16} />
            Tentar novamente
        </button>
    </div>
);

// --- Componente Principal ---

export default function ListarEspirometria() {
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);

    // Modal states
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);

    // Pagination and sorting
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'dataExame', direction: 'desc' });

    // Deletion states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchAvaliacoes = useCallback(async () => {
        if (!selectedSetor) {
            setAvaliacoes([]);
            setTotalPages(0);
            setTotalElements(0);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const sort = `${sortConfig.key},${sortConfig.direction}`;
            const data = await espirometriaService.getEspirometrias(
                currentPage,
                pageSize,
                sort,
                selectedEmpresa?.id,
                selectedUnidade?.id,
                selectedSetor?.id
            );
            setAvaliacoes(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (e) {
            setError("Não foi possível carregar as avaliações.");
            setAvaliacoes([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, sortConfig, selectedEmpresa, selectedUnidade, selectedSetor]);

    useEffect(() => {
        fetchAvaliacoes();
    }, [fetchAvaliacoes]);

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setIsEmpresaModalOpen(false);
        setCurrentPage(0);
    };

    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setSelectedSetor(null);
        setIsUnidadeModalOpen(false);
        setCurrentPage(0);
    };

    const handleSelectSetor = (setor) => {
        setSelectedSetor(setor);
        setIsSetorModalOpen(false);
        setCurrentPage(0);
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setCurrentPage(0);
        setAvaliacoes([]);
        setTotalPages(0);
        setTotalElements(0);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setCurrentPage(0);
    };

    const handleClearSetor = () => {
        setSelectedSetor(null);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await espirometriaService.deleteEspirometria(itemToDelete.id);
                setShowDeleteModal(false);
                setShowSuccessModal(true);
                toast.success('Avaliação excluída com sucesso!');
                fetchAvaliacoes();
                setTimeout(() => setShowSuccessModal(false), 2000);
            } catch (error) {
                toast.error('Erro ao excluir avaliação.');
            } finally {
                setItemToDelete(null);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data Inválida';
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString('pt-BR');
    };

    const renderContent = () => {
        if (!selectedSetor) {
            return <EmptyState message="Selecione empresa, unidade e setor" showIcon={false} />;
        }
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorState message={error} onRetry={fetchAvaliacoes} />;
        }
        if (avaliacoes.length === 0) {
            return <EmptyState message="Nenhuma avaliação encontrada" />;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <TableHeader sortable={false}>Data Avaliação</TableHeader>
                            <TableHeader>Empresa</TableHeader>
                            <TableHeader>Funcionário</TableHeader>
                            <TableHeader sortable={false}>Ações</TableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {avaliacoes.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.dataAvaliacao)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.nomeEmpresa || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.nomeFuncionario || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => navigate(`/medicina/editar-espirometria/${item.id}`)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Editar Avaliação"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Excluir Avaliação"
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
        );
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
                <div className="container mx-auto">
                    {/* Cabeçalho */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                            Avaliações de Espirometria
                        </h1>
                        <button
                            onClick={() => navigate('/medicina/cadastrar-espirometria')}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>Cadastrar Avaliação</span>
                        </button>
                    </div>

                    {/* Filtros e Tabela */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        {/* Seção de Filtros */}
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros</h3>

                            {/* Grid de Filtros */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Empresa *
                                    </label>
                                    <InputWithActions
                                        placeholder="Clique para selecionar empresa..."
                                        value={selectedEmpresa?.razaoSocial || ''}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEmpresaModalOpen(true)}
                                                    className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClearEmpresa}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unidade *
                                    </label>
                                    <InputWithActions
                                        placeholder={!selectedEmpresa ? "Primeiro selecione uma empresa..." : "Clique para selecionar unidade..."}
                                        value={selectedUnidade?.nome || ''}
                                        disabled={!selectedEmpresa}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                                    disabled={!selectedEmpresa}
                                                    className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClearUnidade}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Setor *
                                    </label>
                                    <InputWithActions
                                        placeholder={!selectedUnidade ? "Primeiro selecione uma unidade..." : "Clique para selecionar setor..."}
                                        value={selectedSetor?.nome || ''}
                                        disabled={!selectedUnidade}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => selectedUnidade && setIsSetorModalOpen(true)}
                                                    disabled={!selectedUnidade}
                                                    className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleClearSetor}
                                                    className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Mensagens informativas */}
                            {!selectedEmpresa && (
                                <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <AlertCircle size={20} className="text-blue-600 mr-3" />
                                    <p className="text-blue-800 text-sm">
                                        <strong>Importante:</strong> Selecione empresa, unidade e setor para visualizar as avaliações de espirometria.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Controles */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                            <div className="text-sm text-gray-600">
                                {totalElements > 0 && `Total de ${totalElements} registro(s)`}
                            </div>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >
                                <option value="5">5 por página</option>
                                <option value="10">10 por página</option>
                                <option value="20">20 por página</option>
                                <option value="50">50 por página</option>
                            </select>
                        </div>

                        {/* Conteúdo da Tabela */}
                        {renderContent()}

                        {/* Paginação */}
                        {avaliacoes.length > 0 && totalPages > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                    Mostrando de <span className="font-medium">{currentPage * pageSize + 1}</span> até{' '}
                                    <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> de{' '}
                                    <span className="font-medium">{totalElements}</span> registros
                                </p>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handlePageChange(0)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronsLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                        {currentPage + 1}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages - 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronsRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={isEmpresaModalOpen}
                onClose={() => setIsEmpresaModalOpen(false)}
                onSelect={handleSelectEmpresa}
            />

            {selectedEmpresa && (
                <UnidadesOperacionaisModal
                    isOpen={isUnidadeModalOpen}
                    onClose={() => setIsUnidadeModalOpen(false)}
                    onSelect={handleSelectUnidade}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {selectedEmpresa && (
                <SetorSearchModal
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={handleSelectSetor}
                    empresaId={selectedEmpresa.id}
                    unidadeOperacionalId={selectedUnidade?.id}
                />
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Avaliação</h3>
                            <p className="text-gray-600 mb-2">
                                Tem certeza que deseja excluir esta avaliação de espirometria?
                            </p>
                            <p className="text-sm text-red-600 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setItemToDelete(null);
                                    }}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avaliação excluída com sucesso!</h3>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
