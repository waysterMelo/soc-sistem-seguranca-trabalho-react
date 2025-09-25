import React, { useState, useEffect } from 'react';
import { X, Search, Zap, Hash } from 'lucide-react';
import catService from '../../api/services/Cat/catService.js';

const SituacaoGeradoraSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [situacoes, setSituacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // Função para buscar situações geradoras (natureza da lesão)
    const searchSituacoes = async (page = 0, search = '') => {
        setLoading(true);
        setError('');

        try {
            const params = {
                page,
                size: 10,
                sort: 'nome,asc'
            };

            // Adicionar termo de busca se fornecido
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await catService.getNaturezasLesao(page, 10, search);

            // Verificar se a resposta tem a estrutura esperada
            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    // Resposta paginada
                    setSituacoes(response.data.content);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                } else if (Array.isArray(response.data)) {
                    // Array direto - implementar paginação manual
                    const pageSize = 10;
                    let filteredData = response.data;

                    if (search.trim()) {
                        const searchLower = search.toLowerCase();
                        filteredData = response.data.filter(situacao =>
                            (situacao.nome && situacao.nome.toLowerCase().includes(searchLower)) ||
                            (situacao.descricao && situacao.descricao.toLowerCase().includes(searchLower)) ||
                            (situacao.codigo && situacao.codigo.toLowerCase().includes(searchLower))
                        );
                    }

                    const startIndex = page * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedData = filteredData.slice(startIndex, endIndex);

                    setSituacoes(paginatedData);
                    setCurrentPage(page);
                    setTotalPages(Math.ceil(filteredData.length / pageSize));
                    setTotalElements(filteredData.length);
                } else {
                    setSituacoes([]);
                    setCurrentPage(0);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } else if (response && response.content) {
                setSituacoes(response.content);
                setCurrentPage(response.number || 0);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            } else if (Array.isArray(response)) {
                setSituacoes(response);
                setCurrentPage(0);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setSituacoes([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
            }

            setHasSearched(true);

        } catch (err) {
            console.error('Erro ao buscar situações geradoras:', err);
            setError('Erro ao buscar situações geradoras. Tente novamente.');
            setSituacoes([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Busca inicial quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            searchSituacoes(0, '');
            setSearchTerm('');
            setHasSearched(false);
        }
    }, [isOpen]);

    // Função para buscar com termo
    const handleSearch = () => {
        setCurrentPage(0);
        searchSituacoes(0, searchTerm);
    };

    // Função para mudança de página
    const handlePageChange = (newPage) => {
        searchSituacoes(newPage, searchTerm);
    };

    // Função para selecionar situação geradora
    const handleSelect = (situacao) => {
        onSelect(situacao);
        onClose();
    };

    // Função para destacar termo buscado
    const highlightSearchTerm = (text, term) => {
        if (!term || !text) return text;

        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (part.toLowerCase() === term.toLowerCase()) {
                return <mark key={index} className="bg-yellow-200 text-gray-900">{part}</mark>;
            }
            return part;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Zap className="text-purple-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Selecionar Situação Geradora
                            </h2>
                            <p className="text-sm text-gray-600">
                                Situações que geram acidentes de trabalho
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por nome, código ou descrição (ex: queda, corte, queimadura...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Search size={18} />
                            Buscar
                        </button>
                    </div>

                    {hasSearched && (
                        <p className="text-sm text-gray-600 mt-2">
                            {totalElements > 0
                                ? `${totalElements} situação(~oes) geradora(s) encontrada(s)`
                                : 'Nenhuma situação geradora encontrada'
                            }
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Buscando situações geradoras...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-red-500 mb-4">
                                    <Zap size={48} className="mx-auto" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Erro ao carregar situações geradoras</p>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={() => searchSituacoes(currentPage, searchTerm)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && hasSearched && situacoes.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-gray-400 mb-4">
                                    <Search size={48} className="mx-auto" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">Nenhuma situação geradora encontrada</p>
                                <p className="text-gray-500">
                                    Tente buscar com termos diferentes ou verifique a ortografia
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Situações Geradoras List */}
                    {!loading && !error && situacoes.length > 0 && (
                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid gap-3">
                                {situacoes.map((situacao) => (
                                    <div
                                        key={situacao.id}
                                        onClick={() => handleSelect(situacao)}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={16} className="text-purple-600" />
                                                        {situacao.codigo && (
                                                            <>
                                                                <Hash size={16} className="text-purple-600" />
                                                                <span className="font-mono font-semibold text-purple-700">
                                                                    {highlightSearchTerm(situacao.codigo, searchTerm)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1 leading-tight">
                                                    {highlightSearchTerm(situacao.nome || situacao.descricao, searchTerm)}
                                                </h3>
                                                {situacao.descricao && situacao.nome !== situacao.descricao && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {highlightSearchTerm(situacao.descricao, searchTerm)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 text-sm">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Página {currentPage + 1} de {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i;
                                            } else if (currentPage < 3) {
                                                pageNum = i;
                                            } else if (currentPage > totalPages - 4) {
                                                pageNum = totalPages - 5 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-1.5 text-sm rounded ${
                                                        pageNum === currentPage
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Próxima
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

export default SituacaoGeradoraSearchModal;