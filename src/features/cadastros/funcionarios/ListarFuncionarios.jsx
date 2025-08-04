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
    Loader
} from 'lucide-react';
import {Link} from "react-router-dom";
import funcionariosService from "../../../api/services/cadastros/funcionariosServices.js";
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../../components/modal/unidadesOperacionaisModal.jsx';
import SetorSearchModal from '../../../components/modal/setorSearchModal.jsx';
import FuncaoSearchModal from '../../../components/modal/funcaoSearchModal.jsx';

// --- Componentes Reutilizáveis ---

// Cabeçalho da tabela com ícone de ordenação
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
    
    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Estados dos modais
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [showSetorModal, setShowSetorModal] = useState(false);
    const [showFuncaoModal, setShowFuncaoModal] = useState(false);

    const fetchFuncionarios = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage - 1,
                size: entriesPerPage
            };

            if (searchTerm && searchTerm.trim() !== '') {
                params.nome = searchTerm.trim();
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

            const response = await funcionariosService.buscarComFiltros(params);

            if (response.data) {
                if (response.data.content) {
                    // Formato Spring Boot PageImpl
                    setFuncionarios(response.data.content);
                    setTotalElements(response.data.totalElements);
                    setTotalPages(response.data.totalPages);
                } else if (Array.isArray(response.data)) {
                    // Formato array simples: filtrar e paginar manualmente
                    const allFuncionarios = response.data;

                    // 1) Filtrar conforme os filtros atuais
                    const filtered = allFuncionarios.filter(funcionario => {
                        if (searchTerm && !funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return false;
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
                    // Caso não seja nenhum dos formatos esperados
                    console.error('Formato de resposta inesperado:', response.data);
                    setFuncionarios([]);
                    setTotalElements(0);
                    setTotalPages(0);
                }
            } else {
                setFuncionarios([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('Erro ao buscar funcionários:', err);
            setError('Erro ao carregar funcionários. Tente novamente.');
            setFuncionarios([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFuncionarios();
    }, [currentPage, entriesPerPage, searchTerm, empresaFiltro, unidadeFiltro, setorFiltro, funcaoFiltro, statusFiltro]);

    // Handlers para seleção de filtros
    const handleSelectEmpresa = (empresa) => {
        setEmpresaFiltro(empresa);
        setShowEmpresaModal(false);
        setCurrentPage(1);
    };

    const handleSelectUnidade = (unidade) => {
        setUnidadeFiltro(unidade);
        setShowUnidadeModal(false);
        setCurrentPage(1);
    };

    const handleSelectSetor = (setor) => {
        setSetorFiltro(setor);
        setShowSetorModal(false);
        setCurrentPage(1);
    };

    const handleSelectFuncao = (funcao) => {
        setFuncaoFiltro(funcao);
        setShowFuncaoModal(false);
        setCurrentPage(1);
    };

    // Handlers para limpar filtros
    const handleClearEmpresa = () => {
        setEmpresaFiltro(null);
        setCurrentPage(1);
    };

    const handleClearUnidade = () => {
        setUnidadeFiltro(null);
        setCurrentPage(1);
    };

    const handleClearSetor = () => {
        setSetorFiltro(null);
        setCurrentPage(1);
    };

    const handleClearFuncao = () => {
        setFuncaoFiltro(null);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFiltro(e.target.value);
        setCurrentPage(1);
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
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
                                Filtrar por Empresa
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
                                Filtrar por Unidade Operacional
                            </label>
                            <InputWithActions
                                placeholder="Nenhuma Unidade Operacional selecionada"
                                value={unidadeFiltro ? unidadeFiltro.nome : ''}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowUnidadeModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button 
                                            type="button" 
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearUnidade}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Setor
                            </label>
                            <InputWithActions
                                placeholder="Selecione um Setor para filtrar"
                                value={setorFiltro ? setorFiltro.nome : ''}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowSetorModal(true)}
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
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Filtrar por Função
                            </label>
                            <InputWithActions
                                placeholder="Selecione uma Função para filtrar"
                                value={funcaoFiltro ? funcaoFiltro.nome : ''}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowFuncaoModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button 
                                            type="button" 
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={handleClearFuncao}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* Barra de Busca e Filtros da Tabela */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <input
                            type="text"
                            placeholder="Procure por algum registro..."
                            className="w-full sm:flex-grow pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
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
                                                        <button 
                                                            className="text-blue-600 hover:text-blue-800" 
                                                            title="Editar"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Excluir"
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
                                            Nenhum funcionário encontrado!
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
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleSelectEmpresa}
            />
            
            <UnidadesOperacionaisModal
                isOpen={showUnidadeModal}
                onClose={() => setShowUnidadeModal(false)}
                onSelect={handleSelectUnidade}
            />

            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelect={handleSelectSetor}
            />

            <FuncaoSearchModal
                isOpen={showFuncaoModal}
                onClose={() => setShowFuncaoModal(false)}
                onSelect={handleSelectFuncao}
            />
        </div>
    );
}