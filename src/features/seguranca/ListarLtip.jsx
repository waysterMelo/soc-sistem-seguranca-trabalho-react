import React, { useState, useEffect } from 'react';
import {
    Plus,
    Settings,
    Printer,
    Trash2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUpDown,
    Search
} from 'lucide-react';
import {Link} from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';

// Importar serviços e modais
import ltipService from '../../api/services/Ltip/ltipService.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';
import FuncaoSearchModal from '../../components/modal/funcaoSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';


// --- Componentes Reutilizáveis ---
const TableHeader = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
            <span>{children}</span>
            <ChevronsUpDown size={14} className="text-gray-400" />
        </div>
    </th>
);

const SituacaoBadge = ({ text, dataLevantamento, proximaRevisao }) => {
    const getStatusInfo = (status, dataLevantamento, proximaRevisao) => {
        // Verificar se está vencido
        const hoje = new Date();
        const dataRevisao = new Date(proximaRevisao);
        const isVencido = dataRevisao < hoje;
        
        if (isVencido) {
            return { color: 'bg-red-100 text-red-800', text: 'Vencido' };
        }
        
        const colors = {
            'Em análise': 'bg-yellow-100 text-yellow-800',
            'Aprovado': 'bg-green-100 text-green-800',
            'Em elaboração': 'bg-blue-100 text-blue-800',
            'Pendente': 'bg-gray-100 text-gray-800',
            'Em revisão': 'bg-orange-100 text-orange-800'
        };
        
        return { 
            color: colors[status] || 'bg-gray-100 text-gray-800', 
            text: status 
        };
    };

    const statusInfo = getStatusInfo(text, dataLevantamento, proximaRevisao);
    
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
        </span>
    );
};

const InputWithActions = ({ placeholder, actions }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// --- Componente Principal ---
export default function ListarLTIP() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);

    // Estados para seleções obrigatórias
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncao, setSelectedFuncao] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);

    // Estados dos modais
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isFuncaoModalOpen, setIsFuncaoModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);

    // Dados dos LTIPs
    const [ltipData, setLtipData] = useState([]);
    const [loading, setLoading] = useState(false);

    const filteredData = ltipData.filter(ltip =>
        ltip.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ltip.funcao?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Função para buscar LTIPs quando critérios forem atendidos
    const fetchLtips = async () => {
        if (!selectedEmpresa || !selectedFuncao) return;

        setLoading(true);
        try {
            const response = await ltipService.getLtipsByFilters(
                selectedEmpresa.id,
                selectedFuncao.id,
                selectedSetor?.id,
                0,
                100
            );
            setLtipData(response.content || []);
        } catch (error) {
            toast.error('Erro ao buscar LTIPs');
            console.error('Erro ao buscar LTIPs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Effect para buscar LTIPs quando seleções mudarem
    useEffect(() => {
        fetchLtips();
    }, [selectedEmpresa, selectedSetor, selectedFuncao]);

    // Verificar se pode mostrar botão Novo LTIP
    const canShowNewButton = selectedEmpresa && selectedSetor && selectedFuncao;

    // Função para deletar LTIP
    const handleDeleteLtip = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este LTIP?')) {
            try {
                await ltipService.deleteLtip(id);
                toast.success('LTIP excluído com sucesso');
                fetchLtips(); // Recarregar lista
            } catch (error) {
                toast.error('Erro ao excluir LTIP');
                console.error('Erro ao excluir LTIP:', error);
            }
        }
    };

    const formatDate = (dateString) => {
    if (!dateString) return 'Pendente';
    
    try {
        // Se a data vier no formato YYYY-MM-DD, adiciona o horário para evitar problemas de timezone
        const adjustedDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(adjustedDate);
        
        // Usa getFullYear, getMonth, getDate para evitar conversão de timezone
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        return 'Data inválida';
    }
};

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    const renderContent = () => {
        if (!selectedEmpresa || !selectedSetor || !selectedFuncao) {
            return (
                <div className="text-center py-12 px-6 bg-blue-50 text-blue-700 rounded-lg">
                    <p>Selecione uma empresa, unidade, setor e função para visualizar os LTIPs.</p>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="text-center py-12 px-6 bg-blue-50 text-blue-700 rounded-lg">
                    <p>Carregando LTIPs...</p>
                </div>
            );
        }

        if (currentEntries.length === 0) {
            const message = searchTerm ? 'Nenhum registro encontrado!' : 'Ainda não existem LTIPs cadastrados para os critérios selecionados.';

            return (
                <div className="text-center py-12 px-6 bg-blue-50 text-blue-700 rounded-lg">
                    <p>{message}</p>
                </div>
            )
        }

        const isProximoVencimento = (proximaRevisao) => {
    if (!proximaRevisao) return false;
    
    const hoje = new Date();
    const dataRevisao = new Date(proximaRevisao);
    const diasRestantes = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
    
    return diasRestantes <= 30 && diasRestantes > 0; // 30 dias antes do vencimento
};

const getStatusIcon = (situacao, proximaRevisao) => {
    const hoje = new Date();
    const dataRevisao = new Date(proximaRevisao);
    
    if (dataRevisao < hoje) {
        return <span className="text-red-500">⚠️</span>;
    }
    if (isProximoVencimento(proximaRevisao)) {
        return <span className="text-orange-500">⏰</span>;
    }
    if (situacao === 'Aprovado') {
        return <span className="text-green-500">✅</span>;
    }
    return <span className="text-blue-500">📝</span>;
};

const getStatusDescription = (situacao, proximaRevisao) => {
    const hoje = new Date();
    const dataRevisao = new Date(proximaRevisao);
    
    if (dataRevisao < hoje) {
        return 'Vencido';
    }
    const diasRestantes = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
    return `${diasRestantes} dias restantes`;
};

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <TableHeader>ID</TableHeader>
                        <TableHeader>Empresa</TableHeader>
                        <TableHeader>Data do Levantamento</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Situação</TableHeader>
                        <TableHeader>Próxima Revisão</TableHeader>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntries.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{selectedEmpresa?.razaoSocial}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.dataLevantamento)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                                <SituacaoBadge 
                                    text={item.situacao || 'Em análise'} 
                                    dataLevantamento={item.dataLevantamento}
                                    proximaRevisao={item.proximaRevisao}
                                />
                                {/* Indicador de urgência */}
                                {isProximoVencimento(item.proximaRevisao) && (
                                    <span className="inline-block w-2 h-2 bg-orange-400 rounded-full" title="Próximo ao vencimento"></span>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                                {getStatusIcon(item.situacao, item.proximaRevisao)}
                                <span className="ml-2 text-xs text-gray-500">
                                    {getStatusDescription(item.situacao, item.proximaRevisao)}
                                </span>
                            </div>
                        </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.proximaRevisao)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleDeleteLtip(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <Link
                                        to={`/seguranca/novo-ltip/${item.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Pencil size={18} />
                                    </Link>
                                    <button className="text-blue-600 hover:text-blue-800"><Printer size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }


    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                        LTIP - Laudo Técnico de Insalubridade e Periculosidade
                    </h1>
                </div>

                {/* Filtros e Tabela */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <div className="flex flex-wrap gap-2">
                            {canShowNewButton && (
                                <Link to={'/seguranca/novo-ltip'}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    <Plus size={16} />
                                    <span>Novo LTIP</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Empresa *</label>
                            <InputWithActions
                                placeholder={selectedEmpresa ? selectedEmpresa.razaoSocial : "Nenhuma Empresa selecionada"}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsEmpresaModalOpen(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedEmpresa(null);
                                                setSelectedSetor(null);
                                                setSelectedFuncao(null);
                                            }}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Unidade Operacional</label>
                            <InputWithActions
                                placeholder={selectedUnidade ? selectedUnidade.nome : "Nenhuma Unidade Operacional selecionada"}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            disabled={!selectedEmpresa}
                                            onClick={() => selectedEmpresa && setIsUnidadeModalOpen(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUnidade(null)}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Setores *</label>
                            <InputWithActions
                                placeholder={selectedSetor ? selectedSetor.nome : "Nenhum Setor selecionado"}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            disabled={!selectedEmpresa}
                                            onClick={() => selectedEmpresa && setIsSetorModalOpen(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSetor(null);
                                                setSelectedFuncao(null);
                                            }}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Funções *</label>
                            <InputWithActions
                                placeholder={selectedFuncao ? selectedFuncao.nome : "Nenhuma Função selecionada"}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            disabled={!selectedSetor}
                                            onClick={() => selectedSetor && setIsFuncaoModalOpen(true)}
                                            className="p-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFuncao(null)}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                    
                        <div className='flex w-full sm:w-auto gap-2'>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>
                    </div>

                    {renderContent()}

                    {/* Paginação */}
                    {currentEntries.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 mb-2 sm:mb-0">
                                Mostrando de <span className="font-medium">{indexOfFirstEntry + 1}</span> até <span className="font-medium">{Math.min(indexOfLastEntry, filteredData.length)}</span> de <span className="font-medium">{filteredData.length}</span> registros
                            </p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={18} /></button>
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18} /></button>
                                <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md">{currentPage}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18} /></button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
            />

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={isEmpresaModalOpen}
                onClose={() => setIsEmpresaModalOpen(false)}
                onSelect={(empresa) => {
                    setSelectedEmpresa(empresa);
                    setIsEmpresaModalOpen(false);
                }}
            />

            {selectedEmpresa && (
                <UnidadesOperacionaisModal
                    isOpen={isUnidadeModalOpen}
                    onClose={() => setIsUnidadeModalOpen(false)}
                    onSelect={(unidade) => {
                        setSelectedUnidade(unidade);
                        setIsUnidadeModalOpen(false);
                    }}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {selectedEmpresa && (
                <SetorSearchModal
                    isOpen={isSetorModalOpen}
                    onClose={() => setIsSetorModalOpen(false)}
                    onSelect={(setor) => {
                        setSelectedSetor(setor);
                        setIsSetorModalOpen(false);
                    }}
                    empresaId={selectedEmpresa.id}
                />
            )}

            {selectedSetor && (
                <FuncaoSearchModal
                    isOpen={isFuncaoModalOpen}
                    onClose={() => setIsFuncaoModalOpen(false)}
                    onSelect={(funcao) => {
                        setSelectedFuncao(funcao);
                        setIsFuncaoModalOpen(false);
                    }}
                    empresaId={selectedEmpresa.id}
                    setorId={selectedSetor.id}
                />
            )}
        </div>
    );
}
