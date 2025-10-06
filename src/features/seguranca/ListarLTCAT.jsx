import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    AlertTriangle,
    Printer,
    Search,
    X,
    AlertCircle,
    RefreshCw,
    ChevronsUpDown
} from 'lucide-react';
import ltcatService from '../../api/services/ltcat/ltcatService';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/apiService';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';

// --- Componentes Reutilizáveis ---

const TableHeader = ({ children, onClick, sortable = true }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className={`flex items-center space-x-1 ${sortable ? 'cursor-pointer hover:text-gray-700' : ''}`} onClick={onClick}>
            <span>{children}</span>
            {sortable && <ChevronsUpDown size={14} className="text-gray-400" />}
        </div>
    </th>
);

const InputWithActions = ({ placeholder, value, onChange, actions, disabled = false }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly
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
        <span className="ml-3 text-gray-600">Carregando LTCATs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhum LTCAT encontrado", showIcon = true }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {showIcon && <AlertCircle size={48} className="text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center">
            {!showIcon ? "Selecione uma empresa e unidade para visualizar os LTCATs." : "Nenhum registro encontrado com os filtros aplicados."}
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar LTCATs</h3>
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

export default function ListarLTCAT() {
    const navigate = useNavigate();
    const [ltcats, setLtcats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLtcatId, setSelectedLtcatId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // State for filters
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);

    const fetchLtcats = async (page, size, filters = {}) => {
        if (!filters.unidadeOperacionalId) {
            setLtcats([]);
            setTotalPages(0);
            setTotalElements(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await ltcatService.getLtcats(page, size, filters);
            setLtcats(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            const msg = error.response?.data?.message || "Erro ao carregar a lista de LTCATs.";
            setErrorMessage(msg);
            setShowErrorModal(true);
            setLtcats([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filters = {
            empresaId: selectedEmpresa?.id,
            unidadeOperacionalId: selectedUnidade?.id,
        };
        fetchLtcats(currentPage, entriesPerPage, filters);
    }, [currentPage, selectedEmpresa, selectedUnidade, entriesPerPage]);

    const handleEmpresaSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setCurrentPage(0);
        setIsEmpresaModalOpen(false);
    };

    const handleUnidadeSelect = (unidade) => {
        setSelectedUnidade(unidade);
        setCurrentPage(0);
        setIsUnidadeModalOpen(false);
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setCurrentPage(0);
        setLtcats([]);
        setTotalPages(0);
        setTotalElements(0);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
        setCurrentPage(0);
    };

    const handleDelete = (id) => {
        setSelectedLtcatId(id);
        setIsDeleteModalOpen(true);
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedLtcatId(null);
    };

    const confirmDelete = async () => {
        if (selectedLtcatId) {
            try {
                await ltcatService.deleteLtcat(selectedLtcatId);
                setIsDeleteModalOpen(false);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setSelectedLtcatId(null);
                    if (selectedEmpresa && selectedUnidade) {
                        const filters = {
                            empresaId: selectedEmpresa?.id,
                            unidadeOperacionalId: selectedUnidade?.id,
                        };
                        fetchLtcats(currentPage, entriesPerPage, filters);
                    }
                }, 1500);
            } catch (error) {
                const msg = error.response?.data?.message || "Ocorreu um erro inesperado ao excluir o LTCAT.";
                setErrorMessage(msg);
                setIsDeleteModalOpen(false);
                setShowErrorModal(true);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEntriesChange = (e) => {
        const newSize = Number(e.target.value);
        setEntriesPerPage(newSize);
        setCurrentPage(0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('pt-BR');
    };

    const handlePrintLtcat = (ltcatId) => {
        const url = `${api.defaults.baseURL}/ltcat/${ltcatId}/report`;
        window.open(url, '_blank');
    };

    const renderContent = () => {
        if (!selectedUnidade) {
            return <EmptyState message="Selecione uma empresa e unidade" showIcon={false} />;
        }
        if (loading) {
            return <LoadingSpinner />;
        }
        if (showErrorModal && errorMessage) {
            return (
                <ErrorState
                    message={errorMessage}
                    onRetry={() => {
                        setShowErrorModal(false);
                        if (selectedEmpresa && selectedUnidade) {
                            const filters = {
                                empresaId: selectedEmpresa?.id,
                                unidadeOperacionalId: selectedUnidade?.id,
                            };
                            fetchLtcats(currentPage, entriesPerPage, filters);
                        }
                    }}
                />
            );
        }
        if (ltcats.length === 0) {
            return <EmptyState message="Nenhum LTCAT encontrado" />;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <TableHeader sortable={false}>ID</TableHeader>
                            <TableHeader>Empresa / Unidade</TableHeader>
                            <TableHeader>Data Documento</TableHeader>
                            <TableHeader>Data Vencimento</TableHeader>
                            <TableHeader>Situação</TableHeader>
                            <TableHeader sortable={false}>Ações</TableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ltcats.map((ltcat) => (
                            <tr key={ltcat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{ltcat.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {ltcat.unidadeOperacional.empresa.razaoSocial} / {ltcat.unidadeOperacional.descricao}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(ltcat.dataDocumento)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(ltcat.dataVencimento)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        ltcat.situacao === 'ATIVO'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {ltcat.situacao}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => navigate(`/seguranca/ltcat/editar/${ltcat.id}`)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Editar LTCAT"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handlePrintLtcat(ltcat.id)}
                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                            title="Imprimir LTCAT"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ltcat.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Excluir LTCAT"
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
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                        Gestão de LTCAT
                    </h1>
                    <button
                        onClick={() => navigate('/seguranca/novo-ltcat')}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Novo LTCAT</span>
                    </button>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Seção de Filtros */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros</h3>

                        {/* Seleção de Empresa e Unidade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Empresa *
                                </label>
                                <InputWithActions
                                    placeholder="Clique para selecionar empresa..."
                                    value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''}
                                    disabled={true}
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
                                    Unidade Operacional *
                                </label>
                                <InputWithActions
                                    placeholder={!selectedEmpresa ? "Primeiro selecione uma empresa..." : "Clique para selecionar unidade..."}
                                    value={selectedUnidade ? selectedUnidade.descricao : ''}
                                    disabled={true}
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
                        </div>

                        {/* Mensagens informativas */}
                        {!selectedEmpresa && (
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <AlertCircle size={20} className="text-blue-600 mr-3" />
                                <p className="text-blue-800 text-sm">
                                    <strong>Importante:</strong> Selecione uma empresa e unidade operacional para visualizar os LTCATs disponíveis.
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
                            value={entriesPerPage}
                            onChange={handleEntriesChange}
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
                    {ltcats.length > 0 && totalPages > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{currentPage * entriesPerPage + 1}</span> até{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * entriesPerPage, totalElements)}</span> de{' '}
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

            {/* Modais */}
            {isEmpresaModalOpen && (
                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onClose={() => setIsEmpresaModalOpen(false)}
                    onSelect={handleEmpresaSelect}
                />
            )}

            {selectedEmpresa && isUnidadeModalOpen && (
                <UnidadesOperacionaisModal
                    isOpen={isUnidadeModalOpen}
                    onClose={() => setIsUnidadeModalOpen(false)}
                    onSelect={handleUnidadeSelect}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 mb-2">
                                Tem certeza de que deseja excluir o LTCAT de ID: <strong className="text-red-600 font-bold text-lg">#{selectedLtcatId}</strong>?
                            </p>
                            <p className="text-sm text-red-600 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={cancelDelete}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">LTCAT excluído com sucesso!</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Erro Global */}
            {showErrorModal && !loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="flex flex-col items-center text-center">
                            <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Processar Solicitação</h3>
                            <p className="text-gray-700 mb-6">{errorMessage}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowErrorModal(false);
                                    setErrorMessage('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
