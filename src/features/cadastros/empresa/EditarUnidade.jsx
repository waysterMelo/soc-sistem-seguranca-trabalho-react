import React, {useEffect, useState} from 'react';
import {AlertTriangle, CheckCircle2, Info, Plus, Search, Trash2, XCircle} from 'lucide-react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {unidadeService} from '../../../api/services/cadastros/serviceUnidadeOperacional.js';
import EmpresaSearchModal from '../../../components/modal/empresaSearchModal.jsx';
import CnaeSearchModal from '../../../components/modal/cnaeSearchModal.jsx';
import SetorSearchModal from "../../../components/modal/SetorSearchModal.jsx";

// --- Componentes Reutilizáveis ---

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
            onChange={onChange}
            name={name}
            disabled={disabled}
            className={`w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none transition-colors ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'
            }`}
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// Modal de notificação (sucesso ou erro)
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

// --- Componente Principal ---

export default function EditarUnidade() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [unidade, setUnidade] = useState({
        id: '',
        nome: '',
        descricao: '',
        situacao: '',
        empresa: {
            id: '',
            razaoSocial: ''
        },
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
        tipoConfiguracaoUnidade: 'MATRIZ',
        cnpjEmpresaTerceira: '',
        razaoSocialEmpresaTerceira: '',
        setores: []
    });
    const [errors, setErrors] = useState({});
    const [showEmpresaModal, setShowEmpresaModal] = useState(false);
    const [showCnaeModal, setShowCnaeModal] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        message: ''
    });
    const [showSetorModal, setShowSetorModal] = useState(false);

    useEffect(() => {
        carregarUnidade();
    }, [id]);

    const carregarUnidade = async () => {
        try {
            setLoading(true);
            const response = await unidadeService.getById(id);
            const unidadeData = response.data;
            setUnidade(unidadeData);
        } catch (error) {
            console.error('Erro ao carregar unidade:', error);
            setNotification({
                isOpen: true,
                type: 'error',
                message: 'Erro ao carregar dados da unidade. Por favor, tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setUnidade(prev => ({
                ...prev,
                [name]: checked
            }));
            return;
        }

        setUnidade(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmpresaSelect = (empresa) => {
        setUnidade(prev => ({
            ...prev,
            empresa: {
                id: empresa.id,
                razaoSocial: empresa.razaoSocial
            }
        }));
        setShowEmpresaModal(false);
    };

    const handleCnaeSelect = (cnae) => {
        setUnidade(prev => ({
            ...prev,
            cnaePrincipal: cnae
        }));
        setShowCnaeModal(false);
    };

    const removerCnaePrincipal = () => {
        setUnidade(prev => ({
            ...prev,
            cnaePrincipal: null
        }));
    };

    const validarFormulario = () => {
        const novosErros = {};
        if (!unidade.nome?.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!unidade.empresa?.id) novosErros.empresa = 'Empresa é obrigatória';

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const prepararDadosParaEnvio = () => {
        // Cria uma cópia profunda para não alterar o estado original da tela
        const dados = JSON.parse(JSON.stringify(unidade));

        // --- INÍCIO DA CORREÇÃO ---
        // 1. Extrai apenas os IDs da lista de objetos de setor
        if (dados.setores) {
            dados.setoresIds = dados.setores.map(setor => setor.id);
        }
        // 2. Remove o array de objetos 'setores' para evitar enviar dados desnecessários
        delete dados.setores;
        // --- FIM DA CORREÇÃO ---

        // Lógica para empresa (já estava correta)
        if (dados.empresa && typeof dados.empresa === 'object' && dados.empresa.id) {
            dados.empresaId = dados.empresa.id;
            delete dados.empresa;
        } else if (dados.empresa) {
            delete dados.empresa;
        }

        // Lógica para CNAE (já estava correta)
        if (dados.cnaePrincipal && typeof dados.cnaePrincipal === 'object' && dados.cnaePrincipal.id) {
            dados.cnaePrincipalId = dados.cnaePrincipal.id;
            delete dados.cnaePrincipal;
        } else if (dados.cnaePrincipal) {
            delete dados.cnaePrincipal;
        }

        return dados;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validarFormulario()) {
            try {
                setSalvando(true);
                const dadosParaEnvio = prepararDadosParaEnvio();
                await unidadeService.update(id, dadosParaEnvio);

                setNotification({
                    isOpen: true,
                    type: 'success',
                    message: 'Unidade operacional atualizada com sucesso!'
                });

                setTimeout(() => {
                    navigate('/cadastros/listar/unidades');
                }, 1500);

            } catch (error) {
                console.error('Erro ao atualizar unidade:', error);

                carregarUnidade();

                let mensagemErro = 'Erro ao atualizar unidade operacional. Tente novamente.';
                if (error.response?.data?.mensagem) {
                    mensagemErro = error.response.data.mensagem;
                } else if (error.response?.status === 400) {
                    mensagemErro = 'Dados inválidos. Verifique os campos e tente novamente.';
                }

                setNotification({
                    isOpen: true,
                    type: 'error',
                    message: mensagemErro
                });
            } finally {
                setSalvando(false);
            }
        }
    };

    const handleCancelar = () => {
        navigate('/cadastros/listar/unidades');
    };

    const closeNotification = () => {
        setNotification(prev => ({
            ...prev,
            isOpen: false
        }));
    };

    const handleSetoresSelect = (selecaoDoModal) => {
        // Se nada for selecionado (null, undefined), apenas fecha o modal.
        if (!selecaoDoModal) {
            setShowSetorModal(false);
            return;
        }

        const novosSetoresArray = Array.isArray(selecaoDoModal) ? selecaoDoModal : [selecaoDoModal];

        // Se o array resultante estiver vazio, não faz nada.
        if (novosSetoresArray.length === 0) {
            setShowSetorModal(false);
            return;
        }

        setUnidade(prev => {
            // Agora o 'spread' é seguro, pois 'novosSetoresArray' é garantidamente um array.
            const setoresCombinados = [...prev.setores, ...novosSetoresArray];

            const setoresUnicosMap = new Map();
            setoresCombinados.forEach(setor => setoresUnicosMap.set(setor.id, setor));

            const resultadoFinal = Array.from(setoresUnicosMap.values());

            return {
                ...prev,
                setores: resultadoFinal
            };
        });

        setShowSetorModal(false);
    };

    const handleRemoverSetor = (idDoSetorParaRemover) => {
        setUnidade(prev => ({
            ...prev,
            setores: prev.setores.filter(setor => setor.id !== idDoSetorParaRemover)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }


    const temSetores = unidade.setores && unidade.setores.length > 0;

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Editar Unidade Operacional</h1>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Seção Informações da unidade */}
                    <FormSection title="Informações da unidade">
                        <FormField label="Empresa" required className="lg:col-span-2" error={errors.empresa}>
                            <InputWithActions
                                placeholder="Selecione a empresa"
                                value={unidade.empresa?.razaoSocial || ''}
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
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={() => setUnidade(prev => ({ ...prev, empresa: { id: '', razaoSocial: '' } }))}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                        <FormField label="Nome da Unidade" required className="lg:col-span-1" error={errors.nome}>
                            <input
                                type="text"
                                name="nome"
                                value={unidade.nome}
                                onChange={handleInputChange}
                                className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 ${
                                    errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                        </FormField>
                        <FormField label="Situação da Unidade Operacional" required className="lg:col-span-1">
                            <select
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="situacao"
                                value={unidade.situacao}
                                onChange={handleInputChange}
                            >
                                <option value="ATIVO">Ativo</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                        </FormField>
                        <FormField label="Descrição da Unidade" className="lg:col-span-4">
                            <textarea
                                rows="3"
                                name="descricao"
                                value={unidade.descricao || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </FormField>
                    </FormSection>

                    {/* Seção Setores a serem vinculados */}
                    <FormSection title="Setores a serem vinculados à unidade operacional">
                        <div className="lg:col-span-4">
                            {/* Container para os botões de ação */}
                            <div className="flex">
                                <button
                                    type="button"
                                    className="bg-green-500 text-white p-2.5 border border-green-500 rounded-l-md hover:bg-green-600 flex items-center"
                                    onClick={() => setShowSetorModal(true)}
                                >
                                    <Search size={18} className="mr-2"/> Adicionar Setor
                                </button>
                                <Link
                                    to="/cadastros/novo-setor"
                                    className="bg-blue-500 text-white p-2.5 border border-blue-500 rounded-r-md hover:bg-blue-600 flex items-center"
                                >
                                    <Plus size={18} className="mr-2"/> Novo Setor
                                </Link>
                            </div>

                            {/* Container para exibir as tags dos setores selecionados */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {unidade.setores && unidade.setores.length > 0 ? (
                                    unidade.setores.map((setor) => (
                                        <div
                                            key={setor.id}
                                            className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2"
                                        >
                                            <span>{setor.nome}</span>
                                            <button
                                                type="button"
                                                className="bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-full p-0.5"
                                                onClick={() => handleRemoverSetor(setor.id)}
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    // Mensagem que aparece se nenhum setor estiver vinculado
                                    <div className="w-full">
                                        <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <Info className="text-yellow-500 mr-2" size={20} />
                                            <p className="text-yellow-700 text-sm">Nenhum setor vinculado. Clique em "Adicionar Setor" para começar.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Seção Endereço (condicional) */}
                        <FormSection title="Endereço">
                            <FormField label="CEP" className="lg:col-span-1" error={errors.cep}>
                                <input
                                    type="text"
                                    name="cep"
                                    placeholder="Ex: 30000-000"
                                    value={unidade.cep || ''}
                                    onChange={handleInputChange}
                                    className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 ${
                                        errors.cep ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                            </FormField>
                            <FormField label="Cidade" required className="lg:col-span-2" error={errors.cidade}>
                                <input
                                    type="text"
                                    name="cidade"
                                    placeholder="Ex: Belo Horizonte"
                                    value={unidade.cidade || ''}
                                    onChange={handleInputChange}
                                    className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 ${
                                        errors.cidade ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                            </FormField>
                            <FormField label="Estado" required className="lg:col-span-1" error={errors.estado}>
                                <select
                                    name="estado"
                                    value={unidade.estado || ''}
                                    onChange={handleInputChange}
                                    className={`w-full py-2 px-3 border rounded-md bg-white focus:outline-none focus:ring-2 ${
                                        errors.estado ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
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
                            <FormField label="Logradouro" required className="lg:col-span-3" error={errors.logradouro}>
                                <input
                                    type="text"
                                    name="logradouro"
                                    placeholder="Ex: Av. Principal"
                                    value={unidade.logradouro || ''}
                                    onChange={handleInputChange}
                                    className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 ${
                                        errors.logradouro ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                            </FormField>
                            <FormField label="Número" className="lg:col-span-1">
                                <input
                                    type="text"
                                    name="numero"
                                    placeholder="Ex: 123"
                                    value={unidade.numero || ''}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField label="Complemento" className="lg:col-span-1">
                                <input
                                    type="text"
                                    name="complemento"
                                    placeholder="Ex: Sala 101"
                                    value={unidade.complemento || ''}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField label="Bairro" className="lg:col-span-2">
                                <input
                                    type="text"
                                    name="bairro"
                                    placeholder="Ex: Centro"
                                    value={unidade.bairro || ''}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField label="Região" className="lg:col-span-1">
                                <input
                                    type="text"
                                    name="regiao"
                                    placeholder="Ex: Sudeste"
                                    value={unidade?.regiao || ''}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                        </FormSection>

                    {/* Seção Informações de Contato */}
                    <FormSection title="Informações de Contato">
                        <FormField label="DDD" className="lg:col-span-1">
                            <input
                                type="text"
                                name="dddTelefone1"
                                value={unidade.dddTelefone1 || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Número" className="lg:col-span-1">
                            <input
                                type="text"
                                name="numeroTelefone1"
                                value={unidade.numeroTelefone1 || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="DDD" className="lg:col-span-1">
                            <input
                                type="text"
                                name="dddTelefone2"
                                value={unidade.dddTelefone2 || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Número" className="lg:col-span-1">
                            <input
                                type="text"
                                name="numeroTelefone2"
                                value={unidade.numeroTelefone2 || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Endereço de E-mail" className="lg:col-span-4">
                            <input
                                type="email"
                                name="emailContato"
                                value={unidade.emailContato || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                    </FormSection>

                    {/* Seção Outras Informações */}
                    <FormSection title="Outras Informações">
                        <FormField label="Grau de Risco" className="lg:col-span-1">
                            <select
                                name="grauRisco"
                                value={unidade.grauRisco || ''}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não Informado</option>
                                <option value="RISCO_1">Risco 1</option>
                                <option value="RISCO_2">Risco 2</option>
                                <option value="RISCO_3">Risco 3</option>
                                <option value="RISCO_4">Risco 4</option>
                            </select>
                        </FormField>
                        <FormField label="CNAE Principal" className="lg:col-span-3">
                            <InputWithActions
                                value={unidade.cnaePrincipal?.descricao || ''}
                                disabled={true}
                                actions={
                                    <>
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white p-2.5 border border-green-500 hover:bg-green-600"
                                            onClick={() => setShowCnaeModal(true)}
                                        >
                                            <Search size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white p-2.5 border border-red-500 rounded-r-md hover:bg-red-600"
                                            onClick={removerCnaePrincipal}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                }
                            />
                        </FormField>
                    </FormSection>


                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors"
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors flex items-center"
                            disabled={salvando}
                        >
                            {salvando ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Salvando...
                                </>
                            ) : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modais */}
            <EmpresaSearchModal
                isOpen={showEmpresaModal}
                onClose={() => setShowEmpresaModal(false)}
                onSelect={handleEmpresaSelect}
            />

            <CnaeSearchModal
                isOpen={showCnaeModal}
                onClose={() => setShowCnaeModal(false)}
                onCnaeSelect={handleCnaeSelect}
            />

            {/* Modal de Notificação */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                message={notification.message}
            />
            <SetorSearchModal
                isOpen={showSetorModal}
                onClose={() => setShowSetorModal(false)}
                onSelect={handleSetoresSelect}
                initialSelected={unidade.setores}
                empresaId={unidade.empresa?.id}
            />
        </div>
    );
}