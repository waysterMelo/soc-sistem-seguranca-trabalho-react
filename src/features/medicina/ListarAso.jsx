import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, Plus, X, Edit, Trash2, Printer, Check, User, ChevronLeft, ChevronRight } from 'lucide-react';

import asoService from '../../api/services/aso/asoService.js';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal.jsx';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal.jsx';
import SetorSearchModal from '../../components/modal/SetorSearchModal.jsx';

const InputWithActions = ({ placeholder, value, onSearchClick, onClearClick, readOnly = true, disabled = false }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly={readOnly}
            onClick={onSearchClick}
            disabled={disabled}
            className="w-full py-2 pl-4 pr-20 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <div className="absolute right-0 flex">
            <button type="button" onClick={onSearchClick} disabled={disabled} className="p-2.5 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300">
                <Search size={16} />
            </button>
            <button type="button" onClick={onClearClick} disabled={disabled} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-lg disabled:bg-red-300">
                <X size={16} />
            </button>
        </div>
    </div>
);

export default function ListarAso() {
    const navigate = useNavigate();

    // Data states
    const [allAsos, setAllAsos] = useState([]); // Holds all ASOs for the selected employee
    const [asos, setAsos] = useState([]); // Holds the ASOs for the current page
    const [pagination, setPagination] = useState({ page: 0, size: 5, totalPages: 0 });
    const [loading, setLoading] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({ funcionarioId: null });
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    
    // Funcionario list state
    const [funcionariosDoSetor, setFuncionariosDoSetor] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

    // Modal states
    const [modalState, setModalState] = useState({ empresa: false, unidade: false, setor: false });

    // Fetch all ASOs for an employee
    const fetchAsos = useCallback(async () => {
        if (!filters.funcionarioId) {
            setAllAsos([]);
            return;
        }
        setLoading(true);
        try {
            const response = await asoService.getAsosByFuncionario(filters.funcionarioId);
            setAllAsos(response || []);
        } catch (error) {
            toast.error("Erro ao carregar ASOs do funcionário.");
            setAllAsos([]);
        } finally {
            setLoading(false);
        }
    }, [filters.funcionarioId]);

    useEffect(() => {
        fetchAsos();
    }, [fetchAsos]);

    // Effect for frontend pagination
    useEffect(() => {
        const total = allAsos.length;
        const totalPages = Math.ceil(total / pagination.size);
        setPagination(prev => ({ ...prev, totalPages }));

        const start = pagination.page * pagination.size;
        const end = start + pagination.size;
        setAsos(allAsos.slice(start, end));

    }, [allAsos, pagination.page, pagination.size]);

    // Effect to fetch employees when sector changes
    useEffect(() => {
        if (!selectedSetor) {
            setFuncionariosDoSetor([]);
            return;
        }
        const carregarFuncionarios = async () => {
            setLoadingFuncionarios(true);
            try {
                const response = await funcionarioService.buscarFuncionariosPorSetor(selectedSetor.id, { page: 0, size: 100 });
                setFuncionariosDoSetor(response.data.content || []);
            } catch (error) {
                toast.error('Erro ao carregar funcionários do setor.');
            } finally {
                setLoadingFuncionarios(false);
            }
        };
        carregarFuncionarios();
    }, [selectedSetor]);

    const openModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: true }));
    const closeModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: false }));

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleEmpresaSelect = (empresa) => {
        clearFilter('empresa');
        setSelectedEmpresa(empresa);
        closeModal('empresa');
    };

    const handleUnidadeSelect = (unidade) => {
        clearFilter('unidade');
        setSelectedUnidade(unidade);
        closeModal('unidade');
    };

    const handleSetorSelect = (setor) => {
        clearFilter('setor');
        setSelectedSetor(setor);
        closeModal('setor');
    };

    const handleFuncionarioSelect = (funcionario) => {
        setSelectedFuncionario(funcionario);
        setFilters({ funcionarioId: funcionario.id });
        setPagination(prev => ({ ...prev, page: 0 })); // Reset page when new employee is selected
    };

    const clearFilter = (filterName) => {
        switch (filterName) {
            case 'empresa':
                setSelectedEmpresa(null); setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionario(null);
                setFilters({ funcionarioId: null });
                break;
            case 'unidade':
                setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionario(null);
                setFilters({ funcionarioId: null });
                break;
            case 'setor':
                setSelectedSetor(null); setSelectedFuncionario(null);
                setFilters({ funcionarioId: null });
                break;
            case 'funcionario':
                setSelectedFuncionario(null);
                setFilters({ funcionarioId: null });
                break;
            default: break;
        }
    };
    
    const getVencimento = (aso) => {
        if (!aso.dataEmissao || (aso.tipoAso !== 'ADMISSIONAL' && aso.tipoAso !== 'PERIODICO')) return 'N/A';
        const dataEmissao = new Date(aso.dataEmissao);
        dataEmissao.setFullYear(dataEmissao.getFullYear() + 1);
        return dataEmissao.toLocaleDateString('pt-BR');
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8 font-sans">
                <div className="max-w-full mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Consultar ASO por Funcionário</h1>
                        <button onClick={() => navigate('/medicina/cadastrar-aso')} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
                            <Plus size={18} /> Novo ASO
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p className='text-sm text-gray-600 mb-4'>Selecione a empresa, unidade e setor para listar os funcionários. Em seguida, clique em um funcionário para ver seus ASOs.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                <InputWithActions placeholder="Selecione uma empresa" value={selectedEmpresa ? selectedEmpresa.razaoSocial : ''} onSearchClick={() => openModal('empresa')} onClearClick={() => clearFilter('empresa')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                                <InputWithActions placeholder="Selecione uma unidade" value={selectedUnidade ? selectedUnidade.nome : ''} onSearchClick={() => openModal('unidade')} onClearClick={() => clearFilter('unidade')} disabled={!selectedEmpresa} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                                <InputWithActions placeholder="Selecione um setor" value={selectedSetor ? selectedSetor.nome : ''} onSearchClick={() => openModal('setor')} onClearClick={() => clearFilter('setor')} disabled={!selectedUnidade} />
                            </div>
                        </div>

                        {selectedSetor && (
                             <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Funcionários Disponíveis
                                    </label>
                                    {selectedFuncionario && <button onClick={() => clearFilter('funcionario')} className='text-sm text-red-600 hover:underline'>Limpar seleção</button>}
                                    {loadingFuncionarios && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                            Carregando...
                                        </div>
                                    )}
                                </div>

                                {!loadingFuncionarios && funcionariosDoSetor.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                                        {funcionariosDoSetor.map((funcionario) => (
                                            <div
                                                key={funcionario.id}
                                                onClick={() => handleFuncionarioSelect(funcionario)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                                    selectedFuncionario?.id === funcionario.id ? 'bg-blue-50 border-blue-200' : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {funcionario.nome} {funcionario.sobrenome}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            CPF: {funcionario.cpf} |
                                                            Função: {funcionario.funcao?.nome || 'Não informado'}
                                                        </div>
                                                    </div>
                                                    {selectedFuncionario?.id === funcionario.id && (
                                                        <Check size={20} className="text-blue-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : !loadingFuncionarios && (
                                    <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                                        <User size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p>Nenhum funcionário encontrado</p>
                                        <p className="text-sm">
                                            Não há funcionários cadastrados neste setor
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedFuncionario && (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 p-4 bg-gray-50 border-b">ASOs de {selectedFuncionario.nome}</h3>
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        {['ID', 'Data', 'Tipo', 'Empresa', 'Funcionário', 'Vencimento', 'Ações'].map(header => (
                                            <th key={header} className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">{header}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-10">Carregando ASOs...</td></tr>
                                    ) : asos.length > 0 ? asos.map(aso => (
                                        <tr key={aso.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">{aso.id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{new Date(aso.dataEmissao).toLocaleDateString('pt-BR')}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{aso.tipoAso}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">{aso.funcionario?.empresa?.razaoSocial || aso.nomeEmpresa || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">{`${aso.funcionario?.nome || aso.nomeFuncionario || ''} ${aso.funcionario?.sobrenome || ''}`}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{getVencimento(aso)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => navigate(`/medicina/editar-aso/${aso.id}`)} className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button>
                                                    <button onClick={() => alert(`Deleting ${aso.id}`)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                                                    <button onClick={() => alert(`Printing ${aso.id}`)} className="text-gray-600 hover:text-gray-800"><Printer size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhum ASO encontrado para este funcionário.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                                {allAsos.length > pagination.size && (
                                    <div className="flex justify-between items-center p-4 bg-white border-t">
                                        <span className="text-sm text-gray-700">
                                            Página {pagination.page + 1} de {pagination.totalPages || 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 0} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ChevronLeft size={16} /></button>
                                            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages - 1} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EmpresaSearchModal isOpen={modalState.empresa} onClose={() => closeModal('empresa')} onSelect={handleEmpresaSelect} />
            {selectedEmpresa && <UnidadesOperacionaisModal isOpen={modalState.unidade} onClose={() => closeModal('unidade')} onSelect={handleUnidadeSelect} empresaId={selectedEmpresa.id} />}
            {selectedUnidade && <SetorSearchModal isOpen={modalState.setor} onClose={() => closeModal('setor')} onSelect={handleSetorSelect} empresaId={selectedEmpresa.id} unidadeId={selectedUnidade.id} />}
        </>
    );
}
