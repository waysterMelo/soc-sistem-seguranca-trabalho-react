import React, {useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2,
    Search,
    Plus,
    AlertCircle,
    ArrowLeft,
    Loader, Check
} from 'lucide-react';
import { empresaService } from "../../../api/services/serviceEmpresas.js";
import { X } from 'lucide-react';


// Um wrapper para seções do formulário com um título
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

// Um wrapper para campos de formulário (label + input)
const FormField = ({ label, required, children, className = '', error }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 flex items-center mt-1"><AlertCircle size={14} className="mr-1"/>{error}</p>}
    </div>
);

// Input com ícone ou botão
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


// --- Componente Principal ---

export default function CadastrarEmpresa() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tipoEmpresa: '',
        inscricaoEstadual: '',
        cpfOuCnpj: '',
        status: 'Ativo',
        razaoSocial: '',
        nomeFantasia: '',
        logomarcaUrl: '',
        
        // Endereço
        cep: '',
        cidade: '',
        estado: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        regiao: '',
        
        // Contato
        telefonePrincipal: '',
        telefoneSecundario: '',
        email: '',
        
        // Outras informações
        grauRisco: '',
        cnaePrincipal: '',
        cnaesSecundarios: [],
        tipoMatrizFilial: 'MATRIZ',
        medicoResponsavel: '',
        observacoes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]){
            const file = e.target.files[0];
            setSelectedFile(file);
            // Opcional: Visualização prévia da imagem
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({
                    ...formData,
                    logomarcaUrl: event.target.result
                });
            };
            reader.readAsDataURL(file);

        }
    };

    // Handler para atualizar o estado do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Limpa o erro específico quando o campo é alterado
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};
        
        // Validações dos campos obrigatórios
        if (!formData.tipoEmpresa) newErrors.tipoEmpresa = 'Tipo de empresa é obrigatório';
        if (!formData.razaoSocial) newErrors.razaoSocial = 'Razão Social é obrigatório';
        if (!formData.status) newErrors.status = 'Status é obrigatório';
        
        // Validação básica de email
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        
        // Validação de CNPJ/CPF pode ser adicionada aqui
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler para o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setApiError(null);
        
        try {
            // Preparar os dados para envio
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
            
            // Remove campos que foram reorganizados
            delete empresaData.ddd1;
            delete empresaData.telefone1;
            delete empresaData.ddd2;
            delete empresaData.telefone2;
            delete empresaData.cep;
            delete empresaData.logradouro;
            delete empresaData.numero;
            delete empresaData.bairro;
            delete empresaData.complemento;
            delete empresaData.cidade;
            delete empresaData.estado;
            delete empresaData.regiao;

            if (!empresaData.cnaePrincipal) {
                delete empresaData.cnaePrincipal;
            }

            // Mesmo tratamento para outros campos de objeto que podem ser vazios
            if (empresaData.medicoResponsavel === '') {
                delete empresaData.medicoResponsavel;
            }

            // Se tiver um arquivo selecionado, envie-o primeiro e obtenha a URL
            if (selectedFile) {
                // Crie um FormData para enviar o arquivo
                const fileData = new FormData();
                fileData.append('file', selectedFile);

                // Envie o arquivo para o endpoint de upload
                try {
                    const uploadResponse = await empresaService.uploadLogo(fileData);
                    // Supondo que o backend retorne a URL do arquivo salvo
                    empresaData.logomarcaUrl = uploadResponse.data.url;
                } catch (uploadError) {
                    console.error('Erro ao fazer upload da logo:', uploadError);
                    // Continuar mesmo sem a logo
                }
            }

            const response = await empresaService.create(empresaData);
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error('Erro ao cadastrar empresa:', error);
            setApiError(
                error.response?.data?.message || 
                'Não foi possível cadastrar a empresa. Por favor, tente novamente.'
            );
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
                            Empresa cadastrada com sucesso!
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                // Opcional: redirecionar após fechar o modal
                                // navigate('/cadastros/empresas');
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
           <SuccessModal />
            <div className="container mx-auto">
                <header className="mb-6">
                    <button 
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        onClick={() => navigate('/cadastros/empresas')}
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Voltar para a lista
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Cadastrar Empresa</h1>
                </header>

                {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
                        <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Erro ao cadastrar empresa</p>
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
                        <FormField label="Número do CPF/CNPJ" required className="lg:col-span-1" error={errors.documento}>
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
                        <FormField label="Logomarca" className="lg:col-span-4">
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
                                        setFormData({
                                            ...formData,
                                            logomarcaUrl: ''
                                        });
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>

                            {/* Preview da imagem se disponível */}
                            {formData.logomarcaUrl && (
                                <div className="mt-2">
                                    <img
                                        src={formData.logomarcaUrl}
                                        alt="Preview da logo"
                                        className="h-20 object-contain border rounded p-1"
                                    />
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
                                <option value="">Não Informado</option>
                                <option value="1">1 - Baixo</option>
                                <option value="2">2 - Médio</option>
                                <option value="3">3 - Alto</option>
                                <option value="4">4 - Muito Alto</option>
                            </select>
                        </FormField>
                        <FormField label="CNAE Principal" className="lg:col-span-3">
                            <InputWithAction 
                                name="cnaePrincipal"
                                value={formData.cnaePrincipal}
                                onChange={handleChange}
                                placeholder="0111-3/99 - Cultivo de outros..." 
                                actionButton={
                                    <>
                                        <button type="button" className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"><Search size={18}/></button>
                                        <button 
                                            type="button" 
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={() => setFormData({...formData, cnaePrincipal: ''})}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="CNAEs Secundários" className="lg:col-span-4">
                            <InputWithAction 
                                placeholder="Nenhum CNAE selecionado" 
                                disabled={true}
                                actionButton={
                                    <button type="button" className="bg-green-500 text-white p-2.5 border border-green-500 rounded-r-md hover:bg-green-600"><Search size={18}/></button>
                                }
                            />
                        </FormField>
                        <FormField label="Matriz/Filial" className="lg:col-span-1">
                            <select
                                name="tipoMatrizFilial"
                                value={formData.tipoMatrizFilial}
                                onChange={(e) => setFormData({...formData, matriz: e.target.value === "matriz"})}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="MATRIZ">Matriz</option>
                                <option value="FILIAL">Filial</option>
                            </select>
                        </FormField>
                        <FormField label="Médico Responsável pelo PCMSO" className="lg:col-span-4">
                            <InputWithAction 
                                name="medicoResponsavel"
                                value={formData.medicoResponsavel}
                                onChange={handleChange}
                                placeholder="Nenhum médico coordenador selecionado" 
                                actionButton={
                                    <>
                                        <button type="button" className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"><Search size={18}/></button>
                                        <button type="button" className="bg-blue-500 text-white p-2.5 border border-blue-500 rounded-r-md hover:bg-blue-600"><Plus size={18}/></button>
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
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => navigate('/cadastros/empresas')}
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