import React, { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Building2, MapPin, AlertCircle } from "lucide-react";
import { unidadeService } from "../../api/services/cadastros/serviceUnidadeOperacional.js";
import api from "../../api/apiService.js";

const UnidadesOperacionaisModal = ({ isOpen, onClose, onSelect, empresaId = 1 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Função para buscar todas as unidades
    const fetchAllUnidades = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Usando o endpoint principal para listar todas as unidades
            const response = await api.get('/unidade-operacional', {
                params: {
                    page: currentPage,
                    size: pageSize
                }
            });
            
            processarResposta(response);
        } catch (err) {
            console.error("Erro ao buscar unidades operacionais:", err);
            setError("Não foi possível carregar as unidades operacionais. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    // Função para buscar unidades pelo nome
    const searchUnidades = useCallback(async () => {
        if (!searchTerm.trim()) {
            // Se a busca estiver vazia, carrega todas as unidades
            return fetchAllUnidades();
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Usando o endpoint principal com parâmetro de nome
            const response = await api.get('/unidade-operacional', {
                params: {
                    nome: searchTerm,
                    page: currentPage,
                    size: pageSize
                }
            });
            
            processarResposta(response);
        } catch (err) {
            console.error("Erro ao buscar unidades operacionais por nome:", err);
            setError("Não foi possível realizar a busca. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, pageSize, fetchAllUnidades]);

    // Função auxiliar para processar a resposta da API
    const processarResposta = (response) => {
        let content = [];
        let pages = 0;
        let totalElements = 0;
        
        if (response.data && Array.isArray(response.data)) {
            // Se a resposta for um array direto
            content = response.data;
            totalElements = response.data.length;
            pages = Math.ceil(totalElements / pageSize);
        } else if (response.data && response.data.content) {
            // Se a resposta tiver o formato de paginação
            content = response.data.content;
            pages = response.data.totalPages || Math.ceil(response.data.totalElements / pageSize);
            totalElements = response.data.totalElements || content.length;
        } else {
            // Outros formatos possíveis
            content = response.data || [];
            totalElements = content.length;
            pages = Math.ceil(totalElements / pageSize);
        }
        
        setUnidades(content);
        setTotalPages(pages);
        setTotalItems(totalElements);
    };

    // Carrega todas as unidades quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            fetchAllUnidades();
        }
    }, [isOpen, fetchAllUnidades]);

    // Reset de estados quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setCurrentPage(0);
        }
    }, [isOpen]);

    // Quando mudar a página, atualiza os dados
    useEffect(() => {
        if (isOpen) {
            if (searchTerm.trim()) {
                searchUnidades();
            } else {
                fetchAllUnidades();
            }
        }
    }, [isOpen, currentPage, searchUnidades, fetchAllUnidades]);

    // Manipuladores para a paginação
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Manipulador para a busca
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        searchUnidades();
    };

    // Manipulador para quando o usuário limpa o campo de busca
    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(0);
        fetchAllUnidades();
    };

    // Manipulador para alterações no campo de busca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Se o campo estiver vazio, volta a mostrar todas as unidades
        if (!e.target.value.trim()) {
            setCurrentPage(0);
            fetchAllUnidades();
        }
    };

    // Função para gerar os números das páginas
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let start = Math.max(0, currentPage - halfVisible);
            let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
            
            if (end - start + 1 < maxVisiblePages) {
                start = Math.max(0, end - maxVisiblePages + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header do Modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Selecionar Unidade Operacional
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">Escolha uma unidade da lista abaixo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                        aria-label="Fechar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    {/* Campo de Pesquisa */}
                    <form onSubmit={handleSearch} className="mb-5">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Digite o nome da unidade operacional..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full py-3 px-4 pl-12 pr-32 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                                autoFocus
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    title="Limpar busca"
                                >
                                    <X size={18} />
                                </button>
                            )}
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm transition-all"
                            >
                                Buscar
                            </button>
                        </div>
                        {totalItems > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {totalItems} unidade(s) encontrada(s)
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Estado de carregamento */}
                    {loading && (
                        <div className="flex-1 flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Carregando unidades operacionais...</p>
                                <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de erro */}
                    {error && !loading && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabela de Unidades */}
                    {!loading && !error && (
                        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <div className="overflow-y-auto max-h-[400px]">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                                                Nome da Unidade
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                                                Localização
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-32">
                                                Ação
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {unidades.length > 0 ? (
                                            unidades.map(unidade => (
                                                <tr key={unidade.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 size={16} className="text-blue-600" />
                                                            {unidade.nome}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            {unidade.endereco?.cidade || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => onSelect(unidade)}
                                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md group-hover:scale-105"
                                                        >
                                                            Selecionar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-16">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                                            <Building2 size={32} className="text-gray-400" />
                                                        </div>
                                                        <p className="font-semibold text-lg text-gray-700">
                                                            {searchTerm ? 
                                                                'Nenhuma unidade encontrada' : 
                                                                'Nenhuma unidade disponível'}
                                                        </p>
                                                        <p className="text-sm mt-2">
                                                            {searchTerm 
                                                                ? `Não encontramos resultados para "${searchTerm}"` 
                                                                : 'Não há unidades operacionais cadastradas no momento'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Paginação */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600 font-medium">
                                Mostrando <span className="text-blue-600 font-bold">{currentPage * pageSize + 1}</span> a <span className="text-blue-600 font-bold">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> de <span className="text-blue-600 font-bold">{totalItems}</span> resultados
                            </div>
                            
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(0)}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={18} className="text-gray-600" />
                                </button>
                                
                                {getPageNumbers().map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`min-w-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                        }`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Última página"
                                >
                                    <ChevronsRight size={18} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer do Modal */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnidadesOperacionaisModal;
