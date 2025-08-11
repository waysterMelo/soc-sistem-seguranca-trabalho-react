import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Plus,
    ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';
import ModalCBO from '../../../components/modal/CboModal.jsx';
import ModalEmpresa from '../../../components/modal/empresaSearchModal.jsx';
import ModalSetor from '../../../components/modal/SetorSearchModal.jsx';
import ModalRiscosPGR from '../../../components/modal/RiscoPgrModalSearch.jsx';
import ModalPrestador from '../../../components/modal/PrestadorServico.jsx';

// --- Componentes Reutilizáveis ---

// Secção do formulário com título
const FormSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {title && <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-6">{title}</h3>}
        {children}
    </div>
);

// Campo de formulário (label + input)
const FormField = ({ label, required, children, className = '' }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// Input com botões de ação
const InputWithActions = ({ placeholder, value, onChange, disabled = false, actions, className='' }) => (
    <div className="relative flex items-center">
        <input
            type="text"
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full py-2 pl-4 pr-20 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-100' : ''} ${className}`}
        />
        <div className="absolute right-0 flex">
            {actions}
        </div>
    </div>
);

// Botão de Aba com estilo atualizado
const TabButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 -mb-px text-sm font-semibold transition-colors border-b-2
            ${isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`
        }
    >
        {label}
    </button>
);

// Componente de notificação
const Notification = ({ message, type }) => {
    useEffect(() => {
        if (message) {
            if (type === 'success') {
                toast.success(message);
            } else if (type === 'error') {
                toast.error(message);
            } else {
                toast.info(message);
            }
        }
    }, [message, type]);

    return null;
};

// --- Componente Principal ---

export default function CadastrarFuncao() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [activeTab, setActiveTab] = useState('riscos');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Modais
    const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
    const [modalSetorOpen, setModalSetorOpen] = useState(false);
    const [modalCboOpen, setModalCboOpen] = useState(false);
    const [modalRiscosOpen, setModalRiscosOpen] = useState(false);
    const [modalPrestadorOpen, setModalPrestadorOpen] = useState(false);

    // Dados da função
    const [formData, setFormData] = useState({
        nome: '',
        empresa: { id: null, nome: '' },
        setor: { id: null, nome: '' },
        cbo: { id: null, codigo: '', descricao: '' },
        qtdFuncionarios: 0,
        descricao: '',
        gfip: 'Não exposto - sem adicional sobre o RAT',
        atividadesInsalubres: '',
        infoComplementar: '',
        status: 'Ativo'
    });

    // Listas relacionadas
    const [riscosPGR, setRiscosPGR] = useState([]);
    const [agentesNocivos, setAgentesNocivos] = useState([]);
    const [examesPCMSO, setExamesPCMSO] = useState([]);
    const [profissionais, setProfissionais] = useState([]);

    useEffect(() => {
        if (isEditing) {
            fetchFuncaoData();
        }
    }, [id]);

    const fetchFuncaoData = async () => {
        setLoading(true);
        try {
            const response = await funcaoService.getById(id);
            const funcao = response.data;

            setFormData({
                nome: funcao.nome || '',
                empresa: funcao.empresa || { id: null, nome: '' },
                setor: funcao.setor || { id: null, nome: '' },
                cbo: funcao.cbo || { id: null, codigo: '', descricao: '' },
                qtdFuncionarios: funcao.qtdFuncionarios || 0,
                descricao: funcao.descricao || '',
                gfip: funcao.gfip || 'Não exposto - sem adicional sobre o RAT',
                atividadesInsalubres: funcao.atividadesInsalubres || '',
                infoComplementar: funcao.infoComplementar || '',
                status: funcao.status || 'Ativo'
            });

            // Carregar listas relacionadas
            if (funcao.riscosPGR) setRiscosPGR(funcao.riscosPGR);
            if (funcao.agentesNocivos) setAgentesNocivos(funcao.agentesNocivos);
            if (funcao.examesPCMSO) setExamesPCMSO(funcao.examesPCMSO);
            if (funcao.profissionais) setProfissionais(funcao.profissionais);

            showNotification('Dados da função carregados com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao carregar dados da função:', error);
            showNotification('Erro ao carregar dados da função', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    // Handlers para mudanças nos campos
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handlers para seleção de itens nos modais
    const handleEmpresaSelect = (empresa) => {
        setFormData(prev => ({ ...prev, empresa }));
        setModalEmpresaOpen(false);
    };

    const handleSetorSelect = (setor) => {
        setFormData(prev => ({ ...prev, setor }));
        setModalSetorOpen(false);
    };

    const handleCboSelect = (cbo) => {
        setFormData(prev => ({
            ...prev,
            cbo,
            nome: cbo.descricao // Atualiza o nome automaticamente com a descrição do CBO
        }));
        setModalCboOpen(false);
    };

    const handleRiscoSelect = (risco) => {
        // Verifica se o risco já existe na lista
        const riscoExistente = riscosPGR.find(r => r.id === risco.id);
        if (!riscoExistente) {
            setRiscosPGR([...riscosPGR, risco]);
        }
        setModalRiscosOpen(false);
    };

    const handlePrestadorSelect = (prestador) => {
        // Verifica se o prestador já existe na lista
        const prestadorExistente = profissionais.find(p => p.id === prestador.id);
        if (!prestadorExistente) {
            setProfissionais([...profissionais, prestador]);
        }
        setModalPrestadorOpen(false);
    };

    // Handlers para remover itens das listas
    const handleRemoveRisco = (riscoId) => {
        setRiscosPGR(riscosPGR.filter(risco => risco.id !== riscoId));
    };

    const handleRemoveAgente = (agenteId) => {
        setAgentesNocivos(agentesNocivos.filter(agente => agente.id !== agenteId));
    };

    const handleRemoveExame = (exameId) => {
        setExamesPCMSO(examesPCMSO.filter(exame => exame.id !== exameId));
    };

    const handleRemoveProfissional = (profissionalId) => {
        setProfissionais(profissionais.filter(prof => prof.id !== profissionalId));
    };

    // Limpar campos do formulário
    const handleClearForm = () => {
        setFormData({
            nome: '',
            empresa: { id: null, nome: '' },
            setor: { id: null, nome: '' },
            cbo: { id: null, codigo: '', descricao: '' },
            qtdFuncionarios: 0,
            descricao: '',
            gfip: 'Não exposto - sem adicional sobre o RAT',
            atividadesInsalubres: '',
            infoComplementar: '',
            status: 'Ativo'
        });

        setRiscosPGR([]);
        setAgentesNocivos([]);
        setExamesPCMSO([]);
        setProfissionais([]);

        showNotification('Formulário limpo com sucesso', 'info');
    };

    // Validação do formulário
    const validateForm = () => {
        const requiredFields = ['nome', 'empresa.id', 'setor.id'];

        for (const field of requiredFields) {
            const fieldParts = field.split('.');
            let value = formData;

            for (const part of fieldParts) {
                value = value[part];
                if (value === undefined || value === null) {
                    return `Campo ${field.split('.')[0]} é obrigatório`;
                }
            }

            if (typeof value === 'string' && !value.trim()) {
                return `Campo ${field.split('.')[0]} é obrigatório`;
            }
        }

        return null;
    };

    // Envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            showNotification(validationError, 'error');
            return;
        }

        setLoading(true);

        try {
            const funcaoPayload = {
                ...formData,
                riscosPGR,
                agentesNocivos,
                examesPCMSO,
                profissionais
            };

            if (isEditing) {
                await funcaoService.update(id, funcaoPayload);
                showNotification('Função atualizada com sucesso', 'success');
            } else {
                await funcaoService.create(funcaoPayload);
                showNotification('Função cadastrada com sucesso', 'success');
            }

            // Redireciona para a lista após salvamento bem-sucedido
            setTimeout(() => navigate('/cadastros/funcoes'), 2000);

        } catch (error) {
            console.error('Erro ao salvar função:', error);
            showNotification(`Erro ao salvar função: ${error.response?.data?.message || 'Erro desconhecido'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Volta para a lista sem salvar
    const handleCancel = () => {
        navigate('/cadastros/funcoes');
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="container mx-auto">
                <Notification message={notification.message} type={notification.type} />

                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Cadastrar'} Função</h1>
                        {isEditing && (
                            <p className="text-gray-600 mt-1">ID: {id}</p>
                        )}
                    </div>
                    <button
                        onClick={handleCancel}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        <span>Voltar</span>
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Secção Informações da Função */}
                    <FormSection title="Informações da Função">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Empresa" required>
                                <InputWithActions
                                    value={formData.empresa?.nome}
                                    disabled={true}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setModalEmpresaOpen(true)}
                                                className="p-2.5 text-gray-500 hover:text-green-600"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, empresa: { id: null, nome: '' } }))}
                                                className="p-2.5 text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </FormField>
                            <FormField label="Setor" required>
                                <InputWithActions
                                    value={formData.setor?.nome}
                                    disabled={true}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setModalSetorOpen(true)}
                                                className="p-2.5 text-gray-500 hover:text-green-600"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, setor: { id: null, nome: '' } }))}
                                                className="p-2.5 text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </FormField>
                            <FormField label="CBO" className="col-span-2">
                                <InputWithActions
                                    value={formData.cbo?.codigo ? `${formData.cbo.codigo} - ${formData.cbo.descricao}` : ''}
                                    disabled={true}
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setModalCboOpen(true)}
                                                className="p-2.5 text-gray-500 hover:text-green-600"
                                            >
                                                <Search size={18}/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, cbo: { id: null, codigo: '', descricao: '' } }))}
                                                className="p-2.5 text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    }
                                />
                            </FormField>
                            <FormField label="Nome" required>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField label="Quantidade de funcionários">
                                <input
                                    type="number"
                                    name="qtdFuncionarios"
                                    value={formData.qtdFuncionarios}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField label="Descrição da Função" className="col-span-2">
                                <textarea
                                    rows="5"
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </FormField>
                            <FormField label="GFIP">
                                <select
                                    name="gfip"
                                    value={formData.gfip}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Não exposto - sem adicional sobre o RAT">Não exposto - sem adicional sobre o RAT</option>
                                    <option value="Adicional de 1% - trabalho com baixo risco">Adicional de 1% - trabalho com baixo risco</option>
                                    <option value="Adicional de 2% - trabalho com médio risco">Adicional de 2% - trabalho com médio risco</option>
                                    <option value="Adicional de 3% - trabalho com alto risco">Adicional de 3% - trabalho com alto risco</option>
                                </select>
                            </FormField>
                        </div>
                    </FormSection>

                    {/* Abas de Riscos */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-4 px-6">
                                <TabButton label="RISCOS TRABALHISTAS (PGR)" isActive={activeTab === 'riscos'} onClick={() => setActiveTab('riscos')} />
                                <TabButton label="Agentes Nocivos (eSocial)" isActive={activeTab === 'agentes'} onClick={() => setActiveTab('agentes')} />
                                <TabButton label="Exames (PCMSO)" isActive={activeTab === 'exames'} onClick={() => setActiveTab('exames')} />
                            </nav>
                        </div>
                        <div className="p-6">
                            {/* Botões de Ação da Aba */}
                            <div className='flex justify-end gap-2 mb-4'>
                                <button type="button" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    <Plus size={16} />
                                    <span>Adicionar</span>
                                </button>
                            </div>

                            {/* Conteúdo da Aba: Riscos (PGR) */}
                            {activeTab === 'riscos' && (
                                <>
                                    <div className="flex justify-end mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setModalRiscosOpen(true)}
                                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Plus size={16} />
                                            <span>Adicionar Risco</span>
                                        </button>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {riscosPGR.map((risco) => (
                                            <tr key={risco.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risco.grupo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risco.descricao}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRisco(risco.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {riscosPGR.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Nenhum risco cadastrado
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Conteúdo da Aba: Agentes Nocivos (eSocial) */}
                            {activeTab === 'agentes' && (
                                <div className="text-center py-4 text-gray-500">
                                    Funcionalidade em desenvolvimento. O endpoint será implementado em breve.
                                </div>
                            )}

                            {/* Conteúdo da Aba: Exames (PCMSO) */}
                            {activeTab === 'exames' && (
                                <div className="text-center py-4 text-gray-500">
                                    Funcionalidade em desenvolvimento. O endpoint será implementado em breve.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Campos Adicionais */}
                    <div className="mt-6 space-y-6">
                        <FormField label="Atividades Insalubres">
                            <input
                                type="text"
                                name="atividadesInsalubres"
                                value={formData.atividadesInsalubres}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Informações Complementares Referente a Registros Ambientais">
                            <input
                                type="text"
                                name="infoComplementar"
                                value={formData.infoComplementar}
                                onChange={handleInputChange}
                                className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>
                        <FormField label="Profissionais responsáveis pelos Registros Ambientais">
                            <div className="flex justify-end mb-2">
                                <button
                                    type="button"
                                    onClick={() => setModalPrestadorOpen(true)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={14} />
                                    <span>Adicionar Profissional</span>
                                </button>
                            </div>
                            <div className="mt-2 space-y-2">
                                {profissionais.map((prof) => (
                                    <div key={prof.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                                        <span className="text-sm text-gray-700">{prof.nome}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProfissional(prof.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                                {profissionais.length === 0 && (
                                    <div className="text-center py-2 text-sm text-gray-500">
                                        Nenhum profissional adicionado
                                    </div>
                                )}
                            </div>
                        </FormField>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : (isEditing ? 'Salvar alterações' : 'Salvar')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modais */}
            <ModalEmpresa
                isOpen={modalEmpresaOpen}
                onClose={() => setModalEmpresaOpen(false)}
                onSelect={handleEmpresaSelect}
            />
            <ModalSetor
                isOpen={modalSetorOpen}
                onClose={() => setModalSetorOpen(false)}
                onSelect={handleSetorSelect}
                empresaId={formData.empresa?.id}
            />
            <ModalCBO
                isOpen={modalCboOpen}
                onClose={() => setModalCboOpen(false)}
                onSelect={handleCboSelect}
            />
            <ModalRiscosPGR
                isOpen={modalRiscosOpen}
                onClose={() => setModalRiscosOpen(false)}
                onSelect={handleRiscoSelect}
            />
            <ModalPrestador
                isOpen={modalPrestadorOpen}
                onClose={() => setModalPrestadorOpen(false)}
                onSelect={handlePrestadorSelect}
            />
        </div>
    );
}