import React, { useState } from 'react';
import {
    Search,
    Trash2,
    Info, XCircle, AlertTriangle, CheckCircle2, X, Check, AlertCircle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { unidadeService } from "../../../api/services/cadastros/serviceUnidadeOperacional.js";
import EmpresaSearchModal from "../../../components/modal/empresaSearchModal.jsx";
import CnaeSearchModal from "../../../components/modal/cnaeSearchModal.jsx";
import SetorSearchModal from "../../../components/modal/setorSearchModal.jsx";
import apiService from "../../../api/apiService.js";

// Wrapper para seções do formulário
const FormSection = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md mb-8 ${className}`}>
        {title && <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

// Wrapper para campos de formulário (label + input)
const FormField = ({ label, required, children, className = '', error }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

// Input com botões de ação (como busca e exclusão)
const InputWithActions = ({ placeholder, value, onChange, name, disabled = false, actions }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={onChange}
            name={name}
            className={`w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none transition-colors ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'
            }`}
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// Componente para exibir chips de setores selecionados
const SetorChips = ({ setores, onRemove }) => {
    if (!setores || setores.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {setores.map((setor) => (
                <div 
                    key={setor.id} 
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded flex items-center"
                >
                    {setor.nome}
                    <button 
                        type="button"
                        className="ml-1.5 text-blue-700 hover:text-blue-900"
                        onClick={() => onRemove(setor.id)}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

const NotificationModal = ({ isOpen, onClose, type, message }) => {
    if (!isOpen) return null;
    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = type === 'success' ?
        <CheckCircle2 className="text-green-500 h-6 w-6" /> :
        <XCircle className="text-red-500 h-6 w-6" />;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-30">
            <div className={`max-w-md w-full p-6 rounded-lg shadow-xl border ${borderColor} ${bgColor}`}>
                <div className="flex items-center mb-4">
                    {icon}
                    <h3 className={`ml-3 text-lg font-medium ${textColor}`}>
                        {type === 'success' ? 'Sucesso!' : 'Erro!'}
                    </h3>
                </div>
                <div className={`mb-4 ${textColor}`}>
                    <p>{message}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                            type === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CadastrarUnidade() {
    const [useCompanyAddress, setUseCompanyAddress] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [salvando, setSalvando] = useState(false);
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showCnaeModal, setShowCnaeModal] = useState(false);
    const [showSetorModal, setShowSetorModal] = useState(false);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [setoresSelecionados, setSetoresSelecionados] = useState([]);
    const [unidade, setUnidade] = useState({
        nome: '',
        descricao: '',
        situacao: 'ATIVO', // Valor padrão
        empresa: null, // ou { id: null, razaoSocial: '' }
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        regiao: '',
        usarEnderecoEmpresa: false,
        emailContato: '',
        dddTelefone1: '',
        numeroTelefone1: '',
        dddTelefone2: '',
        numeroTelefone2: '',
        grauRisco: '',
        cnaePrincipal: null,
        alocadaEmEmpresaTerceira: false,
        tipoConfiguracaoUnidade: 'MATRIZ', // Valor padrão se aplicável
        cnpjEmpresaTerceira: '',
        razaoSocialEmpresaTerceira: '',
        // setores: [] // Se for necessário vincular setores no cadastro inicial
    });
    const [notificacao, setNotificacao] = useState({
        isOpen: false,
        type: 'success',
        message: ''
    });
    const [cnaePrincipal, setCnaePrincipal] = useState(null);
    const [formData, setFormData] = useState({
        // Informações da unidade
        nome: '',
        descricao: '',
        situacao: 'ATIVO', // Valor padrão como string
        empresaId: null, // ou um ID válido se já souber

        // Endereço
        cep: '',
        cidade: '',
        estado: '',
        logradouro: '',
        numero: '', // Pode ser string ou número, string é mais comum para formulários
        bairro: '',
        complemento: '',
        regiao: '',
        usarEnderecoEmpresa: false, // Booleano

        // Contato
        // A API separa DDD e número, então talvez seja melhor refletir isso
        dddTelefone1: '',
        numeroTelefone1: '',
        dddTelefone2: '',
        numeroTelefone2: '',
        emailContato: '',

        // Outras informações
        grauRisco: '', // Começa vazio, assume valor 'RISCO_1', 'RISCO_2', etc.
        cnaePrincipalId: null, // ID do CNAE principal
        tipoConfiguracaoUnidade: 'MATRIZ', // Valor padrão
        alocadaEmEmpresaTerceira: false, // Booleano
        cnpjEmpresaTerceira: null, // ou string vazia ''
        razaoSocialEmpresaTerceira: null, // ou string vazia ''
        setoresIds: [] // Array de IDs de setores vinculados
    });
    
    const handleCnaeSelect = (cnae) => {
        setCnaePrincipal(cnae);
        const cnaeId = typeof cnae.id === 'string' ? parseInt(cnae.id, 10) : cnae.id;
        setFormData(prevState => ({
            ...prevState,
            cnaePrincipalId: cnaeId
        }));
        setShowCnaeModal(false);
    }
    
    const handleEmpresaSelect = (empresa) => {
        setEmpresaSelecionada(empresa);
        setFormData(prevState => ({
            ...prevState,
            empresaId: empresa.id
        }));
        setShowEmpresaModal(false);
    }
    
    const handleSetoresSelect = (setores) => {
        setSetoresSelecionados(setores);
        setFormData(prevState => ({
            ...prevState,
            setoresIds: setores.map(setor => setor.id)
        }));
    }
    
    const handleRemoveSetor = (setorId) => {
        setSetoresSelecionados(prev => prev.filter(setor => setor.id !== setorId));
        setFormData(prevState => ({
            ...prevState,
            setoresIds: prevState.setoresIds.filter(id => id !== setorId)
        }));
    }
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [apiError, setApiError] = useState(null);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]){
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validarForm = () => {
        const newErros = {};

        if (!formData.situacao) newErros.status = 'Situação da empresa é obrigatória.';
        if (!formData.nome) newErros.nome = 'Nome da unidade é obrigatório.';
        if (!formData.empresaId) newErros.empresaId = 'Empresa é obrigatória.';
        if (!formData.cep) newErros.cep = 'CEP da unidade é obrigatório.';
        if (!formData.cidade) newErros.cidade = 'Cidade da unidade é obrigatória.';
        if (!formData.logradouro) newErros.logradouro = 'Logradouro da unidade é obrigatório.';
        if (!formData.numero) newErros.numero = 'Número da unidade é obrigatório.';
        if (!formData.bairro) newErros.bairro = 'Bairro da unidade é obrigatório.';

        setErrors(newErros);
        return Object.keys(newErros).length === 0;
    }

    const handleSubmit = async (e) => {
        console.log('Formulário submetido', formData);
        e.preventDefault();

        if (!validarForm()){
            return;
        }
        setSalvando(true);
        setApiError(null);

        try {
            const dados = {
                ...formData
            };

            const response = await unidadeService.create(dados);
            setShowSuccessModal(true);
        } catch (error) {
            console.log('Erro ao cadastrar unidade: ', error);
            setApiError(error.response?.data?.message || 'Não foi possível cadastrar a unidade. Por favor, tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    const limparEmpresa = () => {
        setEmpresaSelecionada(null);
        setSetoresSelecionados([]);
        setFormData(prev => ({
            ...prev,
            empresaId: null,
            setoresIds: []

        }));
        // Limpar também os setores, pois estão vinculados à empresa
        setSetoresSelecionados([]);
        setFormData(prev => ({
            ...prev,
            setoresIds: []
        }));
    }

    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Sucesso!</h3>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <Check size={24} className="text-green-600" />
                        </div>
                        <p className="text-center text-gray-700">
                            Unidade operacional cadastrada com sucesso!
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/cadastros/listar/unidades');
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            {/* Modais */}
            <CnaeSearchModal
                isOpen={showCnaeModal}
                onClose={() => setShowCnaeModal(false)}
                onCnaeSelect={handleCnaeSelect}
            />
            
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleEmpresaSelect}
            />
            
            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelectMultiple={handleSetoresSelect}
                empresaId={empresaSelecionada?.id}
                multiSelect={true}
            />
            
            <SuccessModal />
            
            <div className="container mx-auto">
                <header className="mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Unidade Operacional</h1>
                        <button
                            type="button"
                            onClick={() => navigate(-1)} // Volta para a página anterior
                            className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Voltar
                        </button>
                    </div>
                </header>

                {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                        <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Erro ao cadastrar unidade</p>
                            <p className="text-sm">{apiError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Seção Informações da unidade */}
                    <FormSection title="Informações da unidade">
                        <FormField label="Empresa" required className="lg:col-span-2" error={errors.empresaId}>
                            <InputWithActions
                                placeholder="Selecione uma empresa"
                                value={empresaSelecionada ? `${empresaSelecionada.razaoSocial}${empresaSelecionada.nomeFantasia ? ` (${empresaSelecionada.nomeFantasia})` : ''}` : ''}
                                disabled={true}
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowEmpresaModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        {empresaSelecionada && (
                                            <button 
                                                type="button" 
                                                className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                                onClick={limparEmpresa}
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        )}
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="Nome da Unidade" required className="lg:col-span-1" error={errors.nome}>
                            <input 
                                type="text" 
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                        <FormField label="Situação da Unidade Operacional" required className="lg:col-span-1" error={errors.situacao}>
                            <select 
                                name="situacao"
                                value={formData.situacao}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </FormField>
                        <FormField label="Descrição da Unidade" className="lg:col-span-4">
                            <textarea 
                                rows="3" 
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </FormField>
                    </FormSection>

                    {/* Seção Setores a serem vinculados */}
                    <FormSection title="Setores a serem vinculados à unidade operacional">
                        <FormField label="Setores" className="lg:col-span-4">
                            <InputWithActions
                                placeholder="Selecione os setores para vincular à unidade"
                                disabled={true}
                                value=""
                                actions={
                                    <>
                                        <button 
                                            type="button" 
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-r-md"
                                            onClick={() => setShowSetorModal(true)}
                                            disabled={!empresaSelecionada}
                                        >
                                            <Search size={18}/>
                                        </button>
                                    </>
                                }
                            />
                            <SetorChips 
                                setores={setoresSelecionados} 
                                onRemove={handleRemoveSetor} 
                            />
                            {!empresaSelecionada && (
                                <p className="text-sm text-amber-600 mt-1">
                                    Selecione uma empresa primeiro para poder vincular setores
                                </p>
                            )}
                        </FormField>
                    </FormSection>


                    {/* Seção Endereço (condicional) */}
                    {!useCompanyAddress && (
                        <FormSection title="Endereço">
                            <FormField label="CEP" className="lg:col-span-1" error={errors.cep}>
                                <input 
                                    type="text" 
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Cidade" className="lg:col-span-2" error={errors.cidade}>
                                <input 
                                    type="text" 
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Estado" className="lg:col-span-1" error={errors.estado}>
                                <select 
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="">Selecione</option>
                                    <option value="AC">Acre</option>
                                    <option value="AL">Alagoas</option>
                                    <option value="AP">Amapá</option>
                                    <option value="AM">Amazonas</option>
                                    <option value="BA">Bahia</option>
                                    <option value="CE">Ceará</option>
                                    <option value="DF">Distrito Federal</option>
                                    <option value="ES">Espírito Santo</option>
                                    <option value="GO">Goiás</option>
                                    <option value="MA">Maranhão</option>
                                    <option value="MT">Mato Grosso</option>
                                    <option value="MS">Mato Grosso do Sul</option>
                                    <option value="MG">Minas Gerais</option>
                                    <option value="PA">Pará</option>
                                    <option value="PB">Paraíba</option>
                                    <option value="PR">Paraná</option>
                                    <option value="PE">Pernambuco</option>
                                    <option value="PI">Piauí</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="RN">Rio Grande do Norte</option>
                                    <option value="RS">Rio Grande do Sul</option>
                                    <option value="RO">Rondônia</option>
                                    <option value="RR">Roraima</option>
                                    <option value="SC">Santa Catarina</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="SE">Sergipe</option>
                                    <option value="TO">Tocantins</option>
                                </select>
                            </FormField>
                            <FormField label="Logradouro" className="lg:col-span-3" error={errors.logradouro}>
                                <input 
                                    type="text" 
                                    name="logradouro"
                                    value={formData.logradouro}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Número" className="lg:col-span-1" error={errors.numero}>
                                <input 
                                    type="text" 
                                    name="numero"
                                    value={formData.numero}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Bairro" className="lg:col-span-2" error={errors.bairro}>
                                <input 
                                    type="text" 
                                    name="bairro"
                                    value={formData.bairro}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Complemento" className="lg:col-span-1">
                                <input 
                                    type="text" 
                                    name="complemento"
                                    value={formData.complemento}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                            <FormField label="Região" className="lg:col-span-1">
                                <input 
                                    type="text" 
                                    name="regiao"
                                    value={formData.regiao}
                                    onChange={handleChange}
                                    disabled={useCompanyAddress} 
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                                />
                            </FormField>
                        </FormSection>
                    )}

                    {/* Seção Informações de Contato */}
                    <FormSection title="Informações de Contato">
                        <FormField label="DDD" className="lg:col-span-1">
                            <input 
                                type="text" 
                                name="dddTelefone1"
                                value={formData.dddTelefone1}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                        <FormField label="Número" className="lg:col-span-1">
                            <input 
                                type="text" 
                                name="numeroTelefone1"
                                value={formData.numeroTelefone1}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                        <FormField label="DDD" className="lg:col-span-1">
                            <input 
                                type="text" 
                                name="dddTelefone2"
                                value={formData.dddTelefone2}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                        <FormField label="Número" className="lg:col-span-1">
                            <input 
                                type="text" 
                                name="numeroTelefone2"
                                value={formData.numeroTelefone2}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                        <FormField label="Endereço de E-mail" className="lg:col-span-4">
                            <input 
                                type="email" 
                                name="emailContato"
                                value={formData.emailContato}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Outras Informações */}
                    <FormSection title="Outras Informações">
                        <FormField label="Grau de Risco" className="lg:col-span-1">
                            <select
                                name="grauRisco"
                                value={formData.grauRisco}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="NAO_INFORMADO">Não Informado</option>
                                <option value="RISCO_1">1 - Baixo</option>
                                <option value="RISCO_2">2 - Médio</option>
                                <option value="RISCO_3">3 - Alto</option>
                                <option value="RISCO_4">4 - Muito Alto</option>
                            </select>
                        </FormField>
                        <FormField label="CNAE Principal" className="lg:col-span-3">
                            <InputWithActions
                                name="cnaePrincipal"
                                value={cnaePrincipal ? `${cnaePrincipal.codigo} - ${cnaePrincipal.descricao}` : ''}
                                disabled={true}
                                onChange={handleChange}
                                placeholder="0111-3/99 - Cultivo de outros..."
                                actions={
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCnaeModal(true)}
                                        className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600 rounded-r-md"
                                    >
                                        <Search size={18}/>
                                    </button>
                                </>
                            }/>
                        </FormField>
                    </FormSection>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button 
                            type="button" 
                            onClick={() => navigate('/cadastros/nova-unidade')}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={salvando}
                            className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400"
                        >
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}