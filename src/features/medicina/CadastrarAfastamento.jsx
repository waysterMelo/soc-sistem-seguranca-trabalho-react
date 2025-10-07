import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Search, Save, X, ArrowLeft, User, CheckCircle
} from 'lucide-react';

import afastamentoService from '../../api/services/medicina/afastamentoService';
import funcionarioService from '../../api/services/cadastros/funcionariosServices.js';
import EmpresaSearchModal from '../../components/modal/empresaSearchModal';
import UnidadesOperacionaisModal from '../../components/modal/unidadesOperacionaisModal';
import SetorSearchModal from '../../components/modal/SetorSearchModal';
import CidSearchModal from '../../components/modal/CidSearchModal';
import MotivoAfastamentoSearchModal from '../../components/modal/MotivoAfastamentoSearchModal';
import RegistroProfissionalSearchModal from '../../components/modal/PrestadorServico.jsx';


const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10 disabled:bg-gray-100" />
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

const RadioOption = (props) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" {...props} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{props.label}</span>
    </label>
);

const CheckboxOption = ({ label, ...props }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" {...props} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

const InputWithActions = ({ placeholder, value, onSearchClick, onClearClick, disabled = false }) => (
    <div className="relative">
        <input type="text" placeholder={placeholder} value={value} readOnly onClick={!disabled ? onSearchClick : undefined} className={`w-full appearance-none bg-white pl-4 pr-20 py-2 border border-gray-300 rounded-md h-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer focus:ring-2 focus:ring-blue-500'}`} />
        <div className="absolute right-0 top-0 h-full flex items-center">
            <button type="button" onClick={onSearchClick} disabled={disabled} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-l-md disabled:bg-gray-400"><Search size={18} /></button>
            <button type="button" onClick={onClearClick} disabled={disabled} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-r-md disabled:bg-gray-400"><X size={18} /></button>
        </div>
    </div>
);

const SingleSelectFuncionarioList = ({ funcionarios, loading, selectedFuncionario, onSelectFuncionario, disabled = false, isEditing = false }) => {
    if (loading && !isEditing) return <div className="text-center p-4">Carregando funcionários...</div>;

    const displayList = (funcionarios.length > 0) ? funcionarios : (selectedFuncionario ? [selectedFuncionario] : []);

    if (displayList.length === 0) {
        return <div className="text-center p-4 bg-gray-50 rounded-md">Nenhum funcionário encontrado.</div>;
    }

    return (
        <div className={`space-y-3 mt-4 max-h-96 overflow-y-auto ${disabled ? 'opacity-50' : ''}`}>
            {displayList.map((func) => {
                const isSelected = selectedFuncionario?.id === func.id;
                return (
                    <div key={func.id} onClick={() => !disabled && onSelectFuncionario(func)} className={`flex items-center p-3 border rounded-lg transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                            {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">{func.nome} {func.sobrenome}</span>
                            <div className="text-sm text-gray-500">CPF: {func.cpf}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Main Component ---

export default function CadastrarAfastamento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        funcionarioId: '',
        registroProfissionalId: '',
        motivoAfastamentoId: '',
        cidId: '',
        tipoAcidente: 'NAO_INFORMADO',
        cnpj: '',
        onusRemuneracao: 'EMPREGADOR',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        observacao: '',
        mesmaDoenca60Dias: false,
        alterarStatusFuncionario: true,
        exibirRgAtestado: false,
        exibirCpfAtestado: true,
        tipoRetificacao: 'ORIGINAL',
        numeroReciboEsocial: ''
    });

    // Selection states
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [selectedUnidade, setSelectedUnidade] = useState(null);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);
    const [selectedMotivo, setSelectedMotivo] = useState(null);
    const [selectedCid, setSelectedCid] = useState(null);
    const [selectedRegistro, setSelectedRegistro] = useState(null);

    // Modal states
    const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
    const [isUnidadeModalOpen, setIsUnidadeModalOpen] = useState(false);
    const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
    const [isCidModalOpen, setIsCidModalOpen] = useState(false);
    const [isMotivoModalOpen, setIsMotivoModalOpen] = useState(false);
    const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Employee list states
    const [funcionarios, setFuncionarios] = useState([]);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);

    // General states
    const [isSaving, setIsSaving] = useState(false);

    const formatCNPJ = (cnpj) => {
        if (!cnpj) return '';
        const cnpjOnlyNumbers = cnpj.replace(/[^\d]/g, '');
        if (cnpjOnlyNumbers.length !== 14) return cnpj; // Return original if not a valid length
        return cnpjOnlyNumbers.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            '$1.$2.$3/$4-$5'
        );
    };

    // Fetch employees when sector changes
    useEffect(() => {
        if (selectedSetor && !isEditing) {
            const fetchFuncionarios = async () => {
                setLoadingFuncionarios(true);
                try {
                    const response = await funcionarioService.buscarFuncionariosPorSetor(selectedSetor.id, { page: 0, size: 100 });
                    setFuncionarios(response.data.content || []);
                } catch (error) { toast.error("Erro ao buscar funcionários."); }
                finally { setLoadingFuncionarios(false); }
            };
            fetchFuncionarios();
        } else {
            setFuncionarios([]);
        }
    }, [selectedSetor, isEditing]);

    // Fetch data for editing
    useEffect(() => {
        if (isEditing && id) {
            const fetchDataForEdit = async () => {
                try {
                    const data = await afastamentoService.getById(id);
                    const funcResponse = await funcionarioService.getById(data.funcionario.id);
                    
                    // Explicitly set IDs in formData to ensure validation passes on save
                    setFormData({
                        ...data,
                        funcionarioId: funcResponse.data.id,
                        registroProfissionalId: data.emitente?.id,
                        motivoAfastamentoId: data.motivoAfastamento?.id,
                        cidId: data.cid?.id
                    });

                    setSelectedFuncionario(funcResponse.data);
                    setSelectedCid(data.cid);
                    setSelectedMotivo(data.motivoAfastamento);
                    setSelectedRegistro(data.emitente);
                    setSelectedEmpresa(funcResponse.data.empresa);
                    setSelectedUnidade(funcResponse.data.unidade);
                    setSelectedSetor(funcResponse.data.setor);

                } catch (error) {
                    console.error("Error fetching data for edit:", error);
                    toast.error('Erro ao carregar dados para edição.');
                }
            };
            fetchDataForEdit();
        }
    }, [id, isEditing]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectFuncionario = (funcionario) => {
        setSelectedFuncionario(funcionario);
        setFormData(prev => ({ ...prev, funcionarioId: funcionario.id, cnpj: funcionario.empresa.cpfOuCnpj }));
    };

    const handleSave = async () => {
        if (!formData.funcionarioId) {
            toast.warn("Por favor, selecione um funcionário.");
            return;
        }
        if (!formData.motivoAfastamentoId) {
            toast.warn("Por favor, selecione o motivo do afastamento.");
            return;
        }
        if (!formData.cidId) {
            toast.warn("Por favor, selecione o CID.");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                await afastamentoService.update(id, formData);
            } else {
                await afastamentoService.create(formData);
            }
            setShowSuccessModal(true);
            setTimeout(() => {
                navigate('/medicina/afastamentos');
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao salvar afastamento.';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="mx-auto">
                    <header className="flex items-center mb-6">
                        <button onClick={() => navigate('/medicina/afastamentos')} className="flex items-center text-blue-600 hover:text-blue-800 mr-4 p-2 rounded-full hover:bg-blue-50">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">{isEditing ? 'Editar Afastamento' : 'Cadastrar Afastamento'}</h1>
                    </header>

                    <div className="space-y-6">
                        <fieldset disabled={isEditing}>
                            <FormSection title="1. Seleção de Localização e Funcionário">
                                <InputWithActions placeholder="Selecione uma empresa" value={selectedEmpresa?.razaoSocial || ''} onSearchClick={() => setIsEmpresaModalOpen(true)} onClearClick={() => { setSelectedEmpresa(null); setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionario(null); }} />
                                {!isEditing && <InputWithActions placeholder="Selecione uma unidade" value={selectedUnidade?.nome || ''} onSearchClick={() => setIsUnidadeModalOpen(true)} onClearClick={() => { setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionario(null); }} disabled={!selectedEmpresa} />}
                                <InputWithActions placeholder="Selecione um setor" value={selectedSetor?.nome || ''} onSearchClick={() => setIsSetorModalOpen(true)} onClearClick={() => { setSelectedSetor(null); setSelectedFuncionario(null); }} disabled={!selectedUnidade} />
                                
                                {selectedSetor && (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Funcionário *</label>
                                        <SingleSelectFuncionarioList
                                            funcionarios={funcionarios}
                                            loading={loadingFuncionarios}
                                            selectedFuncionario={selectedFuncionario}
                                            onSelectFuncionario={handleSelectFuncionario}
                                            disabled={isEditing}
                                            isEditing={isEditing}
                                        />
                                    </div>
                                )}
                            </FormSection>
                        </fieldset>

                        <FormSection title="2. Detalhes do Afastamento">
                            <InputWithActions label="Registro Profissional (Emitente) *" placeholder="Selecione o profissional" value={selectedRegistro?.nome || ''} onSearchClick={() => setIsRegistroModalOpen(true)} onClearClick={() => { setSelectedRegistro(null); setFormData(p => ({...p, registroProfissionalId: ''})) }} />
                            <InputWithActions label="Motivo do Afastamento *" placeholder="Selecione o motivo" value={selectedMotivo?.descricao || ''} onSearchClick={() => setIsMotivoModalOpen(true)} onClearClick={() => { setSelectedMotivo(null); setFormData(p => ({...p, motivoAfastamentoId: ''})) }} />
                            <InputWithActions label="CID *" placeholder="Selecione o CID" value={selectedCid ? `${selectedCid.codigo} - ${selectedCid.descricao}` : ''} onSearchClick={() => setIsCidModalOpen(true)} onClearClick={() => { setSelectedCid(null); setFormData(p => ({...p, cidId: ''})) }} />
                            <SelectField label="Tipo de Acidente" name="tipoAcidente" value={formData.tipoAcidente} onChange={handleInputChange} options={[{value: "NAO_INFORMADO", label: "Não Informado"}, {value: "ATROPELAMENTO", label: "Atropelamento"}, {value: "COLISAO", label: "Colisão"}, {value: "OUTROS", label: "Outros"}]} />
                            <InputField label="CNPJ da Empresa" name="cnpj" value={formatCNPJ(formData.cnpj)} onChange={handleInputChange} disabled />
                            <SelectField label="Ônus da Remuneração *" name="onusRemuneracao" value={formData.onusRemuneracao} onChange={handleInputChange} options={[{value: "EMPREGADOR", label: "Empregador"}, {value: "INSS", label: "INSS"}]} />
                            <InputField label="Início do Afastamento *" name="dataInicio" value={formData.dataInicio} onChange={handleInputChange} type="date" />
                            <InputField label="Final do Afastamento *" name="dataFim" value={formData.dataFim} onChange={handleInputChange} type="date" />
                            <InputField label="Observação" name="observacao" value={formData.observacao} onChange={handleInputChange} />
                            <InputField label="Nº Recibo eSocial (Retificação)" name="numeroReciboEsocial" value={formData.numeroReciboEsocial} onChange={handleInputChange} />
                        </FormSection>

                        <FormSection title="3. Opções Adicionais">
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">O afastamento decorre da mesma doença que gerou o afastamento anterior, dentro de 60 dias?</p>
                                    <div className="flex gap-4">
                                        <RadioOption name="mesmaDoenca60Dias" checked={formData.mesmaDoenca60Dias === true} onChange={() => setFormData(p=>({...p, mesmaDoenca60Dias: true}))} label="Sim" />
                                        <RadioOption name="mesmaDoenca60Dias" checked={formData.mesmaDoenca60Dias === false} onChange={() => setFormData(p=>({...p, mesmaDoenca60Dias: false}))} label="Não" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <CheckboxOption label="Alterar status do funcionário para afastado" name="alterarStatusFuncionario" checked={formData.alterarStatusFuncionario} onChange={handleInputChange} />
                                    <CheckboxOption label="Exibir RG do funcionário no atestado" name="exibirRgAtestado" checked={formData.exibirRgAtestado} onChange={handleInputChange} />
                                    <CheckboxOption label="Exibir CPF do funcionário no atestado" name="exibirCpfAtestado" checked={formData.exibirCpfAtestado} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Retificação</label>
                                    <div className="flex gap-4">
                                        <RadioOption name="tipoRetificacao" value="ORIGINAL" checked={formData.tipoRetificacao === 'ORIGINAL'} onChange={handleInputChange} label="Original" />
                                        <RadioOption name="tipoRetificacao" value="RETIFICACAO" checked={formData.tipoRetificacao === 'RETIFICACAO'} onChange={handleInputChange} label="Retificação" />
                                    </div>
                                </div>
                            </div>
                        </FormSection>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => navigate('/medicina/afastamentos')} className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />} 
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals de Busca */}
            <EmpresaSearchModal isOpen={isEmpresaModalOpen} onClose={() => setIsEmpresaModalOpen(false)} onSelect={(empresa) => { setSelectedEmpresa(empresa); setSelectedUnidade(null); setSelectedSetor(null); setSelectedFuncionario(null); setIsEmpresaModalOpen(false); }} />
            {selectedEmpresa && <UnidadesOperacionaisModal isOpen={isUnidadeModalOpen} onClose={() => setIsUnidadeModalOpen(false)} onSelect={(unidade) => { setSelectedUnidade(unidade); setSelectedSetor(null); setSelectedFuncionario(null); setIsUnidadeModalOpen(false); }} empresaId={selectedEmpresa.id} />}
            {selectedUnidade && <SetorSearchModal isOpen={isSetorModalOpen} onClose={() => setIsSetorModalOpen(false)} onSelect={(setor) => { setSelectedSetor(setor); setSelectedFuncionario(null); setIsSetorModalOpen(false); }} empresaId={selectedEmpresa.id} unidadeOperacionalId={selectedUnidade.id} />}
            {isCidModalOpen && <CidSearchModal isOpen={isCidModalOpen} onClose={() => setIsCidModalOpen(false)} onSelect={(cid) => { setSelectedCid(cid); setFormData(prev => ({ ...prev, cidId: cid.id })); setIsCidModalOpen(false); }} />}
            {isMotivoModalOpen && <MotivoAfastamentoSearchModal isOpen={isMotivoModalOpen} onClose={() => setIsMotivoModalOpen(false)} onSelect={(motivo) => { setSelectedMotivo(motivo); setFormData(prev => ({ ...prev, motivoAfastamentoId: motivo.id })); setIsMotivoModalOpen(false); }} />}
            {isRegistroModalOpen && <RegistroProfissionalSearchModal isOpen={isRegistroModalOpen} onClose={() => setIsRegistroModalOpen(false)} onSelect={(registro) => { setSelectedRegistro(registro); setFormData(prev => ({ ...prev, registroProfissionalId: registro.id })); setIsRegistroModalOpen(false); }} />}

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{isEditing ? 'Atualizado com Sucesso!' : 'Salvo com Sucesso!'}</h3>
                        <p className="text-gray-600">{isEditing ? 'O afastamento foi atualizado e você será redirecionado.' : 'O afastamento foi salvo e você será redirecionado.'}</p>
                    </div>
                </div>
            )}
        </>
    );
}