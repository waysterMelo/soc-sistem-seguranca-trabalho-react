import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import funcaoService from "../../api/services/cadastros/funcoesService.js";

const ModalRiscosPGR = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [riscos, setRiscos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isOpen){
            setSearchTerm('');
            setCurrentPage(1);
            fetchRiscos().then();
        }else{
            setRiscos([]);
            setTotalItems(0);
            setTotalPages(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen){
            const timeOut = setTimeout(() => {
                fetchRiscos().then();
            }, searchTerm ? 500 : 0);
            return () => clearTimeout(timeOut);
        }
    }, [isOpen, currentPage, searchTerm]);

    const fetchRiscos = async () => {
        if (!isOpen) return;
        setLoading(true);
        try {
            let response;
            const paginationParams = {
                page: currentPage - 1,
                size: itemsPerPage
            };

            if (!searchTerm.trim()){
                response = await funcaoService.retornarRiscos(paginationParams);
            }else {
                response = await funcaoService.buscarRiscosPorDescricao(
                    searchTerm.trim(),
                    paginationParams
                );
            }


            const content = response.data.content || response.data || [];
            const totalElements = response.data.totalElements || content.length;
            const totalPage = response.data.totalPages || Math.ceil(totalElements /itemsPerPage);

            setRiscos(content);
            setTotalPages(totalPage);
            setTotalItems(totalElements);
        } catch (error) {
            console.error('Erro ao buscar riscos PGR:', error);
            setRiscos([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
         if (page >= 1 && page <=totalPages ){
             setCurrentPage(page);
         }
    };

    const handleSearchChange = (e) =>{
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1)
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Selecionar Riscos</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Filtros de Busca */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Campo de Busca */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pesquisar por descrição
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder={"Digite a descrição"}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2
                                     focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                                            Grupo
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">
                                            Descrição
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm w-20">
                                            Ações
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {riscos.map((risco) => (
                                        <tr key={risco.id} className="border-b border-gray-200
                                        hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700 font-mono">
                                                {risco.grupo}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {risco.descricao}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onSelect(risco)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded
                                                    hover:bg-blue-100 transition-colors"
                                                    title="Selecionar agente"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {riscos.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 bg-gray-50">
                                        <div className="space-y-2">
                                                <p>Nenhum registro encontrado</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Paginação */}
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Mostrando {riscos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                    - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                    >
                                        Primeira
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                    >
                                        Próxima
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                    >
                                        Última
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalRiscosPGR;