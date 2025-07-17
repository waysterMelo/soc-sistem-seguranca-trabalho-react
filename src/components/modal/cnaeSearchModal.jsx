// Arquivo: src/components/modals/CnaeSearchModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { cnaeService } from '../../api/services/cadastros/cnaeServices.js';

const ITEMS_PER_PAGE = 10;

/**
 * Componente de Modal para buscar e selecionar um CNAE com tabela e paginação.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla a visibilidade do modal.
 * @param {function} props.onClose - Função para fechar o modal.
 * @param {function} props.onCnaeSelect - Callback executado ao selecionar um CNAE.
 */
export default function CnaeSearchModal({ isOpen, onClose, onCnaeSelect }) {
    const [allCnaes, setAllCnaes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Busca os dados da API apenas uma vez quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            cnaeService.getAll()
                .then(response => {
                    setAllCnaes(response.data || []);
                })
                .catch(error => {
                    console.error("Erro ao buscar CNAEs:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    // Filtra os dados com base na busca. useMemo otimiza para não recalcular a cada renderização.
    const filteredCnaes = useMemo(() => {
        if (!searchTerm) {
            return allCnaes;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return allCnaes.filter(item =>
            item.descricao.toLowerCase().includes(lowercasedFilter) ||
            item.codigo.replace(/[\.\/-]/g, '').includes(lowercasedFilter.replace(/[\.\/-]/g, ''))
        );
    }, [searchTerm, allCnaes]);

    // Calcula os itens da página atual e o total de páginas
    const totalPages = Math.ceil(filteredCnaes.length / ITEMS_PER_PAGE);
    const paginatedCnaes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCnaes.slice(startIndex, endIndex);
    }, [currentPage, filteredCnaes]);

    // Reseta a página para 1 sempre que o termo de busca mudar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (!isOpen) {
        return null;
    }

    const handleSelect = (cnae) => {
        onCnaeSelect(cnae);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                {/* Cabeçalho */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-800">Selecionar CNAE</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <X size={22} />
                    </button>
                </header>

                {/* Barra de Busca */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2.5 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                </div>

                {/* Corpo com Tabela */}
                <main className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full p-10">
                            <Loader className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Código</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Descrição</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedCnaes.map((cnae) => (
                                    <tr
                                        key={cnae.id}
                                        onClick={() => handleSelect(cnae)}
                                        className="bg-white border-b hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 font-mono text-gray-800 whitespace-nowrap">{cnae.codigo}</td>
                                        <td className="px-6 py-4">{cnae.descricao}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {paginatedCnaes.length === 0 && (
                                <div className="text-center p-8 text-gray-500">
                                    Nenhum resultado encontrado.
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Rodapé com Paginação */}
                <footer className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0">
                    <span className="text-sm text-gray-500">
                        Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                            <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </footer>
            </div>
            <style jsx>{`
                @keyframes fade-in-scale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
