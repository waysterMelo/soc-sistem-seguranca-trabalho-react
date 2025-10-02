import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Save, X, ArrowLeft, User, CheckCircle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, AlertTriangle } from 'lucide-react';

import espirometriaService from '../../api/services/medicina/espirometriaService';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import AparelhagemLtcatModal from '../../components/modal/AparelhagemLtcatModal';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';
import SetorSearchModal from '../../components/modal/SetorSearchModal';

// --- Sub-Componentes --- //

const FormSection = ({ title, children, gridCols = 'lg:grid-cols-4' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-4">{title}</h2>}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6`}>
            {children}
        </div>
    </div>
);

const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md h-10 flex items-center">{value || 'N/A'}</p>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10" />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 h-10">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const InputWithActions = ({ placeholder, value, onSearchClick, onClearClick, disabled = false }) => (
    <div className="relative">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            onClick={!disabled ? onSearchClick : undefined}
            className={`w-full appearance-none bg-white pl-4 pr-20 py-2 border border-gray-300 rounded-md h-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer focus:ring-2 focus:ring-blue-500'}`}
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
            {value && (
                <button type="button" onClick={onClearClick} disabled={disabled} className="p-2 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed">
                    <X size={18} />
                </button>
            )}
            <button type="button" onClick={onSearchClick} disabled={disabled} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-r-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Search size={18} />
            </button>
        </div>
    </div>
);

const RadioOption = (props) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{props.label}</span>
    </label>
);

const SingleSelectFuncionarioList = ({
    funcionarios,
    loading,
    selectedFuncionario,
    onSelectFuncionario,
    currentPage,
    totalPages,
    onPageChange,
    disabled = false
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando funcionários...</span>
            </div>
        );
    }

    if (funcionarios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed">
                <User size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhum funcionário encontrado para este setor.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 mt-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="grid gap-3 max-h-96 overflow-y-auto p-1">
                {funcionarios.map((funcionario) => {
                    const isSelected = selectedFuncionario?.id === funcionario.id;
                    return (
                        <div
                            key={funcionario.id}
                            onClick={() => !disabled && onSelectFuncionario(funcionario)}
                            className={`flex items-center p-3 border rounded-lg transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                {isSelected && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">{funcionario.nome}</span>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span>CPF: {funcionario.cpf}</span>
                                    <span>Função: {funcionario.funcao?.nome || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Página {currentPage + 1} de {totalPages}</p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => onPageChange(0)} disabled={currentPage === 0 || disabled} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0 || disabled} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded">{currentPage + 1}</span>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || disabled} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1 || disabled} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Componente Principal --- //

export default function CadastrarEspirometria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        funcionarioId: '',
        aparelhoUtilizadoId: '',
        dataExame: new Date().toISOString().split('T')[0],
        tipoExame: 'PERIODICO',
        altura: '',
        peso: '',
        pef: '',
        fev1: '',
        fvc: '',
        conclusao: 'NORMAL',
        outraConclusao: ''
    });
    
    // States for filters and selections
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [selectedAparelho, setSelectedAparelho] = useState(null);

    // States for modals
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isAparelhoModalOpen, setIsAparelhoModalOpen] = useState(false);
    const [showConclusionConfirm, setShowConclusionConfirm] = useState(false);

    // States for employee list
    const [funcionarios, setFuncionarios] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
    const [funcionariosCurrentPage, setFuncionariosCurrentPage] = useState(0);
    const [funcionariosTotalPages, setFuncionariosTotalPages] = useState(0);

    // General states
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Fetch employees when sector changes
    useEffect(() => {
        if (selectedSetor) {
            const fetchFuncionarios = async () => {
                setLoadingFuncionarios(true);
                try {
                    const response = await funcionarioService.buscarFuncionariosPorSetor(selectedSetor.id, { page: funcionariosCurrentPage, size: 10 });
                    setFuncionarios(response.data.content || []);
                    setFuncionariosTotalPages(response.data.totalPages || 0);
                } catch (error) {
                    toast.error("Erro ao buscar funcionários.");
                    setFuncionarios([]);
                } finally {
                    setLoadingFuncionarios(false);
                }
            };
            fetchFuncionarios();
        } else {
            setFuncionarios([]);
        }
    }, [selectedSetor, funcionariosCurrentPage]);

    // Fetch data for editing
    useEffect(() => {
        if (isEditing && id) {
            const fetchEspirometria = async () => {
                try {
                    const data = await espirometriaService.getEspirometriaById(id);
                    const func = data.funcionario;
                    
                    setFormData({
                        funcionarioId: func?.id || '',
                        aparelhoUtilizadoId: data.aparelhoUtilizado?.id || '',
                        dataExame: data.dataExame?.split('T')[0] || '',
                        tipoExame: data.tipoExame || 'PERIODICO',
                        altura: data.altura || '',
                        peso: data.peso || '',
                        pef: data.pef || '',
                        fev1: data.fev1 || '',
                        fvc: data.fvc || '',
                        conclusao: data.conclusao || 'NORMAL',
                        outraConclusao: data.outraConclusao || ''
                    });

                    if(func) {
                        setSelectedEmpresa(func.empresa);
                        setSelectedUnidade(func.unidade);
                        setSelectedSetor(func.setor);
                        setSelectedFuncionario(func);
                    }
                    setSelectedAparelho(data.aparelhoUtilizado);

                } catch (error) {
                    console.error("Error fetching data for edit:", error);
                    toast.error('Erro ao carregar dados da avaliação para edição.');
                }
            };
            fetchEspirometria();
        }
    }, [id, isEditing]);

    const fev1FvcRatio = useMemo(() => {
        const fev1 = parseFloat(formData.fev1);
        const fvc = parseFloat(formData.fvc);
        if (fvc > 0 && fev1 > 0) {
            return ((fev1 / fvc) * 100).toFixed(0);
        }
        return 0;
    }, [formData.fev1, formData.fvc]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (isEditing && name === 'conclusao' && value === 'NORMAL' && formData.conclusao === 'OUTROS' && formData.outraConclusao) {
            setShowConclusionConfirm(true);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleConfirmConclusionChange = () => {
        setFormData(prev => ({ ...prev, conclusao: 'NORMAL', outraConclusao: '' }));
        setShowConclusionConfirm(false);
    };

    const clearFuncionario = () => {
        setSelectedFuncionario(null);
        setFormData(prev => ({ ...prev, funcionarioId: '' }));
    }

    const handleSelectEmpresa = (empresa) => {
        setSelectedEmpresa(empresa);
        setSelectedUnidade(null);
        setSelectedSetor(null);
        clearFuncionario();
        setIsEmpresaModalOpen(false);
    };

    const handleSelectUnidade = (unidade) => {
        setSelectedUnidade(unidade);
        setSelectedSetor(null);
        clearFuncionario();
        setIsUnidadeModalOpen(false);
    };

    const handleSelectSetor = (setor) => {
        setSelectedSetor(setor);
        clearFuncionario();
        setFuncionariosCurrentPage(0);
        setIsSetorModalOpen(false);
    };

    const handleSelectFuncionario = (funcionario) => {
        setSelectedFuncionario(funcionario);
        setFormData(prev => ({ ...prev, funcionarioId: funcionario.id }));
    };

    const handleSelectAparelho = (aparelho) => {
        setSelectedAparelho(aparelho);
        setFormData(prev => ({ ...prev, aparelhoUtilizadoId: aparelho.id }));
        setIsAparelhoModalOpen(false);
    };

    const validateForm = () => {
        const requiredFields = {
            funcionarioId: "Funcionário",
            aparelhoUtilizadoId: "Aparelho Utilizado",
            dataExame: "Data do Exame",
            tipoExame: "Tipo de Exame",
            altura: "Altura",
            peso: "Peso",
            pef: "PEF",
            fev1: "FEV 1",
            fvc: "FVC",
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                toast.warn(`O campo "${label}" é obrigatório.`);
                return false;
            }
        }
        if (formData.conclusao === 'OUTROS' && !formData.outraConclusao) {
            toast.warn('Por favor, descreva a conclusão.');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsSaving(true);
        try {
            const payload = { ...formData, altura: String(formData.altura), peso: String(formData.peso), pef: String(formData.pef), fev1: String(formData.fev1), fvc: String(formData.fvc) };
            if (isEditing) {
                await espirometriaService.updateEspirometria(id, payload);
            } else {
                await espirometriaService.createEspirometria(payload);
            }
            setShowSuccessModal(true);
            setTimeout(() => navigate('/medicina/espirometria'), 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao salvar avaliação.';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
                <div className="mx-auto">
                    <header className="flex items-center mb-6">
                        <button onClick={() => navigate('/medicina/espirometria')} className="flex items-center text-blue-600 hover:text-blue-800 mr-4 p-2 rounded-full hover:bg-blue-50">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {isEditing ? 'Editar Avaliação de Espirometria' : 'Cadastrar Avaliação de Espirometria'}
                        </h1>
                    </header>

                    <div className="space-y-6">
                        <fieldset disabled={isEditing}>
                            <FormSection title="Seleção de Localização e Funcionário" gridCols="lg:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                                    <InputWithActions placeholder="Selecione uma empresa" value={selectedEmpresa?.razaoSocial || ''} onSearchClick={() => setIsEmpresaModalOpen(true)} onClearClick={() => handleSelectEmpresa(null)} disabled={isEditing} />
                                </div>
                                {!isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Operacional *</label>
                                        <InputWithActions placeholder="Selecione uma unidade" value={selectedUnidade?.nome || ''} onSearchClick={() => setIsUnidadeModalOpen(true)} onClearClick={() => handleSelectUnidade(null)} disabled={!selectedEmpresa || isEditing} />
                                    </div>
                                )}
                                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
                                    <InputWithActions placeholder="Selecione um setor" value={selectedSetor?.nome || ''} onSearchClick={() => setIsSetorModalOpen(true)} onClearClick={() => handleSelectSetor(null)} disabled={!selectedUnidade || isEditing} />
                                </div>
                                {selectedSetor && (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-2 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">4. Selecione o Funcionário *</label>
                                        <SingleSelectFuncionarioList
                                            funcionarios={funcionarios}
                                            loading={loadingFuncionarios}
                                            selectedFuncionario={selectedFuncionario}
                                            onSelectFuncionario={handleSelectFuncionario}
                                            currentPage={funcionariosCurrentPage}
                                            totalPages={funcionariosTotalPages}
                                            onPageChange={setFuncionariosCurrentPage}
                                            disabled={isEditing}
                                        />
                                    </div>
                                )}
                            </FormSection>
                        </fieldset>

                        {selectedFuncionario && (
                            <FormSection title="Dados do Funcionário" gridCols="lg:grid-cols-3">
                                <InfoField label="Nome do Funcionário" value={selectedFuncionario.nome} />
                                <InfoField label="CPF" value={selectedFuncionario.cpf} />
                                <InfoField label="Data de Admissão" value={new Date(selectedFuncionario.dataAdmissao).toLocaleDateString('pt-BR')} />
                            </FormSection>
                        )}

                        <FormSection title="Dados da Avaliação">
                            <InputField label="Altura (m)*" name="altura" value={formData.altura} onChange={handleInputChange} type="number" placeholder="Ex: 1.75" />
                            <InputField label="Peso (kg)*" name="peso" value={formData.peso} onChange={handleInputChange} type="number" placeholder="Ex: 78.5" />
                            <InputField label="Data do Exame *" name="dataExame" value={formData.dataExame} onChange={handleInputChange} type="date" />
                            <SelectField label="Tipo de Exame *" name="tipoExame" value={formData.tipoExame} onChange={handleInputChange} options={[{ value: 'ADMISSIONAL', label: 'Admissional' }, { value: 'PERIODICO', label: 'Periódico' }, { value: 'DEMISSIONAL', label: 'Demissional' }, { value: 'RETORNO_TRABALHO', label: 'Retorno ao Trabalho' }, { value: 'MUDANCA_RISCO', label: 'Mudança de Risco' }]} />
                        </FormSection>

                        <FormSection title="Valores Encontrados">
                            <InputField label="PEF *" name="pef" value={formData.pef} onChange={handleInputChange} type="number" />
                            <InputField label="FEV 1 *" name="fev1" value={formData.fev1} onChange={handleInputChange} type="number" />
                            <InputField label="FVC *" name="fvc" value={formData.fvc} onChange={handleInputChange} type="number" />
                            <InfoField label="FEV 1 / FVC *" value={`${fev1FvcRatio}%`} />
                        </FormSection>

                        <FormSection title="Vincular Aparelho Utilizado *" gridCols="lg:grid-cols-1">
                             <InputWithActions placeholder="Selecione um aparelho" value={selectedAparelho?.descricao || ''} onSearchClick={() => setIsAparelhoModalOpen(true)} onClearClick={() => { setSelectedAparelho(null); setFormData(prev => ({ ...prev, aparelhoUtilizadoId: '' })); }} />
                        </FormSection>

                        <FormSection title="Conclusão" gridCols="lg:grid-cols-1">
                            <div className="flex items-center space-x-6">
                                <RadioOption name="conclusao" value="NORMAL" checked={formData.conclusao === 'NORMAL'} onChange={handleInputChange} label="Espirometria dentro dos valores da normalidade" />
                                <RadioOption name="conclusao" value="OUTROS" checked={formData.conclusao === 'OUTROS'} onChange={handleInputChange} label="Outros" />
                            </div>
                            {formData.conclusao === 'OUTROS' && (
                                <textarea name="outraConclusao" value={formData.outraConclusao} onChange={handleInputChange} placeholder="Descreva a outra conclusão..." className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
                            )}
                        </FormSection>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => navigate('/medicina/espirometria')} className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition-colors">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />} 
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EmpresaSearchModal isOpen={isEmpresaModalOpen} onClose={() => setIsEmpresaModalOpen(false)} onSelect={handleSelectEmpresa} />
            {selectedEmpresa && <UnidadesOperacionaisModal isOpen={isUnidadeModalOpen} onClose={() => setIsUnidadeModalOpen(false)} onSelect={handleSelectUnidade} empresaId={selectedEmpresa.id} />}
            {selectedUnidade && <SetorSearchModal isOpen={isSetorModalOpen} onClose={() => setIsSetorModalOpen(false)} onSelect={handleSelectSetor} empresaId={selectedEmpresa.id} unidadeId={selectedUnidade.id} />}
            <AparelhagemLtcatModal isOpen={isAparelhoModalOpen} onClose={() => setIsAparelhoModalOpen(false)} onSelect={handleSelectAparelho} />

            {/* Confirmation Modal for Conclusion Change */}
            {showConclusionConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Confirmar Alteração</h3>
                        <p className="mt-2 text-sm text-gray-500">Você tem certeza? Ao marcar esta opção, o texto da conclusão personalizada será excluído.</p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button type="button" onClick={() => setShowConclusionConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button type="button" onClick={handleConfirmConclusionChange} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Salvo com Sucesso!</h3>
                        <p className="text-gray-600">A avaliação foi salva e você será redirecionado.</p>
                    </div>
                </div>
            )}
        </>
    );
}