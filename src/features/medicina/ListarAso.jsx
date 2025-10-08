import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Printer,
    Check,
    User,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    AlertCircle,
    ChevronsUpDown,
    RefreshCw
} from 'lucide-react';
import asoService from '../../api/services/aso/asoService.js';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';

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
        <span className="ml-3 text-gray-600">Carregando ASOs...</span>
    </div>
);

const EmptyState = ({ message = "Nenhum ASO encontrado", showIcon = true, icon = null }) => (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {showIcon && (icon || <AlertCircle size={48} className="text-gray-400 mb-4" />)}
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-center text-sm">
            Selecione os filtros acima para visualizar os ASOs disponíveis.
        </p>
    </div>
);

// --- Componente Principal ---

export default function ListarAso() {
    const navigate = useNavigate();

    // Data states
    const [asos, setAsos] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(false);

    // Filter states
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);

    // Funcionario list state
    const [funcionariosDoSetor, setFuncionariosDoSetor] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

    // Modal states
    const [modalState, setModalState] = useState({ empresa: false, unidade: false, setor: false });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [asoToDelete, setAsoToDelete] = useState(null);

    const fetchAsos = useCallback(async (page = 0) => {
        if (!selectedFuncionario) {
            setAsos([]);
            return;
        }
        setLoading(true);
        try {
            const params = { page, size: pagination.size, sort: 'dataEmissao,desc' };
            const response = await asoService.getAsosByFuncionario(selectedFuncionario.id, params);
            setAsos(response.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0,
                page
            }));
        } catch (error) {
            toast.error("Erro ao carregar ASOs do funcionário.");
            setAsos([]);
        } finally {
            setLoading(false);
        }
    }, [selectedFuncionario, pagination.size]);

    useEffect(() => {
        fetchAsos(pagination.page);
    }, [selectedFuncionario, pagination.page, pagination.size]);

    useEffect(() => {
        if (!selectedSetor) {
            setFuncionariosDoSetor([]);
            return;
        }
        const carregarFuncionarios = async () => {
            setLoadingFuncionarios(true);
            try {
                const response = await funcionarioService.buscarFuncionariosPorSetor(selectedSetor.id, { page: 0, size: 100 });
                setFuncionariosDoSetor(response.data.content || []);
            } catch (error) {
                toast.error('Erro ao carregar funcionários do setor.');
                setFuncionariosDoSetor([]);
            } finally {
                setLoadingFuncionarios(false);
            }
        };
        carregarFuncionarios();
    }, [selectedSetor]);

    const openModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: true }));
    const closeModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: false }));

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handlePageSizeChange = (e) => {
        setPagination(prev => ({ ...prev, size: Number(e.target.value), page: 0 }));
    };

    const handleEmpresaSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncionario(null);
        closeModal('empresa');
    };

    const handleUnidadeSelect = (unidade) => {
        setSelectedUnidade(unidade);
        setSelectedSetor(null);
        setSelectedFuncionario(null);
        closeModal('unidade');
    };

    const handleSetorSelect = (setor) => {
        setSelectedSetor(setor);
        setSelectedFuncionario(null);
        closeModal('setor');
    };

    const handleFuncionarioSelect = async (funcionario) => {
        // Ao selecionar um funcionário, busca os dados completos dele para evitar erros de entidade não encontrada no backend
        setLoading(true);
        try {
            const response = await funcionarioService.getById(funcionario.id);
            setSelectedFuncionario(response.data);
            setPagination(prev => ({ ...prev, page: 0 }));
        } catch (error) {
            toast.error("Erro ao carregar os detalhes do funcionário.");
            setSelectedFuncionario(null);
        } finally {
            setLoading(false);
        }
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncionario(null);
        setFuncionariosDoSetor([]);
        setAsos([]);
    };

    const handleClearUnidade = () => {
        setSelectedUnidade(null);
        setSelectedSetor(null);
        setSelectedFuncionario(null);
        setFuncionariosDoSetor([]);
        setAsos([]);
    };

    const handleClearSetor = () => {
        setSelectedSetor(null);
        setSelectedFuncionario(null);
        setFuncionariosDoSetor([]);
        setAsos([]);
    };

    const handleClearFuncionario = () => {
        setSelectedFuncionario(null);
        setAsos([]);
    };

    const handleDelete = (aso) => {
        setAsoToDelete(aso);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (asoToDelete) {
            try {
                await asoService.deleteAso(asoToDelete.id);
                setShowDeleteModal(false);
                setShowSuccessModal(true);
                toast.success('ASO excluído com sucesso!');
                fetchAsos(pagination.page);
                setTimeout(() => setShowSuccessModal(false), 2000);
            } catch (error) {
                toast.error('Erro ao excluir ASO.');
            } finally {
                setAsoToDelete(null);
            }
        }
    };

    const handlePrint = (aso) => {
        // Implementar lógica de impressão
        toast.info(`Imprimindo ASO #${aso.id}`);
    };

    const getVencimento = (aso) => {
        if (!aso.dataEmissao || (aso.tipoAso !== 'ADMISSIONAL' && aso.tipoAso !== 'PERIODICO')) return 'N/A';
        const dataEmissao = new Date(aso.dataEmissao);
        dataEmissao.setFullYear(dataEmissao.getFullYear() + 1);
        return dataEmissao.toLocaleDateString('pt-BR');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
                <div className="container mx-auto">
                    {/* Cabeçalho */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                            Consultar ASO por Funcionário
                        </h1>
                        <button
                            onClick={() => navigate('/medicina/cadastrar-aso')}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span>Novo ASO</span>
                        </button>
                    </div>

                    {/* Filtros e Conteúdo */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        {/* Seção de Filtros */}
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Filtros</h3>

                            {/* Mensagem informativa */}
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                                <p className="text-blue-800 text-sm">
                                    <strong>Importante:</strong> Selecione a empresa, unidade e setor para listar os funcionários. Em seguida, clique em um funcionário para ver seus ASOs.
                                </p>
                            </div>

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
                                                    onClick={() => openModal('empresa')}
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
                                                    onClick={() => openModal('unidade')}
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
                                                    onClick={() => openModal('setor')}
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
                        </div>

                        {/* Lista de Funcionários */}
                        {selectedSetor && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Funcionários do Setor
                                    </label>
                                    {selectedFuncionario && (
                                        <button
                                            onClick={handleClearFuncionario}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Limpar seleção
                                        </button>
                                    )}
                                </div>

                                {loadingFuncionarios ? (
                                    <div className="flex items-center justify-center p-8 border border-gray-300 rounded-lg">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Carregando funcionários...</span>
                                    </div>
                                ) : funcionariosDoSetor.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                                        {funcionariosDoSetor.map((funcionario) => (
                                            <div
                                                key={funcionario.id}
                                                onClick={() => handleFuncionarioSelect(funcionario)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                    selectedFuncionario?.id === funcionario.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {funcionario.nome} {funcionario.sobrenome}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            CPF: {funcionario.cpf} | Função: {funcionario.funcao?.nome || 'Não informado'}
                                                        </div>
                                                    </div>
                                                    {selectedFuncionario?.id === funcionario.id && (
                                                        <Check size={20} className="text-blue-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border border-gray-300 rounded-lg bg-gray-50">
                                        <User size={48} className="text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum funcionário encontrado</h3>
                                        <p className="text-gray-500 text-center text-sm">
                                            Não há funcionários cadastrados neste setor
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tabela de ASOs */}
                        {selectedFuncionario && (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        ASOs de {selectedFuncionario.nome} {selectedFuncionario.sobrenome}
                                    </h3>
                                </div>

                                {/* Controles */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                                    <div className="text-sm text-gray-600">
                                        {pagination.totalElements > 0 && `Total de ${pagination.totalElements} registro(s)`}
                                    </div>
                                    <select
                                        className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                        value={pagination.size}
                                        onChange={handlePageSizeChange}
                                    >
                                        <option value="5">5 por página</option>
                                        <option value="10">10 por página</option>
                                        <option value="20">20 por página</option>
                                        <option value="50">50 por página</option>
                                    </select>
                                </div>

                                {loading ? (
                                    <LoadingSpinner />
                                ) : asos.length === 0 ? (
                                    <EmptyState message="Nenhum ASO encontrado para este funcionário" />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <TableHeader sortable={false}>ID</TableHeader>
                                                    <TableHeader>Data Emissão</TableHeader>
                                                    <TableHeader>Tipo</TableHeader>
                                                    <TableHeader>Empresa</TableHeader>
                                                    <TableHeader>Vencimento</TableHeader>
                                                    <TableHeader sortable={false}>Ações</TableHeader>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {asos.map((aso) => (
                                                    <tr key={aso.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            #{aso.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(aso.dataEmissao)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {aso.tipoAso}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {aso.funcionario?.empresa?.razaoSocial || aso.nomeEmpresa || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getVencimento(aso)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="flex items-center space-x-3">
                                                                <button
                                                                    onClick={() => navigate(`/medicina/editar-aso/${aso.id}`)}
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                    title="Editar ASO"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                            
                                                                <button
                                                                    onClick={() => handleDelete(aso)}
                                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                                    title="Excluir ASO"
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
                                {asos.length > 0 && pagination.totalPages > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                            Mostrando de <span className="font-medium">{pagination.page * pagination.size + 1}</span> até{' '}
                                            <span className="font-medium">{Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}</span> de{' '}
                                            <span className="font-medium">{pagination.totalElements}</span> registros
                                        </p>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handlePageChange(0)}
                                                disabled={pagination.page === 0}
                                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsLeft size={18} />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 0}
                                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                                {pagination.page + 1}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page >= pagination.totalPages - 1}
                                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.totalPages - 1)}
                                                disabled={pagination.page >= pagination.totalPages - 1}
                                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={modalState.empresa}
                onClose={() => closeModal('empresa')}
                onSelect={handleEmpresaSelect}
            />

            {selectedEmpresa && (
                <UnidadesOperacionaisModal
                    isOpen={modalState.unidade}
                    onClose={() => closeModal('unidade')}
                    onSelect={handleUnidadeSelect}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {selectedEmpresa && (
                <SetorSearchModal
                    isOpen={modalState.setor}
                    onClose={() => closeModal('setor')}
                    onSelect={handleSetorSelect}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir ASO</h3>
                            <p className="text-gray-600 mb-2">
                                Tem certeza que deseja excluir o ASO de ID: <strong className="text-red-600 font-bold text-lg">#{asoToDelete?.id}</strong>?
                            </p>
                            <p className="text-sm text-red-600 mb-6">Esta ação não pode ser desfeita.</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setAsoToDelete(null);
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ASO excluído com sucesso!</h3>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
