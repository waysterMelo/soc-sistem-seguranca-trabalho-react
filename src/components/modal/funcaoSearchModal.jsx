import React, { useState, useEffect } from 'react';
import { X, Search, Loader, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import {funcaoService} from "../../api/services/cadastros/funcoesService.js";


export default function FuncaoSearchModal({ isOpen, onClose, onSelect }) {
    // Estados para busca e paginação
    const [searchTerm, setSearchTerm] = useState('');
    const [funcoes, setFuncoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    
    // Função para buscar funções com filtros
    const fetchFuncoes = async () => {
        if (!isOpen) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage - 1,
                size: entriesPerPage
            };
            
            // Adicionar termo de busca se existir
            if (searchTerm && searchTerm.trim() !== '') {
                params.nome = searchTerm.trim();
            }
            
            const response = await funcaoService.buscarComFiltros(params);
            
            if (response.data) {
                if (response.data.content) {
                    // Formato Spring Boot PageImpl
                    setFuncoes(response.data.content);
                    setTotalElements(response.data.totalElements);
                    setTotalPages(response.data.totalPages);
                } else if (Array.isArray(response.data)) {
                    // Formato array simples
                    const filtered = response.data.filter(funcao => 
                        !searchTerm || funcao.nome.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    const total = filtered.length;
                    const pages = Math.ceil(total / entriesPerPage);
                    const start = (currentPage - 1) * entriesPerPage;
                    const end = start + entriesPerPage;
                    const paginated = filtered.slice(start, end);
                    
                    setFuncoes(paginated);
                    setTotalElements(total);
                    setTotalPages(pages);
                } else {
                    console.error('Formato de resposta inesperado:', response.data);
                    setFuncoes([]);
                    setTotalElements(0);
                    setTotalPages(0);
                }
            } else {
                setFuncoes([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('Erro ao buscar funções:', err);
            setError('Erro ao carregar funções. Tente novamente.');
            setFuncoes([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };
    
    // Efeito para buscar funções quando o modal é aberto ou parâmetros de busca mudam
    useEffect(() => {
        if (isOpen) {
            fetchFuncoes();
        }
    }, [isOpen, currentPage, entriesPerPage, searchTerm]);
    
    // Efeito para resetar o estado quando o modal é fechado
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setCurrentPage(1);
        }
    }, [isOpen]);
    
    // Handler para pesquisa
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    
    // Handler para alterar a quantidade de itens por página
    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    
    // Função para formatar os dados da função
    const formatarFuncao = (funcao) => ({
        id: funcao.id,
        nome: funcao.nome || 'Sem nome',
        setor: funcao.setor?.nome || 'N/A',
        empresa: funcao.empresa?.razaoSocial || funcao.empresa?.nome || 'N/A',
        cbo: funcao.cbo || 'Não informado'
    });

    // Se o modal não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Selecionar Função</h3>
                    <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Corpo do Modal */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Barra de Pesquisa */}
                    <div className="mb-4 relative">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Digite para pesquisar funções..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <Search size={18} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Mensagem de erro */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    
                    {/* Tabela de Funções */}
                    <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Setor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Empresa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CBO
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader className="animate-spin mr-2" size={20} />
                                                <span className="text-gray-500">Carregando funções...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : funcoes.length > 0 ? (
                                    funcoes.map((funcao) => {
                                        const funcaoFormatada = formatarFuncao(funcao);
                                        return (
                                            <tr 
                                                key={funcao.id} 
                                                className="hover:bg-blue-50 cursor-pointer"
                                                onClick={() => onSelect(funcao)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {funcaoFormatada.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {funcaoFormatada.setor}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {funcaoFormatada.empresa}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {funcaoFormatada.cbo}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Nenhuma função encontrada!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Rodapé com Paginação */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <span className="text-sm text-gray-700 mr-2">Exibir</span>
                            <select
                                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                value={entriesPerPage}
                                onChange={handleEntriesPerPageChange}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                            <span className="text-sm text-gray-700 ml-2">por página</span>
                        </div>
                        
                        <div className="flex items-center justify-center">
                            <p className="text-sm text-gray-700 mr-4">
                                <span className="font-medium">{totalElements > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0}</span> - <span className="font-medium">{Math.min(currentPage * entriesPerPage, totalElements)}</span> de <span className="font-medium">{totalElements}</span>
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
                    </div>
                </div>
            </div>
        </div>
    );
}