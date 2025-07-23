import React, {useEffect, useState} from 'react';
import {
    FileText,
    Plus,
    Search,
    ChevronsUpDown,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight, ChevronsRight, ChevronsLeft, Check, AlertCircle
} from 'lucide-react';
import {Link} from "react-router-dom";
import {empresaService} from "../../../api/services/cadastros/serviceEmpresas.js";


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
// Componente de Alerta
const AlertModal = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;

    const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
    const Icon = type === 'success' ? Check : AlertCircle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
                <div className="flex items-center mb-4">
                    <Icon className={`${iconColor} mr-3`} size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">
                        {type === 'success' ? 'Sucesso' : 'Erro'}
                    </h3>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente para o selo de status
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusClasses = {
        'Ativo': 'bg-green-100 text-green-700',
        'Inativo': 'bg-red-100 text-red-700',
        'Em Revisão': 'bg-yellow-100 text-yellow-700',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Componente para o cabeçalho da tabela
const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex items-center space-x-1 cursor-pointer">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

export default function ListarEmpresas() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, empresaId: null });
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);


    const fetchEmpresas = async () => {
        try {
            setLoading(true);
            const response = await empresaService.getAll();

            // Garantir que sempre seja um array
            let empresasData = [];

            if (Array.isArray(response.data)) {
                empresasData = response.data;
            } else if (response.data && Array.isArray(response.data.content)) {
                // Caso a API retorne { content: [...], total: x, page: y }
                empresasData = response.data.content;
            } else if (response.data && Array.isArray(response.data.data)) {
                // Caso a API retorne { data: [...], success: true }
                empresasData = response.data.data;
            } else if (response.data && typeof response.data === 'object') {
                // Se for um objeto, tente converter para array
                empresasData = Object.values(response.data);
            }

            setEmpresas(empresasData);
            setIsSearching(false);
            setError(null);
        } catch (err) {
            setError("Não foi possível carregar as empresas");
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresasPorTermo = async (termo) => {
        try {
            setLoading(true);
            const response = await empresaService.buscarEmpresas(termo);

            // Garantir que sempre seja um array (mesma lógica)
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
            setIsSearching(true);
            setError(null);
        } catch (err) {
            setError("Não foi possível realizar a busca");
            setEmpresas([]); // Sempre garantir que seja um array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    const handleSearchTermo = (e) => {
        const termo = e.target.value;
        setSearchTerm(termo);

        if(searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            if (termo.trim()){
                fetchEmpresasPorTermo(termo)
            }else{
                fetchEmpresas()
            }
            setCurrentPage(1);
        }, 500);
        setSearchTimeout(timeout);
    }

    const handleLimparBuscar = () => {
        setSearchTerm('')
        fetchEmpresas();
        setCurrentPage(1);
    };

    const handleDeleteClick = (empresaId) => {
        setConfirmModal({
            isOpen: true,
            empresaId
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            empresaId: null
        });
    };

    const handleDeleteEmpresa = async () => {
        try {
            await empresaService.delete(confirmModal.empresaId);
            closeConfirmModal();
            setAlertModal({
                isOpen: true,
                type: 'success',
                message: 'Empresa excluída com sucesso!'
            });
            // Atualiza a lista de empresas após a exclusão
            fetchEmpresas();
        } catch (err) {
            console.error("Erro ao excluir empresa: ", err);
            closeConfirmModal();
            setAlertModal({
                isOpen: true,
                type: 'error',
                message: 'Erro ao excluir empresa. Por favor, tente novamente.'
            });
        }
    };

    const closeAlertModal = () => {
        setAlertModal({
            isOpen: false,
            type: '',
            message: ''
        });
    };

    const handleGerarRelatorio = async () => {
        try {
            const response = await empresaService.gerarRelatorio();

            // Criar um objeto URL para o arquivo recebido
            const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));

            // Criar um link temporário para download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.setAttribute('download', 'relatorio-empresas.pdf');

            // Adicionar ao DOM, clicar e remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Mostrar mensagem de sucesso
            setAlertModal({
                isOpen: true,
                type: 'success',
                message: 'Relatório gerado com sucesso!'
            });
        } catch (err) {
            console.error("Erro ao gerar relatório: ", err);
            setAlertModal({
                isOpen: true,
                type: 'error',
                message: 'Erro ao gerar relatório. Por favor, tente novamente.'
            });
        }
    };

    const empresasList = Array.isArray(empresas) ? empresas : [];

    // Filtra as empresas com base no termo de busca
    const filteredCompanies = empresas.filter(company =>
        (company.razaoSocial && company.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.nomeFantasia && company.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.documento && company.documento.toString().includes(searchTerm))
    );

    // Lógica de paginação
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = empresasList.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(empresasList.length / entriesPerPage);


    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Empresas</h1>
                    <div className="flex space-x-2">
                        <button onClick={handleGerarRelatorio}
                            className="flex items-center space-x-2 bg-yellow-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors">
                            <FileText size={16} />
                            <span>Gerar Relatório</span>
                        </button>
                        <Link
                            to="/cadastros/nova-empresa"
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            <span>Nova Empresa</span>
                        </Link>
                    </div>
                </div>

                {/* Filtros e Busca */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Procure por algum registro..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchTermo}
                            />
                            {isSearching && (
                                <button
                                    onClick={handleLimparBuscar}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    Limpar busca
                                </button>
                                )}
                                </div>
                        <select
                            className="w-full sm:w-auto mt-2 sm:mt-0 border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>

                    {/* Tabela de Empresas */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-6">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                <p className="mt-2 text-gray-600">Carregando empresas...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-6 text-red-600">
                                <p>{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-blue-600 hover:underline"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <TableHeader>Razão Social</TableHeader>
                                    <TableHeader>Nome Fantasia</TableHeader>
                                    <TableHeader>CNPJ</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {currentEntries.length > 0 ? (
                                    currentEntries.map((empresa, index) => (
                                        <tr key={empresa.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.razaoSocial}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.nomeFantasia || '--'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.cpfOuCnpj}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <StatusBadge status={empresa.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/cadastros/editar-empresa/${empresa.id}`}>
                                                        <Pencil size={18} className="text-blue-600 hover:text-blue-800" />
                                                    </Link>
                                                    <button
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDeleteClick(empresa.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Nenhum registro encontrado.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Paginação */}
                    {!loading && !error && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{empresasList.length > 0 ? indexOfFirstEntry + 1 : 0}</span> até <span className="font-medium">{Math.min(indexOfLastEntry, empresasList.length)}</span> de <span className="font-medium">{empresasList.length}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1 || currentEntries.length === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || currentEntries.length === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />

                                </button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">{currentPage}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || currentEntries.length === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || currentEntries.length === 0}
                                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleDeleteEmpresa}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita."
            />

            {/* Modal de Alerta (Sucesso/Erro) */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={closeAlertModal}
                type={alertModal.type}
                message={alertModal.message}
            />
        </div>
    );
}
