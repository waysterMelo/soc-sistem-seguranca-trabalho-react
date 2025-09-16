import React, { useState, useEffect } from 'react';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react'; // Ícones adicionados
import aparelhoService from '../../api/services/aparelhos/aparelhoService';
import { useDebounce } from '../../hooks/useDebounce';

const AparelhagemLtcatModal = ({ isOpen, onClose, onSelect }) => {
    const [aparelhos, setAparelhos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);


    useEffect(() => {
        if (isOpen) {
            setCurrentPage(0);
            fetchAparelhos(0, debouncedSearchTerm);
        }
    }, [isOpen, debouncedSearchTerm]);


    useEffect(() => {
        if (isOpen) {
            fetchAparelhos(currentPage, debouncedSearchTerm);
        }
    }, [currentPage]);


    const fetchAparelhos = async (page, search) => {
        setLoading(true);
        try {
            const data = await aparelhoService.getAparelhosModal(search, page);
            if (data && data.content) {
                setAparelhos(data.content);
                setTotalPages(data.totalPages);
            } else {
                setAparelhos([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Erro ao buscar aparelhos:", error);
            setAparelhos([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (aparelho) => {
        onSelect(aparelho);
        onClose();
    };

    // Funções de Paginação
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Selecionar Aparelhagem</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por descrição do aparelho..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow px-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">Carregando...</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {aparelhos.length > 0 ? aparelhos.map((aparelho) => (
                                <tr key={aparelho.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{aparelho.descricao}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleSelect(aparelho)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                        >
                                            Selecionar
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="2" className="text-center py-10 text-sm text-gray-500">
                                        Nenhum aparelho encontrado.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* --- SEÇÃO DE PAGINAÇÃO --- */}
                <div className="flex justify-between items-center p-4 border-t">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0 || loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                        Página {currentPage + 1} de {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1 || loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próxima
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AparelhagemLtcatModal;