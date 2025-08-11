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
    
    // Filtros adicionais
    const [empresaFiltro, setEmpresaFiltro] = useState('');
    const [setorFiltro, setSetorFiltro] = useState('');
    const [unidadeFiltro, setUnidadeFiltro] = useState('');

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

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta função?')) {
            try {
                await funcaoService.delete(id);
                toast.success('Função excluída com sucesso!');
                loadFuncoes();
            } catch (error) {
                console.error('Erro ao excluir função:', error);
                toast.error('Erro ao excluir função. Tente novamente mais tarde.');
            }
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <TableHeader onSort={handleSort} field="nome">Nome</TableHeader>
                                <TableHeader onSort={handleSort} field="setor.nome">Setor</TableHeader>
                                <TableHeader onSort={handleSort} field="empresa.nome">Empresa</TableHeader>
                                <TableHeader onSort={handleSort} field="cbo.codigo">CBO</TableHeader>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.empresa?.nome || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {funcao.cbo ? `${funcao.cbo.codigo} - ${funcao.cbo.descricao}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.qtdFuncionarios || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={funcao.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(funcao.id)} 
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(funcao.id)} 
                                                    className="text-red-600 hover:text-red-800"
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
            </div>
        </div>
    );
}