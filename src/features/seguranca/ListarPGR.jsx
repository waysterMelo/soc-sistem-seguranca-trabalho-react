import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Printer,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from 'lucide-react';
import { Link } from "react-router-dom";
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import pgrService from '../../api/services/pgr/pgrService';
import { useDebounce } from '../../hooks/useDebounce';
import apiService from '../../api/apiService';

export default function ListarPGR() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pgrPage, setPgrPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPGRs = useCallback(async (empresaId, page = 0, size = 5, name = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await pgrService.getPgrsByEmpresaId(empresaId, page, size, name);
            setPgrPage(data);
        } catch (err) {
            setError('Erro ao buscar PGRs.');
            setPgrPage(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedEmpresa) {
            fetchPGRs(selectedEmpresa.id, 0, entriesPerPage, debouncedSearchTerm);
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm, selectedEmpresa, entriesPerPage, fetchPGRs]);

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setIsModalOpen(false);
        setSearchTerm(''); 
    };

    const handleClearEmpresa = () => {
        setSelectedEmpresa(null);
        setPgrPage(null);
        setSearchTerm('');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pgrPage.totalPages) {
            setCurrentPage(newPage);
            fetchPGRs(selectedEmpresa.id, newPage, entriesPerPage, debouncedSearchTerm);
        }
    };

    const handleEntriesChange = (e) => {
        const newSize = Number(e.target.value);
        setEntriesPerPage(newSize);
    };

    const handlePrintPgr = (pgrId) => {
        const reportUrl = `${apiService.defaults.baseURL}/reports/pgr/${pgrId}`;
        window.open(reportUrl, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">PGR - Programa de Gerenciamento de Riscos</h1>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                        <div className="md:col-span-2">
                            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                            <div className="relative">
                                <input
                                    id="empresa"
                                    type="text"
                                    readOnly
                                    value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''}
                                    placeholder="Selecione uma empresa"
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer"
                                    onClick={() => !selectedEmpresa && setIsModalOpen(true)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {selectedEmpresa ? (
                                        <button
                                            type="button"
                                            onClick={handleClearEmpresa}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <Search size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="w-30">
                            <Link
                                to="/seguranca/novo-pgr"
                                className="flex w-full justify-center items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                <span>Nova PGR</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <input
                            type="text"
                            placeholder="Procure pelo nome da empresa..."
                            className="w-full sm:flex-grow pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!selectedEmpresa}
                        />
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={handleEntriesChange}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-8">Carregando...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">{error}</div>
                        ) : !selectedEmpresa ? (
                            <div className="text-center py-8 text-gray-500">Selecione uma empresa para ver os PGRs.</div>
                        ) : pgrPage?.content?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Nenhum PGR encontrado para esta empresa.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade Operacional</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Documento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Revisão</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {pgrPage?.content?.map((pgr) => (
                                    <tr key={pgr.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pgr.unidadeOperacional.empresa.razaoSocial}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pgr.unidadeOperacional?.nome || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pgr.dataDocumento ? new Date(pgr.dataDocumento).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pgr.dataRevisao ? new Date(pgr.dataRevisao).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => handlePrintPgr(pgr.id)} className="text-blue-600 hover:text-blue-800"><Printer size={18} /></button>
                                                <button className="text-gray-500 hover:text-gray-700"><MoreVertical size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    {pgrPage && pgrPage.totalElements > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{pgrPage.pageable.offset + 1}</span> até <span className="font-medium">{pgrPage.pageable.offset + pgrPage.numberOfElements}</span> de <span className="font-medium">{pgrPage.totalElements}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => handlePageChange(0)} disabled={pgrPage.first} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft size={18} /></button>
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={pgrPage.first} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">{currentPage + 1}</span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={pgrPage.last} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                                <button onClick={() => handlePageChange(pgrPage.totalPages - 1)} disabled={pgrPage.last} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EmpresaSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelectEmpresa}
            />
        </div>
    );
}