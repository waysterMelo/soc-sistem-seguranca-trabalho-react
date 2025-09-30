import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Added Search icon
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Printer, Search } from 'lucide-react';
import ltcatService from '../../api/services/ltcat/ltcatService';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/apiService';
// Import Modals
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';

// Helper component for inputs with action buttons
const InputWithActions = ({ placeholder, value, actions, onClick, disabled }) => (
    <div className="relative flex items-center" onClick={!disabled ? onClick : undefined}>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            disabled={disabled}
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer'}`}
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

export default function ListarLTCAT() {
    const navigate = useNavigate();
    const [ltcats, setLtcats] = useState([]);
    const [loading, setLoading] = useState(false); // Set initial loading to false
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLtcatId, setSelectedLtcatId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // State for filters
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    
    // State to control initial message
    const [searchTriggered, setSearchTriggered] = useState(false);

    const fetchLtcats = async (page, filters = {}) => {
        // Only fetch if an empresaId is present
        if (!filters.empresaId) {
            setLtcats([]);
            setTotalPages(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await ltcatService.getLtcats(page, 10, filters);
            setLtcats(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            const msg = error.response?.data?.message || "Erro ao carregar a lista de LTCATs.";
            setErrorMessage(msg);
            setShowErrorModal(true);
            setLtcats([]); // Clear data on error
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if a search has been triggered by selecting a company
        if (searchTriggered) {
            const filters = {
                empresaId: selectedEmpresa?.id,
                unidadeId: selectedUnidade?.id,
            };
            fetchLtcats(currentPage, filters);
        }
    }, [currentPage, selectedEmpresa, selectedUnidade, searchTriggered]);

    // Handlers for filters
    const handleEmpresaSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setCurrentPage(0);
        setSearchTriggered(true); // Trigger the search
        setIsEmpresaModalOpen(false);
    };

    const handleUnidadeSelect = (unidade) => {
        setSelectedUnidade(unidade);
        setCurrentPage(0);
        setIsUnidadeModalOpen(false);
    };

    const clearFilters = (e) => {
        e.stopPropagation();
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setCurrentPage(0);
        setLtcats([]);
        setTotalPages(0);
        setSearchTriggered(false); // Reset the search trigger
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
                    // Refetch with current filters
                    if (searchTriggered) {
                        const filters = {
                            empresaId: selectedEmpresa?.id,
                            unidadeId: selectedUnidade?.id,
                        };
                        fetchLtcats(currentPage, filters);
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

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
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
    
    const renderTableBody = () => {
        if (!searchTriggered) {
            return <tr><td colSpan="6" className="text-center py-10 text-gray-500">Por favor, selecione uma empresa para buscar os LTCATs.</td></tr>;
        }
        if (loading) {
            return <tr><td colSpan="6" className="text-center py-10 text-gray-500">Carregando...</td></tr>;
        }
        if (ltcats.length === 0) {
            return <tr><td colSpan="6" className="text-center py-10 text-gray-500">Nenhum LTCAT encontrado para os filtros selecionados.</td></tr>;
        }
        return ltcats.map((ltcat) => (
            <tr key={ltcat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">#{ltcat.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{ltcat.unidadeOperacional.empresa.razaoSocial} / {ltcat.unidadeOperacional.descricao}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(ltcat.dataDocumento)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(ltcat.dataVencimento)}</td>
                <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${ltcat.situacao === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ltcat.situacao}
                    </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                     <button className="text-blue-600 hover:text-blue-800"
                        onClick={() => handlePrintLtcat(ltcat.id)}
                     >
                        <Printer size={18} /> 
                        </button>
                    <button onClick={() => navigate(`/seguranca/ltcat/editar/${ltcat.id}`)} className="text-blue-600 hover:text-blue-800 p-2 transition-colors" title="Editar"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(ltcat.id)} className="text-red-600 hover:text-red-800 p-2 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Gestão de LTCAT</h1>
                    <button
                        onClick={() => navigate('/seguranca/novo-ltcat')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Novo LTCAT
                    </button>
                </header>

                {/* Filter Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Filtros</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Empresa *</label>
                            <InputWithActions
                                placeholder="Selecione uma empresa para começar"
                                value={selectedEmpresa?.razaoSocial || ''}
                                onClick={() => setIsEmpresaModalOpen(true)}
                                actions={
                                    <button type="button" onClick={() => setIsEmpresaModalOpen(true)} className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md"><Search size={18} /></button>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Unidade Operacional</label>
                            <InputWithActions
                                placeholder={selectedEmpresa ? "Selecione uma unidade (opcional)" : "Selecione uma empresa primeiro"}
                                value={selectedUnidade?.nome || ''}
                                onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                disabled={!selectedEmpresa}
                                actions={
                                    <button type="button" onClick={() => setIsUnidadeModalOpen(true)} disabled={!selectedEmpresa} className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-r-md disabled:bg-gray-400"><Search size={18} /></button>
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Empresa / Unidade</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Data Documento</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Data Vencimento</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Situação</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {searchTriggered && ltcats.length > 0 && (
                         <div className="flex justify-between items-center mt-4">
                            <button onClick={handlePrevPage} disabled={currentPage === 0 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="text-sm text-gray-700">Página {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}</span>
                            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1 || loading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Próxima <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal de Confirmação de Exclusão */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
                            <div className="mb-6">
                                <p className="text-gray-700">
                                    Tem certeza de que deseja excluir o LTCAT de ID: <strong className="text-red-600 font-bold text-lg">{selectedLtcatId}</strong>?
                                </p>
                                <p className="mt-2 text-sm text-red-600">Esta ação não pode ser desfeita.</p>
                            </div>
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

                {/* Modal de Sucesso */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="text-center">
                                <div className="text-green-600 text-6xl mb-4">✓</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">LTCAT excluído com sucesso!</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Erro */}
                {showErrorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
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

            {/* Modals for filtering */}
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
        </div>
    );
}
