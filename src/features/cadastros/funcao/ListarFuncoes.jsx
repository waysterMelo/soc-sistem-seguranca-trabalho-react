
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
    AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';

// --- Componentes Reutilizáveis ---

// Cabeçalho da tabela com ícone de ordenação
const TableHeader = ({ children, onSort, field }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700" onClick={() => onSort(field)}>
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

// Selo de status colorido
const StatusBadge = ({ status }) => {
    const baseClasses = "inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusClasses = {
        'Ativo': 'bg-green-100 text-green-700',
        'Inativo': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Input com botões de ação
const InputWithActions = ({ placeholder, value, onChange, onSearch, onClear, actions }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions || (
                <>
                    <button type="button" onClick={onSearch} className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"><Search size={18}/></button>
                    <button type="button" onClick={onClear} className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"><Trash2 size={18}/></button>
                </>
            )}
        </div>
    </div>
);

// Modal de confirmação para deletar função
const ConfirmacaoModal = ({ isOpen, onClose, onConfirm, funcaoNome, processando }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar exclusão</h3>
                <p className="text-gray-700 mb-6">
                    Tem certeza que deseja excluir a função <span className="font-semibold">{funcaoNome}</span>?
                    Esta ação não poderá ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processando ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Excluindo...
                            </>
                        ) : (
                            'Excluir'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para oferecer alternativa de inativação quando não é possível excluir
const AlternativaModal = ({ isOpen, onClose, onInativar, funcaoNome, processando }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start mb-4">
                    <AlertTriangle className="text-yellow-500 h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900">Não é possível excluir</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    A função <span className="font-semibold">{funcaoNome}</span> não pode ser excluída porque está sendo utilizada em outros registros (funcionários, documentos ou outros cadastros).
                </p>
                <p className="text-gray-700 mb-6">
                    Como alternativa, você pode inativar esta função para que ela não apareça em novas operações.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onInativar}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processando ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Inativando...
                            </>
                        ) : (
                            'Inativar Função'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---

export default function ListarFuncoes() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [funcoes, setFuncoes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [sortField, setSortField] = useState('nome');
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('Ativo');
    const [confirmacaoModal, setConfirmacaoModal] = useState({
        isOpen: false,
        funcaoId: null,
        funcaoNome: ''
    });
    const [alternativaModal, setAlternativaModal] = useState({
        isOpen: false,
        funcaoId: null,
        funcaoNome: ''
    });
    const [empresaFiltro, setEmpresaFiltro] = useState('');
    const [setorFiltro, setSetorFiltro] = useState('');
    const [unidadeFiltro, setUnidadeFiltro] = useState('');
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        loadFuncoes();
    }, [currentPage, entriesPerPage, statusFilter, sortField, sortDirection]);

    const loadFuncoes = async () => {
        setLoading(true);
        try {
            // Preparando os parâmetros para a chamada de API
            const params = {
                page: currentPage - 1, // Considerando que o backend usa página 0 como inicial
                size: entriesPerPage,
                sort: `${sortField},${sortDirection}`,
                status: statusFilter !== 'todos' ? statusFilter : undefined,
                search: searchTerm || undefined,
                empresa: empresaFiltro || undefined,
                setor: setorFiltro || undefined,
                unidadeOperacional: unidadeFiltro || undefined
            };

            const response = await funcaoService.buscarComFiltros(params);
            setFuncoes(response.data.content || []);
            setTotalItems(response.data.totalElements || 0);
        } catch (error) {
            console.error('Erro ao carregar funções:', error);
            toast.error('Erro ao carregar a lista de funções. Tente novamente mais tarde.');
            setFuncoes([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1); // Volta para a primeira página ao realizar uma busca
        loadFuncoes();
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const confirmarDeletar = (funcao) => {
        setConfirmacaoModal({
            isOpen: true,
            funcaoId: funcao.id,
            funcaoNome: funcao.nome
        });
    };

    const fecharModalConfirmacao = () => {
        setConfirmacaoModal({
            isOpen: false,
            funcaoId: null,
            funcaoNome: ''
        });
    };

    // Fechar modal de alternativa
    const fecharModalAlternativa = () => {
        setAlternativaModal({
            isOpen: false,
            funcaoId: null,
            funcaoNome: ''
        });
    };

    // Função para inativar função em vez de excluir
    const inativarFuncao = async () => {
        if (!alternativaModal.funcaoId) return;

        setProcessando(true);
        try {
            // Buscar detalhes da função primeiro
            const funcaoResponse = await funcaoService.getById(alternativaModal.funcaoId);
            const funcaoData = funcaoResponse.data;

            // Atualizar o status para inativo
            const dadosAtualizados = {
                ...funcaoData,
                status: 'Inativo'
            };

            await funcaoService.update(alternativaModal.funcaoId, dadosAtualizados);

            toast.success('Função inativada com sucesso!');

            // Recarregar a lista após inativar
            await loadFuncoes();

            fecharModalAlternativa();
        } catch (error) {
            console.error("Erro ao inativar função:", error);
            toast.error('Erro ao inativar função. Tente novamente.');
        } finally {
            setProcessando(false);
        }
    };

    // Deletar função após confirmação
    const deletarFuncao = async () => {
        if (!confirmacaoModal.funcaoId) return;

        setProcessando(true);
        try {
            await funcaoService.delete(confirmacaoModal.funcaoId);

            toast.success('Função excluída com sucesso!');

            // Recarregar a lista após deletar
            await loadFuncoes();

            fecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar função:", error);

            // Verificar se é um erro de violação de integridade referencial
            if (error.response?.status === 409 ||
                error.response?.data?.message?.includes('DataIntegrityViolationException') ||
                error.response?.data?.message?.includes('foreign key constraint') ||
                error.response?.data?.message?.includes('está sendo utilizada')) {

                // Mostrar modal de alternativa em vez de apenas mostrar erro
                setAlternativaModal({
                    isOpen: true,
                    funcaoId: confirmacaoModal.funcaoId,
                    funcaoNome: confirmacaoModal.funcaoNome
                });
            } else {
                toast.error('Erro ao excluir função. Tente novamente.');
            }

            fecharModalConfirmacao();
        } finally {
            setProcessando(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/cadastros/funcao/${id}`);
    };

    const handleClearFilter = (filterType) => {
        switch (filterType) {
            case 'empresa':
                setEmpresaFiltro('');
                break;
            case 'setor':
                setSetorFiltro('');
                break;
            case 'unidade':
                setUnidadeFiltro('');
                break;
            default:
                break;
        }
        // Após limpar o filtro, recarregar os dados
        setCurrentPage(1);
        loadFuncoes();
    };

    const totalPages = Math.ceil(totalItems / entriesPerPage);

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Funções</h1>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/cadastros/funcao"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Nova Função</span>
                        </Link>
                    </div>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-600">Filtrar por Empresa</label>
                            <InputWithActions
                                placeholder="Selecione uma empresa para filtrar"
                                value={empresaFiltro}
                                onChange={(e) => setEmpresaFiltro(e.target.value)}
                                onSearch={handleSearch}
                                onClear={() => handleClearFilter('empresa')}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-600">Filtrar por Setor</label>
                            <InputWithActions
                                placeholder="Selecione um setor para filtrar"
                                value={setorFiltro}
                                onChange={(e) => setSetorFiltro(e.target.value)}
                                onSearch={handleSearch}
                                onClear={() => handleClearFilter('setor')}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-600">Filtrar por Unidade Operacional</label>
                            <InputWithActions
                                placeholder="Nenhuma Unidade Operacional selecionada"
                                value={unidadeFiltro}
                                onChange={(e) => setUnidadeFiltro(e.target.value)}
                                onSearch={handleSearch}
                                onClear={() => handleClearFilter('unidade')}
                            />
                        </div>
                    </div>

                    {/* Barra de Busca e Filtros da Tabela */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="relative w-full sm:flex-grow">
                            <input
                                type="text"
                                placeholder="Procure por algum registro..."
                                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Ativo">Ativos</option>
                                <option value="Inativo">Inativos</option>
                                <option value="todos">Todos</option>
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset para primeira página ao mudar quantidade
                                }}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabela de Funções */}
                    {/* Tabela de Funções */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <TableHeader onSort={handleSort} field="nome">Nome</TableHeader>
                                <TableHeader onSort={handleSort} field="setor.nome">Setor</TableHeader>
                                <TableHeader onSort={handleSort} field="empresa.razaoSocial">Empresa</TableHeader>
                                <TableHeader onSort={handleSort} field="qtdFuncionarios">Total de Funcionários</TableHeader>
                                <TableHeader onSort={handleSort} field="status">Status</TableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : funcoes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Nenhuma função encontrada.
                                    </td>
                                </tr>
                            ) : (
                                funcoes.map((funcao) => (
                                    <tr key={funcao.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{funcao.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.setor?.nome || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.empresa?.razaoSocial || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.qtdFuncionarios || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={funcao.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(funcao.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Editar função"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmarDeletar(funcao)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Excluir função"
                                                    disabled={processando}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {!loading && funcoes.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{(currentPage - 1) * entriesPerPage + 1}</span> até <span className="font-medium">{Math.min(currentPage * entriesPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">{currentPage}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de Confirmação de Exclusão */}
                <ConfirmacaoModal
                    isOpen={confirmacaoModal.isOpen}
                    onClose={fecharModalConfirmacao}
                    onConfirm={deletarFuncao}
                    funcaoNome={confirmacaoModal.funcaoNome}
                    processando={processando}
                />

                {/* Modal de Alternativa (Inativação) */}
                <AlternativaModal
                    isOpen={alternativaModal.isOpen}
                    onClose={fecharModalAlternativa}
                    onInativar={inativarFuncao}
                    funcaoNome={alternativaModal.funcaoNome}
                    processando={processando}
                />
            </div>
        </div>
    );
}