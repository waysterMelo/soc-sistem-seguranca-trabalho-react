import React, { useState, useEffect } from 'react';
import {
    Plus,
    Printer,
    Trash2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Search,
    X,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Link } from "react-router-dom";
import ltipService from '../../api/services/Ltip/ltipService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import FuncaoSearchModal from '../../components/modal/funcaoSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';

// --- Componentes Reutilizáveis ---

const TableHeader = ({ children, onClick, sortable = true }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className={`flex items-center space-x-1 ${sortable ? 'cursor-pointer hover:text-gray-700' : ''}`} onClick={onClick}>
            <span>{children}</span>
            {sortable && <ChevronsUpDown size={14} className="text-gray-400" />}
        </div>
    </th>
);

const SituacaoBadge = ({ text, dataLevantamento, proximaRevisao }) => {
    const getStatusInfo = (status, dataLevantamento, proximaRevisao) => {
        const hoje = new Date();
        const dataRevisao = new Date(proximaRevisao);
        const isVencido = dataRevisao < hoje;
        
        if (isVencido) {
            return { color: 'bg-red-100 text-red-800', text: 'Vencido' };
        }
        
        const colors = {
            'Em análise': 'bg-yellow-100 text-yellow-800',
            'Aprovado': 'bg-green-100 text-green-800',
            'Em elaboração': 'bg-blue-100 text-blue-800',
            'Pendente': 'bg-gray-100 text-gray-800',
            'Em revisão': 'bg-orange-100 text-orange-800'
        };
        
        return { 
            color: colors[status] || 'bg-gray-100 text-gray-800', 
            text: status 
        };
    };

    const statusInfo = getStatusInfo(text, dataLevantamento, proximaRevisao);
    
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
        </span>
    );
};

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
        <span className="ml-3 text-gray-600">Carregando LTIPs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhum LTIP encontrado", showIcon = true }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {showIcon && <AlertCircle size={48} className="text-gray-400 mb-4" />}
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center">
            {!showIcon ? "Selecione uma empresa e unidade operacional para visualizar os LTIPs." : "Nenhum registro encontrado com os filtros aplicados."}
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar LTIPs</h3>
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

export default function ListarLTIP() {
    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // Estados para seleções obrigatórias
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncao, setSelectedFuncao] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);

    // Estados dos modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isFuncaoModalOpen, setIsFuncaoModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);

    // Dados dos LTIPs
    const [ltipData, setLtipData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Estados dos modais de feedback
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [ltipToDelete, setLtipToDelete] = useState(null);

    // Função para buscar LTIPs
    const fetchLtips = async () => {
        if (!selectedUnidade) {
            setLtipData([]);
            setTotalPages(0);
            setTotalItems(0);
            return;
        }

        setLoading(true);
        try {
            const response = await ltipService.getLtipsByFilters(
                selectedEmpresa?.id,
                selectedFuncao?.id,
                selectedSetor?.id,
                selectedUnidade?.id,
                currentPage,
                entriesPerPage
            );
            setLtipData(response.content || []);
            setTotalItems(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Erro ao buscar LTIPs. Tente novamente.');
            setLtipData([]);
            setTotalPages(0);
            setTotalItems(0);
            console.error('Erro ao buscar LTIPs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLtips();
    }, [selectedEmpresa, selectedSetor, selectedFuncao, selectedUnidade, currentPage, entriesPerPage]);

    const handleEmpresaSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncao(null);
        setCurrentPage(0);
        setIsEmpresaModalOpen(false);
    };

    const handleUnidadeSelect = (unidade) => {
        setSelectedUnidade(unidade);
        setSelectedSetor(null);
        setSelectedFuncao(null);
        setCurrentPage(0);
        setIsUnidadeModalOpen(false);
    };

    const handleSetorSelect = (setor) => {
        setSelectedSetor(setor);
        setSelectedFuncao(null);
        setCurrentPage(0);
        setIsSetorModalOpen(false);
    };

    const handleFuncaoSelect = (funcao) => {
        setSelectedFuncao(funcao);
        setCurrentPage(0);
        setIsFuncaoModalOpen(false);
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncao(null);
        setCurrentPage(0);
        setLtipData([]);
        setTotalPages(0);
        setTotalItems(0);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncao(null);
        setCurrentPage(0);
    };

    const handleClearSetor = () => {
        setSelectedSetor(null);
        setSelectedFuncao(null);
        setCurrentPage(0);
    };

    const handleClearFuncao = () => {
        setSelectedFuncao(null);
        setCurrentPage(0);
    };

    const handleDeleteLtip = (id) => {
        setLtipToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteLtip = async () => {
        try {
            await ltipService.deleteLtip(ltipToDelete);
            setShowDeleteModal(false);
            setSuccessMessage('LTIP excluído com sucesso!');
            setShowSuccessModal(true);
            fetchLtips();
            setLtipToDelete(null);
            setTimeout(() => setShowSuccessModal(false), 2000);
        } catch (error) {
            setShowDeleteModal(false);
            setErrorMessage('Erro ao excluir LTIP. Tente novamente.');
            setShowErrorModal(true);
            console.error('Erro ao excluir LTIP:', error);
            setLtipToDelete(null);
        }
    };

    const handlePrintLtip = async (ltipId) => {
        try {
            const htmlContent = await ltipService.gerarRelatorioHtml(ltipId);
            const newTab = window.open();
            newTab.document.write(htmlContent);
            newTab.document.close();
        } catch (err) {
            setErrorMessage('Erro ao gerar relatório. Tente novamente.');
            setShowErrorModal(true);
            console.error("Erro ao gerar relatório do LTIP: ", err);
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
        if (!dateString) return 'Pendente';
        
        try {
            const adjustedDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
            const date = new Date(adjustedDate);
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return 'Data inválida';
        }
    };

    const isProximoVencimento = (proximaRevisao) => {
        if (!proximaRevisao) return false;
        const hoje = new Date();
        const dataRevisao = new Date(proximaRevisao);
        const diasRestantes = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30 && diasRestantes > 0;
    };

    const getStatusIcon = (situacao, proximaRevisao) => {
        const hoje = new Date();
        const dataRevisao = new Date(proximaRevisao);
        
        if (dataRevisao < hoje) {
            return <span className="text-red-500">⚠️</span>;
        }
        if (isProximoVencimento(proximaRevisao)) {
            return <span className="text-orange-500">⏰</span>;
        }
        if (situacao === 'Aprovado') {
            return <span className="text-green-500">✅</span>;
        }
        return <span className="text-blue-500">📝</span>;
    };

    const getStatusDescription = (situacao, proximaRevisao) => {
        const hoje = new Date();
        const dataRevisao = new Date(proximaRevisao);
        
        if (dataRevisao < hoje) {
            return 'Vencido';
        }
        const diasRestantes = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
        return `${diasRestantes} dias restantes`;
    };

    const renderContent = () => {
        if (!selectedUnidade) {
            return <EmptyState message="Selecione empresa e unidade" showIcon={false} />;
        }
        if (loading) {
            return <LoadingSpinner />;
        }
        if (errorMessage && ltipData.length === 0) {
            return <ErrorState message={errorMessage} onRetry={fetchLtips} />;
        }
        if (ltipData.length === 0) {
            return <EmptyState message="Nenhum LTIP encontrado" />;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <TableHeader sortable={false}>ID</TableHeader>
                            <TableHeader>Empresa</TableHeader>
                            <TableHeader>Data Levantamento</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Situação</TableHeader>
                            <TableHeader>Próxima Revisão</TableHeader>
                            <TableHeader sortable={false}>Ações</TableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ltipData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {selectedEmpresa?.razaoSocial}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.dataLevantamento)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <SituacaoBadge 
                                            text={item.situacao || 'Em análise'} 
                                            dataLevantamento={item.dataLevantamento}
                                            proximaRevisao={item.proximaRevisao}
                                        />
                                        {isProximoVencimento(item.proximaRevisao) && (
                                            <span className="inline-block w-2 h-2 bg-orange-400 rounded-full" title="Próximo ao vencimento"></span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center">
                                        {getStatusIcon(item.situacao, item.proximaRevisao)}
                                        <span className="ml-2 text-xs text-gray-500">
                                            {getStatusDescription(item.situacao, item.proximaRevisao)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.proximaRevisao)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            to={`/seguranca/ltip/editar/${item.id}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Editar LTIP"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handlePrintLtip(item.id)}
                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                            title="Imprimir LTIP"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLtip(item.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Excluir LTIP"
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                        LTIP - Laudo Técnico de Insalubridade e Periculosidade
                    </h1>
                    <Link
                        to="/seguranca/novo-ltip"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Novo LTIP</span>
                    </Link>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Seção de Filtros */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros</h3>

                        {/* Grid de Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    value={selectedUnidade?.descricao || ''}
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
                                    Setor
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Função
                                </label>
                                <InputWithActions
                                    placeholder={!selectedSetor ? "Primeiro selecione um setor..." : "Clique para selecionar função..."}
                                    value={selectedFuncao?.nome || ''}
                                    disabled={!selectedSetor}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => selectedSetor && setIsFuncaoModalOpen(true)}
                                                disabled={!selectedSetor}
                                                className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Search size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearFuncao}
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
                                    <strong>Importante:</strong> Selecione uma empresa e unidade operacional para visualizar os LTIPs disponíveis.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="text-sm text-gray-600">
                            {totalItems > 0 && `Total de ${totalItems} registro(s)`}
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
                    {ltipData.length > 0 && totalPages > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{currentPage * entriesPerPage + 1}</span> até{' '}
                                <span className="font-medium">{Math.min((currentPage + 1) * entriesPerPage, totalItems)}</span> de{' '}
                                <span className="font-medium">{totalItems}</span> registros
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
            <EmpresaSearchModal
                isOpen={isEmpresaModalOpen}
                onClose={() => setIsEmpresaModalOpen(false)}
                onSelect={handleEmpresaSelect}
            />

            {selectedEmpresa && (
                <UnidadesOperacionaisModal
                    isOpen={isUnidadeModalOpen}
                    onClose={() => setIsUnidadeModalOpen(false)}
                    onSelect={handleUnidadeSelect}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {selectedUnidade && (
                <SetorSearchModal
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={handleSetorSelect}
                    empresaId={selectedEmpresa.id}
                    unidadeOperacionalId={selectedUnidade.id}
                />
            )}

            {selectedSetor && (
                <FuncaoSearchModal
                    isOpen={isFuncaoModalOpen}
                    onClose={() => setIsFuncaoModalOpen(false)}
                    onSelect={handleFuncaoSelect}
                    empresaId={selectedEmpresa.id}
                    setorId={selectedSetor.id}
                />
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 mb-2">
                                Tem certeza de que deseja excluir o LTIP de ID: <strong className="text-red-600 font-bold text-lg">#{ltipToDelete}</strong>?
                            </p>
                            <p className="text-sm text-red-600 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setLtipToDelete(null);
                                    }}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteLtip}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sucesso</h3>
                            <p className="text-gray-600 mb-6">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Erro */}
            {showErrorModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-red-600 text-6xl mb-4">❌</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro</h3>
                            <p className="text-gray-600 mb-6">{errorMessage}</p>
                            <button
                                type="button"
                                onClick={() => setShowErrorModal(false)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
