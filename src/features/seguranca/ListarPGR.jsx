import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Printer,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Search,
    X,
    Edit,
    Trash2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { Link } from "react-router-dom";
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';
import pgrService from '../../api/services/pgr/pgrService';
import { useDebounce } from '../../hooks/useDebounce';
import apiService from '../../api/apiService';
import { toast } from "react-toastify";

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
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando PGRs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhum PGR encontrado" }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center">
            Selecione uma empresa para visualizar os PGRs.
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar PGRs</h3>
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

export default function ListarPGR() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [pgrPage, setPgrPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ATIVO');
    const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);
    const [selectedPgrId, setSelectedPgrId] = useState(null);

    const fetchPGRs = useCallback(async (empresaId, unidadeId, page = 0, size = 10, name = '', status = 'ATIVO', sort = 'id,desc') => {
        setLoading(true);
        setError(null);
        try {
            const data = await pgrService.getPgrsByEmpresaId(empresaId, page, size, name, status, sort, unidadeId);
            setPgrPage(data);
        } catch (err) {
            setError('Erro ao buscar PGRs.');
            setPgrPage(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedEmpresa) {
            fetchPGRs(selectedEmpresa.id, selectedUnidade?.id, 0, entriesPerPage, debouncedSearchTerm, statusFilter, 'id,desc');
            setCurrentPage(0);
        } else {
            setPgrPage(null);
        }
    }, [debouncedSearchTerm, selectedEmpresa, selectedUnidade, entriesPerPage, statusFilter, fetchPGRs]);

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setPgrPage(null);
        setSearchTerm('');
    };

    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setIsUnidadeModalOpen(false);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pgrPage.totalPages) {
            setCurrentPage(newPage);
            fetchPGRs(selectedEmpresa.id, selectedUnidade?.id, newPage, entriesPerPage, debouncedSearchTerm, statusFilter, 'id,desc');
        }
    };

    const handleEntriesChange = (e) => {
        const newSize = Number(e.target.value);
        setEntriesPerPage(newSize);
    };

    const handlePrintPgr = (pgrId) => {
        const reportUrl = `${apiService.defaults.baseURL}/reports/pgr/${pgrId}`;
        window.open(reportUrl, '_blank');
    };

    const handleInactivatePgr = (pgrId) => {
        setSelectedPgrId(pgrId);
        setIsInactivateModalOpen(true);
    };

    const confirmInactivatePgr = async () => {
        if (selectedPgrId) {
            try {
                await pgrService.inactivatePgr(selectedPgrId);
                toast.success('PGR Inativado com sucesso!');
                fetchPGRs(selectedEmpresa.id, selectedUnidade?.id, currentPage, entriesPerPage, debouncedSearchTerm, statusFilter, 'id,desc');
                setIsInactivateModalOpen(false);
                setSelectedPgrId(null);
            } catch (err) {
                setError('Erro ao inativar PGR.');
                setIsInactivateModalOpen(false);
                setSelectedPgrId(null);
            }
        }
    };

    const cancelInactivatePgr = () => {
        setIsInactivateModalOpen(false);
        setSelectedPgrId(null);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                        PGR - Programa de Gerenciamento de Riscos
                    </h1>
                    <Link
                        to="/seguranca/novo-pgr"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Nova PGR</span>
                    </Link>
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
                                                onClick={() => setIsModalOpen(true)}
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
                                    Unidade Operacional
                                </label>
                                <InputWithActions
                                    placeholder={!selectedEmpresa ? "Primeiro selecione uma empresa..." : "Clique para selecionar unidade..."}
                                    value={selectedUnidade ? selectedUnidade.nome : ''}
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
                                    <strong>Importante:</strong> Selecione uma empresa para visualizar os PGRs disponíveis.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles e Filtros */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Status:</label>
                            <select
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ATIVO">ATIVO</option>
                                <option value="INATIVO">INATIVO</option>
                                <option value="">TODOS</option>
                            </select>
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
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={() => {
                                if (selectedEmpresa) {
                                    fetchPGRs(selectedEmpresa.id, selectedUnidade?.id, currentPage, entriesPerPage, debouncedSearchTerm, statusFilter, 'id,desc');
                                }
                            }}
                        />
                    ) : !selectedEmpresa ? (
                        <EmptyState message="Selecione uma empresa para ver os PGRs" />
                    ) : pgrPage?.content?.length === 0 ? (
                        <EmptyState message="Nenhum PGR encontrado para esta empresa" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <TableHeader sortable={false}>ID</TableHeader>
                                        <TableHeader>Empresa</TableHeader>
                                        <TableHeader>Unidade Operacional</TableHeader>
                                        <TableHeader>Data Documento</TableHeader>
                                        <TableHeader>Data Revisão</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader sortable={false}>Ações</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pgrPage?.content?.map((pgr) => (
                                        <tr key={pgr.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{pgr.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {pgr.unidadeOperacional.empresa.razaoSocial}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pgr.unidadeOperacional?.nome || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pgr.dataDocumento ? new Date(pgr.dataDocumento).toLocaleDateString('pt-BR') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pgr.dataRevisao ? new Date(pgr.dataRevisao).toLocaleDateString('pt-BR') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    pgr.status === 'ATIVO'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {pgr.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <Link
                                                        to={`/seguranca/editar-pgr/${pgr.id}`}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="Editar PGR"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handlePrintPgr(pgr.id)}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                        title="Imprimir PGR"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleInactivatePgr(pgr.id)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                        title="Inativar PGR"
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

                    {/* Paginação */}
                    {pgrPage && pgrPage.totalElements > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{pgrPage.pageable.offset + 1}</span> até{' '}
                                <span className="font-medium">{pgrPage.pageable.offset + pgrPage.numberOfElements}</span> de{' '}
                                <span className="font-medium">{pgrPage.totalElements}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(0)}
                                    disabled={pgrPage.first}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={pgrPage.first}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                    {currentPage + 1}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={pgrPage.last}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pgrPage.totalPages - 1)}
                                    disabled={pgrPage.last}
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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

            {/* Modal de Confirmação de Inativação */}
            {isInactivateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inativar PGR</h3>
                            <p className="text-gray-600 mb-2">
                                Não é possível excluir um PGR. Se você não deseja mais utilizá-lo, pode inativá-lo.
                            </p>
                            <p className="text-gray-600 mb-6">
                                Deseja inativar o PGR de ID: <strong className="text-red-600 font-bold text-lg">#{selectedPgrId}</strong>?
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={cancelInactivatePgr}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmInactivatePgr}
                                    className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Inativar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
