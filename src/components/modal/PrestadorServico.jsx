import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import axios from 'axios';

const ModalPrestador = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [prestadores, setPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isOpen) {
            fetchPrestadores();
        }
    }, [isOpen, currentPage, searchTerm]);

    const fetchPrestadores = async () => {
        if (!isOpen) return;

        setLoading(true);
        try {
            const response = await axios.get('/prestadores', {
                params: {
                    page: currentPage - 1,
                    size: itemsPerPage,
                    search: searchTerm
                }
            });

            setPrestadores(response.data.content || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.totalElements || 0);
        } catch (error) {
            console.error('Erro ao buscar prestadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Selecionar Prestador de Serviço</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar prestador..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto max-h-96">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Nome</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {prestadores.map((prestador) => (
                                        <tr key={prestador.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">{prestador.nome}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onSelect(prestador)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {prestadores.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Nenhum registro encontrado.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Mostrando {prestadores.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                    - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Primeira
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{currentPage}</span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
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

export default ModalPrestador;