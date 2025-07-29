import React, { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { unidadeService } from "../../api/services/cadastros/serviceUnidadeOperacional.js";

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

    // Função para buscar unidades operacionais
    const fetchUnidades = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            let response;
            
            if (searchTerm) {
                response = await unidadeService.buscarPorNome(searchTerm, currentPage, pageSize);
            } else {
                response = await unidadeService.getAll({
                    page: currentPage,
                    size: pageSize,
                    empresaId: empresaId // Passando o empresaId para a API
                });
            }
            
            // Garantir que a resposta tenha a estrutura esperada
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
        } catch (err) {
            console.error("Erro ao buscar unidades operacionais:", err);
            setError("Não foi possível carregar as unidades operacionais. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, pageSize, empresaId]);

    // Carrega os dados quando o modal é aberto ou quando os parâmetros de busca mudam
    useEffect(() => {
        if (isOpen) {
            fetchUnidades();
        }
    }, [isOpen, fetchUnidades]);

    // Reset de estados quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setCurrentPage(0);
        }
    }, [isOpen]);

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
        fetchUnidades();
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Selecionar Unidade Operacional
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6">
                    {/* Campo de Pesquisa */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pesquisar por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
                            <button 
                                type="submit"
                                className="absolute right-3 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>

                    {/* Estado de carregamento */}
                    {loading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 size={30} className="animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Carregando unidades operacionais...</span>
                        </div>
                    )}

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabela de Unidades */}
                    {!loading && !error && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Local
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ação
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {unidades.length > 0 ? (
                                        unidades.map(unidade => (
                                            <tr key={unidade.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {unidade.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unidade.endereco?.cidade || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => onSelect(unidade)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                                    >
                                                        Selecionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                {searchTerm ? 
                                                    'Nenhuma unidade operacional encontrada para essa busca' : 
                                                    'Nenhuma unidade operacional disponível'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginação */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-700">
                                Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalItems)} de {totalItems} resultados
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                {getPageNumbers().map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer do Modal */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnidadesOperacionaisModal;