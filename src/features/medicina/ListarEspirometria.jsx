import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, ChevronsUpDown, X } from 'lucide-react';
import espirometriaService from '../../api/services/medicina/espirometriaService';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';
import SetorSearchModal from '../../components/modal/SetorSearchModal';

// --- Sub-Componentes --- //

const InputWithActions = ({ placeholder, value, onSearchClick, onClearClick, disabled = false }) => (
    <div className="relative">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            onClick={!disabled ? onSearchClick : undefined}
            className={`w-full appearance-none bg-white pl-4 pr-20 py-2 border border-gray-300 rounded-md h-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer focus:ring-2 focus:ring-blue-500'}`}
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
            {value && (
                <button type="button" onClick={onClearClick} disabled={disabled} className="p-2 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed">
                    <X size={18} />
                </button>
            )}
            <button type="button" onClick={onSearchClick} disabled={disabled} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-r-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Search size={18} />
            </button>
        </div>
    </div>
);

const TableHeader = ({ children, onClick, sortConfig, sortKey }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onClick(sortKey)}>
        <div className="flex items-center">
            <span>{children}</span>
            {sortConfig.key === sortKey && <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
            {sortConfig.key !== sortKey && <ChevronsUpDown size={14} className="ml-1 text-gray-400" />}
        </div>
    </th>
);

const Pagination = ({ currentPage, totalPages, onPageChange, totalElements, pageSize }) => {
    if (totalPages <= 1) return null;

    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p className="mb-3 sm:mb-0">
                Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalElements}</span> resultados
            </p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(0)} disabled={currentPage === 0} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="px-3 py-1 font-semibold text-gray-800">Página {currentPage + 1} de {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button>
                <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"><ChevronsRight size={16} /></button>
            </div>
        </div>
    );
};

// --- Componente Principal --- //

export default function ListarEspirometria() {
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

    // Pagination and sorting states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'dataExame', direction: 'desc' });
    
    // Deletion states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const navigate = useNavigate();

    const fetchAvaliacoes = useCallback(async () => {
        // Only fetch if at least a sector is selected
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
            toast.error("Erro ao carregar avaliações.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, sortConfig, selectedEmpresa, selectedUnidade, selectedSetor]);

    useEffect(() => {
        fetchAvaliacoes();
    }, [fetchAvaliacoes]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
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
                toast.success('Avaliação excluída com sucesso!');
                fetchAvaliacoes(); // Refresh list
            } catch (error) {
                toast.error('Erro ao excluir avaliação.');
            }
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Data Inválida';
        }
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString('pt-BR');
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto">
                    <header className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Avaliações de Espirometria</h1>
                        <button onClick={() => navigate('/medicina/cadastrar-espirometria')} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                            <Plus size={18} /> Cadastrar Avaliação
                        </button>
                    </header>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                <InputWithActions placeholder="Selecione uma empresa" value={selectedEmpresa?.razaoSocial || ''} onSearchClick={() => setIsEmpresaModalOpen(true)} onClearClick={() => handleSelectEmpresa(null)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                                <InputWithActions placeholder="Selecione uma unidade" value={selectedUnidade?.nome || ''} onSearchClick={() => setIsUnidadeModalOpen(true)} onClearClick={() => handleSelectUnidade(null)} disabled={!selectedEmpresa} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                                <InputWithActions placeholder="Selecione um setor" value={selectedSetor?.nome || ''} onSearchClick={() => setIsSetorModalOpen(true)} onClearClick={() => handleSelectSetor(null)} disabled={!selectedUnidade} />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                <tr>
                                    <TableHeader onClick={handleSort} sortConfig={sortConfig} sortKey="dataExame">Data</TableHeader>
                                    <TableHeader onClick={handleSort} sortConfig={sortConfig} sortKey="nomeEmpresa">Empresa</TableHeader>
                                    <TableHeader onClick={handleSort} sortConfig={sortConfig} sortKey="nomeFuncionario">Funcionário</TableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="4" className="text-center py-10 text-red-500">{error}</td></tr>
                                    ) : !selectedSetor ? (
                                        <tr><td colSpan="4" className="text-center py-10 text-gray-500">Por favor, selecione uma empresa, unidade e setor para ver os resultados.</td></tr>
                                    ) : avaliacoes.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-10 text-gray-500">Nenhum registro encontrado para os filtros selecionados.</td></tr>
                                    ) : (
                                        avaliacoes.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(item.dataAvaliacao)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nomeEmpresa || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nomeFuncionario || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex gap-4">
                                                        <button onClick={() => navigate(`/medicina/editar-espirometria/${item.id}`)} className="text-gray-500 hover:text-blue-600 transition-colors" title="Editar"><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete(item)} className="text-gray-500 hover:text-red-600 transition-colors" title="Remover"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalElements={totalElements} pageSize={pageSize} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EmpresaSearchModal isOpen={isEmpresaModalOpen} onClose={() => setIsEmpresaModalOpen(false)} onSelect={handleSelectEmpresa} />
            {selectedEmpresa && <UnidadesOperacionaisModal isOpen={isUnidadeModalOpen} onClose={() => setIsUnidadeModalOpen(false)} onSelect={handleSelectUnidade} empresaId={selectedEmpresa.id} />}
            {selectedUnidade && <SetorSearchModal isOpen={isSetorModalOpen} onClose={() => setIsSetorModalOpen(false)} onSelect={handleSelectSetor} empresaId={selectedEmpresa.id} unidadeId={selectedUnidade.id} />}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Excluir Avaliação</h3>
                            <p className="mt-2 text-sm text-gray-500">Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-4">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}