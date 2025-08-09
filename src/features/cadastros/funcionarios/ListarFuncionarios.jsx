import React, { useState, useEffect, useCallback } from 'react';
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
    Loader,
    AlertTriangle
} from 'lucide-react';
import {Link} from "react-router-dom";
import funcionariosService from "../../../api/services/cadastros/funcionariosServices.js";
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../../components/modal/SetorSearchModal.jsx';
import FuncaoSearchModal from '../../../components/modal/funcaoSearchModal.jsx';
import { toast } from 'react-toastify'


const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

// Selo de status colorido
const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-gray-400">-</span>;

    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        'ATIVO': 'bg-green-500 text-white',
        'INATIVO': 'bg-red-500 text-white',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-300 text-gray-800'}`}>
            {status}
        </span>
    );
};

// Input com botões de ação
const InputWithActions = ({ placeholder, value, actions, readOnly = true }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly={readOnly}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// Função utilitária para debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function ListarFuncionarios() {
    // Estados principais
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [empresaFiltro, setEmpresaFiltro] = useState(null);
    const [unidadeFiltro, setUnidadeFiltro] = useState(null);
    const [setorFiltro, setSetorFiltro] = useState(null);
    const [funcaoFiltro, setFuncaoFiltro] = useState(null);
    const [statusFiltro, setStatusFiltro] = useState('todos');
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);

    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Estados dos modais
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showSetorModal, setShowSetorModal] = useState(false);
    const [showFuncaoModal, setShowFuncaoModal] = useState(false);

    // Adicionar novos estados para o modal de confirmação de deleção
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [funcionarioParaDeletar, setFuncionarioParaDeletar] = useState(null);
    const [deletingFuncionario, setDeletingFuncionario] = useState(false);


    // Verifica se a busca está disponível (empresa E setor precisam estar selecionados)
    const isBuscaDisponivel = empresaFiltro !== null && setorFiltro !== null;

    // Aplicar debounce ao termo de busca para evitar muitas chamadas à API durante digitação
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms de debounce

    const fetchFuncionarios = useCallback(async () => {
        try {
            // Verificar se há pelo menos um filtro aplicado
            const temFiltroAplicado =
                (debouncedSearchTerm.trim() !== '' && empresaFiltro !== null && setorFiltro !== null) ||
                empresaFiltro !== null ||
                unidadeFiltro !== null ||
                setorFiltro !== null ||
                funcaoFiltro !== null ||
                statusFiltro !== 'todos' ||
                filtrosAplicados;

            if (!temFiltroAplicado) {
                setLoading(false);
                setFuncionarios([]);
                setTotalElements(0);
                setTotalPages(0);
                return;
            }

            setLoading(true);
            setError(null);

            let response;

            // Se tiver um setor selecionado (que é obrigatório para busca por nome)
            if (setorFiltro && setorFiltro.id) {
                try {
                    response = await funcionariosService.buscarPorSetor(setorFiltro.id);

                    if (!response || !response.data) {
                        throw new Error('A resposta da API não possui dados.');
                    }

                    let funcionariosData = response.data;

                    if (funcionariosData && !Array.isArray(funcionariosData) && funcionariosData.content) {
                        funcionariosData = funcionariosData.content;
                    }

                    if (!Array.isArray(funcionariosData)) {
                        funcionariosData = [];
                    }

                    let filteredData = funcionariosData;

                    // Aplicar filtro por termo de busca se empresa estiver selecionada
                    if (debouncedSearchTerm.trim() !== '' && empresaFiltro !== null) {
                        const termoBusca = debouncedSearchTerm.trim().toLowerCase();
                        filteredData = filteredData.filter(f => {
                            return f.nome?.toLowerCase().includes(termoBusca);
                        });
                    }

                    // Aplicar filtro por empresa
                    if (empresaFiltro && empresaFiltro.id) {
                        filteredData = filteredData.filter(f =>
                            f.empresa?.id === empresaFiltro.id
                        );
                    }

                    if (unidadeFiltro && unidadeFiltro.id) {
                        filteredData = filteredData.filter(f =>
                            f.unidadeOperacional?.id === unidadeFiltro.id
                        );
                    }

                    if (funcaoFiltro && funcaoFiltro.id) {
                        filteredData = filteredData.filter(f =>
                            f.funcao?.id === funcaoFiltro.id
                        );
                    }

                    if (statusFiltro !== 'todos') {
                        const st = statusFiltro === 'ativos' ? 'ATIVO' : 'INATIVO';
                        filteredData = filteredData.filter(f => f.status === st);
                    }

                    const total = filteredData.length;
                    const pages = Math.ceil(total / entriesPerPage);
                    const start = (currentPage - 1) * entriesPerPage;
                    const end = start + entriesPerPage;
                    const paginated = filteredData.slice(start, end);

                    setFuncionarios(paginated);
                    setTotalElements(total);
                    setTotalPages(pages);
                    setFiltrosAplicados(true);
                } catch (err) {
                    setError(`Erro ao buscar funcionários por setor: ${err.message}`);
                    setFuncionarios([]);
                    setTotalElements(0);
                    setTotalPages(0);
                }
            } else {
                // Usar filtros normais se não houver setor selecionado
                const params = {
                    page: currentPage - 1,
                    size: entriesPerPage
                };

                // Adicionar nome à busca apenas se empresa E setor estiverem selecionados
                if (debouncedSearchTerm.trim() !== '' && empresaFiltro !== null && setorFiltro !== null) {
                    params.nome = debouncedSearchTerm.trim();
                }

                if (empresaFiltro && empresaFiltro.id) {
                    params.empresaId = empresaFiltro.id;
                }

                if (unidadeFiltro && unidadeFiltro.id) {
                    params.unidadeOperacionalId = unidadeFiltro.id;
                }

                if (setorFiltro && setorFiltro.id) {
                    params.setorId = setorFiltro.id;
                }

                if (funcaoFiltro && funcaoFiltro.id) {
                    params.funcaoId = funcaoFiltro.id;
                }

                if (statusFiltro !== 'todos') {
                    params.status = statusFiltro === 'ativos' ? 'ATIVO' : 'INATIVO';
                }

                response = await funcionariosService.buscarComFiltros(params);

                if (response.data) {
                    if (response.data.content) {
                        setFuncionarios(response.data.content);
                        setTotalElements(response.data.totalElements);
                        setTotalPages(response.data.totalPages);
                    } else if (Array.isArray(response.data)) {
                        const allFuncionarios = response.data;

                        const filtered = allFuncionarios.filter(funcionario => {
                            // Aplicar filtro por nome apenas se empresa E setor estiverem selecionados
                            if (debouncedSearchTerm.trim() !== '' && empresaFiltro !== null && setorFiltro !== null) {
                                const termoBusca = debouncedSearchTerm.trim().toLowerCase();
                                if (!funcionario.nome?.toLowerCase().includes(termoBusca)) {
                                    return false;
                                }
                            }

                            if (empresaFiltro && funcionario.empresa?.id !== empresaFiltro.id) {
                                return false;
                            }

                            if (unidadeFiltro && funcionario.unidadeOperacional?.id !== unidadeFiltro.id) {
                                return false;
                            }

                            if (setorFiltro && funcionario.setor?.id !== setorFiltro.id) {
                                return false;
                            }

                            if (funcaoFiltro && funcionario.funcao?.id !== funcaoFiltro.id) {
                                return false;
                            }

                            if (statusFiltro !== 'todos') {
                                const st = statusFiltro === 'ativos' ? 'ATIVO' : 'INATIVO';
                                if (funcionario.status !== st) return false;
                            }

                            return true;
                        });

                        const total = filtered.length;
                        const pages = Math.ceil(total / entriesPerPage);
                        const start = (currentPage - 1) * entriesPerPage;
                        const end = start + entriesPerPage;
                        const paginated = filtered.slice(start, end);

                        setFuncionarios(paginated);
                        setTotalElements(total);
                        setTotalPages(pages);
                    } else {
                        setFuncionarios([]);
                        setTotalElements(0);
                        setTotalPages(0);
                    }
                    setFiltrosAplicados(true);
                } else {
                    setFuncionarios([]);
                    setTotalElements(0);
                    setTotalPages(0);
                }
            }
        } catch (err) {
            setError(`Erro ao carregar funcionários: ${err.message || 'Falha na requisição'}`);
            setFuncionarios([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, entriesPerPage, debouncedSearchTerm, empresaFiltro,
        unidadeFiltro, setorFiltro, funcaoFiltro, statusFiltro, filtrosAplicados]);

    // Efeito para filtros exceto termo de busca
    useEffect(() => {
        fetchFuncionarios();
    }, [currentPage, entriesPerPage, empresaFiltro,
        unidadeFiltro, setorFiltro, funcaoFiltro, statusFiltro, fetchFuncionarios]);

    // Efeito separado para o termo de busca com debounce
    useEffect(() => {
        if (empresaFiltro !== null && setorFiltro !== null) {
            fetchFuncionarios();
        }
    }, [debouncedSearchTerm, fetchFuncionarios]);

    const handleSelectEmpresa = (empresa) => {
        setEmpresaFiltro(empresa);
        setShowEmpresaModal(false);
        setCurrentPage(1);
        setFiltrosAplicados(true);
    };

    const handleSelectSetor = (setor) => {
        setSetorFiltro(setor);
        setShowSetorModal(false);
        setCurrentPage(1);
        setFiltrosAplicados(true);
    };

    const handleSelectFuncao = (funcao) => {
        setFuncaoFiltro(funcao);
        setShowFuncaoModal(false);
        setCurrentPage(1);
        setFiltrosAplicados(true);
    };

    const handleClearEmpresa = () => {
        setEmpresaFiltro(null);
        setCurrentPage(1);
        // Limpar também o termo de busca ao limpar a empresa
        setSearchTerm('');
    };

    const handleClearSetor = () => {
        setSetorFiltro(null);
        setCurrentPage(1);
        // Limpar também o termo de busca ao limpar o setor
        setSearchTerm('');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Não precisa chamar fetchFuncionarios aqui, pois o debounce cuidará disso
    };

    const handleStatusChange = (e) => {
        setStatusFiltro(e.target.value);
        setCurrentPage(1);
        setFiltrosAplicados(true);
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchSubmit = () => {
        if (empresaFiltro !== null && setorFiltro !== null && searchTerm.trim() !== '') {
            fetchFuncionarios();
        }
    };

// Função para cancelar deleção
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFuncionarioParaDeletar(null);
    };

    const handleDeleteFuncionario = (funcionario) => {
        setFuncionarioParaDeletar(funcionario);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!funcionarioParaDeletar) return;

        try {
            setDeletingFuncionario(true);
            await funcionariosService.delete(funcionarioParaDeletar.id);

            toast.success(`Funcionário ${funcionarioParaDeletar.nome} excluído com sucesso!`);

            // Atualizar a lista após deleção
            await fetchFuncionarios();

            setShowDeleteModal(false);
            setFuncionarioParaDeletar(null);
        } catch (error) {
            console.error('Erro ao deletar funcionário:', error);
            toast.error(error.message || 'Erro ao excluir funcionário. Tente novamente.');
        } finally {
            setDeletingFuncionario(false);
        }
    };





    // Função para formatar dados da tabela
    const formatarFuncionario = (funcionario) => ({
        nome: funcionario.nome || '-',
        cpf: funcionario.cpf || '-',
        dataNascimento: funcionario.dataNascimento || '-',
        empresa: funcionario.empresa?.razaoSocial || funcionario.empresa?.nome || '-',
        unidadeOperacional: funcionario.unidadeOperacional?.nome || 'N/A',
        setor: funcionario.setor?.nome || 'N/A',
        funcao: funcionario.funcao?.nome || 'N/A',
        status: funcionario.status || null
    });

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Funcionários</h1>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/cadastros/novo-funcionario"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Novo Funcionário</span>
                        </Link>
                    </div>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Empresa <span className="text-red-500">*</span>
                            </label>
                            <InputWithActions
                                placeholder="Selecione uma empresa para filtrar"
                                value={empresaFiltro ? empresaFiltro.razaoSocial || empresaFiltro.nome : ''}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowEmpresaModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearEmpresa}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Setor <span className="text-red-500">*</span>
                            </label>
                            <InputWithActions
                                placeholder="Selecione um Setor para filtrar"
                                value={setorFiltro ? setorFiltro.nome : ''}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            className={`bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 ${!empresaFiltro ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => setShowSetorModal(true)}
                                            disabled={!empresaFiltro}
                                            title={!empresaFiltro ? "Selecione uma empresa primeiro" : "Buscar setor"}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearSetor}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* Informação de filtro de setor */}
                    {setorFiltro && (
                        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                            <div className="mr-2 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </div>
                            <div>
                                Mostrando funcionários do setor: <strong>{setorFiltro.nome}</strong>
                            </div>
                        </div>
                    )}

                    {/* Barra de Busca e Filtros da Tabela */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className={`relative flex items-center w-full sm:flex-grow ${!isBuscaDisponivel ? 'opacity-70' : ''}`}>
                            <input
                                type="text"
                                placeholder={isBuscaDisponivel
                                    ? "Buscar funcionário por nome..."
                                    : "Selecione empresa e setor para buscar por nome"}
                                className={`w-full pl-4 pr-10 py-2 border ${
                                    !isBuscaDisponivel
                                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                                } rounded-md focus:outline-none`}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => e.key === 'Enter' && isBuscaDisponivel && handleSearchSubmit()}
                                disabled={!isBuscaDisponivel}
                            />
                            {!isBuscaDisponivel && (
                                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-amber-500">
                                    <AlertTriangle size={18} />
                                </div>
                            )}
                            <button
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                    isBuscaDisponivel
                                        ? 'text-gray-500 hover:text-blue-600 cursor-pointer'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                onClick={isBuscaDisponivel ? handleSearchSubmit : undefined}
                                title={isBuscaDisponivel ? "Buscar" : "Selecione empresa e setor primeiro"}
                                disabled={!isBuscaDisponivel}
                            >
                                <Search size={18} />
                            </button>
                        </div>
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={statusFiltro}
                                onChange={handleStatusChange}
                            >
                                <option value="todos">Todos</option>
                                <option value="ativos">Ativos</option>
                                <option value="inativos">Inativos</option>
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={handleEntriesPerPageChange}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {/* Dica sobre a busca */}
                    {!isBuscaDisponivel && searchTerm.trim() !== '' && (
                        <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-md flex items-center">
                            <AlertTriangle size={18} className="mr-2" />
                            <div>
                                Para buscar por nome, você precisa selecionar tanto a empresa quanto o setor.
                            </div>
                        </div>
                    )}

                    {/* Mensagem quando está buscando */}
                    {loading && searchTerm.trim() !== '' && isBuscaDisponivel && (
                        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                            <Loader size={18} className="mr-2 animate-spin" />
                            <div>
                                Buscando funcionários com o nome "{searchTerm}"...
                            </div>
                        </div>
                    )}

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Tabela de Funcionários */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <TableHeader>Nome</TableHeader>
                                <TableHeader>CPF</TableHeader>
                                <TableHeader>Nascimento</TableHeader>
                                <TableHeader>Empresa</TableHeader>
                                <TableHeader>Setor</TableHeader>
                                <TableHeader>Função</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader className="animate-spin mr-2" size={20} />
                                            <span className="text-gray-500">Carregando funcionários...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !filtrosAplicados ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="bg-blue-50 p-6 rounded-lg text-blue-700">
                                            <div className="flex flex-col items-center">
                                                <Search size={36} className="mb-3 text-blue-500" />
                                                <h3 className="text-lg font-semibold mb-2">Utilize os filtros acima para buscar funcionários</h3>
                                                <p className="text-sm">
                                                    Para buscar funcionários, você pode:
                                                </p>
                                                <ul className="text-sm mt-2 list-disc list-inside text-left">
                                                    <li>Primeiro selecione uma empresa (obrigatório)</li>
                                                    <li>Depois, selecione um setor (obrigatório para busca por nome)</li>
                                                    <li>Após selecionar empresa e setor, você poderá buscar por nome</li>
                                                    <li>Ou aplicar filtros adicionais de função ou status</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : funcionarios.length > 0 ? (
                                funcionarios.map((funcionario, index) => {
                                    const funcionarioFormatado = formatarFuncionario(funcionario);
                                    return (
                                        <tr key={funcionario.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {funcionarioFormatado.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {funcionarioFormatado.cpf}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {funcionarioFormatado.dataNascimento}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {funcionarioFormatado.empresa}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {funcionarioFormatado.setor}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {funcionarioFormatado.funcao}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={funcionarioFormatado.status} />
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/cadastros/editar-funcionario/${funcionario.id}`}
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                    >
                                                        <Pencil size={16} className={'mr-1'} />
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteFuncionario(funcionario)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                        title="Excluir funcionário"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm && empresaFiltro && setorFiltro ? (
                                            <div>
                                                <p>Nenhum funcionário encontrado com o nome "{searchTerm}".</p>
                                                <p className="text-sm mt-2">Verifique se o nome está correto ou tente outro termo de busca.</p>
                                            </div>
                                        ) : setorFiltro ? (
                                            <div>
                                                <p>Nenhum funcionário encontrado para o setor "{setorFiltro.nome}".</p>
                                                <p className="text-sm mt-2">Verifique se existem funcionários cadastrados para este setor.</p>
                                            </div>
                                        ) : empresaFiltro ? (
                                            <div>
                                                <p>Nenhum funcionário encontrado para a empresa selecionada.</p>
                                                <p className="text-sm mt-2">Verifique se existem funcionários cadastrados para esta empresa.</p>
                                            </div>
                                        ) : (
                                            'Nenhum funcionário encontrado com os filtros aplicados.'
                                        )}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {!loading && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{totalElements > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0}</span> até{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * entriesPerPage, totalElements)}
                                </span> de{' '}
                                <span className="font-medium">{totalElements}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1 || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                    {totalPages > 0 ? currentPage : 0}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Última página"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Modal de Confirmação de Deleção */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Confirmar Exclusão
                                        </h3>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-600">
                                        Tem certeza que deseja excluir o funcionário <strong>{funcionarioParaDeletar?.nome}</strong>?
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Esta ação não pode ser desfeita.
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={cancelDelete}
                                        disabled={deletingFuncionario}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deletingFuncionario}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {deletingFuncionario ? (
                                            <>
                                                <Loader className="animate-spin w-4 h-4 mr-2" />
                                                Excluindo...
                                            </>
                                        ) : (
                                            'Excluir'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleSelectEmpresa}
            />

            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelect={handleSelectSetor}
                empresaId={empresaFiltro?.id}
            />

            <FuncaoSearchModal
                isOpen={showFuncaoModal}
                onClose={() => setShowFuncaoModal(false)}
                onSelect={handleSelectFuncao}
            />
        </div>
    );
}