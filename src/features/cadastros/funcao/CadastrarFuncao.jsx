import React, {useState, useEffect} from 'react';
import {
    Search, Trash2, Plus, ArrowLeft
} from 'lucide-react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import funcaoService from '../../../api/services/cadastros/funcoesService.js';
import ModalCBO from '../../../components/modal/CboModal.jsx';
import ModalEmpresa from '../../../components/modal/empresaSearchModal.jsx';
import ModalSetor from '../../../components/modal/SetorSearchModal.jsx';
import ModalRiscosPGR from '../../../components/modal/RiscoPgrModalSearch.jsx';
import ModalAgentesNocivos from '../../../components/modal/ModalAgentesNocivos.jsx';
import ModalExamesPCMSO from '../../../components/modal/ModalExamesPCMSO.jsx';
import ModalPrestador from '../../../components/modal/PrestadorServico.jsx';


// Secção do formulário com título
const FormSection = ({title, children}) => (<div className="bg-white p-6 rounded-lg shadow-md mb-6">
    {title && <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-6">{title}</h3>}
    {children}
</div>);

// Campo de formulário (label + input)
const FormField = ({label, required, children, className = ''}) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label className="text-sm font-medium text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>);

// Input com botões de ação
const InputWithActions = ({placeholder, value, onChange, disabled = false, actions, className = ''}) => (
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
    </div>);

// Botão de Aba com estilo atualizado
const TabButton = ({label, isActive, onClick}) => (<button
    type="button"
    onClick={onClick}
    className={`px-4 py-3 -mb-px text-sm font-semibold transition-colors border-b-2
            ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
>
    {label}
</button>);

// Componente de notificação
const Notification = ({message, type}) => {
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
    const {id} = useParams();
    const isEditing = !!id;
    const [activeTab, setActiveTab] = useState('riscos');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
    const [modalSetorOpen, setModalSetorOpen] = useState(false);
    const [modalCboOpen, setModalCboOpen] = useState(false);
    const [modalRiscosOpen, setModalRiscosOpen] = useState(false);
    const [modalAgentesOpen, setModalAgentesOpen] = useState(false);
    const [modalExamesOpen, setModalExamesOpen] = useState(false);
    const [modalPrestadorOpen, setModalPrestadorOpen] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        empresa: {id: null, nome: ''},
        setor: {id: null, nome: ''},
        cbo: {id: null, codigo: '', descricao: ''},
        qtdFuncionarios: 0,
        descricao: '',
        gfip: 'Não exposto - sem adicional sobre o RAT',
        atividadesInsalubres: '',
        infoComplementar: '',
        status: 'Ativo'
    });
    const [riscosPGR, setRiscosPGR] = useState([]);
    const [riscosDisponiveis, setRiscosDisponiveis] = useState([]);
    const [agentesNocivos, setAgentesNocivos] = useState([]);
    const [examesPCMSO, setExamesPCMSO] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [success, setSuccess] = useState(false);

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
                empresa: funcao.empresa || {id: null, nome: ''},
                setor: funcao.setor || {id: null, nome: ''},
                cbo: funcao.cbo || {id: null, codigo: '', descricao: ''},
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
        setNotification({message, type});
        setTimeout(() => setNotification({message: '', type: ''}), 3000);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleEmpresaSelect = (empresa) => {
        setFormData(prev => ({
            ...prev, empresa: {
                id: empresa.id, nome: empresa.nome || empresa.nomeEmpresa || empresa.razaoSocial
            }
        }));
        setModalEmpresaOpen(false);

    };

    const handleSetorSelect = (setor) => {
        setFormData(prev => ({...prev, setor}));
        setModalSetorOpen(false);
    };

    const handleCboSelect = (cbo) => {
        setFormData(prev => ({
            ...prev, cbo, nome: cbo.descricao
        }));
        setModalCboOpen(false);
    };

    const handleRiscoSelect = (risco) => {
        const riscoExistente = riscosPGR.find(r => r.id === risco.id);
        if (!riscoExistente) {
            setRiscosPGR(prevRiscos => {
                // Garante que prevRiscos seja um array
                const riscoArray = Array.isArray(prevRiscos) ? prevRiscos : [];
                return [...riscoArray, risco];
            });
        }
        setModalRiscosOpen(false);
    };

    const handleAgenteSelect = (agente) => {
        const agenteExistente = agentesNocivos.find(a => a.id === agente.id);
        if (!agenteExistente) {
            setAgentesNocivos(prevAgentes => {
                const agenteArray = Array.isArray(prevAgentes) ? prevAgentes : [];
                return [...agenteArray, agente];
            });
        }
        setModalAgentesOpen(false);
    };

    const handleExameSelect = (exame) => {
        const exameExistente = examesPCMSO.find(e => e.id === exame.id);
        if (!exameExistente) {
            setExamesPCMSO(prevExames => {
                const exameArray = Array.isArray(prevExames) ? prevExames : [];
                return [...exameArray, exame];
            });
        }
        setModalExamesOpen(false);
    };

    const handlePrestadorSelect = (prestador) => {
        // Verifica se o prestador já existe na lista
        const prestadorExistente = profissionais.find(p => p.id === prestador.id);
        if (!prestadorExistente) {
            setProfissionais([...profissionais, prestador]);
        }
        setModalPrestadorOpen(false);
    };

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

    const handleClearForm = () => {
        setFormData({
            nome: '',
            empresa: {id: null, nome: ''},
            setor: {id: null, nome: ''},
            cbo: {id: null, codigo: '', descricao: ''},
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

    const validateForm = () => {
        const validations = [{
            field: 'nome',
            value: formData.nome,
            message: 'Nome da função é obrigatório'
        }, {
            field: 'descricao',
            value: formData.descricao,
            message: 'Descrição da função é obrigatória'
        }, {field: 'empresa', value: formData.empresa?.id, message: 'Empresa é obrigatória'}, {
            field: 'setor',
            value: formData.setor?.id,
            message: 'Setor é obrigatório'
        }, {field: 'cbo', value: formData.cbo?.id, message: 'CBO é obrigatório'}];

        for (const validation of validations) {
            if (!validation.value || (typeof validation.value === 'string' && !validation.value.trim())) {
                // Mostra a notificação de erro usando toast
                toast.error(validation.message);
                return validation.message;
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) return;

        setLoading(true);

        // converte o valor do select para o enum do backend
        const gfipMap = {
            'Não exposto - sem adicional sobre o RAT': 'NAO_EXPOSTO_SEM_ADICIONAL',
            'Adicional de 1% - trabalho com baixo risco': 'EXPOSTO_ADICIONAL_1',
            'Adicional de 2% - trabalho com médio risco': 'EXPOSTO_ADICIONAL_2',
            'Adicional de 3% - trabalho com alto risco': 'EXPOSTO_ADICIONAL_3'
        };

        const payload = {
            nome: formData.nome,
            descricaoFuncao: formData.descricao,
            empresaId: formData.empresa.id,
            setorId: formData.setor.id,
            cboId: formData.cbo.id,
            quantidadeFuncionarios: formData.qtdFuncionarios,
            tipoGfip: gfipMap[formData.gfip] || 'NAO_EXPOSTO_SEM_ADICIONAL',
            atividadesInsalubres: formData.atividadesInsalubres,
            informacoesComplementaresRegistrosAmbientais: formData.infoComplementar,

            riscosPGR: riscosPGR.map(r => ({
                riscoCatalogoId: r.id, grauRisco: r.grauRisco || 'BAIXO'
            })),

            agentesNocivosEsocial: agentesNocivos.map(a => ({
                agenteNocivoCatalogoId: a.id
            })),

            examesPcmso: examesPCMSO.map(ex => ({
                exameCatalogoId: ex.id,
                tipoExame: ex.tipoExame || 'ADMISSIONAL',
                obrigatorio: true, ...(ex.tipoExame === 'PERIODICO' && {periodicidadeMeses: ex.periodicidadeMeses || 12})
            })),

            prestadoresResponsaveis: profissionais.map(p => ({
                prestadorServicoId: p.id
            }))
        };

        try {
            isEditing ? await funcaoService.update(id, payload) : await funcaoService.create(payload);
            setSuccess(true);
            setTimeout(() => navigate('/cadastros/listar/funcao'), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/cadastros/listar/funcao');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'riscos':
                return (<>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => setModalRiscosOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium
                             hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16}/>
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
                        {Array.isArray(riscosPGR) ? riscosPGR.map((risco) => (<tr key={risco.id}>
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
                        </tr>)) : (<tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                Nenhum risco cadastrado
                            </td>
                        </tr>)}
                        </tbody>
                    </table>
                </>);

            case 'agentes':
                return (<>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => setModalAgentesOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16}/>
                            <span>Adicionar Agente Nocivo</span>
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(agentesNocivos) ? agentesNocivos.map((agente) => (<tr key={agente.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agente.codigoEsocial}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agente.descricao}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAgente(agente.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>)) : (<tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                Nenhum agente nocivo cadastrado
                            </td>
                        </tr>)}
                        </tbody>
                    </table>
                </>);

            case 'exames':
                return (<>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => setModalExamesOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16}/>
                            <span>Adicionar Exame</span>
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(examesPCMSO) ? examesPCMSO.map((exame) => (<tr key={exame.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exame.codigoExame}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exame.nomeExame}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExame(exame.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>)) : (<tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                Nenhum exame cadastrado
                            </td>
                        </tr>)}
                        </tbody>
                    </table>
                </>);

            case 'profissionais':
                return (<>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => setModalPrestadorOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={16}/>
                            <span>Adicionar Profissional</span>
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conselho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(profissionais) ? profissionais.map((profissional) => (
                            <tr key={profissional.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profissional.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profissional.conselho || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profissional.registro || profissional.crm || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProfissional(profissional.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>)) : (<tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                Nenhum profissional cadastrado
                            </td>
                        </tr>)}
                        </tbody>
                    </table>
                </>);


            default:
                return null;
        }
    };

    return (<div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <div className="container mx-auto">
            <Notification message={notification.message} type={notification.type}/>

            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Cadastrar'} Função</h1>
                    {isEditing && (<p className="text-gray-600 mt-1">ID: {id}</p>)}
                </div>
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} className="mr-2"/>
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
                                actions={<>
                                    <button
                                        type="button"
                                        onClick={() => setModalEmpresaOpen(true)}
                                        className="p-2.5 text-gray-500 hover:text-green-600"
                                    >
                                        <Search size={18}/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev, empresa: {id: null, nome: ''}
                                        }))}
                                        className="p-2.5 text-gray-500 hover:text-red-600"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </>}
                            />
                        </FormField>
                        <FormField label="Setor" required>
                            <InputWithActions
                                value={formData.setor?.nome}
                                disabled={true}
                                actions={<>
                                    <button
                                        type="button"
                                        onClick={() => setModalSetorOpen(true)}
                                        className="p-2.5 text-gray-500 hover:text-green-600"
                                    >
                                        <Search size={18}/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev, setor: {id: null, nome: ''}
                                        }))}
                                        className="p-2.5 text-gray-500 hover:text-red-600"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </>}
                            />
                        </FormField>
                        <FormField label="CBO" className="col-span-2">
                            <InputWithActions
                                value={formData.cbo?.codigo ? `${formData.cbo.codigo} - ${formData.cbo.descricao}` : ''}
                                disabled={true}
                                actions={<>
                                    <button
                                        type="button"
                                        onClick={() => setModalCboOpen(true)}
                                        className="p-2.5 text-gray-500 hover:text-green-600"
                                    >
                                        <Search size={18}/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev, cbo: {id: null, codigo: '', descricao: ''}
                                        }))}
                                        className="p-2.5 text-gray-500 hover:text-red-600"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </>}
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
                                <option value="Não exposto - sem adicional sobre o RAT">Não exposto - sem adicional
                                    sobre o RAT
                                </option>
                                <option value="Adicional de 1% - trabalho com baixo risco">Adicional de 1% -
                                    trabalho com baixo risco
                                </option>
                                <option value="Adicional de 2% - trabalho com médio risco">Adicional de 2% -
                                    trabalho com médio risco
                                </option>
                                <option value="Adicional de 3% - trabalho com alto risco">Adicional de 3% - trabalho
                                    com alto risco
                                </option>
                            </select>
                        </FormField>
                    </div>
                </FormSection>

                {/* Abas de Riscos */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-4 px-6">
                            <TabButton label="RISCOS TRABALHISTAS (PGR)" isActive={activeTab === 'riscos'}
                                       onClick={() => setActiveTab('riscos')}/>
                            <TabButton label="Agentes Nocivos (eSocial)" isActive={activeTab === 'agentes'}
                                       onClick={() => setActiveTab('agentes')}/>
                            <TabButton label="Exames (PCMSO)" isActive={activeTab === 'exames'}
                                       onClick={() => setActiveTab('exames')}/>
                        </nav>
                    </div>
                    <div className="p-6">
                        {renderTabContent()}
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
                                <Plus size={14}/>
                                <span>Adicionar Profissional</span>
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {profissionais.map((prof) => (<div key={prof.id}
                                                               className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                                <span className="text-sm text-gray-700">{prof.nome}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProfissional(prof.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>))}
                            {profissionais.length === 0 && (<div className="text-center py-2 text-sm text-gray-500">
                                Nenhum profissional adicionado
                            </div>)}
                        </div>
                    </FormField>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-600 text-white px-6 py-2.5 rounded-md font-semibold
                             hover:bg-gray-700 transition-colors"
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
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                            <div className="text-green-600 text-6xl mb-4">✓</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Função salva com sucesso!</h3>
                            <p className="text-gray-600">Redirecionando...</p>
                        </div>
                    </div>
                </div>)}
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
            riscos={riscosDisponiveis}
        />
        <ModalAgentesNocivos
            isOpen={modalAgentesOpen}
            onClose={() => setModalAgentesOpen(false)}
            onSelect={handleAgenteSelect}
        />
        <ModalExamesPCMSO
            isOpen={modalExamesOpen}
            onClose={() => setModalExamesOpen(false)}
            onSelect={handleExameSelect}
        />
        <ModalPrestador
            isOpen={modalPrestadorOpen}
            onClose={() => setModalPrestadorOpen(false)}
            onSelect={handlePrestadorSelect}
        />
    </div>);
}