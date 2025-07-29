import React, { useState, useEffect } from 'react';
import { X, Search, ChevronsUpDown, Check } from 'lucide-react';
import {setorService} from '../../api/services/cadastros/serviceSetores.js';

const SetorSearchModal = ({ isOpen, onClose, onSelect, onSelectMultiple, empresaId, multiSelect = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSetores, setSelectedSetores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);

    useEffect(() => {
        if (isOpen && empresaId) {
            buscarSetores();
        }
    }, [isOpen, empresaId]);

    const buscarSetores = async () => {
        if (!empresaId) return;

        setLoading(true);
        try {
            const response = await setorService.getAll({ empresaId });
            setSetores(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar setores:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredSetores = setores.filter(setor =>
        setor.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSetores.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredSetores.length / entriesPerPage);

    const handleSelectSetor = (setor) => {
        if (!multiSelect) {
            onSelect(setor);
            onClose();
            return;
        }

        const isSelected = selectedSetores.some(s => s.id === setor.id);
        let newSelectedSetores;

        if (isSelected) {
            newSelectedSetores = selectedSetores.filter(s => s.id !== setor.id);
        } else {
            newSelectedSetores = [...selectedSetores, setor];
        }

        setSelectedSetores(newSelectedSetores);
    };

    const handleConfirmSelection = () => {
        if (onSelectMultiple) {
            onSelectMultiple(selectedSetores);
        }
        onClose();
    };

    const TableHeader = ({ children }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ChevronsUpDown size={14} className="text-gray-400" />
            </div>
        </th>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Selecionar Setores</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar setor..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            {multiSelect && <th className="w-12 px-6 py-3"></th>}
                            <TableHeader>Nome do Setor</TableHeader>
                            <TableHeader>Descrição</TableHeader>
                            <th className="px-6 py-3"></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={multiSelect ? 4 : 3} className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : currentEntries.length > 0 ? (
                            currentEntries.map((setor) => {
                                const isSelected = selectedSetores.some(s => s.id === setor.id);
                                return (
                                    <tr
                                        key={setor.id}
                                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleSelectSetor(setor)}
                                    >
                                        {multiSelect && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-5 w-5 border ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} rounded flex items-center justify-center`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{setor.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{setor.descricao || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectSetor(setor);
                                                }}
                                            >
                                                Selecionar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={multiSelect ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                                    {searchTerm
                                        ? 'Nenhum setor encontrado com este termo de busca.'
                                        : 'Nenhum setor cadastrado para esta empresa.'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-4">
                    <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                        Mostrando <span className="font-medium">{indexOfFirstEntry + 1}</span> a <span className="font-medium">{Math.min(indexOfLastEntry, filteredSetores.length)}</span> de <span className="font-medium">{filteredSetores.length}</span> resultados
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>

                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Próximo
                        </button>
                    </div>
                </div>

                {multiSelect && (
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmSelection}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Confirmar ({selectedSetores.length} selecionados)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetorSearchModal;