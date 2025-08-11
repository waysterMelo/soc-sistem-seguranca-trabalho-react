import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import funcaoService from '../../api/services/cadastros/funcoesService.js';
import {toast} from "react-toastify";

const ModalCBO = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cbos, setCbos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const itemsPerPage = 10;
    const [allCbos, setAllCbos] = useState([]);

    // Função para lidar com a busca de CBOs
    const fetchCBOs = async () => {
        if (!isOpen) return;

        setLoading(true);
        setErrorMessage('');
        
        // Ajustamos os parâmetros para o formato esperado pela API
        const params = {
            pagina: currentPage - 1,
            tamanho: itemsPerPage,
            termo: searchTerm,
            page: currentPage - 1,
            size: itemsPerPage,
            search: searchTerm
        };

        try {
            const response = await funcaoService.retornarCbo(params);
            if (!response.data) {
                console.error('Resposta sem dados:', response);
                setErrorMessage('A resposta da API não contém dados.');
                setCbos([]);
                return;
            }
            
            if (Array.isArray(response.data)) {
                const allData = response.data;

                // Filtrar dados baseado no termo de pesquisa
                const filteredData = searchTerm
                    ? allData.filter(cbo =>
                        cbo.codigoCbo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cbo.nomeOcupacao?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    : allData;

                // Aplicar paginação nos dados filtrados
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedData = filteredData.slice(startIndex, endIndex);

                setAllCbos(allData); // Armazenar todos os dados
                setCbos(paginatedData);
                setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
                setTotalItems(filteredData.length);

            } else if (response.data.content) {
                setCbos(response.data.content);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.totalElements || 0);
            } else if (response.data.dados || response.data.items || response.data.resultados) {
                const dadosPaginados = response.data.dados || response.data.items || response.data.resultados;

                setCbos(dadosPaginados);
                setTotalPages(response.data.paginas || response.data.totalPaginas || response.data.total_pages || 1);
                setTotalItems(response.data.total || response.data.totalRegistros || response.data.total_count || dadosPaginados.length);
            } else {
                if (response.data.id) {
                    setCbos([response.data]);
                } else {
                    // Tenta extrair dados de alguma propriedade do objeto
                    const possibleDataKeys = Object.keys(response.data);
                    for (const key of possibleDataKeys) {
                        if (Array.isArray(response.data[key])) {
                            setCbos(response.data[key]);
                            setTotalItems(response.data[key].length);
                            setTotalPages(Math.ceil(response.data[key].length / itemsPerPage) || 1);
                            break;
                        }
                    }
                    
                    // Se não encontrar um array, usa o objeto completo
                    if (cbos.length === 0) {
                        const dataArray = [response.data].flat().filter(Boolean);
                        setCbos(dataArray);
                        setTotalItems(dataArray.length);
                        setTotalPages(Math.ceil(dataArray.length / itemsPerPage) || 1);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CBOs:', error);
            console.error('Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            setErrorMessage(`Erro ao buscar CBOs: ${error.message}`);
            setCbos([]);
        } finally {
            setLoading(false);
        }
    };

    // Efeito para buscar CBOs quando o modal é aberto ou os parâmetros de busca mudam
    useEffect(() => {
        if (isOpen) {
            fetchCBOs();
        }
    }, [isOpen, currentPage, searchTerm]);

    // Função para mudar de página
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        } else {
            toast.error(`Página ${page} está fora dos limites (1-${totalPages})`);
        }
    };

    // Função para transformar o objeto CBO no formato esperado pelo componente CadastrarFuncao
    const handleSelectCbo = (cbo) => {
        const cboFormatado = {
            id: cbo.id,
            codigo: cbo.codigoCbo, // Campo mapeado da API
            descricao: cbo.nomeOcupacao // Campo mapeado da API
        };
        onSelect(cboFormatado);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Selecionar CBO</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar CBO..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Volta para a primeira página ao pesquisar
                            }}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
                            {errorMessage}
                        </div>
                    )}

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
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Código</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Descrição</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cbos && cbos.length > 0 ? cbos.map((cbo) => (
                                        <tr key={cbo.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">{cbo.codigoCbo}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{cbo.nomeOcupacao}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleSelectCbo(cbo)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : null}
                                    </tbody>
                                </table>

                                {(!cbos || cbos.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        Nenhum registro encontrado.
                                    </div>
                                )}
                            </div>

                            {/* Informações de paginação e controles */}
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Mostrando {cbos && cbos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                    - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                                </p>
                                
                                {/* Debugging da paginação */}
                                <div className="text-xs text-gray-500">
                                    Página {currentPage} de {totalPages}
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1 || totalPages <= 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Primeira
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || totalPages <= 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{currentPage}</span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages <= 1}
                                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages || totalPages <= 1}
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

export default ModalCBO;