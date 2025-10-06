import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    Search,
    Printer,
    AlertCircle,
    RefreshCw,
    ChevronsUpDown
} from 'lucide-react';
import pcmsoService from '../../api/services/pcmso/pcmsoService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import apiService from '../../api/apiService.js';

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
        <span className="ml-3 text-gray-600">Carregando PCMSOs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhum PCMSO encontrado", showIcon = true }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {showIcon && <AlertCircle size={48} className="text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center">
            {!showIcon ? "Selecione uma empresa e unidade operacional para visualizar os PCMSOs." : "Nenhum registro encontrado com os filtros aplicados."}
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar PCMSOs</h3>
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

export default function ListarPcmso() {
    const navigate = useNavigate();
    const [pcmsoPage, setPcmsoPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pcmsoToDelete, setPcmsoToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fetchPcmsos = useCallback(async () => {
        if (!selectedEmpresa?.id || !selectedUnidade?.id) {
            setPcmsoPage(null);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await pcmsoService.getPcmsos(
                currentPage,
                itemsPerPage,
                'id,desc',
                selectedEmpresa?.id,
                selectedUnidade?.id,
                selectedStatus
            );
            setPcmsoPage(data);
        } catch (e) {
            setError("Não foi possível carregar a lista de PCMSOs.");
            setPcmsoPage(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, selectedEmpresa, selectedUnidade, selectedStatus]);

    useEffect(() => {
        fetchPcmsos();
    }, [fetchPcmsos]);

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setIsEmpresaModalOpen(false);
        setSelectedUnidade(null);
        setCurrentPage(0);
    };

    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setIsUnidadeModalOpen(false);
        setCurrentPage(0);
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setCurrentPage(0);
        setPcmsoPage(null);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
        setCurrentPage(0);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pcmsoPage?.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleEdit = (pcmso) => {
        navigate(`/medicina/editar-pcmso/${pcmso.id}`);
    };

    const handleDelete = (id) => {
        setPcmsoToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (pcmsoToDelete) {
            try {
                await pcmsoService.deletePcmso(pcmsoToDelete);
                setIsDeleteModalOpen(false);
                setShowSuccessModal(true);
                toast.success('PCMSO excluído com sucesso!');
                fetchPcmsos();
                setTimeout(() => setShowSuccessModal(false), 2000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erro ao excluir o PCMSO.';
                toast.error(errorMessage);
            } finally {
                setPcmsoToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setPcmsoToDelete(null);
    };

    const handleGenerateReport = (pcmsoId) => {
        const reportUrl = `${apiService.defaults.baseURL}/report/pcmso/${pcmsoId}`;
        window.open(reportUrl, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    const renderContent = () => {
        if (!selectedEmpresa || !selectedUnidade) {
            return <EmptyState message="Selecione empresa e unidade" showIcon={false} />;
        }
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorState message={error} onRetry={fetchPcmsos} />;
        }
        if (!pcmsoPage?.content || pcmsoPage.content.length === 0) {
            return <EmptyState message="Nenhum PCMSO encontrado" />;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <TableHeader sortable={false}>ID</TableHeader>
                            <TableHeader>Empresa</TableHeader>
                            <TableHeader>Unidade Operacional</TableHeader>
                            <TableHeader>Data Documento</TableHeader>
                            <TableHeader>Data Vencimento</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader sortable={false}>Ações</TableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pcmsoPage.content.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.nomeEmpresa || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.nomeUnidadeOperacional || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.dataDocumento)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        {formatDate(item.dataVencimento)}
                                        {isExpired(item.dataVencimento) && (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                Vencido
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.status === 'ATIVO'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Editar PCMSO"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleGenerateReport(item.id)}
                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                            title="Imprimir PCMSO"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Excluir PCMSO"
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
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            PCMSO - Programa de Controle Médico de Saúde Ocupacional
                        </h1>
                        <p className="text-gray-600">Gerencie todos os programas de saúde ocupacional da empresa</p>
                    </div>
                    <button
                        onClick={() => navigate('/medicina/pcmso/novo')}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm mt-4 sm:mt-0"
                    >
                        <Plus size={16} />
                        <span>Cadastrar PCMSO</span>
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
                                    Unidade Operacional *
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
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos</option>
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>
                        </div>

                        {/* Mensagens informativas */}
                        {!selectedEmpresa && (
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <AlertCircle size={20} className="text-blue-600 mr-3" />
                                <p className="text-blue-800 text-sm">
                                    <strong>Importante:</strong> Selecione uma empresa e unidade operacional para visualizar os PCMSOs disponíveis.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="text-sm text-gray-600">
                            {pcmsoPage?.totalElements > 0 && `Total de ${pcmsoPage.totalElements} registro(s)`}
                        </div>
                        <select
                            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
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
                    {pcmsoPage && pcmsoPage.totalElements > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{currentPage * itemsPerPage + 1}</span> até{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, pcmsoPage.totalElements)}</span> de{' '}
                                <span className="font-medium">{pcmsoPage.totalElements}</span> registros
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
                                    disabled={currentPage >= pcmsoPage.totalPages - 1}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pcmsoPage.totalPages - 1)}
                                    disabled={currentPage >= pcmsoPage.totalPages - 1}
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

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 mb-2">
                                Deseja realmente excluir o PCMSO de ID: <strong className="text-red-600 font-bold text-lg">#{pcmsoToDelete}</strong>?
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">PCMSO excluído com sucesso!</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
