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
    Printer,
    AlertCircle,
    RefreshCw,
    X,
    User,
    CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import catService from '../../api/services/Cat/catService.js';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import SetorSearchModalEmpresa from '../../components/modal/SetorSearchModal.jsx';

// --- Componentes Reutilizáveis ---

const TableHeader = ({ children, onClick, sortable = true }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className={`flex items-center space-x-1 ${sortable ? 'cursor-pointer hover:text-gray-700' : ''}`} onClick={onClick}>
            <span>{children}</span>
            {sortable && <ChevronsUpDown size={14} className="text-gray-400" />}
        </div>
    </th>
);

const InputWithActions = ({ placeholder, value, onClick, actions, disabled = false }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onClick={onClick}
            readOnly
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
        <span className="ml-3 text-gray-600">Carregando CATs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhuma CAT encontrada", hasSearched = false }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
            {hasSearched ? message : "Pronto para buscar CATs"}
        </h3>
        <p className="text-gray-500 text-center">
            {hasSearched
                ? "Tente ajustar os filtros ou criar uma nova CAT."
                : "Aplique os filtros desejados para visualizar as CATs."
            }
        </p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700 mb-2">Erro ao carregar CATs</h3>
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

const FuncionariosList = ({
    funcionarios,
    loading,
    selectedFuncionarios,
    onToggleFuncionario,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    onPageSizeChange
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando funcionários...</span>
            </div>
        );
    }

    if (funcionarios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                <User size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhum funcionário encontrado neste setor</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-600">
                        {totalElements} funcionário(s) encontrado(s).
                        {selectedFuncionarios.length > 0 && ` ${selectedFuncionarios.length} selecionado(s).`}
                    </p>
                </div>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
                >
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                    <option value="50">50 por página</option>
                </select>
            </div>

            <div className="grid gap-2 max-h-96 overflow-y-auto">
                {funcionarios.map((funcionario) => {
                    const isSelected = selectedFuncionarios.some(f => f.id === funcionario.id);
                    return (
                        <div
                            key={funcionario.id}
                            onClick={() => onToggleFuncionario(funcionario)}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                            }`}>
                                {isSelected && <CheckCircle size={14} className="text-white" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {funcionario.nome} {funcionario.sobrenome}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span>{funcionario.cpf}</span>
                                    <span>{funcionario.funcao?.nome || 'Função não informada'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Página {currentPage + 1} de {totalPages}
                    </p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => onPageChange(0)} disabled={currentPage === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded">{currentPage + 1}</span>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Componente Principal ---

export default function ListarCAT() {
    const navigate = useNavigate();

    // Estados principais
    const [allCats, setAllCats] = useState([]); // Armazena todas as CATs buscadas
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Estados de paginação (agora client-side)
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncionarios, setSelectedFuncionarios] = useState([]);

    // Estados de funcionários
    const [funcionarios, setFuncionarios] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
    const [funcionariosCurrentPage, setFuncionariosCurrentPage] = useState(0);
    const [funcionariosTotalPages, setFuncionariosTotalPages] = useState(0);
    const [funcionariosTotalElements, setFuncionariosTotalElements] = useState(0);
    const [funcionariosPageSize, setFuncionariosPageSize] = useState(10);

    // Estados de modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedCatToDelete, setSelectedCatToDelete] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchFuncionarios = async (setorId, page = 0, size = 10) => {
        if (!setorId) {
            setFuncionarios([]);
            return;
        }
        setLoadingFuncionarios(true);
        try {
            const response = await funcionarioService.buscarFuncionariosPorSetor(setorId, { page, size, sort: 'nome,asc' });
            if (response?.data?.content) {
                setFuncionarios(response.data.content);
                setFuncionariosCurrentPage(response.data.number || 0);
                setFuncionariosTotalPages(response.data.totalPages || 0);
                setFuncionariosTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            setFuncionarios([]);
        } finally {
            setLoadingFuncionarios(false);
        }
    };

    useEffect(() => {
        if (selectedSetor) {
            setSelectedFuncionarios([]);
            fetchFuncionarios(selectedSetor.id, 0, funcionariosPageSize);
        } else {
            setFuncionarios([]);
            setSelectedFuncionarios([]);
        }
    }, [selectedSetor, funcionariosPageSize]);

    useEffect(() => {
        const fetchCatsForSelected = async () => {
            if (selectedFuncionarios.length === 0) {
                setAllCats([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            setError('');
            setHasSearched(true);

            try {
                const promises = selectedFuncionarios.map(func =>
                    catService.getCatsByFuncionario(func.id, 0, 1000) // Fetch all CATs per employee
                );

                const results = await Promise.all(promises);
                const allCatsResult = results.flatMap(response => response.content || []);
                const uniqueCats = Array.from(new Map(allCatsResult.map(cat => [cat.id, cat])).values());
                uniqueCats.sort((a, b) => new Date(b.dataAcidente) - new Date(a.dataAcidente));

                setAllCats(uniqueCats);

            } catch (err) {
                console.error('Erro ao buscar CATs dos funcionários:', err);
                setError('Erro ao carregar a lista de CATs. Tente novamente.');
                setAllCats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCatsForSelected();
    }, [selectedFuncionarios]);
    
    // Client-side filtering and pagination
    const filteredCats = allCats.filter(cat => 
        (cat.acidentado?.nome.toLowerCase() + ' ' + cat.acidentado?.sobrenome.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setTotalElements(filteredCats.length);
        setTotalPages(Math.ceil(filteredCats.length / pageSize));
        setCurrentPage(0);
    }, [filteredCats.length, pageSize]);

    const paginatedCats = filteredCats.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const handleToggleFuncionario = (funcionario) => {
        setSelectedFuncionarios(prev => {
            const isSelected = prev.some(f => f.id === funcionario.id);
            return isSelected ? prev.filter(f => f.id !== funcionario.id) : [...prev, funcionario];
        });
    };

    const handleFuncionariosPageChange = (newPage) => {
        if (selectedSetor) fetchFuncionarios(selectedSetor.id, newPage, funcionariosPageSize);
    };

    const handleFuncionariosPageSizeChange = (newSize) => {
        setFuncionariosPageSize(newSize);
        if (selectedSetor) fetchFuncionarios(selectedSetor.id, 0, newSize);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncionarios([]);
    };

    const handlePageChange = (newPage) => setCurrentPage(newPage);
    const handlePageSizeChange = (newSize) => setPageSize(newSize);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try { return new Date(dateString).toLocaleDateString('pt-BR'); } catch { return dateString; }
    };

    const formatTipoCat = (tipo) => {
        const tipos = { 'INICIAL': 'Inicial', 'REABERTURA': 'Reabertura', 'COMUNICACAO_OBITO': 'Comunicação de Óbito' };
        return tipos[tipo] || tipo;
    };

    const handleDeleteCat = (cat) => {
        setSelectedCatToDelete(cat);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCatToDelete) return;
        try {
            await catService.deleteCat(selectedCatToDelete.id);
            setShowDeleteModal(false);
            setSuccessMessage('CAT excluída com sucesso!');
            setShowSuccessModal(true);
            setSelectedFuncionarios([...selectedFuncionarios]); // Trigger reload
            setTimeout(() => setShowSuccessModal(false), 2000);
        } catch (error) {
            setShowDeleteModal(false);
            const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
            setErrorMessage(errorMsg.toLowerCase().includes('constraint') ? 'Esta CAT não pode ser excluída por ter vinculações.' : `Erro ao excluir CAT: ${errorMsg}`);
            setShowErrorModal(true);
        }
    };

    const handleInactivateCat = async () => {
        if (!selectedCatToDelete) return;
        try {
            await catService.inactivateCat(selectedCatToDelete.id);
            setShowErrorModal(false);
            setSuccessMessage('CAT inativada com sucesso!');
            setShowSuccessModal(true);
            setSelectedFuncionarios([...selectedFuncionarios]); // Trigger reload
            setTimeout(() => setShowSuccessModal(false), 2000);
        } catch (error) {
            setErrorMessage(`Erro ao inativar CAT: ${error.message}`);
        }
    };

    const handleGenerateReport = async (catId) => {
        setLoading(true);
        try {
            const htmlContent = await catService.gerarRelatorioHtml(catId);
            const newTab = window.open();
            newTab.document.write(htmlContent);
            newTab.document.close();
        } catch (error) {
            setErrorMessage(`Erro ao gerar relatório: ${error.response?.data?.message || error.message}`);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Comunicação de Acidente de Trabalho (CAT)</h1>
                    <Link to={'/seguranca/novo-cat'} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"><Plus size={16} /><span>Nova CAT</span></Link>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="space-y-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros por Localização</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1. Selecionar Empresa *</label>
                                <InputWithActions
                                    placeholder="Clique para selecionar empresa..."
                                    value={selectedEmpresa ? `${selectedEmpresa.razaoSocial}` : ''}
                                    onClick={() => setIsEmpresaModalOpen(true)}
                                    actions={<>
                                        <button type="button" onClick={() => setIsEmpresaModalOpen(true)} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md"><Search size={18}/></button>
                                        <button type="button" onClick={clearFilters} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><X size={18}/></button>
                                    </>}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">2. Selecionar Unidade</label>
                                <InputWithActions
                                    placeholder={!selectedEmpresa ? "Selecione uma empresa" : "Clique para selecionar unidade"}
                                    value={selectedUnidade ? selectedUnidade.nome : ''}
                                    onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                    disabled={!selectedEmpresa}
                                    actions={<>
                                        <button type="button" onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)} disabled={!selectedEmpresa} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md disabled:bg-gray-400"><Search size={18}/></button>
                                        <button type="button" onClick={() => { setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionarios([]); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><X size={18}/></button>
                                    </>}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">3. Selecionar Setor *</label>
                                <InputWithActions
                                    placeholder={!selectedUnidade ? "Selecione uma unidade" : "Clique para selecionar setor"}
                                    value={selectedSetor ? selectedSetor.nome : ''}
                                    onClick={() => selectedUnidade && setIsSetorModalOpen(true)}
                                    disabled={!selectedUnidade}
                                    actions={<>
                                        <button type="button" onClick={() => selectedUnidade && setIsSetorModalOpen(true)} disabled={!selectedUnidade} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md disabled:bg-gray-400"><Search size={18}/></button>
                                        <button type="button" onClick={() => { setSelectedSetor(null); setSelectedFuncionarios([]); }} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"><X size={18}/></button>
                                    </>}
                                />
                            </div>
                        </div>

                        {selectedSetor && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">4. Selecionar Funcionários do Setor "{selectedSetor.nome}"</label>
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <FuncionariosList
                                        funcionarios={funcionarios}
                                        loading={loadingFuncionarios}
                                        selectedFuncionarios={selectedFuncionarios}
                                        onToggleFuncionario={handleToggleFuncionario}
                                        currentPage={funcionariosCurrentPage}
                                        totalPages={funcionariosTotalPages}
                                        totalElements={funcionariosTotalElements}
                                        pageSize={funcionariosPageSize}
                                        onPageChange={handleFuncionariosPageChange}
                                        onPageSizeChange={handleFuncionariosPageSizeChange}
                                    />
                                </div>
                            </div>
                        )}

                        {!selectedEmpresa && <div className="flex items-center p-4 bg-blue-50 border-blue-200 rounded-lg"><AlertCircle size={20} className="text-blue-600 mr-3" /><p className="text-blue-800 text-sm"><strong>Passo 1:</strong> Selecione uma empresa para começar.</p></div>}
                        {selectedEmpresa && !selectedUnidade && <div className="flex items-center p-4 bg-yellow-50 border-yellow-200 rounded-lg"><AlertCircle size={20} className="text-yellow-600 mr-3" /><p className="text-yellow-800 text-sm"><strong>Passo 2:</strong> Selecione uma unidade para continuar.</p></div>}
                        {selectedUnidade && !selectedSetor && <div className="flex items-center p-4 bg-yellow-50 border-yellow-200 rounded-lg"><AlertCircle size={20} className="text-yellow-600 mr-3" /><p className="text-yellow-800 text-sm"><strong>Passo 3:</strong> Agora selecione um setor para ver os funcionários.</p></div>}
                        {selectedSetor && selectedFuncionarios.length === 0 && <div className="flex items-center p-4 bg-green-50 border-green-200 rounded-lg"><AlertCircle size={20} className="text-green-600 mr-3" /><p className="text-green-800 text-sm"><strong>Passo 4:</strong> Selecione um ou mais funcionários para visualizar suas CATs.</p></div>}
                        {selectedFuncionarios.length > 0 && <div className="flex items-center p-4 bg-blue-50 border-blue-200 rounded-lg"><CheckCircle size={20} className="text-blue-600 mr-3" /><p className="text-blue-800 text-sm"><strong>✓ CATs carregadas!</strong> Visualizando as CATs de {selectedFuncionarios.length} funcionário(s) selecionado(s).</p></div>}
                    </div>

                    {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={() => setSelectedFuncionarios([...selectedFuncionarios])} /> : paginatedCats.length === 0 ? <EmptyState hasSearched={hasSearched} /> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <TableHeader sortable={false}>ID</TableHeader>
                                        <TableHeader>Funcionário</TableHeader>
                                        <TableHeader>CPF</TableHeader>
                                        <TableHeader>Empresa</TableHeader>
                                        <TableHeader>Data do Acidente</TableHeader>
                                        <TableHeader>Tipo CAT</TableHeader>
                                        <TableHeader sortable={false}>Ações</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedCats.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">#{cat.id}</td>
                                            <td className="px-6 py-4">{cat.acidentado?.nome} {cat.acidentado?.sobrenome}</td>
                                            <td className="px-6 py-4">{cat.acidentado?.cpf}</td>
                                            <td className="px-6 py-4">{cat.acidentado?.empresa?.razaoSocial}</td>
                                            <td className="px-6 py-4">{formatDate(cat.dataAcidente)}</td>
                                            <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cat.tipoCat === 'INICIAL' ? 'bg-blue-100 text-blue-800' : cat.tipoCat === 'REABERTURA' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{formatTipoCat(cat.tipoCat)}</span></td>
                                            <td className="px-6 py-4"><div className="flex items-center space-x-3"><button onClick={() => navigate(`/seguranca/editar-cat/${cat.id}`)} className="text-blue-600 hover:text-blue-800"><Pencil size={18} /></button><button onClick={() => handleGenerateReport(cat.id)} className="text-gray-600 hover:text-gray-800" disabled={loading}><Printer size={18} /></button><button onClick={() => handleDeleteCat(cat)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4 border-t"><p className="text-sm">Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements}</p><div><button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>First</button><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Prev</button><span>{currentPage + 1}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>Next</button><button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}>Last</button></div></div>
                    )}
                </div>

                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onClose={() => setIsEmpresaModalOpen(false)}
                    onSelect={(empresa) => {
                        setSelectedEmpresa(empresa);
                        setSelectedUnidade(null);
                        setSelectedSetor(null);
                        setSelectedFuncionarios([]);
                        setIsEmpresaModalOpen(false);
                    }}
                />

                {selectedEmpresa && (
                    <UnidadesOperacionaisModal
                        isOpen={isUnidadeModalOpen}
                        onClose={() => setIsUnidadeModalOpen(false)}
                        onSelect={(unidade) => {
                            setSelectedUnidade(unidade);
                            setSelectedSetor(null);
                            setSelectedFuncionarios([]);
                            setIsUnidadeModalOpen(false);
                        }}
                        empresaId={selectedEmpresa.id}
                    />
                )}

                <SetorSearchModalEmpresa
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={(setor) => {
                        setSelectedSetor(setor);
                        setSelectedFuncionarios([]);
                        setIsSetorModalOpen(false);
                    }}
                    empresaId={selectedEmpresa?.id}
                    unidadeOperacionalId={selectedUnidade?.id}
                />

                {showDeleteModal && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div className="bg-white p-6 rounded-lg shadow-lg"><h3 className="text-lg font-semibold">Confirmar Exclusão</h3><p>Tem certeza?</p><button onClick={confirmDelete}>Sim</button><button onClick={() => setShowDeleteModal(false)}>Não</button></div></div>}
                {showErrorModal && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div className="bg-white p-6 rounded-lg shadow-lg"><h3 className="text-lg font-semibold">Erro</h3><p>{errorMessage}</p>{errorMessage.includes('vinculações') && <button onClick={handleInactivateCat}>Inativar</button>}<button onClick={() => setShowErrorModal(false)}>Fechar</button></div></div>}
                {showSuccessModal && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div className="bg-white p-6 rounded-lg shadow-lg"><h3 className="text-lg font-semibold">Sucesso</h3><p>{successMessage}</p></div></div>}
            </div>
        </div>
    );
}
