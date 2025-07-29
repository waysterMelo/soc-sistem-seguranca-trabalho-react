import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    ChevronsUpDown,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { Link } from "react-router-dom";
import { unidadeService } from '../../../api/services/cadastros/serviceUnidadeOperacional.js';
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import empresaService from "../../../api/services/cadastros/serviceEmpresas.js";

// --- Componentes Reutilizáveis ---

// Componente para o cabeçalho da tabela com ícone de ordenação
const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

// Componente para o selo de status
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
    const statusClasses = {
        'Ativo': 'bg-green-100 text-green-700',
        'Inativo': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

// Modal de confirmação para deletar unidade
const ConfirmacaoModal = ({ isOpen, onClose, onConfirm, unidadeNome }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar exclusão</h3>
                <p className="text-gray-700 mb-6">
                    Tem certeza que deseja excluir a unidade <span className="font-semibold">{unidadeNome}</span>?
                    Esta ação não poderá ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para oferecer alternativa de inativação quando não é possível excluir
const AlternativaModal = ({ isOpen, onClose, onInativar, unidadeNome }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-start mb-4">
                    <AlertTriangle className="text-yellow-500 h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-gray-900">Não é possível excluir</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    A unidade <span className="font-semibold">{unidadeNome}</span> não pode ser excluída porque está sendo utilizada em outros registros (LTCAT, PGR ou outros documentos).
                </p>
                <p className="text-gray-700 mb-6">
                    Como alternativa, você pode inativar esta unidade para que ela não apareça em novas operações.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onInativar}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                    >
                        Inativar Unidade
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---

export default function ListarUnidades() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [confirmacaoModal, setConfirmacaoModal] = useState({
        isOpen: false,
        unidadeId: null,
        unidadeNome: ''
    });
    const [alternativaModal, setAlternativaModal] = useState({
        isOpen: false,
        unidadeId: null,
        unidadeNome: ''
    });
    const [processandoUnidade, setProcessandoUnidade] = useState(false);

    // Carregar unidades operacionais com base na empresa selecionada
    useEffect(() => {
        if (empresaSelecionada) {
            buscarUnidadesPorEmpresa(empresaSelecionada.id);
        } else {
            setUnidades([]);
        }
    }, [empresaSelecionada]);

    const handleEmpresaSelect = async (empresa) => {
        try {
            // Busca os detalhes completos da empresa
            const response = await empresaService.getById(empresa.id);
            const empresaCompleta = response.data;

            setEmpresaSelecionada(empresaCompleta);
            setShowEmpresaModal(false);

            // Busca as unidades da empresa selecionada
            await buscarUnidadesPorEmpresa(empresaCompleta.id);
        } catch (error) {
            console.error("Erro ao buscar detalhes da empresa:", error);
            // Usa os dados básicos da empresa caso a busca detalhada falhe
            setEmpresaSelecionada(empresa);
            setShowEmpresaModal(false);
            await buscarUnidadesPorEmpresa(empresa.id);
        }
    };

    const limparSelecaoEmpresa = () => {
        setEmpresaSelecionada(null);
        setUnidades([]);
    };

    const buscarUnidadesPorEmpresa = async (empresaId) => {
        setLoading(true);
        try {
            const response = await unidadeService.getAll({ empresaId });
            const unidadesData = Array.isArray(response.data) ? response.data :
                response.data?.content ? response.data.content : [];
            // Buscar total de setores para cada unidade
            const unidadesComTotalSetores = await Promise.all(
                unidadesData.map(async (unidade) => {
                    try {
                        const totalSetoresResponse = await unidadeService.getTotalSetores(unidade.id);
                        return {
                            ...unidade,
                            totalSetores: totalSetoresResponse.data
                        };
                    } catch (error) {
                        return {
                            ...unidade,
                            totalSetores: 0
                        };
                    }
                })
            );
            setUnidades(unidadesComTotalSetores);
        } catch (error) {
            console.error("Erro detalhado:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            setUnidades([]);
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal de confirmação para deletar unidade
    const confirmarDeletarUnidade = (unidade) => {
        setConfirmacaoModal({
            isOpen: true,
            unidadeId: unidade.id,
            unidadeNome: unidade.nome
        });
    };

    // Fechar modal de confirmação
    const fecharModalConfirmacao = () => {
        setConfirmacaoModal({
            isOpen: false,
            unidadeId: null,
            unidadeNome: ''
        });
    };

    // Fechar modal de alternativa
    const fecharModalAlternativa = () => {
        setAlternativaModal({
            isOpen: false,
            unidadeId: null,
            unidadeNome: ''
        });
    };

    // Função para inativar unidade em vez de excluir
    const inativarUnidade = async () => {
        if (!alternativaModal.unidadeId) return;
        
        setProcessandoUnidade(true);
        try {
            // Buscar detalhes da unidade primeiro
            const unidadeResponse = await unidadeService.getById(alternativaModal.unidadeId);
            const unidadeData = unidadeResponse.data;
            
            // Atualizar o status para inativo
            const dadosAtualizados = {
                ...unidadeData,
                situacao: 'INATIVO'
            };
            
            await unidadeService.update(alternativaModal.unidadeId, dadosAtualizados);
            
            // Atualizar a lista após inativar
            if (empresaSelecionada) {
                await buscarUnidadesPorEmpresa(empresaSelecionada.id);
            }
            
            fecharModalAlternativa();
        } catch (error) {
            console.error("Erro ao inativar unidade:", error);
            // Aqui poderia adicionar um toast ou notificação de erro
        } finally {
            setProcessandoUnidade(false);
        }
    };

    // Deletar unidade após confirmação
    const deletarUnidade = async () => {
        if (!confirmacaoModal.unidadeId) return;
        
        setProcessandoUnidade(true);
        try {
            await unidadeService.delete(confirmacaoModal.unidadeId);
            // Atualizar a lista após deletar
            if (empresaSelecionada) {
                await buscarUnidadesPorEmpresa(empresaSelecionada.id);
            }
            fecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar unidade:", error);
            
            // Verificar se é um erro de violação de integridade referencial
            if (error.response?.data?.message?.includes('DataIntegrityViolationException') || 
                error.message?.includes('foreign key constraint fails')) {
                
                // Mostrar modal de alternativa em vez de apenas mostrar erro
                setAlternativaModal({
                    isOpen: true,
                    unidadeId: confirmacaoModal.unidadeId,
                    unidadeNome: confirmacaoModal.unidadeNome
                });
            }
            
            fecharModalConfirmacao();
        } finally {
            setProcessandoUnidade(false);
        }
    };

    // Filtrar unidades com base no termo de pesquisa
    const unidadesFiltradas = unidades.filter(unidade =>
        unidade.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginação
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = unidadesFiltradas.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(unidadesFiltradas.length / entriesPerPage);

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho e Botão de Ação Principal */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Unidades Operacionais</h1>
                    <Link
                        to="/cadastros/nova-unidade"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Nova Unidade</span>
                    </Link>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {/* Filtro por Empresa */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600">Filtrar por empresa</label>
                        <div className="relative flex items-center mt-1">
                            <input
                                type="text"
                                placeholder="Nenhuma Empresa selecionada"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={empresaSelecionada ? (empresaSelecionada.nomeFantasia ?
                                    `${empresaSelecionada.razaoSocial} (${empresaSelecionada.nomeFantasia})` :
                                    empresaSelecionada.razaoSocial) : ''}
                                disabled
                            />
                            <div className="absolute right-0 flex">
                                <button
                                    type="button"
                                    className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-l-md"
                                    onClick={() => setShowEmpresaModal(true)}
                                >
                                    <Search size={18}/>
                                </button>
                                {empresaSelecionada && (
                                    <button
                                        type="button"
                                        className="bg-gray-500 text-white p-2.5 border border-gray-500 rounded-r-md hover:bg-gray-600"
                                        onClick={limparSelecaoEmpresa}
                                    >
                                        <span className="font-bold">X</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Busca e Entradas por Página */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <select
                            className="w-full sm:w-auto mt-2 sm:mt-0 border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>

                    {/* Tabela de Unidades */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <TableHeader>Unidade</TableHeader>
                                <TableHeader>Empresa</TableHeader>
                                <TableHeader>Total de Setores Vinculados</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : empresaSelecionada && currentEntries.length > 0 ? (
                                currentEntries.map((unidade) => (
                                    <tr key={unidade.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unidade.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresaSelecionada.razaoSocial}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unidade.totalSetores || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={unidade.situacao === 'ATIVO' ? 'Ativo' : 'Inativo'} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-4">
                                            <Link
                                                to={`/cadastros/editar-unidade/${unidade.id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => confirmarDeletarUnidade(unidade)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : empresaSelecionada ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma unidade operacional encontrada para esta empresa.
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Selecione uma empresa para visualizar suas unidades operacionais.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação (será exibida se houver dados) */}
                    {currentEntries.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{indexOfFirstEntry + 1}</span> a <span className="font-medium">{Math.min(indexOfLastEntry, unidadesFiltradas.length)}</span> de <span className="font-medium">{unidadesFiltradas.length}</span> resultados
                            </div>
                            <div className="inline-flex mt-2 sm:mt-0">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Pesquisa de Empresas */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleEmpresaSelect}
            />

            {/* Modal de Confirmação para Deletar Unidade */}
            <ConfirmacaoModal
                isOpen={confirmacaoModal.isOpen}
                onClose={fecharModalConfirmacao}
                onConfirm={deletarUnidade}
                unidadeNome={confirmacaoModal.unidadeNome}
            />
            
            {/* Modal de Alternativa para Inativar */}
            <AlternativaModal
                isOpen={alternativaModal.isOpen}
                onClose={fecharModalAlternativa}
                onInativar={inativarUnidade}
                unidadeNome={alternativaModal.unidadeNome}
            />
        </div>
    );
}