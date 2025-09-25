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
                : "Aplique os filtros desejados e clique em 'Buscar' para visualizar as CATs."
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
            {/* Controles */}
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

            {/* Lista de funcionários */}
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

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Página {currentPage + 1} de {totalPages}
                    </p>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onPageChange(0)}
                            disabled={currentPage === 0}
                            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                            {currentPage + 1}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
                            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsRight size={16} />
                        </button>
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
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false); // Controla se o usuário já fez uma busca

    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
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
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);

    // Função para buscar CATs
    const fetchCats = async (page = 0, size = 10, filters = {}) => {
        setLoading(true);
        setError('');

        try {
            const response = await catService.getCats(page, size, filters);

            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    setCats(response.data.content);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                } else if (Array.isArray(response.data)) {
                    setCats(response.data);
                    setCurrentPage(0);
                    setTotalPages(1);
                    setTotalElements(response.data.length);
                } else {
                    setCats([]);
                    setCurrentPage(0);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } else if (Array.isArray(response)) {
                setCats(response);
                setCurrentPage(0);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setCats([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error('Erro ao buscar CATs:', err);
            setError('Erro ao carregar lista de CATs. Tente novamente.');
            setCats([]);
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar funcionários por setor
    const fetchFuncionarios = async (setorId, page = 0, size = 10) => {
        if (!setorId) {
            setFuncionarios([]);
            setFuncionariosCurrentPage(0);
            setFuncionariosTotalPages(0);
            setFuncionariosTotalElements(0);
            return;
        }

        setLoadingFuncionarios(true);
        try {
            const response = await funcionarioService.buscarFuncionariosPorSetor(setorId, {
                page,
                size,
                sort: 'nome,asc'
            });

            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    setFuncionarios(response.data.content);
                    setFuncionariosCurrentPage(response.data.number || 0);
                    setFuncionariosTotalPages(response.data.totalPages || 0);
                    setFuncionariosTotalElements(response.data.totalElements || 0);
                } else if (Array.isArray(response.data)) {
                    // Simulação de paginação client-side se o backend não fornecer
                    const startIndex = page * size;
                    const endIndex = startIndex + size;
                    const paginatedData = response.data.slice(startIndex, endIndex);

                    setFuncionarios(paginatedData);
                    setFuncionariosCurrentPage(page);
                    setFuncionariosTotalPages(Math.ceil(response.data.length / size));
                    setFuncionariosTotalElements(response.data.length);
                } else {
                    setFuncionarios([]);
                    setFuncionariosCurrentPage(0);
                    setFuncionariosTotalPages(0);
                    setFuncionariosTotalElements(0);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            setFuncionarios([]);
            setFuncionariosCurrentPage(0);
            setFuncionariosTotalPages(0);
            setFuncionariosTotalElements(0);
        } finally {
            setLoadingFuncionarios(false);
        }
    };

    // Não carrega dados iniciais automaticamente - CATs só são carregadas quando filtros são aplicados
    // useEffect(() => {
    //     fetchCats();
    // }, []);

    // Buscar funcionários quando setor é selecionado
    useEffect(() => {
        if (selectedSetor) {
            setSelectedFuncionarios([]); // Limpar seleções anteriores
            setFuncionariosCurrentPage(0);
            fetchFuncionarios(selectedSetor.id, 0, funcionariosPageSize);
        } else {
            setFuncionarios([]);
            setSelectedFuncionarios([]);
        }
    }, [selectedSetor, funcionariosPageSize]);

    // Carregar CATs automaticamente quando funcionários são selecionados
    useEffect(() => {
        const loadCatsByFuncionarios = async () => {
            if (selectedFuncionarios.length === 0) {
                // Se nenhum funcionário selecionado, limpar lista
                setCats([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
                setHasSearched(false);
                return;
            }

            // Se há funcionários selecionados, buscar CATs de cada um
            setLoading(true);
            setError('');
            setHasSearched(true);

            try {
                const allCats = [];

                // Buscar CATs para cada funcionário selecionado
                for (const funcionario of selectedFuncionarios) {
                    if (funcionario && funcionario.id && typeof funcionario.id === 'number' && funcionario.id > 0) {
                        try {
                            const response = await catService.getCatsByFuncionario(funcionario.id, 0, 100);

                            if (response && response.data) {
                                if (Array.isArray(response.data.content)) {
                                    allCats.push(...response.data.content);
                                } else if (Array.isArray(response.data)) {
                                    allCats.push(...response.data);
                                }
                            } else if (Array.isArray(response)) {
                                allCats.push(...response);
                            }
                        } catch (funcError) {
                            console.error(`Erro ao buscar CATs do funcionário ${funcionario.id}:`, funcError);
                            // Continue com os outros funcionários mesmo se um falhar
                        }
                    }
                }

                // Remover duplicatas baseado no ID
                const uniqueCats = allCats.filter((cat, index, self) =>
                    index === self.findIndex(c => c.id === cat.id)
                );

                // Ordenar por data de acidente (mais recente primeiro)
                uniqueCats.sort((a, b) => {
                    const dateA = new Date(a.dataAcidente || 0);
                    const dateB = new Date(b.dataAcidente || 0);
                    return dateB - dateA;
                });

                setCats(uniqueCats);
                setCurrentPage(0);
                setTotalElements(uniqueCats.length);
                // Para simplificar, vamos paginar no frontend
                const catsPerPage = pageSize;
                setTotalPages(Math.ceil(uniqueCats.length / catsPerPage));

            } catch (err) {
                console.error('Erro ao buscar CATs dos funcionários:', err);
                setError('Erro ao carregar CATs dos funcionários selecionados.');
                setCats([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        loadCatsByFuncionarios();
    }, [selectedFuncionarios, pageSize]); // Monitorar mudanças nos funcionários selecionados

    // Toggle funcionário selecionado
    const handleToggleFuncionario = (funcionario) => {
        setSelectedFuncionarios(prev => {
            const isSelected = prev.some(f => f.id === funcionario.id);
            if (isSelected) {
                return prev.filter(f => f.id !== funcionario.id);
            } else {
                return [...prev, funcionario];
            }
        });
    };

    // Mudança de página dos funcionários
    const handleFuncionariosPageChange = (newPage) => {
        if (selectedSetor) {
            fetchFuncionarios(selectedSetor.id, newPage, funcionariosPageSize);
        }
    };

    // Mudança de tamanho da página dos funcionários
    const handleFuncionariosPageSizeChange = (newSize) => {
        setFuncionariosPageSize(newSize);
        setFuncionariosCurrentPage(0);
        if (selectedSetor) {
            fetchFuncionarios(selectedSetor.id, 0, newSize);
        }
    };

    // Aplicar filtros
    const applyFilters = () => {
        const filters = {};

        if (searchTerm.trim()) {
            filters.search = searchTerm.trim();
        }

        // Validar IDs antes de enviar
        if (selectedEmpresa && selectedEmpresa.id && typeof selectedEmpresa.id === 'number' && selectedEmpresa.id > 0) {
            filters.empresaId = selectedEmpresa.id;
        }

        if (selectedSetor && selectedSetor.id && typeof selectedSetor.id === 'number' && selectedSetor.id > 0) {
            filters.setorId = selectedSetor.id;
        }

        if (selectedFuncionarios.length > 0) {
            const validFunctionarioIds = selectedFuncionarios
                .filter(f => f && f.id && typeof f.id === 'number' && !isNaN(f.id) && f.id > 0)
                .map(f => f.id);

            if (validFunctionarioIds.length > 0) {
                filters.funcionarioIds = validFunctionarioIds;
            }
        }

        setHasSearched(true); // Marca que o usuário fez uma busca
        setCurrentPage(0);
        fetchCats(0, pageSize, filters);
    };

    // Limpar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedEmpresa(null);
        setSelectedSetor(null);
        setSelectedFuncionarios([]);
        setCats([]);
        setCurrentPage(0);
        setTotalPages(0);
        setTotalElements(0);
        setHasSearched(false); // Resetar estado de busca
    };

    // Mudança de página (paginação client-side para CATs dos funcionários)
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Mudança de tamanho da página (recalcula paginação client-side)
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0);
        // Recalcula total de páginas
        if (cats.length > 0) {
            setTotalPages(Math.ceil(cats.length / newSize));
        }
    };

    // Formatar data
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    // Formatar tipo CAT
    const formatTipoCat = (tipo) => {
        const tipos = {
            'INICIAL': 'Inicial',
            'REABERTURA': 'Reabertura',
            'COMUNICACAO_OBITO': 'Comunicação de Óbito'
        };
        return tipos[tipo] || tipo;
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                        Comunicação de Acidente de Trabalho (CAT)
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to={'/seguranca/novo-cat'}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>Nova CAT</span>
                        </Link>
                    </div>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Seção de Filtros Hierárquicos */}
                    <div className="space-y-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros por Localização</h3>

                        {/* Seleção de Empresa e Setor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    1. Selecionar Empresa *
                                </label>
                                <InputWithActions
                                    placeholder="Clique para selecionar empresa..."
                                    value={selectedEmpresa ? `${selectedEmpresa.razaoSocial} - ${selectedEmpresa.nomeFantasia || selectedEmpresa.cpfOuCnpj}` : ''}
                                    disabled={true}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setIsEmpresaModalOpen(true)}
                                                className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEmpresa(null);
                                                    setSelectedSetor(null);
                                                    setSelectedFuncionarios([]);
                                                }}
                                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    2. Selecionar Setor *
                                </label>
                                <InputWithActions
                                    placeholder={!selectedEmpresa ? "Primeiro selecione uma empresa..." : "Clique para selecionar setor..."}
                                    value={selectedSetor ? selectedSetor.nome : ''}
                                    disabled={true}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedEmpresa) {
                                                        setIsSetorModalOpen(true);
                                                    }
                                                }}
                                                disabled={!selectedEmpresa}
                                                className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md border-r border-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSetor(null);
                                                    setSelectedFuncionarios([]);
                                                }}
                                                className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </div>
                        </div>

                        {/* Lista de Funcionários */}
                        {selectedSetor && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    3. Selecionar Funcionários do Setor "{selectedSetor.nome}"
                                </label>
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

                        {!selectedEmpresa && (
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <AlertCircle size={20} className="text-blue-600 mr-3" />
                                <p className="text-blue-800 text-sm">
                                    <strong>Passo 1:</strong> Selecione uma empresa para começar a filtrar as CATs por localização e funcionários.
                                </p>
                            </div>
                        )}

                        {selectedEmpresa && !selectedSetor && (
                            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle size={20} className="text-yellow-600 mr-3" />
                                <p className="text-yellow-800 text-sm">
                                    <strong>Passo 2:</strong> Agora selecione um setor da empresa "{selectedEmpresa.razaoSocial}" para ver os funcionários disponíveis.
                                </p>
                            </div>
                        )}

                        {selectedEmpresa && selectedSetor && selectedFuncionarios.length === 0 && (
                            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                <AlertCircle size={20} className="text-green-600 mr-3" />
                                <p className="text-green-800 text-sm">
                                    <strong>Passo 3:</strong> Selecione um ou mais funcionários para visualizar automaticamente suas CATs.
                                </p>
                            </div>
                        )}

                        {selectedEmpresa && selectedSetor && selectedFuncionarios.length > 0 && (
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <CheckCircle size={20} className="text-blue-600 mr-3" />
                                <p className="text-blue-800 text-sm">
                                    <strong>✓ CATs carregadas!</strong> Visualizando as CATs de {selectedFuncionarios.length} funcionário(s) selecionado(s).
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Filtros Ativos */}
                    {(selectedEmpresa || selectedSetor || selectedFuncionarios.length > 0 || searchTerm) && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Filtros Aplicados:</h4>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {selectedEmpresa && (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                Empresa: {selectedEmpresa.razaoSocial}
                                            </span>
                                        )}
                                        {selectedSetor && (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                Setor: {selectedSetor.nome}
                                            </span>
                                        )}
                                        {selectedFuncionarios.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded">
                                                {selectedFuncionarios.length} funcionário(s) selecionado(s)
                                            </span>
                                        )}
                                        {searchTerm && (
                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                                Busca: "{searchTerm}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Limpar todos
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Controles de Paginação */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="flex items-center gap-4">
                            {selectedFuncionarios.length > 0 && (
                                <p className="text-sm text-gray-600">
                                    Exibindo CATs de {selectedFuncionarios.length} funcionário(s)
                                </p>
                            )}
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                        <select
                            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
                                if (hasSearched) {
                                    applyFilters();
                                }
                            }}
                        />
                    ) : cats.length === 0 ? (
                        <EmptyState hasSearched={hasSearched} />
                    ) : (
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
                                    {cats
                                        .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                                        .map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{cat.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {cat.acidentado?.nome && cat.acidentado?.sobrenome
                                                    ? `${cat.acidentado.nome} ${cat.acidentado.sobrenome}`
                                                    : cat.funcionarioNome || '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cat.acidentado?.cpf || cat.funcionarioCpf || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cat.acidentado?.empresa?.razaoSocial || cat.empresaNome || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(cat.dataAcidente)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    cat.tipoCat === 'INICIAL'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : cat.tipoCat === 'REABERTURA'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {formatTipoCat(cat.tipoCat)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => navigate(`/seguranca/editar-cat/${cat.id}`)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="Editar CAT"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // TODO: Implementar impressão de relatório
                                                            console.log('Imprimir CAT', cat.id);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                        title="Imprimir CAT"
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
                    )}

                    {/* Paginação */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando <span className="font-medium">{(currentPage * pageSize) + 1}</span> até{' '}
                                <span className="font-medium">
                                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                                </span> de{' '}
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
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modais */}
                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onClose={() => setIsEmpresaModalOpen(false)}
                    onSelect={(empresa) => {
                        setSelectedEmpresa(empresa);
                        setSelectedSetor(null);
                        setSelectedFuncionarios([]);
                        setIsEmpresaModalOpen(false);
                    }}
                />

                <SetorSearchModalEmpresa
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={(setor) => {
                        setSelectedSetor(setor);
                        setSelectedFuncionarios([]);
                        setIsSetorModalOpen(false);
                    }}
                    empresaId={selectedEmpresa?.id}
                />
            </div>
        </div>
    );
}
