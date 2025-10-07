import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, Building2, AlertCircle, Loader2, ChevronRight as ArrowIcon, Hash } from 'lucide-react';
import { empresaService } from '../../api/services/cadastros/serviceEmpresas';

const EmpresaSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEmpresas = empresas.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(empresas.length / entriesPerPage);

    // Carregar empresas quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            carregarTodasEmpresas();
            setSearchTerm('');
            setHasSearched(false);
        }
    }, [isOpen]);

    const carregarTodasEmpresas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await empresaService.getAll();

            // Garantir que sempre seja um array
            let empresasData = [];
            if (Array.isArray(response.data)) {
                empresasData = response.data;
            } else if (response.data && Array.isArray(response.data.content)) {
                empresasData = response.data.content;
            } else if (response.data && Array.isArray(response.data.data)) {
                empresasData = response.data.data;
            } else if (response.data && typeof response.data === 'object') {
                empresasData = Object.values(response.data);
            }

            setEmpresas(empresasData);
            setTotalElements(empresasData.length);
            setHasSearched(true);
        } catch (err) {
            console.error('Erro ao carregar empresas:', err);
            setError('Erro ao carregar as empresas. Tente novamente.');
            setEmpresas([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Busca por termo com debounce
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(async () => {
            if (searchTerm.length === 0) {
                await carregarTodasEmpresas();
                return;
            }

            if (searchTerm.length < 2) return;

            try {
                setLoading(true);
                setError(null);
                const response = await empresaService.buscarEmpresas(searchTerm);

                // Garantir que sempre seja um array
                let empresasData = [];
                if (Array.isArray(response.data)) {
                    empresasData = response.data;
                } else if (response.data && Array.isArray(response.data.content)) {
                    empresasData = response.data.content;
                } else if (response.data && Array.isArray(response.data.data)) {
                    empresasData = response.data.data;
                } else if (response.data && typeof response.data === 'object') {
                    empresasData = Object.values(response.data);
                }

                setEmpresas(empresasData);
                setTotalElements(empresasData.length);
                setCurrentPage(1);
                setHasSearched(true);
            } catch (err) {
                console.error('Erro na busca:', err);
                setError('Erro ao buscar empresas. Tente novamente.');
                setEmpresas([]);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, isOpen]);

    const handleSelect = (empresa) => {
        onSelect(empresa);
        onClose();
    };

    const formatCNPJ = (value) => {
        if (!value) return '';
        const cnpj = value.replace(/\D/g, '');
        if (cnpj.length === 14) {
            return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        } else if (cnpj.length === 11) {
            return cnpj.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        }
        return value;
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Selecionar Empresa</h3>
                            <p className="text-sm text-gray-600 mt-0.5">Escolha uma empresa da lista abaixo</p>
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

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    {/* Search Bar */}
                    <div className="mb-5">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nome ou CNPJ/CPF da empresa..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                                autoFocus
                            />
                        </div>
                        {searchTerm.length > 0 && searchTerm.length < 2 && (
                            <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                                <AlertCircle size={14} />
                                Digite pelo menos 2 caracteres para pesquisar
                            </p>
                        )}
                        {hasSearched && totalElements > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {totalElements} empresa(s) encontrada(s)
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex-1 flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Buscando empresas...</p>
                                <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center max-w-md">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar empresas</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={carregarTodasEmpresas}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                                >
                                    <Search size={18} />
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && hasSearched && empresas.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center max-w-md">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Building2 size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma empresa encontrada</h3>
                                <p className="text-gray-600 mb-1">
                                    {searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Nenhuma empresa disponível'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {searchTerm ? 'Tente ajustar sua busca' : 'Não há empresas cadastradas no momento'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empresas List (Cards) */}
                    {!loading && !error && currentEmpresas.length > 0 && (
                        <div className="flex-1 overflow-auto">
                            <div className="grid gap-3">
                                {currentEmpresas.map((empresa) => (
                                    <div
                                        key={empresa.id}
                                        onClick={() => handleSelect(empresa)}
                                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white cursor-pointer transition-all duration-200 group hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                                        <Building2 size={20} className="text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                                                            {highlightSearchTerm(empresa.razaoSocial, searchTerm)}
                                                        </h3>
                                                        {empresa.nomeFantasia && (
                                                            <p className="text-sm text-gray-600 mt-0.5">
                                                                {highlightSearchTerm(empresa.nomeFantasia, searchTerm)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="ml-13">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                                        <Hash size={14} className="text-gray-600" />
                                                        <span className="text-sm font-mono font-semibold text-gray-700">
                                                            {formatCNPJ(empresa.cpfOuCnpj)}
                                                        </span>
                                                    </div>
                                                </div>
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
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-5 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 font-medium">
                                Mostrando <span className="text-blue-600 font-bold">{indexOfFirstEntry + 1}</span> - <span className="text-blue-600 font-bold">{Math.min(indexOfLastEntry, empresas.length)}</span> de <span className="text-blue-600 font-bold">{empresas.length}</span> registros
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={18} className="text-gray-600" />
                                </button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-1 mx-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage < 4) {
                                            pageNum = i + 1;
                                        } else if (currentPage > totalPages - 3) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[40px] px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                                                    pageNum === currentPage
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Última página"
                                >
                                    <ChevronsRight size={18} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmpresaSearchModal;
