import React, { useState, useEffect } from 'react';
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X} from 'lucide-react';
import { empresaService } from '../../api/services/cadastros/serviceEmpresas';

const EmpresaSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(5);


    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEmpresas = empresas.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(empresas.length / entriesPerPage);


    // Carregar empresas quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            carregarTodasEmpresas();
        }
    }, [isOpen]);

    const carregarTodasEmpresas = async () => {
        try {
            setLoading(true);
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
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar empresas:', err);
            setError('Erro ao carregar as empresas');
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    };

    // Busca por termo
    const handleSearch = async (value) => {
        setSearchTerm(value);

        try {
            setLoading(true);
            let response;

            if (value.trim().length >= 2) {
                response = await empresaService.buscarEmpresas(value);
            } else {
                response = await empresaService.getAll();
            }

            // Garantir que sempre seja um array (mesma lógica do carregarTodasEmpresas)
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
            setError(null);
        } catch (err) {
            console.error('Erro na busca:', err);
            setError('Erro ao buscar empresas');
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce para a busca
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900">Pesquisar Empresa</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Digite o nome ou CNPJ da empresa para pesquisar..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        {searchTerm.length > 0 && searchTerm.length < 2 && (
                            <p className="text-sm text-gray-500 mt-1">Digite pelo menos 2 caracteres para pesquisar</p>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-80">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">{error}</div>
                        ) : empresas.length > 0 ? (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ/CPF</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentEmpresas.map((empresa) => (
                                        <tr key={empresa.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {empresa.razaoSocial}
                                                {empresa.nomeFantasia && (
                                                    <span className="block text-xs text-gray-500">
                                                            {empresa.nomeFantasia}
                                                        </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {empresa.cpfOuCnpj}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => onSelect(empresa)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                                                >
                                                    Selecionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {/* Paginação */}
                                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-4">
                                    <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                        Mostrando <span className="font-medium">{indexOfFirstEntry + 1}</span> até{' '}
                                        <span className="font-medium">{Math.min(indexOfLastEntry, empresas.length)}</span> de{' '}
                                        <span className="font-medium">{empresas.length}</span> resultados
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">
                                            {currentPage}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : searchTerm.length >= 2 ? (
                            <div className="text-center py-8 text-gray-500">Nenhuma empresa encontrada com esse termo.</div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Digite para pesquisar empresas</div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end bg-gray-50 px-6 py-3 border-t">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmpresaSearchModal;