import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    ChevronsUpDown,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";
import SetorSearchModal from "../../../components/modal/SetorSearchModal";

// --- Componentes Reutilizáveis ---

// MODIFICAÇÃO: Adicionado 'readOnly' para ser usado nos filtros com modal.
// Também adicionei um 'onClick' no input quando for readOnly para melhorar a usabilidade.
const InputWithActions = ({ placeholder, value, onChange, onSearch, onClear, readOnly = false }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            onClick={readOnly ? onSearch : undefined} // Facilita abrir o modal clicando no campo
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-pointer bg-gray-50' : ''}`}
        />
        <div className="absolute right-0 flex">
            <button type="button" onClick={onSearch} className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"><Search size={18}/></button>
            <button type="button" onClick={onClear} className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"><Trash2 size={18}/></button>
        </div>
    </div>
);

// Cabeçalho da tabela com ícone de ordenação
const TableHeader = ({ children, onSort, field }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700" onClick={() => onSort(field)}>
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

// Selo de status colorido
const StatusBadge = ({ status }) => {
    const baseClasses = "inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusClasses = {
        'ATIVO': 'bg-green-100 text-green-700', // Padronizando para maiúsculas
        'INATIVO': 'bg-red-100 text-red-700',
    };
    const normalizedStatus = status?.toUpperCase();
    return (
        <span className={`${baseClasses} ${statusClasses[normalizedStatus] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Modal de confirmação para deletar função
const ConfirmacaoModal = ({ isOpen, onClose, onConfirm, funcaoNome, processando }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar exclusão</h3>
                <p className="text-gray-700 mb-6">
                    Tem certeza que deseja excluir a função <span className="font-semibold">{funcaoNome}</span>?
                    Esta ação não poderá ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processando}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processando ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Excluindo...</>
                        ) : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para oferecer alternativa de inativação quando não é possível excluir
const AlternativaModal = ({ isOpen, onClose, onInativar, funcaoNome, processando }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start mb-4">
                    <AlertTriangle className="text-yellow-500 h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900">Não é possível excluir</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    A função <span className="font-semibold">{funcaoNome}</span> não pode ser excluída porque está sendo utilizada em outros registros.
                </p>
                <p className="text-gray-700 mb-6">
                    Como alternativa, você pode inativar esta função. Deseja continuar?
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} disabled={processando} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancelar</button>
                    <button onClick={onInativar} disabled={processando} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
                        {processando ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Inativando...</>
                        ) : 'Inativar Função'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---

export default function ListarFuncoes() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [funcoes, setFuncoes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [sortField, setSortField] = useState('nome');
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('ATIVO'); // Padronizado para maiúsculas
    const [processando, setProcessando] = useState(false);
    const [empresaFiltro, setEmpresaFiltro] = useState({ id: null, razaoSocial: '' });
    const [setorFiltro, setSetorFiltro] = useState({ id: null, nome: '' });
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [confirmacaoModal, setConfirmacaoModal] = useState({ isOpen: false, funcaoId: null, funcaoNome: '' });
    const [alternativaModal, setAlternativaModal] = useState({ isOpen: false, funcaoId: null, funcaoNome: '' });


    useEffect(() => {
        if (empresaFiltro.id){
            loadFuncoes();
        }else{
            setFuncoes([]);
            setTotalItems(0);
            setLoading(false);
        }
    }, [currentPage, entriesPerPage, statusFilter, sortField, sortDirection, empresaFiltro, setorFiltro]);

    const loadFuncoes = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: entriesPerPage,
                sort: `${sortField},${sortDirection}`,
                status: statusFilter !== 'todos' ? statusFilter : undefined,
                search: searchTerm || undefined,
                empresaId: empresaFiltro.id || undefined,
                setorId: setorFiltro.id || undefined,
            };

            let response;

            if (setorFiltro.id) {
                response = await funcaoService.getFuncoesBySetorId(setorFiltro.id, params);
            } else {
                response = await funcaoService.buscarComFiltros(params);
            }
            setFuncoes(response.data.content || []);
            setTotalItems(response.data.totalElements || 0);
        } catch (error) {
            console.error('Erro ao carregar funções:', error);
            toast.error('Erro ao carregar a lista de funções.');
        } finally {
            setLoading(false);
        }

    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadFuncoes(); // A busca por termo geral ainda recarrega a lista manualmente
    };

    const handleSort = (field) => {
        setSortField(field);
        setSortDirection(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
        setCurrentPage(1); // Sempre volta para a primeira página ao ordenar
    };

    // --- MUDANÇA 5: Funções para lidar com a seleção dos modais ---
    const handleEmpresaSelect = (empresa) => {
        setEmpresaFiltro({ id: empresa.id, razaoSocial: empresa.razaoSocial });
        setIsEmpresaModalOpen(false);
        setCurrentPage(1); // Resetar página ao aplicar filtro
    };

    const handleSetorSelect = (setor) => {
        setSetorFiltro({ id: setor.id, nome: setor.nome });
        setIsSetorModalOpen(false);
        setCurrentPage(1); // Resetar página ao aplicar filtro
    };

    // --- MUDANÇA 6: Função de limpar filtro ajustada para o novo formato de estado ---
    const handleClearFilter = (filterType) => {
        if (filterType === 'empresa') {
            setEmpresaFiltro({ id: null, razaoSocial: '' });
        } else if (filterType === 'setor') {
            setSetorFiltro({ id: null, nome: '' });
        }
        setCurrentPage(1);
    };

    const confirmarDeletar = (funcao) => setConfirmacaoModal({ isOpen: true, funcaoId: funcao.id, funcaoNome: funcao.nome });
    const fecharModalConfirmacao = () => setConfirmacaoModal({ isOpen: false, funcaoId: null, funcaoNome: '' });
    const fecharModalAlternativa = () => setAlternativaModal({ isOpen: false, funcaoId: null, funcaoNome: '' });

    // --- MUDANÇA 7: Lógica de inativação otimizada ---
    // Agora usa diretamente o serviço PATCH, fazendo apenas 1 requisição em vez de 2.
    const inativarFuncao = async () => {
        if (!alternativaModal.funcaoId) return;

        setProcessando(true);
        try {
            await funcaoService.inativarFuncao(alternativaModal.funcaoId);
            toast.success('Função inativada com sucesso!');
            fecharModalAlternativa();
            await loadFuncoes(); // Recarrega a lista para refletir a mudança
        } catch (error) {
            console.error("Erro ao inativar função:", error);
            toast.error('Erro ao inativar função. Tente novamente.');
        } finally {
            setProcessando(false);
        }
    };

    const deletarFuncao = async () => {
        if (!confirmacaoModal.funcaoId) return;
        setProcessando(true);
        try {
            await funcaoService.delete(confirmacaoModal.funcaoId);
            toast.success('Função excluída com sucesso!');
            fecharModalConfirmacao();
            await loadFuncoes();
        } catch (error) {
            console.error("Erro ao deletar função:", error);
            fecharModalConfirmacao(); // Fechar o modal de delete antes de abrir o outro
            if (error.response?.status === 409 || error.response?.data?.message?.includes('DataIntegrityViolationException')) {
                setAlternativaModal({
                    isOpen: true,
                    funcaoId: confirmacaoModal.funcaoId,
                    funcaoNome: confirmacaoModal.funcaoNome
                });
            } else {
                toast.error('Erro ao excluir função. Tente novamente.');
            }
        } finally {
            setProcessando(false);
        }
    };

    const handleEdit = (id) => navigate(`/cadastros/editar/funcao/${id}`);

    const totalPages = Math.ceil(totalItems / entriesPerPage);

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Funções</h1>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/cadastros/funcao" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Plus size={16} />
                            <span>Nova Função</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* --- MUDANÇA 8: Filtro de Empresa integrado com o Modal --- */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Filtrar por Empresa</label>
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={empresaFiltro.razaoSocial}
                                readOnly={true}
                                onSearch={() => setIsEmpresaModalOpen(true)}
                                onClear={() => handleClearFilter('empresa')}
                            />
                        </div>
                        {/* --- MUDANÇA 9: Filtro de Setor integrado com o Modal --- */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Filtrar por Setor</label>
                            <InputWithActions
                                placeholder="Selecione um setor"
                                value={setorFiltro.nome}
                                readOnly={true}
                                onSearch={() => setIsSetorModalOpen(true)}
                                onClear={() => handleClearFilter('setor')}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div className="relative w-full sm:flex-grow">
                            <input
                                type="text"
                                placeholder="Procure por nome da função..."
                                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <Search size={18} />
                            </button>
                        </div>
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="ATIVO">Ativos</option>
                                <option value="INATIVO">Inativos</option>
                                <option value="todos">Todos</option>
                            </select>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <TableHeader onSort={handleSort} field="nome">Nome</TableHeader>
                                <TableHeader onSort={handleSort} field="setor.nome">Setor</TableHeader>
                                <TableHeader onSort={handleSort} field="empresa.razaoSocial">Empresa</TableHeader>
                                <TableHeader onSort={handleSort} field="status">Status</TableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Carregando dados...</td></tr>
                            ) : !empresaFiltro.id ? (
                                // NOVA CONDIÇÃO: Se nenhuma empresa foi selecionada
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-700">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <Search size={32} className="mb-2 text-gray-400" />
                                        <span className="font-medium">Selecione uma empresa para iniciar a busca.</span>
                                    </div>
                                </td></tr>
                            ) : funcoes.length === 0 ? (
                                // Condição original para quando não há resultados
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma função encontrada para os filtros aplicados.</td></tr>
                            ) : (
                                funcoes.map((funcao) => (
                                    <tr key={funcao.id} className="hover:bg-gray-50">
                                        {/* Suas <td> continuam aqui como antes */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{funcao.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.setor?.nome || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funcao.empresa?.razaoSocial || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={funcao.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEdit(funcao.id)} className="text-blue-600 hover:text-blue-800" title="Editar função"><Pencil size={18} /></button>
                                                <button onClick={() => confirmarDeletar(funcao)} className="text-red-600 hover:text-red-800" title="Excluir função" disabled={processando}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && funcoes.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{(currentPage - 1) * entriesPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * entriesPerPage, totalItems)}</span> de <span className="font-medium">{totalItems}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft size={18} /></button>
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">{currentPage}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>

                <ConfirmacaoModal isOpen={confirmacaoModal.isOpen} onClose={fecharModalConfirmacao} onConfirm={deletarFuncao} funcaoNome={confirmacaoModal.funcaoNome} processando={processando} />
                <AlternativaModal isOpen={alternativaModal.isOpen} onClose={fecharModalAlternativa} onInativar={inativarFuncao} funcaoNome={alternativaModal.funcaoNome} processando={processando} />

                <EmpresaSearchModal
                    isOpen={isEmpresaModalOpen}
                    onClose={() => setIsEmpresaModalOpen(false)}
                    onSelect={handleEmpresaSelect}
                />
                <SetorSearchModal
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={handleSetorSelect}
                    empresaId={empresaFiltro.id}
                />
            </div>
        </div>
    );
}