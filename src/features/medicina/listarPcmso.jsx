import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import pcmsoService from '../../api/services/pcmso/pcmsoService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import apiService from '../../api/apiService.js'; // Importando o apiService
import {
     Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Frown, Smile, ClipboardList, Filter, Search, Printer
} from 'lucide-react';

const InputWithActions = ({ placeholder, value, actions, className = '', onClick }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            onClick={onClick}
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`}
        />
        <div className="absolute right-0 flex">{actions}</div>
    </div>
);

const Notification = ({ message, type }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
            'bg-yellow-500';

    return (
        <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn`}>
            {type === 'success' ? <Smile size={20} /> : <Frown size={20} />}
            <span>{message}</span>
        </div>
    );
};

// Removido isGeneratingReport das props
const PcmsoList = ({ onCreateNew, onEdit, onDelete, onGenerateReport }) => {
    const [pcmsoPage, setPcmsoPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);

    const fetchPcmsos = useCallback(async () => {
        if (!selectedEmpresa?.id || !selectedUnidade?.id) {
            setPcmsoPage(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const sortString = `${sortConfig.key},${sortConfig.direction}`;
            const statusFilter = selectedStatus === 'todos' ? '' : selectedStatus;
            const data = await pcmsoService.getPcmsos(
                currentPage,
                itemsPerPage,
                sortString,
                selectedEmpresa?.id,
                selectedUnidade?.id,
                statusFilter
            );
            setPcmsoPage(data);
        } catch (e) {
            setError("Não foi possível carregar a lista de PCMSOs.");
            toast.error("Não foi possível carregar a lista de PCMSOs.", e);
            setPcmsoPage(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, sortConfig, selectedEmpresa, selectedUnidade, selectedStatus]);

    useEffect(() => {
        fetchPcmsos();
    }, [fetchPcmsos]);

    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(0);
    };

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

    const clearFilters = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setSelectedStatus('todos');
        setSortConfig({ key: 'id', direction: 'desc' });
        setCurrentPage(0);
    };
    
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(0);
    }

    const paginatedData = pcmsoPage?.content || [];
    const showInitialMessage = !selectedEmpresa || !selectedUnidade;

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">PCMSO - Programa de Controle Médico de Saúde Ocupacional</h1>
                        <p className="text-gray-600 mt-1">Gerencie todos os programas de saúde ocupacional da empresa</p>
                    </div>
                    <button
                        onClick={onCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                        <Plus size={18} />
                        Cadastrar PCMSO
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="lg:col-span-1">
                            <label className="text-sm font-medium text-gray-600">Empresa</label>
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''}
                                onClick={() => setIsEmpresaModalOpen(true)}
                                actions={
                                    selectedEmpresa ? (
                                        <button type="button" onClick={() => { setSelectedEmpresa(null); setSelectedUnidade(null); setCurrentPage(0); }}
                                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md">
                                            <X size={18}/>
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => setIsEmpresaModalOpen(true)}
                                                className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md">
                                            <Search size={18}/>
                                        </button>
                                    )
                                }
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <label className="text-sm font-medium text-gray-600">Unidade Operacional</label>
                            <InputWithActions
                                placeholder={selectedEmpresa ? "Selecione uma unidade" : "Selecione uma empresa primeiro"}
                                value={selectedUnidade ? selectedUnidade.nome : ''}
                                onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                actions={
                                     selectedUnidade ? (
                                        <button type="button" onClick={() => {setSelectedUnidade(null); setCurrentPage(0);}}
                                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md">
                                            <X size={18}/>
                                        </button>
                                    ) : (
                                    <button type="button"
                                            onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                            disabled={!selectedEmpresa}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md disabled:bg-gray-400">
                                        <Search size={18}/>
                                    </button>
                                     )
                                }
                            />
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="flex-grow">
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mt-1">
                                    <Filter size={16} className="text-gray-500 mr-2" />
                                    <select
                                        value={selectedStatus}
                                        onChange={handleStatusChange}
                                        className="bg-transparent focus:outline-none text-sm w-full"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="ATIVO">Ativo</option>
                                        <option value="INATIVO">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            {(selectedEmpresa || selectedUnidade || selectedStatus !== 'todos') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm mb-2"
                                >
                                    <X size={16} className="mr-1" /> Limpar
                                </button>
                            )}
                        </div>
                    </div>

                    {showInitialMessage ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList size={48} className="text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Selecione Empresa e Unidade</h3>
                            <p className="text-gray-500 max-w-md">
                                Para listar os PCMSOs, por favor selecione uma empresa e uma unidade operacional.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600">Carregando PCMSOs...</p>
                        </div>
                    ) : error ? (
                         <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Frown size={48} className="text-red-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Erro ao carregar</h3>
                            <p className="text-gray-500 max-w-md">{error}</p>
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList size={48} className="text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum PCMSO encontrado</h3>
                            <p className="text-gray-500 max-w-md">
                                Sua busca não retornou resultados. Tente ajustar os filtros ou cadastre um novo PCMSO.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        {[
                                            { key: 'unidadeOperacional.empresa.razaoSocial', label: 'Empresa' },
                                            { key: 'unidadeOperacional.nome', label: 'Unidade Operacional' },
                                            { key: 'dataDocumento', label: 'Data do Documento' },
                                            { key: 'dataVencimento', label: 'Data de Vencimento' },
                                            { key: 'status', label: 'Situação' },
                                            { key: 'acoes', label: 'Ações' }
                                        ].map(header => (
                                            <th
                                                key={header.key}
                                                className={`text-left py-3 px-4 font-semibold text-gray-600 text-sm ${
                                                    header.key !== 'acoes' ? 'cursor-pointer hover:bg-gray-200' : ''
                                                }`}
                                                onClick={() => header.key !== 'acoes' && handleSort(header.key)}
                                            >
                                                <div className="flex items-center">
                                                    {header.label}
                                                    {sortConfig.key === header.key && (
                                                        <span className="ml-1">
                                                 {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {paginatedData.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.nomeEmpresa || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.nomeUnidadeOperacional || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{new Date(item.dataDocumento).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                <div className="flex items-center">
                                                    {new Date(item.dataVencimento).toLocaleDateString()}
                                                    {new Date(item.dataVencimento) < new Date() && (
                                                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Vencido</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                              item.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {item.status}
                                          </span>
                                            </td>
                                            <td class="py-3 px-4">
                                                <div class="flex gap-3">
                                                    <button
                                                        onClick={() => onEdit(item)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                                        aria-label="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(item.id)}
                                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                                        aria-label="Excluir"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    {/* Botão de impressão simplificado */}
                                                    <button
                                                        onClick={() => onGenerateReport(item.id)}
                                                        className="text-gray-500 hover:text-green-600 transition-colors"
                                                        aria-label="Imprimir PCMSO"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {pcmsoPage && pcmsoPage.totalElements > 0 && (
                                <Pagination
                                    currentPage={pcmsoPage.number + 1}
                                    totalPages={pcmsoPage.totalPages}
                                    onPageChange={handlePageChange}
                                    totalItems={pcmsoPage.totalElements}
                                    itemsPerPage={itemsPerPage}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
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
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p className="mb-3 sm:mb-0">Mostrando {startItem} até {endItem} de {totalItems} registros</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Primeira página"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                        page = i + 1;
                    } else if (currentPage <= 3) {
                        page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                    } else {
                        page = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-full text-sm font-medium ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 1 && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className={`w-9 h-9 rounded-full text-sm font-medium ${
                            currentPage === totalPages
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {totalPages}
                    </button>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Próxima página"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Última página"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default function ListarPcmso() {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pcmsoToDelete, setPcmsoToDelete] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    // Removido o estado isGeneratingReport

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 2000);
    };

    const handleCreateNew = () => {
        navigate('/medicina/pcmso/novo');
    };

    const handleEdit = (pcmso) => {
        navigate(`/medicina/editar-pcmso/${pcmso.id}`);
    };

    const handleDelete = (id) => {
        setPcmsoToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Lógica simplificada para gerar relatório
    const handleGenerateReport = (pcmsoId) => {
        const reportUrl = `${apiService.defaults.baseURL}/report/pcmso/${pcmsoId}`;
        window.open(reportUrl, '_blank');
    };

    const confirmDelete = async () => {
        if (pcmsoToDelete) {
            try {
                await pcmsoService.deletePcmso(pcmsoToDelete);
                showNotification('PCMSO excluído com sucesso!', 'success');
                setRefreshKey(oldKey => oldKey + 1); 
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.response?.data || 'Erro ao excluir o PCMSO.';
                toast.error(errorMessage);
            } finally {
                setIsDeleteModalOpen(false);
                setPcmsoToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setPcmsoToDelete(null);
    };

    return (
        <>
            <Notification message={notification?.message} type={notification?.type} />
            {/* Removida a prop isGeneratingReport */}
            <PcmsoList
                key={refreshKey}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateReport={handleGenerateReport}
            />

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
                        <p className="text-gray-700 mb-6">
                            Deseja realmente excluir o PCMSO de ID: <strong className="font-bold">{pcmsoToDelete}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}