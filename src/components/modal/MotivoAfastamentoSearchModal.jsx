import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Hash, AlertCircle, ChevronRight as ArrowIcon } from 'lucide-react';
import motivoAfastamentoService from '../../api/services/cadastros/motivoAfastamentoService';
import { useDebounce } from '../../hooks/useDebounce';

const MotivoAfastamentoSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ 
        page: 0, 
        size: 10, 
        totalPages: 0,
        totalElements: 0 
    });
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchMotivos = useCallback(async (page = 0) => {
        setLoading(true);
        setError('');

        try {
            const params = {
                page,
                size: pagination.size,
                sort: 'descricao,asc',
                descricao: debouncedSearchTerm,
            };
            
            const response = await motivoAfastamentoService.getMotivos(params);
            
            setResults(response.content || []);
            setPagination(prev => ({ 
                ...prev, 
                page, 
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }));
            setHasSearched(true);
        } catch (err) {
            console.error("Erro ao buscar motivos de afastamento:", err);
            setError('Erro ao buscar motivos. Tente novamente.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.size, debouncedSearchTerm]);

    useEffect(() => {
        if (isOpen) {
            fetchMotivos(0);
            setSearchTerm('');
            setHasSearched(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && hasSearched) {
            fetchMotivos(0);
        }
    }, [debouncedSearchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchMotivos(newPage);
        }
    };

    const handleSelect = (motivo) => {
        onSelect(motivo);
        onClose();
    };

    const highlightSearchTerm = (text, term) => {
        if (!term || !text) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) => {
            if (part.toLowerCase() === term.toLowerCase()) {
                return <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded">{part}</mark>;
            }
            return part;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Selecionar Motivo de Afastamento
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Escolha um motivo da lista abaixo
                            </p>
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

                {/* Search Bar */}
                <div className="px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código ou descrição (ex: 01, doença, afastamento...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                            autoFocus
                        />
                    </div>

                    {hasSearched && pagination.totalElements > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                {pagination.totalElements} motivo(s) encontrado(s)
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Buscando motivos...</p>
                                <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center max-w-md">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <FileText size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar motivos</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={() => fetchMotivos(pagination.page)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                                >
                                    <Search size={18} />
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center max-w-md">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Search size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum motivo encontrado</h3>
                                <p className="text-gray-600 mb-1">
                                    Não encontramos resultados para "{searchTerm}"
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Tente buscar com termos diferentes ou verifique a ortografia
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Motivos List (Cards) */}
                    {!loading && !error && results.length > 0 && (
                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid gap-3">
                                {results.map((motivo) => (
                                    <div
                                        key={motivo.id}
                                        onClick={() => handleSelect(motivo)}
                                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white cursor-pointer transition-all duration-200 group hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                        <Hash size={16} className="text-blue-600" />
                                                        <span className="font-mono font-bold text-blue-700 text-sm">
                                                            {highlightSearchTerm(motivo.codigo, searchTerm)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-medium text-gray-900 leading-relaxed text-base group-hover:text-blue-700 transition-colors">
                                                    {highlightSearchTerm(motivo.descricao, searchTerm)}
                                                </h3>
                                            </div>
                                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <ArrowIcon size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && pagination.totalPages > 1 && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-600 font-medium">
                                    Página <span className="text-blue-600 font-bold">{pagination.page + 1}</span> de{' '}
                                    <span className="text-blue-600 font-bold">{pagination.totalPages}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(0)}
                                        disabled={pagination.page === 0}
                                        className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                        title="Primeira página"
                                    >
                                        <ChevronsLeft size={18} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 0}
                                        className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft size={18} className="text-gray-600" />
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1 mx-2">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i;
                                            } else if (pagination.page < 3) {
                                                pageNum = i;
                                            } else if (pagination.page > pagination.totalPages - 4) {
                                                pageNum = pagination.totalPages - 5 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`min-w-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                                                        pageNum === pagination.page
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages - 1}
                                        className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                        title="Próxima página"
                                    >
                                        <ChevronRight size={18} className="text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.totalPages - 1)}
                                        disabled={pagination.page === pagination.totalPages - 1}
                                        className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                        title="Última página"
                                    >
                                        <ChevronsRight size={18} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MotivoAfastamentoSearchModal;
