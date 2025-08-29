import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Search, Trash2, AlertCircle, HelpCircle, ArrowLeft} from 'lucide-react';
import {prestadorServicoService} from '../../../api/services/cadastros/prestadorServicoService.js';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';
import CboModal from '../../../components/modal/CboModal.jsx';
import {conselhos, estados, sexos} from '../../../utils/constants';
import useCpfMask from '../../../hooks/useCpfMask';

// --- Componentes Reutilizáveis ---

const FormSection = ({title, children}) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
            {children}
        </div>
    </div>
);

const FormField = ({label, required, children, className = '', error}) => (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error &&
            <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={14} className="mr-1"/>{error}
            </p>}
    </div>
);

const InputWithActions = ({value, placeholder, actions, error}) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            readOnly
            className={`w-full py-2 pl-4 pr-20 border rounded-md focus:outline-none transition-colors bg-gray-100 cursor-default ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// --- Componente Principal ---

export default function CadastrarPrestador() {
    const navigate = useNavigate();
    const {id} = useParams();
    const isEditing = !!id;
    const [formData, setFormData] = useState({
        nome: '',
        sobrenome: '',
        cpf: '',
        rg: '',
        orgaoEmissorRg: '',
        sexo: 'NAO_INFORMADO',
        endereco: {
            cep: '',
            cidade: '',
            estado: '',
            logradouro: '',
            numero: '',
            bairro: '',
            complemento: '',
            regiao: ''
        },
        telefone1: '',
        telefone2: '',
        email: '',
        cbo: {id: null, codigo: '', descricao: ''},
        nis: '',
        conselho: 'NAO_SE_APLICA',
        numeroInscricaoConselho: '',
        estadoConselho: ''
    });
    const [selectedCbo, setSelectedCbo] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isCboModalOpen, setCboModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const {masked: cpfMasked, handleChange: handleCpfChange} = useCpfMask();


    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            prestadorServicoService.getById(id)
                .then(response => {
                    const data = response.data;
                    setFormData({
                        ...data,
                        endereco: data.endereco || formData.endereco
                    });


                    if (data.cboId) {
                        funcaoService.retornarCbo(data.cboId)
                            .then(cboResponse => {
                                setSelectedCbo(cboResponse.data);
                            })
                            .catch(cboError => {
                                console.error("Falha ao buscar detalhes do CBO:", cboError);
                                toast.warn("Não foi possível carregar os detalhes do CBO.");
                            });
                    }
                })
                .catch(error => {
                    toast.error("Erro ao carregar dados do prestador.");
                    console.error(error);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'cpf') {
            setFormData(prev => ({...prev, [name]: value}));
            const rawCpf = handleCpfChange(e);
            setFormData(prev => ({...prev, cpf: rawCpf}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handleEnderecoChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            endereco: {...prev.endereco, [name]: value}
        }));
    };

    const handleCboSelect = (cbo) => {
        setFormData(prev => ({
            ...prev,
            cboId: cbo.id,
            cbo
        }));
        setCboModalOpen(false);
    };

    const clearCbo = () => {
        setFormData(prev => ({...prev, cboId: null}));
        setSelectedCbo(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nome.trim()) newErrors.nome = 'O campo Nome é obrigatório';
        if (!formData.sobrenome.trim()) newErrors.sobrenome = 'O campo Sobrenome é obrigatório';
        if (!formData.cboId) newErrors.cbo = 'O campo CBO é obrigatório';
        if (!isValidCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.warn("Por favor, preencha os campos obrigatórios.");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await prestadorServicoService.update(id, formData);
            } else {
                await prestadorServicoService.create(formData);
            }
            setShowSuccessModal(true);
            setTimeout(() => {
                navigate('/cadastros/listar/prestadores');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao salvar prestador.");
            console.error(error);
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center p-10">Carregando...</div>;
    }

    const isValidCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[9])) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(cpf[10]);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Cadastrar'} Profissional</h1>
                    <button onClick={() => navigate('/cadastros/listar/prestadores')}
                            className="flex items-center text-gray-600 hover:text-gray-800">
                        <ArrowLeft size={20} className="mr-2"/> Voltar
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <FormSection title="Informações Básicas">
                        <FormField label="Nome" required className="lg:col-span-2" error={errors.nome}>
                            <input name="nome" value={formData.nome} onChange={handleInputChange}
                                   placeholder="Primeiro Nome"
                                   className={`w-full py-2 px-3 border rounded-md ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}/>
                        </FormField>
                        <FormField label="Sobrenome" required className="lg:col-span-2" error={errors.sobrenome}>
                            <input name="sobrenome" value={formData.sobrenome} onChange={handleInputChange}
                                   placeholder="Sobrenome"
                                   className={`w-full py-2 px-3 border rounded-md ${errors.sobrenome ? 'border-red-500' : 'border-gray-300'}`}/>
                        </FormField>
                        <FormField label="Número do CPF" required className="lg:col-span-1" error={errors.cpf}>
                            <input name="cpf" value={cpfMasked}
                                   onChange={handleInputChange}
                                   placeholder="000.000.000-00"
                                   className={`w-full py-2 px-3 border rounded-md ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}/>
                        </FormField>
                        <FormField label="Sexo" required className="lg:col-span-1">
                            <select name="sexo" value={formData.sexo} onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white">
                                {sexos.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Número do RG" className="lg:col-span-1"><input name="rg" value={formData.rg}
                                                                                         onChange={handleInputChange}
                                                                                         type="text"
                                                                                         placeholder="Ex: MG-12.345.678"
                                                                                         className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Órgão Emissor RG" className="lg:col-span-1"><input name="orgaoEmissorRg"
                                                                                             value={formData.orgaoEmissorRg}
                                                                                             onChange={handleInputChange}
                                                                                             type="text"
                                                                                             placeholder="Ex: SSP/MG"
                                                                                             className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                    </FormSection>

                    <FormSection title="Endereço">
                        <FormField label="CEP" className="lg:col-span-1"><input name="cep" value={formData.endereco.cep}
                                                                                onChange={handleEnderecoChange}
                                                                                type="text" placeholder="Ex. 37701-000"
                                                                                className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Cidade" className="lg:col-span-2"><input name="cidade"
                                                                                   value={formData.endereco.cidade}
                                                                                   onChange={handleEnderecoChange}
                                                                                   type="text"
                                                                                   placeholder="Ex. Poços de Caldas"
                                                                                   className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Estado" className="lg:col-span-1">
                            <select name="estado" value={formData.endereco.estado} onChange={handleEnderecoChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white">
                                <option value="">Selecione</option>
                                {estados.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Logradouro" className="lg:col-span-3"><input name="logradouro"
                                                                                       value={formData.endereco.logradouro}
                                                                                       onChange={handleEnderecoChange}
                                                                                       type="text"
                                                                                       placeholder="Digite o Endereço"
                                                                                       className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Número" className="lg:col-span-1"><input name="numero"
                                                                                   value={formData.endereco.numero}
                                                                                   onChange={handleEnderecoChange}
                                                                                   type="text" placeholder="Ex. 0000"
                                                                                   className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Bairro" className="lg:col-span-2"><input name="bairro"
                                                                                   value={formData.endereco.bairro}
                                                                                   onChange={handleEnderecoChange}
                                                                                   type="text" placeholder="Ex. Centro"
                                                                                   className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Complemento" className="lg:col-span-2"><input name="complemento"
                                                                                        value={formData.endereco.complemento}
                                                                                        onChange={handleEnderecoChange}
                                                                                        type="text"
                                                                                        placeholder="Ex. Apto 22"
                                                                                        className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                    </FormSection>

                    <FormSection title="Informações de Contato">
                        <FormField label="Telefone 1" className="lg:col-span-2"><input name="telefone1"
                                                                                       value={formData.telefone1}
                                                                                       onChange={handleInputChange}
                                                                                       type="text"
                                                                                       placeholder="(35) 98765-4321"
                                                                                       className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Telefone 2" className="lg:col-span-2"><input name="telefone2"
                                                                                       value={formData.telefone2}
                                                                                       onChange={handleInputChange}
                                                                                       type="text"
                                                                                       placeholder="(35) 3722-0000"
                                                                                       className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Endereço de E-mail" className="lg:col-span-4"><input name="email"
                                                                                               value={formData.email}
                                                                                               onChange={handleInputChange}
                                                                                               type="email"
                                                                                               placeholder="Ex. exemplo@email.com.br"
                                                                                               className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                    </FormSection>

                    <FormSection title="Outras Informações">
                        <FormField label="CBO" required className="lg:col-span-4" error={errors.cbo}>
                            <InputWithActions
                                value={formData.cbo?.codigo ? `${formData.cbo.codigo} - ${formData.cbo.descricao}` : ''}
                                placeholder="Selecione um CBO"
                                error={errors.cbo}
                                actions={
                                    <>
                                        <button type="button" onClick={() => setCboModalOpen(true)}
                                                className="p-2.5 text-gray-500 hover:text-green-600"><Search size={18}/>
                                        </button>
                                        <button type="button" onClick={clearCbo}
                                                className="p-2.5 text-gray-500 hover:text-red-600"><Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="Número do NIS" className="lg:col-span-1"><input name="nis"
                                                                                          value={formData.nis}
                                                                                          onChange={handleInputChange}
                                                                                          type="text"
                                                                                          placeholder="PIS, PASEP ou NIT"
                                                                                          className="w-full py-2 px-3 border border-gray-300 rounded-md"/></FormField>
                        <FormField label="Conselho" className="lg:col-span-1">
                            <select name="conselho" value={formData.conselho} onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white">
                                {conselhos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Número de Inscrição" className="lg:col-span-1">
                            <input name="numeroInscricaoConselho" value={formData.numeroInscricaoConselho}
                                   onChange={handleInputChange} placeholder="Ex. 00000"
                                   className="w-full py-2 px-3 border border-gray-300 rounded-md"/>
                        </FormField>
                        <FormField label="Estado do Conselho" className="lg:col-span-1">
                            <select name="estadoConselho" value={formData.estadoConselho} onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white">
                                <option value="">Selecione</option>
                                {estados.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                            </select>
                        </FormField>
                    </FormSection>

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={() => navigate('/cadastros/listar/prestadores')}
                                className="bg-gray-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-gray-700 transition-colors">Cancelar
                        </button>
                        <button type="submit" disabled={saving}
                                className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>

            <CboModal isOpen={isCboModalOpen} onClose={() => setCboModalOpen(false)} onSelect={handleCboSelect}/>

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <div className="text-green-600 text-6xl mb-4">✓</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Prestador Salvo com Sucesso!</h3>
                        <p className="text-gray-600">Redirecionando...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
