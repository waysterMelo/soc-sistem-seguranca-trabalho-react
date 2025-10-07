import React, { useState, useEffect } from 'react';
import { Search, X, UserCheck, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, Award, ChevronRight as ArrowIcon, Loader2 } from 'lucide-react';
import funcaoService from "../../api/services/cadastros/funcoesService.js";

const ModalPrestador = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isOpen){
            setSearchTerm('');
            setCurrentPage(1);
            setHasSearched(false);
            fetchPrestadores().then();
        }else{
            setPrestadores([]);
            setTotalItems(0);
            setTotalPages(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen){
            const timeOut = setTimeout(() => {
                fetchPrestadores().then();
            }, searchTerm ? 500 : 0);
            return () => clearTimeout(timeOut);
        }
    }, [isOpen, currentPage, searchTerm]);

    const fetchPrestadores = async () => {
        if (!isOpen) return;
        setLoading(true);
        setError('');
        
        try {
            let response;
            const paginationParams = {
                page: currentPage - 1,
                size: itemsPerPage
            };

            if (!searchTerm.trim()){
                response = await funcaoService.retornarPrestadores(paginationParams);
            }else {
                response = await funcaoService.buscarPrestadoresPorNome(
                    searchTerm.trim(),
                    paginationParams
                );
            }
            const content = response.data.content || response.data || [];
            const totalElements = response.data.totalElements || content.length;
            const totalPage = response.data.totalPages || Math.ceil(totalElements / itemsPerPage);

            setPrestadores(content);
            setTotalPages(totalPage);
            setTotalItems(totalElements);
            setHasSearched(true);
        } catch (err) {
            console.error('Erro ao buscar prestadores:', err);
            setError('Erro ao buscar prestadores. Tente novamente.');
            setPrestadores([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages ){
            setCurrentPage(page);
        }
    };

    const handleSearchChange = (e) =>{
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSelect = (prestador) => {
        onSelect(prestador);
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserCheck className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Selecionar Prestador de Serviço</h3>
                            <p className="text-sm text-gray-600 mt-0.5">Escolha um prestador da lista abaixo</p>
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
                                placeholder="Buscar por nome do prestador..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                                autoFocus
                            />
                        </div>
                        {hasSearched && totalItems > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {totalItems} prestador(es) encontrado(s)
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex-1 flex items-center justify-center py-16">
                            <div className="text-center">
                                <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Carregando prestadores...</p>
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
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar prestadores</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchPrestadores}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                                >
                                    <Search size={18} />
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && hasSearched && prestadores.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center max-w-md">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <UserCheck size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum prestador encontrado</h3>
                                <p className="text-gray-600 mb-1">
                                    {searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Nenhum prestador disponível'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {searchTerm ? 'Tente ajustar sua busca' : 'Não há prestadores cadastrados no momento'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Prestadores List (Cards) */}
                    {!loading && !error && prestadores.length > 0 && (
                        <div className="flex-1 overflow-auto">
                            <div className="grid gap-3">
                                {prestadores.map((prestador) => (
                                    <div
                                        key={prestador.id}
                                        onClick={() => handleSelect(prestador)}
                                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white cursor-pointer transition-all duration-200 group hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                                        <User size={20} className="text-blue-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                                                        {highlightSearchTerm(prestador.nome, searchTerm)}
                                                    </h3>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-3 ml-13">
                                                    {prestador.conselho && (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                            <Award size={14} className="text-blue-600" />
                                                            <span className="text-sm font-semibold text-blue-700">
                                                                {prestador.conselho}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {prestador.numeroInscricaoConselho && (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                                            <span className="text-sm font-mono font-semibold text-gray-700">
                                                                Nº {prestador.numeroInscricaoConselho}
                                                            </span>
                                                        </div>
                                                    )}
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
                                Mostrando <span className="text-blue-600 font-bold">{prestadores.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="text-blue-600 font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="text-blue-600 font-bold">{totalItems}</span> registros
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
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
                                                onClick={() => handlePageChange(pageNum)}
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
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
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

export default ModalPrestador;
