import React, { useState, useEffect } from 'react';
import { X, Search, HeartPulse, FileText, Hash } from 'lucide-react';
import cidService from '../../api/services/Cid/cidService.js';

const CidSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cids, setCids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);


    // Fun��o para buscar CIDs
    const searchCids = async (page = 0, search = '') => {
        setLoading(true);
        setError('');

        try {
            const params = {
                page,
                size: 10,
                sort: 'codigo,asc'
            };

            // Adicionar termo de busca se fornecido
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await cidService.buscar(params);

            // Verificar se a resposta tem a estrutura esperada
            if (response && response.data) {
                if (Array.isArray(response.data.content)) {
                    // Resposta paginada
                    setCids(response.data.content);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                } else if (Array.isArray(response.data)) {
                    // Array direto - implementar pagina��o manual
                    const pageSize = 10;
                    let filteredCids = response.data;

                    if (search.trim()) {
                        const searchLower = search.toLowerCase();
                        filteredCids = response.data.filter(cid =>
                            cid.codigo.toLowerCase().includes(searchLower) ||
                            cid.descricao.toLowerCase().includes(searchLower)
                        );
                    }

                    const startIndex = page * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedData = filteredCids.slice(startIndex, endIndex);

                    setCids(paginatedData);
                    setCurrentPage(page);
                    setTotalPages(Math.ceil(filteredCids.length / pageSize));
                    setTotalElements(filteredCids.length);
                } else {
                    setCids([]);
                    setCurrentPage(0);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } else {
                setCids([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
            }

            setHasSearched(true);

        } catch (err) {
            console.error('Erro ao buscar CIDs:', err);
            setError('Erro ao buscar CIDs. Tente novamente.');
            setCids([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Busca inicial quando o modal � aberto
    useEffect(() => {
        if (isOpen) {
            searchCids(0, '');
            setSearchTerm('');
            setHasSearched(false);
        }
    }, [isOpen]);

    // Fun��o para buscar com termo
    const handleSearch = () => {
        setCurrentPage(0);
        searchCids(0, searchTerm);
    };

    // Fun��o para mudan�a de p�gina
    const handlePageChange = (newPage) => {
        searchCids(newPage, searchTerm);
    };

    // Fun��o para selecionar CID
    const handleSelect = (cid) => {
        onSelect(cid);
        onClose();
    };

    // Fun��o para destacar termo buscado
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
                        <HeartPulse className="text-blue-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Selecionar CID
                            </h2>
                            <p className="text-sm text-gray-600">
                                Classificação Internacional de Doenças
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
                                placeholder="Buscar por código ou descrição (ex: S60, fratura, traumatismo...)"
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
                                ? `${totalElements} CID(s) encontrado(s)`
                                : 'Nenhum CID encontrado'
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
                                <p className="text-gray-600">Buscando CIDs...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-red-500 mb-4">
                                    <FileText size={48} className="mx-auto" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Erro ao carregar CIDs</p>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={() => searchCids(currentPage, searchTerm)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && hasSearched && cids.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="text-gray-400 mb-4">
                                    <Search size={48} className="mx-auto" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">Nenhum CID encontrado</p>
                                <p className="text-gray-500">
                                    Tente buscar com termos diferentes ou verifique a ortografia
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CIDs List */}
                    {!loading && !error && cids.length > 0 && (
                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid gap-3">
                                {cids.map((cid) => (
                                    <div
                                        key={cid.id}
                                        onClick={() => handleSelect(cid)}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Hash size={16} className="text-blue-600" />
                                                        <span className="font-mono font-semibold text-blue-700">
                                                            {highlightSearchTerm(cid.codigo, searchTerm)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1 leading-tight">
                                                    {highlightSearchTerm(cid.descricao, searchTerm)}
                                                </h3>
                                            </div>
                                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm">�</span>
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
                                    P�gina {currentPage + 1} de {totalPages}
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
                                        Pr�xima
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

export default CidSearchModal;