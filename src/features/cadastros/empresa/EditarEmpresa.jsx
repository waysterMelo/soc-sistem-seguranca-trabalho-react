import React, {useRef, useState, useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Trash2,
    Search,
    Plus,
    AlertCircle,
    ArrowLeft,
    Loader,
    Check
} from 'lucide-react';
import { X } from 'lucide-react';
import { empresaService } from "../../../api/services/cadastros/serviceEmpresas.js";
import CnaeSearchModal from "../../../components/modal/cnaeSearchModal.jsx";
import MedicoSearchModal from "../../../components/modal/medicoSearchModal.jsx";

// Componentes reutilizáveis
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

const FormField = ({ label, required, children, className = '', error }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={14} className="mr-1"/>{error}</p>}
    </div>
);

const InputWithAction = ({ placeholder, actionButton, type = "text", name, value = "", onChange, disabled = false }) => (
    <div className="relative flex items-center">
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <div className="absolute right-0 flex">
            {actionButton}
        </div>
    </div>
);

// Componente principal EditarEmpresa
export default function EditarEmpresa() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        tipoEmpresa: '',
        inscricaoEstadual: '',
        cpfOuCnpj: '',
        status: 'Ativo',
        razaoSocial: '',
        nomeFantasia: '',
        logomarcaUrl: '',
        cep: '',
        cidade: '',
        estado: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        regiao: '',
        telefonePrincipal: '',
        telefoneSecundario: '',
        email: '',
        grauRisco: '',
        cnaePrincipalId: null,
        cnaesSecundarios: [],
        tipoMatrizFilial: 'MATRIZ',
        medicoResponsavelPcmssoId: null,
        observacoes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [cnaePrincipal, setCnaePrincipal] = useState(null);
    const [medicoResponsavel, setMedicoResponsavel] = useState(null);
    const [isCnaeModalOpen, setIsCnaeModalOpen] = useState(false);
    const [isMedicoModalOpen, setIsMedicoModalOpen] = useState(false);
    const [originalLogo, setOriginalLogo] = useState('');

    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                setIsLoading(true);
                const response = await empresaService.getById(id);
                const empresa = response.data;

                setFormData({
                    ...empresa,
                    ...empresa.endereco,
                    grauRisco: empresa.grauRisco || '',
                    endereco: undefined
                });

                setOriginalLogo(empresa.logomarcaUrl);


                if (empresa.cnaePrincipal) {
                    setCnaePrincipal(empresa.cnaePrincipal);
                }


                if (empresa.medicoResponsavel) {
                    setMedicoResponsavel(empresa.medicoResponsavel);
                }

            } catch (error) {
                console.error('Erro ao carregar empresa:', error);
                setApiError('Não foi possível carregar os dados da empresa.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmpresa();
    }, [id, navigate]);

    const handleCnaeSelect = (cnae) => {
        setCnaePrincipal(cnae);
        setFormData(prev => ({
            ...prev,
            cnaePrincipalId: cnae.id
        }));
        setIsCnaeModalOpen(false);
    };

    const handleMedicoSelect = (medico) => {
        setMedicoResponsavel(medico);
        setFormData(prev => ({
            ...prev,
            medicoResponsavelPcmssoId: medico.id
        }));
        setIsMedicoModalOpen(false);
    };

    const clearCnaePrincipal = () => {
        setCnaePrincipal(null);
        setFormData(prev => ({...prev, cnaePrincipalId: null}));
    };

    const clearMedicoResponsavel = () => {
        setMedicoResponsavel(null);
        setFormData(prev => ({...prev, medicoResponsavelPcmssoId: null}));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]){
            const file = e.target.files[0];
            const MAX_FILE_SIZE_MB = 2;
            const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

            if (file.size > MAX_FILE_SIZE_BYTES) {
                setErrors(prev => ({ ...prev, logomarcaUrl: `O arquivo da logomarca não pode exceder ${MAX_FILE_SIZE_MB}MB.` }));
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    logomarcaUrl: event.target.result
                }));
            };
            reader.readAsDataURL(file);

            // Limpar erro se existir
            if (errors.logomarcaUrl) {
                setErrors(prev => ({ ...prev, logomarcaUrl: null }));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.tipoEmpresa) newErrors.tipoEmpresa = 'Tipo de empresa é obrigatório';
        if (!formData.razaoSocial) newErrors.razaoSocial = 'Razão Social é obrigatório';
        if (!formData.status) newErrors.status = 'Status é obrigatório';
        if (!formData.cpfOuCnpj) newErrors.cpfOuCnpj = 'CPF/CNPJ é obrigatório';

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Rolar para o primeiro campo com erro
            const firstErrorKey = Object.keys(errors)[0];
            const firstErrorElement = document.querySelector(`[name="${firstErrorKey}"]`);
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);
        setApiError(null);

        try {
            const empresaData = {
                ...formData,
                endereco: {
                    cep: formData.cep,
                    logradouro: formData.logradouro,
                    numero: formData.numero,
                    bairro: formData.bairro,
                    complemento: formData.complemento,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    regiao: formData.regiao
                }
            };

            // Remover propriedades de endereço do objeto principal
            delete empresaData.cep;
            delete empresaData.logradouro;
            delete empresaData.numero;
            delete empresaData.bairro;
            delete empresaData.complemento;
            delete empresaData.cidade;
            delete empresaData.estado;
            delete empresaData.regiao;

            // Upload de nova logo se necessário
            if (selectedFile) {
                const fileData = new FormData();
                fileData.append('file', selectedFile);
                const uploadResponse = await empresaService.uploadLogo(fileData);
                empresaData.logomarcaUrl = uploadResponse.data.url;
            } else if (!formData.logomarcaUrl && originalLogo) {
                // Se a logo foi removida
                empresaData.logomarcaUrl = null;
            }

            await empresaService.update(id, empresaData);
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            setApiError(
                error.response?.data?.message ||
                'Não foi possível atualizar a empresa. Por favor, tente novamente.'
            );
            // Rolar para o topo para mostrar o erro
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            Empresa atualizada com sucesso!
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/cadastros/listar/empresas')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={40} />
                    <p className="text-gray-600">Carregando dados da empresa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <CnaeSearchModal
                isOpen={isCnaeModalOpen}
                onClose={() => setIsCnaeModalOpen(false)}
                onCnaeSelect={handleCnaeSelect}
            />
            <MedicoSearchModal
                isOpen={isMedicoModalOpen}
                onClose={() => setIsMedicoModalOpen(false)}
                onMedicoSelect={handleMedicoSelect}
            />
            <SuccessModal />
            <div className="container mx-auto">
                <header className="mb-6">
                    <button
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        onClick={() => navigate('/cadastros/listar/empresas')}
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Voltar para a lista
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Editar Empresa</h1>
                            <p className="text-gray-600 mt-2">
                                Editando: <span className="font-semibold text-blue-600">{formData.razaoSocial}</span>
                            </p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            ID: {id}
                        </div>
                    </div>
                </header>

                {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                        <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Erro ao atualizar empresa</p>
                            <p className="text-sm">{apiError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Seção de Informações Básicas */}
                    <FormSection title="Informações Básicas">
                        <FormField label="Tipo de Empresa" required className="lg:col-span-1" error={errors.tipoEmpresa}>
                            <select
                                name="tipoEmpresa"
                                value={formData.tipoEmpresa}
                                onChange={handleChange}
                                className={`w-full py-2 px-3 border rounded-md bg-white focus:outline-none focus:ring-2 transition-colors ${
                                    errors.tipoEmpresa ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Selecione</option>
                                <option value="JURIDICA">Pessoa Jurídica</option>
                                <option value="FISICA">Pessoa Física</option>
                            </select>
                        </FormField>
                        <FormField label="Número do CPF/CNPJ" required className="lg:col-span-1" error={errors.cpfOuCnpj}>
                            <input
                                type="text"
                                name="cpfOuCnpj"
                                value={formData.cpfOuCnpj}
                                onChange={handleChange}
                                placeholder="Ex. 00.000.000/0000-00"
                                className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errors.cpfOuCnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                        </FormField>
                        <FormField label="Inscrição Estadual" className="lg:col-span-1">
                            <input
                                type="text"
                                name="inscricaoEstadual"
                                value={formData.inscricaoEstadual}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Status" required className="lg:col-span-1" error={errors.status}>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={`w-full py-2 px-3 border rounded-md bg-white focus:outline-none focus:ring-2 transition-colors ${
                                    errors.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Selecione</option>
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </FormField>
                        <FormField label="Razão Social" required className="lg:col-span-2" error={errors.razaoSocial}>
                            <input
                                type="text"
                                name="razaoSocial"
                                placeholder="Digite a razão social da clínica"
                                className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errors.razaoSocial ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                value={formData.razaoSocial}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Nome Fantasia" className="lg:col-span-2">
                            <input
                                type="text"
                                name="nomeFantasia"
                                value={formData.nomeFantasia}
                                onChange={handleChange}
                                placeholder="Digite o nome Fantasia da Clínica"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Logomarca" className="lg:col-span-4" error={errors.logomarcaUrl}>
                            <div className="flex items-center">
                                <label className="flex items-center w-full py-2 px-3 border border-gray-300 rounded-l-md bg-white cursor-pointer">
                                    <span className="text-gray-500">
                                        {selectedFile ? selectedFile.name : "Selecione uma imagem"}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </label>
                                <span
                                    className="bg-gray-100 border-t border-b border-gray-300 text-gray-700 py-2 px-4 text-sm font-medium cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Browse
                                </span>
                                <button
                                    type="button"
                                    className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setFormData(prev => ({
                                            ...prev,
                                            logomarcaUrl: ''
                                        }));
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>

                            {/* Preview da imagem */}
                            {formData.logomarcaUrl && (
                                <div className="mt-2 flex items-center">
                                    <img
                                        src={formData.logomarcaUrl}
                                        alt="Preview da logo"
                                        className="h-20 object-contain border rounded p-1"
                                    />
                                    <span className="ml-2 text-sm text-gray-500">
                                        {selectedFile ? 'Nova logo' : 'Logo atual'}
                                    </span>
                                </div>
                            )}
                        </FormField>
                    </FormSection>

                    {/* Seção de Endereço */}
                    <FormSection title="Endereço">
                        <FormField label="CEP" className="lg:col-span-1">
                            <input
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleChange}
                                placeholder="Ex. 37701-000"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Cidade" className="lg:col-span-2">
                            <input
                                type="text"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleChange}
                                placeholder="Ex. Poços de Caldas"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Estado" className="lg:col-span-1">
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não Informado</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="SP">São Paulo</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="ES">Espírito Santo</option>
                                {/* Outros estados... */}
                            </select>
                        </FormField>
                        <FormField label="Logradouro" className="lg:col-span-3">
                            <input
                                type="text"
                                name="logradouro"
                                value={formData.logradouro}
                                onChange={handleChange}
                                placeholder="Digite o Endereço"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Número" className="lg:col-span-1">
                            <input
                                type="text"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                placeholder="Ex. 0000"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Bairro" className="lg:col-span-2">
                            <input
                                type="text"
                                name="bairro"
                                value={formData.bairro}
                                onChange={handleChange}
                                placeholder="Ex. Centro"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Complemento" className="lg:col-span-1">
                            <input
                                type="text"
                                name="complemento"
                                value={formData.complemento}
                                onChange={handleChange}
                                placeholder="Ex. Apto 22"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Região" className="lg:col-span-1">
                            <input
                                type="text"
                                name="regiao"
                                value={formData.regiao}
                                onChange={handleChange}
                                placeholder="Ex. Zona Sul"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção de Contato */}
                    <FormSection title="Informações de Contato">
                        <FormField label="DDD Número" className="lg:col-span-1">
                            <input
                                type="text"
                                name="telefonePrincipal"
                                value={formData.telefonePrincipal}
                                onChange={handleChange}
                                placeholder="Ex. 31 987654321"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="DD Número Secundario" className="lg:col-span-1">
                            <input
                                type="text"
                                name="telefoneSecundario"
                                value={formData.telefoneSecundario}
                                onChange={handleChange}
                                placeholder="Ex. 31 987654321"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Endereço de E-mail" className="lg:col-span-4" error={errors.email}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Ex. exemplo@email.com.br"
                                className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                        </FormField>
                    </FormSection>

                    {/* Outras Informações */}
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
                            <InputWithAction
                                name="cnaePrincipal"
                                value={cnaePrincipal ? `${cnaePrincipal.codigo} - ${cnaePrincipal.descricao}` : ''}
                                readOnly={true}
                                placeholder="Selecione um CNAE..."
                                actionButton={
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsCnaeModalOpen(true)}
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={clearCnaePrincipal}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="Matriz/Filial" className="lg:col-span-1">
                            <select
                                name="tipoMatrizFilial"
                                value={formData.tipoMatrizFilial}
                                onChange={handleChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="MATRIZ">Matriz</option>
                                <option value="FILIAL">Filial</option>
                            </select>
                        </FormField>
                        <FormField label="Médico Responsável pelo PCMSO" className="lg:col-span-4">
                            <InputWithAction
                                name="medicoResponsavel"
                                value={medicoResponsavel ? `${medicoResponsavel.nome} ${medicoResponsavel.sobrenome || ''}`.trim() : ''}
                                readOnly={true}
                                placeholder="Selecione um médico"
                                actionButton={
                                    <>
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setIsMedicoModalOpen(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 hover:bg-red-600"
                                            onClick={clearMedicoResponsavel}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white p-2.5 border border-blue-500 rounded-r-md hover:bg-blue-600"
                                            onClick={() => navigate('/cadastros/profissionais/novo')}
                                        >
                                            <Plus size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>

                        <FormField label="Observações" className="lg:col-span-4">
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                placeholder="Digite as observações sobre esta empresa"
                                rows="4"
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </FormField>
                    </FormSection>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => navigate('/cadastros/listar/empresas')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>Salvar</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}